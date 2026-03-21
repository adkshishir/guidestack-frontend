'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as apiLogin,
  loginWithTwoFactor as apiLoginWithTwoFactor,
  register as apiRegister,
  logout as apiLogout,
  AuthResponse,
} from '@/lib/api/auth';
import { getUser, getToken } from '@/lib/api/client';
import { LoginDto, RegisterDto } from '@/lib/api/auth';

interface User {
  id: number;
  email: string;
  role: string;
  status: string;
  isTwoFactorEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    credentials: LoginDto,
  ) => Promise<{ error?: any; mfaRequired?: boolean; email?: string }>;
  loginWithTwoFactor: (email: string, code: string) => Promise<{ error?: any }>;
  register: (data: RegisterDto) => Promise<{ error?: any }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isAuthor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and token from localStorage on mount
    const storedUser = getUser();
    const storedToken = getToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const handleLogin = async (credentials: LoginDto) => {
    const response = await apiLogin(credentials);

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      if ('mfaRequired' in response.data && response.data.mfaRequired) {
        return { mfaRequired: true, email: response.data.email };
      }

      // Typescript knows this is AuthResponse now if it's not MfaRequiredResponse, but let's be safe
      if ('access_token' in response.data) {
        setUser(response.data.user);
        setToken(response.data.access_token);
      }
    }

    return {};
  };

  const handleLoginWithTwoFactor = async (email: string, code: string) => {
    const response = await apiLoginWithTwoFactor(email, code);

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setUser(response.data.user);
      setToken(response.data.access_token);
    }

    return {};
  };

  const handleRegister = async (data: RegisterDto) => {
    const response = await apiRegister(data);

    if (response.error) {
      return { error: response.error };
    }

    if (response.data) {
      setUser(response.data.user);
      setToken(response.data.access_token);
    }

    return {};
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login: handleLogin,
    loginWithTwoFactor: handleLoginWithTwoFactor,
    register: handleRegister,
    logout: handleLogout,
    isAuthenticated: !!user && !!token,
    // give all access to admin
    isAdmin: true,
    isEditor: true,
    isAuthor: true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
