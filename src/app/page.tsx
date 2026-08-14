'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { ChatInput } from '@/components/ChatInput';
import { checkHealth, uploadDocument, sendChatMessage } from '@/lib/api';
import { ChatMessage, HealthStatus, IngestTask } from '@/types/chat';
import { Menu, AlertTriangle, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [ingestTasks, setIngestTasks] = useState<IngestTask[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    // Poll health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Handle document upload
  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const response = await uploadDocument(file);
      const newTask: IngestTask = {
        taskId: response.task_id,
        filename: file.name,
        status: 'processing',
        timestamp: formatTimestamp(new Date()),
        message: response.message,
      };
      setIngestTasks((prev) => [newTask, ...prev]);
      setSuccessBanner(`Celery task dispatched for file '${file.name}' (Task ID: ${response.task_id.substring(0, 8)}...)`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Document ingestion failed';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle sending chat messages
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
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await sendChatMessage(userPrompt);

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
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve response from GraphRAG Engine';
      
      const errorAssistantMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **API Error**: ${errorMsg}. Please ensure the GraphRAG backend service is running on \`http://127.0.0.1:8000/api/v1\`.`,
        timestamp: formatTimestamp(new Date()),
        isError: true,
      };

      setMessages((prev) => [...prev, errorAssistantMsg]);
      setErrorMessage(errorMsg);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between px-4 backdrop-blur-md">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
          Enterprise GraphRAG
        </span>
        <div className="w-8" />
      </div>

      {/* Overlay Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Component */}
      <Sidebar
        health={health}
        isHealthLoading={isHealthLoading}
        onRefreshHealth={fetchHealth}
        ingestTasks={ingestTasks}
        onUploadFile={handleUploadFile}
        isUploading={isUploading}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Center & Right Chat Container */}
      <main className="flex-1 flex flex-col h-full min-w-0 pt-14 md:pt-0 relative">
        
        {/* Banner Error Notification */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg shadow-rose-950/20 shrink-0 z-20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded hover:bg-rose-500/20 text-rose-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Notification Banner */}
        {successBanner && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg shadow-emerald-950/20 shrink-0 z-20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="p-1 rounded hover:bg-emerald-500/20 text-emerald-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chat Thread Messages */}
        <ChatArea
          messages={messages}
          isLoading={isChatLoading}
          onClearChat={handleClearChat}
          onSelectPrompt={handleSendMessage}
        />

        {/* Bottom Fixed Chat Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
        />
      </main>

    </div>
  );
}
