import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest, queryClient } from "../lib/queryClient";
import { type User as UserType } from "../types/user";
import { 
  User, 
  Building, 
  Link, 
  CheckCircle, 
  X, 
  Loader2,
  Settings as SettingsIcon,
  Zap,
  Globe
} from "lucide-react";

interface BrandProfile {
  businessModel?: string;
  industry?: string;
  customerType?: string;
  brandMaturity?: string;
  companySize?: string;
  marketingGoal?: string;
  websiteUrl?: string;
  monthlyRevenue?: string;
  monthlyAdBudget?: string;
  mainCompetitors?: string;
  targetAudienceDescription?: string;
  brandVoice?: string;
}

interface PlatformConnection {
  platform: string;
  isConnected: boolean;
  accountName?: string;
  lastSyncAt?: string;
  propertyId?: string;
}

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<BrandProfile>({} as BrandProfile);
  const [selectedGaPropertyId, setSelectedGaPropertyId] = useState<string>('');
  const [isEditingShopifyStore, setIsEditingShopifyStore] = useState<boolean>(false);
  const [shopifyStoreDraft, setShopifyStoreDraft] = useState<string>('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const isTestMode = window.location.search.includes('test=true');
      if (!isTestMode) {
        toast({
          title: "Giriş Gerekli",
          description: "Lütfen giriş yapın veya test modunu deneyin",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/?test=true";
        }, 1000);
      }
    }
  }, [user, authLoading, toast]);

  // OAuth dönüşünde bağlantı durumunu hemen yansıt (UX)
  useEffect(() => {
    if (!user) return;
    const uid = (user as any)?.uid || (user as any)?.id;
    const params = new URLSearchParams(window.location.search);
    const connection = params.get('connection');
    const platform = params.get('platform');
    if (connection === 'success' && platform) {
      queryClient.setQueryData(['connections', uid], (prev: any) => ({
        ...(prev || {}),
        [platform]: {
          ...((prev && (prev as any)[platform]) || {}),
          isConnected: true,
        },
      }));
      // Sunucudan gerçek durumu tekrar çek (öbür bağlantılar etkilenmesin)
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      // URL'i temizle
      const url = new URL(window.location.href);
      url.searchParams.delete('connection');
      url.searchParams.delete('platform');
      window.history.replaceState({}, '', url.toString());
    }
  }, [user]);

  const { data: brandProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['brand-profile', (user as any)?.uid || (user as any)?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id;
      const res = await apiRequest('GET', `/api/brand-profile?userId=${encodeURIComponent(uid || 'test-user')}`);
      if (!res.ok) return {};
      return await res.json();
    }
  });

  const { data: connections } = useQuery({
    queryKey: ['connections', (user as any)?.uid || (user as any)?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/connections?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return {};
      return await res.json();
    }
  });

  // Google Ads accounts list (for selection UI)
  const { data: googleAdAccounts, refetch: refetchGoogleAdsAccounts } = useQuery({
    queryKey: ['googleads-accounts', (user as any)?.uid || (user as any)?.id],
    enabled: !!user && !!(connections as any)?.google_ads?.isConnected,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/googleads/accounts?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return { accounts: [] } as any;
      return await res.json();
    }
  });

  // Meta ad accounts list (for selection UI)
  const { data: metaAdAccounts } = useQuery({
    queryKey: ['meta-adaccounts', (user as any)?.uid || (user as any)?.id],
    enabled: !!user && !!(connections as any)?.meta_ads?.isConnected,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/meta/adaccounts?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return { data: [] } as any;
      return await res.json();
    }
  });

  // Sync local GA property state when connections load/update
  useEffect(() => {
    const conn = (connections as any)?.google_analytics;
    if (conn && typeof conn.propertyId === 'string') {
      setSelectedGaPropertyId(conn.propertyId);
    }
  }, [connections]);

  // Google Analytics properties listesi
  const { data: gaProperties, isLoading: gaPropsLoading } = useQuery({
    queryKey: ['ga-properties', (user as any)?.uid || (user as any)?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/analytics/properties?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return { properties: [] } as any;
      return await res.json();
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: BrandProfile) => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const response = await apiRequest('POST', `/api/brand-profile?userId=${encodeURIComponent(uid)}`, data);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Profile update failed');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brand profile updated successfully",
      });
  queryClient.invalidateQueries({ queryKey: ['brand-profile'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update brand profile",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (brandProfile) {
      setProfileData(brandProfile);
    }
  }, [brandProfile]);

  const handleSave = () => {
    profileMutation.mutate(profileData);
  };

  const handleInputChange = (field: keyof BrandProfile, value: string) => {
    setProfileData((prev: BrandProfile) => ({ ...(prev || {}), [field]: value }));
  };

  const handleConnectPlatform = async (platformId: string) => {
    try {
      if (!user) return;
      
      const uid = ((user as any)?.uid || (user as any)?.id) as string | undefined;
      let authUrl = '';
      const baseUrl = window.location.origin;
      
      switch (platformId) {
        case 'shopify': {
          // Eğer bağlantı kayıtlarında mağaza zaten biliniyorsa direkt yönlendir (prompt yok)
          const savedStore = (connections as any)?.shopify?.storeUrl as string | undefined;
          let storeUrl = savedStore || localStorage.getItem('iqsion_shopify_store') || '';
          if (!storeUrl) {
            // Son çare: kısa isim al (örn: mystore); kullanıcı istemiyorsa Cancel edebilir
            const name = prompt('Shopify mağaza adınızı girin (örn: mystore veya mystore.myshopify.com):') || '';
            if (!name) return;
            storeUrl = name;
          }
          // Normalizasyon: sadece isim verildiyse domain ekle; protocol varsa kırp
          storeUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
          if (!/\.myshopify\.com$/i.test(storeUrl)) {
            storeUrl = `${storeUrl}.myshopify.com`;
          }
          try { localStorage.setItem('iqsion_shopify_store', storeUrl); } catch (_) {}
          authUrl = `/api/auth/shopify/connect?storeUrl=${encodeURIComponent(storeUrl)}${uid ? `&userId=${encodeURIComponent(uid)}` : ''}`;
          break; }
        case 'google_ads':
          authUrl = `/api/auth/googleads/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'meta_ads':
          authUrl = `/api/auth/meta/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'google_analytics':
          authUrl = `/api/auth/google/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'tiktok':
          toast({ title: 'Bilgi', description: 'TikTok entegrasyonu yakında eklenecek.' });
          return;
          break;
        case 'google_search_console':
          toast({ title: 'Bilgi', description: 'Search Console entegrasyonu yakında eklenecek.' });
          return;
          break;
        default:
          toast({
            title: "Hata",
            description: "Bu platform henüz desteklenmiyor",
            variant: "destructive",
          });
          return;
      }

      toast({
        title: "Yönlendiriliyor",
        description: `${platforms.find(p => p.id === platformId)?.name} OAuth sayfasına yönlendiriliyorsunuz`,
      });

      // OAuth sayfasına yönlendir
      window.location.href = authUrl;
      
    } catch (error) {
      toast({
        title: "Hata",
        description: "Platform bağlantısı başarısız",
        variant: "destructive",
      });
    }
  };

  // Yardımcı: Shopify domain normalize et
  const normalizeShopDomain = (val: string) => {
    let s = (val || '').trim();
    s = s.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!s) return '';
    if (!/\.myshopify\.com$/i.test(s)) s = `${s}.myshopify.com`;
    return s.toLowerCase();
  };

  const handleSaveShopifyStore = async () => {
    try {
      const uid = (user as any)?.uid || (user as any)?.id;
      const normalized = normalizeShopDomain(shopifyStoreDraft);
      if (!normalized) {
        toast({ title: 'Hata', description: 'Geçerli bir mağaza adı girin', variant: 'destructive' });
        return;
      }
      const resp = await apiRequest('POST', '/api/connections', { platform: 'shopify', storeUrl: normalized, userId: uid });
      await resp.json();
      try { localStorage.setItem('iqsion_shopify_store', normalized); } catch (_) {}
      // Cache'i anında güncelle
      queryClient.setQueryData(['connections', uid], (prev: any) => ({
        ...(prev || {}),
        shopify: {
          ...(((prev as any)?.shopify) || {}),
          storeUrl: normalized,
          // Bağlı değilse bile mağaza bilgisi güncel olsun
          isConnected: (prev as any)?.shopify?.isConnected || false,
        }
      }));
      toast({ title: 'Kaydedildi', description: `Mağaza: ${normalized}` });
      setIsEditingShopifyStore(false);
    } catch (e) {
      toast({ title: 'Hata', description: 'Mağaza kaydedilemedi', variant: 'destructive' });
    }
  };

  const handleClearShopifyStore = async () => {
    try {
      const uid = (user as any)?.uid || (user as any)?.id;
      try { localStorage.removeItem('iqsion_shopify_store'); } catch (_) {}
      // Sunucudaki bağlantıyı kaldır (storeUrl/token temizlenir)
      await apiRequest('POST', '/api/disconnect', { platform: 'shopify', userId: uid });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast({ title: 'Temizlendi', description: 'Shopify mağaza bilgisi sıfırlandı' });
      setShopifyStoreDraft('');
      setIsEditingShopifyStore(true);
    } catch (_) {
      toast({ title: 'Hata', description: 'Mağaza temizlenemedi', variant: 'destructive' });
    }
  };

  const handleDisconnectPlatform = async (platformId: string) => {
    try {
      const uid = (user as any)?.uid || (user as any)?.id;
      await apiRequest('POST', '/api/disconnect', { platform: platformId, userId: uid });
      
      toast({
        title: "Başarılı",
        description: "Platform bağlantısı kesildi",
      });
      
  queryClient.invalidateQueries({ queryKey: ['connections'] });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Platform bağlantısı kesilemedi",
        variant: "destructive",
      });
    }
  };

  const handleTestMetaConnection = async () => {
    try {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/meta/adaccounts?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (data && data.data && data.data.length) {
        toast({ title: 'Meta bağlandı', description: `${data.data.length} hesap bulundu. Örn: ${data.data[0].name || data.data[0].id}` });
      } else if (data && data.accounts) {
        toast({ title: 'Meta bağlandı', description: `${data.accounts.length} hesap bulundu.` });
      } else {
        toast({ title: 'Bağlantı doğrulanamadı', description: 'Hesaplar alınamadı.' , variant: 'destructive'});
      }
    } catch (e: any) {
      toast({ title: 'Meta bağlantı hatası', description: e?.message || 'Doğrulama başarısız', variant: 'destructive' });
    }
  };

  const handleSaveGoogleAnalyticsProperty = async (propertyId: string) => {
    try {
      const uid = (user as any)?.uid || (user as any)?.id;
      const resp = await apiRequest('POST', '/api/connections', {
        platform: 'google_analytics',
        propertyId,
        userId: uid,
      });
      await resp.json();
      toast({ title: 'Başarılı', description: 'Google Analytics property seçimi kaydedildi' });
      // Update local cache immediately
      queryClient.setQueryData(['connections', uid], (prev: any) => ({
        ...(prev || {}),
        google_analytics: {
          ...((prev && prev.google_analytics) || {}),
          propertyId,
          isConnected: true,
        }
      }));
      // Make related queries stale so they refetch with new property
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['ga-summary'] });
    } catch (e) {
      toast({ title: 'Hata', description: 'Property kaydedilemedi', variant: 'destructive' });
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const platformIcons: Record<string, any> = {
    shopify: <Building className="w-5 h-5" />,
    meta_ads: <Zap className="w-5 h-5" />,
    google_ads: <Globe className="w-5 h-5" />,
    google_analytics: <Globe className="w-5 h-5" />,
    google_search_console: <Globe className="w-5 h-5" />,
    tiktok: <User className="w-5 h-5" />,
  };

  const platforms = [
    { id: 'shopify', name: 'Shopify', description: 'E-ticaret platformu bağlantısı' },
    { id: 'meta_ads', name: 'Meta Ads', description: 'Facebook ve Instagram reklamları' },
    { id: 'google_ads', name: 'Google Ads', description: 'Google reklam kampanyaları' },
    { id: 'google_analytics', name: 'Google Analytics', description: 'Website analizi ve trafik verileri' },
    { id: 'google_search_console', name: 'Google Search Console', description: 'Arama motoru optimizasyonu verileri' },
    { id: 'tiktok', name: 'TikTok Ads', description: 'TikTok reklam platformu' },
  ];

  const handleTestShopifyConnection = async () => {
    const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
    try {
      // Önce hangi scope'lar var görelim
      const scopesRes = await apiRequest('GET', `/api/shopify/access-scopes?userId=${encodeURIComponent(uid)}`);
      let scopesList: string[] = [];
      if (scopesRes.ok) {
        const scopesJson = await scopesRes.json();
        scopesList = Array.isArray(scopesJson.access_scopes) ? scopesJson.access_scopes.map((s: any) => s.handle) : [];
      }
      const hasReadOrders = scopesList.includes('read_orders');
      const hasReadAllOrders = scopesList.includes('read_all_orders');
      const missingOrdersScope = !hasReadOrders;

      const [productsRes, customersRes, ordersRes] = await Promise.all([
        apiRequest('GET', `/api/shopify/products?userId=${encodeURIComponent(uid)}`),
        apiRequest('GET', `/api/shopify/customers?userId=${encodeURIComponent(uid)}`),
        apiRequest('GET', `/api/shopify/data?userId=${encodeURIComponent(uid)}`),
      ]);
      const productsJson = await productsRes.json().catch(() => ({}));
      const customersJson = await customersRes.json().catch(() => ({}));
      const ordersJson = await ordersRes.json().catch(() => ({}));
      if (!productsRes.ok || !customersRes.ok || !ordersRes.ok) {
        const msg = productsJson?.details || customersJson?.details || ordersJson?.details || 'Veri çekilemedi';
        // Özel yönlendirme: read_orders izni yoksa kullanıcıya açıklayıcı mesaj ver
        if (missingOrdersScope) {
          throw new Error('Orders verisini çekmek için read_orders izni gerekli. Uygulama ayarlarında Admin API scopes altında "Read orders" (ve 60+ gün için "read_all_orders") işaretli olmalı; ardından uygulamayı yeniden yetkilendirmeniz gerekir.');
        }
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
      const productsCount = Array.isArray(productsJson.products) ? productsJson.products.length : (productsJson.count || 0);
      const customersCount = Array.isArray(customersJson.customers) ? customersJson.customers.length : (customersJson.count || 0);
      const ordersCount = Array.isArray(ordersJson.orders) ? ordersJson.orders.length : (Array.isArray(ordersJson) ? ordersJson.length : 0);
      toast({ title: 'Shopify OK', description: `Ürün: ${productsCount}, Müşteri: ${customersCount}, Sipariş: ${ordersCount}` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Veri çekilemedi';
      toast({ title: 'Shopify hata', description: msg, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">

            {/* User Profile */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5" />
                  Kullanıcı Profili
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={(user as UserType)?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {(user as UserType)?.firstName} {(user as UserType)?.lastName}
                    </h3>
                    <p className="text-slate-400">{(user as UserType)?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Connections */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Link className="w-5 h-5" />
                  Platform Bağlantıları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms.map((platform) => {
                    const connectionsMap = (connections as any as Record<string, PlatformConnection>) || {};
                    const connection = connectionsMap[platform.id];
                    const isConnected = connection?.isConnected || false;

                    return (
                      <Card key={platform.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {platformIcons[platform.id]}
                              <div>
                                <h4 className="font-semibold text-white capitalize">
                                  {platform.name}
                                </h4>
                                {connection?.accountName && (
                                  <p className="text-sm text-slate-400">
                                    {connection.accountName}
                                  </p>
                                )}
                                {/* Google Analytics property seçimi */}
                                {platform.id === 'google_analytics' && isConnected && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="block text-xs text-slate-400">Property</label>
                                      {selectedGaPropertyId && (
                                        <span className="text-[10px] text-slate-500">Seçili: {selectedGaPropertyId}</span>
                                      )}
                                    </div>
                                    <Select
                                      value={selectedGaPropertyId || ''}
                                      onValueChange={(value) => {
                                        setSelectedGaPropertyId(value);
                                        handleSaveGoogleAnalyticsProperty(value);
                                      }}
                                    >
                                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-9">
                                        <SelectValue placeholder={gaPropsLoading ? 'Yükleniyor…' : 'Property seç'} />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-700 max-h-64 overflow-auto">
                                        {(gaProperties?.properties || []).length === 0 && (
                                          <div className="px-3 py-2 text-slate-400 text-sm">Uygun property bulunamadı</div>
                                        )}
                                        {(gaProperties?.properties || []).map((p: any) => (
                                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {/* Google Ads hesap seçimi */}
                                {platform.id === 'google_ads' && isConnected && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="block text-xs text-slate-400">Reklam Hesabı</label>
                                      {(connections as any)?.google_ads?.accountId && (
                                        <span className="text-[10px] text-slate-500">Seçili: {(connections as any).google_ads.accountId}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                    <Select
                                      value={(connections as any)?.google_ads?.accountId || ''}
                                      onValueChange={async (value) => {
                                        const uid = (user as any)?.uid || (user as any)?.id;
                                        try {
                                          const resp = await apiRequest('POST', '/api/connections', {
                                            platform: 'google_ads',
                                            accountId: value,
                                            userId: uid,
                                          });
                                          await resp.json();
                                          toast({ title: 'Başarılı', description: 'Google Ads hesabı güncellendi' });
                                          queryClient.setQueryData(['connections', uid], (prev: any) => ({
                                            ...(prev || {}),
                                            google_ads: {
                                              ...((prev && prev.google_ads) || {}),
                                              accountId: value,
                                              isConnected: true,
                                            },
                                          }));
                                        } catch (e) {
                                          toast({ title: 'Hata', description: 'Hesap seçimi kaydedilemedi', variant: 'destructive' });
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-9">
                                        <SelectValue placeholder={!googleAdAccounts ? 'Yükleniyor…' : ((googleAdAccounts?.accounts||[]).length ? 'Hesap seç' : 'Hesap bulunamadı')} />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-700 max-h-64 overflow-auto">
                                        {!(googleAdAccounts?.accounts || []).length && (
                                          <div className="px-3 py-2 text-slate-400 text-sm">Hesap bulunamadı</div>
                                        )}
                                        {(googleAdAccounts?.accounts || []).map((acc: any) => (
                                          <SelectItem key={acc.id} value={acc.id}>{acc.displayName || acc.id}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {/* MCC ID entry to enable auto-listing via GAQL */}
                                    <Input
                                      placeholder="MCC (Yönetici) ID"
                                      defaultValue={(connections as any)?.google_ads?.loginCustomerId || ''}
                                      className="bg-slate-800 border-slate-700 text-slate-200 h-9 w-44"
                                      onBlur={async (e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        const uid = (user as any)?.uid || (user as any)?.id;
                                        try {
                                          const resp = await apiRequest('POST', '/api/connections', {
                                            platform: 'google_ads',
                                            loginCustomerId: value,
                                            userId: uid,
                                          });
                                          await resp.json();
                                          toast({ title: 'MCC kaydedildi', description: value ? `MCC: ${value}` : 'Boş' });
                                          refetchGoogleAdsAccounts();
                                        } catch (_) {}
                                      }}
                                    />
                                    {/* Manual entry fallback */}
                                    <Input
                                      placeholder="Müşteri ID gir (xxx-xxx-xxxx)"
                                      className="bg-slate-800 border-slate-700 text-slate-200 h-9 w-48"
                                      onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                          const value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
                                          if (!value) return;
                                          const uid = (user as any)?.uid || (user as any)?.id;
                                          try {
                                            const resp = await apiRequest('POST', '/api/connections', {
                                              platform: 'google_ads',
                                              accountId: value,
                                              userId: uid,
                                            });
                                            await resp.json();
                                            toast({ title: 'Kaydedildi', description: `Hesap ${value} seçildi` });
                                            queryClient.setQueryData(['connections', uid], (prev: any) => ({
                                              ...(prev || {}),
                                              google_ads: {
                                                ...((prev && prev.google_ads) || {}),
                                                accountId: value,
                                                isConnected: true,
                                              },
                                            }));
                                          } catch (err) {
                                            toast({ title: 'Hata', description: 'Hesap kaydedilemedi', variant: 'destructive' });
                                          }
                                        }
                                      }}
                                    />
                                    </div>
                                  </div>
                                )}
                                {/* Meta Ads hesap seçimi */}
                                {platform.id === 'meta_ads' && isConnected && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="block text-xs text-slate-400">Reklam Hesabı</label>
                                      {(connections as any)?.meta_ads?.accountId && (
                                        <span className="text-[10px] text-slate-500">Seçili: {(connections as any).meta_ads.accountId}</span>
                                      )}
                                    </div>
                                    <Select
                                      value={(connections as any)?.meta_ads?.accountId || ''}
                                      onValueChange={async (value) => {
                                        const uid = (user as any)?.uid || (user as any)?.id;
                                        try {
                                          const resp = await apiRequest('POST', '/api/connections', {
                                            platform: 'meta_ads',
                                            accountId: value,
                                            userId: uid,
                                          });
                                          await resp.json();
                                          toast({ title: 'Başarılı', description: 'Meta reklam hesabı güncellendi' });
                                          // Update local cache immediately
                                          queryClient.setQueryData(['connections', uid], (prev: any) => ({
                                            ...(prev || {}),
                                            meta_ads: {
                                              ...((prev && prev.meta_ads) || {}),
                                              accountId: value,
                                              isConnected: true,
                                            },
                                          }));
                                        } catch (e) {
                                          toast({ title: 'Hata', description: 'Hesap seçimi kaydedilemedi', variant: 'destructive' });
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-9">
                                        <SelectValue placeholder={!metaAdAccounts ? 'Yükleniyor…' : 'Hesap seç'} />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-700 max-h-64 overflow-auto">
                                        {!(metaAdAccounts?.data || []).length && (
                                          <div className="px-3 py-2 text-slate-400 text-sm">Hesap bulunamadı</div>
                                        )}
                                        {(metaAdAccounts?.data || []).map((acc: any) => (
                                          <SelectItem key={acc.id} value={acc.id}>{acc.name || acc.id}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                {/* Shopify mağaza düzenleme */}
                                {platform.id === 'shopify' && (
                                  <div className="mt-2 space-y-2">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                      <span>Mağaza</span>
                                      {!isEditingShopifyStore && (
                                        <button
                                          className="underline hover:text-slate-300"
                                          onClick={() => {
                                            const current = ((connections as any)?.shopify?.storeUrl as string) || localStorage.getItem('iqsion_shopify_store') || '';
                                            setShopifyStoreDraft(current);
                                            setIsEditingShopifyStore(true);
                                          }}
                                        >
                                          Mağazayı değiştir
                                        </button>
                                      )}
                                    </div>
                                    {!isEditingShopifyStore ? (
                                      <div className="text-sm text-slate-300">
                                        {((connections as any)?.shopify?.storeUrl as string) || localStorage.getItem('iqsion_shopify_store') || '—'}
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Input
                                          placeholder="mystore veya mystore.myshopify.com"
                                          value={shopifyStoreDraft}
                                          onChange={(e) => setShopifyStoreDraft(e.target.value)}
                                          className="bg-slate-800 border-slate-700 text-slate-200 h-9 w-72"
                                        />
                                        <Button size="sm" className="bg-slate-600 hover:bg-slate-500 text-white" onClick={handleSaveShopifyStore}>
                                          Kaydet
                                        </Button>
                                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300" onClick={() => setIsEditingShopifyStore(false)}>
                                          İptal
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={handleClearShopifyStore}>
                                          Mağaza bilgisini temizle
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isConnected ? (
                                <>
                                  <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Bağlı
                                  </Badge>
                                  {platform.id === 'meta_ads' && (
                                    <Button size="sm" className="bg-slate-600 hover:bg-slate-500 text-white" onClick={handleTestMetaConnection}>
                                      Bağlantıyı test et
                                    </Button>
                                  )}
                                  {platform.id === 'shopify' && (
                                    <Button size="sm" className="bg-slate-600 hover:bg-slate-500 text-white" onClick={handleTestShopifyConnection}>
                                      Bağlantıyı test et
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-slate-600 text-slate-300"
                                    onClick={() => handleDisconnectPlatform(platform.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => handleConnectPlatform(platform.id)}
                                >
                                  Bağla
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Brand Profile */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Building className="w-5 h-5" />
                  Marka Profili
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      İş Modeli
                    </label>
                    <Select
                      value={profileData.businessModel || ''}
                      onValueChange={(value) => handleInputChange('businessModel', value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="E-Ticaret">E-Ticaret</SelectItem>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="Hizmet Sağlayıcı">Hizmet Sağlayıcı</SelectItem>
                        <SelectItem value="Mobil Uygulama">Mobil Uygulama</SelectItem>
                        <SelectItem value="İçerik Yayıncısı">İçerik Yayıncısı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sektör
                    </label>
                    <Select
                      value={profileData.industry || ''}
                      onValueChange={(value) => handleInputChange('industry', value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="Moda & Giyim">Moda & Giyim</SelectItem>
                        <SelectItem value="Sağlık & Wellness">Sağlık & Wellness</SelectItem>
                        <SelectItem value="Teknoloji & Yazılım">Teknoloji & Yazılım</SelectItem>
                        <SelectItem value="Finans & Sigorta">Finans & Sigorta</SelectItem>
                        <SelectItem value="Yiyecek & İçecek">Yiyecek & İçecek</SelectItem>
                        <SelectItem value="Eğitim">Eğitim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Müşteri Tipi
                    </label>
                    <Select
                      value={profileData.customerType || ''}
                      onValueChange={(value) => handleInputChange('customerType', value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="B2C">B2C</SelectItem>
                        <SelectItem value="B2B">B2B</SelectItem>
                        <SelectItem value="Her ikisi de">Her ikisi de</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Şirket Büyüklüğü
                    </label>
                    <Select
                      value={profileData.companySize || ''}
                      onValueChange={(value) => handleInputChange('companySize', value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="Tek Kişilik">Tek Kişilik</SelectItem>
                        <SelectItem value="2-10">2-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="200+">200+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website URL
                  </label>
                  <Input
                    placeholder="https://yourwebsite.com"
                    value={profileData.websiteUrl || ''}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Aylık Gelir
                    </label>
                    <Select
                      value={profileData.monthlyRevenue || ''}
                      onValueChange={(value) => handleInputChange('monthlyRevenue', value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="0 - 50K">0 - 50K</SelectItem>
                        <SelectItem value="50K - 250K">50K - 250K</SelectItem>
                        <SelectItem value="250K - 1M">250K - 1M</SelectItem>
                        <SelectItem value="1M - 5M">1M - 5M</SelectItem>
                        <SelectItem value="5M+">5M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Aylık Reklam Bütçesi
                    </label>
                    <Select
                      value={profileData.monthlyAdBudget || ''}
                      onValueChange={(value) => handleInputChange('monthlyAdBudget', value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="0 - 5K">0 - 5K</SelectItem>
                        <SelectItem value="5K - 25K">5K - 25K</SelectItem>
                        <SelectItem value="25K - 100K">25K - 100K</SelectItem>
                        <SelectItem value="100K - 500K">100K - 500K</SelectItem>
                        <SelectItem value="500K+">500K+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ana Rakipler
                  </label>
                  <Textarea
                    placeholder="Rakip firma isimlerini virgülle ayırarak yazın"
                    value={profileData.mainCompetitors || ''}
                    onChange={(e) => handleInputChange('mainCompetitors', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-300"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hedef Kitle Tanımı
                  </label>
                  <Textarea
                    placeholder="Hedef kitlenizi detaylı olarak tanımlayın"
                    value={profileData.targetAudienceDescription || ''}
                    onChange={(e) => handleInputChange('targetAudienceDescription', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-300"
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSave}
                  disabled={profileMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {profileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    'Değişiklikleri Kaydet'
                  )}
                </Button>
              </CardContent>
            </Card>
    </div>
  );
}