import OrderTable from '@/components/dashboard/OrderTable';
import { getDashboardOrders } from '@/lib/db-actions';

export default async function FulfilledOrdersPage() {
  const orders = await getDashboardOrders('fulfilled');

  return (
    <div className="h-full w-full px-5 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Fulfilled Orders</h1>
        <p className="text-sm text-muted-foreground">
          Orders that have been delivered or completed.
        </p>
      </div>
      <OrderTable orders={orders} filter="fulfilled" />
    </div>
  );
}
