import OrderTable from '@/components/dashboard/OrderTable';
import { getDashboardOrders } from '@/lib/db-actions';

export default async function UnfulfilledOrdersPage() {
  const orders = await getDashboardOrders('unfulfilled');

  return (
    <div className="h-full w-full px-5 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Unfulfilled Orders</h1>
        <p className="text-sm text-muted-foreground">
          Orders that are still active and not yet completed.
        </p>
      </div>
      <OrderTable orders={orders} filter="unfulfilled" />
    </div>
  );
}
