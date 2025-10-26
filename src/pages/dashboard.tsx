import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
const AIChatPanel = lazy(() => import("../components/ai-chat-panel"));
import Header from "../components/layout/header";
import { useLanguage } from "../contexts/LanguageContext";
import {
  DollarSign, Target, ShoppingCart, TrendingUp, BarChart3, Users, Layers, Calendar, ArrowUpRight, ArrowDownRight, Zap, Activity,
  Play, AlertTriangle, Eye, CheckCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import { Clock as ClockIcon } from 'lucide-react';

type DateRangeKey = '7d' | '30d' | '90d' | 'custom';
type ChannelKey = 'all' | 'google' | 'meta' | 'tiktok' | 'email' | 'organic' | 'shopify';
type MetricKey = 'revenue' | 'roas' | 'conversions' | 'traffic' | 'cost';

// GA API response minimal typings
type GaMetricRow = {
  date: string; // YYYYMMDD
  sessions: number;
  newUsers: number;
  activeUsers: number;
  averageSessionDuration: number; // seconds
  eventCount: number;
};

type GaTotals = {
  sessions?: number;
  newUsers?: number;
  activeUsers?: number;
  averageSessionDuration?: number;
  eventCount?: number;
};

type GaSummary = {
  rows: GaMetricRow[];
  totals?: GaTotals;
  requestedRange?: { startDate: string; endDate: string };
  channelApplied?: string;
};

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareDateRange, setCompareDateRange] = useState<DateRangeKey>('30d');
  const [selectedChannel, setSelectedChannel] = useState<ChannelKey>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('revenue');

  type MetaSummary = {
    rows: Array<{ date: string; spend: number; impressions: number; clicks: number; ctr: number }>;
    totals: { spend: number; impressions: number; clicks: number; ctr: number; cpc: number };
    requestedRange: { startDate: string; endDate: string };
  } | null;

  const makeMetaRange = (key: DateRangeKey) => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() - 1);
    const start = new Date(end);
    const days = key === '7d' ? 6 : key === '30d' ? 29 : key === '90d' ? 89 : 6;
    start.setDate(end.getDate() - days);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: fmt(start), endDate: fmt(end) };
  };

  useEffect(() => {
    if (!authLoading && !user) {
      const isTestMode = window.location.search.includes('test=true');
      if (!isTestMode) {
        toast({ title: t('loginRequired'), description: t('pleaseLogin'), variant: 'destructive' });
        setTimeout(() => { window.location.href = '/?test=true'; }, 1000);
      }
    }
  }, [user, authLoading, toast, t]);

  const makeGaRange = (key: DateRangeKey) => {
    switch (key) {
      case '7d': return { startDate: '7daysAgo', endDate: 'yesterday' };
      case '30d': return { startDate: '30daysAgo', endDate: 'yesterday' };
      case '90d': return { startDate: '90daysAgo', endDate: 'yesterday' };
      default: return { startDate: '7daysAgo', endDate: 'yesterday' };
    }
  };

  const uid = (user as any)?.uid || (user as any)?.id;

  const { data: connections } = useQuery({
    queryKey: ['connections', uid],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`/api/connections?userId=${encodeURIComponent(uid)}`, { credentials: 'include' });
      if (!res.ok) return {} as any;
      return res.json();
    }
  });

  const selectedGaPropertyId: string | undefined = (connections as any)?.google_analytics?.propertyId;
  const metaConnected: boolean = !!(connections as any)?.meta_ads?.isConnected;
  const shopifyConnected: boolean = !!(connections as any)?.shopify?.isConnected;

  const { data: gaSummary, isLoading } = useQuery<GaSummary | null>({
    queryKey: ['ga-summary', uid, selectedGaPropertyId, dateRange, selectedChannel],
    enabled: !!user && !!selectedGaPropertyId,
    queryFn: async () => {
      const { startDate, endDate } = makeGaRange(dateRange);
      const url = new URL('/api/analytics/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('propertyId', selectedGaPropertyId!);
      url.searchParams.set('startDate', startDate);
      url.searchParams.set('endDate', endDate);
      if (selectedChannel && selectedChannel !== 'all') url.searchParams.set('channel', selectedChannel);
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) return null;
      const json = await res.json();
      const dimIndex = (json.dimensionHeaders || []).findIndex((d: any) => d.name === 'date');
      const mNames = (json.metricHeaders || []).map((m: any) => m.name);
      const rows: GaMetricRow[] = (json.rows || []).map((r: any) => {
        const date = dimIndex >= 0 ? r.dimensionValues[dimIndex]?.value : '';
        const metrics = r.metricValues || [];
        const get = (name: string) => {
          const idx = mNames.indexOf(name);
          const raw = idx >= 0 ? metrics[idx]?.value : '0';
          const num = Number(raw);
          return Number.isFinite(num) ? num : 0;
        };
        return {
          date,
          sessions: get('sessions'),
          newUsers: get('newUsers'),
          activeUsers: get('activeUsers'),
          averageSessionDuration: get('averageSessionDuration'),
          eventCount: get('eventCount'),
        } as GaMetricRow;
      });
      const totals: GaTotals | undefined = json.totals;
      return { rows, totals, requestedRange: json.requestedRange, channelApplied: json.channelApplied } as GaSummary;
    }
  });

  const { data: metaSummary, isLoading: metaLoading } = useQuery<MetaSummary>({
    queryKey: ['meta-summary', uid, dateRange],
    enabled: !!user && metaConnected && selectedChannel === 'meta',
    queryFn: async () => {
      const { startDate, endDate } = makeMetaRange(dateRange);
      const url = new URL('/api/meta/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('startDate', startDate);
      url.searchParams.set('endDate', endDate);
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) return null as any;
      return res.json();
    }
  });

  const makeShopifyRange = (key: DateRangeKey) => {
    const today = new Date();
    const end = new Date(today); end.setDate(today.getDate() - 1);
    const start = new Date(end);
    const days = key === '7d' ? 6 : key === '30d' ? 29 : key === '90d' ? 89 : 29;
    start.setDate(end.getDate() - days);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: fmt(start), endDate: fmt(end) };
  };

  type ShopifySummary = {
    rows: Array<{ date: string; orders: number; revenue: number }>;
    totals: { orders: number; revenue: number; aov: number; currency?: string; revenueMode?: 'gross' | 'paid' };
    requestedRange: { startDate: string; endDate: string };
  } | null;

  const { data: shopifySummary, isLoading: shopifyLoading } = useQuery<ShopifySummary>({
    queryKey: ['shopify-summary', uid, dateRange],
    enabled: !!user && shopifyConnected && selectedChannel === 'shopify',
    queryFn: async () => {
      const { startDate, endDate } = makeShopifyRange(dateRange);
      const url = new URL('/api/shopify/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('startDate', startDate);
      url.searchParams.set('endDate', endDate);
      url.searchParams.set('revenueMode', 'gross');
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) return null as any;
      return res.json();
    }
  });

  const channelGroups: Array<{ label: string; items: Array<{ value: ChannelKey; label: string; color?: string }>; }> = [
    { label: language === 'tr' ? 'Genel' : 'General', items: [{ value: 'all', label: t('allChannels'), color: 'bg-blue-500' }] },
    { label: language === 'tr' ? 'Reklam Panelleri' : 'Ad Platforms', items: [
      { value: 'google', label: 'Google Ads', color: 'bg-green-500' },
      { value: 'meta', label: 'Meta Ads', color: 'bg-blue-600' },
      { value: 'tiktok', label: 'TikTok Ads', color: 'bg-pink-500' },
    ] },
    { label: language === 'tr' ? 'Analitik Kanallar' : 'Analytics Channels', items: [
      { value: 'organic', label: language === 'tr' ? 'Organik' : 'Organic', color: 'bg-emerald-500' },
      { value: 'email', label: 'Email', color: 'bg-purple-500' },
    ] },
    { label: language === 'tr' ? 'Mağaza' : 'Store', items: [ { value: 'shopify', label: 'Shopify', color: 'bg-green-600' } ] },
  ];

  const metricOptions = [
    { value: 'revenue', label: language === 'tr' ? 'Gelir' : 'Revenue', icon: DollarSign },
    { value: 'roas', label: 'ROAS', icon: Target },
    { value: 'conversions', label: t('conversions'), icon: ShoppingCart },
    { value: 'traffic', label: language === 'tr' ? 'Trafik' : 'Traffic', icon: TrendingUp },
    { value: 'cost', label: language === 'tr' ? 'Maliyet' : 'Cost', icon: BarChart3 }
  ];

  const fmtNumber = (n: number) => new Intl.NumberFormat('tr-TR').format(Math.round(n));
  const fmtDuration = (s: number) => { if (!s || !Number.isFinite(s)) return '0:00'; const m = Math.floor(s / 60); const ss = Math.round(s % 60); return `${m}:${ss.toString().padStart(2, '0')}`; };

  const kpiData = useMemo(() => {
    const totals = (gaSummary as any)?.totals as (Record<string, number> | undefined);
    if (!gaSummary?.rows?.length && !totals) {
      return [
        { title: 'Sessions', value: '-', previousValue: '-', change: '-', changeType: 'positive' as const, icon: Activity, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
        { title: 'New Users', value: '-', previousValue: '-', change: '-', changeType: 'positive' as const, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { title: 'Active Users', value: '-', previousValue: '-', change: '-', changeType: 'positive' as const, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
        { title: 'Avg. Session Duration', value: '-', previousValue: '-', change: '-', changeType: 'positive' as const, icon: ClockIcon, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      ];
    }
    let totalsCalc = totals;
    if (!totalsCalc) {
      const safeRows = (gaSummary?.rows || []);
      const sum = safeRows.reduce((acc, r) => { acc.sessions += r.sessions; acc.newUsers += r.newUsers; acc.activeUsers += r.activeUsers; acc.eventCount += r.eventCount; acc.durationSum += r.averageSessionDuration; acc.durationCount += 1; return acc; }, { sessions: 0, newUsers: 0, activeUsers: 0, eventCount: 0, durationSum: 0, durationCount: 0 } as any);
      totalsCalc = { sessions: sum.sessions, newUsers: sum.newUsers, activeUsers: sum.activeUsers, eventCount: sum.eventCount, averageSessionDuration: sum.durationCount ? sum.durationSum / sum.durationCount : 0 } as any;
    }
    const avgDuration = (totalsCalc as any).averageSessionDuration || 0;
    return [
      { title: 'sessions', value: fmtNumber((totalsCalc as any).sessions || 0), previousValue: '', change: '', changeType: 'positive' as const, icon: Activity, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
      { title: 'newUsers', value: fmtNumber((totalsCalc as any).newUsers || 0), previousValue: '', change: '', changeType: 'positive' as const, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { title: 'activeUsers', value: fmtNumber((totalsCalc as any).activeUsers || 0), previousValue: '', change: '', changeType: 'positive' as const, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
      { title: 'averageSessionDuration', value: fmtDuration(avgDuration), previousValue: '', change: '', changeType: 'positive' as const, icon: ClockIcon, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    ];
  }, [gaSummary]);

  const insights = [{ type: 'opportunity', title: 'TikTok Kampanya Fırsatı', description: 'TikTok kampanyanızın ROAS değeri %40 artış gösteriyor. Bütçe artırımı ile potansiyel +₺25,000 ek gelir.', priority: 'Yüksek', timeAgo: '2 saat önce', impact: '+₺25,000', confidence: '92%' }];
  const teamTasks = [ { id: 1, title: 'Meta kampanya optimizasyonu', assignee: 'Ahmet K.', priority: 'Yüksek', dueDate: 'Bugün', status: 'progress' }, { id: 2, title: 'A/B test sonuçları analizi', assignee: 'Elif S.', priority: 'Orta', dueDate: 'Yarın', status: 'pending' } ];
  const actionableItems = [ { type: 'action', title: 'Google Ads bütçesini %15 artır', description: 'Son 7 günde %23 ROAS artışı. Önerilen günlük bütçe: ₺850', impact: 'Yüksek', estimatedReturn: '+₺12,400', status: 'suggested' }, { type: 'action', title: 'Lookalike kitle oluştur', description: 'En yüksek LTV müşterilerinden %1 lookalike kitle', impact: 'Orta', estimatedReturn: '+₺8,200', status: 'suggested' } ];
  const automatedActions = [ { title: 'Otomatik bid ayarlaması', description: 'Düşük performanslı anahtar kelimelerin bidleri %20 azaltıldı', status: 'completed', timeExecuted: '45 dakika önce', impact: '₺320 tasarruf' }, { title: 'Audience genişletmesi', description: 'Yüksek performanslı kitlelerde otomatik genişletme aktifleştirildi', status: 'completed', timeExecuted: '2 saat önce', impact: '+15% reach' } ];

  const gaConnected = !!selectedGaPropertyId;

  const Spark: React.FC<{ series: number[]; color?: string }> = ({ series, color = '#3B82F6' }) => (
    <div className="h-10 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={(series || []).map((v, i) => ({ i, v }))}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const gaTrend = React.useMemo(() => {
    const rows = gaSummary?.rows || [];
    return { sessions: rows.map(r => r.sessions || 0), newUsers: rows.map(r => r.newUsers || 0), activeUsers: rows.map(r => r.activeUsers || 0), avgDuration: rows.map(r => r.averageSessionDuration || 0) };
  }, [gaSummary]);
  const metaTrend = React.useMemo(() => {
    const rows = (metaSummary as any)?.rows || [];
    return { spend: rows.map((r: any) => r.spend || 0), impressions: rows.map((r: any) => r.impressions || 0), clicks: rows.map((r: any) => r.clicks || 0), ctr: rows.map((r: any) => r.ctr || 0) };
  }, [metaSummary]);
  const shopifyTrend = React.useMemo(() => {
    const rows = (shopifySummary as any)?.rows || [];
    return { revenue: rows.map((r: any) => r.revenue || 0), orders: rows.map((r: any) => r.orders || 0), aov: rows.map((r: any) => (r.orders > 0 ? r.revenue / r.orders : 0)) };
  }, [shopifySummary]);

  const effectiveLoading = authLoading ||
    (selectedChannel === 'meta' ? (metaConnected && metaLoading)
      : selectedChannel === 'shopify' ? (shopifyConnected && shopifyLoading)
      : (gaConnected && isLoading));
  if (effectiveLoading) {
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
      {/* AI Assistant Bar - Lazy loaded to improve first paint */}
      <div className="w-full">
        <Suspense fallback={null}>
          <AIChatPanel pageContext="dashboard" />
        </Suspense>
      </div>

      {/* Enhanced Controls Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('genelBakış')}</h1>
        <div className="flex items-center gap-4">
          {/* Channel Selector (Tüm Kanallar) */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <Select value={selectedChannel} onValueChange={(value: ChannelKey) => setSelectedChannel(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {channelGroups.map((group, gi) => (
                  <div key={group.label} className="py-1">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500 px-2 pb-1">{group.label}</div>
                    {group.items.map((channel) => (
                      <SelectItem key={`${group.label}-${channel.value}`} value={channel.value}>
                        <div className="flex items-center gap-2">
                          {channel.color && <div className={`w-3 h-3 rounded-full ${channel.color}`}></div>}
                          {channel.label}
                        </div>
                      </SelectItem>
                    ))}
                    {gi < channelGroups.length - 1 && <div className="h-px bg-slate-700 my-1" />}
                  </div>
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

      {/* Applied range info */}
      {selectedChannel === 'meta' && metaSummary && metaSummary.requestedRange ? (
        <div className="text-xs text-slate-400 -mt-4">
          Range: {metaSummary.requestedRange.startDate} → {metaSummary.requestedRange.endDate} | Channel: meta
        </div>
      ) : selectedChannel === 'shopify' && shopifySummary && shopifySummary.requestedRange ? (
        <div className="text-xs text-slate-400 -mt-4">
          Range: {shopifySummary.requestedRange.startDate} → {shopifySummary.requestedRange.endDate} | Channel: shopify
        </div>
      ) : (gaSummary && gaSummary.requestedRange ? (
        <div className="text-xs text-slate-400 -mt-4">
          Range: {gaSummary.requestedRange.startDate} → {gaSummary.requestedRange.endDate} | Channel: {gaSummary.channelApplied}
        </div>
      ) : null)}

      {/* Meta error / empty-state helpers */}
      {selectedChannel === 'meta' && metaConnected && !metaLoading && !metaSummary && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-amber-200 flex items-center justify-between">
            <div>
              Meta verisi alınamadı. Lütfen Ayarlar'da Meta bağlantınızı yenileyin ve bir reklam hesabı seçin.
            </div>
            <Button size="sm" className="ml-3 bg-blue-600 hover:bg-blue-700" onClick={() => (window.location.href = '/settings')}>
              Settings'e git
            </Button>
          </CardContent>
        </Card>
      )}

      {/* If GA not connected, show quick CTA */}
      {!gaConnected && selectedChannel !== 'meta' && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-amber-200">
            Google Analytics bağlantısı veya property seçimi bulunamadı. Lütfen Settings sayfasından bağlayın ve property seçin.
            <Button size="sm" className="ml-3 bg-blue-600 hover:bg-blue-700" onClick={() => (window.location.href = '/settings')}>
              Settings'e git
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enhanced KPI Cards with sparklines */}
      {selectedChannel === 'meta' && metaConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Meta-specific KPIs: Spend, Impressions, Clicks, CTR */}
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <h4 className="text-slate-400 text-sm mb-2">{t('spend')}</h4>
              <p className="text-xl font-bold text-white">₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(metaSummary?.totals?.spend || 0)}</p>
              <Spark series={metaTrend.spend} color="#3B82F6" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <h4 className="text-slate-400 text-sm mb-2">{t('impressions')}</h4>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(metaSummary?.totals?.impressions || 0)}</p>
              <Spark series={metaTrend.impressions} color="#6366F1" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <h4 className="text-slate-400 text-sm mb-2">{t('clicks')}</h4>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(metaSummary?.totals?.clicks || 0)}</p>
              <Spark series={metaTrend.clicks} color="#10B981" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <h4 className="text-slate-400 text-sm mb-2">{t('ctr')}</h4>
              <p className="text-xl font-bold text-white">{((metaSummary?.totals?.ctr || 0)).toFixed(2)}%</p>
              <Spark series={metaTrend.ctr} color="#F59E0B" />
            </CardContent>
          </Card>
        </div>
      ) : selectedChannel === 'shopify' && shopifyConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <h4 className="text-slate-400 text-sm mb-2">{t('orders')}</h4>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(shopifySummary?.totals?.orders || 0)}</p>
              <Spark series={shopifyTrend.orders} color="#10B981" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <h4 className="text-slate-400 text-sm mb-2">{t('revenue')}</h4>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: shopifySummary?.totals?.currency || 'TRY', maximumFractionDigits: 0 }).format(shopifySummary?.totals?.revenue || 0)}</p>
              <Spark series={shopifyTrend.revenue} color="#3B82F6" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <h4 className="text-slate-400 text-sm mb-2">{t('aov')}</h4>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: shopifySummary?.totals?.currency || 'TRY', maximumFractionDigits: 0 }).format(shopifySummary?.totals?.aov || 0)}</p>
              <Spark series={shopifyTrend.aov} color="#F59E0B" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            // Map KPI title to GA trend + color
            let series: number[] = [];
            let stroke = '#3B82F6';
            if (kpi.title === 'sessions') { series = gaTrend.sessions; stroke = '#3B82F6'; }
            else if (kpi.title === 'newUsers') { series = gaTrend.newUsers; stroke = '#10B981'; }
            else if (kpi.title === 'activeUsers') { series = gaTrend.activeUsers; stroke = '#A78BFA'; }
            else if (kpi.title === 'averageSessionDuration') { series = gaTrend.avgDuration; stroke = '#F59E0B'; }
            return (
              <Card key={index} className="bg-slate-800/80 border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-sm hover:bg-slate-800/90">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bgColor} shadow-lg`}>
                      <Icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    <Badge variant="secondary" className={`${kpi.changeType === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {kpi.change}
                    </Badge>
                  </div>
                  <h4 className="text-slate-400 text-sm mb-2">{kpi.title}</h4>
                  <p className="text-xl font-bold text-white mb-1">{kpi.value}</p>
                  <Spark series={series} color={stroke} />
                  {compareEnabled && kpi.previousValue && (
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
      )}

      {/* Büyük grafikler kaldırıldı; her KPI kartı altında mini sparkline gösteriyoruz */}

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

                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
