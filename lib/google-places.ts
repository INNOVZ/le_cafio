type FetchAddressSuggestionsArgs = {
  input: string;
  sessionToken?: string | null;
  originLatitude?: number | null;
  originLongitude?: number | null;
};

export type AddressSuggestion = {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
};

export type GooglePlaceDetails = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  'https://places.googleapis.com/v1/places:autocomplete';
const GOOGLE_PLACES_BASE_URL = 'https://places.googleapis.com/v1/places';

function getGoogleMapsServerApiKey() {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing GOOGLE_MAPS_SERVER_API_KEY. Google Places routes cannot run.'
    );
  }

  return apiKey;
}

export async function fetchAddressSuggestions({
  input,
  sessionToken,
  originLatitude,
  originLongitude,
}: FetchAddressSuggestionsArgs): Promise<AddressSuggestion[]> {
  const apiKey = getGoogleMapsServerApiKey();

  const body: Record<string, unknown> = {
    input,
    includedRegionCodes: ['ae'],
    languageCode: 'en',
  };

  if (sessionToken) {
    body.sessionToken = sessionToken;
  }

  if (
    typeof originLatitude === 'number' &&
    typeof originLongitude === 'number'
  ) {
    body.origin = {
      latitude: originLatitude,
      longitude: originLongitude,
    };
  }

  const response = await fetch(GOOGLE_PLACES_AUTOCOMPLETE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Google autocomplete failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    suggestions?: Array<{
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    }>;
  };

  return (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter(
      (
        prediction
      ): prediction is NonNullable<
        NonNullable<typeof data.suggestions>[number]['placePrediction']
      > => Boolean(prediction?.placeId && prediction.text?.text)
    )
    .map((prediction) => ({
      placeId: prediction.placeId!,
      text: prediction.text?.text ?? '',
      mainText: prediction.structuredFormat?.mainText?.text ?? '',
      secondaryText: prediction.structuredFormat?.secondaryText?.text ?? '',
    }));
}

export async function fetchPlaceDetails(
  placeId: string,
  sessionToken?: string | null
): Promise<GooglePlaceDetails> {
  const apiKey = getGoogleMapsServerApiKey();
  const url = new URL(
    `${GOOGLE_PLACES_BASE_URL}/${encodeURIComponent(placeId)}`
  );

  if (sessionToken) {
    url.searchParams.set('sessionToken', sessionToken);
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'formattedAddress,location',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Google place details failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    formattedAddress?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
  };

  if (
    !data.formattedAddress ||
    typeof data.location?.latitude !== 'number' ||
    typeof data.location?.longitude !== 'number'
  ) {
    throw new Error('Google place details response was missing location data.');
  }

  return {
    formattedAddress: data.formattedAddress,
    latitude: data.location.latitude,
    longitude: data.location.longitude,
  };
}
