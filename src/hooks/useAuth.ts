import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check if we're in test mode (development)
  const isTestMode = window.location.search.includes('test=true');


  const userUid = typeof window !== 'undefined' ? localStorage.getItem('userUid') : null;
  const { data: user, isLoading, error } = useQuery({
    queryKey: isTestMode ? ["/api/auth/test-user"] : ["/api/auth/user", userUid],
    retry: false,
    queryFn: async () => {
      try {
        if (isTestMode) {
          const res = await fetch("/api/auth/test-user");
          if (!res.ok) return null;
          const data = await res.json();
          console.log("[useAuth] test-user API yanıtı:", data);
          return data;
        }
        if (!userUid) return null;
        const res = await fetch("/api/auth/user", {
          headers: { 'x-user-uid': userUid }
        });
        if (!res.ok) {
          console.error("[useAuth] /api/auth/user yanıtı başarısız:", res.status);
          return null;
        }
        const data = await res.json();
        console.log("[useAuth] /api/auth/user API yanıtı:", data);
        return data;
      } catch (err) {
        // Hata olursa null döndür, loading false olur
        return null;
      }
    },
  });

  const effectiveUser = user || (userUid ? { uid: userUid } : null);

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userUid');
      window.location.href = '/auth';
    }
  }

  return {
    user: effectiveUser,
    isLoading,
    isAuthenticated: !!effectiveUser,
    logout,
  };
}
