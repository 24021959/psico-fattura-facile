import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Pazienti from "./pages/Pazienti";
import Prestazioni from "./pages/Prestazioni";
import Fatture from "./pages/Fatture";
import Statistiche from "./pages/Statistiche";
import Impostazioni from "./pages/Impostazioni";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/pazienti" element={
        <ProtectedRoute>
          <Pazienti />
        </ProtectedRoute>
      } />
      <Route path="/prestazioni" element={
        <ProtectedRoute>
          <Prestazioni />
        </ProtectedRoute>
      } />
      <Route path="/fatture" element={
        <ProtectedRoute>
          <Fatture />
        </ProtectedRoute>
      } />
      <Route path="/statistiche" element={
        <ProtectedRoute>
          <Statistiche />
        </ProtectedRoute>
      } />
      <Route path="/impostazioni" element={
        <ProtectedRoute>
          <Impostazioni />
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
