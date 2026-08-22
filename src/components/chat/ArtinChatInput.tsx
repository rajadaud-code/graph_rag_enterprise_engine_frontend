'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Send,
  Loader2,
  Paperclip,
  Sparkles,
  CornerDownLeft,
  Globe,
  Mic
} from 'lucide-react';

interface ArtinChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onOpenIngestModal: () => void;
  isLoading: boolean;
}

export const ArtinChatInput: React.FC<ArtinChatInputProps> = ({
  onSendMessage,
  onOpenIngestModal,
  isLoading,
}) => {
  const { tenantId, activeTenant } = useAuth();
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
    <div className="p-4 bg-background/80 border-t border-border backdrop-blur-xl shrink-0">
      <div className="max-w-4xl mx-auto space-y-2">
        
        {/* Floating Input Pill */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="relative flex items-end gap-2 rounded-2xl bg-card border border-border focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2.5 shadow-lg"
        >
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1 pb-1">
            <button
              type="button"
              onClick={onOpenIngestModal}
              className="p-2 rounded-xl text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-muted transition-colors"
              title="Upload PDF Document (Ingest to Vector & Graph DB)"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0 flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask a question in ${activeTenant.name}...`}
              disabled={isLoading}
              rows={1}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none resize-none min-h-[36px] max-h-[180px] py-1.5 leading-relaxed"
            />
          </div>

          {/* Right Action: Send Button */}
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={!input.trim() || isLoading}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/25'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
            title={isLoading ? 'Awaiting GraphRAG Response' : 'Send Message'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Input Footer Metadata */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Workspace: <strong className="text-foreground">{activeTenant.name}</strong> ({tenantId})</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-muted border border-border">
              Shift + Enter
            </span>
            <span>new line</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-muted border border-border flex items-center gap-0.5">
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
