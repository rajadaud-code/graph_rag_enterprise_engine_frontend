'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SettingsView } from '@/components/settings/SettingsView';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      <SettingsView onBackToChat={() => router.push('/')} />
    </div>
  );
}
