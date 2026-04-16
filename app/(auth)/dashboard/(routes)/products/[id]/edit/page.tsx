import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleChevronLeft } from 'lucide-react';

import ProductForm from '@/components/dashboard/ProductForm';
import { Button } from '@/components/ui/button';
import { getCategoryOptions, getProductById } from '@/lib/db-actions';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategoryOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="h-full w-full max-w-5xl p-10">
      <div className="mb-6 flex flex-row items-center gap-3">
        <Link href="/dashboard/products">
          <CircleChevronLeft />
        </Link>
        <Link href="/dashboard/products">
          <Button variant="outline" className="cursor-pointer">
            Back to Products
          </Button>
        </Link>
      </div>
      <ProductForm
        mode="edit"
        categories={categories}
        initialValues={product}
      />
    </div>
  );
}
