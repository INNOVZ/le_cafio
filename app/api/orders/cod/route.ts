import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  FulfillmentType,
  PaymentProvider,
  PaymentStatus,
} from '@/lib/generated/prisma/enums';

import { getDistanceKm } from '@/lib/delivery-utils';
import { fetchPlaceDetails } from '@/lib/google-places';
import { prisma } from '@/lib/prisma';

const requestSchema = z.object({
  restaurantLocationId: z.string().min(1),
  customerName: z.string().trim().min(2),
  customerEmail: z.string().trim().email(),
  phone: z.string().trim().min(5),
  notes: z.string().trim().optional().default(''),
  fulfillmentType: z.enum(['PICKUP', 'DELIVERY']),
  deliveryPlaceId: z.string().optional().nullable(),
  deliverySessionToken: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

function formatMoney(value: number) {
  return value.toFixed(2);
}

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CAF-${timestamp}-${suffix}`;
}

function toWhatsAppDigits(number: string) {
  return number.replace(/\D/g, '');
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Please provide a valid COD order payload.' },
        { status: 400 }
      );
    }

    const {
      restaurantLocationId,
      customerName,
      customerEmail,
      phone,
      notes,
      fulfillmentType,
      deliveryPlaceId,
      deliverySessionToken,
      items,
    } = parsed.data;

    const restaurantLocation = await prisma.restaurantLocation.findUnique({
      where: { id: restaurantLocationId },
    });

    if (!restaurantLocation || !restaurantLocation.isActive) {
      return NextResponse.json(
        { message: 'Selected restaurant branch was not found.' },
        { status: 404 }
      );
    }

    const branchWhatsappNumber =
      restaurantLocation.whatsappPhoneE164 ?? restaurantLocation.phone;

    if (!branchWhatsappNumber) {
      return NextResponse.json(
        {
          message:
            'Selected branch does not have a WhatsApp or phone number configured.',
        },
        { status: 400 }
      );
    }

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        isAvailable: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: 'One or more cart items are no longer available.' },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const unavailableProduct = products.find((product) => !product.isAvailable);

    if (unavailableProduct) {
      return NextResponse.json(
        {
          message: `${unavailableProduct.name} is currently unavailable. Please update the cart.`,
        },
        { status: 400 }
      );
    }

    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice,
        lineSubtotal: lineTotal,
        optionsTotal: 0,
        lineTotal,
      };
    });

    const subtotal = orderItemsData.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    const serviceFee = 5;
    let deliveryFee = 0;
    let deliveryLine1: string | null = null;
    let deliveryLatitude: number | null = null;
    let deliveryLongitude: number | null = null;
    let deliveryDistanceKm: number | null = null;
    let deliveryValidatedAt: Date | null = null;

    if (fulfillmentType === 'DELIVERY') {
      if (!deliveryPlaceId) {
        return NextResponse.json(
          { message: 'Delivery address has not been selected.' },
          { status: 400 }
        );
      }

      const place = await fetchPlaceDetails(deliveryPlaceId, deliverySessionToken);
      const distanceKm = getDistanceKm(
        Number(restaurantLocation.latitude),
        Number(restaurantLocation.longitude),
        place.latitude,
        place.longitude
      );
      const roundedDistance = Number(distanceKm.toFixed(2));
      const deliveryRadiusKm = Number(restaurantLocation.deliveryRadiusKm);

      if (roundedDistance > deliveryRadiusKm) {
        return NextResponse.json(
          {
            message: `Delivery is only available within ${deliveryRadiusKm} km of ${restaurantLocation.name}.`,
          },
          { status: 400 }
        );
      }

      deliveryFee = 12;
      deliveryLine1 = place.formattedAddress;
      deliveryLatitude = place.latitude;
      deliveryLongitude = place.longitude;
      deliveryDistanceKm = roundedDistance;
      deliveryValidatedAt = new Date();
    }

    const grandTotal = subtotal + serviceFee + deliveryFee;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        restaurantLocation: {
          connect: { id: restaurantLocation.id },
        },
        fulfillmentType:
          fulfillmentType === 'DELIVERY'
            ? FulfillmentType.DELIVERY
            : FulfillmentType.PICKUP,
        paymentStatus: PaymentStatus.PENDING,
        customerName,
        customerEmail,
        customerPhone: phone,
        notes: notes || null,
        subtotal,
        discountTotal: 0,
        deliveryFee,
        taxTotal: serviceFee,
        grandTotal,
        currency: 'AED',
        deliveryLine1,
        deliveryLatitude,
        deliveryLongitude,
        deliveryDistanceKm,
        deliveryValidatedAt,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    try {
      await prisma.payment.create({
        data: {
          order: {
            connect: { id: order.id },
          },
          provider: PaymentProvider.MANUAL,
          status: PaymentStatus.PENDING,
          amount: grandTotal,
          currency: 'AED',
          method: 'Cash on Delivery',
        },
      });
    } catch (paymentError) {
      // Do not block COD order placement on payment enum/runtime drift.
      console.error('COD payment record creation failed:', paymentError);
    }

    const messageLines = [
      `New COD Order`,
      `Order: ${order.orderNumber}`,
      `Branch: ${restaurantLocation.name}`,
      `Customer: ${customerName}`,
      `Phone: ${phone}`,
      `Fulfillment: ${fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}`,
      deliveryLine1 ? `Address: ${deliveryLine1}` : null,
      '',
      'Items:',
      ...order.items.map(
        (item) =>
          `- ${item.productName} x${item.quantity} | AED ${formatMoney(Number(item.lineTotal))}`
      ),
      '',
      `Subtotal: AED ${formatMoney(subtotal)}`,
      `Service Fee: AED ${formatMoney(serviceFee)}`,
      fulfillmentType === 'DELIVERY'
        ? `Delivery Fee: AED ${formatMoney(deliveryFee)}`
        : null,
      `Total: AED ${formatMoney(grandTotal)}`,
      notes ? `Notes: ${notes}` : null,
      'Payment: Cash on Delivery',
    ].filter(Boolean);

    const whatsappUrl = `https://wa.me/${toWhatsAppDigits(
      branchWhatsappNumber
    )}?text=${encodeURIComponent(messageLines.join('\n'))}`;

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      whatsappUrl,
    });
  } catch (error) {
    console.error('COD order creation error:', error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unexpected error while creating the COD order.',
      },
      { status: 500 }
    );
  }
}
