import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Pazienti from "./pages/Pazienti";
import Prestazioni from "./pages/Prestazioni";
import Fatture from "./pages/Fatture";
import Statistiche from "./pages/Statistiche";
import Calendario from "./pages/Calendario";
import Impostazioni from "./pages/Impostazioni";
import DiarioClinico from "./pages/DiarioClinico";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import Support from "./pages/Support";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-primary-foreground font-bold text-2xl">ψ</span>
          </div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Index /> : <Welcome />} />
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
      <Route path="/calendario" element={
        <ProtectedRoute>
          <Calendario />
        </ProtectedRoute>
      } />
      <Route path="/diario-clinico" element={
        <ProtectedRoute>
          <DiarioClinico />
        </ProtectedRoute>
      } />
      <Route path="/impostazioni" element={
        <ProtectedRoute>
          <Impostazioni />
        </ProtectedRoute>
      } />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/support" element={
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={<Admin />} />
      {/* Redirect old dashboard route */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={user ? <NotFound /> : <Welcome />} />
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
