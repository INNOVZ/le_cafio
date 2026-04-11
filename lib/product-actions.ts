'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import type { ProductActionState } from '@/lib/db-action-state';

/**
 * Generates a URL‑friendly slug from a string.
 * Appends a short random suffix to keep it unique enough for a first pass.
 */
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

/**
 * Fetches all active categories (used by the form to populate the selector).
 */
export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  });
}

/**
 * Creates a new category in the database.
 */
export async function createCategory(
  _: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const name = (formData.get('name') as string | null)?.trim();
  const sortOrderRaw = formData.get('sortOrder') as string | null;
  const isActiveRaw = formData.get('isActive') as string | null;
  const imageFile = formData.get('image') as File | null;

  if (!name || name.length < 3) {
    return {
      error: 'Category name must be at least 3 characters.',
      success: false,
    };
  }
  if (name.length > 32) {
    return {
      error: 'Category name must be at most 32 characters.',
      success: false,
    };
  }

  const sortOrder = parseInt(sortOrderRaw ?? '0', 10);
  if (isNaN(sortOrder) || sortOrder < 0) {
    return {
      error: 'Sort order must be a valid positive integer.',
      success: false,
    };
  }

  const isActive = isActiveRaw === 'true';

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    try {
      const supabase = await createClient();
      const ext = imageFile.name.split('.').pop() ?? 'jpg';
      const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(path);
        imageUrl = publicUrl;
      }
    } catch (err) {
      console.error('Unexpected image upload error:', err);
    }
  }

  try {
    const slug = generateSlug(name);

    await prisma.category.create({
      data: {
        name,
        slug,
        sortOrder,
        isActive,
        imageUrl,
      },
    });

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/newproduct'); // So the select lists update
  } catch (err) {
    console.error('Category creation error:', err);
    return {
      error: 'Failed to save the category. Please try again.',
      success: false,
    };
  }

  return { error: null, success: true };
}

/**
 * Creates a new product in the database.
 * Accepts a FormData object because the image field is a File.
 */
export async function createProduct(
  _: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  // ── 1. Extract and validate fields ────────────────────────────────────────
  const title = (formData.get('title') as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim();
  const priceRaw = formData.get('price') as string | null;
  const isAvailableRaw = formData.get('isAvailable') as string | null;
  const categoryId = (formData.get('categoryId') as string | null)?.trim();
  const imageFile = formData.get('image') as File | null;

  if (!title || title.length < 5) {
    return {
      error: 'Product title must be at least 5 characters.',
      success: false,
    };
  }
  if (title.length > 32) {
    return {
      error: 'Product title must be at most 32 characters.',
      success: false,
    };
  }
  if (!description || description.length < 20) {
    return {
      error: 'Description must be at least 20 characters.',
      success: false,
    };
  }
  if (description.length > 50) {
    return {
      error: 'Description must be at most 50 characters.',
      success: false,
    };
  }

  const price = parseFloat(priceRaw ?? '');
  if (isNaN(price) || price < 0) {
    return { error: 'Price must be a valid positive number.', success: false };
  }
  if (!categoryId) {
    return { error: 'Please select a category.', success: false };
  }

  const isAvailable = isAvailableRaw === 'true';

  // ── 2. Upload image (if provided) ─────────────────────────────────────────
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    try {
      const supabase = await createClient();
      const ext = imageFile.name.split('.').pop() ?? 'jpg';
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        // Non-fatal: we continue without an image
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(path);
        imageUrl = publicUrl;
      }
    } catch (err) {
      console.error('Unexpected image upload error:', err);
    }
  }

  if (!imageUrl) {
    return { error: 'Image is required.', success: false };
  }

  const requiredDescription = description;
  const requiredImageUrl = imageUrl;

  // ── 3. Create product record ───────────────────────────────────────────────
  try {
    const slug = generateSlug(title);

    await prisma.product.create({
      data: {
        categoryId,
        name: title,
        slug,
        description: requiredDescription,
        price,
        imageUrl: requiredImageUrl,
        isAvailable,
        isActive: true,
      },
    });
  } catch (err) {
    console.error('Product creation error:', err);
    return {
      error: 'Failed to save the product. Please try again.',
      success: false,
    };
  }

  // ── 4. Revalidate and return ────────────────────────────────────────────────
  revalidatePath('/dashboard/allproducts');
  revalidatePath('/dashboard');

  return { error: null, success: true };
}
