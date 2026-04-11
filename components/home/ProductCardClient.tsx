'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from '@/store';

type ProductListItem = {
  id: string;
  name: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    sortOrder: number;
  };
  imageUrl: string;
  price: number;
  description: string;
  isAvailable: boolean;
};

function QuantitySelector({
  quantity,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#d8c8bb] bg-white">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-l-full text-[#6e4636] transition-colors hover:bg-[#f5ede7]"
        onClick={onDecrement}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-10 text-center text-sm font-semibold text-[#694b43]">
        {quantity}
      </span>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-r-full text-[#694b43] transition-colors hover:bg-[#f5ede7]"
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProductCardItem({ product }: { product: ProductListItem }) {
  const addToCart = useStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState(1);

  function handleAddToCart() {
    addToCart(
      {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
      },
      quantity
    );

    toast.success(`${quantity} x ${product.name} added to cart`, {
      position: 'bottom-right',
    });
    setQuantity(1);
  }

  return (
    <article className="grid h-full grid-rows-[180px_auto_auto_1fr_auto] rounded-3xl border border-[#e4ddd5] bg-[#fffdf9] p-2 shadow-[0_18px_45px_rgba(74,45,27,0.06)] transition-transform duration-300 hover:scale-101">
      <div className="relative h-45 w-full overflow-hidden rounded-t-2xl bg-[#f3eee8]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover"
        />
      </div>

      <h3 className="text-cafio text-md mt-5 px-3 font-bold uppercase">
        {product.name}
      </h3>
      <p className="text-cafio-sec bg-cafio mx-3 my-1 line-clamp-4 w-fit rounded-md px-3 py-1 text-xs font-bold">
        AED {product.price.toFixed(2)}
      </p>
      <p className="my-3 line-clamp-4 px-3 text-sm text-[#5f5147]">
        {product.description}
      </p>

      <div className="space-y-2 p-2">
        <div className="flex items-center justify-between">
          <QuantitySelector
            quantity={quantity}
            onDecrement={() =>
              setQuantity((current) => Math.max(1, current - 1))
            }
            onIncrement={() =>
              setQuantity((current) => Math.min(50, current + 1))
            }
          />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className="group inline-flex w-fit cursor-pointer items-center overflow-hidden rounded-full bg-[#694b43] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,40,27,0.18)] transition-all duration-300 hover:bg-[#34180f] hover:shadow-[0_16px_30px_rgba(74,40,27,0.28)] disabled:cursor-not-allowed disabled:bg-[#bca89c] disabled:shadow-none"
          >
            <span>{product.isAvailable ? 'Add to Cart' : 'Unavailable'}</span>
            {product.isAvailable ? (
              <span className="ml-0 flex h-0 w-0 translate-x-2 items-center justify-center rounded-full bg-white/14 opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:h-5 group-hover:w-5 group-hover:translate-x-0 group-hover:opacity-100">
                <ArrowRight className="h-3 w-3" />
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductCardClient({
  products,
}: {
  products: ProductListItem[];
}) {
  const selectedCategoryId = useStore((state) => state.selectedMenuCategoryId);
  const visibleProducts =
    selectedCategoryId === 'all'
      ? products
      : products.filter((product) => product.categoryId === selectedCategoryId);

  const groupedProducts =
    selectedCategoryId === 'all'
      ? visibleProducts.reduce<
          Array<{
            categoryId: string;
            categoryName: string;
            products: ProductListItem[];
          }>
        >((groups, product) => {
          const existingGroup = groups.find(
            (group) => group.categoryId === product.category.id
          );

          if (existingGroup) {
            existingGroup.products.push(product);
            return groups;
          }

          groups.push({
            categoryId: product.category.id,
            categoryName: product.category.name,
            products: [product],
          });

          return groups;
        }, [])
      : [];

  if (visibleProducts.length === 0) {
    return (
      <section className="my-10 rounded-4xl border border-dashed border-[#d8c8bb] bg-[#fffdf9] p-10 text-center text-[#6e4636]">
        No products found for this category.
      </section>
    );
  }

  return (
    <section className="my-10">
      {selectedCategoryId === 'all' ? (
        <div className="space-y-12">
          {groupedProducts.map((group) => (
            <section key={group.categoryId} className="space-y-5">
              <div className="border-b border-[#eadfd6] pb-3">
                <h2 className="text-cafio text-lg font-semibold uppercase tracking-[0.18em]">
                  {group.categoryName}
                </h2>
              </div>
              <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-4">
                {group.products.map((product) => (
                  <ProductCardItem key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCardItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
