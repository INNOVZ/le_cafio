import { getCategories } from '@/lib/db-actions';

import MenuClient from '@/components/home/MenuClient';

export default async function Menu() {
  const categories = await getCategories();

  return <MenuClient categories={categories} />;
}
