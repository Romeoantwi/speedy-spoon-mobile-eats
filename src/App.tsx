
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Customer from "./pages/Customer";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminSetup from "./components/AdminSetup";
import InstallPrompt from "./components/InstallPrompt";
import { AdminProvider } from "@/hooks/useAdminAuth";

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
                <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
                <Route path="/admin-setup" element={<AdminSetup />} />
                {/* Hidden admin route - not linked anywhere publicly */}
                <Route path="/restaurant-admin" element={<AdminLogin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <InstallPrompt />
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
