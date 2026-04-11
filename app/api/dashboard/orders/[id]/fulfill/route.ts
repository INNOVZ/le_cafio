import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import {
  FulfillmentType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
} from '@/lib/generated/prisma/enums';
import { prisma } from '@/lib/prisma';

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        fulfillmentType: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found.' },
        { status: 404 }
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      return NextResponse.json(
        { message: 'Cancelled orders cannot be fulfilled.' },
        { status: 400 }
      );
    }

    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.COMPLETED
    ) {
      return NextResponse.json(
        { message: 'Order is already fulfilled.' },
        { status: 400 }
      );
    }

    const nextStatus =
      order.fulfillmentType === FulfillmentType.DELIVERY
        ? OrderStatus.DELIVERED
        : OrderStatus.COMPLETED;

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status: nextStatus,
          paymentStatus:
            order.paymentStatus === PaymentStatus.PENDING
              ? PaymentStatus.PAID
              : order.paymentStatus,
          completedAt: new Date(),
        },
      }),
      prisma.payment.updateMany({
        where: {
          orderId: id,
          provider: PaymentProvider.MANUAL,
          method: 'Cash on Delivery',
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      }),
    ]);

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/orders/fulfilled');
    revalidatePath('/dashboard/orders/unfulfilled');
    revalidatePath('/dashboard/orders/cancelled');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order fulfillment update error:', error);
    return NextResponse.json(
      { message: 'Could not update the order status.' },
      { status: 500 }
    );
  }
}
