'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TenantInfo, UserProfile } from '@/types/chat';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  tenantId: string;
  activeTenant: TenantInfo;
  availableTenants: TenantInfo[];
  isAuthenticated: boolean;
  login: (email: string, password?: string, chosenTenantId?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string, tenantName?: string) => Promise<boolean>;
  logout: () => void;
  switchTenant: (newTenantId: string) => void;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const DEFAULT_TENANTS: TenantInfo[] = [
  {
    id: 'tenant_acme_01',
    name: 'Acme Enterprise',
    plan: 'Enterprise',
    documentsCount: 42,
    vectorsCount: 18450,
    graphNodesCount: 3200,
  },
  {
    id: 'tenant_apex_02',
    name: 'Apex AI Research',
    plan: 'Pro',
    documentsCount: 15,
    vectorsCount: 6200,
    graphNodesCount: 1100,
  },
  {
    id: 'tenant_nexus_03',
    name: 'Nexus Dynamics',
    plan: 'Starter',
    documentsCount: 5,
    vectorsCount: 1500,
    graphNodesCount: 450,
  },
];

const DEFAULT_USER: UserProfile = {
  id: 'usr_artin_99',
  email: 'admin@acme-corp.ai',
  name: 'Alex Rivera',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  tenant_id: 'tenant_acme_01',
  role: 'Admin',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: 'artin_graphrag_token',
  USER: 'artin_graphrag_user',
  TENANT_ID: 'artin_graphrag_tenant_id',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [token, setToken] = useState<string | null>('jwt_mock_token_secure_artin_2026');
  const [tenantId, setTenantId] = useState<string>('tenant_acme_01');
  const [availableTenants] = useState<TenantInfo[]>(DEFAULT_TENANTS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const savedTenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);

      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedTenantId) setTenantId(savedTenantId);
    } catch {
      // Ignore localStorage read errors in SSR/strict envs
    }
  }, []);

  const activeTenant = availableTenants.find((t) => t.id === tenantId) || {
    id: tenantId,
    name: 'Default Workspace',
    plan: 'Pro',
    documentsCount: 0,
    vectorsCount: 0,
    graphNodesCount: 0,
  };

  const login = async (email: string, password?: string, chosenTenantId?: string): Promise<boolean> => {
    const selectedTenant = chosenTenantId || tenantId || 'tenant_acme_01';
    const mockToken = `jwt_token_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const loggedInUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name: email.split('@')[0].replace('.', ' ') || 'SaaS User',
      avatarUrl: DEFAULT_USER.avatarUrl,
      tenant_id: selectedTenant,
      role: 'Admin',
    };

    setUser(loggedInUser);
    setToken(mockToken);
    setTenantId(selectedTenant);

    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      localStorage.setItem(STORAGE_KEYS.TENANT_ID, selectedTenant);
    } catch {}

    setIsAuthModalOpen(false);
    return true;
  };

  const register = async (name: string, email: string, password?: string, tenantName?: string): Promise<boolean> => {
    const newTenantId = `tenant_${(tenantName || 'org').toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;
    const mockToken = `jwt_token_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name,
      avatarUrl: DEFAULT_USER.avatarUrl,
      tenant_id: newTenantId,
      role: 'Admin',
    };

    setUser(newUser);
    setToken(mockToken);
    setTenantId(newTenantId);

    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.TENANT_ID, newTenantId);
    } catch {}

    setIsAuthModalOpen(false);
    return true;
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
  }, []);

  const switchTenant = (newTenantId: string) => {
    setTenantId(newTenantId);
    if (user) {
      const updatedUser = { ...user, tenant_id: newTenantId };
      setUser(updatedUser);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        localStorage.setItem(STORAGE_KEYS.TENANT_ID, newTenantId);
      } catch {}
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tenantId,
        activeTenant,
        availableTenants,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        switchTenant,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
