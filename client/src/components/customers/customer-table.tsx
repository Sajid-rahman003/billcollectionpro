import { Button } from "@/components/ui/button";
import type { Customer } from "@shared/schema";

interface CustomerTableProps {
  customers: Customer[];
  onDelete: (customerId: string) => void;
  onEdit: (customer: Customer) => void;
  isDeleting: boolean;
}

export default function CustomerTable({ customers, onDelete, onEdit, isDeleting }: CustomerTableProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      paid: "px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800",
      due: "px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
      overdue: "px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800",
      "temporary close": "px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
    };
    return badges[status as keyof typeof badges] || badges.due;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (customers.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-users text-muted-foreground text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Customers Found</h3>
        <p className="text-muted-foreground">Add your first customer to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-customers">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Total Bills</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Outstanding</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-border hover:bg-accent/50" data-testid={`row-customer-${customer.id}`}>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium" data-testid={`text-customer-initials-${customer.id}`}>
                        {getInitials(customer.name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid={`text-customer-name-${customer.id}`}>
                        {customer.name}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-customer-id-${customer.id}`}>
                        ID: {customer.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-foreground" data-testid={`text-customer-phone-${customer.id}`}>
                    {customer.phone || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`text-customer-package-${customer.id}`}>
                    Package: ₹{parseFloat(customer.package?.toString() || '0').toLocaleString()}
                  </p>
                </td>
                <td className="p-4 text-foreground" data-testid={`text-customer-total-bills-${customer.id}`}>
                  ₹{parseFloat(customer.totalBills?.toString() || '0').toLocaleString()}
                </td>
                <td className="p-4 text-foreground" data-testid={`text-customer-outstanding-${customer.id}`}>
                  ₹{parseFloat(customer.outstanding?.toString() || '0').toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={getStatusBadge(customer.status)} data-testid={`status-customer-${customer.id}`}>
                    {customer.status === 'overdue' ? 'Free' : customer.status === 'temporary close' ? 'Temporary Close' : customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-2 hover:bg-accent rounded-lg text-primary"
                      onClick={() => onEdit(customer)}
                      data-testid={`button-edit-customer-${customer.id}`}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(customer.id)}
                      disabled={isDeleting}
                      className="p-2 hover:bg-accent rounded-lg text-destructive"
                      data-testid={`button-delete-customer-${customer.id}`}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}