import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDistanceKm } from '@/lib/delivery-utils';
import { fetchPlaceDetails } from '@/lib/google-places';
import { prisma } from '@/lib/prisma';

const requestSchema = z.object({
  restaurantLocationId: z.string().min(1),
  placeId: z.string().min(1),
  sessionToken: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Please select a valid delivery address.' },
        { status: 400 }
      );
    }

    const { restaurantLocationId, placeId, sessionToken } = parsed.data;
    const restaurantLocation = await prisma.restaurantLocation.findUnique({
      where: { id: restaurantLocationId },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        deliveryRadiusKm: true,
        isActive: true,
      },
    });

    if (!restaurantLocation || !restaurantLocation.isActive) {
      return NextResponse.json(
        { message: 'Selected restaurant location was not found.' },
        { status: 404 }
      );
    }

    const place = await fetchPlaceDetails(placeId, sessionToken);
    const distanceKm = getDistanceKm(
      Number(restaurantLocation.latitude),
      Number(restaurantLocation.longitude),
      place.latitude,
      place.longitude
    );
    const roundedDistance = Number(distanceKm.toFixed(2));
    const deliveryRadiusKm = Number(restaurantLocation.deliveryRadiusKm);
    const available = roundedDistance <= deliveryRadiusKm;

    return NextResponse.json({
      available,
      distanceKm: roundedDistance,
      normalizedAddress: place.formattedAddress,
      latitude: place.latitude,
      longitude: place.longitude,
      message: available
        ? `Delivery available from ${restaurantLocation.name}.`
        : `Delivery is only available within ${deliveryRadiusKm} km of ${restaurantLocation.name}.`,
    });
  } catch (error) {
    console.error('Delivery availability error:', error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unexpected error while checking delivery availability.',
      },
      { status: 500 }
    );
  }
}
