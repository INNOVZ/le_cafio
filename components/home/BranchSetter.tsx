'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { useCheckoutStore } from '@/store/checkout-store';

/**
 * Invisible client component that syncs the selected branch
 * into the Zustand store when a branch menu page loads.
 * Also pre-populates the checkout store's restaurantLocationId.
 */
export default function BranchSetter({
  slug,
  id,
}: {
  slug: string;
  id: string;
}) {
  const setSelectedBranch = useStore((state) => state.setSelectedBranch);
  const updateCheckout = useCheckoutStore((state) => state.updateCheckout);

  useEffect(() => {
    setSelectedBranch(slug, id);
    updateCheckout({ restaurantLocationId: id });
  }, [slug, id, setSelectedBranch, updateCheckout]);

  return null;
}
