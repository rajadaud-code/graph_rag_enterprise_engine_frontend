'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { TenantInfo, UserProfile } from '@/types/chat';
import { resetGuestSessionId } from '@/lib/guestSession';

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
  signInWithGoogle: () => Promise<void>;
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

const STORAGE_KEYS = {
  TOKEN: 'graphrag_auth_token',
  USER: 'graphrag_auth_user',
  TENANT_ID: 'graphrag_tenant_id',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: nextAuthSession } = useSession();

  // Initial state: Start as Guest (null) until session or localStorage proves authenticated
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>('tenant_acme_01');
  const [availableTenants] = useState<TenantInfo[]>(DEFAULT_TENANTS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // 1. Sync from NextAuth session (e.g. Google Sign-In or Credentials)
  useEffect(() => {
    if (nextAuthSession?.user?.email) {
      const email = nextAuthSession.user.email;
      const name = nextAuthSession.user.name || email.split('@')[0];
      const avatarUrl = nextAuthSession.user.image || undefined;
      const customToken =
        (nextAuthSession.user as { accessToken?: string }).accessToken ||
        `jwt_oauth_${Date.now()}`;
      const customTenant =
        (nextAuthSession.user as { tenant_id?: string }).tenant_id || tenantId || 'tenant_acme_01';

      const authenticatedUser: UserProfile = {
        id: (nextAuthSession.user as { id?: string }).id || `usr_${email}`,
        email,
        name,
        avatarUrl,
        tenant_id: customTenant,
        role: 'Admin',
      };

      setUser(authenticatedUser);
      setToken(customToken);
      setTenantId(customTenant);

      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, customToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authenticatedUser));
        localStorage.setItem(STORAGE_KEYS.TENANT_ID, customTenant);
      } catch {}
    }
  }, [nextAuthSession, tenantId]);

  // 2. Load from localStorage on mount (for persistent credentials sessions)
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const savedTenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (savedTenantId) setTenantId(savedTenantId);
      }
    } catch {
      // Ignore localStorage read errors in SSR
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

  /**
   * Handle standard Email / Password Sign In
   */
  const login = async (email: string, password?: string, chosenTenantId?: string): Promise<boolean> => {
    const selectedTenant = chosenTenantId || tenantId || 'tenant_acme_01';
    const generatedToken = `jwt_token_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const loggedInUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name: email.split('@')[0].replace('.', ' ') || 'Enterprise User',
      avatarUrl: undefined,
      tenant_id: selectedTenant,
      role: 'Admin',
    };

    setUser(loggedInUser);
    setToken(generatedToken);
    setTenantId(selectedTenant);

    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, generatedToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      localStorage.setItem(STORAGE_KEYS.TENANT_ID, selectedTenant);
    } catch {}

    setIsAuthModalOpen(false);
    return true;
  };

  /**
   * Handle User Registration
   */
  const register = async (name: string, email: string, password?: string, tenantName?: string): Promise<boolean> => {
    const newTenantId = `tenant_${(tenantName || 'org').toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 6)}`;
    const generatedToken = `jwt_token_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name,
      avatarUrl: undefined,
      tenant_id: newTenantId,
      role: 'Admin',
    };

    setUser(newUser);
    setToken(generatedToken);
    setTenantId(newTenantId);

    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, generatedToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.TENANT_ID, newTenantId);
    } catch {}

    setIsAuthModalOpen(false);
    return true;
  };

  /**
   * Handle Google OAuth Sign In
   */
  const signInWithGoogle = async (): Promise<void> => {
    await signIn('google', {
      callbackUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
    });
  };

  /**
   * Clean Logout:
   * 1. Clears current user and token
   * 2. Clears localStorage
   * 3. Signs out of NextAuth (Google/Credentials session)
   * 4. Resets the guest session ID so guest chat starts cleanly
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    } catch {}

    // Sign out from NextAuth session
    signOut({ redirect: false }).catch(() => {});

    // Reset guest session with a clean ID for anonymous browsing
    resetGuestSessionId();
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
        signInWithGoogle,
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
