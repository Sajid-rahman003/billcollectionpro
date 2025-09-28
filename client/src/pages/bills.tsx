import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Bill } from "@shared/schema";

interface BillWithCustomer extends Bill {
  customerName: string;
}

export default function Bills() {
  const { toast } = useToast();
  const { data: bills = [], isLoading } = useQuery<BillWithCustomer[]>({
    queryKey: ["/api/bills"],
  });

  // Handle unauthorized errors at page level
  useEffect(() => {
    if (!isLoading && !bills) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [bills, isLoading, toast]);

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: "px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800",
      due: "px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
      overdue: "px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
    };
    return badges[status as keyof typeof badges] || badges.due;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div data-testid="loading-bills">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Bills</h2>
          <p className="text-muted-foreground">View all bill records</p>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden animate-pulse">
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="bills-section">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Bills</h2>
        <p className="text-muted-foreground">View all bill records</p>
      </div>

      {bills.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-invoice-dollar text-muted-foreground text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Bills Found</h3>
          <p className="text-muted-foreground">No bill records available at the moment.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Bill ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill: BillWithCustomer) => (
                  <tr key={bill.id} className="border-b border-border hover:bg-accent/50" data-testid={`row-bill-${bill.id}`}>
                    <td className="p-4 font-medium text-foreground" data-testid={`text-bill-number-${bill.id}`}>
                      {bill.billNumber}
                    </td>
                    <td className="p-4 text-foreground" data-testid={`text-bill-customer-${bill.id}`}>
                      {bill.customerName || 'Unknown'}
                    </td>
                    <td className="p-4 text-foreground" data-testid={`text-bill-amount-${bill.id}`}>
                      ₹{parseFloat(bill.amount).toLocaleString()}
                    </td>
                    <td className="p-4 text-muted-foreground" data-testid={`text-bill-date-${bill.id}`}>
                      {formatDate(bill.billDate.toString())}
                    </td>
                    <td className="p-4 text-muted-foreground" data-testid={`text-bill-due-date-${bill.id}`}>
                      {formatDate(bill.dueDate.toString())}
                    </td>
                    <td className="p-4">
                      <span className={getStatusBadge(bill.status)} data-testid={`status-bill-${bill.id}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
