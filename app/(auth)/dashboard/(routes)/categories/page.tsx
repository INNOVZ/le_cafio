import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ListCategories from '@/components/dashboard/Category';

const categories = () => {
  return (
    <div className="h-full w-full px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Categories</h1>
        <Link href="/dashboard/categories/newcategory">
          <Button className="flex cursor-pointer flex-row items-center gap-2">
            Add Category <span className="h-2 w-2 rounded-full bg-white"></span>
          </Button>
        </Link>
      </div>
      <ListCategories />
    </div>
  );
};

export default categories;
