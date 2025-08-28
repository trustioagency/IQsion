import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const isTestMode = window.location.search.includes('test=true');
  const userUid = typeof window !== 'undefined' ? localStorage.getItem('userUid') : null;
  const { data: user, isLoading, error } = useQuery({
    queryKey: isTestMode ? ["/api/auth/test-user"] : ["/api/auth/user", userUid],
    retry: false,
    queryFn: async () => {
      if (isTestMode) {
        const res = await fetch("/api/auth/test-user");
        return res.json();
      }
      if (!userUid) return null;
      const res = await fetch("/api/auth/user", {
        headers: { 'x-user-uid': userUid }
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
