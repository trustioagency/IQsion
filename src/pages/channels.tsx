
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import AIChatPanel from "@/components/ai-chat-panel";
import { 
  BarChart3, 
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
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Activity,
  PieChart,
  LineChart
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';

// Genişletilmiş veri simülasyonu
const ADVANCED_CHANNEL_DATA = {
  google: {
    summary: {
      spend: "₺45,750",
      revenue: "₺198,650",
      roas: "4.34",
      conversions: 1256,
      ctr: "3.2%",
      cpc: "₺2.45",
      impressions: "1,450,000",
      clicks: "46,400"
    },
    campaigns: [
      { 
        id: 1, 
        name: "Marka Aramaları - TR", 
        spend: "₺12,400", 
        revenue: "₺89,200", 
        roas: "7.19", 
        conversions: 445, 
        status: "Aktif",
        ctr: "8.5%",
        cpc: "₺1.85",
        impressions: "320,000",
        trend: "up"
      },
      { 
        id: 2, 
        name: "Alışveriş - Elbiseler", 
        spend: "₺18,750", 
        revenue: "₺76,850", 
        roas: "4.10", 
        conversions: 387, 
        status: "Aktif",
        ctr: "2.8%",
        cpc: "₺2.95",
        impressions: "580,000",
        trend: "up"
      },
      { 
        id: 3, 
        name: "Görüntülü Reklam Ağı", 
        spend: "₺8,950", 
        revenue: "₺19,450", 
        roas: "2.17", 
        conversions: 142, 
        status: "Optimize Ediliyor",
        ctr: "1.2%",
        cpc: "₺3.45",
        impressions: "445,000",
        trend: "down"
      },
      { 
        id: 4, 
        name: "YouTube Videoları", 
        spend: "₺5,650", 
        revenue: "₺13,150", 
        roas: "2.33", 
        conversions: 89, 
        status: "Test Aşaması",
        ctr: "2.1%",
        cpc: "₺2.87",
        impressions: "195,000",
        trend: "stable"
      }
    ],
    insights: [
      {
        type: "success",
        title: "Marka Kampanyan Mükemmel Performans Gösteriyor",
        description: "ROAS 7.19x ile sektör ortalamasının %340 üzerinde. Bu kampanyanın bütçesini artırarak ölçeklendirebilirsin.",
        priority: "high"
      },
      {
        type: "warning", 
        title: "Görüntülü Reklam Optimizasyona İhtiyaç Duyuyor",
        description: "CTR %1.2 ile düşük seviyede. Kreatif refresh ve audience targeting revizyonu öneriyoruz.",
        priority: "medium"
      },
      {
        type: "info",
        title: "YouTube Kampanyası Umut Verici",
        description: "Henüz test aşamasında ama erken sinyaller pozitif. 2 hafta daha test edip karar verebiliriz.",
        priority: "low"
      }
    ],
    performanceChart: [
      { date: "1 Oca", spend: 1200, revenue: 5800, roas: 4.83 },
      { date: "2 Oca", spend: 1450, revenue: 6200, roas: 4.28 },
      { date: "3 Oca", spend: 1380, revenue: 6950, roas: 5.04 },
      { date: "4 Oca", spend: 1620, revenue: 7100, roas: 4.38 },
      { date: "5 Oca", spend: 1550, revenue: 7450, roas: 4.81 },
      { date: "6 Oca", spend: 1480, revenue: 6800, roas: 4.59 },
      { date: "7 Oca", spend: 1650, revenue: 7350, roas: 4.45 }
    ],
    deviceBreakdown: [
      { device: "Mobil", spend: 25650, revenue: 118750, share: 56 },
      { device: "Masaüstü", spend: 15100, revenue: 59800, share: 33 },
      { device: "Tablet", spend: 5000, revenue: 20100, share: 11 }
    ]
  },
  meta: {
    summary: {
      spend: "₺52,380",
      revenue: "₺189,750",
      roas: "3.62",
      conversions: 1842,
      ctr: "2.8%",
      cpc: "₺1.95",
      impressions: "2,150,000",
      clicks: "60,200"
    },
    campaigns: [
      { 
        id: 1, 
        name: "Yeniden Pazarlama - Sepet Terk", 
        spend: "₺18,500", 
        revenue: "₺95,750", 
        roas: "5.18", 
        conversions: 672, 
        status: "Aktif",
        ctr: "4.2%",
        cpc: "₺1.45",
        impressions: "520,000",
        trend: "up"
      },
      { 
        id: 2, 
        name: "Lookalike - Satın Alanlar %1", 
        spend: "₺22,100", 
        revenue: "₺64,850", 
        roas: "2.94", 
        conversions: 518, 
        status: "Aktif",
        ctr: "2.1%",
        cpc: "₺2.15",
        impressions: "780,000",
        trend: "stable"
      },
      { 
        id: 3, 
        name: "Video Engagement - Yeni Koleksiyon", 
        spend: "₺8,450", 
        revenue: "₺18,650", 
        roas: "2.21", 
        conversions: 234, 
        status: "Optimize Ediliyor",
        ctr: "3.8%",
        cpc: "₺1.85",
        impressions: "445,000",
        trend: "up"
      },
      { 
        id: 4, 
        name: "Instagram Stories - Influencer", 
        spend: "₺3,330", 
        revenue: "₺10,500", 
        roas: "3.15", 
        conversions: 89, 
        status: "Test Aşaması",
        ctr: "5.2%",
        cpc: "₺1.25",
        impressions: "285,000",
        trend: "up"
      }
    ],
    insights: [
      {
        type: "success",
        title: "Remarketing Kampanları Çok Başarılı",
        description: "Sepet terk kampanyan 5.18x ROAS ile mükemmel performans gösteriyor. Bu segmente daha fazla bütçe ayırabilirsin.",
        priority: "high"
      },
      {
        type: "warning",
        title: "Lookalike Audience Genişletilmeli",
        description: "%1 lookalike audience doygunluğa yakın. %2-3 segmentleri de test etmeyi öneriyoruz.",
        priority: "medium"
      },
      {
        type: "info",
        title: "Instagram Stories Yüksek Engagement",
        description: "CTR %5.2 ile çok iyi, ancak hacim düşük. Kreatif setini genişletip ölçeklendirilebilir.",
        priority: "medium"
      }
    ],
    performanceChart: [
      { date: "1 Oca", spend: 1850, revenue: 6750, roas: 3.65 },
      { date: "2 Oca", spend: 2100, revenue: 7450, roas: 3.55 },
      { date: "3 Oca", spend: 1950, revenue: 7100, roas: 3.64 },
      { date: "4 Oca", spend: 2250, revenue: 8200, roas: 3.64 },
      { date: "5 Oca", spend: 2050, revenue: 7850, roas: 3.83 },
      { date: "6 Oca", spend: 1980, revenue: 7200, roas: 3.64 },
      { date: "7 Oca", spend: 2180, revenue: 8100, roas: 3.72 }
    ],
    deviceBreakdown: [
      { device: "Mobil", spend: 39285, revenue: 142312, share: 75 },
      { device: "Masaüstü", spend: 10476, revenue: 37950, share: 20 },
      { device: "Tablet", spend: 2619, revenue: 9488, share: 5 }
    ]
  },
  tiktok: {
    summary: {
      spend: "₺28,950",
      revenue: "₺98,750",
      roas: "3.41",
      conversions: 892,
      ctr: "4.8%",
      cpc: "₺1.25",
      impressions: "1,850,000",
      clicks: "88,800"
    },
    campaigns: [
      { 
        id: 1, 
        name: "Video Tanıtım - Influencer Kollab", 
        spend: "₺18,200", 
        revenue: "₺68,450", 
        roas: "3.76", 
        conversions: 524, 
        status: "Aktif",
        ctr: "6.2%",
        cpc: "₺1.15",
        impressions: "980,000",
        trend: "up"
      },
      { 
        id: 2, 
        name: "Spark Ads - User Generated", 
        spend: "₺7,450", 
        revenue: "₺21,850", 
        roas: "2.93", 
        conversions: 198, 
        status: "Test Aşaması",
        ctr: "3.8%",
        cpc: "₺1.45",
        impressions: "420,000",
        trend: "stable"
      },
      { 
        id: 3, 
        name: "Brand Takeover - Weekend", 
        spend: "₺3,300", 
        revenue: "₺8,450", 
        roas: "2.56", 
        conversions: 89, 
        status: "Duraklatıldı",
        ctr: "2.1%",
        cpc: "₺1.85",
        impressions: "450,000",
        trend: "down"
      }
    ],
    insights: [
      {
        type: "success",
        title: "Influencer Kollaborasyonları Etkili",
        description: "CTR %6.2 ile platform ortalamasının üzerinde. Bu format ile daha fazla kreatiflere yatırım yapılabilir.",
        priority: "high"
      },
      {
        type: "info",
        title: "Spark Ads Potansiyel Gösteriyor",
        description: "User generated content iyi performans gösteriyor. Daha fazla UGC toplayıp test edilebilir.",
        priority: "medium"
      },
      {
        type: "warning",
        title: "Brand Takeover Maliyetli",
        description: "CPC yüksek ve ROAS düşük. Bu format şu an için durduruluyor, audiencei diğer kampanyalara yönlendirelim.",
        priority: "low"
      }
    ],
    performanceChart: [
      { date: "1 Oca", spend: 950, revenue: 3200, roas: 3.37 },
      { date: "2 Oca", spend: 1150, revenue: 3850, roas: 3.35 },
      { date: "3 Oca", spend: 1050, revenue: 3950, roas: 3.76 },
      { date: "4 Oca", spend: 1250, revenue: 4200, roas: 3.36 },
      { date: "5 Oca", spend: 1100, revenue: 3850, roas: 3.50 },
      { date: "6 Oca", spend: 1200, revenue: 4100, roas: 3.42 },
      { date: "7 Oca", spend: 1350, revenue: 4450, roas: 3.30 }
    ],
    deviceBreakdown: [
      { device: "Mobil", spend: 27521, revenue: 93912, share: 95 },
      { device: "Tablet", spend: 1429, revenue: 4838, share: 5 }
    ]
  }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ChannelsPage() {
  const [selectedChannel, setSelectedChannel] = useState("google");
  const [dateRange, setDateRange] = useState("7d");
  const [sortBy, setSortBy] = useState("roas");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const currentChannelData = ADVANCED_CHANNEL_DATA[selectedChannel as keyof typeof ADVANCED_CHANNEL_DATA];

  // Kampanya sıralama ve filtreleme
  const filteredAndSortedCampaigns = currentChannelData.campaigns
    .filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = sortBy === "roas" ? parseFloat(a.roas) : parseFloat(a.spend.replace(/[₺,]/g, ''));
      const bValue = sortBy === "roas" ? parseFloat(b.roas) : parseFloat(b.spend.replace(/[₺,]/g, ''));
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

  const getChannelIcon = (channel: string) => {
    switch(channel) {
      case "google": return "🔍";
      case "meta": return "📘";
      case "tiktok": return "🎵";
      default: return "📊";
    }
  };

  const getChannelColor = (channel: string) => {
    switch(channel) {
      case "google": return "from-red-500 to-yellow-500";
      case "meta": return "from-blue-500 to-blue-700";
      case "tiktok": return "from-pink-500 to-black";
      default: return "from-gray-500 to-gray-700";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch(type) {
      case "success": return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const MetricWidget = ({ title, value, change, icon: Icon, color }: any) => (
    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {change && (
              <p className={`text-sm mt-1 flex items-center gap-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {change}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">

            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <span className="text-4xl">{getChannelIcon(selectedChannel)}</span>
                  Kanal Performans Analizi
                </h1>
                <p className="text-slate-400 text-lg">Detaylı reklam platformu analizi ve optimizasyon önerileri</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="1d">Bugün</SelectItem>
                    <SelectItem value="7d">Son 7 gün</SelectItem>
                    <SelectItem value="30d">Son 30 gün</SelectItem>
                    <SelectItem value="90d">Son 90 gün</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Rapor Al
                </Button>
              </div>
            </div>

            {/* Channel Selection Tabs */}
            <Tabs value={selectedChannel} onValueChange={setSelectedChannel} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700 h-14">
                <TabsTrigger 
                  value="google"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white text-slate-300 font-medium"
                >
                  <span className="text-xl mr-2">🔍</span>
                  Google Ads
                </TabsTrigger>
                <TabsTrigger 
                  value="meta"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-700 data-[state=active]:text-white text-slate-300 font-medium"
                >
                  <span className="text-xl mr-2">📘</span>
                  Meta Ads
                </TabsTrigger>
                <TabsTrigger 
                  value="tiktok"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-black data-[state=active]:text-white text-slate-300 font-medium"
                >
                  <span className="text-xl mr-2">🎵</span>
                  TikTok Ads
                </TabsTrigger>
              </TabsList>

              {/* Channel Content */}
              <TabsContent value={selectedChannel} className="space-y-6 mt-6">
                
                {/* Summary Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricWidget 
                    title="Toplam Harcama" 
                    value={currentChannelData.summary.spend}
                    change="+12.5%"
                    icon={DollarSign}
                    color="from-red-500 to-pink-500"
                  />
                  <MetricWidget 
                    title="Toplam Gelir" 
                    value={currentChannelData.summary.revenue}
                    change="+18.7%"
                    icon={TrendingUp}
                    color="from-green-500 to-emerald-500"
                  />
                  <MetricWidget 
                    title="ROAS" 
                    value={`${currentChannelData.summary.roas}x`}
                    change="+0.3x"
                    icon={Target}
                    color="from-blue-500 to-cyan-500"
                  />
                  <MetricWidget 
                    title="Dönüşümler" 
                    value={currentChannelData.summary.conversions.toLocaleString()}
                    change="+15.2%"
                    icon={MousePointer2}
                    color="from-purple-500 to-indigo-500"
                  />
                </div>

                {/* Performance Chart & Device Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-blue-400" />
                        Son 7 Günlük Performans Trendi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={currentChannelData.performanceChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }} 
                          />
                          <Line type="monotone" dataKey="roas" stroke="#3B82F6" strokeWidth={3} />
                          <Line type="monotone" dataKey="spend" stroke="#EF4444" strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-400" />
                        Cihaz Dağılımı
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Tooltip />
                          <RechartsPieChart data={currentChannelData.deviceBreakdown}>
                            {currentChannelData.deviceBreakdown.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </RechartsPieChart>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {currentChannelData.deviceBreakdown.map((item: any, index: number) => (
                          <div key={item.device} className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-slate-300">{item.device}</span>
                            </div>
                            <span className="text-white font-medium">%{item.share}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters & Search */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Filter className="w-5 h-5 text-blue-400" />
                      Kampanya Filtreleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-64">
                        <Input
                          placeholder="Kampanya adı ara..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          icon={<Search className="w-4 h-4" />}
                        />
                      </div>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300 w-48">
                          <SelectValue placeholder="Durum filtrele" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="all">Tüm Durumlar</SelectItem>
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Duraklatıldı">Duraklatıldı</SelectItem>
                          <SelectItem value="Test Aşaması">Test Aşaması</SelectItem>
                          <SelectItem value="Optimize Ediliyor">Optimize Ediliyor</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300 w-40">
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="roas">ROAS'a göre</SelectItem>
                          <SelectItem value="spend">Harcamaya göre</SelectItem>
                          <SelectItem value="revenue">Gelire göre</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        {sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Campaign Performance Table */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      Kampanya Performansları ({filteredAndSortedCampaigns.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Kampanya</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Durum</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Harcama</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Gelir</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">ROAS</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">CTR</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">CPC</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Trend</th>
                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Aksiyon</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {filteredAndSortedCampaigns.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-slate-700/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-medium text-white">{campaign.name}</div>
                                <div className="text-sm text-slate-400">
                                  {campaign.impressions} gösterim • {campaign.conversions} dönüşüm
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge 
                                  variant={campaign.status === "Aktif" ? "default" : "secondary"}
                                  className={
                                    campaign.status === "Aktif" ? "bg-green-600 hover:bg-green-700" :
                                    campaign.status === "Test Aşaması" ? "bg-blue-600 hover:bg-blue-700" :
                                    campaign.status === "Optimize Ediliyor" ? "bg-yellow-600 hover:bg-yellow-700" :
                                    "bg-gray-600 hover:bg-gray-700"
                                  }
                                >
                                  {campaign.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-slate-300 font-medium">{campaign.spend}</td>
                              <td className="py-3 px-4 text-green-400 font-bold">{campaign.revenue}</td>
                              <td className="py-3 px-4">
                                <span className={`font-bold ${parseFloat(campaign.roas) >= 4 ? 'text-green-400' : parseFloat(campaign.roas) >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {campaign.roas}x
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300">{campaign.ctr}</td>
                              <td className="py-3 px-4 text-slate-300">{campaign.cpc}</td>
                              <td className="py-3 px-4">
                                {getTrendIcon(campaign.trend)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    <Settings className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    {campaign.status === "Aktif" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      AI Performans İçgörüleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentChannelData.insights.map((insight, index) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${
                          insight.type === 'success' ? 'bg-green-900/20 border-green-400' :
                          insight.type === 'warning' ? 'bg-yellow-900/20 border-yellow-400' :
                          'bg-blue-900/20 border-blue-400'
                        }`}>
                          <div className="flex items-start gap-3">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                              <p className="text-slate-300 text-sm">{insight.description}</p>
                              <Badge 
                                variant="outline" 
                                className={`mt-2 ${
                                  insight.priority === 'high' ? 'border-red-400 text-red-400' :
                                  insight.priority === 'medium' ? 'border-yellow-400 text-yellow-400' :
                                  'border-blue-400 text-blue-400'
                                }`}
                              >
                                {insight.priority === 'high' ? 'Yüksek Öncelik' :
                                 insight.priority === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>
            </Tabs>

      {/* AI Chat Panel */}
      <AIChatPanel pageContext="channels" />
    </div>
  );
}
