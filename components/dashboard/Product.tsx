import Image from 'next/image';
import Link from 'next/link';
import { getDashboardProducts } from '@/lib/db-actions';

export default async function ListProducts() {
  const products = await getDashboardProducts();

  return (
    <div className="h-full w-full px-5 py-10">
      <p className="text-lg font-bold text-gray-600">
              Total menu Items : {products.length} {products.length === 1 ? 'Item' : ' Items'}
            </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <>
            
              {products.map((product) => (
            
                <Link
                  key={product.id}
                  href={`/dashboard/products/${product.id}/edit`}
                >
                  <div
                    className="bg-cafio-sec flex items-center gap-3 rounded-lg px-2 py-2 shadow-sm"
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
                      <div className="text-muted-foreground text-sm">
                        {product.category.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.isAvailable ? 'Available' : 'Unavailable'} ·{' '}
                        {product.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </>)}
      </div>
      
    </div>
  );
}
