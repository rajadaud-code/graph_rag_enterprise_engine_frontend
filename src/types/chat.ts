export type HealthServiceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface HealthDetails {
  postgres: string;
  qdrant: string;
  neo4j: string;
  redis: string;
}

export interface HealthStatus {
  status: string;
  details: HealthDetails;
  isHealthy: boolean;
  lastChecked?: string;
  error?: string;
}

export interface IngestResponse {
  task_id: string;
  message: string;
  status: string;
  filename?: string;
}

export interface IngestTask {
  taskId: string;
  filename: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  message?: string;
  fileSize?: string;
}

export interface VectorContextItem {
  filename?: string;
  content?: string;
  text?: string;
  score?: number;
  chunk_id?: string | number;
  metadata?: Record<string, unknown>;
}

export interface GraphContextItem {
  entity?: string;
  subject?: string;
  predicate?: string;
  relationship?: string;
  object?: string;
  target?: string;
  description?: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cacheHit?: boolean;
  routeDecision?: string;
  vectorContext?: (string | VectorContextItem)[];
  graphContext?: (string | GraphContextItem)[];
  sources?: Record<string, unknown>;
  timestamp: string;
  isError?: boolean;
}

export interface SendChatResponse {
  generation: string;
  cache_hit: boolean;
  route_decision?: string;
  vector_context?: (string | VectorContextItem)[];
  graph_context?: (string | GraphContextItem)[];
  sources?: Record<string, unknown>;
  question?: string;
}
