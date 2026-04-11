import PaymentClient from '@/components/home/PaymentClient';
import { getRestaurantLocations } from '@/lib/db-actions';

export default async function PaymentPage() {
  const restaurantLocations = await getRestaurantLocations();

  return <PaymentClient restaurantLocations={restaurantLocations} />;
}
