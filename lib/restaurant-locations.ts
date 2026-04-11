export type RestaurantLocation = {
  id: string;
  name: string;
  addressLine: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
};

// Replace these sample coordinates with the real branch coordinates before production use.
export const restaurantLocations: RestaurantLocation[] = [
  {
    id: 'cafio-branch-1',
    name: 'CAFIO Branch 1',
    addressLine: 'Downtown District',
    city: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    radiusKm: 5,
  },
  {
    id: 'cafio-branch-2',
    name: 'CAFIO Branch 2',
    addressLine: 'Marina District',
    city: 'Dubai',
    latitude: 25.0804,
    longitude: 55.1403,
    radiusKm: 5,
  },
];

export function getRestaurantLocationById(id: string) {
  return restaurantLocations.find((location) => location.id === id) ?? null;
}
