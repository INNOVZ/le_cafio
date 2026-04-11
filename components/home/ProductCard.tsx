import { getProducts } from '@/lib/db-actions';

import ProductCardClient from '@/components/home/ProductCardClient';

export default async function ProductCard() {
  const products = await getProducts();

  return <ProductCardClient products={products} />;
}
