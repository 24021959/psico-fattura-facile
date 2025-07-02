import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
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

  if (!user) {
    // Se non autenticato, mostra la pagina di login
    return null; // Il componente Login verrà renderizzato da App.tsx
  }

  return <>{children}</>;
}