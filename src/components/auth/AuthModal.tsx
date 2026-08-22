'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Building2,
  User,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    openAuthModal,
    login,
    register,
    availableTenants,
    tenantId,
  } = useAuth();

  const [email, setEmail] = useState('admin@acme-corp.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Alex Rivera');
  const [selectedTenant, setSelectedTenant] = useState(tenantId || 'tenant_acme_01');
  const [customTenant, setCustomTenant] = useState('');
  const [isCustomTenant, setIsCustomTenant] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isLogin = authMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const activeTenantId = isCustomTenant && customTenant.trim()
      ? customTenant.trim()
      : selectedTenant;

    try {
      if (isLogin) {
        await login(email, password, activeTenantId);
        setSuccess('Successfully authenticated! Connecting to tenant workspace...');
      } else {
        await register(name, email, password, activeTenantId);
        setSuccess('Account created and tenant workspace initialized!');
      }
      setTimeout(() => {
        closeAuthModal();
        setSuccess(null);
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 text-slate-900 dark:text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Visual Illustration Column */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-8 flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute -top-16 -left-16 w-52 h-52 bg-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              AGENTIC RAG
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 font-mono">
              Multi-Tenant
            </span>
          </div>

          {/* Center Graphic */}
          <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
            <div className="relative w-28 h-28 mb-4">
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-blue-400 to-cyan-300 p-0.5 shadow-2xl shadow-cyan-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex items-center justify-center backdrop-blur-xl">
                  <ShieldCheck className="w-14 h-14 text-cyan-300" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-lime-400 text-slate-950 shadow-lg">
                <Lock className="w-4 h-4 font-bold" />
              </div>
            </div>

            <h3 className="text-lg font-bold">Tenant Data Isolation</h3>
            <p className="text-xs text-blue-100/80 mt-1 max-w-xs leading-relaxed">
              Every query, vector chunk, and knowledge graph triple is strictly isolated by <span className="font-mono text-cyan-200 font-bold">tenant_id</span>.
            </p>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 space-y-1.5 pt-4 border-t border-white/10 text-[11px] text-blue-100/70">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
              <span>Redis Semantic Cache Sub-ms Routing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
              <span>Neo4j Graph Triple Traversal</span>
            </div>
          </div>
        </div>

        {/* Right Form Column - Crisp White in Light Mode */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white dark:bg-[#111827]">
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Enterprise Authentication
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isLogin ? 'Welcome Back!' : 'Join Our AI Chat Community'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLogin
                ? 'Sign in to access your GraphRAG workspaces and cached embeddings.'
                : 'Create a new multi-tenant GraphRAG workspace for your organization.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@enterprise.ai"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Tenant ID Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tenant Organization ID
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomTenant(!isCustomTenant)}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isCustomTenant ? 'Choose Existing' : 'Custom Tenant ID'}
                </button>
              </div>

              {isCustomTenant ? (
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={customTenant}
                    onChange={(e) => setCustomTenant(e.target.value)}
                    placeholder="e.g. tenant_my_company_99"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer"
                  >
                    {availableTenants.map((t) => (
                      <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {t.name} ({t.id}) • {t.plan} Plan
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Remember Me */}
            {isLogin && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  Remember my session & tenant ID
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Workspace' : 'Create Organization Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => login('google.user@company.com', '', selectedTenant)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => login('apple.user@company.com', '', selectedTenant)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Apple</span>
            </button>
            <button
              type="button"
              onClick={() => login('microsoft.user@company.com', '', selectedTenant)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Microsoft</span>
            </button>
          </div>

          {/* Switch Mode Footer */}
          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            {isLogin ? (
              <p>
                Don&apos;t have a tenant workspace?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
