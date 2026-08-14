'use client';

import React, { useState, useRef } from 'react';
import {
  Database,
  Layers,
  Network,
  Cpu,
  UploadCloud,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  Loader2
} from 'lucide-react';
import { HealthStatus, IngestTask } from '@/types/chat';
import { formatBytes } from '@/lib/utils';

interface SidebarProps {
  health: HealthStatus | null;
  isHealthLoading: boolean;
  onRefreshHealth: () => void;
  ingestTasks: IngestTask[];
  onUploadFile: (file: File) => Promise<void>;
  isUploading: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  health,
  isHealthLoading,
  onRefreshHealth,
  ingestTasks,
  onUploadFile,
  isUploading,
  isOpen,
  onToggleOpen,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setDragError('Only PDF files are supported for document ingestion.');
        return;
      }
      await onUploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setDragError('Only PDF files are supported for document ingestion.');
        return;
      }
      await onUploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderServiceBadge = (
    name: string,
    statusString: string | undefined,
    Icon: React.ElementType,
    description: string
  ) => {
    const isHealthy = statusString === 'healthy';
    const isDegraded = statusString?.includes('unhealthy') || statusString === 'degraded';

    return (
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-md bg-slate-800 text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 truncate">{name}</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {isHealthy ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          ) : isDegraded ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Offline
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Unknown
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 ease-in-out md:static ${
        isOpen ? 'w-80 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-80'
      }`}
    >
      {/* Sidebar Header & Branding */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
              Enterprise GraphRAG
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0 Engine
              </span>
              <span className="text-[10px] text-slate-400">Hybrid Search</span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggleOpen}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* System Health Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                System Status
              </h2>
            </div>
            <button
              onClick={onRefreshHealth}
              disabled={isHealthLoading}
              className="p-1 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-colors disabled:opacity-50"
              title="Refresh Health Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isHealthLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            {health?.isHealthy ? (
              <div className="flex items-center gap-2 pb-2 mb-1 border-b border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-emerald-400">All Infrastructure Online</span>
              </div>
            ) : health ? (
              <div className="flex items-center gap-2 pb-2 mb-1 border-b border-slate-800/60">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-medium text-rose-400">System Degraded / Offline</span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-2">
              {renderServiceBadge('PostgreSQL', health?.details.postgres, Database, 'Relational Store')}
              {renderServiceBadge('Qdrant', health?.details.qdrant, Layers, 'Vector Store')}
              {renderServiceBadge('Neo4j', health?.details.neo4j, Network, 'Knowledge Graph')}
              {renderServiceBadge('Redis', health?.details.redis, Clock, 'Semantic Cache')}
            </div>

            {health?.lastChecked && (
              <p className="text-[10px] text-slate-400 text-right pt-1">
                Updated: {new Date(health.lastChecked).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Document Ingestion Dropzone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Document Ingestion
              </h2>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Celery Worker
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                : isUploading
                ? 'border-slate-700 bg-slate-900/30 cursor-not-allowed'
                : 'border-slate-800 bg-slate-900/30 hover:border-indigo-500/50 hover:bg-slate-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                <p className="text-xs font-medium text-slate-200">Dispatching Celery Ingestion...</p>
                <p className="text-[11px] text-slate-400">Parsing PDF & Chunking Embeddings</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-slate-800/80 text-indigo-400 border border-slate-700/60 shadow-inner">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">
                    Click or drag <span className="text-indigo-400 font-semibold">PDF</span> to upload
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Extracts vectors & Knowledge Graph entities
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium border border-indigo-500/40 shadow-sm transition-all active:scale-95"
                >
                  Select PDF File
                </button>
              </div>
            )}
          </div>

          {dragError && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{dragError}</span>
            </div>
          )}
        </div>

        {/* Celery Task Confirmation Badges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Ingestion Log ({ingestTasks.length})
            </h3>
          </div>

          {ingestTasks.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-900/20 border border-slate-800/40 text-center">
              <p className="text-[11px] text-slate-400">No documents ingested yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ingestTasks.map((task) => (
                <div
                  key={task.taskId}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {task.filename}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      <FileCheck className="w-3 h-3 text-indigo-400" />
                      Queued
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="truncate">Task ID: {task.taskId.substring(0, 8)}...</span>
                    <span>{task.timestamp}</span>
                  </div>

                  {task.message && (
                    <p className="text-[10px] text-slate-400 line-clamp-1 border-t border-slate-800/60 pt-1">
                      {task.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer Branding Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Engine API Connected
        </span>
        <span className="font-mono text-[10px]">Port 8000</span>
      </div>
    </aside>
  );
};
