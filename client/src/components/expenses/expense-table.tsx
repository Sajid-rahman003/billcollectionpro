import { Button } from "@/components/ui/button";
import type { Expense } from "@shared/schema";

interface ExpenseWithEmployee extends Expense {
  employeeName: string;
}

interface ExpenseTableProps {
  expenses: ExpenseWithEmployee[];
  onDelete: (expenseId: string) => void;
  onEdit: (expense: ExpenseWithEmployee) => void;
  isDeleting: boolean;
}

export default function ExpenseTable({ expenses, onDelete, onEdit, isDeleting }: ExpenseTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-credit-card text-muted-foreground text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Expenses Found</h3>
        <p className="text-muted-foreground">Add your first expense to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-expenses">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Expense ID</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Employee</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-border hover:bg-accent/50" data-testid={`row-expense-${expense.id}`}>
                <td className="p-4 font-medium text-foreground" data-testid={`text-expense-number-${expense.id}`}>
                  {expense.expenseNumber}
                </td>
                <td className="p-4 text-foreground" data-testid={`text-expense-description-${expense.id}`}>
                  {expense.description}
                </td>
                <td className="p-4 text-muted-foreground" data-testid={`text-expense-category-${expense.id}`}>
                  {expense.category}
                </td>
                <td className="p-4 text-foreground" data-testid={`text-expense-amount-${expense.id}`}>
                  ₹{parseFloat(expense.amount).toLocaleString()}
                </td>
                <td className="p-4 text-muted-foreground" data-testid={`text-expense-date-${expense.id}`}>
                  {formatDate(expense.expenseDate.toString())}
                </td>
                <td className="p-4 text-muted-foreground" data-testid={`text-expense-employee-${expense.id}`}>
                  {expense.employeeName || 'N/A'}
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-2 hover:bg-accent rounded-lg text-primary"
                      onClick={() => onEdit(expense)}
                      data-testid={`button-edit-expense-${expense.id}`}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(expense.id)}
                      disabled={isDeleting}
                      className="p-2 hover:bg-accent rounded-lg text-destructive"
                      data-testid={`button-delete-expense-${expense.id}`}
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