'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type {
  DashboardOrderDetail,
  DashboardOrderFilter,
  DashboardOrderListItem,
} from '@/lib/db-actions';

function formatCurrency(value: number, currency: string) {
  return `${currency} ${value.toFixed(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getLifecycleBadgeClass(status: DashboardOrderListItem['lifecycleState']) {
  switch (status) {
    case 'Fulfilled':
      return 'bg-green-50 text-green-700 ring-green-200';
    case 'Cancelled':
      return 'bg-red-50 text-red-700 ring-red-200';
    default:
      return 'bg-amber-50 text-amber-700 ring-amber-200';
  }
}

function getFilterTitle(filter: DashboardOrderFilter) {
  switch (filter) {
    case 'fulfilled':
      return 'Fulfilled Orders';
    case 'unfulfilled':
      return 'Unfulfilled Orders';
    case 'cancelled':
      return 'Cancelled Orders';
    default:
      return 'All Orders';
  }
}

type OrderTableProps = {
  orders: DashboardOrderListItem[];
  title?: string;
  filter?: DashboardOrderFilter;
  showViewAllLink?: boolean;
};

export default function OrderTable({
  orders,
  title,
  filter = 'all',
  showViewAllLink = false,
}: OrderTableProps) {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrderDetail | null>(
    null
  );
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  const heading = title ?? getFilterTitle(filter);

  async function openOrder(orderId: string) {
    setSelectedOrderId(orderId);
    setSelectedOrder(null);
    setIsLoadingOrder(true);

    try {
      const response = await fetch(`/api/dashboard/orders/${orderId}`);
      const result = (await response.json()) as {
        order?: DashboardOrderDetail;
        message?: string;
      };

      if (!response.ok || !result.order) {
        throw new Error(result.message ?? 'Could not load order details.');
      }

      setSelectedOrder(result.order);
    } catch (error) {
      console.error('Order detail error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not load the order details.',
        {
          position: 'bottom-right',
        }
      );
      setSelectedOrderId(null);
    } finally {
      setIsLoadingOrder(false);
    }
  }

  async function handleMarkFulfilled() {
    if (!selectedOrder) {
      return;
    }

    setIsUpdatingOrder(true);

    try {
      const response = await fetch(
        `/api/dashboard/orders/${selectedOrder.id}/fulfill`,
        {
          method: 'POST',
        }
      );

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? 'Could not update the order.');
      }

      toast.success('Order marked as fulfilled.', {
        position: 'bottom-right',
      });
      setSelectedOrderId(null);
      setSelectedOrder(null);
      router.refresh();
    } catch (error) {
      console.error('Fulfill order error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update the order.',
        {
          position: 'bottom-right',
        }
      );
    } finally {
      setIsUpdatingOrder(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{heading}</h2>
            <p className="text-sm text-muted-foreground">
              {orders.length} order{orders.length === 1 ? '' : 's'}
            </p>
          </div>
          {showViewAllLink ? (
            <Link
              href="/dashboard/orders"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          ) : null}
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            No orders found for this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Branch</th>
                  <th className="px-6 py-4 font-medium">Delivery</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Order State</th>
                  <th className="px-6 py-4 font-medium">Placed</th>
                  <th className="px-6 py-4 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => void openOrder(order.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        void openOrder(order.id);
                      }
                    }}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/40 focus:outline-none focus-visible:bg-muted/40 last:border-b-0"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold">{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customerPhone ?? 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.branchName}</td>
                    <td className="px-6 py-4 text-sm">{order.deliveryType}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{order.paymentMethod}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getLifecycleBadgeClass(
                          order.lifecycleState
                        )}`}
                      >
                        {order.lifecycleState}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(order.placedAt)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(order.grandTotal, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet
        open={Boolean(selectedOrderId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderId(null);
            setSelectedOrder(null);
          }
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {selectedOrder?.orderNumber ?? 'Order details'}
            </SheetTitle>
            <SheetDescription>
              Review the full order information and update fulfillment.
            </SheetDescription>
          </SheetHeader>

          {isLoadingOrder || !selectedOrder ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-6 px-4 pb-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Customer
                    </p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p>{selectedOrder.customerEmail}</p>
                      <p>{selectedOrder.customerPhone ?? 'No phone'}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Order Meta
                    </p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p>Branch: {selectedOrder.branchName}</p>
                      <p>Delivery: {selectedOrder.deliveryType}</p>
                      <p>Payment: {selectedOrder.paymentMethod}</p>
                      <p>Placed: {formatDate(selectedOrder.placedAt)}</p>
                      <p>Status: {selectedOrder.status}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Branch Address
                  </p>
                  <p className="mt-3 text-sm">{selectedOrder.branchAddress}</p>
                </div>

                {selectedOrder.deliveryAddress ? (
                  <div className="rounded-xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Delivery Address
                    </p>
                    <p className="mt-3 text-sm">{selectedOrder.deliveryAddress}</p>
                  </div>
                ) : null}

                {selectedOrder.notes ? (
                  <div className="rounded-xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-3 text-sm">{selectedOrder.notes}</p>
                  </div>
                ) : null}

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Items
                  </p>
                  <div className="mt-4 space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x{' '}
                            {formatCurrency(item.unitPrice, selectedOrder.currency)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(item.lineTotal, selectedOrder.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Totals
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.subtotal,
                          selectedOrder.currency
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service Fee</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.taxTotal,
                          selectedOrder.currency
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery Fee</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.deliveryFee,
                          selectedOrder.currency
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                      <span>Total</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.grandTotal,
                          selectedOrder.currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t">
                {selectedOrder.lifecycleState === 'Unfulfilled' ? (
                  <Button
                    type="button"
                    onClick={() => void handleMarkFulfilled()}
                    disabled={isUpdatingOrder}
                    className="w-full"
                  >
                    {isUpdatingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Mark as Fulfilled'
                    )}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" disabled className="w-full">
                    {selectedOrder.lifecycleState}
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
