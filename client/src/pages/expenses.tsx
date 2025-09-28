import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AddExpenseModal from "@/components/expenses/add-expense-modal";
import EditExpenseModal from "@/components/expenses/edit-expense-modal";
import ExpenseTable from "@/components/expenses/expense-table";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Expense } from "@shared/schema";

interface ExpenseWithEmployee extends Expense {
  employeeName: string;
}

export default function Expenses() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithEmployee | null>(null);
  const { toast } = useToast();

  const { data: expenses = [], isLoading } = useQuery<ExpenseWithEmployee[]>({
    queryKey: ["/api/expenses"],
  });

  // Handle unauthorized errors at page level
  useEffect(() => {
    if (!isLoading && !expenses) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [expenses, isLoading, toast]);

  const deleteMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
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
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div data-testid="loading-expenses">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Expenses</h2>
            <p className="text-muted-foreground">Track business expenses</p>
          </div>
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
    <div data-testid="expenses-section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Expenses</h2>
          <p className="text-muted-foreground">Track business expenses</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
          data-testid="button-add-expense"
        >
          <i className="fas fa-plus"></i>
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Expenses Table */}
      <ExpenseTable 
        expenses={expenses}
        onDelete={(expenseId: string) => deleteMutation.mutate(expenseId)}
        onEdit={(expense: ExpenseWithEmployee) => {
          setSelectedExpense(expense);
          setIsEditModalOpen(true);
        }}
        isDeleting={deleteMutation.isPending}
      />

      <AddExpenseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <EditExpenseModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />
    </div>
  );
}