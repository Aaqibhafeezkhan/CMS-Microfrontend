export type CmsEventName =
  | 'auth:login' | 'auth:logout'
  | 'article:created' | 'article:updated' | 'article:status_changed' | 'article:published' | 'article:deleted'
  | 'comment:created' | 'comment:resolved'
  | 'media:uploaded' | 'media:updated' | 'media:selected' | 'media:deleted';

export interface CmsEventDetail {
  version?: number;
  occurredAt?: string;
  source?: string;
  user?: { id: string; name?: string; email?: string; role?: string };
  articleId?: string;
  commentId?: string;
  assetId?: string;
  id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CmsPlatform {
  readonly version: number;
  readonly events: readonly CmsEventName[];
  readonly storageKeys: Readonly<Record<string, string>>;
  validateEvent(name: string, detail: CmsEventDetail): { valid: boolean; reason?: string };
  publish(name: CmsEventName, detail: CmsEventDetail): boolean;
  subscribe(name: CmsEventName, handler: (event: CustomEvent<CmsEventDetail>) => void): () => void;
  read<T>(key: string, fallback: T): T;
  write(key: string, value: unknown): boolean;
  getSession(): { user: CmsEventDetail['user']; issuedAt: number; expiresAt: number } | null;
}

declare global { interface Window { CMSPlatform?: CmsPlatform; } }
