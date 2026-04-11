import Image from 'next/image';
import Link from 'next/link';
import { getDashboardCategories } from '@/lib/db-actions';

export default async function ListCategories() {
  const categories = await getDashboardCategories();

  return (
    <div className="h-full w-full px-5 py-10">
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
            categories.map((category) => (
            <Link
              key={category.id}
              href={`/dashboard/categories/${category.id}`}
            >
              <div className="flex items-center gap-3 rounded-lg px-2 py-2 shadow-sm">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-muted h-16 w-16 rounded-md" />
                )}
                <div className="flex flex-col">
                  <div className="text-lg font-bold">{category.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {category._count.products} product
                    {category._count.products === 1 ? '' : 's'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category.isActive ? 'Active' : 'Inactive'} · Sort order{' '}
                    {category.sortOrder}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
