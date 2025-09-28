import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export default function Header() {
  const { user } = useAuth() as { user?: User };
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return "U";
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50" data-testid="header">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
                <i className="fas fa-receipt text-primary-foreground"></i>
              </div>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">BillCollect Pro</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Offline Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-2" data-testid="online-status">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <span className="text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                  {user?.firstName && user?.lastName ? 
                    `${user.firstName} ${user.lastName}` : 
                    user?.email?.split('@')[0] || 'User'
                  }
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                  {user?.email || ''}
                </p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium"
                  data-testid="button-user-profile"
                >
                  {getInitials(user?.firstName, user?.lastName)}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2" data-testid="dropdown-profile">
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-destructive hover:bg-accent"
                      data-testid="button-sign-out"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
