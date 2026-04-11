'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';

import { useStore } from '@/store';

type MenuCategoryItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  _count: {
    products: number;
  };
};

export default function MenuClient({
  categories,
}: {
  categories: MenuCategoryItem[];
}) {
  const selectedCategoryId = useStore((state) => state.selectedMenuCategoryId);
  const setSelectedMenuCategory = useStore(
    (state) => state.setSelectedMenuCategory
  );

  useEffect(() => {
    setSelectedMenuCategory('all');
  }, [setSelectedMenuCategory]);

  return (
    <div className="h-full w-full overflow-x-auto">
      <div className="flex w-max flex-row">
        <button
          type="button"
          onClick={() => setSelectedMenuCategory('all')}
          className="cursor-pointer bg-transparent"
        >
          <div className="relative flex min-w-40 shrink-0 origin-center transform-gpu flex-col items-center gap-2 pb-3 transition-transform duration-200">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                selectedCategoryId === 'all'
                  ? 'bg-[#7e1208] text-white'
                  : 'bg-white text-[#7e1208]'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="text-cafio text-xs font-bold">Our Menu</div>
            </div>
            {selectedCategoryId === 'all' ? (
              <div className="bg-cafio absolute bottom-0 h-0.5 w-12 rounded-full" />
            ) : null}
          </div>
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedMenuCategory(category.id)}
            className="cursor-pointer bg-transparent"
          >
            <div
              className={`relative flex min-w-40 shrink-0 origin-center transform-gpu flex-col items-center gap-2 pb-3 transition-transform duration-200 ${
                selectedCategoryId === category.id ? 'scale-105' : 'scale-100'
              }`}
            >
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={50}
                  height={50}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="bg-muted h-16 w-16 rounded-md" />
              )}
              <div className="flex flex-col">
                <div className="text-cafio text-xs font-bold">
                  {category.name}
                </div>
              </div>
              {selectedCategoryId === category.id ? (
                <div className="bg-cafio absolute bottom-0 h-1 w-12 rounded-full" />
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
