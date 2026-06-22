'use client';

import { useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { deleteCategory, deleteProduct } from '@/lib/db-actions';

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

type DeleteCategoryButtonProps = {
  categoryId: string;
  categoryName: string;
  productCount: number;
  redirectAfterDelete?: boolean;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete “${productName}”? It will be removed from every branch and saved cart. Existing order history will be preserved. This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteProduct(productId);

        if (result.error) {
          toast.error(result.error, { position: 'bottom-right' });
          return;
        }

        toast.success('Product deleted.', { position: 'bottom-right' });
        router.refresh();
      } catch (err) {
        console.error('Product deletion request failed:', err);
        toast.error('Failed to delete the product. Please try again.', {
          position: 'bottom-right',
        });
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      aria-label={`Delete ${productName}`}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
      Delete
    </Button>
  );
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  productCount,
  redirectAfterDelete = false,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const productLabel = `${productCount} product${
      productCount === 1 ? '' : 's'
    }`;
    const confirmed = window.confirm(
      `Delete “${categoryName}” and its ${productLabel}? The products will be removed from every branch and saved cart. Existing order history will be preserved. This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteCategory(categoryId);

        if (result.error) {
          toast.error(result.error, { position: 'bottom-right' });
          return;
        }

        toast.success(`Category and ${productLabel} deleted.`, {
          position: 'bottom-right',
        });

        if (redirectAfterDelete) {
          router.replace('/dashboard/categories');
          return;
        }

        router.refresh();
      } catch (err) {
        console.error('Category deletion request failed:', err);
        toast.error('Failed to delete the category. Please try again.', {
          position: 'bottom-right',
        });
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      aria-label={`Delete ${categoryName}`}
    >
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
      Delete
    </Button>
  );
}
