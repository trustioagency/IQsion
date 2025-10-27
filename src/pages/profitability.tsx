
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { 
  DollarSign, TrendingUp, TrendingDown, Target, Package, Users, BarChart3, 
  LineChart, Filter, ArrowUpDown, Calendar, Eye, Heart, ShoppingBag, 
  Clock, MapPin, Smartphone, Monitor, ArrowRight
} from "lucide-react";
import AIChatPanel from "../components/ai-chat-panel";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from "../hooks/useAuth";

type ProfitabilitySummary = {
  requestedRange: { startDate: string; endDate: string };
  currency: string;
  rows: Array<{ date: string; revenue: number; cogs: number; grossProfit: number; netProfit: number }>;
  totals: { revenue: number; cogs: number; grossProfit: number; netProfit: number; margin: number; adSpend: number; roas: number | null; revenueMode: 'gross'|'paid' };
};

export default function Profitability() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [sortBy, setSortBy] = useState('profit');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');

  const { user } = useAuth();
  const uid = (user as any)?.uid || (user as any)?.id;

  const makeRange = (key: string) => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() - 1);
    const start = new Date(end);
    const days = key === '7d' ? 6 : key === '30d' ? 29 : key === '90d' ? 89 : 29;
    start.setDate(end.getDate() - days);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: fmt(start), endDate: fmt(end) };
  };

  const { data: profitData } = useQuery<ProfitabilitySummary | null>({
    queryKey: ['profitability', uid, timeRange],
    enabled: !!uid,
    queryFn: async () => {
      const { startDate, endDate } = makeRange(timeRange);
      const url = new URL('/api/profitability/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('startDate', startDate);
      url.searchParams.set('endDate', endDate);
      url.searchParams.set('revenueMode', 'gross');
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    }
  });

  const fmtTRY = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n || 0);
  const totals = profitData?.totals;
  const profitabilityMetrics = useMemo(() => {
    const revenue = totals ? fmtTRY(totals.revenue) : '₺0';
    const gross = totals ? fmtTRY(totals.grossProfit) : '₺0';
    const net = totals ? fmtTRY(totals.netProfit) : '₺0';
    const roasStr = totals ? (totals.roas === null ? '—' : `${(totals.roas || 0).toFixed(1)}x`) : '—';
    return [
      { title: 'Gelir', value: revenue, color: 'purple' },
      { title: 'Brüt Kar', value: gross, color: 'blue' },
      { title: 'Net Kar (Cebine Kalan)', value: net, color: 'green' },
      { title: 'ROAS', value: roasStr, color: 'orange' }
    ];
  }, [totals]);

  const profitabilityTrendData = useMemo(() => {
    const rows = profitData?.rows || [];
    return rows.map(r => ({ date: r.date, netProfit: r.netProfit, grossProfit: r.grossProfit, revenue: r.revenue }));
  }, [profitData]);

  const channelOptions = [
    { value: 'all', label: 'Tüm Kanallar' },
    { value: 'google', label: 'Google Ads' },
    { value: 'meta', label: 'Meta Ads' },
    { value: 'tiktok', label: 'TikTok Ads' },
    { value: 'email', label: 'Email Marketing' },
    { value: 'organic', label: 'Organik Trafik' }
  ];

  const channelProfitability = [
    { channel: 'Google Ads', revenue: 185420, cost: 45230, profit: 140190, margin: 75.6, roas: 4.1, ltv: 485, orders: 1250 },
    { channel: 'Meta Ads', revenue: 156780, cost: 38950, profit: 117830, margin: 75.2, roas: 4.0, ltv: 420, orders: 980 },
    { channel: 'TikTok Ads', revenue: 98650, cost: 28340, profit: 70310, margin: 71.3, roas: 3.5, ltv: 380, orders: 650 },
    { channel: 'Email', revenue: 45230, cost: 2850, profit: 42380, margin: 93.7, roas: 15.9, ltv: 650, orders: 320 },
    { channel: 'Organik', revenue: 78950, cost: 0, profit: 78950, margin: 100, roas: Infinity, ltv: 580, orders: 420 }
  ];

  const productProfitabilityData = [
    { product: 'Yüksek Bel Siyah Bikini', revenue: 125670, cost: 44085, profit: 81585, margin: 64.9, units: 1250, ltv: 385, roas: 2.8 },
    { product: 'Tropikal Desenli Tek Parça', revenue: 98450, cost: 41350, profit: 57100, margin: 58.0, units: 985, ltv: 420, roas: 2.4 },
    { product: 'Beyaz Crop Top', revenue: 87390, cost: 61173, profit: 26217, margin: 30.0, units: 720, ltv: 290, roas: 1.4 },
    { product: 'Leopar Desenli Bikini', revenue: 156780, cost: 94068, profit: 62712, margin: 40.0, units: 1890, ltv: 340, roas: 1.7 }
  ];

  const audienceAnalysisData = [
    { 
      segment: '25-34 Kadın, İstanbul', 
      revenue: 186750, 
      cost: 45850, 
      profit: 140900, 
      ltv: 485, 
      cac: 118,
      orders: 1250,
      avgOrderValue: 149,
      repeatRate: 68,
      demographics: { age: '25-34', gender: 'Kadın', location: 'İstanbul', device: 'Mobile %75' },
      interests: ['Moda', 'Güzellik', 'Lifestyle'],
      behaviors: ['Akşam 19-22 arası aktif', 'Instagram Stories yüksek etkileşim', 'Hafta sonu satın alma']
    },
    { 
      segment: '35-44 Kadın, Ankara', 
      revenue: 145620, 
      cost: 38950, 
      profit: 106670, 
      ltv: 420, 
      cac: 102,
      orders: 980,
      avgOrderValue: 149,
      repeatRate: 72,
      demographics: { age: '35-44', gender: 'Kadın', location: 'Ankara', device: 'Desktop %60' },
      interests: ['Kalite', 'Sürdürülebilirlik', 'Aile'],
      behaviors: ['Öğle 12-14 arası aktif', 'Email kampanyalarına yüksek yanıt', 'Planlı alışveriş']
    },
    { 
      segment: '18-24 Kadın, İzmir', 
      revenue: 98750, 
      cost: 28340, 
      profit: 70410, 
      ltv: 290, 
      cac: 89,
      orders: 650,
      avgOrderValue: 152,
      repeatRate: 45,
      demographics: { age: '18-24', gender: 'Kadın', location: 'İzmir', device: 'Mobile %85' },
      interests: ['Trend', 'Social Media', 'Müzik'],
      behaviors: ['Gece 21-24 arası aktif', 'TikTok yüksek etkileşim', 'İmpuls alışveriş']
    },
    { 
      segment: '25-44 Kadın, Diğer', 
      revenue: 76890, 
      cost: 19850, 
      profit: 57040, 
      ltv: 380, 
      cac: 96,
      orders: 420,
      avgOrderValue: 183,
      repeatRate: 58,
      demographics: { age: '25-44', gender: 'Kadın', location: 'Diğer Şehirler', device: 'Mixed' },
      interests: ['Pratiklik', 'Değer', 'Konfor'],
      behaviors: ['Hafta içi aktif', 'Google araması yoğun', 'Karşılaştırmalı alışveriş']
    }
  ];

  const channelProfitData = channelProfitability.map(channel => ({
    name: channel.channel,
    value: channel.profit,
    percentage: ((channel.profit / channelProfitability.reduce((sum, c) => sum + c.profit, 0)) * 100).toFixed(1)
  }));

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];

  const sortedProducts = [...productProfitabilityData].sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a] as number;
    const bValue = b[sortBy as keyof typeof b] as number;
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const sortedAudiences = [...audienceAnalysisData].sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a] as number;
    const bValue = b[sortBy as keyof typeof b] as number;
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  return (
    <div className="space-y-6">
            
            {/* Header with Advanced Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Karlılık Analizi</h1>
                <p className="text-slate-400">Kanal, ürün ve hedef kitle bazında derinlemesine karlılık analizi</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {channelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-32">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="7d">Son 7 gün</SelectItem>
                    <SelectItem value="30d">Son 30 gün</SelectItem>
                    <SelectItem value="90d">Son 90 gün</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-md border border-slate-600">
                  <Switch 
                    id="comparison" 
                    checked={showComparison}
                    onCheckedChange={setShowComparison}
                  />
                  <Label htmlFor="comparison" className="text-sm text-slate-300">Karşılaştır</Label>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profitabilityMetrics.map((metric, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-${metric.color}-500/20 rounded-xl flex items-center justify-center`}>
                        <DollarSign className={`w-6 h-6 text-${metric.color}-500`} />
                      </div>
                      {/* Optional change badge hidden for now */}
                    </div>
                    <h4 className="text-slate-400 text-sm mb-2">{metric.title}</h4>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    {metric.title.startsWith('Net Kar') && totals && (
                      <p className="text-sm text-slate-400 mt-1">Marj: %{(totals.margin || 0).toFixed(1)}</p>
                    )}
                    {showComparison && (
                      <p className="text-sm text-slate-400 mt-1">Önceki döneme göre</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Profitability Trend Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Karlılık Trendi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={profitabilityTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netProfit" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Net Kar"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="grossProfit" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="Brüt Kar"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        name="Gelir"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Channel Profitability Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Kanal Karlılığı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300">Kanal</th>
                          <th className="text-right py-3 px-4 text-slate-300">Gelir</th>
                          <th className="text-right py-3 px-4 text-slate-300">Kar</th>
                          <th className="text-right py-3 px-4 text-slate-300">LTV</th>
                          <th className="text-right py-3 px-4 text-slate-300">ROAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {channelProfitability.map((channel, index) => (
                          <tr key={index} className="border-b border-slate-700/50">
                            <td className="py-3 px-4 text-white font-medium">{channel.channel}</td>
                            <td className="text-right py-3 px-4 text-white">₺{channel.revenue.toLocaleString()}</td>
                            <td className="text-right py-3 px-4 text-green-400 font-medium">₺{channel.profit.toLocaleString()}</td>
                            <td className="text-right py-3 px-4 text-blue-400">₺{channel.ltv}</td>
                            <td className="text-right py-3 px-4 text-purple-400 font-medium">
                              {channel.roas === Infinity ? '∞' : `${channel.roas.toFixed(1)}x`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Kar Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelProfitData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {channelProfitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F3F4F6'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {channelProfitData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-sm text-white font-medium">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analysis Tabs */}
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="products" className="data-[state=active]:bg-slate-700">
                  <Package className="w-4 h-4 mr-2" />
                  Ürün Analizi
                </TabsTrigger>
                <TabsTrigger value="audience" className="data-[state=active]:bg-slate-700">
                  <Users className="w-4 h-4 mr-2" />
                  Hedef Kitle Analizi
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Ürün Karlılığı Detayı
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300 w-36">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="profit">Kar</SelectItem>
                            <SelectItem value="margin">Marj</SelectItem>
                            <SelectItem value="revenue">Gelir</SelectItem>
                            <SelectItem value="ltv">LTV</SelectItem>
                            <SelectItem value="roas">ROAS</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                          className="text-slate-300 hover:text-white"
                        >
                          {sortOrder === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sortedProducts.map((product, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-white font-medium text-lg">{product.product}</h4>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                %{product.margin} Marj
                              </Badge>
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                                {product.roas.toFixed(1)}x ROAS
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="space-y-1">
                              <span className="text-slate-400">Gelir</span>
                              <div className="text-white font-medium">₺{product.revenue.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">Net Kar</span>
                              <div className="text-green-400 font-medium">₺{product.profit.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">LTV</span>
                              <div className="text-blue-400 font-medium">₺{product.ltv}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">Satılan Birim</span>
                              <div className="text-white font-medium">{product.units.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audience" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Derinlemesine Hedef Kitle Analizi
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-300 w-36">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="profit">Kar</SelectItem>
                            <SelectItem value="ltv">LTV</SelectItem>
                            <SelectItem value="repeatRate">Tekrar Oranı</SelectItem>
                            <SelectItem value="avgOrderValue">Ort. Sepet</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                          className="text-slate-300 hover:text-white"
                        >
                          {sortOrder === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {sortedAudiences.map((audience, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-white font-medium text-lg mb-2">{audience.segment}</h4>
                              <div className="flex items-center gap-4 text-sm text-slate-300">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {audience.demographics.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {audience.demographics.age}
                                </span>
                                <span className="flex items-center gap-1">
                                  {audience.demographics.device.includes('Mobile') ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                                  {audience.demographics.device}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                                LTV/CAC: {(audience.ltv / audience.cac).toFixed(1)}x
                              </Badge>
                              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                                %{audience.repeatRate} Tekrar
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="space-y-1">
                              <span className="text-slate-400">Net Kar</span>
                              <div className="text-green-400 font-medium">₺{audience.profit.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">LTV</span>
                              <div className="text-blue-400 font-medium">₺{audience.ltv}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">CAC</span>
                              <div className="text-orange-400 font-medium">₺{audience.cac}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400">Ort. Sepet</span>
                              <div className="text-white font-medium">₺{audience.avgOrderValue}</div>
                            </div>
                          </div>

                          <div className="border-t border-slate-600 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h5 className="text-slate-300 font-medium mb-2 flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  İlgi Alanları
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {audience.interests.map((interest, i) => (
                                    <Badge key={i} variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <h5 className="text-slate-300 font-medium mb-2 flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  Davranış Kalıpları
                                </h5>
                                <div className="space-y-1">
                                  {audience.behaviors.map((behavior, i) => (
                                    <div key={i} className="text-sm text-slate-400">• {behavior}</div>
                                  ))}
                                </div>
                              </div>
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
            <AIChatPanel 
              pageContext="Karlılık Analizi"
              insights={[
                {
                  id: '1',
                  type: 'success',
                  title: 'Net kar marjı hedefin üzerinde!',
                  description: 'Bu ayki net kar marjınız %21.2 ile hedeflediğiniz %18\'in üzerinde gerçekleşti.',
                  action: 'Detayları görüntüle',
                  icon: TrendingUp
                },
                {
                  id: '2',
                  type: 'opportunity',
                  title: 'Email Marketing potansiyeli',
                  description: 'Email marketing %93.7 kar marjı ile en karlı kanal. Bütçe artırımı öneririz.',
                  action: 'Bütçe planla',
                  icon: Target
                },
                {
                  id: '3',
                  type: 'warning',
                  title: 'TikTok Ads maliyeti yükseliyor',
                  description: 'TikTok\'ta CAC artışı var. Kreatif testleri artırarak performansı iyileştirin.',
                  action: 'Optimizasyon önerileri',
                  icon: Target
                }
              ]}
              suggestions={[
                'En karlı ürünleri analiz et',
                'Kanal karlılığı karşılaştır',
                'LTV/CAC oranı nasıl iyileştirilebilir?',
                'Hedef kitle segmentasyonu öner'
              ]}
            />

    </div>
  );
}
