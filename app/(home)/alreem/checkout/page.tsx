import { notFound } from 'next/navigation';
import CheckoutClient from '@/components/home/CheckoutClient';
import { getRestaurantLocations, getRestaurantLocationBySlug } from '@/lib/db-actions';
import { resolveDbSlug } from '@/lib/branch-slugs';

export default async function AlreemCheckoutPage() {
  const [restaurantLocations, branch] = await Promise.all([
    getRestaurantLocations(),
    getRestaurantLocationBySlug(resolveDbSlug('alreem')),
  ]);

  if (!branch) {
    notFound();
  }

  const branchLocation = restaurantLocations.find((loc) => loc.id === branch.id);

  if (!branchLocation) {
    notFound();
  }

  return (
    <CheckoutClient
      branchSlug="alreem"
      branchLocation={branchLocation}
      restaurantLocations={restaurantLocations}
    />
  );
}
