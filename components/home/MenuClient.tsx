'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

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
  branchName,
}: {
  categories: MenuCategoryItem[];
  branchName?: string;
}) {
  const selectedCategoryId = useStore((state) => state.selectedMenuCategoryId);
  const setSelectedMenuCategory = useStore(
    (state) => state.setSelectedMenuCategory
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const categoryRegionLabel = branchName
    ? `${branchName} menu categories`
    : 'Menu categories';

  useEffect(() => {
    setSelectedMenuCategory('all');
  }, [setSelectedMenuCategory]);

  const updateScrollControls = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const remainingScroll =
      container.scrollWidth - container.clientWidth - container.scrollLeft;

    setCanScrollLeft(container.scrollLeft > 1);
    setCanScrollRight(remainingScroll > 1);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    updateScrollControls();
    container.addEventListener('scroll', updateScrollControls, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateScrollControls);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollControls);
      resizeObserver.disconnect();
    };
  }, [categories.length, updateScrollControls]);

  function scrollCategories(direction: 'left' | 'right') {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const distance = Math.max(container.clientWidth * 0.7, 240);
    container.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: 'smooth',
    });
  }

  function handleCategoryKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    scrollCategories(event.key === 'ArrowRight' ? 'right' : 'left');
  }

  return (
    <section className="relative h-full w-full mt-8">
      <div
        ref={scrollContainerRef}
        role="region"
        tabIndex={0}
        aria-label={categoryRegionLabel}
        onKeyDown={handleCategoryKeyDown}
        className="w-full overflow-x-auto scroll-smooth outline-none focus-visible:ring-2 focus-visible:ring-[#7e1208]/40"
      >
        <div className="flex w-max min-w-full snap-x snap-mandatory flex-row px-2">
          <button
            type="button"
            onClick={() => setSelectedMenuCategory('all')}
            className="cursor-pointer snap-start bg-transparent"
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
              className="cursor-pointer snap-start bg-transparent"
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

      {canScrollLeft ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white via-white/90 to-transparent" />
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            className="absolute top-1/2 left-2 z-20 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#e4ddd5] bg-white/95 text-[#7e1208] shadow-sm transition-colors hover:bg-[#fff7f4] focus-visible:ring-2 focus-visible:ring-[#7e1208]/40 focus-visible:outline-none"
            aria-label="Show previous categories"
            title="Previous categories"
          >
            <ChevronLeft className="size-4" />
          </button>
        </>
      ) : null}

      {canScrollRight ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-white via-white/90 to-transparent" />
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            className="absolute top-1/2 right-2 z-20 inline-flex h-9 -translate-y-1/2 items-center justify-center gap-1 rounded-full border border-[#e4ddd5] bg-white/95 px-2.5 text-[#7e1208] shadow-sm transition-colors hover:bg-[#fff7f4] focus-visible:ring-2 focus-visible:ring-[#7e1208]/40 focus-visible:outline-none"
            aria-label="Show more categories"
            title="More categories"
          >
            <span className="hidden text-xs font-semibold sm:inline">More</span>
            <ChevronRight className="size-4" />
          </button>
        </>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {canScrollRight
          ? 'More categories are available to the right.'
          : canScrollLeft
            ? 'More categories are available to the left.'
            : 'All categories are visible.'}
      </p>
    </section>
  );
}
