import CheckoutClient from '@/components/home/CheckoutClient';
import { getRestaurantLocations } from '@/lib/db-actions';

export default async function CheckoutPage() {
  const restaurantLocations = await getRestaurantLocations();

  return <CheckoutClient restaurantLocations={restaurantLocations} />;
}
