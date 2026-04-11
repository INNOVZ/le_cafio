'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/store';

function formatPrice(value: number) {
  return `AED ${value.toFixed(2)}`;
}

export default function CartDropdown() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const cartItems = useStore((state) => state.cartItems);
  const cartCount = useStore((state) => state.cartCount);
  const incrementCartItem = useStore((state) => state.incrementCartItem);
  const decrementCartItem = useStore((state) => state.decrementCartItem);
  const removeCartItem = useStore((state) => state.removeCartItem);
  const clearCart = useStore((state) => state.clearCart);

  useEffect(() => {
    const syncHydration = () => {
      if (useStore.persist.hasHydrated()) {
        setIsHydrated(true);
      }
    };

    syncHydration();

    const unsubscribe = useStore.persist.onFinishHydration(syncHydration);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    startTransition(() => {
      setIsOpen(false);
    });
  }, [pathname]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!isHydrated) {
    return (
      <button
        type="button"
        className="group relative flex cursor-pointer items-center gap-2 text-white transition-colors hover:text-amber-500"
        aria-label="Open cart"
      >
        <div className="relative flex items-center gap-2 outline-none">
          <ShoppingBag className="h-5 w-5 transition-colors group-hover:text-amber-500" />
        </div>
      </button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group relative flex cursor-pointer items-center gap-2 text-white transition-colors hover:text-amber-500"
          aria-label="Open cart"
        >
          <div className="relative flex items-center gap-2 outline-none">
            <ShoppingBag className="h-5 w-5 transition-colors group-hover:text-amber-500" />
            {cartCount > 0 ? (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white outline-none">
                {cartCount}
              </span>
            ) : null}
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="mt-4 w-[90vw] rounded-2xl border border-[#e6d7ca] bg-[#fffaf5] p-4 shadow-[0_18px_60px_rgba(74,45,27,0.16)] md:max-w-90"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[#694b43] uppercase">
              Your Cart
            </p>
            <p className="mt-1 text-xs text-[#7e685b]">
              {cartCount} item{cartCount === 1 ? '' : 's'}
            </p>
          </div>
          {cartItems.length > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold tracking-[0.12em] text-[#9f6d59] uppercase transition-colors hover:text-[#4a281b]"
            >
              Clear
            </button>
          ) : null}
        </div>

        {cartItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[#decfc3] bg-white/70 px-4 py-8 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-[#b9917b]" />
            <p className="mt-3 text-sm font-medium text-[#694b43]">
              Your cart is empty
            </p>
            <p className="mt-1 text-xs text-[#694b43]">
              Add a few items from the menu to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[56px_1fr_auto] gap-3 rounded-2xl border border-[#eadfd6] bg-white/90 p-3"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#f3eee8]">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-cafio truncate text-sm font-bold">
                      {item.name}
                    </p>
                    <p className="text-cafio mt-1 text-xs font-medium">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-3 inline-flex items-center rounded-full border border-[#d8c8bb] bg-[#fffaf5]">
                      <button
                        type="button"
                        onClick={() => decrementCartItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-l-full text-[#6e4636] transition-colors hover:bg-[#f5ede7]"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-xs font-semibold text-[#4a281b]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementCartItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-r-full text-[#6e4636] transition-colors hover:bg-[#f5ede7]"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      className="text-[#a56c3f] transition-colors hover:text-[#694b43]"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-bold text-[#4a281b]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-[#694b43] px-4 py-3 text-white">
              <div className="flex items-center justify-between text-sm">
                <span className="ext-cafio-sec tracking-[0.14em] uppercase">
                  Total
                </span>
                <span className="text-lg font-semibold">
                  {formatPrice(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#a56c3f] transition-colors hover:bg-[#f7ece2]"
              >
                Go to Checkout
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
