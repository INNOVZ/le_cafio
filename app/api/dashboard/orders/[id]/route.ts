import { NextResponse } from 'next/server';

import { getDashboardOrderDetail } from '@/lib/db-actions';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getDashboardOrderDetail(id);

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Dashboard order detail error:', error);
    return NextResponse.json(
      { message: 'Could not load the order details.' },
      { status: 500 }
    );
  }
}
