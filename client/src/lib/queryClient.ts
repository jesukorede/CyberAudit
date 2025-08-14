import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const res = await fetch(url, {
          credentials: 'include',
        });
        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`Server error: ${res.status}`);
          }
          if (res.status === 404) {
            throw new Error("Not found");
          }
          if (res.status === 401) {
            throw new Error("Unauthorized");
          }
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      },
      staleTime: 1000 * 60, // 1 minute
      retry: (failureCount, error) => {
        if (error.message.includes('Unauthorized')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error: ${response.status}`);
  }

  return response.json();
}

export { queryClient };
