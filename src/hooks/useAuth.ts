import { useQuery } from "@tanstack/react-query";

function getLocalStorageItem(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn("localStorage erişimi yapılamadı, varsayılan değer kullanılıyor.", error);
    return null;
  }
}

export function useAuth() {
  const isTestMode = typeof window !== "undefined" && window.location.search.includes("test=true");
  const userUid = getLocalStorageItem("userUid");
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
