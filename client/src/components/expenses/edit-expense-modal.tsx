import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Expense, Employee } from "@shared/schema";
import { nanoid } from "nanoid";

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export default function EditExpenseModal({ isOpen, onClose, expense }: EditExpenseModalProps) {
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    employeeId: "none",
  });
  const { toast } = useToast();

  // Fetch employees for the dropdown
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        category: expense.category || "",
        amount: expense.amount ? parseFloat(expense.amount.toString()) : 0,
        expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        employeeId: expense.employeeId || "none",
      });
    }
  }, [expense]);

  const mutation = useMutation({
    mutationFn: async (expenseData: typeof formData) => {
      if (!expense) throw new Error("No expense selected");
      
      // Convert "none" to empty string for the API
      const employeeId = expenseData.employeeId === "none" ? "" : expenseData.employeeId;
      
      // Prepare data for the API with proper formatting
      const dataToSend = {
        description: expenseData.description,
        category: expenseData.category,
        amount: expenseData.amount.toString(), // Convert to string for decimal type
        expenseDate: new Date(expenseData.expenseDate).toISOString(), // Convert to ISO string
        employeeId: employeeId
      };
      
      const response = await apiRequest("PUT", `/api/expenses/${expense.id}`, dataToSend);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      onClose();
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
        description: "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Expense description is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.category.trim()) {
      toast({
        title: "Error",
        description: "Expense category is required",
        variant: "destructive",
      });
      return;
    }
    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Expense amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-edit-expense">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Edit Expense
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-edit-expense">
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter expense description"
              rows={3}
              required
              data-testid="input-expense-description"
            />
          </div>
          
          <div>
            <Label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
              Category *
            </Label>
            <Input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              placeholder="Enter expense category"
              required
              data-testid="input-expense-category"
            />
          </div>
          
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
              Amount *
            </Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
              placeholder="Enter expense amount"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
              data-testid="input-expense-amount"
            />
          </div>
          
          <div>
            <Label htmlFor="expenseDate" className="block text-sm font-medium text-foreground mb-2">
              Expense Date *
            </Label>
            <Input
              id="expenseDate"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => handleInputChange("expenseDate", e.target.value)}
              required
              data-testid="input-expense-date"
            />
          </div>
          
          <div>
            <Label htmlFor="employeeId" className="block text-sm font-medium text-foreground mb-2">
              Employee
            </Label>
            <Select value={formData.employeeId} onValueChange={(value) => handleInputChange("employeeId", value)}>
              <SelectTrigger id="employeeId" data-testid="select-expense-employee">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-save-changes"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}