# Enterprise GraphRAG Intelligence Engine - Frontend

An enterprise-grade, responsive AI interface for the **Enterprise GraphRAG Intelligence Engine** built using Next.js (App Router), TypeScript, Tailwind CSS, and shadcn/ui design patterns.

![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic_Search-purple)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector_Database-red)
![Neo4j](https://img.shields.io/badge/Neo4j-Knowledge_Graph-008cc1)
![Redis](https://img.shields.io/badge/Redis-Semantic_Cache-dc382d)

---

## 🌟 Key Features

1. **System Health Status Monitor**:
   - Real-time pulse health indicators for **PostgreSQL**, **Qdrant**, **Neo4j**, and **Redis**.
   - Automatic background polling with manual ping refresh support.

2. **Asynchronous PDF Document Ingestion**:
   - Drag-and-drop file upload with validation for PDF documents.
   - Non-blocking dispatch to background **Celery workers**.
   - Ingestion confirmation log displaying truncated Task IDs, status, and timestamps.

3. **Hybrid Search & Intelligent Chat Thread**:
   - **`⚡ Cache Hit` Badge**: Appears when responses are served instantly (<5ms) from Redis Semantic Caching (Cosine Similarity threshold > 0.95).
   - **`🧠 GraphRAG Hybrid` Badge**: Appears when answers are generated using live Qdrant vector retrieval and Neo4j knowledge graph synthesis.
   - Full **Markdown Rendering** for formatted LLM responses.
   - **Collapsible Context Inspector**: Inspect retrieved vector chunks (content, filename, similarity score) and cited Knowledge Graph entities (nodes, relations, descriptions).

4. **Responsive Enterprise UI**:
   - Modern dark slate aesthetic (`#030712`) with glowing accents.
   - Mobile-responsive sidebar drawer with slide-out navigation.
   - Auto-resizing input textarea with `Shift + Enter` multiline support.

---

## 📁 Directory & Code Structure

```text
src/
├── app/
│   ├── globals.css         # Dark slate design system & custom scrollbars
│   ├── layout.tsx          # Root layout with Geist font & metadata
│   └── page.tsx            # Main layout split-screen assembly
├── components/
│   ├── Sidebar.tsx         # Branding, Health Pills, PDF Ingest Dropzone & Task Badges
│   ├── ChatArea.tsx        # Message thread, Markdown rendering, Badges & Context Inspector
│   └── ChatInput.tsx       # Bottom input bar with Shift+Enter multiline & loading spinner
├── lib/
│   ├── api.ts              # Fetch client for /health, /ingest, and /chat endpoints
│   └── utils.ts            # Formatting & class merging utilities
└── types/
    └── chat.ts             # Fully typed interfaces for Chat, Health, and Ingest contracts
```

---

## ⚙️ Environment Variables

Create a `.env` or `.env.local` file at the root of the frontend project:

```env
# Backend Base API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

---

## 🔗 Backend API Integration

Base URL: `http://127.0.0.1:8000/api/v1`

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | Returns database status for PostgreSQL, Qdrant, Neo4j, and Redis. |
| `/ingest/` | `POST` | Accepts PDF document upload (`multipart/form-data`) and queues Celery task. |
| `/chat/` | `POST` | Sends question JSON `{"question": "..."}` and returns answer with cache and context metadata. |

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and `npm`
- Backend server running on `http://127.0.0.1:8000`

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```
