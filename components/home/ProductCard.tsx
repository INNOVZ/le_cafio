import { getProducts, getRestaurantLocationBySlug } from '@/lib/db-actions';
import { resolveDbSlug } from '@/lib/branch-slugs';

import ProductCardClient from '@/components/home/ProductCardClient';

export default async function ProductCard({ branchSlug }: { branchSlug: string }) {
  const branch = await getRestaurantLocationBySlug(resolveDbSlug(branchSlug));
  const products = await getProducts(undefined, branch?.id);

  return <ProductCardClient products={products} branchSlug={branchSlug} />;
}
