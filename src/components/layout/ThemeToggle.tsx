'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'cards';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
        } ${className}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      >
        {isDark ? (
          <>
            <Moon className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium">Dark Mode</span>
          </>
        ) : (
          <>
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium">Light Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-2.5 rounded-xl transition-all duration-200 border ${
        isDark
          ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-blue-400'
          : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-600 hover:text-blue-600'
      } ${className}`}
      aria-label="Toggle Light/Dark Theme"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-blue-600 transition-transform rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
};
