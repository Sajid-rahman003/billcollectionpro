import { useQuery } from "@tanstack/react-query";
import StatsCards from "@/components/dashboard/stats-cards";
import Charts from "@/components/dashboard/charts";

interface DashboardStats {
  totalCollections: number;
  totalExpenses: number;
  activeCustomers: number;
  pendingBills: number;
  customerStatusCounts: { paid: number; due: number; overdue: number };
  lastCollectedBill: { customerName: string; amount: number; billNumber: string } | null;
}

export default function Home() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div data-testid="loading-dashboard">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your bill collection business</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-xl shadow-sm border border-border animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-section">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your bill collection business</p>
      </div>

      <StatsCards stats={stats} />
      <Charts stats={stats} />

      {/* Recent Activity */}
      {stats?.lastCollectedBill && (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Last Collected Bill</h3>
          <div className="flex items-center space-x-4 p-4 bg-accent rounded-lg">
            <div className="bg-green-100 p-3 rounded-full">
              <i className="fas fa-check text-green-600"></i>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground" data-testid="text-last-bill-customer">
                {stats.lastCollectedBill.customerName}
              </p>
              <p className="text-muted-foreground text-sm">
                Bill #{stats.lastCollectedBill.billNumber} • Amount: ₹{stats.lastCollectedBill.amount.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-xs">Recently collected</p>
            </div>
            <div className="text-green-600 font-bold" data-testid="text-last-bill-amount">
              ₹{stats.lastCollectedBill.amount.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
