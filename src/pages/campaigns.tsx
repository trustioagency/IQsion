import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";

import { 
  Megaphone, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  MousePointer2, 
  Eye, 
  Users,
  Calendar,
  Download,
  Play,
  Pause,
  Settings,
  Filter,
  Search,
  Plus,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Activity,
  PieChart,
  LineChart,
  Clock,
  Hash,
  MapPin,
  Smartphone,
  Monitor,
  Heart,
  Share2,
  Copy,
  Edit,
  Trash2,
  ArrowRight,
  
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';

// Genişletilmiş kampanya verisi
const CAMPAIGN_DATA = {
  active: [
    {
      id: 1,
      name: "Kış Koleksiyonu 2024",
      type: "Meta Ads",
      status: "Aktif",
      budget: 50000,
      spent: 32500,
      impressions: 850000,
      clicks: 24500,
      conversions: 1250,
      revenue: 125000,
      ctr: 2.88,
      cpc: 1.33,
      roas: 3.85,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      performance: "excellent",
      trend: "up",
      audience: "25-45 Kadın",
      objective: "Satış",
      platform: "meta"
    },
    {
      id: 2,
      name: "Marka Farkındalık Kampanyası",
      type: "Google Ads",
      status: "Aktif",
      budget: 75000,
      spent: 45000,
      impressions: 1200000,
      clicks: 38400,
      conversions: 960,
      revenue: 96000,
      ctr: 3.2,
      cpc: 1.17,
      roas: 2.13,
      startDate: "2024-01-05",
      endDate: "2024-02-05",
      performance: "good",
      trend: "stable",
      audience: "18-65 Hepsi",
      objective: "Farkındalık",
      platform: "google"
    },
    {
      id: 3,
      name: "TikTok Viral Video Serisi",
      type: "TikTok Ads",
      status: "Test Aşaması",
      budget: 25000,
      spent: 8500,
      impressions: 450000,
      clicks: 18000,
      conversions: 180,
      revenue: 18000,
      ctr: 4.0,
      cpc: 0.47,
      roas: 2.12,
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      performance: "testing",
      trend: "up",
      audience: "16-24 Gen Z",
      objective: "Engagement",
      platform: "tiktok"
    },
    {
      id: 4,
      name: "Remarketing - Sepet Terk",
      type: "Meta Ads",
      status: "Optimize Ediliyor",
      budget: 20000,
      spent: 15000,
      impressions: 320000,
      clicks: 12800,
      conversions: 640,
      revenue: 64000,
      ctr: 4.0,
      cpc: 1.17,
      roas: 4.27,
      startDate: "2024-01-10",
      endDate: "2024-02-10",
      performance: "excellent",
      trend: "up",
      audience: "Sepet Terk Eden",
      objective: "Retargeting",
      platform: "meta"
    }
  ],
  draft: [
    {
      id: 5,
      name: "Bahar Koleksiyonu Ön Lansmanı",
      type: "Meta Ads",
      status: "Taslak",
      budget: 60000,
      audience: "25-45 Kadın",
      objective: "Satış",
      platform: "meta"
    },
    {
      id: 6,
      name: "Google Shopping Kampanyası",
      type: "Google Ads", 
      status: "Taslak",
      budget: 40000,
      audience: "Alışveriş Niyetli",
      objective: "Satış",
      platform: "google"
    }
  ],
  completed: [
    {
      id: 7,
      name: "Yılbaşı Özel İndirimleri",
      type: "Meta Ads",
      status: "Tamamlandı",
      budget: 80000,
      spent: 78500,
      revenue: 245000,
      roas: 3.12,
      platform: "meta"
    }
  ]
};

const PERFORMANCE_COLORS = {
  excellent: "text-green-400 bg-green-400/10 border-green-400/20",
  good: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  testing: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  poor: "text-red-400 bg-red-400/10 border-red-400/20"
};

const PLATFORM_COLORS = {
  meta: "from-blue-500 to-blue-700",
  google: "from-red-500 to-yellow-500",
  tiktok: "from-pink-500 to-black"
};

const ACTION_SUGGESTIONS = [
  {
    id: 1,
    type: "opportunity",
    title: "Remarketing Kampanyanı Ölçeklendir",
    description: "Sepet terk kampanyan 4.27x ROAS ile mükemmel performans gösteriyor. Bütçesini %50 artırarak daha fazla gelir elde edebilirsin.",
    priority: "high",
    estimatedImpact: "+₺32,000 aylık gelir",
    action: "Bütçeyi Artır",
    campaignId: 4
  },
  {
    type: "warning",
    title: "Google Kampanyası Optimizasyona İhtiyaç Duyuyor",
    description: "Marka farkındalık kampanyan düşük ROAS gösteriyor. Hedef kitle segmentasyonu ve teklif stratejisi gözden geçirilmeli.",
    priority: "medium",
    estimatedImpact: "+₺15,000 potansiyel tasarruf",
    action: "Optimize Et",
    campaignId: 2
  },
  {
    type: "insight",
    title: "TikTok Kampanyası Umut Verici",
    description: "Gen Z hedef kitlen TikTok'ta yüksek engagement gösteriyor. Test süresini uzatıp daha fazla kreatif ekleyebilirsin.",
    priority: "low",
    estimatedImpact: "+₺8,000 potansiyel gelir",
    action: "Test Genişlet",
    campaignId: 3
  },
  {
    type: "opportunity",
    title: "Bahar Koleksiyonu Kampanyasını Başlat",
    description: "Mevsim yaklaşıyor ve kış kampanyan başarılı. Bahar koleksiyonu için benzer strateji ile erken başlama avantajı yakalayabilirsin.",
    priority: "high",
    estimatedImpact: "+₺45,000 potansiyel gelir",
    action: "Kampanyayı Başlat",
    campaignId: 5
  }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function CampaignsPage() {
  const [selectedTab, setSelectedTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("roas");
  

  const getPerformanceBadge = (performance: string) => {
    const styles = PERFORMANCE_COLORS[performance as keyof typeof PERFORMANCE_COLORS] || PERFORMANCE_COLORS.good;
    const labels = {
      excellent: "Mükemmel",
      good: "İyi", 
      testing: "Test",
      poor: "Zayıf"
    };
    return (
      <Badge className={`${styles} border`}>
        {labels[performance as keyof typeof labels] || "Bilinmiyor"}
      </Badge>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
      case "google": return "🔍";
      case "meta": return "📘";
      case "tiktok": return "🎵";
      default: return "📊";
    }
  };

  const getActionIcon = (type: string) => {
    switch(type) {
      case "opportunity": return <TrendingUp className="w-5 h-5 text-green-400" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Lightbulb className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Aktif":
        return <Badge className="bg-green-600 hover:bg-green-700 text-white">Aktif</Badge>;
      case "Test Aşaması":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Test Aşaması</Badge>;
      case "Optimize Ediliyor":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">Optimize Ediliyor</Badge>;
      case "Duraklatıldı":
        return <Badge className="bg-orange-600 hover:bg-orange-700 text-white">Duraklatıldı</Badge>;
      case "Tamamlandı":
        return <Badge className="bg-gray-600 hover:bg-gray-700 text-white">Tamamlandı</Badge>;
      default:
        return <Badge className="bg-gray-600 hover:bg-gray-700 text-white">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Aktif":
        return <div className="w-3 h-3 rounded-full bg-green-400"></div>;
      case "Test Aşaması":
        return <div className="w-3 h-3 rounded-full bg-blue-400"></div>;
      case "Optimize Ediliyor":
        return <div className="w-3 h-3 rounded-full bg-yellow-400"></div>;
      case "Duraklatıldı":
        return <div className="w-3 h-3 rounded-full bg-orange-400"></div>;
      case "Tamamlandı":
        return <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
    }
  };


  const CampaignCard = ({ campaign, showActions = true }: any) => (
    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-all duration-200 group w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${PLATFORM_COLORS[campaign.platform as keyof typeof PLATFORM_COLORS]} flex items-center justify-center text-white text-lg flex-shrink-0`}>
              {getPlatformIcon(campaign.platform)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white text-base font-semibold leading-tight mb-2 break-words">
                {campaign.name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                  {campaign.type}
                </Badge>
                {campaign.performance && getPerformanceBadge(campaign.performance)}
              </div>
            </div>
          </div>
          {campaign.trend && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {getTrendIcon(campaign.trend)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {campaign.status !== "Taslak" && campaign.spent && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-medium">Harcanan / Bütçe</p>
                <p className="text-white font-semibold">₺{campaign.spent?.toLocaleString()} / ₺{campaign.budget?.toLocaleString()}</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-medium">ROAS</p>
                <p className={`font-bold text-lg ${
                  campaign.roas >= 4 ? 'text-green-400' : 
                  campaign.roas >= 2 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {campaign.roas?.toFixed(2)}x
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3 border-t border-slate-700">
              <div className="text-center">
                <p className="text-slate-400 text-xs">Dönüşüm</p>
                <p className="text-white font-semibold text-sm">{campaign.conversions?.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">CTR</p>
                <p className="text-white font-semibold text-sm">{campaign.ctr?.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">CPC</p>
                <p className="text-white font-semibold text-sm">₺{campaign.cpc?.toFixed(2)}</p>
              </div>
            </div>
          </>
        )}

        {campaign.status === "Taslak" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs font-medium">Bütçe</p>
                <p className="text-white font-semibold">₺{campaign.budget?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium">Hedef Kitle</p>
                <p className="text-white font-semibold text-sm">{campaign.audience}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs font-medium">Amaç</p>
                <p className="text-white font-semibold text-sm">{campaign.objective}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium">Platform</p>
                <p className="text-white font-semibold text-sm">{campaign.type}</p>
              </div>
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-3 border-t border-slate-700">
            <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
              <Edit className="w-3 h-3 mr-1" />
              Düzenle
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              {campaign.status === "Aktif" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const filteredCampaigns = CAMPAIGN_DATA.active.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* İki sütunlu düzen */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              {/* Sol Panel - Özet ve Kontroller */}
              <div className="lg:col-span-1 space-y-6">
                {/* Başlık */}
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Megaphone className="w-6 h-6 text-blue-400" />
                    Kampanya Yönetimi
                  </h1>
                  <p className="text-slate-400 text-sm">Tüm reklam kampanyalarınızı tek yerden yönetin</p>
                </div>

                {/* KPI Kartları */}
                <div className="grid grid-cols-1 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Aktif Kampanya</p>
                          <p className="text-2xl font-bold text-white mt-1">{CAMPAIGN_DATA.active.length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                          <Play className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Toplam Harcama</p>
                          <p className="text-2xl font-bold text-white mt-1">₺{CAMPAIGN_DATA.active.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Toplam Gelir</p>
                          <p className="text-2xl font-bold text-white mt-1">₺{CAMPAIGN_DATA.active.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Ortalama ROAS</p>
                          <p className="text-2xl font-bold text-white mt-1">
                            {(CAMPAIGN_DATA.active.reduce((sum, c) => sum + c.roas, 0) / CAMPAIGN_DATA.active.length).toFixed(2)}x
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                          <Target className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Aksiyon Önerileri */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Aksiyon Önerileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ACTION_SUGGESTIONS.map((suggestion, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${
                          suggestion.type === 'opportunity' ? 'bg-green-900/20 border-green-400' :
                          suggestion.type === 'warning' ? 'bg-yellow-900/20 border-yellow-400' :
                          'bg-blue-900/20 border-blue-400'
                        }`}>
                          <div className="flex items-start gap-3">
                            {getActionIcon(suggestion.type)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1 text-sm">{suggestion.title}</h4>
                              <p className="text-slate-300 text-xs mb-2">{suggestion.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={`text-xs ${
                                  suggestion.priority === 'high' ? 'border-red-400 text-red-400' :
                                  suggestion.priority === 'medium' ? 'border-yellow-400 text-yellow-400' :
                                  'border-blue-400 text-blue-400'
                                }`}>
                                  {suggestion.priority === 'high' ? 'Yüksek' :
                                   suggestion.priority === 'medium' ? 'Orta' : 'Düşük'}
                                </Badge>
                                <span className="text-green-400 text-xs">{suggestion.estimatedImpact}</span>
                              </div>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-7">
                                {suggestion.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sağ Panel - Ana İçerik */}
              <div className="lg:col-span-3 space-y-6">

                {/* Kontroller */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <Input
                        placeholder="Kampanya ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white w-full sm:w-48"
                      />
                    </div>

                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300 w-full sm:w-40">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="all">Tüm Platformlar</SelectItem>
                        <SelectItem value="meta">Meta Ads</SelectItem>
                        <SelectItem value="google">Google Ads</SelectItem>
                        <SelectItem value="tiktok">TikTok Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Kampanya
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Download className="w-4 h-4 mr-2" />
                      Rapor Al
                    </Button>
                  </div>
                </div>

                {/* Kampanya Performans Tablosu */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      Kampanya Performansları ({filteredCampaigns.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Kampanya Adı</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Durum</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Harcama</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Gelir</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">ROAS</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {filteredCampaigns.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-slate-700/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-medium text-white">{campaign.name}</div>
                                <div className="text-sm text-slate-400">
                                  {campaign.type} • {campaign.impressions?.toLocaleString()} gösterim
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(campaign.status)}
                                  {getStatusBadge(campaign.status)}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-300 font-medium">₺{campaign.spent?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-green-400 font-bold">₺{campaign.revenue?.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className={`font-bold ${campaign.roas >= 4 ? 'text-green-400' : campaign.roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {campaign.roas?.toFixed(2)}x
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    {campaign.status === "Aktif" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    <Settings className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredCampaigns.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-slate-400">Arama kriterlerinize uygun kampanya bulunamadı.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
        </div>
      </div>
    </div>
  );
}