import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ListCategories from '@/components/dashboard/Category';
import { BadgePlus } from 'lucide-react';

const categories = () => {
  return (
    <div className="h-full w-full px-5 py-10">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold">All Categories</h1>
        <Link href="/dashboard/categories/newcategory">
          <Button className="flex cursor-pointer flex-row items-center gap-2">
            Add a Category <BadgePlus />
          </Button>
        </Link>
      </div>
      <ListCategories />
    </div>
  );
};

export default categories;
