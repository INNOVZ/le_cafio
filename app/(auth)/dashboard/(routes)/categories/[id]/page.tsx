import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const category = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        where: { isActive: true },
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
          <p className="text-sm text-muted-foreground">
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
          <Link href="/dashboard/products/newproduct">
            <Button className="flex cursor-pointer flex-row items-center gap-2">
              Add Product <span className="h-2 w-2 rounded-full bg-white"></span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {category.products.length === 0 ? (
          <p>No products in this category.</p>
        ) : (
          category.products.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}/edit`}
              className="block rounded border p-4"
            >
              <p className="font-medium">{product.name}</p>
              <p>{String(product.price)}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default category;
