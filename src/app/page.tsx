'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ArtinSidebar } from '@/components/layout/ArtinSidebar';
import { ArtinChatArea } from '@/components/chat/ArtinChatArea';
import { ArtinChatInput } from '@/components/chat/ArtinChatInput';
import { IngestModal } from '@/components/ingest/IngestModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { SettingsView } from '@/components/settings/SettingsView';
import { checkHealth, uploadDocument, sendChatMessage } from '@/lib/api';
import { ChatMessage, HealthStatus, IngestTask } from '@/types/chat';
import { Menu, AlertTriangle, X, CheckCircle2, Building2 } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

export default function Home() {
  const { tenantId, token, activeTenant } = useAuth();

  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const [activeSessionId, setActiveSessionId] = useState<string>('sess_today_1');
  const [activeSessionTitle, setActiveSessionTitle] = useState<string>('Exploring Knowledge Graph & Vectors');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [ingestTasks, setIngestTasks] = useState<IngestTask[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Poll system health
  const fetchHealth = useCallback(async () => {
    setIsHealthLoading(true);
    try {
      const status = await checkHealth();
      setHealth(status);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Health check failed';
      setHealth({
        status: 'offline',
        details: {
          postgres: 'unhealthy: backend offline',
          qdrant: 'unhealthy: backend offline',
          neo4j: 'unhealthy: backend offline',
          redis: 'unhealthy: backend offline',
        },
        isHealthy: false,
        error: msg,
      });
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Handle document upload with tenant isolation
  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const response = await uploadDocument(file, {
        tenant_id: tenantId,
        token: token || undefined,
      });

      const newTask: IngestTask = {
        taskId: response.task_id,
        filename: file.name,
        status: 'processing',
        timestamp: formatTimestamp(new Date()),
        message: response.message,
        tenant_id: tenantId,
      };

      setIngestTasks((prev) => [newTask, ...prev]);
      setSuccessBanner(`Celery ingestion dispatched for '${file.name}' in tenant '${tenantId}' (Task: ${response.task_id.substring(0, 8)}...)`);
      setTimeout(() => setSuccessBanner(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Document ingestion failed';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle sending chat messages with tenant_id and session_id
  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || isChatLoading) return;

    setErrorMessage(null);
    const userMsgId = `user-${Date.now()}`;
    const timestampStr = formatTimestamp(new Date());

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: userPrompt,
      timestamp: timestampStr,
      tenant_id: tenantId,
      session_id: activeSessionId,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await sendChatMessage(userPrompt, {
        session_id: activeSessionId,
        tenant_id: tenantId,
        token: token || undefined,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.generation,
        cacheHit: response.cache_hit,
        routeDecision: response.route_decision,
        vectorContext: response.vector_context,
        graphContext: response.graph_context,
        sources: response.sources,
        timestamp: formatTimestamp(new Date()),
        tenant_id: tenantId,
        session_id: activeSessionId,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve response from GraphRAG Engine';

      const errorAssistantMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **GraphRAG Error**: ${errorMsg}. Ensure the backend service is running on \`http://127.0.0.1:8000/api/v1\`.`,
        timestamp: formatTimestamp(new Date()),
        isError: true,
        tenant_id: tenantId,
        session_id: activeSessionId,
      };

      setMessages((prev) => [...prev, errorAssistantMsg]);
      setErrorMessage(errorMsg);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = `sess_${Date.now()}`;
    setActiveSessionId(newId);
    setActiveSessionTitle('New GraphRAG Inquiry');
    setMessages([]);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    if (sessionId === 'sess_today_1') {
      setActiveSessionTitle('Exploring Knowledge Graph & Vectors');
    } else if (sessionId === 'sess_today_2') {
      setActiveSessionTitle('Financial Q3 Earnings Synthesis');
    } else {
      setActiveSessionTitle('Archived Graph Conversation');
    }
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-card/90 border-b border-border flex items-center justify-between px-4 backdrop-blur-md">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold tracking-wider flex items-center gap-1.5">
          <span>Agentic GraphRag</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-lime-400/20 text-lime-600 dark:text-lime-400">
            {activeTenant.name}
          </span>
        </span>
        <div className="w-8" />
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Artin Dual-Navigation Sidebar */}
      <ArtinSidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          setIsMobileSidebarOpen(false);
        }}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onNewChat={handleNewChat}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          handleSelectSession(id);
          setIsMobileSidebarOpen(false);
        }}
        health={health}
        isHealthLoading={isHealthLoading}
        onRefreshHealth={fetchHealth}
        isOpenMobile={isMobileSidebarOpen}
        onToggleMobile={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 pt-14 md:pt-0 relative">
        
        {/* Banner Notifications */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between shadow-lg shrink-0 z-20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded hover:bg-rose-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successBanner && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between shadow-lg shrink-0 z-20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="p-1 rounded hover:bg-emerald-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View Switcher: Chat or Settings */}
        {currentView === 'chat' ? (
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            <ArtinChatArea
              messages={messages}
              isLoading={isChatLoading}
              onClearChat={() => setMessages([])}
              onSelectPrompt={handleSendMessage}
              onOpenIngestModal={() => setIsIngestModalOpen(true)}
              sessionTitle={activeSessionTitle}
            />

            <ArtinChatInput
              onSendMessage={handleSendMessage}
              onOpenIngestModal={() => setIsIngestModalOpen(true)}
              isLoading={isChatLoading}
            />
          </div>
        ) : (
          <SettingsView onBackToChat={() => setCurrentView('chat')} />
        )}
      </main>

      {/* Document Ingestion Modal */}
      <IngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onUploadFile={handleUploadFile}
        isUploading={isUploading}
        ingestTasks={ingestTasks}
      />

      {/* Authentication & Tenant Selector Modal */}
      <AuthModal />

    </div>
  );
}
