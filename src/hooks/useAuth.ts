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
    queryFn: async () => {
      if (isTestMode) {
        const res = await fetch("/api/auth/test-user");
        return res.json();
      }
      if (!userUid) return null;
      if (userUid === "demo-uid-123") {
        try {
          const res = await fetch("/api/auth/user", {
            headers: { "x-user-uid": userUid }
          });
          if (!res.ok) throw new Error("Demo oturumu doğrulanamadı");
          return res.json();
        } catch (err) {
          console.warn("Demo oturumuna çevrimdışı modda devam ediliyor.", err);
          return demoUser;
        }
      }
      const res = await fetch("/api/auth/user", {
        headers: { 'x-user-uid': userUid }
      });
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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
