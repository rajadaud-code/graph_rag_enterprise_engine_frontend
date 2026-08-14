'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(message);
  };

  return (
    <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-lg shrink-0">
      <div className="max-w-4xl mx-auto space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="relative flex items-end gap-2 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all p-2 shadow-xl shadow-slate-950/60"
        >
          <div className="flex-1 min-w-0 flex items-center pl-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your ingested documents..."
              disabled={isLoading}
              rows={1}
              className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none resize-none min-h-[40px] max-h-[180px] py-2 scrollbar-thin scrollbar-thumb-slate-800"
            />
          </div>

          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={!input.trim() || isLoading}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 active:scale-95'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700/50'
            }`}
            title={isLoading ? 'Awaiting GraphRAG Response' : 'Send Message'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Hybrid Search: Qdrant Vector + Neo4j Graph + Redis Cache</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Shift + Enter
            </span>
            <span>new line</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-0.5">
              <CornerDownLeft className="w-2.5 h-2.5" />
              Enter
            </span>
            <span>send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
