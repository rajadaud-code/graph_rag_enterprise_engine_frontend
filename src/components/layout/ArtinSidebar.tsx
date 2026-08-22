'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { HealthStatus, ChatSession } from '@/types/chat';
import {
  MessageSquare,
  UploadCloud,
  Settings,
  Shield,
  Plus,
  Search,
  Hash,
  Database,
  Layers,
  Network,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface ArtinSidebarProps {
  currentView: 'chat' | 'settings';
  onSelectView: (view: 'chat' | 'settings') => void;
  onOpenIngestModal: () => void;
  onNewChat: () => void;
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  health: HealthStatus | null;
  isHealthLoading: boolean;
  onRefreshHealth: () => void;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

const MOCK_SESSIONS: ChatSession[] = [
  {
    id: 'sess_today_1',
    title: 'Exploring Knowledge Graph & Vectors',
    timestamp: '10:42 AM',
    category: 'Today',
    tag: 'GraphRAG',
    tenant_id: 'tenant_acme_01',
  },
  {
    id: 'sess_today_2',
    title: 'Financial Q3 Earnings Synthesis',
    timestamp: '09:15 AM',
    category: 'Today',
    tag: 'Finance',
    tenant_id: 'tenant_acme_01',
  },
  {
    id: 'sess_yesterday_1',
    title: 'Redis Semantic Cache Latency Analysis',
    timestamp: 'Yesterday',
    category: 'Yesterday',
    tag: 'Cache',
    tenant_id: 'tenant_acme_01',
  },
  {
    id: 'sess_yesterday_2',
    title: 'Celery Chunking & Embedding Pipeline',
    timestamp: 'Yesterday',
    category: 'Yesterday',
    tag: 'Ingest',
    tenant_id: 'tenant_acme_01',
  },
  {
    id: 'sess_prev_1',
    title: 'Neo4j Multi-Hop Triples Verification',
    timestamp: '3 days ago',
    category: 'Previous 7 Days',
    tag: 'Neo4j',
    tenant_id: 'tenant_acme_01',
  },
];

export const ArtinSidebar: React.FC<ArtinSidebarProps> = ({
  currentView,
  onSelectView,
  onOpenIngestModal,
  onNewChat,
  activeSessionId,
  onSelectSession,
  health,
  isHealthLoading,
  onRefreshHealth,
  isOpenMobile,
  onToggleMobile,
}) => {
  const { user, tenantId, activeTenant, availableTenants, switchTenant, logout, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);

  const filteredSessions = MOCK_SESSIONS.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.tag && s.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = ['Today', 'Yesterday', 'Previous 7 Days'] as const;

  const renderHealthItem = (name: string, status: string | undefined, Icon: React.ElementType) => {
    const isHealthy = status === 'healthy';
    const isOffline = status?.includes('unhealthy') || status === 'offline';

    return (
      <div className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-muted/40 border border-border/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{name}</span>
        </div>
        <span className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
          {isHealthy ? (
            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          ) : isOffline ? (
            <span className="flex items-center gap-1 text-rose-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Offline
            </span>
          ) : (
            <span className="text-amber-500">Degraded</span>
          )}
        </span>
      </div>
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex bg-card border-r border-border transition-all duration-300 ease-in-out md:static ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* 1. PRIMARY ICON RAIL (Leftmost narrow bar) */}
      <div className="w-16 bg-muted/30 border-r border-border flex flex-col items-center justify-between py-4 shrink-0">
        
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => onSelectView('chat')}
            className="group relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
            title="Agentic GraphRag Enterprise Engine Home"
          >
            <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            </div>
          </button>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-3">
            <button
              onClick={() => onSelectView('chat')}
              className={`p-3 rounded-2xl transition-all ${
                currentView === 'chat'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="AI Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenIngestModal}
              className="p-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all relative group"
              title="Upload PDF Document"
            >
              <UploadCloud className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-lime-400" />
            </button>

            <button
              onClick={() => onSelectView('settings')}
              className={`p-3 rounded-2xl transition-all ${
                currentView === 'settings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Settings & Widget Integration"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="p-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Authentication & Tenant Login"
            >
              <Shield className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Rail Actions: Theme Toggle & Avatar */}
        <div className="flex flex-col items-center gap-3">
          <ThemeToggle />

          <button
            onClick={() => openAuthModal('login')}
            className="relative w-10 h-10 rounded-2xl overflow-hidden border-2 border-border hover:border-blue-500 transition-colors"
            title={`Tenant: ${activeTenant.name}`}
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
            )}
          </button>
        </div>

      </div>

      {/* 2. SECONDARY SESSIONS & HEALTH DRAWER */}
      <div
        className={`flex flex-col h-full bg-card/60 backdrop-blur-xl transition-all duration-300 ${
          isDrawerCollapsed ? 'w-0 overflow-hidden opacity-0 border-0' : 'w-72'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight leading-tight">
              Agentic GraphRag
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                Enterprise Engine
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-lime-400/20 text-lime-600 dark:text-lime-400 border border-lime-400/30">
                v2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
              <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="truncate font-medium">{activeTenant.name}</span>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerCollapsed(true)}
            className="hidden md:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Collapse Sidebar Drawer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMobile}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onSelectView('chat');
              onNewChat();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Scrollable Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
          {categories.map((category) => {
            const categorySessions = filteredSessions.filter((s) => s.category === category);
            if (categorySessions.length === 0) return null;

            return (
              <div key={category} className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  {category}
                </span>

                <div className="space-y-1">
                  {categorySessions.map((session) => {
                    const isActive = activeSessionId === session.id;

                    return (
                      <button
                        key={session.id}
                        onClick={() => {
                          onSelectView('chat');
                          onSelectSession(session.id);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 ${
                          isActive
                            ? 'bg-blue-600/10 dark:bg-blue-950/40 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate">{session.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {session.tag && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Hash className="w-2.5 h-2.5" />
                                {session.tag}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground/60">{session.timestamp}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Infrastructure Health Status Card */}
        <div className="p-3 border-t border-border bg-muted/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Infrastructure</span>
            </div>
            <button
              onClick={onRefreshHealth}
              disabled={isHealthLoading}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Refresh Infrastructure Status"
            >
              <RefreshCw className={`w-3 h-3 ${isHealthLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>

          <div className="space-y-1">
            {renderHealthItem('PostgreSQL', health?.details.postgres, Database)}
            {renderHealthItem('Qdrant Vector', health?.details.qdrant, Layers)}
            {renderHealthItem('Neo4j Graph', health?.details.neo4j, Network)}
            {renderHealthItem('Redis Cache', health?.details.redis, Clock)}
          </div>
        </div>

      </div>

      {/* Floating Re-open Drawer Tab Button when collapsed */}
      {isDrawerCollapsed && (
        <button
          onClick={() => setIsDrawerCollapsed(false)}
          className="hidden md:flex absolute -right-3 top-6 z-50 p-1 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground shadow-md transition-all"
          title="Expand Drawer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

    </aside>
  );
};
