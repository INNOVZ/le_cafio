import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CircleChevronLeft } from 'lucide-react';

import CategoryForm from '@/components/dashboard/CategoryForm';
import { Button } from '@/components/ui/button';
import { getCategoryById } from '@/lib/db-actions';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="h-full w-full max-w-5xl p-10">
      <div className="mb-6 flex flex-row items-center gap-3">
        <Link href="/dashboard/categories">
          <CircleChevronLeft />
        </Link>
        <Link href="/dashboard/categories">
          <Button variant="outline" className="cursor-pointer">
            Back to Categories
          </Button>
        </Link>
      </div>
      <CategoryForm mode="edit" initialValues={category} />
    </div>
  );
}
