import { notFound } from 'next/navigation';
import CheckoutClient from '@/components/home/CheckoutClient';
import {
  getRestaurantLocationBySlug,
  getRestaurantLocations,
} from '@/lib/db-actions';
import { resolveDbSlug } from '@/lib/branch-slugs';
import { buildNoIndexMetadata } from '@/lib/seo';

export const metadata = buildNoIndexMetadata('Checkout');

export default async function AdnecCheckoutPage() {
  const [restaurantLocations, branch] = await Promise.all([
    getRestaurantLocations(),
    getRestaurantLocationBySlug(resolveDbSlug('adnec')),
  ]);

  if (!branch) {
    notFound();
  }

  const branchLocation = restaurantLocations.find(
    (loc) => loc.id === branch.id
  );

  if (!branchLocation) {
    notFound();
  }

  return (
    <CheckoutClient
      branchSlug="adnec"
      branchLocation={branchLocation}
      restaurantLocations={restaurantLocations}
    />
  );
}
