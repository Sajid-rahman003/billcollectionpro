import { useState } from "react";
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

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    package: "0",
    phone: "",
    address: "",
    status: "due" as "paid" | "due" | "overdue" | "temporary close",
  });

  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (customerData: typeof formData) => {
      const response = await apiRequest("POST", "/api/customers", customerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      setFormData({ name: "", package: "0", phone: "", address: "", status: "due" });
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
        description: "Failed to add customer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    const stringValue = field === "package" && typeof value === "number" ? value.toString() : value;
    setFormData(prev => ({ ...prev, [field]: stringValue }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-add-customer">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Add New Customer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-customer">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Customer Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter customer name"
              required
              data-testid="input-customer-name"
            />
          </div>
          
          <div>
            <Label htmlFor="package" className="block text-sm font-medium text-foreground mb-2">
              Package Amount
            </Label>
            <Input
              id="package"
              type="number"
              min="0"
              step="0.01"
              value={formData.package}
              onChange={(e) => handleInputChange("package", parseFloat(e.target.value) || 0)}
              placeholder="Enter package amount"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              data-testid="input-customer-package"
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
              data-testid="input-customer-phone"
            />
          </div>
          
          <div>
            <Label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value: "paid" | "due" | "overdue" | "temporary close") => handleInputChange("status", value)}>
              <SelectTrigger id="status" data-testid="select-customer-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="due">Due</SelectItem>
                <SelectItem value="overdue">Free</SelectItem>
                <SelectItem value="temporary close">Temporary Close</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={3}
              placeholder="Enter address"
              data-testid="input-customer-address"
            />
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
              data-testid="button-add-customer"
            >
              {mutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}