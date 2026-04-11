import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ListProducts from '@/components/dashboard/Product';

const products = () => {
  return (
    <div className="h-full w-full px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Products</h1>
        <Link href="/dashboard/products/newproduct">
          <Button className="flex cursor-pointer flex-row items-center gap-2">
            Add Product <span className="h-2 w-2 rounded-full bg-white"></span>
          </Button>
        </Link>
      </div>
      <ListProducts />
    </div>
  );
};

export default products;
