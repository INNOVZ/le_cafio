import type { CategoryOption } from '@/lib/db-actions';
import ProductForm from '@/components/dashboard/ProductForm';

type AddProductProps = {
  categories: CategoryOption[];
};

export default function AddProduct({ categories }: AddProductProps) {
  return <ProductForm mode="create" categories={categories} />;
}
