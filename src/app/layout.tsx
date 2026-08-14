import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enterprise GraphRAG Intelligence Engine",
  description: "Stateful LangGraph Hybrid Search Engine with Redis Semantic Caching, Qdrant Vector DB, and Neo4j Knowledge Graph.",
  keywords: ["GraphRAG", "LangGraph", "Qdrant", "Neo4j", "Redis", "Celery", "Enterprise AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark h-full antialiased ${geistSans.variable} ${geistMono.variable}`}>
      <body className="h-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
