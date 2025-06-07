
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Customer from "./pages/Customer";
import DriverDashboard from "./pages/DriverDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import NotFound from "./pages/NotFound";
import DriverSignup from "./components/DriverSignup";
import { AdminProvider } from "@/hooks/useAdminAuth";
import AdminSetup from "@/components/AdminSetup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/driver-dashboard" element={<DriverDashboard />} />
                <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
                <Route path="/driver-signup" element={<DriverSignup />} />
                <Route path="/admin-setup" element={<AdminSetup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
