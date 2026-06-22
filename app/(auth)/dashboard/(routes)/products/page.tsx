import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ListProducts from '@/components/dashboard/Product';
import { BadgePlus } from 'lucide-react';

const products = () => {
  return (
    <div className="h-full w-full px-5 py-10">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold">All Products</h1>
        <Link href="/dashboard/products/newproduct">
          <Button className="flex cursor-pointer flex-row items-center gap-2">
            Add Product <BadgePlus />
          </Button>
        </Link>
      </div>
      <ListProducts />
    </div>
  );
};

export default products;
