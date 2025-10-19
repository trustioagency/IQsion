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

  const { data: brandProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['brand-profile', (user as any)?.uid || (user as any)?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id;
      const res = await fetch('/api/brand-profile', {
        credentials: 'include',
        headers: uid ? { 'x-user-uid': uid } : {},
      });
      if (!res.ok) return {};
      return res.json();
    }
  });

  const { data: connections } = useQuery({
    queryKey: ['connections', (user as any)?.uid || (user as any)?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await fetch(`/api/connections?userId=${encodeURIComponent(uid)}`, {
        credentials: 'include',
      });
      if (!res.ok) return {};
      return res.json();
    }
  });

  // Google Analytics properties listesi
  const { data: gaProperties, isLoading: gaPropsLoading } = useQuery({
    queryKey: ['ga-properties', (user as any)?.uid || (user as any)?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = (user as any)?.uid || (user as any)?.id || 'test-user';
      const res = await fetch(`/api/analytics/properties?userId=${encodeURIComponent(uid)}`, {
        credentials: 'include',
      });
      if (!res.ok) return { properties: [] };
      return res.json();
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: BrandProfile) => {
      const uid = (user as any)?.uid || (user as any)?.id;
      const response = await fetch('/api/brand-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(uid ? { 'x-user-uid': uid } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Profile update failed');
      }
      return response.json();
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
        case 'shopify':
          const shopName = prompt('Shopify mağaza adınızı girin (örn: mystore):');
          if (!shopName) return;
          // Backend üzerinden OAuth başlat
          authUrl = `/api/auth/shopify/connect?storeUrl=${encodeURIComponent(`${shopName}.myshopify.com`)}${uid ? `&userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'google_ads':
          authUrl = `/api/auth/googleads/connect${uid ? `?userId=${encodeURIComponent(uid)}` : ''}`;
          break;
        case 'meta':
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
      queryClient.invalidateQueries({ queryKey: ['connections'] });
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
    meta: <Zap className="w-5 h-5" />,
    google_ads: <Globe className="w-5 h-5" />,
    google_analytics: <Globe className="w-5 h-5" />,
    google_search_console: <Globe className="w-5 h-5" />,
    tiktok: <User className="w-5 h-5" />,
  };

  const platforms = [
    { id: 'shopify', name: 'Shopify', description: 'E-ticaret platformu bağlantısı' },
    { id: 'meta', name: 'Meta Ads', description: 'Facebook ve Instagram reklamları' },
    { id: 'google_ads', name: 'Google Ads', description: 'Google reklam kampanyaları' },
    { id: 'google_analytics', name: 'Google Analytics', description: 'Website analizi ve trafik verileri' },
    { id: 'google_search_console', name: 'Google Search Console', description: 'Arama motoru optimizasyonu verileri' },
    { id: 'tiktok', name: 'TikTok Ads', description: 'TikTok reklam platformu' },
  ];

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
                                    <label className="block text-xs text-slate-400 mb-1">Property</label>
                                    <Select
                                      value={connection?.propertyId || ''}
                                      onValueChange={(value) => handleSaveGoogleAnalyticsProperty(value)}
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