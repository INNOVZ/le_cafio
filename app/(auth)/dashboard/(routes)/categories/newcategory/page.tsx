import AddCategory from '@/components/dashboard/AddCategory';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleChevronLeft } from 'lucide-react';

export default function NewCategoryPage() {
  return (
    <div className="h-full w-full max-w-5xl p-10">
      <div className="mb-6 flex flex-row items-center gap-3">
        <Link href="/dashboard/categories">
          <CircleChevronLeft />
        </Link>
        <Link href="/dashboard/categories">
          <Button variant={'outline'} className="cursor-pointer">
            Back to Categories
          </Button>
        </Link>
      </div>
      <AddCategory />
    </div>
  );
}
