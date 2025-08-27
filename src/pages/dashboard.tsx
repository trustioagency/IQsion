import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Calendar,
  Filter,
  Target,
  Send,
  Bot,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  PieChart,
  AlertCircle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Activity,
  Play,
  CheckCircle,
  Search
} from "lucide-react";
import AIChatPanel from "@/components/ai-chat-panel";
import Header from "@/components/layout/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';

type DateRangeKey = '7d' | '30d' | '90d' | 'custom';
type ChannelKey = 'all' | 'google' | 'meta' | 'tiktok' | 'email' | 'organic';
type MetricKey = 'revenue' | 'roas' | 'conversions' | 'traffic' | 'cost';

interface DashboardData {
  totalRevenue: number;
  totalAdSpend: number;
  avgRoas: number;
  totalConversions: number;
  metrics: any[];
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareDateRange, setCompareDateRange] = useState<DateRangeKey>('30d');
  const [selectedChannel, setSelectedChannel] = useState<ChannelKey>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('revenue');
  const [timeRange, setTimeRange] = useState('7d');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const isTestMode = window.location.search.includes('test=true');
      if (!isTestMode) {
        toast({
          title: t('loginRequired'), 
          description: t('pleaseLogin'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/?test=true";
        }, 1000);
      }
    }
  }, [user, authLoading, toast, t]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard', dateRange, selectedChannel],
    enabled: !!user,
  });

  // Channel options
  const channelOptions = [
    { value: 'all', label: t('allChannels'), color: 'bg-blue-500' },
    { value: 'google', label: 'Google Ads', color: 'bg-green-500' },
    { value: 'meta', label: 'Meta Ads', color: 'bg-blue-600' },
    { value: 'tiktok', label: 'TikTok Ads', color: 'bg-pink-500' },
    { value: 'email', label: 'Email Marketing', color: 'bg-purple-500' },
    { value: 'organic', label: language === 'tr' ? 'Organik' : 'Organic', color: 'bg-emerald-500' }
  ];

  // Metric options
  const metricOptions = [
    { value: 'revenue', label: language === 'tr' ? 'Gelir' : 'Revenue', icon: DollarSign },
    { value: 'roas', label: 'ROAS', icon: Target },
    { value: 'conversions', label: t('conversions'), icon: ShoppingCart },
    { value: 'traffic', label: language === 'tr' ? 'Trafik' : 'Traffic', icon: TrendingUp },
    { value: 'cost', label: language === 'tr' ? 'Maliyet' : 'Cost', icon: BarChart3 }
  ];

  // Mock data for demo - now includes comparison data
  const kpiData = [
    {
      title: t('totalRevenue'),
      value: "₺847,650",
      previousValue: "₺753,200",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "ROAS",
      value: "4.2x",
      previousValue: "3.9x",
      change: "+8.1%",
      changeType: "positive" as const,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: language === 'tr' ? 'Dönüşüm Oranı' : 'Conversion Rate',
      value: "3.84%",
      previousValue: "3.32%",
      change: "+15.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: language === 'tr' ? 'Aktif Müşteriler' : 'Active Customers',
      value: "12,847",
      previousValue: "11,983",
      change: "+7.3%",
      changeType: "positive" as const,
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  const chartData = [
    { date: '1 Ara', revenue: 65000, conversions: 245, previousRevenue: 58000, previousConversions: 220 },
    { date: '5 Ara', revenue: 72000, conversions: 267, previousRevenue: 64000, previousConversions: 240 },
    { date: '10 Ara', revenue: 68000, conversions: 251, previousRevenue: 61000, previousConversions: 225 },
    { date: '15 Ara', revenue: 84000, conversions: 312, previousRevenue: 75000, previousConversions: 280 },
    { date: '20 Ara', revenue: 91000, conversions: 338, previousRevenue: 82000, previousConversions: 305 },
    { date: '25 Ara', revenue: 87000, conversions: 325, previousRevenue: 78000, previousConversions: 290 },
    { date: '30 Ara', revenue: 95000, conversions: 356, previousRevenue: 85000, previousConversions: 315 }
  ];

  const insights = [
    {
      type: "opportunity",
      title: "TikTok Kampanya Fırsatı",
      description: "TikTok kampanyanızın ROAS değeri %40 artış gösteriyor. Bütçe artırımı ile potansiyel +₺25,000 ek gelir.",
      priority: "Yüksek",
      timeAgo: "2 saat önce",
      impact: "+₺25,000",
      confidence: "92%"
    }
  ];

  const teamTasks = [
    {
      id: 1,
      title: "Meta kampanya optimizasyonu",
      assignee: "Ahmet K.",
      priority: "Yüksek",
      dueDate: "Bugün",
      status: "progress"
    },
    {
      id: 2,
      title: "A/B test sonuçları analizi",
      assignee: "Elif S.",
      priority: "Orta",
      dueDate: "Yarın",
      status: "pending"
    }
  ];

  const actionableItems = [
    {
      type: "action",
      title: "Google Ads bütçesini %15 artır",
      description: "Son 7 günde %23 ROAS artışı. Önerilen günlük bütçe: ₺850",
      impact: "Yüksek",
      estimatedReturn: "+₺12,400",
      status: "suggested"
    },
    {
      type: "action", 
      title: "Lookalike kitle oluştur",
      description: "En yüksek LTV müşterilerinden %1 lookalike kitle",
      impact: "Orta",
      estimatedReturn: "+₺8,200",
      status: "suggested"
    }
  ];

  const anomalies = [
    {
      type: "warning",
      title: "CPC ani artış",
      description: "Google Ads CPC son 3 günde %28 arttı",
      severity: "Orta",
      affectedCampaigns: 3,
      timeDetected: "1 saat önce"
    },
    {
      type: "alert",
      title: "Stok uyarısı",
      description: "En çok satan 5 üründen 2'si kritik stok seviyesinde",
      severity: "Yüksek", 
      affectedProducts: 2,
      timeDetected: "30 dakika önce"
    }
  ];

  const automatedActions = [
    {
      title: "Otomatik bid ayarlaması",
      description: "Düşük performanslı anahtar kelimelerin bidleri %20 azaltıldı",
      status: "completed",
      timeExecuted: "45 dakika önce",
      impact: "₺320 tasarruf"
    },
    {
      title: "Audience genişletmesi",
      description: "Yüksek performanslı kitlelerde otomatik genişletme aktifleştirildi",
      status: "completed", 
      timeExecuted: "2 saat önce",
      impact: "+15% reach"
    }
  ];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* AI Assistant Bar - Improved Design */}
      <div className="w-full">
        <AIChatPanel pageContext="dashboard" />
      </div>

      {/* Enhanced Controls Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('Genel Bakış')}</h1>
        <div className="flex items-center gap-4">
          {/* Channel Selector */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <Select value={selectedChannel} onValueChange={(value: ChannelKey) => setSelectedChannel(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {channelOptions.map((channel) => (
                  <SelectItem key={channel.value} value={channel.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${channel.color}`}></div>
                      {channel.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <Select value={selectedMetric} onValueChange={(value: MetricKey) => setSelectedMetric(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {metricOptions.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <SelectItem key={metric.value} value={metric.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {metric.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <Select value={dateRange} onValueChange={(value: DateRangeKey) => setDateRange(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="7d">{t('last7Days')}</SelectItem>
                <SelectItem value="30d">{t('last30Days')}</SelectItem>
                <SelectItem value="90d">{t('last90Days')}</SelectItem>
                <SelectItem value="custom">{t('custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compare Toggle */}
          <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-2 border border-slate-600">
            <Switch 
              id="compare-mode" 
              checked={compareEnabled}
              onCheckedChange={setCompareEnabled}
            />
            <Label htmlFor="compare-mode" className="text-sm text-slate-300">
              {t('compare')}
            </Label>
          </div>

          {/* Compare Date Range (if enabled) */}
          {compareEnabled && (
            <Select value={compareDateRange} onValueChange={(value: DateRangeKey) => setCompareDateRange(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                <SelectValue placeholder={language === 'tr' ? 'Karşılaştırma dönemi' : 'Comparison period'} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="7d">{language === 'tr' ? 'Önceki 7 Gün' : 'Previous 7 Days'}</SelectItem>
                <SelectItem value="30d">{language === 'tr' ? 'Önceki 30 Gün' : 'Previous 30 Days'}</SelectItem>
                <SelectItem value="90d">{language === 'tr' ? 'Önceki 90 Gün' : 'Previous 90 Days'}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-slate-800/80 border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-sm hover:bg-slate-800/90">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bgColor} shadow-lg`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <Badge variant="secondary" className={`${kpi.changeType === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {kpi.change}
                  </Badge>
                </div>
                <h4 className="text-slate-400 text-sm mb-2">{kpi.title}</h4>
                <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
                {compareEnabled && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">{t('previous')}: {kpi.previousValue}</span>
                    <div className="flex items-center gap-1">
                      {kpi.changeType === 'positive' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                      )}
                      <span className={kpi.changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('revenueTrend')}
              {compareEnabled && (
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                  {t('comparative')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
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
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F680" />
                  {compareEnabled && (
                    <Line 
                      type="monotone" 
                      dataKey="previousRevenue" 
                      stroke="#94A3B8" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {t('conversionTrend')}
              {compareEnabled && (
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                  {t('comparative')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                  <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={3} />
                  {compareEnabled && (
                    <Line 
                      type="monotone" 
                      dataKey="previousConversions" 
                      stroke="#94A3B8" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Enhanced Daily Insight & Team Tasks */}
        <div className="space-y-6">

          {/* Enhanced Daily Insight */}
          <Card className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-slate-600/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                {t('todaysInsight')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.map((insight, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{t('opportunity')}</Badge>
                      <span className="text-xs text-slate-400">{insight.timeAgo}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {insight.confidence} {t('confidence')}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-white">{insight.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">{insight.impact}</span>
                      <span className="text-slate-400 text-sm">{t('potential')}</span>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      {t('viewDetails')}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Enhanced Team Tasks */}
          <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('teamTasks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-white text-sm">{task.title}</h5>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${task.priority === 'Yüksek' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{task.assignee}</span>
                      <span className="text-slate-400">{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Enhanced Action Center */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/80 border-slate-700/50 h-[600px] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t('actionCenter')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px] px-6">
                <div className="space-y-6">

                  {/* Actionable Items */}
                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {t('actionableItems')}
                    </h4>
                    <div className="space-y-3">
                      {actionableItems.map((action, index) => (
                        <div key={index} className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/15 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-white mb-1">{action.title}</h5>
                              <p className="text-slate-300 text-sm">{action.description}</p>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-3">
                              {action.estimatedReturn}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">{t('impact')}: {action.impact}</span>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Play className="w-3 h-3 mr-1" />
                              {t('apply')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Anomalies */}
                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {t('anomaliesAndAlerts')}
                    </h4>
                    <div className="space-y-3">
                      {anomalies.map((anomaly, index) => (
                        <div key={index} className={`p-4 rounded-lg border transition-colors ${
                          anomaly.severity === 'Yüksek' 
                            ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15' 
                            : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-white mb-1">{anomaly.title}</h5>
                              <p className="text-slate-300 text-sm">{anomaly.description}</p>
                            </div>
                            <Badge 
                              className={`ml-3 ${
                                anomaly.severity === 'Yüksek' 
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }`}
                            >
                              {anomaly.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">{anomaly.timeDetected}</span>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              <Eye className="w-3 h-3 mr-1" />
                              {t('inspect')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Automated Actions */}
                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {t('automatedActions')}
                    </h4>
                    <div className="space-y-3">
                      {automatedActions.map((auto, index) => (
                        <div key={index} className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/15 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-white mb-1">{auto.title}</h5>
                              <p className="text-slate-300 text-sm">{auto.description}</p>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-3">
                              {auto.impact}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">{auto.timeExecuted}</span>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs text-emerald-400">{t('completed')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}