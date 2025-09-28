import React, { useEffect, useState } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Customers from "@/pages/customers";
import Bills from "@/pages/bills";
import Expenses from "@/pages/expenses";
import Employees from "@/pages/employees";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Auth from "@/pages/auth";

// Simple test component to verify React is working
function TestComponent() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>React is working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      {/* Adding a comment to force a reload */}
    </div>
  );
}

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/auth" component={Auth} />
          <Route path="/" component={Auth} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <div className="min-h-screen bg-background">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                <Switch>
                  <Route path="/" component={Home} exact />
                  <Route path="/customers" component={Customers} />
                  <Route path="/bills" component={Bills} />
                  <Route path="/expenses" component={Expenses} />
                  <Route path="/employees" component={Employees} />
                  <Route path="/test" component={TestComponent} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          </div>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <div className={isOnline ? '' : 'offline'}>
            <Toaster />
            <AppRouter />
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;