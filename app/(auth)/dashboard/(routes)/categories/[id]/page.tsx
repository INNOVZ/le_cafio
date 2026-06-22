import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BadgePlus } from 'lucide-react';
import {
  DeleteCategoryButton,
  DeleteProductButton,
} from '@/components/dashboard/DeleteCatalogEntityButton';

const category = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) {
    notFound();
  }
  return (
    <div className="h-full w-full px-5 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground text-sm">
            {category.products.length} product
            {category.products.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/categories/${category.id}/edit`}>
            <Button variant="outline" className="cursor-pointer">
              Edit Category
            </Button>
          </Link>
          <DeleteCategoryButton
            categoryId={category.id}
            categoryName={category.name}
            productCount={category.products.length}
            redirectAfterDelete
          />
          <Link href="/dashboard/products/newproduct">
            <Button className="flex cursor-pointer flex-row items-center gap-2">
              Add Product <BadgePlus />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {category.products.length === 0 ? (
          <p>No products in this category.</p>
        ) : (
          category.products.map((product) => (
            <div
              key={product.id}
              className="bg-cafio-sec flex items-center gap-3 rounded-lg border border-m-red-950 px-2 py-2 shadow-sm"
            >
              <Link
                href={`/dashboard/products/${product.id}/edit`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-muted h-16 w-16 rounded-md" />
                )}
                <div className="flex flex-col">
                  <div className="text-lg font-bold">{product.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {product.isAvailable ? 'Available' : 'Unavailable'} ·{' '}
                    {product.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </Link>
              <DeleteProductButton
                productId={product.id}
                productName={product.name}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default category;
