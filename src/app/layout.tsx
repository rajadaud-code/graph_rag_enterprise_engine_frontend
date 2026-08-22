import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Agentic GraphRag Enterprise Engine • Multi-Tenant SaaS',
  description: 'AI Chat Dashboard with LangGraph Agentic Search, Redis Semantic Caching, Qdrant Vector Isolation & Neo4j Knowledge Graph.',
  keywords: ['Agentic GraphRag', 'Enterprise Engine', 'Multi-Tenant', 'LangGraph', 'Qdrant', 'Neo4j', 'Redis', 'Celery'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full bg-background text-foreground flex flex-col font-sans overflow-hidden antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
