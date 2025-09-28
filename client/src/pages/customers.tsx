import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerTable from "@/components/customers/customer-table";
import AddCustomerModal from "@/components/customers/add-customer-modal";
import EditCustomerModal from "@/components/customers/edit-customer-modal";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { Customer } from "@shared/schema";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Customers() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Handle unauthorized errors at page level
  useEffect(() => {
    if (!isLoading && !customers) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [customers, isLoading, toast]);

  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.package?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate customer status distribution
  const statusCounts = customers.reduce((acc: Record<string, number>, customer: Customer) => {
    acc[customer.status] = (acc[customer.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: ['Paid', 'Due', 'Free', 'Temporary Close'],
    datasets: [{
      data: [
        statusCounts.paid || 0,
        statusCounts.due || 0,
        statusCounts.overdue || 0,
        statusCounts['temporary close'] || 0
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const
      }
    }
  };

  if (isLoading) {
    return (
      <div data-testid="loading-customers">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Customers</h2>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="customers-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Customers</h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
          data-testid="button-add-customer"
        >
          <i className="fas fa-plus"></i>
          <span>Add Customer</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input 
              type="text" 
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              data-testid="input-search-customers"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="due">Due</SelectItem>
              <SelectItem value="overdue">Free</SelectItem>
              <SelectItem value="temporary close">Temporary Close</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer Status Chart */}
      {customers.length > 0 && (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Customer Payment Status</h3>
          <div className="h-48">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Customers Table */}
      <CustomerTable 
        customers={filteredCustomers as any}
        onDelete={(customerId: string) => deleteMutation.mutate(customerId)}
        onEdit={(customer: any) => {
          setSelectedCustomer(customer as Customer);
          setIsEditModalOpen(true);
        }}
        isDeleting={deleteMutation.isPending}
      />

      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <EditCustomerModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />
    </div>
  );
}
