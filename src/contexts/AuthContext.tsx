import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  role: 'lawyer' | 'assistant' | 'client';
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with lawyer user for demo purposes
    const initializeAuth = async () => {
      try {
        const mockUser: User = {
          id: '1',
          email: 'lawyer@test.com',
          role: 'lawyer',
          first_name: 'Legal',
          last_name: 'Expert'
        };
        
        // Set the current user context in Supabase for RLS policies
        await supabase.rpc('set_config', {
          setting_name: 'app.current_user_id',
          setting_value: '1'
        } as any);
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      // Set Supabase context for RLS in an async function
      const setUserContext = async () => {
        try {
          await supabase.rpc('set_config', {
            setting_name: 'app.current_user_id',
            setting_value: user.id
          } as any);
        } catch (error) {
          console.error('Error setting user context:', error);
        }
      };
      setUserContext();
      setIsLoading(false);
    } else {
      // Initialize with demo user
      initializeAuth();
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication for testing - in production this would validate against database
    if (email === 'lawyer@test.com' && password === 'password123') {
      try {
        const mockUser: User = {
          id: '1',
          email: 'lawyer@test.com',
          role: 'lawyer',
          first_name: 'Legal',
          last_name: 'Expert'
        };
        
        // Set the current user context in Supabase for RLS policies
        await supabase.rpc('set_config', {
          setting_name: 'app.current_user_id',
          setting_value: '1'
        } as any);
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};