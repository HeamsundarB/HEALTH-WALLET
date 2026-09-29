import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserOut, loginApi, logoutApi, fetchMeApi } from '../services/authApi';

interface AuthContextType {
  user: UserOut | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserOut>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserOut | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hw_access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('hw_refresh_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('hw_access_token');
      if (savedToken) {
        try {
          const userData = await fetchMeApi(savedToken);
          setUser(userData);
          setToken(savedToken);
        } catch (err) {
          console.warn('Saved token expired or invalid:', err);
          localStorage.removeItem('hw_access_token');
          localStorage.removeItem('hw_refresh_token');
          setToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<UserOut> => {
    const res = await loginApi(email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('hw_access_token', res.access_token);
    if (res.refresh_token) {
      setRefreshToken(res.refresh_token);
      localStorage.setItem('hw_refresh_token', res.refresh_token);
    }
    return res.user;
  };

  const logout = async () => {
    if (refreshToken) {
      await logoutApi(refreshToken);
    }
    localStorage.removeItem('hw_access_token');
    localStorage.removeItem('hw_refresh_token');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles: string[]): boolean => {
    if (!user || !user.roles) return false;
    if (user.roles.includes('SYSTEM_ADMIN')) return true;
    return user.roles.some((role) => allowedRoles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
