'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { getExistingGuestSessionId, clearGuestSessionId } from '@/lib/guestSession';
import { migrateGuestSession } from '@/lib/api';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface LoginProps {
  onSuccess?: (userToken?: string) => void;
  tenantId?: string;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, tenantId = 'tenant_acme_01' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Helper to perform session migration if a guest session exists
   */
  const handleSessionMigration = async (authToken: string) => {
    const guestSessionId = getExistingGuestSessionId();
    if (!guestSessionId) return;

    setIsMigrating(true);
    try {
      const result = await migrateGuestSession(guestSessionId, authToken);
      if (result.success) {
        clearGuestSessionId();
        setSuccessMessage('Welcome back! Your guest chat history has been saved to your account.');
      }
    } catch (err: unknown) {
      console.warn('Session migration warning:', err);
    } finally {
      setIsMigrating(false);
    }
  };

  /**
   * Handle Email/Password Credentials Login
   */
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        tenant_id: tenantId,
      });

      if (res?.error) {
        setError(res.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // If login succeeded, attempt immediate session migration
      const token = `token_${Date.now()}`; // Or extracted from session callback
      await handleSessionMigration(token);

      if (onSuccess) {
        onSuccess(token);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Google OAuth Sign-In
   */
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Note: For OAuth redirect flows, the session migration hook (useChatSession)
      // will automatically pick up the guest_session_id from cookies upon redirect callback!
      await signIn('google', {
        callbackUrl: window.location.origin,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card border border-border rounded-2xl shadow-xl">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Sign In to Save Chat</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Continue as an authenticated user to persist and search your GraphRAG chat history.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isMigrating && (
        <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs flex items-center gap-2 animate-pulse">
          <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
          <span>Migrating guest chat history to your account...</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Work Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@enterprise.ai"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isMigrating}
          className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Sign In & Save Chat</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground font-medium uppercase">Or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading || isMigrating}
        className="w-full py-2.5 px-3 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>
    </div>
  );
};
