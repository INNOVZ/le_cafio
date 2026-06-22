import { getProducts } from '@/lib/db-actions';

import ProductCardClient from '@/components/home/ProductCardClient';

export default async function ProductCard({
  branchId,
  branchSlug,
}: {
  branchId: string;
  branchSlug: string;
}) {
  const products = await getProducts(undefined, branchId);

  return <ProductCardClient products={products} branchSlug={branchSlug} />;
}
