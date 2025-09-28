import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Employee } from "@shared/schema";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export default function EditEmployeeModal({ isOpen, onClose, employee }: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    employeeNumber: "",
    position: "",
    email: "",
    phone: "",
    salary: 0,
    joinDate: new Date().toISOString().split('T')[0],
    status: "active" as "active" | "inactive",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        employeeNumber: employee.employeeNumber || "",
        position: employee.position || "",
        email: employee.email || "",
        phone: employee.phone || "",
        salary: employee.salary ? parseFloat(employee.salary.toString()) : 0,
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: employee.status || "active",
      });
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: async (employeeData: typeof formData) => {
      if (!employee) throw new Error("No employee selected");
      // Convert numeric fields to strings for the API
      const dataToSend = {
        ...employeeData,
        salary: employeeData.salary.toString()
      };
      const response = await apiRequest("PUT", `/api/employees/${employee.id}`, dataToSend);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
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
        description: "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Employee name is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.employeeNumber.trim()) {
      toast({
        title: "Error",
        description: "Employee number is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.position.trim()) {
      toast({
        title: "Error",
        description: "Employee position is required",
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
      <DialogContent className="sm:max-w-md" data-testid="modal-edit-employee">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Edit Employee
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-edit-employee">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Employee Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter employee name"
              required
              data-testid="input-employee-name"
            />
          </div>
          
          <div>
            <Label htmlFor="employeeNumber" className="block text-sm font-medium text-foreground mb-2">
              Employee Number *
            </Label>
            <Input
              id="employeeNumber"
              type="text"
              value={formData.employeeNumber}
              onChange={(e) => handleInputChange("employeeNumber", e.target.value)}
              placeholder="Enter employee number"
              required
              data-testid="input-employee-number"
            />
          </div>
          
          <div>
            <Label htmlFor="position" className="block text-sm font-medium text-foreground mb-2">
              Position *
            </Label>
            <Input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              placeholder="Enter position"
              required
              data-testid="input-employee-position"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              data-testid="input-employee-email"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              data-testid="input-employee-phone"
            />
          </div>
          
          <div>
            <Label htmlFor="salary" className="block text-sm font-medium text-foreground mb-2">
              Salary
            </Label>
            <Input
              id="salary"
              type="number"
              min="0"
              step="0.01"
              value={formData.salary}
              onChange={(e) => handleInputChange("salary", parseFloat(e.target.value) || 0)}
              placeholder="Enter salary"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              data-testid="input-employee-salary"
            />
          </div>
          
          <div>
            <Label htmlFor="joinDate" className="block text-sm font-medium text-foreground mb-2">
              Join Date *
            </Label>
            <Input
              id="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={(e) => handleInputChange("joinDate", e.target.value)}
              required
              data-testid="input-employee-join-date"
            />
          </div>
          
          <div>
            <Label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value: "active" | "inactive") => handleInputChange("status", value)}>
              <SelectTrigger id="status" data-testid="select-employee-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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