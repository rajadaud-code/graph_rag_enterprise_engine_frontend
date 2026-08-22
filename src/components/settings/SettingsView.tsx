'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { WidgetIntegration } from './WidgetIntegration';
import {
  Palette,
  Code2,
  Shield,
  Bell,
  Languages,
  HelpCircle,
  Sun,
  Moon,
  Building2,
  Check,
  Sparkles,
  Database,
  Layers,
  Network,
  Cpu
} from 'lucide-react';

interface SettingsViewProps {
  onBackToChat?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBackToChat }) => {
  const { theme, setTheme } = useTheme();
  const { tenantId, activeTenant, availableTenants, switchTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'personalization' | 'widget' | 'privacy' | 'notification' | 'language' | 'help'>('widget');

  interface TabItem {
    id: 'personalization' | 'widget' | 'privacy' | 'notification' | 'language' | 'help';
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  const tabs: TabItem[] = [
    { id: 'personalization', label: 'Personalization', icon: Palette },
    { id: 'widget', label: 'Widget Integration', icon: Code2, badge: 'New' },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notification', label: 'Notification', icon: Bell },
    { id: 'language', label: 'Language', icon: Languages },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">System & Workspace Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your AI appearance, tenant data isolation, and embeddable widget scripts.
          </p>
        </div>

        {onBackToChat && (
          <button
            onClick={onBackToChat}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
          >
            ← Back to Chat
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 border-r border-border p-4 space-y-1 overflow-y-auto bg-card/30">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase px-3 py-2">
            Settings Menu
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white text-blue-600 font-bold' : 'bg-lime-400 text-slate-950 font-semibold'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Active Tenant Card in Sidebar */}
          <div className="mt-8 p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Active Workspace</span>
            </div>
            <p className="text-xs font-medium">{activeTenant.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono truncate">{tenantId}</p>
            <div className="pt-1">
              <select
                value={tenantId}
                onChange={(e) => switchTenant(e.target.value)}
                className="w-full py-1.5 px-2 rounded-lg bg-background border border-border text-[11px] font-medium"
              >
                {availableTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 p-6 md:p-8 overflow-y-auto max-h-full space-y-6">
          {activeTab === 'widget' && <WidgetIntegration />}

          {activeTab === 'personalization' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold">Theme & Appearance</h3>
                <p className="text-xs text-muted-foreground">
                  Customize the visual styling of your GraphRAG chat interface.
                </p>
              </div>

              {/* Theme Choice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Light Theme Card */}
                <div
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg shadow-blue-500/10'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Theme</span>
                    </div>
                    {theme === 'light' && (
                      <span className="p-1 rounded-full bg-blue-600 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="h-28 rounded-xl bg-slate-100 border border-slate-200 p-3 space-y-2 flex flex-col justify-between">
                    <div className="w-2/3 h-3 rounded bg-slate-300" />
                    <div className="w-full h-2 rounded bg-slate-200" />
                    <div className="w-3/4 h-2 rounded bg-slate-200" />
                    <div className="flex justify-end">
                      <div className="w-16 h-4 rounded bg-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Crisp whites and soft grays tailored for brightly lit environments.
                  </p>
                </div>

                {/* Dark Theme Card */}
                <div
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-blue-600 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <Moon className="w-4 h-4 text-blue-400" />
                      <span>Dark Theme</span>
                    </div>
                    {theme === 'dark' && (
                      <span className="p-1 rounded-full bg-blue-600 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="h-28 rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2 flex flex-col justify-between">
                    <div className="w-2/3 h-3 rounded bg-slate-700" />
                    <div className="w-full h-2 rounded bg-slate-800" />
                    <div className="w-3/4 h-2 rounded bg-slate-800" />
                    <div className="flex justify-end">
                      <div className="w-16 h-4 rounded bg-blue-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Deep obsidian & royal blue accents designed for focus and low eye strain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-bold">Privacy & Tenant Isolation Policy</h3>
                <p className="text-xs text-muted-foreground">
                  How GraphRAG keeps vector indices and knowledge graphs secure.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border space-y-3 text-xs leading-relaxed">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span>Qdrant Vector Isolation</span>
                </div>
                <p className="text-muted-foreground">
                  All vector payloads contain a strict metadata filter `{`tenant_id: "${tenantId}"`}` on every search query. No vector similarity calculation can cross tenant boundaries.
                </p>

                <div className="flex items-center gap-2 font-semibold text-foreground pt-2">
                  <Network className="w-4 h-4 text-purple-500" />
                  <span>Neo4j Graph Partitioning</span>
                </div>
                <p className="text-muted-foreground">
                  Graph relationships and entity nodes are partitioned using tenant property indexes. Queries enforce Cypher MATCH clauses constrained to the active tenant workspace.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notification' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold">Notifications</h3>
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Celery Document Ingestion Alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Redis Semantic Cache Invalidation Notices</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Daily Tenant Usage Reports</span>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold">Language Preferences</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['English (US)', 'Español', 'Français', 'Deutsch', '日本語', 'العربية'].map((lang, idx) => (
                  <button
                    key={lang}
                    className={`p-3 rounded-xl border text-left font-medium transition-all ${
                      idx === 0
                        ? 'border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold">Documentation & Support</h3>
              <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Need help configuring hybrid GraphRAG retrievers, tuning Celery concurrency, or integrating your widget?
                </p>
                <div className="flex gap-2">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Read Docs
                  </a>
                  <button
                    type="button"
                    onClick={() => alert('Support ticket system initialized.')}
                    className="px-3 py-2 rounded-xl border border-border hover:bg-muted transition-colors font-medium"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
