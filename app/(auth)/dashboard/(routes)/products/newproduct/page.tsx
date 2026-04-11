import React from 'react';
import AddProduct from '@/components/dashboard/AddProduct';
import { getCategoryOptions } from '@/lib/db-actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleChevronLeft } from 'lucide-react';

export default async function NewProductPage() {
  const categories = await getCategoryOptions();

  return (
    <div className="h-full w-full max-w-5xl p-10">
      <div className="mb-6 flex flex-row items-center gap-3 px-10">
        <Link href="/dashboard/products">
          <CircleChevronLeft />
        </Link>
        <Link href="/dashboard/products">
          <Button variant={'outline'} className="cursor-pointer">
            Back to Products
          </Button>
        </Link>
      </div>
      <AddProduct categories={categories} />
    </div>
  );
}
