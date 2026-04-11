import {
  CreditCard,
  ReceiptText,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import OrderTable from '@/components/dashboard/OrderTable';
import { getDashboardOrders, getDashboardStats } from '@/lib/db-actions';

function formatCurrency(value: number) {
  return `AED ${value.toFixed(2)}`;
}

const statCards = [
  {
    key: 'codOrders',
    title: 'COD Orders',
    description: 'Cash on delivery orders placed',
    icon: ReceiptText,
  },
  {
    key: 'cardPayments',
    title: 'Card Payments',
    description: 'Stripe payments authorized or paid',
    icon: CreditCard,
  },
  {
    key: 'weeklySales',
    title: 'This Week',
    description: 'Gross sales from Monday until today',
    icon: TrendingUp,
  },
  {
    key: 'monthlySales',
    title: 'This Month',
    description: 'Gross sales for the current calendar month',
    icon: Wallet,
  },
] as const;

export default async function Page() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getDashboardOrders('all', 5),
  ]);

  return (
    <div className="h-full w-full px-5 py-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Overview</p>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track your cash orders, card payments, and current revenue from one
          place.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value =
            card.key === 'weeklySales' || card.key === 'monthlySales'
              ? formatCurrency(stats[card.key])
              : stats[card.key].toLocaleString();

          return (
            <Card key={card.key} className="cursor-pointer border shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
                <div className="rounded-full border p-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <OrderTable
          title="Recent Orders"
          orders={recentOrders}
          showViewAllLink
        />
      </div>
    </div>
  );
}
