import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

// Basit fetch timeout helper: ağ takılmalarında yükleme ekranında kalmayı önler
async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeoutMs = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...(init || {}), signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

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
  const demoUser = {
    uid: "demo-uid-123",
    email: "demo@demo.com",
    firstName: "Demo",
    lastName: "Kullanıcı",
    companyName: "Demo Şirketi",
    profileImageUrl: "",
  };
  const { data: user, isLoading, error } = useQuery({
    queryKey: isTestMode ? ["/api/auth/test-user"] : ["/api/auth/user", userUid],
    retry: false,
    enabled: isTestMode || !!userUid, // Sadece gerekli olduğunda çalıştır
    queryFn: async () => {
      if (isTestMode) {
        const res = await apiRequest("GET", "/api/auth/test-user");
        return res.json();
      }
      if (!userUid) return null;
      if (userUid === "demo-uid-123") {
        try {
          const res = await apiRequest("GET", "/api/auth/user", undefined);
          // Not: demo modunda kimlik, header yerine backend tarafından mocklanır
          if (!res.ok) throw new Error("Demo oturumu doğrulanamadı");
          return res.json();
        } catch (err) {
          console.warn("Demo oturumuna çevrimdışı modda devam ediliyor.", err);
          return demoUser;
        }
      }
      const res = await fetchWithTimeout("/api/auth/user", {
        headers: { 'x-user-uid': userUid }
      }, 6000);
      if (!res.ok) return null;
      try {
        return await res.json();
      } catch (err) {
        console.warn("Kullanıcı bilgileri çözümlenemedi.", err);
        return null;
      }
    },
  });

  const logout = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("userUid");
      }
    } catch (err) {
      // ignore
    }
    // Yönlendirme: test=true parametresini de temizleyerek /auth'a gönder
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  };

  // userUid yoksa sorgu disabled olduğundan isLoading hep false kabul edilir
  const effectiveLoading = (isTestMode || !!userUid) ? isLoading : false;

  return {
    user,
    isLoading: effectiveLoading,
    isAuthenticated: !!user,
    logout,
  };
}
