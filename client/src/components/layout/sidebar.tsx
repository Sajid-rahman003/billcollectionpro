import { useLocation } from "wouter";
import { Link } from "wouter";

const navItems = [
  { path: "/", icon: "fas fa-tachometer-alt", label: "Dashboard" },
  { path: "/customers", icon: "fas fa-users", label: "Customers" },
  { path: "/bills", icon: "fas fa-file-invoice-dollar", label: "Bills" },
  { path: "/expenses", icon: "fas fa-credit-card", label: "Expenses" },
  { path: "/employees", icon: "fas fa-user-tie", label: "Employees" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-16 overflow-y-auto hidden lg:block" data-testid="sidebar">
      <nav className="p-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
