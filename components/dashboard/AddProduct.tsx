import type { CategoryOption, RestaurantLocationListItem } from '@/lib/db-actions';
import ProductForm from '@/components/dashboard/ProductForm';

type AddProductProps = {
  categories: CategoryOption[];
  restaurantLocations: RestaurantLocationListItem[];
};

export default function AddProduct({ categories, restaurantLocations }: AddProductProps) {
  return <ProductForm mode="create" categories={categories} restaurantLocations={restaurantLocations} />;
}
