import OrderTable from '@/components/dashboard/OrderTable';
import { getDashboardOrders } from '@/lib/db-actions';

export default async function OrdersPage() {
  const orders = await getDashboardOrders('all');

  return (
    <div className="h-full w-full px-5 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <p className="text-sm text-muted-foreground">
          Review every order placed through the platform.
        </p>
      </div>
      <OrderTable orders={orders} filter="all" />
    </div>
  );
}
