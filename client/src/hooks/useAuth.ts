import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
}
