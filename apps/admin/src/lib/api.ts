/**
 * Klien HTTP untuk API ReactPress.
 *
 * Access token disimpan di memori modul (diisi oleh auth store), refresh token
 * memakai cookie httpOnly milik API sehingga tidak pernah menyentuh JS.
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Lewati otomatis refresh token (dipakai endpoint auth). */
  skipRefresh?: boolean;
  headers?: Record<string, string>;
}

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function buildQuery(
  query: Record<string, string | number | boolean | undefined | null> | undefined,
): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

function readError(payload: unknown, status: number): ApiError {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const body = payload as { error: unknown; details?: unknown };
    const message = typeof body.error === 'string' ? body.error : `Gagal (${status})`;
    return new ApiError(status, message, body.details);
  }
  return new ApiError(status, `Gagal memuat data (${status})`);
}

/**
 * Coba tukar refresh token (cookie httpOnly) dengan access token baru.
 * Semua pemanggilan menunggu hasil yang sama agar tidak ada refresh paralel.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!response.ok) return false;
        const payload = (await response.json()) as { accessToken?: string };
        if (!payload.accessToken) return false;
        setAccessToken(payload.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function send<T>(path: string, options: ApiFetchOptions): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    signal: options.signal,
  };

  if (options.body instanceof FormData) {
    init.body = options.body;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}${buildQuery(options.query)}`, init);

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text.length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !options.skipRefresh && !path.startsWith('/auth/')) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return send<T>(path, { ...options, skipRefresh: true });
      }
    }
    throw readError(payload, response.status);
  }

  return payload as T;
}

export function apiGet<T>(
  path: string,
  options: Omit<ApiFetchOptions, 'method' | 'body'> = {},
): Promise<T> {
  return send<T>(path, { ...options, method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown, options: ApiFetchOptions = {}): Promise<T> {
  return send<T>(path, { ...options, method: 'POST', body });
}

export function apiPatch<T>(path: string, body?: unknown, options: ApiFetchOptions = {}): Promise<T> {
  return send<T>(path, { ...options, method: 'PATCH', body });
}

export function apiDelete<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return send<T>(path, { ...options, method: 'DELETE' });
}

/** Unggah multipart (media). */
export function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return send<T>(path, { method: 'POST', body: form });
}

export const apiBaseUrl = BASE_URL;
