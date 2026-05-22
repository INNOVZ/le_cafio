import PaymentClient from '@/components/home/PaymentClient';
import { getRestaurantLocations } from '@/lib/db-actions';

export default async function AdnecPaymentPage() {
  const restaurantLocations = await getRestaurantLocations();

  return <PaymentClient branchSlug="adnec" restaurantLocations={restaurantLocations} />;
}
