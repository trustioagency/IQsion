import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import AIChatPanel from "../components/ai-chat-panel";
import { 
  BarChart3, TrendingUp, Target, AlertTriangle, DollarSign, 
  ShoppingCart, Users, Calendar, Filter, Eye, Sparkles,
  Brain, ArrowUpRight, ArrowDownRight, MousePointer, 
  Clock, Heart, Share2, MessageCircle, Mail, Phone,
  Zap, Activity, Play, Pause, Download, Upload,
  Smartphone, Monitor, Tablet, Globe, Search, Star
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from 'recharts';

export default function KpiAnalysis() {
  const [selectedKPI, setSelectedKPI] = useState<string>("roas");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [compareRange, setCompareRange] = useState<string>("previous_period");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // KPI verileri
  const kpiData = {
    // Temel Gelir Metrikleri
    revenue: { 
      name: "Toplam Ciro", 
      icon: DollarSign, 
      value: "₺847,650", 
      previousValue: "₺753,200",
      change: "+12.5%", 
      trend: "up",
      color: "emerald",
      category: "revenue"
    },
    roas: { 
      name: "ROAS", 
      icon: Target, 
      value: "4.2x", 
      previousValue: "3.9x",
      change: "+8.1%", 
      trend: "up",
      color: "blue",
      category: "revenue"
    },
    roi: { 
      name: "ROI", 
      icon: TrendingUp, 
      value: "320%", 
      previousValue: "290%",
      change: "+10.3%", 
      trend: "up",
      color: "purple",
      category: "revenue"
    },

    // Müşteri Metrikleri
    cpa: { 
      name: "CPA", 
      icon: Users, 
      value: "₺125", 
      previousValue: "₺132",
      change: "-5.3%", 
      trend: "down",
      color: "purple",
      category: "customer"
    },
    aov: { 
      name: "AOV", 
      icon: ShoppingCart, 
      value: "₺385", 
      previousValue: "₺359",
      change: "+7.2%", 
      trend: "up",
      color: "orange",
      category: "customer"
    },
    ltv: { 
      name: "LTV", 
      icon: Eye, 
      value: "₺1,250", 
      previousValue: "₺1,138",
      change: "+9.8%", 
      trend: "up",
      color: "indigo",
      category: "customer"
    },
    clv_cac: { 
      name: "LTV/CAC", 
      icon: Star, 
      value: "10.0x", 
      previousValue: "8.6x",
      change: "+16.3%", 
      trend: "up",
      color: "emerald",
      category: "customer"
    },

    // Dönüşüm Metrikleri
    conversion: { 
      name: "Dönüşüm Oranı", 
      icon: Target, 
      value: "3.84%", 
      previousValue: "3.33%",
      change: "+15.2%", 
      trend: "up",
      color: "green",
      category: "conversion"
    },
    add_to_cart: { 
      name: "Sepete Ekleme", 
      icon: ShoppingCart, 
      value: "8.2%", 
      previousValue: "7.5%",
      change: "+9.3%", 
      trend: "up",
      color: "blue",
      category: "conversion"
    },
    checkout_rate: { 
      name: "Ödeme Başlatma", 
      icon: Play, 
      value: "46.8%", 
      previousValue: "44.2%",
      change: "+5.9%", 
      trend: "up",
      color: "purple",
      category: "conversion"
    },

    // Trafik Metrikleri
    impressions: { 
      name: "Gösterimler", 
      icon: Eye, 
      value: "2.4M", 
      previousValue: "2.1M",
      change: "+14.3%", 
      trend: "up",
      color: "blue",
      category: "traffic"
    },
    clicks: { 
      name: "Tıklamalar", 
      icon: MousePointer, 
      value: "156K", 
      previousValue: "142K",
      change: "+9.9%", 
      trend: "up",
      color: "green",
      category: "traffic"
    },
    ctr: { 
      name: "CTR", 
      icon: Target, 
      value: "6.5%", 
      previousValue: "6.8%",
      change: "-4.4%", 
      trend: "down",
      color: "orange",
      category: "traffic"
    },
    cpc: { 
      name: "CPC", 
      icon: DollarSign, 
      value: "₺3.2", 
      previousValue: "₺3.5",
      change: "-8.6%", 
      trend: "down",
      color: "emerald",
      category: "traffic"
    },
    cpm: { 
      name: "CPM", 
      icon: Eye, 
      value: "₺21.5", 
      previousValue: "₺24.2",
      change: "-11.2%", 
      trend: "down",
      color: "blue",
      category: "traffic"
    },

    // Engagement Metrikleri
    sessions: { 
      name: "Oturumlar", 
      icon: Globe, 
      value: "89.2K", 
      previousValue: "81.4K",
      change: "+9.6%", 
      trend: "up",
      color: "purple",
      category: "engagement"
    },
    bounce_rate: { 
      name: "Çıkış Oranı", 
      icon: ArrowDownRight, 
      value: "32.4%", 
      previousValue: "38.1%",
      change: "-15.0%", 
      trend: "down",
      color: "green",
      category: "engagement"
    },
    session_duration: { 
      name: "Oturum Süresi", 
      icon: Clock, 
      value: "2:34", 
      previousValue: "2:18",
      change: "+11.6%", 
      trend: "up",
      color: "indigo",
      category: "engagement"
    },
    page_views: { 
      name: "Sayfa Görüntüleme", 
      icon: Eye, 
      value: "234K", 
      previousValue: "213K",
      change: "+9.9%", 
      trend: "up",
      color: "orange",
      category: "engagement"
    },

    // Sosyal Medya Metrikleri
    likes: { 
      name: "Beğeniler", 
      icon: Heart, 
      value: "12.4K", 
      previousValue: "10.8K",
      change: "+14.8%", 
      trend: "up",
      color: "red",
      category: "social"
    },
    shares: { 
      name: "Paylaşımlar", 
      icon: Share2, 
      value: "3.2K", 
      previousValue: "2.9K",
      change: "+10.3%", 
      trend: "up",
      color: "blue",
      category: "social"
    },
    comments: { 
      name: "Yorumlar", 
      icon: MessageCircle, 
      value: "1.8K", 
      previousValue: "1.6K",
      change: "+12.5%", 
      trend: "up",
      color: "green",
      category: "social"
    },
    engagement_rate: { 
      name: "Etkileşim Oranı", 
      icon: Activity, 
      value: "4.2%", 
      previousValue: "3.8%",
      change: "+10.5%", 
      trend: "up",
      color: "purple",
      category: "social"
    }
  };

  // Kategori filtreleme
  const categories = [
    { id: "revenue", name: "Gelir", icon: DollarSign },
    { id: "customer", name: "Müşteri", icon: Users },
    { id: "conversion", name: "Dönüşüm", icon: Target },
    { id: "traffic", name: "Trafik", icon: MousePointer },
    { id: "engagement", name: "Etkileşim", icon: Activity },
    { id: "social", name: "Sosyal Medya", icon: Heart }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("revenue");

  const getKPIsByCategory = (category: string) => {
    return Object.entries(kpiData).filter(([key, kpi]) => kpi.category === category);
  };

  // Zaman serisi mock data
  const timeSeriesData = [
    { date: '1 Oca', current: 3.8, previous: 3.4 },
    { date: '5 Oca', current: 4.1, previous: 3.7 },
    { date: '10 Oca', current: 3.9, previous: 3.5 },
    { date: '15 Oca', current: 4.3, previous: 3.9 },
    { date: '20 Oca', current: 4.0, previous: 3.6 },
    { date: '25 Oca', current: 4.5, previous: 4.1 },
    { date: '30 Oca', current: 4.2, previous: 3.8 }
  ];

  // Kanal bazında data
  const channelDimensions = [
    {
      id: "channel",
      name: "Kanal",
      data: [
        { name: 'Google Ads', current: 4.8, previous: 4.3, spend: 45000, clicks: 28000, impressions: 890000 },
        { name: 'Meta Ads', current: 4.2, previous: 3.9, spend: 38000, clicks: 24000, impressions: 750000 },
        { name: 'TikTok Ads', current: 3.1, previous: 2.8, spend: 15000, clicks: 12000, impressions: 420000 },
        { name: 'Organik', current: 5.2, previous: 4.9, spend: 0, clicks: 8000, impressions: 180000 }
      ]
    },
    {
      id: "device",
      name: "Cihaz",
      data: [
        { name: 'Mobil', current: 4.1, previous: 3.8, spend: 52000, clicks: 42000, impressions: 980000 },
        { name: 'Masaüstü', current: 4.6, previous: 4.2, spend: 38000, clicks: 26000, impressions: 580000 },
        { name: 'Tablet', current: 3.8, previous: 3.5, spend: 8000, clicks: 4000, impressions: 180000 }
      ]
    },
    {
      id: "location",
      name: "Konum",
      data: [
        { name: 'İstanbul', current: 4.5, previous: 4.1, spend: 35000, clicks: 28000, impressions: 650000 },
        { name: 'Ankara', current: 4.2, previous: 3.9, spend: 22000, clicks: 18000, impressions: 420000 },
        { name: 'İzmir', current: 4.0, previous: 3.7, spend: 18000, clicks: 14000, impressions: 320000 },
        { name: 'Diğer', current: 3.9, previous: 3.6, spend: 23000, clicks: 12000, impressions: 350000 }
      ]
    },
    {
      id: "age",
      name: "Yaş Grubu",
      data: [
        { name: '18-24', current: 3.8, previous: 3.4, spend: 18000, clicks: 15000, impressions: 380000 },
        { name: '25-34', current: 4.5, previous: 4.1, spend: 42000, clicks: 32000, impressions: 720000 },
        { name: '35-44', current: 4.3, previous: 3.9, spend: 28000, clicks: 20000, impressions: 480000 },
        { name: '45+', current: 4.0, previous: 3.7, spend: 10000, clicks: 5000, impressions: 160000 }
      ]
    }
  ];

  const [selectedDimension, setSelectedDimension] = useState<string>("channel");
  const selectedKPIData = kpiData[selectedKPI as keyof typeof kpiData];
  const currentDimensionData = channelDimensions.find(dim => dim.id === selectedDimension);

  // AI Insights
  const getAIInsight = (dimension: string) => {
    const insights = {
      channel: "Son 30 günde ROAS genel olarak iyi seviyede (4.2x). Google Ads'ınız 4.8x ile en yüksek performansı gösteriyor, önceki dönemden %11.6 artış var. TikTok Ads'da 3.1x ile iyileştirme fırsatı var ancak trend pozitif (+10.7%).",
      device: "Masaüstü kullanıcıları 4.6x ROAS ile en yüksek performansı gösteriyor. Mobil trafik %60'ı oluştururken ROAS 4.1x seviyesinde. Mobil optimizasyonu ile büyük potansiyel var.",
      location: "İstanbul %38 harcama payı ile 4.5x ROAS sağlıyor. Tüm şehirlerde pozitif trend var, özellikle Ankara'da %7.7 artış dikkat çekiyor.",
      age: "25-34 yaş grubu hem en yüksek ROAS'ı (4.5x) hem de en büyük bütçe payını (%43) alıyor. Bu segmente odaklanarak ölçeklendirme yapılabilir."
    };
    return insights[dimension as keyof typeof insights] || "Bu boyut için henüz analiz yapılmamış.";
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header ve Chat Butonu */}
          <div className="bg-slate-800/50 p-4 border border-slate-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">KPI Analizi</h1>
                <p className="text-sm text-slate-400">Performans göstergelerinizi seçin ve derinlemesine analiz edin</p>
              </div>
              <Button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                size="sm"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Asistan
              </Button>
            </div>
          </div>

          <div className="space-y-6">

              {/* 1. Bölüm: KPI Seçimi - Compact */}
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  📊 Merceğini Seç
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {/* Kategori Seçimi */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Kategori</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {categories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {category.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* KPI Seçimi */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">KPI</label>
                    <Select value={selectedKPI} onValueChange={setSelectedKPI}>
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {getKPIsByCategory(selectedCategory).map(([key, kpi]) => {
                          const Icon = kpi.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {kpi.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Karşılaştırma */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Karşılaştırma</label>
                    <Select value={compareRange} onValueChange={setCompareRange}>
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="previous_period">Önceki Dönem</SelectItem>
                        <SelectItem value="previous_year">Geçen Yıl</SelectItem>
                        <SelectItem value="custom">Özel Tarih</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Zaman Aralığı */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Zaman Aralığı</label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="7d">Son 7 Gün</SelectItem>
                        <SelectItem value="30d">Son 30 Gün</SelectItem>
                        <SelectItem value="90d">Bu Çeyrek</SelectItem>
                        <SelectItem value="1y">Bu Yıl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Seçilen KPI Özeti - Kompakt */}
                {selectedKPIData && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <selectedKPIData.icon className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm">{selectedKPIData.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">{selectedKPIData.value}</span>
                            <div className="flex items-center gap-1">
                              {selectedKPIData.trend === 'up' ? (
                                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 text-red-400" />
                              )}
                              <span className={`text-xs ${
                                selectedKPIData.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {selectedKPIData.change}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">vs {selectedKPIData.previousValue}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>

              {/* 2. Bölüm: Zaman Serisi Grafiği */}
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  📈 Büyük Resmi Gör
                </h2>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-white text-base">
                      <BarChart3 className="w-4 h-4" />
                      {selectedKPIData?.name} Trendi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9CA3AF" 
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }} 
                          />
                          <Area
                            type="monotone"
                            dataKey="previous"
                            stroke="#6B7280"
                            fill="#6B7280"
                            fillOpacity={0.1}
                            strokeDasharray="5 5"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="current" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', strokeWidth: 1, r: 3 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="previous" 
                            stroke="#6B7280" 
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={{ fill: '#6B7280', strokeWidth: 1, r: 2 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 3. Bölüm: Detaylı Boyut Analizi */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    🔍 Detaylara İn
                  </h2>
                  <Select value={selectedDimension} onValueChange={setSelectedDimension}>
                    <SelectTrigger className="w-32 bg-slate-800 border-slate-700 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {channelDimensions.map((dim) => (
                        <SelectItem key={dim.id} value={dim.id}>{dim.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Performans Tablosu */}
                  <div className="lg:col-span-2">
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white text-base">{currentDimensionData?.name} Performansı</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                          {currentDimensionData?.data.map((item, index) => (
                            <div key={index} className="bg-slate-700/50 rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-medium text-sm">{item.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-sm">{item.current}x</span>
                                  <div className="flex items-center gap-1">
                                    {item.current > item.previous ? (
                                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <ArrowDownRight className="w-3 h-3 text-red-400" />
                                    )}
                                    <span className={`text-xs ${
                                      item.current > item.previous ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                      {((item.current - item.previous) / item.previous * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-slate-400">Harcama</p>
                                  <p className="text-white font-medium">₺{item.spend.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Tıklama</p>
                                  <p className="text-white font-medium">{item.clicks.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">CTR</p>
                                  <p className="text-white font-medium">{((item.clicks / item.impressions) * 100).toFixed(2)}%</p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="w-full bg-slate-600 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                    style={{width: `${(item.current / 5) * 100}%`}}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI İçgörü */}
                  <div>
                    <Card className="bg-slate-800 border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-white text-base">
                          <Brain className="w-4 h-4 text-purple-400" />
                          AI İçgörü
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-md p-3">
                            <p className="text-slate-300 text-xs leading-relaxed">
                              {getAIInsight(selectedDimension)}
                            </p>
                          </div>

                          {/* Aksiyon Önerileri */}
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3">
                            <h4 className="text-emerald-400 font-medium mb-2 flex items-center gap-2 text-sm">
                              <Zap className="w-3 h-3" />
                              Aksiyon Önerileri
                            </h4>
                            <div className="space-y-1 text-xs text-slate-300">
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-400 text-xs">•</span>
                                <p>En yüksek performanslı segmente bütçe artışı yapın</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-400 text-xs">•</span>
                                <p>Düşük performanslı segmentlerde A/B testi başlatın</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-400 text-xs">•</span>
                                <p>Trend pozitif olan segmentleri ölçeklendirin</p>
                              </div>
                            </div>
                          </div>

                          {/* Uyarılar */}
                          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                            <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2 text-sm">
                              <AlertTriangle className="w-3 h-3" />
                              Dikkat Edilecekler
                            </h4>
                            <div className="space-y-1 text-xs text-slate-300">
                              <div className="flex items-start gap-2">
                                <span className="text-red-400 text-xs">•</span>
                                <p>CTR düşük olan segmentlerde kreatif yenileme gerekli</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-red-400 text-xs">•</span>
                                <p>CPC artış trendinde, rekabet artıyor olabilir</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

          </div>
        </div>
      </div>

      {/* AI Chat Panel - Conditional & Fixed Width */}
      {isChatOpen && (
        <div className="w-80 flex-shrink-0 border-l border-slate-700 overflow-hidden">
          <AIChatPanel 
            pageContext="KPI Analizi"
            insights={[]}
            suggestions={[
              'Hangi KPI\'ya odaklanmalıyım?',
              'Dönüşüm oranımı nasıl artırabilirim?',
              'ROAS\'ımı optimize etmenin yolları'
            ]}
          />
        </div>
      )}
    </div>
  );
}