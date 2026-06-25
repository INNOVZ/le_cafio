import PaymentClient from '@/components/home/PaymentClient';
import { getRestaurantLocations } from '@/lib/db-actions';
import { buildNoIndexMetadata } from '@/lib/seo';

export const metadata = buildNoIndexMetadata('Payment');

export default async function AlreemPaymentPage() {
  const restaurantLocations = await getRestaurantLocations();

  return <PaymentClient branchSlug="alreem" restaurantLocations={restaurantLocations} />;
}
