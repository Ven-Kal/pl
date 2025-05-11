import { QueryClient, QueryFunction } from "@tanstack/react-query";

interface RequestConfig {
  method?: string;
  params?: Record<string, string>;
  body?: unknown;
  url?: string;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrConfig: string | RequestConfig,
  config?: RequestConfig
): Promise<Response> {
  let url: string;
  let finalConfig: RequestConfig;

  if (typeof urlOrConfig === 'string') {
    url = urlOrConfig;
    finalConfig = config || {};
  } else {
    url = urlOrConfig.url || '';
    finalConfig = urlOrConfig;
  }

  // Build URL with query parameters if they exist
  if (finalConfig?.params) {
    const params = new URLSearchParams();
    Object.entries(finalConfig.params).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value);
      }
    });
    url = `${url}?${params.toString()}`;
  }

  const res = await fetch(url, {
    method: finalConfig?.method || 'GET',
    headers: finalConfig?.body ? { "Content-Type": "application/json" } : {},
    body: finalConfig?.body ? JSON.stringify(finalConfig.body) : undefined,
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
    const res = await apiRequest(queryKey[0] as string);

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