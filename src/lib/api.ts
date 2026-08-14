import { HealthStatus, IngestResponse, SendChatResponse } from '@/types/chat';

const getBaseUrls = (): string[] => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const urls: string[] = [];
  
  if (envUrl) {
    urls.push(envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl);
  }
  
  // Standard fallbacks to ensure connection works across localhost & 127.0.0.1
  if (!urls.includes('http://127.0.0.1:8000/api/v1')) {
    urls.push('http://127.0.0.1:8000/api/v1');
  }
  if (!urls.includes('http://localhost:8000/api/v1')) {
    urls.push('http://localhost:8000/api/v1');
  }
  
  return urls;
};

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Perform health check across PostgreSQL, Qdrant, Neo4j, and Redis.
 */
export async function checkHealth(): Promise<HealthStatus> {
  const timestamp = new Date().toISOString();
  const baseUrls = getBaseUrls();
  let lastError: Error | null = null;

  for (const baseUrl of baseUrls) {
    try {
      const endpoint = `${baseUrl}/health/`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200 || res.status === 503) {
        const detailsRaw = data.details || (typeof data.detail === 'object' ? data.detail?.details : {}) || {};
        const statusText = data.status || (typeof data.detail === 'object' ? data.detail?.status : 'unknown') || 'degraded';
        
        const postgres = detailsRaw.postgres || 'unhealthy';
        const qdrant = detailsRaw.qdrant || 'unhealthy';
        const neo4j = detailsRaw.neo4j || 'unhealthy';
        const redis = detailsRaw.redis || 'unhealthy';

        const isHealthy = res.status === 200 &&
          postgres === 'healthy' &&
          qdrant === 'healthy' &&
          neo4j === 'healthy' &&
          redis === 'healthy';

        return {
          status: statusText,
          details: {
            postgres: String(postgres),
            qdrant: String(qdrant),
            neo4j: String(neo4j),
            redis: String(redis),
          },
          isHealthy,
          lastChecked: timestamp,
        };
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error('Connection failed');
    }
  }

  return {
    status: 'offline',
    details: {
      postgres: 'unhealthy: backend unreachable',
      qdrant: 'unhealthy: backend unreachable',
      neo4j: 'unhealthy: backend unreachable',
      redis: 'unhealthy: backend unreachable',
    },
    isHealthy: false,
    lastChecked: timestamp,
    error: lastError?.message || 'Failed to connect to backend health service at http://127.0.0.1:8000/api/v1',
  };
}

/**
 * Upload PDF document for asynchronous ingestion via Celery worker.
 */
export async function uploadDocument(file: File): Promise<IngestResponse> {
  if (!file) {
    throw new ApiError('No file selected for upload.');
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new ApiError('Only PDF files are supported for ingestion.');
  }

  const baseUrls = getBaseUrls();
  let lastError: Error | null = null;

  for (const baseUrl of baseUrls) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${baseUrl}/ingest/`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detailMsg = typeof data.detail === 'string' ? data.detail : 'Document upload failed on backend';
        throw new ApiError(detailMsg, res.status, data);
      }

      return {
        task_id: data.task_id || 'unknown-task-id',
        message: data.message || `File ${file.name} uploaded successfully`,
        status: data.status || 'processing',
        filename: file.name,
      };
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      lastError = err instanceof Error ? err : new Error('Network upload failed');
    }
  }

  throw new ApiError(lastError?.message || 'Network error during file upload to backend.');
}

/**
 * Send query to LangGraph / Redis Semantic Cache Chat API.
 */
export async function sendChatMessage(question: string): Promise<SendChatResponse> {
  const trimmed = question.trim();
  if (!trimmed) {
    throw new ApiError('Question cannot be empty.');
  }

  const baseUrls = getBaseUrls();
  let lastError: Error | null = null;

  for (const baseUrl of baseUrls) {
    try {
      const res = await fetch(`${baseUrl}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detailMsg = typeof data.detail === 'string' ? data.detail : 'Chat request failed on backend';
        throw new ApiError(detailMsg, res.status, data);
      }

      const generationText = data.generation || data.answer || 'No answer generated by engine.';
      const cacheHit = Boolean(data.cache_hit);
      const vectorCtx = data.vector_context || (Array.isArray(data.sources?.vector_sources) ? data.sources.vector_sources : []);
      const graphCtx = data.graph_context || (Array.isArray(data.sources?.graph_relations) ? data.sources.graph_relations : []);
      const routeDecision = data.route_decision || (cacheHit ? 'cache' : 'hybrid');

      return {
        generation: generationText,
        cache_hit: cacheHit,
        route_decision: routeDecision,
        vector_context: vectorCtx,
        graph_context: graphCtx,
        sources: data.sources || {},
        question: data.question || trimmed,
      };
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      lastError = err instanceof Error ? err : new Error('Network chat request failed');
    }
  }

  throw new ApiError(lastError?.message || 'Network error communicating with Chat engine.');
}
