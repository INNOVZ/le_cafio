'use server';

import { revalidatePath } from 'next/cache';
import type { ProductActionState } from '@/lib/db-action-state';
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
} from '@/lib/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export type RestaurantLocationListItem = {
  id: string;
  name: string;
  addressLine: string;
  city: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
};

export type DashboardStats = {
  codOrders: number;
  cardPayments: number;
  weeklySales: number;
  monthlySales: number;
};

export type DashboardOrderFilter =
  | 'all'
  | 'fulfilled'
  | 'unfulfilled'
  | 'cancelled';

export type DashboardOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  branchName: string;
  deliveryType: 'Pickup' | 'Delivery';
  lifecycleState: 'Fulfilled' | 'Unfulfilled' | 'Cancelled';
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  grandTotal: number;
  currency: string;
  placedAt: string;
};

export type DashboardOrderDetail = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  branchName: string;
  branchAddress: string;
  deliveryType: 'Pickup' | 'Delivery';
  lifecycleState: 'Fulfilled' | 'Unfulfilled' | 'Cancelled';
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  placedAt: string;
  deliveryAddress: string | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
};

export type CategoryOption = {
  id: string;
  name: string;
};

export type DashboardCategoryFormValues = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
};

export type DashboardProductFormValues = {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  imageUrl: string;
};

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

async function uploadImage(
  imageFile: File | null,
  folder: 'categories' | 'products'
) {
  if (!imageFile || imageFile.size === 0) {
    return null;
  }

  try {
    const supabase = await createClient();
    const ext = imageFile.name.split('.').pop() ?? 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    console.error('Unexpected image upload error:', err);
    return null;
  }
}

function parseCategoryPayload(formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim();
  const sortOrderRaw = formData.get('sortOrder') as string | null;
  const isActiveRaw = formData.get('isActive') as string | null;

  if (!name || name.length < 3) {
    return {
      error: 'Category name must be at least 3 characters.',
      values: null,
    } as const;
  }

  if (name.length > 32) {
    return {
      error: 'Category name must be at most 32 characters.',
      values: null,
    } as const;
  }

  const sortOrder = parseInt(sortOrderRaw ?? '0', 10);
  if (Number.isNaN(sortOrder) || sortOrder < 0) {
    return {
      error: 'Sort order must be a valid positive integer.',
      values: null,
    } as const;
  }

  return {
    error: null,
    values: {
      name,
      sortOrder,
      isActive: isActiveRaw === 'true',
    },
  } as const;
}

function parseProductPayload(formData: FormData) {
  const title = (formData.get('title') as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim();
  const priceRaw = formData.get('price') as string | null;
  const isAvailableRaw = formData.get('isAvailable') as string | null;
  const categoryId = (formData.get('categoryId') as string | null)?.trim();

  if (!title || title.length < 5) {
    return {
      error: 'Product title must be at least 5 characters.',
      values: null,
    } as const;
  }

  if (title.length > 32) {
    return {
      error: 'Product title must be at most 32 characters.',
      values: null,
    } as const;
  }

  if (!description || description.length < 20) {
    return {
      error: 'Description must be at least 20 characters.',
      values: null,
    } as const;
  }

  if (description.length > 200) {
    return {
      error: 'Description must be at most 200 characters.',
      values: null,
    } as const;
  }

  const price = parseFloat(priceRaw ?? '');
  if (Number.isNaN(price) || price < 0) {
    return {
      error: 'Price must be a valid positive number.',
      values: null,
    } as const;
  }

  if (!categoryId) {
    return {
      error: 'Please select a category.',
      values: null,
    } as const;
  }

  return {
    error: null,
    values: {
      title,
      description,
      price,
      categoryId,
      isAvailable: isAvailableRaw === 'true',
    },
  } as const;
}

function revalidateDashboardProductPaths(productId?: string) {
  revalidatePath('/dashboard/products');
  revalidatePath('/dashboard/products/newproduct');
  if (productId) {
    revalidatePath(`/dashboard/products/${productId}/edit`);
  }
}

function revalidateDashboardCategoryPaths(categoryId?: string) {
  revalidatePath('/dashboard/categories');
  revalidatePath('/dashboard/categories/newcategory');
  revalidatePath('/dashboard/products/newproduct');
  if (categoryId) {
    revalidatePath(`/dashboard/categories/${categoryId}`);
    revalidatePath(`/dashboard/categories/${categoryId}/edit`);
  }
}

function getStartOfWeek(date: Date) {
  const value = new Date(date);
  const day = (value.getDay() + 6) % 7;
  value.setDate(value.getDate() - day);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getStartOfMonth(date: Date) {
  const value = new Date(date.getFullYear(), date.getMonth(), 1);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getOrderStatusesForFilter(filter: DashboardOrderFilter) {
  switch (filter) {
    case 'fulfilled':
      return [OrderStatus.DELIVERED, OrderStatus.COMPLETED];
    case 'unfulfilled':
      return [
        OrderStatus.DRAFT,
        OrderStatus.PLACED,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.OUT_FOR_DELIVERY,
      ];
    case 'cancelled':
      return [OrderStatus.CANCELLED];
    default:
      return null;
  }
}

function getOrderLifecycleState(status: OrderStatus) {
  if (status === OrderStatus.CANCELLED) {
    return 'Cancelled' as const;
  }

  if (status === OrderStatus.DELIVERED || status === OrderStatus.COMPLETED) {
    return 'Fulfilled' as const;
  }

  return 'Unfulfilled' as const;
}

function getPaymentMethodLabel(payment: {
  provider?: PaymentProvider;
  method?: string | null;
} | null) {
  if (payment?.method) {
    return payment.method;
  }

  if (payment?.provider === PaymentProvider.STRIPE) {
    return 'Card Payment';
  }

  if (payment?.provider === PaymentProvider.MANUAL) {
    return 'Cash on Delivery';
  }

  return 'Not recorded';
}

export async function createCategory(
  _: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = parseCategoryPayload(formData);
  if (parsed.error) {
    return { error: parsed.error, success: false };
  }

  const imageFile = formData.get('image') as File | null;
  const imageUrl = await uploadImage(imageFile, 'categories');

  try {
    await prisma.category.create({
      data: {
        name: parsed.values.name,
        slug: generateSlug(parsed.values.name),
        sortOrder: parsed.values.sortOrder,
        isActive: parsed.values.isActive,
        imageUrl,
      },
    });

    revalidateDashboardCategoryPaths();
  } catch (err) {
    console.error('Category creation error:', err);
    return {
      error: 'Failed to save the category. Please try again.',
      success: false,
    };
  }

  return { error: null, success: true };
}

export async function updateCategory(
  _: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const id = (formData.get('id') as string | null)?.trim();
  if (!id) {
    return { error: 'Category id is required.', success: false };
  }

  const parsed = parseCategoryPayload(formData);
  if (parsed.error) {
    return { error: parsed.error, success: false };
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      imageUrl: true,
    },
  });

  if (!existingCategory) {
    return { error: 'Category not found.', success: false };
  }

  const imageFile = formData.get('image') as File | null;
  const uploadedImageUrl = await uploadImage(imageFile, 'categories');

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: parsed.values.name,
        sortOrder: parsed.values.sortOrder,
        isActive: parsed.values.isActive,
        imageUrl: uploadedImageUrl ?? existingCategory.imageUrl,
      },
    });

    revalidateDashboardCategoryPaths(id);
  } catch (err) {
    console.error('Category update error:', err);
    return {
      error: 'Failed to update the category. Please try again.',
      success: false,
    };
  }

  return { error: null, success: true };
}

export async function createProduct(
  _: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = parseProductPayload(formData);
  if (parsed.error) {
    return { error: parsed.error, success: false };
  }

  const imageFile = formData.get('image') as File | null;
  const imageUrl = await uploadImage(imageFile, 'products');

  if (!imageUrl) {
    return { error: 'Image is required.', success: false };
  }

  try {
    await prisma.product.create({
      data: {
        categoryId: parsed.values.categoryId,
        name: parsed.values.title,
        slug: generateSlug(parsed.values.title),
        description: parsed.values.description,
        price: parsed.values.price,
        imageUrl,
        isAvailable: parsed.values.isAvailable,
        isActive: true,
      },
    });

    revalidateDashboardProductPaths();
  } catch (err) {
    console.error('Product creation error:', err);
    return {
      error: 'Failed to save the product. Please try again.',
      success: false,
    };
  }

  return { error: null, success: true };
}

export async function updateProduct(
  _: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const id = (formData.get('id') as string | null)?.trim();
  if (!id) {
    return { error: 'Product id is required.', success: false };
  }

  const parsed = parseProductPayload(formData);
  if (parsed.error) {
    return { error: parsed.error, success: false };
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      imageUrl: true,
      isActive: true,
    },
  });

  if (!existingProduct) {
    return { error: 'Product not found.', success: false };
  }

  const imageFile = formData.get('image') as File | null;
  const uploadedImageUrl = await uploadImage(imageFile, 'products');

  try {
    await prisma.product.update({
      where: { id },
      data: {
        categoryId: parsed.values.categoryId,
        name: parsed.values.title,
        description: parsed.values.description,
        price: parsed.values.price,
        imageUrl: uploadedImageUrl ?? existingProduct.imageUrl,
        isAvailable: parsed.values.isAvailable,
        isActive: existingProduct.isActive,
      },
    });

    revalidateDashboardProductPaths(id);
  } catch (err) {
    console.error('Product update error:', err);
    return {
      error: 'Failed to update the product. Please try again.',
      success: false,
    };
  }

  return { error: null, success: true };
}

export async function getRestaurantLocations(): Promise<
  RestaurantLocationListItem[]
> {
  const locations = await prisma.restaurantLocation.findMany({
    where: { isActive: true },
    orderBy: [{ name: 'asc' }],
    select: {
      id: true,
      name: true,
      line1: true,
      city: true,
      latitude: true,
      longitude: true,
      deliveryRadiusKm: true,
    },
  });

  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    addressLine: location.line1,
    city: location.city,
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    deliveryRadiusKm: Number(location.deliveryRadiusKm),
  }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = getStartOfMonth(now);

  const activeOrderFilter = {
    status: {
      not: 'CANCELLED' as const,
    },
  };

  const [
    codOrders,
    cardPayments,
    weeklySalesAggregate,
    monthlySalesAggregate,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        ...activeOrderFilter,
        payments: {
          some: {
            OR: [
              {
                method: 'Cash on Delivery',
              },
              {
                provider: PaymentProvider.MANUAL,
                method: 'Cash on Delivery',
              },
            ],
          },
        },
      },
    }),
    prisma.payment.count({
      where: {
        provider: PaymentProvider.STRIPE,
        status: {
          in: [PaymentStatus.AUTHORIZED, PaymentStatus.PAID],
        },
      },
    }),
    prisma.order.aggregate({
      _sum: {
        grandTotal: true,
      },
      where: {
        ...activeOrderFilter,
        placedAt: {
          gte: startOfWeek,
          lte: now,
        },
      },
    }),
    prisma.order.aggregate({
      _sum: {
        grandTotal: true,
      },
      where: {
        ...activeOrderFilter,
        placedAt: {
          gte: startOfMonth,
          lte: now,
        },
      },
    }),
  ]);

  return {
    codOrders,
    cardPayments,
    weeklySales: Number(weeklySalesAggregate._sum.grandTotal ?? 0),
    monthlySales: Number(monthlySalesAggregate._sum.grandTotal ?? 0),
  };
}

export async function getDashboardOrders(
  filter: DashboardOrderFilter = 'all',
  limit?: number
): Promise<DashboardOrderListItem[]> {
  const statuses = getOrderStatusesForFilter(filter);

  const orders = await prisma.order.findMany({
    where: statuses
      ? {
          status: {
            in: statuses,
          },
        }
      : undefined,
    orderBy: {
      placedAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerPhone: true,
      fulfillmentType: true,
      status: true,
      paymentStatus: true,
      grandTotal: true,
      currency: true,
      placedAt: true,
      restaurantLocation: {
        select: {
          name: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: {
          provider: true,
          method: true,
        },
      },
    },
  });

  return orders.map((order) => {
    const latestPayment = order.payments[0] ?? null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      branchName: order.restaurantLocation?.name ?? 'Unknown branch',
      deliveryType: order.fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup',
      lifecycleState: getOrderLifecycleState(order.status),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: getPaymentMethodLabel(latestPayment),
      grandTotal: Number(order.grandTotal),
      currency: order.currency,
      placedAt: order.placedAt.toISOString(),
    };
  });
}

export async function getDashboardOrderDetail(
  id: string
): Promise<DashboardOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      notes: true,
      fulfillmentType: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      deliveryFee: true,
      taxTotal: true,
      grandTotal: true,
      currency: true,
      placedAt: true,
      deliveryLine1: true,
      deliveryLine2: true,
      deliveryCity: true,
      deliveryState: true,
      deliveryPostalCode: true,
      deliveryCountry: true,
      restaurantLocation: {
        select: {
          name: true,
          line1: true,
          city: true,
          country: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        select: {
          provider: true,
          method: true,
        },
      },
      items: {
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          productName: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  const latestPayment = order.payments[0] ?? null;
  const deliveryAddressParts = [
    order.deliveryLine1,
    order.deliveryLine2,
    order.deliveryCity,
    order.deliveryState,
    order.deliveryPostalCode,
    order.deliveryCountry,
  ].filter(Boolean);

  const branchAddressParts = [
    order.restaurantLocation?.line1,
    order.restaurantLocation?.city,
    order.restaurantLocation?.country,
  ].filter(Boolean);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    notes: order.notes,
    branchName: order.restaurantLocation?.name ?? 'Unknown branch',
    branchAddress: branchAddressParts.join(', '),
    deliveryType: order.fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup',
    lifecycleState: getOrderLifecycleState(order.status),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: getPaymentMethodLabel(latestPayment),
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    taxTotal: Number(order.taxTotal),
    grandTotal: Number(order.grandTotal),
    currency: order.currency,
    placedAt: order.placedAt.toISOString(),
    deliveryAddress: deliveryAddressParts.length
      ? deliveryAddressParts.join(', ')
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getDashboardCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      imageUrl: true,
      isActive: true,
      sortOrder: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getCategoryById(
  id: string
): Promise<DashboardCategoryFormValues | null> {
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sortOrder: true,
      isActive: true,
      imageUrl: true,
    },
  });

  if (!category) {
    return null;
  }

  return category;
}

export async function getProducts(categoryId?: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      categoryId: true,
      imageUrl: true,
      price: true,
      description: true,
      isAvailable: true,
      category: {
        select: {
          id: true,
          name: true,
          sortOrder: true,
        },
      },
    },
  });

  return products.map((product) => ({
    ...product,
    price: Number(product.price),
  }));
}

export async function getDashboardProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      imageUrl: true,
      isAvailable: true,
      isActive: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return products;
}

export async function getProductById(
  id: string
): Promise<DashboardProductFormValues | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      categoryId: true,
      isAvailable: true,
      imageUrl: true,
    },
  });

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    title: product.name,
    description: product.description,
    price: Number(product.price),
    categoryId: product.categoryId,
    isAvailable: product.isAvailable,
    imageUrl: product.imageUrl,
  };
}
