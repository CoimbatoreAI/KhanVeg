import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import VegStore from "@/pages/vegetables/VegStore";
import VegCart from "@/pages/vegetables/VegCart";
import VegCheckout from "@/pages/vegetables/VegCheckout";
import VegProductDetail from "@/pages/vegetables/VegProductDetail";
import CoffeeStore from "@/pages/coffee/CoffeeStore";
import CoffeeCart from "@/pages/coffee/CoffeeCart";
import CoffeeCheckout from "@/pages/coffee/CoffeeCheckout";
import CoffeeProductDetail from "@/pages/coffee/CoffeeProductDetail";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import StaffPortal from "@/pages/StaffPortal";
import OrderTracking from "@/pages/OrderTracking";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Profile from "@/pages/auth/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/vegetables" element={<VegStore />} />
            <Route path="/vegetables/products" element={<VegStore />} />
            <Route path="/vegetables/cart" element={<VegCart />} />
            <Route path="/vegetables/checkout" element={<VegCheckout />} />
            <Route path="/vegetables/product/:id" element={<VegProductDetail />} />
            <Route path="/coffee" element={<CoffeeStore />} />
            <Route path="/coffee/products" element={<CoffeeStore />} />
            <Route path="/coffee/product/:id" element={<CoffeeProductDetail />} />
            <Route path="/coffee/cart" element={<CoffeeCart />} />
            <Route path="/coffee/checkout" element={<CoffeeCheckout />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/staff" element={<StaffPortal />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
