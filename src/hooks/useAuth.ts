import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check if we're in test mode (development)
  const isTestMode = window.location.search.includes('test=true');
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: isTestMode ? ["/api/auth/test-user"] : ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
