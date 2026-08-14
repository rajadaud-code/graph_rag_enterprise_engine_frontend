'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
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
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ChatMessage, VectorContextItem, GraphContextItem } from '@/types/chat';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onClearChat: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onClearChat,
  onSelectPrompt,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [expandedContexts, setExpandedContexts] = useState<Record<string, boolean>>({});
  const [activeContextTab, setActiveContextTab] = useState<Record<string, 'vector' | 'graph'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleContext = (messageId: string) => {
    setExpandedContexts((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const setTab = (messageId: string, tab: 'vector' | 'graph') => {
    setActiveContextTab((prev) => ({
      ...prev,
      [messageId]: tab,
    }));
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const renderVectorContext = (vectorContext?: (string | VectorContextItem)[]) => {
    if (!vectorContext || vectorContext.length === 0) {
      return <p className="text-xs text-slate-400 italic">No vector chunks retrieved.</p>;
    }

    return (
      <div className="space-y-2">
        {vectorContext.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-cyan-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Vector Chunk #{idx + 1}</span>
                </div>
                <p className="whitespace-pre-wrap">{item}</p>
              </div>
            );
          }

          return (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.filename || `Chunk #${idx + 1}`}</span>
                </div>
                {item.score !== undefined && (
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                    Score: {(item.score * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {item.content || item.text || JSON.stringify(item)}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGraphContext = (graphContext?: (string | GraphContextItem)[]) => {
    if (!graphContext || graphContext.length === 0) {
      return <p className="text-xs text-slate-400 italic">No Knowledge Graph entities cited.</p>;
    }

    return (
      <div className="space-y-2">
        {graphContext.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-indigo-300 flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{item}</span>
              </div>
            );
          }

          return (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-2 font-mono text-purple-300 font-medium">
                <Network className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>
                  {item.subject || item.entity || 'Entity'}
                  {item.relationship && (
                    <span className="text-slate-400 mx-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">
                      --[{item.relationship}]--&gt;
                    </span>
                  )}
                  {item.object || item.target || ''}
                </span>
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-400 italic pl-5">
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
    <div className="flex-1 flex flex-col h-full bg-slate-950/50 min-w-0 overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              GraphRAG Intelligence Engine
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              LangGraph Multi-Agent Architecture • Redis Semantic Cache • Qdrant & Neo4j
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Thread
          </button>
        )}
      </div>

      {/* Message Thread Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-2xl mx-auto my-auto space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center shadow-2xl shadow-indigo-500/10">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100">
                Enterprise GraphRAG Query Engine
              </h3>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                Ask questions over ingested documents. Uses hybrid vector search, knowledge graph traversal, and Redis sub-millisecond semantic caching.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onSelectPrompt("Summarize key entities in the ingested document")}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 group-hover:text-indigo-200">
                  <Network className="w-4 h-4 text-purple-400" />
                  Summarize Key Entities
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Extract core nodes and relationships found across the document corpus.
                </p>
              </button>

              <button
                onClick={() => onSelectPrompt("Explain relationships found in the Knowledge Graph")}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  Explain Knowledge Graph
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Traverse Neo4j triples to explain complex inter-entity relationships.
                </p>
              </button>

              <button
                onClick={() => onSelectPrompt("Perform hybrid vector and graph retrieval on financial reports")}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Hybrid Dense Retrieval
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Combine Qdrant vector semantic search with GraphRAG synthesis.
                </p>
              </button>

              <button
                onClick={() => onSelectPrompt("What is the status of system services and cached vectors?")}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Test Semantic Cache
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Verify Redis semantic caching with cosine similarity threshold &gt; 0.95.
                </p>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isContextExpanded = expandedContexts[msg.id] || false;
            const currentTab = activeContextTab[msg.id] || 'vector';

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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col space-y-2 min-w-0 max-w-[88%] md:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* User/Assistant Header Info */}
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">{isUser ? 'User' : 'GraphRAG Engine'}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : msg.isError
                        ? 'bg-rose-950/60 text-rose-200 border border-rose-800/80 rounded-tl-xs'
                        : 'bg-slate-900/90 text-slate-100 border border-slate-800/90 rounded-tl-xs shadow-slate-950/40'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-3">
                        {/* AI Response Badges */}
                        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800/60">
                          {msg.cacheHit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10">
                              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              ⚡ Cache Hit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10">
                              <Brain className="w-3.5 h-3.5 text-cyan-400" />
                              🧠 GraphRAG Hybrid
                            </span>
                          )}

                          {msg.routeDecision && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                              Route: {msg.routeDecision}
                            </span>
                          )}
                        </div>

                        {/* Markdown Content */}
                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>

                        {/* Copy Button */}
                        <div className="flex items-center justify-end pt-1">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                            title="Copy answer"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Collapsible Context Inspector (AI Messages) */}
                  {!isUser && hasContext && (
                    <div className="w-full mt-2 rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden">
                      <button
                        onClick={() => toggleContext(msg.id)}
                        className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-medium text-slate-300 hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Retrieved Context ({vectorCount} Vector Chunks, {graphCount} Graph Entities)</span>
                        </div>
                        {isContextExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {isContextExpanded && (
                        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                          {/* Tabs Header */}
                          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
                            <button
                              onClick={() => setTab(msg.id, 'vector')}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                currentTab === 'vector'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>Vector Chunks ({vectorCount})</span>
                            </button>
                            <button
                              onClick={() => setTab(msg.id, 'graph')}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                currentTab === 'graph'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                              }`}
                            >
                              <Network className="w-3.5 h-3.5" />
                              <span>Knowledge Graph ({graphCount})</span>
                            </button>
                          </div>

                          {/* Tab Content */}
                          <div>
                            {currentTab === 'vector'
                              ? renderVectorContext(msg.vectorContext)
                              : renderGraphContext(msg.graphContext)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shrink-0 animate-pulse mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300 flex items-center gap-3 shadow-lg">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-medium text-slate-300">
                Executing LangGraph Agentic Search & Redis Cache check...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
