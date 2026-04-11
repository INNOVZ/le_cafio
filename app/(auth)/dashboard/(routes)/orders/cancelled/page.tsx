import OrderTable from '@/components/dashboard/OrderTable';
import { getDashboardOrders } from '@/lib/db-actions';

export default async function CancelledOrdersPage() {
  const orders = await getDashboardOrders('cancelled');

  return (
    <div className="h-full w-full px-5 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Cancelled Orders</h1>
        <p className="text-sm text-muted-foreground">
          Orders that were cancelled before completion.
        </p>
      </div>
      <OrderTable orders={orders} filter="cancelled" />
    </div>
  );
}
