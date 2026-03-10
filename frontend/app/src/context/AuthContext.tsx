"use client";
import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { authService, type AuthUser, type LoginRequest, type RegisterRequest } from '@/services/authService';
import type { Role } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role) {
      currentUser.role = currentUser.role.toLowerCase() as Role;
    }
    setUser(currentUser);
    setToken(authService.getToken());
    setIsReady(true);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(data);
      if (res.user && res.user.role) {
        res.user.role = res.user.role.toLowerCase() as Role;
      }
      setUser(res.user);
      setToken(res.token);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login gagal';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(data);
      if (res.user && res.user.role) {
        res.user.role = res.user.role.toLowerCase() as Role;
      }
      setUser(res.user);
      setToken(res.token);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registrasi gagal';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    error,
    loading,
  }), [user, token, login, register, logout, error, loading]);

  if (!isReady) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
