'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import {
  Zap,
  Brain,
  Layers,
  Network,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  Copy,
  Check,
  Sparkles,
  FileText,
  Clock,
  RotateCcw,
  Building2,
  ThumbsUp,
  ThumbsDown,
  UploadCloud,
  Share2,
  Bookmark
} from 'lucide-react';
import { ChatMessage, VectorContextItem, GraphContextItem } from '@/types/chat';

interface ArtinChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onClearChat: () => void;
  onSelectPrompt: (prompt: string) => void;
  onOpenIngestModal: () => void;
  sessionTitle?: string;
}

export const ArtinChatArea: React.FC<ArtinChatAreaProps> = ({
  messages,
  isLoading,
  onClearChat,
  onSelectPrompt,
  onOpenIngestModal,
  sessionTitle = 'Exploring Knowledge Graph & Vectors',
}) => {
  const { tenantId, activeTenant } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedContexts, setExpandedContexts] = useState<Record<string, boolean>>({});
  const [contextTabs, setContextTabs] = useState<Record<string, 'vector' | 'graph'>>({});
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleContext = (id: string) => {
    setExpandedContexts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setTab = (id: string, tab: 'vector' | 'graph') => {
    setContextTabs((prev) => ({ ...prev, [id]: tab }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleLike = (id: string) => {
    setLikedMessages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderVectorChunks = (vectorContext?: (string | VectorContextItem)[]) => {
    if (!vectorContext || vectorContext.length === 0) {
      return <p className="text-xs text-muted-foreground italic">No vector chunks retrieved from Qdrant.</p>;
    }

    return (
      <div className="space-y-2">
        {vectorContext.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <div key={idx} className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground space-y-1">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 font-semibold text-[11px]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Qdrant Dense Chunk #{idx + 1}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{item}</p>
              </div>
            );
          }

          return (
            <div key={idx} className="p-3 rounded-xl bg-background border border-border text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-cyan-400 truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.filename || `Chunk #${idx + 1}`}</span>
                </div>
                {item.score !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] border border-blue-500/20">
                    Similarity: {(item.score * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-foreground font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {item.content || item.text || JSON.stringify(item)}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGraphTriples = (graphContext?: (string | GraphContextItem)[]) => {
    if (!graphContext || graphContext.length === 0) {
      return <p className="text-xs text-muted-foreground italic">No Knowledge Graph triples cited from Neo4j.</p>;
    }

    return (
      <div className="space-y-2">
        {graphContext.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <div key={idx} className="p-2.5 rounded-xl bg-background border border-border text-xs font-mono text-purple-600 dark:text-purple-300 flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-500 shrink-0" />
                <span>{item}</span>
              </div>
            );
          }

          return (
            <div key={idx} className="p-3 rounded-xl bg-background border border-border text-xs space-y-1">
              <div className="flex items-center gap-2 font-mono text-purple-700 dark:text-purple-300 font-medium">
                <Network className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>
                  <strong className="text-foreground">{item.subject || item.entity || 'Entity'}</strong>
                  {item.relationship && (
                    <span className="mx-1.5 px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground border border-border">
                      --[{item.relationship}]--&gt;
                    </span>
                  )}
                  <strong className="text-foreground">{item.object || item.target || ''}</strong>
                </span>
              </div>
              {item.description && (
                <p className="text-[11px] text-muted-foreground italic pl-5">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0 overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="px-6 py-3.5 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground truncate">{sessionTitle}</h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {activeTenant.name}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              LangGraph Agentic Search • Redis Semantic Cache • Qdrant Vector & Neo4j Graph
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenIngestModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-colors"
            title="Upload PDF Document"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Add Docs</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
              title="Clear Thread"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Message Thread Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-2xl mx-auto my-auto space-y-6">
            
            {/* Center Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-2xl shadow-blue-500/10">
                <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-lime-400 text-slate-950 font-mono text-[10px] font-bold shadow-md">
                Artin v2.0
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Unlock the Power of AI
              </h3>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                Query your multi-tenant GraphRAG knowledge base with sub-millisecond Redis semantic caching, Qdrant dense vector search, and Neo4j multi-hop graph reasoning.
              </p>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onSelectPrompt("Summarize key entities in the ingested document")}
                className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500 hover:shadow-md text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <Network className="w-4 h-4 text-purple-500" />
                  <span>Summarize Key Entities</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  Extract core nodes and relationships found across the document corpus.
                </p>
              </button>

              <button
                onClick={() => onSelectPrompt("Explain relationships found in the Knowledge Graph")}
                className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500 hover:shadow-md text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <Brain className="w-4 h-4 text-cyan-500" />
                  <span>Explain Knowledge Graph</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  Traverse Neo4j triples to explain complex inter-entity connections.
                </p>
              </button>

              <button
                onClick={() => onSelectPrompt("Perform hybrid vector and graph retrieval on financial reports")}
                className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500 hover:shadow-md text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Hybrid Dense Retrieval</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  Combine Qdrant vector semantic search with GraphRAG synthesis.
                </p>
              </button>

              <button
                onClick={() => onSelectPrompt("What is the status of system services and cached vectors?")}
                className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500 hover:shadow-md text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Test Semantic Cache</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  Verify Redis semantic caching with cosine similarity threshold &gt; 0.95.
                </p>
              </button>
            </div>

          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isContextExpanded = expandedContexts[msg.id] || false;
            const currentTab = contextTabs[msg.id] || 'vector';

            const vectorCount = msg.vectorContext?.length || 0;
            const graphCount = msg.graphContext?.length || 0;
            const hasContext = vectorCount > 0 || graphCount > 0;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 md:gap-4 max-w-4xl mx-auto ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col space-y-1.5 min-w-0 max-w-[88%] md:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender & Timestamp Header */}
                  <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{isUser ? 'You' : 'Artin AI Engine'}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{msg.timestamp}</span>
                    {msg.tenant_id && (
                      <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.2 rounded bg-muted">
                        {msg.tenant_id}
                      </span>
                    )}
                  </div>

                  {/* Bubble Body */}
                  <div
                    className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-blue-600/10'
                        : msg.isError
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded-tl-xs'
                        : 'bg-card text-card-foreground border border-border rounded-tl-xs shadow-md'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-2 pb-2.5 border-b border-border">
                          {msg.cacheHit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30">
                              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              ⚡ Redis Cache Hit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                              <Brain className="w-3.5 h-3.5 text-blue-500" />
                              🧠 GraphRAG Hybrid
                            </span>
                          )}

                          {msg.routeDecision && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-muted text-muted-foreground border border-border">
                              Route: {msg.routeDecision}
                            </span>
                          )}
                        </div>

                        {/* Markdown Text */}
                        <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>

                        {/* Message Action Bar */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/60">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleLike(msg.id)}
                              className={`p-1.5 rounded-lg text-xs transition-colors ${
                                likedMessages[msg.id]
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                              title="Helpful response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => alert('Feedback recorded.')}
                              className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Report issue"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Copy answer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Collapsible Context Inspector */}
                  {!isUser && hasContext && (
                    <div className="w-full mt-1.5 rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
                      <button
                        onClick={() => toggleContext(msg.id)}
                        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="w-3.5 h-3.5 text-blue-500" />
                          <span>Retrieved Evidence ({vectorCount} Vector Chunks, {graphCount} Graph Triples)</span>
                        </div>
                        {isContextExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      {isContextExpanded && (
                        <div className="p-3.5 border-t border-border bg-muted/20 space-y-3">
                          {/* Tabs */}
                          <div className="flex items-center gap-2 border-b border-border pb-2">
                            <button
                              onClick={() => setTab(msg.id, 'vector')}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                                currentTab === 'vector'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>Qdrant Vectors ({vectorCount})</span>
                            </button>
                            <button
                              onClick={() => setTab(msg.id, 'graph')}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                                currentTab === 'graph'
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                            >
                              <Network className="w-3.5 h-3.5" />
                              <span>Neo4j Graph ({graphCount})</span>
                            </button>
                          </div>

                          {/* Tab Content */}
                          <div>
                            {currentTab === 'vector'
                              ? renderVectorChunks(msg.vectorContext)
                              : renderGraphTriples(msg.graphContext)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-4xl mx-auto justify-start">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shrink-0 animate-pulse mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-sm flex items-center gap-3 shadow-md">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Executing LangGraph Agentic Search & Redis Cache check for <span className="font-mono text-foreground font-semibold">{tenantId}</span>...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

    </div>
  );
};
