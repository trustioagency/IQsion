import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { DataSettingsDialog } from "../components/DataSettingsDialog";
import { AccountSelectionDialog } from "../components/AccountSelectionDialog";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest, queryClient, API_BASE } from "../lib/queryClient";
import { type User as UserType } from "../types/user";
import { 
  User, 
  Building, 
  Link, 
  CheckCircle, 
  X, 
  Loader2,
  Settings as SettingsIcon,
  Database,
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
  const [disconnectPlatformId, setDisconnectPlatformId] = useState<string | null>(null);

  // DataSettingsDialog için state'ler
  const [dataSettingsDialogOpen, setDataSettingsDialogOpen] = useState<boolean>(false);
  const [dataSettingsDialogMode, setDataSettingsDialogMode] = useState<'connect' | 'change'>('connect');
  const [dataSettingsDialogPlatform, setDataSettingsDialogPlatform] = useState<string>('');
  const [dataSettingsDialogPlatformName, setDataSettingsDialogPlatformName] = useState<string>('');
  const [dataSettingsDialogCurrentAccount, setDataSettingsDialogCurrentAccount] = useState<string | undefined>(undefined);
  const [dataSettingsDialogNewAccount, setDataSettingsDialogNewAccount] = useState<string | undefined>(undefined);
  const [pendingAccountChange, setPendingAccountChange] = useState<{ platform: string; newAccountId: string; newAccountName?: string } | null>(null);
  
  // Loading state'leri
  const [isAccountChanging, setIsAccountChanging] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  // AccountSelectionDialog için state'ler (OAuth dönüşünde hesap seçimi)
  const [accountSelectionDialogOpen, setAccountSelectionDialogOpen] = useState<boolean>(false);
  const [accountSelectionPlatform, setAccountSelectionPlatform] = useState<string>('');
  const [accountSelectionPlatformName, setAccountSelectionPlatformName] = useState<string>('');

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

  // OAuth dönüşünde bağlantı durumunu hemen yansıt
  // Hesap seçimi için popup açılacak, veri çekme hesap seçildikten sonra yapılacak
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

      // Platform adını al (inline helper)
      const platformNames: Record<string, string> = {
        meta_ads: 'Meta Ads',
        meta: 'Meta Ads',
        google_ads: 'Google Ads',
        google: 'Google Ads',
        google_analytics: 'Google Analytics',
        shopify: 'Shopify',
        tiktok: 'TikTok Ads',
        linkedin_ads: 'LinkedIn Ads',
        google_search_console: 'Search Console',
      };
      const getPlatformDisplayName = (p: string) => platformNames[p] || p;

      // Platform adını normalize et
      const normalizedPlatform = platform === 'meta' ? 'meta_ads' : 
                                 platform === 'google' ? 'google_ads' : 
                                 platform;

      // Hesap seçimi gerektiren platformlar için popup aç
      const platformsRequiringAccountSelection = ['meta_ads', 'google_ads', 'google_analytics', 'tiktok', 'linkedin_ads'];
      
      if (platformsRequiringAccountSelection.includes(normalizedPlatform)) {
        // Bağlantı başarılı toast'ı göster
        toast({
          title: '🎉 Bağlantı Başarılı!',
          description: `${getPlatformDisplayName(normalizedPlatform)} bağlandı. Şimdi hesabınızı seçin.`,
        });
        
        // AccountSelectionDialog'u aç
        setAccountSelectionPlatform(normalizedPlatform);
        setAccountSelectionPlatformName(getPlatformDisplayName(normalizedPlatform));
        // Dialog'u biraz gecikmeyle aç (connection data'nın yüklenmesi için)
        setTimeout(() => {
          setAccountSelectionDialogOpen(true);
        }, 500);
      } else {
        // Shopify gibi hesap seçimi gerektirmeyen platformlar için otomatik ingest tetikle
        let ingestDays = 30;
        try {
          const stored = localStorage.getItem('iqsion_pending_ingest_days');
          if (stored) {
            ingestDays = parseInt(stored, 10) || 30;
            localStorage.removeItem('iqsion_pending_ingest_days');
          }
        } catch (_) {}
        
        toast({
          title: '🎉 Bağlantı Başarılı!',
          description: `${getPlatformDisplayName(normalizedPlatform)} başarıyla bağlandı. ${ingestDays} günlük veriler arka planda çekiliyor.`,
        });
        
        // Shopify için otomatik ingest tetikle
        if (normalizedPlatform === 'shopify') {
          apiRequest('POST', '/api/ingest/refresh', {
            userId: uid,
            platform: 'shopify',
            range: ingestDays <= 7 ? '7d' : ingestDays <= 30 ? '30d' : '90d',
          }).catch(console.error);
        }
      }
    }
  }, [user, toast]);

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

  // Kullanıcı ayarları (veri saklama süresi)
  const { data: userSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['user-settings', (user as any)?.uid || (user as any)?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/settings?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return { retentionDays: 90 } as any;
      return await res.json();
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('POST', `/api/settings?userId=${encodeURIComponent(uid)}`, payload);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: 'Kaydedildi', description: 'Ayarlar güncellendi' });
      refetchSettings();
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Ayarlar kaydedilemedi', variant: 'destructive' });
    }
  });

  // Tek ayar: Tüm platformlar için
  const [retentionDays, setRetentionDays] = useState<string>('90');
  const [initialIngestDays, setInitialIngestDays] = useState<string>('30');
  
  useEffect(() => {
    if (userSettings && typeof (userSettings as any).retentionDays === 'number') {
      setRetentionDays(String((userSettings as any).retentionDays));
    }
    if (userSettings && typeof (userSettings as any).initialIngestDays === 'number') {
      setInitialIngestDays(String((userSettings as any).initialIngestDays));
    }
  }, [userSettings]);

  const handleSaveDataSettings = () => {
    const retention = Number(retentionDays || '90');
    const initial = Number(initialIngestDays || '30');
    saveSettingsMutation.mutate({ 
      retentionDays: retention,
      initialIngestDays: initial
    });
  };

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

  // TikTok ad accounts list (for selection UI)
  const { data: tiktokAdAccounts } = useQuery({
    queryKey: ['tiktok-adaccounts', (user as any)?.uid || (user as any)?.id],
    enabled: !!user && !!(connections as any)?.tiktok?.isConnected,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/tiktok/adaccounts?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return { data: { list: [] } } as any;
      return await res.json();
    }
  });

  // LinkedIn ad accounts list (for selection UI)
  const { data: linkedinAccounts } = useQuery({
    queryKey: ['linkedin-adaccounts', (user as any)?.uid || (user as any)?.id],
    enabled: !!user && !!(connections as any)?.linkedin_ads?.isConnected,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/linkedin/accounts?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return { accounts: [] } as any;
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

  // Platform adını ID'den al
  const getPlatformName = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.name || platformId;
  };

  // AccountSelectionDialog için hesap listesi
  const getAccountsForPlatform = (platformId: string): { id: string; name: string }[] => {
    switch (platformId) {
      case 'meta_ads':
        return (metaAdAccounts?.data || []).map((acc: any) => ({ id: acc.id, name: acc.name || acc.id }));
      case 'google_ads':
        return (googleAdAccounts?.accounts || []).map((acc: any) => ({ id: acc.id || acc.customerId, name: acc.descriptiveName || acc.id || acc.customerId }));
      case 'google_analytics':
        // Backend zaten numeric ID döndürüyor: { id: "123456789", name: "display name" }
        return (gaProperties?.properties || []).map((prop: any) => ({
          id: prop.id,  // numeric ID (backend zaten "properties/" prefix'ini kaldırmış)
          name: prop.name || prop.id  // display name
        }));
      case 'tiktok':
        return ((tiktokAdAccounts?.data?.list || [])).map((acc: any) => ({ id: acc.advertiser_id, name: acc.advertiser_name || acc.advertiser_id }));
      case 'linkedin_ads':
        return (linkedinAccounts?.accounts || []).map((acc: any) => ({ id: acc.id, name: acc.name || acc.id }));
      default:
        return [];
    }
  };

  // AccountSelectionDialog için loading durumu
  const isLoadingAccountsForPlatform = (platformId: string): boolean => {
    switch (platformId) {
      case 'google_analytics':
        return gaPropsLoading;
      default:
        // Diğer platformlar için basit kontrol
        return !connections;
    }
  };

  // AccountSelectionDialog onConfirm handler
  const handleAccountSelectionConfirm = async (accountId: string, accountName: string, ingestDays: number, retentionDays: number) => {
    const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
    const platformId = accountSelectionPlatform;
    
    setAccountSelectionDialogOpen(false);
    setIsAccountChanging(true);
    setLoadingPlatform(platformId);

    toast({ 
      title: 'Veriler Çekiliyor', 
      description: `${accountSelectionPlatformName} için ${ingestDays} günlük veriler çekiliyor. Bu işlem 1-3 dakika sürebilir...`,
    });

    try {
      // 1. Hesabı kaydet
      if (platformId === 'google_analytics') {
        // GA4 için propertyId olarak kaydet
        await apiRequest('POST', '/api/connections', {
          platform: platformId,
          propertyId: accountId,
          userId: uid,
        });
      } else {
        // Diğer platformlar için accountId olarak kaydet
        await apiRequest('POST', '/api/connections', {
          platform: platformId,
          accountId: accountId,
          userId: uid,
        });
      }

      // 2. Ayarları kaydet (hem ingestDays hem retentionDays)
      await apiRequest('POST', `/api/settings?userId=${encodeURIComponent(uid)}`, {
        initialIngestDays: ingestDays,
        retentionDays: retentionDays,
      });

      // 3. Veri çek
      const ingestEndpoint = platformId === 'google_analytics' 
        ? '/api/ingest/ga4' 
        : '/api/ingest/refresh';
      
      await apiRequest('POST', ingestEndpoint, {
        userId: uid,
        platform: platformId,
        range: ingestDays <= 7 ? '7d' : ingestDays <= 30 ? '30d' : '90d',
      });

      toast({ 
        title: '✅ Başarılı', 
        description: `${accountSelectionPlatformName} hesabı seçildi ve ${ingestDays} günlük veriler çekildi. Veriler ${retentionDays} gün saklanacak.`,
      });

      // Cache'i güncelle
      queryClient.setQueryData(['connections', uid], (prev: any) => ({
        ...(prev || {}),
        [platformId]: {
          ...((prev && prev[platformId]) || {}),
          ...(platformId === 'google_analytics' ? { propertyId: accountId } : { accountId: accountId }),
          isConnected: true,
        },
      }));
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    } catch (e: any) {
      toast({ 
        title: 'Hata', 
        description: e?.message || 'Hesap seçimi veya veri çekme başarısız', 
        variant: 'destructive' 
      });
    } finally {
      setIsAccountChanging(false);
      setLoadingPlatform(null);
    }
  };

  // İlk bağlantı için direkt OAuth'a yönlendir (dialog açmadan)
  const openConnectDialog = (platformId: string) => {
    // Direkt OAuth'a yönlendir - hesap seçimi ve ayarlar OAuth dönüşünde yapılacak
    executeConnectPlatformDirect(platformId);
  };

  // Hesap değişikliği için dialog aç
  const openAccountChangeDialog = (platformId: string, newAccountId: string, newAccountName?: string, currentAccountName?: string) => {
    setDataSettingsDialogPlatform(platformId);
    setDataSettingsDialogPlatformName(getPlatformName(platformId));
    setDataSettingsDialogMode('change');
    setDataSettingsDialogCurrentAccount(currentAccountName);
    setDataSettingsDialogNewAccount(newAccountName || newAccountId);
    setPendingAccountChange({ platform: platformId, newAccountId, newAccountName });
    setDataSettingsDialogOpen(true);
  };

  // DataSettingsDialog onConfirm handler (sadece hesap değişikliği için kullanılacak)
  const handleDataSettingsConfirm = async (settings: { initialIngestDays: number; retentionDays: number }) => {
    const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
    
    // Önce ayarları kaydet
    try {
      await apiRequest('POST', `/api/settings?userId=${encodeURIComponent(uid)}`, {
        initialIngestDays: settings.initialIngestDays,
        retentionDays: settings.retentionDays,
      });
    } catch (e) {
      console.error('[DataSettings] Failed to save settings:', e);
    }

    // Eğer hesap değişikliği modundaysak
    if (dataSettingsDialogMode === 'change' && pendingAccountChange) {
      setDataSettingsDialogOpen(false);
      await executeAccountChange(pendingAccountChange.platform, pendingAccountChange.newAccountId, settings);
      return;
    }

    // İlk bağlantı modundaysak, OAuth'a yönlendir (artık bu kod çağrılmayacak ama eski uyumluluk için bırakıyoruz)
    setDataSettingsDialogOpen(false);
    await executeConnectPlatform(dataSettingsDialogPlatform, settings);
  };

  // Hesap değişikliğini gerçekleştir
  const executeAccountChange = async (platformId: string, newAccountId: string, settings: { initialIngestDays: number; retentionDays: number }) => {
    const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
    
    // Loading state'i başlat
    setIsAccountChanging(true);
    setLoadingPlatform(platformId);
    
    // Kullanıcıya bilgi ver
    toast({ 
      title: 'Hesap Değiştiriliyor', 
      description: `${getPlatformName(platformId)} hesabı değiştiriliyor. Bu işlem veri miktarına göre 1-3 dakika sürebilir...`,
    });
    
    try {
      // 1. Eski hesabın verilerini BigQuery'den sil
      const currentAccountId = (platformId === 'google_analytics') 
        ? (connections as any)?.[platformId]?.propertyId
        : (connections as any)?.[platformId]?.accountId;
      if (currentAccountId && currentAccountId !== newAccountId) {
        await apiRequest('POST', '/api/bigquery/cleanup', {
          userId: uid,
          platform: platformId,
          accountId: currentAccountId,
        });
      }

      // 2. Yeni hesabı kaydet (Google Analytics için propertyId)
      if (platformId === 'google_analytics') {
        const resp = await apiRequest('POST', '/api/connections', {
          platform: platformId,
          propertyId: newAccountId,
          userId: uid,
        });
        await resp.json();
      } else {
        const resp = await apiRequest('POST', '/api/connections', {
          platform: platformId,
          accountId: newAccountId,
          userId: uid,
        });
        await resp.json();
      }

      // 3. Yeni hesap için veri çek
      if (platformId === 'google_analytics') {
        await apiRequest('POST', '/api/ingest/ga4/refresh', {
          userId: uid,
          range: settings.initialIngestDays <= 7 ? '7d' : settings.initialIngestDays <= 30 ? '30d' : '90d',
        });
      } else {
        await apiRequest('POST', '/api/ingest/refresh', {
          userId: uid,
          platform: platformId,
          range: settings.initialIngestDays <= 7 ? '7d' : settings.initialIngestDays <= 30 ? '30d' : '90d',
        });
      }

      toast({ title: 'Başarılı', description: `${getPlatformName(platformId)} hesabı değiştirildi ve ${settings.initialIngestDays} günlük veriler çekildi` });
      
      // Cache'i güncelle
      if (platformId === 'google_analytics') {
        queryClient.setQueryData(['connections', uid], (prev: any) => ({
          ...(prev || {}),
          [platformId]: {
            ...((prev && prev[platformId]) || {}),
            propertyId: newAccountId,
            isConnected: true,
          },
        }));
      } else {
        queryClient.setQueryData(['connections', uid], (prev: any) => ({
          ...(prev || {}),
          [platformId]: {
            ...((prev && prev[platformId]) || {}),
            accountId: newAccountId,
            isConnected: true,
          },
        }));
      }
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['ga-summary'] });
    } catch (e: any) {
      toast({ title: 'Hata', description: e?.message || 'Hesap değiştirilemedi', variant: 'destructive' });
    } finally {
      // Loading state'i bitir
      setIsAccountChanging(false);
      setLoadingPlatform(null);
    }
  };

  // OAuth bağlantısını gerçekleştir
  const executeConnectPlatform = async (platformId: string, settings: { initialIngestDays: number; retentionDays: number }) => {
    try {
      if (!user) return;
      
      const uid = ((user as any)?.uid || (user as any)?.id) as string | undefined;
      
      // Loading state başlat
      setIsConnecting(true);
      setLoadingPlatform(platformId);
      
      // İlk veri çekme gün sayısını localStorage'a kaydet (callback'te kullanılacak)
      try {
        localStorage.setItem('iqsion_pending_ingest_days', String(settings.initialIngestDays));
      } catch (_) {}
      
      let authUrl = '';
      
      switch (platformId) {
        case 'shopify': {
          const savedStore = (connections as any)?.shopify?.storeUrl as string | undefined;
          let storeUrl = savedStore || localStorage.getItem('iqsion_shopify_store') || '';
          if (!storeUrl) {
            const name = prompt('Shopify mağaza adınızı girin (örn: mystore veya mystore.myshopify.com):') || '';
            if (!name) {
              setIsConnecting(false);
              setLoadingPlatform(null);
              return;
            }
            storeUrl = name;
          }
          storeUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
          if (!/\.myshopify\.com$/i.test(storeUrl)) {
            storeUrl = `${storeUrl}.myshopify.com`;
          }
          try { localStorage.setItem('iqsion_shopify_store', storeUrl); } catch (_) {}
          authUrl = `${API_BASE}/api/auth/shopify/connect?storeUrl=${encodeURIComponent(storeUrl)}${uid ? `&userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        }
        case 'google_ads':
          authUrl = `${API_BASE}/api/auth/googleads/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'meta_ads':
          authUrl = `${API_BASE}/api/auth/meta/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'google_analytics':
          authUrl = `${API_BASE}/api/auth/google/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'tiktok':
          authUrl = `${API_BASE}/api/auth/tiktok/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'linkedin_ads':
          authUrl = `${API_BASE}/api/auth/linkedin/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'google_search_console':
          {
            const urlRes = await apiRequest('GET', `/api/auth/searchconsole/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`);
            const j = await urlRes.json().catch(() => ({}));
            const url = j?.url as string | undefined;
            if (url) {
              toast({
                title: "Yönlendiriliyor",
                description: `Google Search Console'a bağlanılıyor. Bağlantı sonrası ${settings.initialIngestDays} günlük veriler otomatik çekilecek (1-3 dk sürebilir).`,
              });
              window.location.href = url;
              return;
            } else {
              setIsConnecting(false);
              setLoadingPlatform(null);
              toast({ title: 'Hata', description: 'Yönlendirme alınamadı', variant: 'destructive' });
              return;
            }
          }
        default:
          setIsConnecting(false);
          setLoadingPlatform(null);
          toast({
            title: "Hata",
            description: "Bu platform henüz desteklenmiyor",
            variant: "destructive",
          });
          return;
      }

      if (!authUrl) {
        console.error('[CONNECT] authUrl is empty for platform:', platformId);
        setIsConnecting(false);
        setLoadingPlatform(null);
        toast({
          title: "Hata",
          description: "Yönlendirme URL'si oluşturulamadı",
          variant: "destructive",
        });
        return;
      }

      const platformName = platforms.find(p => p.id === platformId)?.name || platformId;
      toast({
        title: "Yönlendiriliyor",
        description: `${platformName} OAuth sayfasına yönlendiriliyorsunuz. Bağlantı sonrası ${settings.initialIngestDays} günlük veriler otomatik çekilecek (1-3 dk sürebilir).`,
      });

      setTimeout(() => {
        window.location.href = authUrl;
      }, 500);
      
    } catch (error) {
      console.error('[CONNECT] Error in executeConnectPlatform:', error);
      setIsConnecting(false);
      setLoadingPlatform(null);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Platform bağlantısı başarısız",
        variant: "destructive",
      });
    }
  };

  // OAuth bağlantısını direkt gerçekleştir (dialog açmadan)
  const executeConnectPlatformDirect = async (platformId: string) => {
    try {
      if (!user) return;
      
      const uid = ((user as any)?.uid || (user as any)?.id) as string | undefined;
      
      // Loading state başlat
      setIsConnecting(true);
      setLoadingPlatform(platformId);
      
      let authUrl = '';
      
      switch (platformId) {
        case 'shopify': {
          const savedStore = (connections as any)?.shopify?.storeUrl as string | undefined;
          let storeUrl = savedStore || localStorage.getItem('iqsion_shopify_store') || '';
          if (!storeUrl) {
            const name = prompt('Shopify mağaza adınızı girin (örn: mystore veya mystore.myshopify.com):') || '';
            if (!name) {
              setIsConnecting(false);
              setLoadingPlatform(null);
              return;
            }
            storeUrl = name;
          }
          storeUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
          if (!/\.myshopify\.com$/i.test(storeUrl)) {
            storeUrl = `${storeUrl}.myshopify.com`;
          }
          try { localStorage.setItem('iqsion_shopify_store', storeUrl); } catch (_) {}
          authUrl = `${API_BASE}/api/auth/shopify/connect?storeUrl=${encodeURIComponent(storeUrl)}${uid ? `&userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        }
        case 'google_ads':
          authUrl = `${API_BASE}/api/auth/googleads/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'meta_ads':
          authUrl = `${API_BASE}/api/auth/meta/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'google_analytics':
          authUrl = `${API_BASE}/api/auth/google/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'tiktok':
          authUrl = `${API_BASE}/api/auth/tiktok/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'linkedin_ads':
          authUrl = `${API_BASE}/api/auth/linkedin/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'google_search_console':
          {
            const urlRes = await apiRequest('GET', `/api/auth/searchconsole/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`);
            const j = await urlRes.json().catch(() => ({}));
            const url = j?.url as string | undefined;
            if (url) {
              toast({
                title: "Yönlendiriliyor",
                description: `Google Search Console'a bağlanılıyor...`,
              });
              window.location.href = url;
              return;
            } else {
              setIsConnecting(false);
              setLoadingPlatform(null);
              toast({ title: 'Hata', description: 'Yönlendirme alınamadı', variant: 'destructive' });
              return;
            }
          }
        default:
          setIsConnecting(false);
          setLoadingPlatform(null);
          toast({
            title: "Hata",
            description: "Bu platform henüz desteklenmiyor",
            variant: "destructive",
          });
          return;
      }

      if (!authUrl) {
        setIsConnecting(false);
        setLoadingPlatform(null);
        toast({
          title: "Hata",
          description: "Yönlendirme URL'si oluşturulamadı",
          variant: "destructive",
        });
        return;
      }
      
      const platformName = platforms.find(p => p.id === platformId)?.name || platformId;
      toast({
        title: "Yönlendiriliyor",
        description: `${platformName} OAuth sayfasına yönlendiriliyorsunuz...`,
      });

      setTimeout(() => {
        window.location.href = authUrl;
      }, 300);
      
    } catch (error) {
      console.error('[CONNECT DIRECT] Error:', error);
      setIsConnecting(false);
      setLoadingPlatform(null);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Platform bağlantısı başarısız",
        variant: "destructive",
      });
    }
  };

  // Eski fonksiyon - artık sadece dialog açıyor
  const handleConnectPlatform = (platformId: string) => {
    openConnectDialog(platformId);
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
        description: "Platform bağlantısı ve verileri kaldırıldı",
      });
      
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setDisconnectPlatformId(null);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Platform bağlantısı kesilemedi",
        variant: "destructive",
      });
      setDisconnectPlatformId(null);
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

  const handleTestGoogleAdsConnection = async () => {
    try {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/googleads/summary-bq?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (res.ok) {
        const totals = (data?.totals || {}) as any;
        const msg = `Hesap ${data?.accountId} • ${(totals.clicks||0)} tıklama • ${(totals.impressions||0)} gösterim • ${Number(totals.spend||0).toFixed(2)} ₺ harcama`;
        toast({ title: 'Google Ads bağlandı', description: msg });
      } else {
        const details: string = data?.details || '';
        if (/DEVELOPER_TOKEN_NOT_APPROVED/i.test(details)) {
          toast({
            title: 'Developer token onayı gerekli',
            description: 'Bu token sadece test hesaplarına açık. Basic/Standard erişim başvurusu yapın veya test hesabı kullanın.',
            variant: 'destructive',
          });
        } else if (/invalid_grant|UNAUTHENTICATED/i.test(details)) {
          toast({ title: 'Oturum süresi dolmuş', description: 'Lütfen Google Ads bağlantısını yeniden yapın.', variant: 'destructive' });
        } else {
          toast({ title: 'Google Ads hatası', description: details || (data?.message || 'Bilinmeyen hata'), variant: 'destructive' });
        }
      }
    } catch (e: any) {
      toast({ title: 'Google Ads test hatası', description: e?.message || 'İşlenemedi', variant: 'destructive' });
    }
  };

  const handleTestLinkedinConnection = async () => {
    try {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await apiRequest('GET', `/api/linkedin/summary?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (res.ok) {
        const t = data?.totals || {};
        const msg = `Hesap ${data?.accountId} • ${(t.clicks||0)} tıklama • ${(t.impressions||0)} gösterim • ${Number(t.spend||0).toFixed(2)} harcama`;
        toast({ title: 'LinkedIn Ads bağlandı', description: msg });
      } else {
        toast({ title: 'LinkedIn Ads hatası', description: data?.message || 'Özet alınamadı', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'LinkedIn Ads test hatası', description: e?.message || 'İşlenemedi', variant: 'destructive' });
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
      
      // İlk property seçiminde otomatik veri çek (initialIngestDays ayarına göre)
      try {
        // Firebase'den kullanıcı ayarlarını al (varsayılan 30 gün)
        const settingsResp = await apiRequest('GET', `/api/settings?userId=${encodeURIComponent(uid)}`);
        const settingsData = await settingsResp.json().catch(() => ({}));
        const ingestDays = Number(settingsData?.initialIngestDays || 30);
        const range = ingestDays <= 7 ? '7d' : ingestDays <= 30 ? '30d' : '90d';
        
        toast({
          title: 'Veriler Çekiliyor',
          description: `${ingestDays} günlük GA4 verileri arka planda çekiliyor. Bu işlem 1-2 dakika sürebilir.`,
        });
        
        // Fire-and-forget data ingest
        apiRequest('POST', '/api/ingest/ga4/refresh', {
          userId: uid,
          range,
        }).then(async (ingestResp) => {
          const ingestData = await ingestResp.json().catch(() => ({}));
          if (ingestResp.ok) {
            toast({ title: 'Başarılı', description: `GA4 verileri çekildi (${ingestData.insertedDaily || 0} gün)` });
          }
        }).catch(() => {});
      } catch (_) {}
    } catch (e) {
      toast({ title: 'Hata', description: 'Property kaydedilemedi', variant: 'destructive' });
    }
  };

  // Search Console sites component
  const SearchConsoleSites: React.FC<{ connections: any }> = ({ connections }) => {
    const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
    const { data, refetch, isFetching } = useQuery({
      queryKey: ['search-console-sites', uid],
      enabled: !!connections?.search_console?.isConnected,
      queryFn: async () => {
        const res = await apiRequest('GET', `/api/searchconsole/sites?userId=${encodeURIComponent(uid)}`);
        if (!res.ok) {
          return { sites: [], selectedSite: null, error: 'Fetch başarısız' };
        }
        return await res.json();
      }
    });
    const sites = (data as any)?.sites || [];
    const selected = (data as any)?.selectedSite;
    const rawSelectedPerm = sites.find((s: any) => s.url === selected)?.permissionLevel;
    const isWeakPerm = rawSelectedPerm && !/owner|full/i.test(rawSelectedPerm);
    const [queryLoading, setQueryLoading] = useState(false);
    const [lastQueryRows, setLastQueryRows] = useState<any[]>([]);
    const [lastQueryError, setLastQueryError] = useState<string | null>(null);

    const handleSelectSite = async (siteUrl: string) => {
      try {
        await apiRequest('POST', '/api/connections', { platform: 'search_console', siteUrl, userId: uid });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        refetch();
        toast({ title: 'Site seçildi', description: siteUrl });
      } catch (e) {
        toast({ title: 'Hata', description: 'Site seçimi kaydedilemedi', variant: 'destructive' });
      }
    };

    const handleTestQuery = async () => {
      setQueryLoading(true);
      setLastQueryRows([]);
      setLastQueryError(null);
      try {
        const body = {
          siteUrl: selected,
          dimensions: ['query'],
          startDate: new Date(Date.now() - 14 * 86400000).toISOString().slice(0,10),
          endDate: new Date(Date.now() - 1 * 86400000).toISOString().slice(0,10)
        };
        const res = await apiRequest('POST', `/api/searchconsole/query?userId=${encodeURIComponent(uid)}`, body);
        const json = await res.json();
        if (!res.ok) {
          setLastQueryError(json?.error?.message || json?.message || 'Sorgu hatası');
          toast({ title: 'Sorgu hatası', description: json?.error?.message || json?.message || 'Hata', variant: 'destructive' });
        } else {
          setLastQueryRows(json.rows || []);
          toast({ title: 'Sorgu başarılı', description: `${(json.rows||[]).length} satır döndü` });
        }
      } catch (e: any) {
        setLastQueryError(e?.message || 'İşlenemedi');
        toast({ title: 'Hata', description: e?.message || 'İşlenemedi', variant: 'destructive' });
      } finally {
        setQueryLoading(false);
      }
    };

    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs text-slate-400">Search Console Sites</label>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="h-6 px-2 text-[10px]" onClick={() => refetch()} disabled={isFetching}>
              {(isFetching) ? '...' : 'Yenile'}
            </Button>
            {selected && (
              <Button size="sm" variant="secondary" className="h-6 px-2 text-[10px]" onClick={handleTestQuery} disabled={queryLoading}>
                {queryLoading ? 'Sorgu…' : 'Test sorgu'}
              </Button>
            )}
          </div>
        </div>
        {sites.length === 0 && (
          <div className="text-xs text-slate-500">Site bulunamadı veya yetki yok</div>
        )}
        {sites.length > 0 && (
          <Select value={selected || ''} onValueChange={handleSelectSite}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-9">
              <SelectValue placeholder="Site seç" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 max-h-64 overflow-auto">
              {sites.map((s: any) => (
                <SelectItem key={s.url} value={s.url}>
                  {s.url.replace(/^https?:\/\//,'')} {s.permissionLevel && (<span className="opacity-50">({s.permissionLevel.replace('site','')})</span>)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {selected && isWeakPerm && (
          <div className="text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded p-2">
            Seçili site için tam yetki yok. Sorgular sınırlı veya hatalı olabilir. Owner/Full yetki ekleyin.
          </div>
        )}
        {lastQueryError && (
          <div className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/30 rounded p-2">
            Sorgu Hatası: {lastQueryError}
          </div>
        )}
        {!!lastQueryRows.length && (
          <div className="text-[11px] space-y-1 max-h-40 overflow-auto bg-slate-800/40 p-2 rounded border border-slate-700">
            {lastQueryRows.slice(0,10).map((r: any, idx: number) => (
              <div key={idx} className="flex justify-between gap-2">
                <span className="truncate max-w-[55%]" title={r.keys?.[0]}>{r.keys?.[0]}</span>
                <span className="text-slate-400">{r.clicks} / {r.impressions} / {Math.round((r.ctr||0)*100)}%</span>
              </div>
            ))}
            {lastQueryRows.length > 10 && (
              <div className="text-center text-slate-500">+{lastQueryRows.length - 10} satır daha…</div>
            )}
          </div>
        )}
      </div>
    );
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
    hubspot: <Database className="w-5 h-5" />,
    pipedrive: <Database className="w-5 h-5" />,
    shopify: <Building className="w-5 h-5" />,
    meta_ads: <Zap className="w-5 h-5" />,
    google_ads: <Globe className="w-5 h-5" />,
    google_analytics: <Globe className="w-5 h-5" />,
    google_search_console: <Globe className="w-5 h-5" />,
    tiktok: <User className="w-5 h-5" />,
    linkedin_ads: <Link className="w-5 h-5" />,
  };

  const platforms = [
    { id: 'hubspot', name: 'HubSpot', description: 'CRM, contacts, deals, and marketing automation' },
    { id: 'pipedrive', name: 'Pipedrive', description: 'Sales CRM with deals, contacts, and pipeline management' },
    { id: 'shopify', name: 'Shopify', description: 'E-ticaret platformu bağlantısı' },
    { id: 'meta_ads', name: 'Meta Ads', description: 'Facebook ve Instagram reklamları' },
    { id: 'google_ads', name: 'Google Ads', description: 'Google reklam kampanyaları' },
    { id: 'google_analytics', name: 'Google Analytics', description: 'Website analizi ve trafik verileri' },
    { id: 'google_search_console', name: 'Google Search Console', description: 'Arama motoru optimizasyonu verileri' },
    { id: 'tiktok', name: 'TikTok Ads', description: 'TikTok reklam platformu' },
    { id: 'linkedin_ads', name: 'LinkedIn Ads', description: 'LinkedIn reklam kampanyaları' },
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
    <div className="space-y-6 relative">

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
                    const isPlatformLoading = loadingPlatform === platform.id;

                    return (
                      <Card key={platform.id} className={`bg-slate-700 border-slate-600 relative ${isPlatformLoading ? 'opacity-70' : ''}`}>
                        <CardContent className="p-4">
                          {/* Loading overlay */}
                          {isPlatformLoading && (
                            <div className="absolute inset-0 bg-slate-800/50 rounded-lg flex items-center justify-center z-10">
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                                <span className="text-xs text-slate-300">
                                  {isAccountChanging ? 'Hesap değiştiriliyor...' : 'Bağlanıyor...'}
                                </span>
                              </div>
                            </div>
                          )}
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
                                        // Eğer property değiştiyse confirmation dialog aç (Meta Ads gibi)
                                        const currentPropertyId = (connections as any)?.google_analytics?.propertyId;
                                        
                                        if (currentPropertyId && currentPropertyId !== value) {
                                          const currentProp = (gaProperties?.properties || []).find((p: any) => p.id === currentPropertyId);
                                          const newProp = (gaProperties?.properties || []).find((p: any) => p.id === value);
                                          openAccountChangeDialog(
                                            'google_analytics',
                                            value,
                                            newProp?.name || value,
                                            currentProp?.name || currentPropertyId
                                          );
                                        } else {
                                          // İlk property seçimi, direkt kaydet
                                          setSelectedGaPropertyId(value);
                                          handleSaveGoogleAnalyticsProperty(value);
                                        }
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

                                {/* Google Ads hesap seçimi + Manuel veri güncelleme */}
                                {platform.id === 'google_ads' && isConnected && (
                                  <div className="mt-2 space-y-2">
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs text-slate-400">Reklam Hesabı</label>
                                        {(connections as any)?.google_ads?.accountId && (
                                          <span className="text-[10px] text-slate-500">Seçili: {(connections as any).google_ads.accountId}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {(googleAdAccounts?.accounts || []).length > 0 ? (
                                        <>
                                          <Select
                                            value={(connections as any)?.google_ads?.accountId || ''}
                                            onValueChange={(value) => {
                                              const currentAccountId = (connections as any)?.google_ads?.accountId;
                                              if (currentAccountId && currentAccountId !== value) {
                                                // Hesap değişikliği - dialog aç
                                                const currentAcc = (googleAdAccounts?.accounts || []).find((a: any) => a.id === currentAccountId);
                                                const newAcc = (googleAdAccounts?.accounts || []).find((a: any) => a.id === value);
                                                openAccountChangeDialog(
                                                  'google_ads',
                                                  value,
                                                  newAcc?.displayName || value,
                                                  currentAcc?.displayName || currentAccountId
                                                );
                                              } else {
                                                // İlk hesap seçimi - dialog aç
                                                const newAcc = (googleAdAccounts?.accounts || []).find((a: any) => a.id === value);
                                                openAccountChangeDialog('google_ads', value, newAcc?.displayName || value);
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-9 flex-1">
                                              <SelectValue placeholder="Hesap seç" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700 max-h-64 overflow-auto">
                                              {(googleAdAccounts?.accounts || []).map((acc: any) => (
                                                <SelectItem key={acc.id} value={acc.id}>{acc.displayName || acc.id}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => refetchGoogleAdsAccounts()}
                                            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 h-9 px-3"
                                          >
                                            ↻
                                          </Button>
                                        </>
                                      ) : (
                                        <>
                                          <Input
                                            placeholder="Müşteri ID (örn: 123-456-7890)"
                                            defaultValue={(connections as any)?.google_ads?.accountId || ''}
                                            className="bg-slate-800 border-slate-700 text-slate-200 h-9 flex-1"
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                const value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
                                                if (!value) return;
                                                const currentAccountId = (connections as any)?.google_ads?.accountId;
                                                if (currentAccountId && currentAccountId !== value) {
                                                  openAccountChangeDialog('google_ads', value, value, currentAccountId);
                                                } else {
                                                  openAccountChangeDialog('google_ads', value, value);
                                                }
                                              }
                                            }}
                                          />
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => refetchGoogleAdsAccounts()}
                                            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 h-9 px-3"
                                            title="Hesap listesini yenile"
                                          >
                                            ↻
                                          </Button>
                                        </>
                                      )}
                                      </div>
                                      {(connections as any)?.google_ads?.lastError === 'no_accessible_customers' && !(googleAdAccounts?.accounts || []).length && (
                                        <p className="text-xs text-amber-400 mt-1">
                                          ⚠️ Otomatik hesap listesi alınamadı. Lütfen Müşteri ID'nizi manuel girin veya Google Ads hesabınıza erişim izni verin.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Meta Ads hesap seçimi + Manuel veri güncelleme */}
                                {platform.id === 'meta_ads' && isConnected && (
                                  <div className="mt-2 space-y-2">
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs text-slate-400">Reklam Hesabı</label>
                                        {(connections as any)?.meta_ads?.accountId && (
                                          <span className="text-[10px] text-slate-500">Seçili: {(connections as any).meta_ads.accountId}</span>
                                        )}
                                      </div>
                                      <Select
                                        value={(connections as any)?.meta_ads?.accountId || ''}
                                        disabled={isPlatformLoading}
                                        onValueChange={(value) => {
                                          const currentAccountId = (connections as any)?.meta_ads?.accountId;
                                          if (currentAccountId && currentAccountId !== value) {
                                            // Hesap değişikliği - dialog aç
                                            const currentAcc = (metaAdAccounts?.data || []).find((a: any) => a.id === currentAccountId);
                                            const newAcc = (metaAdAccounts?.data || []).find((a: any) => a.id === value);
                                            openAccountChangeDialog(
                                              'meta_ads',
                                              value,
                                              newAcc?.name || value,
                                              currentAcc?.name || currentAccountId
                                            );
                                          } else {
                                            // İlk hesap seçimi - dialog aç
                                            const newAcc = (metaAdAccounts?.data || []).find((a: any) => a.id === value);
                                            openAccountChangeDialog('meta_ads', value, newAcc?.name || value);
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
                                  </div>
                                )}
                                {/* TikTok Ads hesap seçimi */}
                                {platform.id === 'tiktok' && isConnected && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="block text-xs text-slate-400">Reklam Hesabı</label>
                                      {(connections as any)?.tiktok?.accountId && (
                                        <span className="text-[10px] text-slate-500">Seçili: {(connections as any).tiktok.accountId}</span>
                                      )}
                                    </div>
                                    <Select
                                      value={(connections as any)?.tiktok?.accountId || ''}
                                      onValueChange={(value) => {
                                        const currentAccountId = (connections as any)?.tiktok?.accountId;
                                        const accounts = tiktokAdAccounts?.data?.list || [];
                                        if (currentAccountId && currentAccountId !== value) {
                                          const currentAcc = accounts.find((a: any) => String(a.advertiser_id || a.id) === currentAccountId);
                                          const newAcc = accounts.find((a: any) => String(a.advertiser_id || a.id) === value);
                                          openAccountChangeDialog(
                                            'tiktok',
                                            value,
                                            newAcc?.advertiser_name || newAcc?.name || value,
                                            currentAcc?.advertiser_name || currentAcc?.name || currentAccountId
                                          );
                                        } else {
                                          const newAcc = accounts.find((a: any) => String(a.advertiser_id || a.id) === value);
                                          openAccountChangeDialog('tiktok', value, newAcc?.advertiser_name || newAcc?.name || value);
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-9">
                                        <SelectValue placeholder={!tiktokAdAccounts ? 'Yükleniyor…' : 'Hesap seç'} />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-800 border-slate-700 max-h-64 overflow-auto">
                                        {!((tiktokAdAccounts?.data?.list || []).length) && (
                                          <div className="px-3 py-2 text-slate-400 text-sm">Hesap bulunamadı</div>
                                        )}
                                        {(tiktokAdAccounts?.data?.list || []).map((acc: any) => (
                                          <SelectItem key={(acc.advertiser_id || acc.id)} value={String(acc.advertiser_id || acc.id)}>
                                            {acc.advertiser_name || acc.name || String(acc.advertiser_id || acc.id)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                {/* LinkedIn Ads hesap seçimi */}
                                {platform.id === 'linkedin_ads' && isConnected && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="block text-xs text-slate-400">Reklam Hesabı</label>
                                      {(connections as any)?.linkedin_ads?.accountId && (
                                        <span className="text-[10px] text-slate-500">Seçili: {(connections as any).linkedin_ads.accountId}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Select
                                        value={(connections as any)?.linkedin_ads?.accountId || ''}
                                        onValueChange={(value) => {
                                          const currentAccountId = (connections as any)?.linkedin_ads?.accountId;
                                          const accounts = linkedinAccounts?.accounts || [];
                                          if (currentAccountId && currentAccountId !== value) {
                                            const currentAcc = accounts.find((a: any) => a.id === currentAccountId);
                                            const newAcc = accounts.find((a: any) => a.id === value);
                                            openAccountChangeDialog(
                                              'linkedin_ads',
                                              value,
                                              newAcc?.name || value,
                                              currentAcc?.name || currentAccountId
                                            );
                                          } else {
                                            const newAcc = accounts.find((a: any) => a.id === value);
                                            openAccountChangeDialog('linkedin_ads', value, newAcc?.name || value);
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 h-9">
                                          <SelectValue placeholder={!linkedinAccounts ? 'Yükleniyor…' : ((linkedinAccounts?.accounts||[]).length ? 'Hesap seç' : 'Hesap bulunamadı')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 max-h-64 overflow-auto">
                                          {!(linkedinAccounts?.accounts || []).length && (
                                            <div className="px-3 py-2 text-slate-400 text-sm">Hesap bulunamadı</div>
                                          )}
                                          {(linkedinAccounts?.accounts || []).map((acc: any) => (
                                            <SelectItem key={acc.id} value={acc.id}>{acc.name || acc.id}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        placeholder="Hesap ID gir (örn: 1234567)"
                                        className="bg-slate-800 border-slate-700 text-slate-200 h-9 w-44"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const value = (e.target as HTMLInputElement).value.trim();
                                            if (!value) return;
                                            const currentAccountId = (connections as any)?.linkedin_ads?.accountId;
                                            if (currentAccountId && currentAccountId !== value) {
                                              openAccountChangeDialog('linkedin_ads', value, value, currentAccountId);
                                            } else {
                                              openAccountChangeDialog('linkedin_ads', value, value);
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                                {/* Search Console site seçimi */}
                                {platform.id === 'google_search_console' && isConnected && (
                                  <SearchConsoleSites connections={connections as any} />
                                )}
                                {/* Shopify mağaza düzenleme + Manuel veri güncelleme */}
                                {platform.id === 'shopify' && (
                                  <div className="mt-2 space-y-2">
                                    <div>
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

                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-slate-600 text-slate-300"
                                    onClick={() => setDisconnectPlatformId(platform.id)}
                                    disabled={isPlatformLoading}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  disabled={isPlatformLoading || isConnecting}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConnectPlatform(platform.id);
                                  }}
                                  type="button"
                                >
                                  {isPlatformLoading ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Bağlanıyor...
                                    </>
                                  ) : (
                                    'Bağla'
                                  )}
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

            {/* Disconnect Confirmation Dialog */}
            <AlertDialog open={disconnectPlatformId !== null} onOpenChange={(open: boolean) => !open && setDisconnectPlatformId(null)}>
              <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Bağlantıyı Kaldır</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    {disconnectPlatformId === 'google_analytics' 
                      ? 'Google Analytics bağlantısını kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz ve BigQuery\'deki tüm GA4 verileri silinecektir.'
                      : 'Bu platform bağlantısını kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz ve BigQuery\'deki tüm veriler silinecektir.'
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">İptal</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => disconnectPlatformId && handleDisconnectPlatform(disconnectPlatformId)}
                  >
                    Evet, Kaldır
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Data Settings Dialog - İlk bağlantı ve hesap değişikliği için */}
            <DataSettingsDialog
              open={dataSettingsDialogOpen}
              onClose={() => setDataSettingsDialogOpen(false)}
              onConfirm={handleDataSettingsConfirm}
              platformName={dataSettingsDialogPlatformName}
              mode={dataSettingsDialogMode}
              currentAccountName={dataSettingsDialogCurrentAccount}
              newAccountName={dataSettingsDialogNewAccount}
            />

            {/* Account Selection Dialog - OAuth sonrası hesap seçimi için */}
            <AccountSelectionDialog
              open={accountSelectionDialogOpen}
              onClose={() => setAccountSelectionDialogOpen(false)}
              onConfirm={handleAccountSelectionConfirm}
              platformName={accountSelectionPlatformName}
              platformId={accountSelectionPlatform}
              accounts={getAccountsForPlatform(accountSelectionPlatform)}
              isLoadingAccounts={isLoadingAccountsForPlatform(accountSelectionPlatform)}
            />
    </div>
  );
}