'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Code,
  Copy,
  Check,
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Settings2
} from 'lucide-react';

export const WidgetIntegration: React.FC = () => {
  const { tenantId, activeTenant } = useAuth();
  const [copied, setCopied] = useState(false);
  const [widgetTheme, setWidgetTheme] = useState<'auto' | 'dark' | 'light'>('auto');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [customOrigin, setCustomOrigin] = useState('https://*.yourdomain.com');

  const snippetCode = `<script\n  src="https://cdn.graphrag.enterprise/v2/widget.js"\n  data-tenant-id="${tenantId}"\n  data-theme="${widgetTheme}"\n  data-position="${position}"\n  data-primary-color="${primaryColor}"\n  async\n></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-transparent border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
              <Code className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold">Embeddable AI Chat Widget</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-lime-400/20 text-lime-600 dark:text-lime-400 border border-lime-400/30">
              Active Tenant: {tenantId}
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Deploy your multi-tenant GraphRAG knowledge base directly into any website or customer portal by adding a single HTML snippet.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Integration Script</span>
            </>
          )}
        </button>
      </div>

      {/* Code Snippet Block */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-blue-500" />
            <span>HTML Embed Code</span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Include before closing &lt;/body&gt; tag
          </span>
        </div>

        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden text-slate-100 font-mono text-xs">
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] text-slate-400 ml-2">widget-loader.html</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 overflow-x-auto text-blue-300 leading-relaxed">
            <code>{snippetCode}</code>
          </pre>
        </div>
      </div>

      {/* Customization Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget Theme & Placement */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Settings2 className="w-4 h-4 text-blue-500" />
            <h4>Widget Appearance & Behavior</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1.5 font-medium">
                Default Widget Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['auto', 'dark', 'light'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWidgetTheme(mode)}
                    className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-all ${
                      widgetTheme === mode
                        ? 'border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1.5 font-medium">
                Screen Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['bottom-right', 'bottom-left'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-all ${
                      position === pos
                        ? 'border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1.5 font-medium">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border border-border p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Domain Whitelist */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-lime-500" />
            <h4>CORS & Security Isolation</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1.5 font-medium">
                Allowed Web Domains (CORS)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={customOrigin}
                  onChange={(e) => setCustomOrigin(e.target.value)}
                  placeholder="https://app.yourdomain.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/50 border border-border text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Only requests originating from authorized origins can query this tenant&apos;s Knowledge Graph.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1.5">
              <span className="text-[11px] font-semibold text-foreground">Tenant Quota & Rate Limit</span>
              <p className="text-[11px] text-muted-foreground">
                Current Plan: <span className="font-semibold text-blue-600 dark:text-blue-400">{activeTenant.plan}</span> (1,000 queries/min semantic cache limit).
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => alert(`Simulating Live Widget Preview for tenant ${tenantId}...`)}
                className="w-full py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Live Widget Sandbox</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
