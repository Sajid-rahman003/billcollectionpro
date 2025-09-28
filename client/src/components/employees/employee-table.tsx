import { Button } from "@/components/ui/button";
import type { Employee } from "@shared/schema";

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (employeeId: string) => void;
  onEdit: (employee: Employee) => void;
  isDeleting: boolean;
}

export default function EmployeeTable({ employees, onDelete, onEdit, isDeleting }: EmployeeTableProps) {
  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? "px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
      : "px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (employees.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-user-tie text-muted-foreground text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Employees Found</h3>
        <p className="text-muted-foreground">Add your first employee to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-employees">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Employee</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Position</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Join Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Salary</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b border-border hover:bg-accent/50" data-testid={`row-employee-${employee.id}`}>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium" data-testid={`text-employee-initials-${employee.id}`}>
                        {getInitials(employee.name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid={`text-employee-name-${employee.id}`}>
                        {employee.name}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-employee-number-${employee.id}`}>
                        {employee.employeeNumber}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-foreground" data-testid={`text-employee-position-${employee.id}`}>
                  {employee.position}
                </td>
                <td className="p-4">
                  <p className="text-foreground" data-testid={`text-employee-phone-${employee.id}`}>
                    {employee.phone || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`text-employee-email-${employee.id}`}>
                    {employee.email || 'N/A'}
                  </p>
                </td>
                <td className="p-4 text-muted-foreground" data-testid={`text-employee-join-date-${employee.id}`}>
                  {formatDate(employee.joinDate.toString())}
                </td>
                <td className="p-4 text-foreground" data-testid={`text-employee-salary-${employee.id}`}>
                  ₹{parseFloat(employee.salary || '0').toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={getStatusBadge(employee.status)} data-testid={`status-employee-${employee.id}`}>
                    {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-2 hover:bg-accent rounded-lg text-primary"
                      onClick={() => onEdit(employee)}
                      data-testid={`button-edit-employee-${employee.id}`}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(employee.id)}
                      disabled={isDeleting}
                      className="p-2 hover:bg-accent rounded-lg text-destructive"
                      data-testid={`button-delete-employee-${employee.id}`}
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