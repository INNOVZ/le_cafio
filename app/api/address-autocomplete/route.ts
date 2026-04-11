import { NextResponse } from 'next/server';
import { z } from 'zod';

import { fetchAddressSuggestions } from '@/lib/google-places';

const requestSchema = z.object({
  input: z.string().trim().min(3),
  sessionToken: z.string().trim().optional().nullable(),
  originLatitude: z.number().optional().nullable(),
  originLongitude: z.number().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Please provide a valid address query.' },
        { status: 400 }
      );
    }

    const suggestions = await fetchAddressSuggestions(parsed.data);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Address autocomplete error:', error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unexpected error while fetching address suggestions.',
      },
      { status: 500 }
    );
  }
}
