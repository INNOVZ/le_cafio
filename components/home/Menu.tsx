import { getCategories, getRestaurantLocationBySlug } from '@/lib/db-actions';
import { resolveDbSlug } from '@/lib/branch-slugs';

import MenuClient from '@/components/home/MenuClient';

export default async function Menu({ branchSlug }: { branchSlug: string }) {
  const branch = await getRestaurantLocationBySlug(resolveDbSlug(branchSlug));
  const categories = await getCategories();

  return <MenuClient categories={categories} branchName={branch?.name ?? branchSlug} />;
}
