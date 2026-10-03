# Enterprise GraphRAG Intelligence Engine — Frontend

An enterprise-grade, responsive AI application interface for the **Enterprise GraphRAG Intelligence Engine**. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **NextAuth (Auth.js)**, featuring multi-tenant workspace isolation, asynchronous PDF ingestion pipelines, real-time database cluster telemetry, and agentic knowledge retrieval.

![Next.js 16](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![TailwindCSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-OAuth_%26_Credentials-purple)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector_Database-red)
![Neo4j](https://img.shields.io/badge/Neo4j-Knowledge_Graph-008cc1)
![Redis](https://img.shields.io/badge/Redis-Semantic_Cache-dc382d)

---

## 📸 Live Interface Preview

![Enterprise GraphRAG Live Interface Demo](public/graphrag_live_demo.png)

---

## 🏛️ System Architecture

The frontend integrates directly with NextAuth for identity management, local persistence for temporary guest interactions, and a FastAPI backend orchestrating vector searches, graph traversals, and semantic caching.

```mermaid
flowchart TB
    subgraph Client["Next.js Frontend (Port 3000)"]
        UI["React 19 UI / Tailwind CSS"]
        AuthCtx["AuthContext & NextAuth"]
        GuestMgr["Guest Session Manager (Cookies + LocalStorage)"]
        ChatEngine["Chat & Ingest Client (lib/api.ts)"]
        UI <--> AuthCtx
        UI <--> GuestMgr
        UI --> ChatEngine
    end

    subgraph AuthLayer["Authentication & OAuth"]
        NextAuthRoute["/api/auth/[...nextauth]"]
        GoogleOAuth["Google Cloud OAuth 2.0"]
        AuthCtx <--> NextAuthRoute
        NextAuthRoute <--> GoogleOAuth
    end

    subgraph BackendAPI["FastAPI GraphRAG Engine (Port 8000)"]
        HealthEndpoint["/api/v1/health/"]
        IngestEndpoint["/api/v1/ingest/"]
        ChatEndpoint["/api/v1/chat/"]
        MigrateEndpoint["/api/v1/auth/migrate-session"]
    end

    subgraph StorageLayer["Data & Inference Infrastructure"]
        RedisCache[("Redis: Semantic Cache & Broker")]
        QdrantDB[("Qdrant: Dense Vector DB")]
        Neo4jDB[("Neo4j: Knowledge Graph")]
        PostgresDB[("PostgreSQL: Tenancy & Users")]
        CeleryWorkers["Celery Workers (Doc Chunking & Graph Ingest)"]
    end

    ChatEngine -->|Poll Telemetry| HealthEndpoint
    ChatEngine -->|Upload PDF| IngestEndpoint
    ChatEngine -->|Query Vector + Graph| ChatEndpoint
    AuthCtx -->|Transfer Guest History| MigrateEndpoint

    HealthEndpoint --> PostgresDB & QdrantDB & Neo4jDB & RedisCache
    IngestEndpoint --> CeleryWorkers
    CeleryWorkers --> QdrantDB & Neo4jDB
    ChatEndpoint --> RedisCache
    ChatEndpoint --> QdrantDB & Neo4jDB
```

---

## 🔄 End-to-End Operational Flows

### 1. Guest-to-Authenticated Session Migration Flow

Unauthenticated visitors can query the knowledge engine anonymously. When they register or sign in (via Google OAuth or credentials), their temporary conversation history is automatically transferred to their authenticated account.

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Front as Frontend (Client & Hooks)
    participant Auth as NextAuth (App Router)
    participant Back as FastAPI Engine (/api/v1)
    participant DB as Backend Storage (Postgres/Redis)

    Note over User,Front: 1. Anonymous / Guest State
    User->>Front: Open App & Send Prompt
    Front->>Front: Generate & persist "guest_session_id" (Cookie + LocalStorage)
    Front->>Back: POST /chat/ {"question": "...", "session_id": "guest_sess_..."}
    Back-->>Front: Return generated answer & citations

    Note over User,Auth: 2. Authentication Trigger
    User->>Front: Click "Sign in with Google" or Register
    alt Google OAuth
        Front->>Auth: signIn("google")
        Auth->>User: Redirect to accounts.google.com
        User->>Auth: Authorize & Return Callback
        Auth-->>Front: NextAuth Session Established (JWT)
    else Email / Password
        Front->>Auth: signIn("credentials", {email, password})
        Auth-->>Front: Authenticated Token Issued
    end

    Note over Front,Back: 3. Automatic Session Migration
    Front->>Front: Detect authentication with active "guest_session_id"
    Front->>Back: POST /auth/migrate-session {"guest_session_id": "...", "token": "..."}
    Back->>DB: Link guest conversations to authenticated user account
    Back-->>Front: 200 OK {"success": true, "session_id": "..."}
    Front->>Front: Clear guest cookie & transition to active authenticated session
    Front->>User: Display saved chat thread under user account
```

### 2. Hybrid GraphRAG Retrieval Pipeline

```mermaid
flowchart LR
    UserQuery(["User Query"]) --> SemanticCheck{"Cosine Sim > 0.95 in Redis?"}
    SemanticCheck -- "YES (Cache Hit)" --> FastReturn["Return Cached Answer (< 5ms)"]
    SemanticCheck -- "NO (Cache Miss)" --> ParallelRetrieval

    subgraph ParallelRetrieval ["Hybrid Search Execution"]
        QdrantSearch["Dense Vector Retrieval (Qdrant)"]
        Neo4jSearch["Multi-Hop Entity Traversal (Neo4j)"]
    end

    ParallelRetrieval --> LLMSynthesis["LangGraph Agentic Synthesis (Groq LLM)"]
    LLMSynthesis --> Response["Contextual Answer + Vector & Graph Citations"]
    Response --> SaveCache["Update Redis Semantic Cache"]
```

---

## 🌟 Core Features

- **Guest & Authenticated Chat**: Query the engine anonymously as a guest; conversations automatically migrate to your account upon signing in with Google or Email/Password.
- **Tenant Data Isolation**: Strict partitioning of vector chunks, knowledge graph triples, and chat sessions by `tenant_id`.
- **Hybrid Retrieval Thread**: Displays `⚡ Cache Hit` badges for Redis semantic cache lookups (< 5ms) and `🧠 GraphRAG Hybrid` badges for joint Qdrant + Neo4j retrievals.
- **Collapsible Context Inspector**: Deep inspection of raw retrieved vector chunks (similarity scores, filenames) and knowledge graph triples (subject-predicate-object relations).
- **Asynchronous Document Ingestion**: Drag-and-drop PDF ingestion dispatched to background Celery workers with real-time task tracking.
- **Live Infrastructure Telemetry**: Sidebar monitoring with background health checks for PostgreSQL, Qdrant, Neo4j, and Redis.
- **Flicker-Free Theme System**: Seamless dark and light themes with transition shielding to eliminate UI flashing.

---

## 📁 Project Directory Structure

```text
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts         # NextAuth GET/POST OAuth & credentials handler
│   ├── globals.css                  # Theme tokens, dark/light styles, scrollbars
│   ├── layout.tsx                   # Root layout, fonts, and metadata
│   ├── page.tsx                     # Main layout & chat workspace assembly
│   └── providers.tsx                # NextAuth SessionProvider & ThemeProvider
├── components/
│   ├── auth/
│   │   ├── AuthModal.tsx            # Multi-tenant login, registration & Google OAuth
│   │   └── Login.tsx                # Standalone credentials and Google sign-in module
│   ├── chat/
│   │   ├── ChatArea.tsx             # Message thread, citations, and context inspector
│   │   └── ChatInput.tsx            # Multiline text input with Shift+Enter submission
│   ├── ingest/
│   │   └── IngestModal.tsx          # Drag-and-drop PDF upload & Celery task log
│   ├── layout/
│   │   ├── Sidebar.tsx              # Sessions list, tenant switcher, health telemetry
│   │   └── ThemeToggle.tsx          # Instant dark/light mode toggle
│   └── settings/
│       ├── SettingsView.tsx         # Workspace settings & tenant management
│       └── WidgetIntegration.tsx    # Embeddable script generator for external sites
├── context/
│   └── AuthContext.tsx              # Authentication state, NextAuth sync, and tenant scope
├── hooks/
│   └── useChatSession.ts            # Guest lifecycle, active session routing, and migration
├── lib/
│   ├── api.ts                       # Fetch client for /health, /ingest, /chat, and migration
│   ├── auth.ts                      # NextAuth options (Google & Credentials providers)
│   ├── guestSession.ts              # Persistent cookie & localStorage guest session manager
│   └── utils.ts                     # Class name merging & timestamp formatters
└── types/
    └── chat.ts                      # TypeScript definitions for chat, health, and ingestion
```

---

## ⚙️ Environment Variables

Configure the following variables in a `.env` or `.env.local` file at the root:

```env
# Backend Base API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=9f7a3e21c8b45d07a16e89f234b67c81d09e5a32b78f14c2e69a03b57d81ef2a

# Google OAuth Provider (Google Cloud Console -> Credentials -> OAuth 2.0 Client IDs)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> [!IMPORTANT]
> **Google Cloud Console Settings**:
> Add the following to your **Authorized redirect URIs**:
> `http://localhost:3000/api/auth/callback/google`

---

## 🔗 Backend API Contract

Base URL: `http://127.0.0.1:8000/api/v1`

| Endpoint | Method | Payload / Params | Description |
| :--- | :---: | :--- | :--- |
| `/health/` | `GET` | — | Returns health status for PostgreSQL, Qdrant, Neo4j, and Redis. |
| `/ingest/` | `POST` | `multipart/form-data` (`file`, `tenant_id`) | Uploads PDF document and dispatches Celery background worker. |
| `/chat/` | `POST` | `{"question", "session_id", "tenant_id"}` | Hybrid GraphRAG query execution with semantic caching. |
| `/auth/migrate-session` | `POST` | `{"guest_session_id", "token"}` | Reassigns guest conversation history to the authenticated user. |

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Backend Service**: FastAPI backend running on `http://127.0.0.1:8000`

### 1. Installation

```bash
# Clone the repository and navigate into the directory
cd graph_rag_enterprise_engine_frontend

# Install dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
# Compile and optimize production bundle
npm run build

# Start production server
npm run start
```
