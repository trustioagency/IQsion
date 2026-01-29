import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin)
  ? (window.location.port === '5173' 
      ? 'http://127.0.0.1:5001' 
      : 'https://iqsion-api-839632752295.us-central1.run.app')
  : 'http://127.0.0.1:5001';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Admin key'i sadece /api/ingest ve /api/cron endpoint'lerine gönder
  // Production'da build time'da inject edilir, yoksa boş string
  const requiresAdminKey = url.includes('/api/ingest') || url.includes('/api/cron');
  
  if (requiresAdminKey) {
    try {
      const adminKey = (import.meta as any)?.env?.VITE_ADMIN_API_KEY || '';
      if (adminKey && typeof adminKey === 'string') {
        headers['x-admin-key'] = adminKey;
      }
    } catch (e) {
      console.error('[apiRequest] Error accessing admin key:', e);
    }
  }
  
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(`${API_BASE}${queryKey.join("/") as string}`, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
