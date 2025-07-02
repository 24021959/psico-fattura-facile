import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nome: string, cognome: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simula il controllo dell'autenticazione al caricamento
  useEffect(() => {
    const savedUser = localStorage.getItem('fatturaPsicologo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('fatturaPsicologo_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simula chiamata API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock della validazione - in produzione sarebbe una chiamata API reale
    if (email === 'demo@psicologo.it' && password === 'demo123') {
      const userData: User = {
        id: '1',
        email: email,
        nome: 'Maria',
        cognome: 'Rossi',
        isVerified: true
      };
      
      setUser(userData);
      localStorage.setItem('fatturaPsicologo_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, nome: string, cognome: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simula chiamata API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock della registrazione
    const userData: User = {
      id: Date.now().toString(),
      email: email,
      nome: nome,
      cognome: cognome,
      isVerified: false
    };
    
    setUser(userData);
    localStorage.setItem('fatturaPsicologo_user', JSON.stringify(userData));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fatturaPsicologo_user');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Simula invio email di reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const value = {
    user,
    login,
    register,
    logout,
    resetPassword,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}