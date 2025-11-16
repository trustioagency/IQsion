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
import StartGuide from "../components/start-guide";
import { useLanguage } from "../contexts/LanguageContext";
import {
  DollarSign, Target, ShoppingCart, TrendingUp, BarChart3, Users, Layers, Calendar, ArrowUpRight, ArrowDownRight, Zap, Activity,
  Play, AlertTriangle, Eye, CheckCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
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
  const [showStartGuide, setShowStartGuide] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [includeToday, setIncludeToday] = useState<boolean>(false);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareDateRange, setCompareDateRange] = useState<DateRangeKey>('30d');
  const [selectedChannel, setSelectedChannel] = useState<ChannelKey>('all');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('revenue');
  const [viewMode, setViewMode] = useState<'default' | 'ceo' | 'cmo'>('default');
  // Pie chart selectors
  const [spendPieMetric, setSpendPieMetric] = useState<'spend'|'impressions'|'clicks'>('spend');
  const [kpiPieMetric, setKpiPieMetric] = useState<'revenue_vs_spend'|'orders_vs_clicks'>('revenue_vs_spend');
  const [usersPieMetric, setUsersPieMetric] = useState<'new_vs_active'|'sessions_vs_events'>('new_vs_active');

  // Compute percentage delta for compare mode
  const computeDelta = (current?: number | null, previous?: number | null) => {
    const cur = Number(current || 0);
    const prev = Number(previous || 0);
    if (!Number.isFinite(cur) || !Number.isFinite(prev)) return null as null | { pct: number; type: 'positive' | 'negative'; label: string };
    if (prev <= 0) return null;
    const pct = ((cur - prev) / prev) * 100;
    const type = pct >= 0 ? 'positive' : 'negative';
    const label = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
    return { pct, type, label } as { pct: number; type: 'positive' | 'negative'; label: string };
  };

  // Open Start Guide if onboarding not completed locally and basic status suggests it's needed
  useEffect(() => {
    if (!user || authLoading) return;
    try {
      const done = typeof window !== 'undefined' && window.localStorage.getItem('iq_onboarding_completed') === '1';
      if (done) return;
      // Respect hide flag
      const hide = typeof window !== 'undefined' && window.localStorage.getItem('iq_onboarding_hide') === '1';
      if (hide) return;
    } catch {}
    const check = async () => {
      try {
        const url = new URL('/api/onboarding/status', window.location.origin);
        if (user?.uid) url.searchParams.set('userId', user.uid);
        const res = await fetch(url.toString(), { credentials: 'include' });
        const j = await res.json();
        // Only trigger if NO connections at all (strict requirement per request)
        const anyConnection = !!(j?.connections?.shopify || j?.connections?.google_analytics || j?.connections?.meta_ads || j?.connections?.google_ads);
        if (!anyConnection) {
          setShowStartGuide(true);
        }
      } catch (e) {
        // ignore
      }
    };
    check();
  }, [user, authLoading]);

  // Listen to manual open request from Header menu
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setShowStartGuide(true);
    window.addEventListener('iq:open-start-guide', handler as any);
    return () => {
      window.removeEventListener('iq:open-start-guide', handler as any);
    };
  }, []);

  // Helpers: resolve current absolute range and its previous range with equal length
  const getCurrentRangeDates = (key: DateRangeKey) => {
    const today = new Date();
    const end = new Date(today);
    if (!includeToday) end.setDate(today.getDate() - 1); // default: use yesterday as end
    const start = new Date(end);
    const days = key === '7d' ? 7 : key === '30d' ? 30 : key === '90d' ? 90 : 30;
    start.setDate(end.getDate() - (days - 1));
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: fmt(start), endDate: fmt(end), days };
  };

  const getPreviousRangeFrom = (startISO: string, endISO: string) => {
    const parse = (s: string) => new Date(s + 'T00:00:00Z');
    const start = parse(startISO);
    const end = parse(endISO);
    const oneDay = 24 * 60 * 60 * 1000;
    const lengthDays = Math.round((end.getTime() - start.getTime()) / oneDay) + 1; // inclusive
    const prevEnd = new Date(start.getTime() - oneDay);
    const prevStart = new Date(prevEnd.getTime() - (lengthDays - 1) * oneDay);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: fmt(prevStart), endDate: fmt(prevEnd), days: lengthDays };
  };

  // Previous range with explicit length (ends the day before current range start)
  const getPreviousRangeWithLength = (currentStartISO: string, lengthDays: number) => {
    const parse = (s: string) => new Date(s + 'T00:00:00Z');
    const oneDay = 24 * 60 * 60 * 1000;
    const currentStart = parse(currentStartISO);
    const prevEnd = new Date(currentStart.getTime() - oneDay);
    const prevStart = new Date(prevEnd.getTime() - (lengthDays - 1) * oneDay);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { startDate: fmt(prevStart), endDate: fmt(prevEnd), days: lengthDays };
  };

  const daysForKey = (key: DateRangeKey) => (key === '7d' ? 7 : key === '30d' ? 30 : key === '90d' ? 90 : 30);

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
    const endKey = includeToday ? 'today' : 'yesterday';
    switch (key) {
      case '7d': return { startDate: '7daysAgo', endDate: endKey };
      case '30d': return { startDate: '30daysAgo', endDate: endKey };
      case '90d': return { startDate: '90daysAgo', endDate: endKey };
      default: return { startDate: '7daysAgo', endDate: endKey };
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
  const googleAdsConnected: boolean = !!(connections as any)?.google_ads?.isConnected;
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

  // Previous-period GA summary for compare mode
  const { data: gaPrevSummary } = useQuery<GaSummary | null>({
    queryKey: ['ga-summary-prev', uid, selectedGaPropertyId, dateRange, compareDateRange, selectedChannel, compareEnabled],
    enabled: !!user && !!selectedGaPropertyId && compareEnabled,
    queryFn: async () => {
      // previous period: user-selected length ending before current range start
      const cur = getCurrentRangeDates(dateRange);
      const prev = getPreviousRangeWithLength(cur.startDate, daysForKey(compareDateRange));
      const url = new URL('/api/analytics/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('propertyId', selectedGaPropertyId!);
      url.searchParams.set('startDate', prev.startDate);
      url.searchParams.set('endDate', prev.endDate);
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
    queryKey: ['meta-summary', uid, dateRange, viewMode],
    enabled: !!user && metaConnected && (selectedChannel === 'meta' || viewMode === 'cmo'),
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

  // Google Ads summary (for charts)
  type GoogleAdsSummary = {
    rows: Array<{ date: string; spend: number; impressions: number; clicks: number; ctr: number }>;
    totals: { spend: number; impressions: number; clicks: number; ctr: number; cpc?: number };
    requestedRange: { startDate: string; endDate: string };
  } | null;

  const { data: googleAdsSummary, isLoading: gadsLoading } = useQuery<GoogleAdsSummary>({
    queryKey: ['googleads-summary', uid, dateRange],
    enabled: !!user && googleAdsConnected,
    queryFn: async () => {
      const { startDate, endDate } = makeMetaRange(dateRange);
      const url = new URL('/api/googleads/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('startDate', startDate);
      url.searchParams.set('endDate', endDate);
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) return null as any;
      return res.json();
    }
  });

  // Previous-period Meta summary for compare mode
  const { data: metaPrevSummary } = useQuery<MetaSummary>({
    queryKey: ['meta-summary-prev', uid, dateRange, compareDateRange, viewMode, compareEnabled],
    enabled: !!user && metaConnected && compareEnabled && (selectedChannel === 'meta' || viewMode === 'cmo'),
    queryFn: async () => {
      const cur = makeMetaRange(dateRange);
      const prev = getPreviousRangeWithLength(cur.startDate, daysForKey(compareDateRange));
      const url = new URL('/api/meta/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('startDate', prev.startDate);
      url.searchParams.set('endDate', prev.endDate);
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) return null as any;
      return res.json();
    }
  });

  // Profitability summary for CEO view
  type ProfitabilitySummary = {
    requestedRange: { startDate: string; endDate: string };
    currency: string;
    rows: Array<{ date: string; revenue: number; cogs: number; grossProfit: number; netProfit: number }>;
    totals: { revenue: number; cogs: number; grossProfit: number; netProfit: number; margin: number; adSpend: number; roas: number | null; revenueMode: 'gross'|'paid' };
  } | null;

  const { data: profitSummary } = useQuery<ProfitabilitySummary | null>({
    queryKey: ['profitability', uid, dateRange, viewMode],
    enabled: !!uid && viewMode === 'ceo',
    queryFn: async () => {
      const { startDate, endDate } = makeShopifyRange(dateRange);
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

  // Previous-period Profitability summary for CEO compare mode
  const { data: profitPrevSummary } = useQuery<ProfitabilitySummary | null>({
    queryKey: ['profitability-prev', uid, dateRange, compareDateRange, viewMode, compareEnabled],
    enabled: !!uid && viewMode === 'ceo' && compareEnabled,
    queryFn: async () => {
      const cur = makeShopifyRange(dateRange);
      const prev = getPreviousRangeWithLength(cur.startDate, daysForKey(compareDateRange));
      const url = new URL('/api/profitability/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('startDate', prev.startDate);
      url.searchParams.set('endDate', prev.endDate);
      url.searchParams.set('revenueMode', 'gross');
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    }
  });

  const makeShopifyRange = (key: DateRangeKey) => {
    const today = new Date();
    const end = new Date(today); if (!includeToday) end.setDate(today.getDate() - 1);
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

  // Shopify totals for charts regardless of selected channel
  const { data: shopifyAllSummary } = useQuery<ShopifySummary>({
    queryKey: ['shopify-summary-all', uid, dateRange],
    enabled: !!user && shopifyConnected,
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

  // Previous-period Shopify summary for compare mode
  const { data: shopifyPrevSummary } = useQuery<ShopifySummary>({
    queryKey: ['shopify-summary-prev', uid, dateRange, compareDateRange, compareEnabled],
    enabled: !!user && shopifyConnected && compareEnabled && selectedChannel === 'shopify',
    queryFn: async () => {
      const cur = makeShopifyRange(dateRange);
      const prev = getPreviousRangeWithLength(cur.startDate, daysForKey(compareDateRange));
      const url = new URL('/api/shopify/summary', window.location.origin);
      url.searchParams.set('userId', uid);
      url.searchParams.set('startDate', prev.startDate);
      url.searchParams.set('endDate', prev.endDate);
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

    // Compute previous totals when compare is enabled
    let prevTotals: any | null = null;
    if (compareEnabled && gaPrevSummary) {
      prevTotals = (gaPrevSummary as any)?.totals;
      if (!prevTotals) {
        const safeRows = (gaPrevSummary?.rows || []);
        const sum = safeRows.reduce((acc, r) => { acc.sessions += r.sessions; acc.newUsers += r.newUsers; acc.activeUsers += r.activeUsers; acc.eventCount += r.eventCount; acc.durationSum += r.averageSessionDuration; acc.durationCount += 1; return acc; }, { sessions: 0, newUsers: 0, activeUsers: 0, eventCount: 0, durationSum: 0, durationCount: 0 } as any);
        prevTotals = { sessions: sum.sessions, newUsers: sum.newUsers, activeUsers: sum.activeUsers, eventCount: sum.eventCount, averageSessionDuration: sum.durationCount ? sum.durationSum / sum.durationCount : 0 } as any;
      }
    }

    const items = [
      { title: 'sessions', value: fmtNumber((totalsCalc as any).sessions || 0), raw: (totalsCalc as any).sessions || 0, prevRaw: prevTotals ? prevTotals.sessions || 0 : undefined, icon: Activity, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
      { title: 'newUsers', value: fmtNumber((totalsCalc as any).newUsers || 0), raw: (totalsCalc as any).newUsers || 0, prevRaw: prevTotals ? prevTotals.newUsers || 0 : undefined, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
      { title: 'activeUsers', value: fmtNumber((totalsCalc as any).activeUsers || 0), raw: (totalsCalc as any).activeUsers || 0, prevRaw: prevTotals ? prevTotals.activeUsers || 0 : undefined, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
      { title: 'averageSessionDuration', value: fmtDuration(avgDuration), raw: avgDuration, prevRaw: prevTotals ? prevTotals.averageSessionDuration || 0 : undefined, icon: ClockIcon, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
      { title: 'events', value: fmtNumber((totalsCalc as any).eventCount || 0), raw: (totalsCalc as any).eventCount || 0, prevRaw: prevTotals ? prevTotals.eventCount || 0 : undefined, icon: BarChart3, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
      { title: 'sessionsPerUser', value: ((totalsCalc as any).activeUsers || 0) > 0 ? (((totalsCalc as any).sessions || 0) / (totalsCalc as any).activeUsers).toFixed(2) : '0.00', raw: ((totalsCalc as any).activeUsers || 0) > 0 ? ((totalsCalc as any).sessions || 0) / (totalsCalc as any).activeUsers : 0, prevRaw: prevTotals && prevTotals.activeUsers > 0 ? (prevTotals.sessions || 0) / prevTotals.activeUsers : undefined, icon: TrendingUp, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
    ].map((it) => {
      if (compareEnabled && typeof it.prevRaw === 'number') {
        const d = computeDelta(it.raw as number, it.prevRaw as number);
        if (d) {
          return { ...it, previousValue: `${it.title === 'averageSessionDuration' ? fmtDuration(it.prevRaw as number) : fmtNumber(it.prevRaw as number)}`, change: d.label, changeType: d.type } as any;
        }
        return { ...it, previousValue: '', change: '', changeType: 'positive' as const } as any;
      }
      return { ...it, previousValue: '', change: '', changeType: 'positive' as const } as any;
    });

    return items as any;
  }, [gaSummary, gaPrevSummary, compareEnabled]);

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
    const sessions = rows.map(r => r.sessions || 0);
    const newUsers = rows.map(r => r.newUsers || 0);
    const activeUsers = rows.map(r => r.activeUsers || 0);
    const avgDuration = rows.map(r => r.averageSessionDuration || 0);
    const events = rows.map(r => r.eventCount || 0);
    const sessionsPerUser = rows.map((r) => {
      const au = r.activeUsers || 0; const s = r.sessions || 0; return au > 0 ? s / au : 0;
    });
    return { sessions, newUsers, activeUsers, avgDuration, events, sessionsPerUser };
  }, [gaSummary]);
  const metaTrend = React.useMemo(() => {
    const rows = (metaSummary as any)?.rows || [];
    return { spend: rows.map((r: any) => r.spend || 0), impressions: rows.map((r: any) => r.impressions || 0), clicks: rows.map((r: any) => r.clicks || 0), ctr: rows.map((r: any) => r.ctr || 0) };
  }, [metaSummary]);
  const shopifyTrend = React.useMemo(() => {
    const rows = (shopifySummary as any)?.rows || [];
    return { revenue: rows.map((r: any) => r.revenue || 0), orders: rows.map((r: any) => r.orders || 0), aov: rows.map((r: any) => (r.orders > 0 ? r.revenue / r.orders : 0)) };
  }, [shopifySummary]);

  // Aggregates for pie charts
  const metaSpendTotal = (metaSummary as any)?.totals?.spend || 0;
  const googleSpendTotal = (googleAdsSummary as any)?.totals?.spend || 0;
  const metaImpressionsTotal = (metaSummary as any)?.totals?.impressions || 0;
  const googleImpressionsTotal = (googleAdsSummary as any)?.totals?.impressions || 0;
  const metaClicksTotal = (metaSummary as any)?.totals?.clicks || 0;
  const googleClicksTotal = (googleAdsSummary as any)?.totals?.clicks || 0;
  const revenueTotal = (shopifyAllSummary as any)?.totals?.revenue || 0;
  const adSpendTotal = metaSpendTotal + googleSpendTotal;
  // GA totals with fallback to row sums
  const gaTotals = useMemo(() => {
    const t = (gaSummary as any)?.totals || {};
    if (t && (t.sessions || t.newUsers || t.activeUsers || t.eventCount)) return t as any;
    const rows = (gaSummary?.rows || []) as GaMetricRow[];
    return rows.reduce((acc: any, r) => {
      acc.sessions += r.sessions || 0;
      acc.newUsers += r.newUsers || 0;
      acc.activeUsers += r.activeUsers || 0;
      acc.eventCount += r.eventCount || 0;
      return acc;
    }, { sessions: 0, newUsers: 0, activeUsers: 0, eventCount: 0 });
  }, [gaSummary]);
  const newUsersTotal = (gaTotals as any)?.newUsers || 0;
  const activeUsersTotal = (gaTotals as any)?.activeUsers || 0;
  const sessionsTotal = (gaTotals as any)?.sessions || 0;
  const eventsTotal = (gaTotals as any)?.eventCount || 0;
  const ordersTotal = (shopifyAllSummary as any)?.totals?.orders || 0;
  const fmtMoney = (v: number, currency: string = (shopifyAllSummary as any)?.totals?.currency || 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v || 0);

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
      {/* AI + Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Suspense fallback={null}>
            <AIChatPanel pageContext="dashboard" title="IQsion AI" variant="minimal" />
          </Suspense>
        </div>
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t('actionableItems')}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Controls Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('genelBakış')}</h1>
        <div className="flex items-center gap-4">
          {/* View Selector */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <Select value={viewMode} onValueChange={(v: 'default'|'ceo'|'cmo') => setViewMode(v)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-44">
                <SelectValue placeholder="Görünüm" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="default">Genel</SelectItem>
                <SelectItem value="ceo">CEO Dashboard</SelectItem>
                <SelectItem value="cmo">CMO Dashboard</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

          {/* Compare Toggle (minimal) */}
          <div className="flex items-center gap-1 px-1 py-0.5">
            <Label htmlFor="compare-mode" className="text-xs text-slate-400 mr-1">
              {t('compare')}
            </Label>
            <Switch
              id="compare-mode"
              checked={compareEnabled}
              onCheckedChange={setCompareEnabled}
              className="scale-90 origin-left"
            />
          </div>

          {/* Compare Date Range (manual) */}
          {compareEnabled && (
            <Select value={compareDateRange} onValueChange={(value: DateRangeKey) => setCompareDateRange(value)}>
              <SelectTrigger className="bg-slate-800/40 border-slate-700/40 text-slate-300 w-36 h-8 px-2 text-xs">
                <SelectValue placeholder={language === 'tr' ? 'Karşılaştırma dönemi' : 'Comparison period'} />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700/40 text-sm">
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
      {viewMode === 'ceo' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* CEO KPIs: Revenue, Gross, Net, ROAS */}
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">Gelir</h4>
                {compareEnabled && profitPrevSummary && (() => { const d = computeDelta(profitSummary?.totals?.revenue, profitPrevSummary?.totals?.revenue); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: (profitSummary?.currency || 'TRY'), maximumFractionDigits: 0 }).format(profitSummary?.totals?.revenue || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">Brüt Kar</h4>
                {compareEnabled && profitPrevSummary && (() => { const d = computeDelta(profitSummary?.totals?.grossProfit, profitPrevSummary?.totals?.grossProfit); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: (profitSummary?.currency || 'TRY'), maximumFractionDigits: 0 }).format(profitSummary?.totals?.grossProfit || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">Net Kar</h4>
                {compareEnabled && profitPrevSummary && (() => { const d = computeDelta(profitSummary?.totals?.netProfit, profitPrevSummary?.totals?.netProfit); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: (profitSummary?.currency || 'TRY'), maximumFractionDigits: 0 }).format(profitSummary?.totals?.netProfit || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">ROAS</h4>
                {compareEnabled && profitPrevSummary && (() => { const d = computeDelta(profitSummary?.totals?.roas ?? null, profitPrevSummary?.totals?.roas ?? null); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-2xl font-bold text-white">{profitSummary?.totals?.roas === null || profitSummary?.totals?.roas === undefined ? '—' : `${(profitSummary?.totals?.roas || 0).toFixed(1)}x`}</p>
            </CardContent>
          </Card>
          {/* Additional CEO KPIs: Ad Spend, Profit Margin */}
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('adSpend')}</h4>
                {compareEnabled && profitPrevSummary && (() => { const d = computeDelta(profitSummary?.totals?.adSpend ?? null, profitPrevSummary?.totals?.adSpend ?? null); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: (profitSummary?.currency || 'TRY'), maximumFractionDigits: 0 }).format(profitSummary?.totals?.adSpend || 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('profitMargin')}</h4>
                {compareEnabled && profitPrevSummary && (() => { const d = computeDelta(profitSummary?.totals?.margin ?? null, profitPrevSummary?.totals?.margin ?? null); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-2xl font-bold text-white">{(profitSummary?.totals?.margin || 0).toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>
      ) : viewMode === 'cmo' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* CMO KPIs: Prefer ad metrics; use Meta if available, else GA basics */}
          {metaConnected && metaSummary ? (
            <>
              <Card className="bg-slate-800/80 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-400 text-sm mb-2">Harcama</h4>
                    {compareEnabled && metaPrevSummary && (() => { const d = computeDelta(metaSummary?.totals?.spend, metaPrevSummary?.totals?.spend); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
                  </div>
                  <p className="text-2xl font-bold text-white">₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(metaSummary?.totals?.spend || 0)}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-400 text-sm mb-2">Gösterim</h4>
                    {compareEnabled && metaPrevSummary && (() => { const d = computeDelta(metaSummary?.totals?.impressions, metaPrevSummary?.totals?.impressions); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
                  </div>
                  <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(metaSummary?.totals?.impressions || 0)}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-400 text-sm mb-2">Tıklama</h4>
                    {compareEnabled && metaPrevSummary && (() => { const d = computeDelta(metaSummary?.totals?.clicks, metaPrevSummary?.totals?.clicks); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
                  </div>
                  <p className="text-2xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(metaSummary?.totals?.clicks || 0)}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/80 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-400 text-sm mb-2">CTR</h4>
                    {compareEnabled && metaPrevSummary && (() => { const d = computeDelta(metaSummary?.totals?.ctr, metaPrevSummary?.totals?.ctr); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
                  </div>
                  <p className="text-2xl font-bold text-white">{((metaSummary?.totals?.ctr || 0)).toFixed(2)}%</p>
                </CardContent>
              </Card>
            </>
          ) : (
            kpiData.map((kpi: any, index: number) => (
              <Card key={index} className="bg-slate-800/80 border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-sm hover:bg-slate-800/90">
                <CardContent className="p-4">
                  <h4 className="text-slate-400 text-sm mb-2">{kpi.title}</h4>
                  <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : selectedChannel === 'meta' && metaConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* Meta-specific KPIs: Spend, Impressions, Clicks, CTR */}
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('spend')}</h4>
                {compareEnabled && metaPrevSummary && (() => { const d = computeDelta(metaSummary?.totals?.spend, metaPrevSummary?.totals?.spend); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(metaSummary?.totals?.spend || 0)}</p>
              <Spark series={metaTrend.spend} color="#3B82F6" />
            </CardContent>
          </Card>
          {/* Additional Meta KPIs: CPC, CPM */}
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('cpc')}</h4>
                {compareEnabled && metaPrevSummary && (() => { const cur = (metaSummary?.totals?.spend || 0) / Math.max(1, metaSummary?.totals?.clicks || 0); const prev = (metaPrevSummary?.totals?.spend || 0) / Math.max(1, metaPrevSummary?.totals?.clicks || 0); const d = computeDelta(cur, prev); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format((metaSummary?.totals?.spend || 0) / Math.max(1, metaSummary?.totals?.clicks || 0))}</p>
              <Spark series={metaTrend.clicks.map((c: number, i: number) => { const s = metaTrend.spend[i] || 0; return c > 0 ? s / c : 0; })} color="#06B6D4" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('cpm')}</h4>
                {compareEnabled && metaPrevSummary && (() => { const cur = (metaSummary?.totals?.spend || 0) / Math.max(1, (metaSummary?.totals?.impressions || 0) / 1000); const prev = (metaPrevSummary?.totals?.spend || 0) / Math.max(1, (metaPrevSummary?.totals?.impressions || 0) / 1000); const d = computeDelta(cur, prev); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">₺{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format((metaSummary?.totals?.spend || 0) / Math.max(1, (metaSummary?.totals?.impressions || 0) / 1000))}</p>
              <Spark series={metaTrend.impressions.map((imp: number, i: number) => { const s = metaTrend.spend[i] || 0; const k = Math.max(1, imp / 1000); return s / k; })} color="#8B5CF6" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('impressions')}</h4>
                {compareEnabled && metaPrevSummary && (() => { const d = computeDelta(metaSummary?.totals?.impressions, metaPrevSummary?.totals?.impressions); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(metaSummary?.totals?.impressions || 0)}</p>
              <Spark series={metaTrend.impressions} color="#6366F1" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('clicks')}</h4>
                {compareEnabled && metaPrevSummary && (() => { const d = computeDelta(metaSummary?.totals?.clicks, metaPrevSummary?.totals?.clicks); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(metaSummary?.totals?.clicks || 0)}</p>
              <Spark series={metaTrend.clicks} color="#10B981" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('ctr')}</h4>
                {compareEnabled && metaPrevSummary && (() => { const d = computeDelta(metaSummary?.totals?.ctr, metaPrevSummary?.totals?.ctr); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">{((metaSummary?.totals?.ctr || 0)).toFixed(2)}%</p>
              <Spark series={metaTrend.ctr} color="#F59E0B" />
            </CardContent>
          </Card>
        </div>
      ) : selectedChannel === 'shopify' && shopifyConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('orders')}</h4>
                {compareEnabled && shopifyPrevSummary && (() => { const d = computeDelta(shopifySummary?.totals?.orders, shopifyPrevSummary?.totals?.orders); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(shopifySummary?.totals?.orders || 0)}</p>
              <Spark series={shopifyTrend.orders} color="#10B981" />
            </CardContent>
          </Card>
          {/* Additional Shopify KPIs: Revenue/Day, Orders/Day, Max Daily Revenue */}
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">Avg Revenue/Day</h4>
              </div>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: shopifySummary?.totals?.currency || 'TRY', maximumFractionDigits: 0 }).format(((shopifySummary?.rows || []).reduce((a, r) => a + (r.revenue || 0), 0)) / Math.max(1, (shopifySummary?.rows || []).length))}</p>
              <Spark series={shopifyTrend.revenue} color="#0EA5E9" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">Avg Orders/Day</h4>
              </div>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR').format(((shopifySummary?.rows || []).reduce((a, r) => a + (r.orders || 0), 0)) / Math.max(1, (shopifySummary?.rows || []).length))}</p>
              <Spark series={shopifyTrend.orders} color="#22C55E" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">Max Daily Revenue</h4>
              </div>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: shopifySummary?.totals?.currency || 'TRY', maximumFractionDigits: 0 }).format(Math.max(0, ...((shopifySummary?.rows || []).map(r => r.revenue || 0))))}</p>
              <Spark series={shopifyTrend.revenue} color="#F43F5E" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('revenue')}</h4>
                {compareEnabled && shopifyPrevSummary && (() => { const d = computeDelta(shopifySummary?.totals?.revenue, shopifyPrevSummary?.totals?.revenue); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: shopifySummary?.totals?.currency || 'TRY', maximumFractionDigits: 0 }).format(shopifySummary?.totals?.revenue || 0)}</p>
              <Spark series={shopifyTrend.revenue} color="#3B82F6" />
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-400 text-sm mb-2">{t('aov')}</h4>
                {compareEnabled && shopifyPrevSummary && (() => { const d = computeDelta(shopifySummary?.totals?.aov, shopifyPrevSummary?.totals?.aov); if (!d) return null; return <Badge className={`${d.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{d.label}</Badge>; })()}
              </div>
              <p className="text-xl font-bold text-white">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: shopifySummary?.totals?.currency || 'TRY', maximumFractionDigits: 0 }).format(shopifySummary?.totals?.aov || 0)}</p>
              <Spark series={shopifyTrend.aov} color="#F59E0B" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {kpiData.map((kpi: any, index: number) => {
            const Icon = kpi.icon;
            // Map KPI title to GA trend + color
            let series: number[] = [];
            let stroke = '#3B82F6';
            if (kpi.title === 'sessions') { series = gaTrend.sessions; stroke = '#3B82F6'; }
            else if (kpi.title === 'newUsers') { series = gaTrend.newUsers; stroke = '#10B981'; }
            else if (kpi.title === 'activeUsers') { series = gaTrend.activeUsers; stroke = '#A78BFA'; }
            else if (kpi.title === 'averageSessionDuration') { series = gaTrend.avgDuration; stroke = '#F59E0B'; }
            else if (kpi.title === 'events') { series = gaTrend.events; stroke = '#EC4899'; }
            else if (kpi.title === 'sessionsPerUser') { series = gaTrend.sessionsPerUser; stroke = '#14B8A6'; }
            return (
              <Card key={index} className="bg-slate-800/80 border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-sm hover:bg-slate-800/90">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bgColor} shadow-lg`}>
                      <Icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    {compareEnabled && kpi.change ? (
                      <Badge variant="secondary" className={`${kpi.changeType === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {kpi.change}
                      </Badge>
                    ) : null}
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

      {/* Today's Insight and Team Tasks side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today Insight */}
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

        {/* Team Tasks */}
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

      {/* Pie Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie 1: Ad Spend by Platform */}
        <Card className="bg-slate-800/80 border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-white">{t('adSpend')}</CardTitle>
            <div className="w-40">
              <Select value={spendPieMetric} onValueChange={(v: 'spend'|'impressions'|'clicks') => setSpendPieMetric(v)}>
                <SelectTrigger className="bg-slate-800/60 border-slate-600 h-8 px-2 text-xs">
                  <SelectValue placeholder={t('chartData')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-xs">
                  <SelectItem value="spend">{t('spend')}</SelectItem>
                  <SelectItem value="impressions">{t('impressions')}</SelectItem>
                  <SelectItem value="clicks">{t('clicks')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                {(() => {
                  const metaVal = spendPieMetric === 'spend' ? metaSpendTotal : spendPieMetric === 'impressions' ? metaImpressionsTotal : metaClicksTotal;
                  const gadsVal = spendPieMetric === 'spend' ? googleSpendTotal : spendPieMetric === 'impressions' ? googleImpressionsTotal : googleClicksTotal;
                  const sum = (metaVal || 0) + (gadsVal || 0);
                  const data = [
                    { name: t('metaAds'), value: sum > 0 ? metaVal : 1 },
                    { name: t('googleAds'), value: sum > 0 ? gadsVal : 1 },
                  ];
                  return (
                    <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} labelLine={false}>
                      <Cell key="meta" fill="#3B82F6" />
                      <Cell key="google" fill="#10B981" />
                    </Pie>
                  );
                })()}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#10B981' }} />
                <span>Google Ads</span>
                <span className="ml-2 text-slate-300">{spendPieMetric === 'spend' ? fmtMoney(googleSpendTotal) : new Intl.NumberFormat('tr-TR').format(spendPieMetric==='impressions'?googleImpressionsTotal:googleClicksTotal)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#3B82F6' }} />
                <span>Meta Ads</span>
                <span className="ml-2 text-slate-300">{spendPieMetric === 'spend' ? fmtMoney(metaSpendTotal) : new Intl.NumberFormat('tr-TR').format(spendPieMetric==='impressions'?metaImpressionsTotal:metaClicksTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie 2: Revenue vs Ad Spend */}
        <Card className="bg-slate-800/80 border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-white">{t('kpiAnalysis')}</CardTitle>
            <div className="w-48">
              <Select value={kpiPieMetric} onValueChange={(v: 'revenue_vs_spend'|'orders_vs_clicks') => setKpiPieMetric(v)}>
                <SelectTrigger className="bg-slate-800/60 border-slate-600 h-8 px-2 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-xs">
                  <SelectItem value="revenue_vs_spend">{t('revenueVsAdSpend')}</SelectItem>
                  <SelectItem value="orders_vs_clicks">{t('ordersVsClicks')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                {(() => {
                  if (kpiPieMetric === 'revenue_vs_spend') {
                    const sum = revenueTotal + adSpendTotal;
                    const data = [
                      { name: t('revenue'), value: sum > 0 ? revenueTotal : 1 },
                      { name: t('adSpend'), value: sum > 0 ? adSpendTotal : 1 },
                    ];
                    return (
                      <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} labelLine={false}>
                        <Cell key="rev" fill="#6366F1" />
                        <Cell key="spend" fill="#F59E0B" />
                      </Pie>
                    );
                  } else {
                    const clicks = metaClicksTotal + googleClicksTotal;
                    const sum = ordersTotal + clicks;
                    const data = [
                      { name: t('orders'), value: sum > 0 ? ordersTotal : 1 },
                      { name: t('clicks'), value: sum > 0 ? clicks : 1 },
                    ];
                    return (
                      <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} labelLine={false}>
                        <Cell key="orders" fill="#14B8A6" />
                        <Cell key="clicks" fill="#3B82F6" />
                      </Pie>
                    );
                  }
                })()}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {kpiPieMetric === 'revenue_vs_spend' ? (
              <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#6366F1' }} />
                  <span>{t('revenue')}</span>
                  <span className="ml-2 text-slate-300">{fmtMoney(revenueTotal)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#F59E0B' }} />
                  <span>{t('adSpend')}</span>
                  <span className="ml-2 text-slate-300">{fmtMoney(adSpendTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#14B8A6' }} />
                  <span>{t('orders')}</span>
                  <span className="ml-2 text-slate-300">{new Intl.NumberFormat('tr-TR').format(ordersTotal)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#3B82F6' }} />
                  <span>{t('clicks')}</span>
                  <span className="ml-2 text-slate-300">{new Intl.NumberFormat('tr-TR').format(metaClicksTotal + googleClicksTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie 3: Users Split */}
        <Card className="bg-slate-800/80 border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-white">{t('general')}</CardTitle>
            <div className="w-44">
              <Select value={usersPieMetric} onValueChange={(v: 'new_vs_active'|'sessions_vs_events') => setUsersPieMetric(v)}>
                <SelectTrigger className="bg-slate-800/60 border-slate-600 h-8 px-2 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-xs">
                  <SelectItem value="new_vs_active">{t('newVsActive')}</SelectItem>
                  <SelectItem value="sessions_vs_events">{t('sessionsVsEvents')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                {(() => {
                  if (usersPieMetric === 'new_vs_active') {
                    const sum = newUsersTotal + activeUsersTotal;
                    const data = [
                      { name: t('newUsers'), value: sum > 0 ? newUsersTotal : 1 },
                      { name: t('activeUsers'), value: sum > 0 ? activeUsersTotal : 1 },
                    ];
                    return (
                      <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} labelLine={false}>
                        <Cell key="new" fill="#22C55E" />
                        <Cell key="active" fill="#A78BFA" />
                      </Pie>
                    );
                  } else {
                    const sum = sessionsTotal + eventsTotal;
                    const data = [
                      { name: 'Sessions', value: sum > 0 ? sessionsTotal : 1 },
                      { name: 'Events', value: sum > 0 ? eventsTotal : 1 },
                    ];
                    return (
                      <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={90} labelLine={false}>
                        <Cell key="sessions" fill="#3B82F6" />
                        <Cell key="events" fill="#EC4899" />
                      </Pie>
                    );
                  }
                })()}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {usersPieMetric === 'new_vs_active' ? (
              <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#22C55E' }} />
                  <span>{t('newUsers')}</span>
                  <span className="ml-2 text-slate-300">{new Intl.NumberFormat('tr-TR').format(newUsersTotal)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#A78BFA' }} />
                  <span>{t('activeUsers')}</span>
                  <span className="ml-2 text-slate-300">{new Intl.NumberFormat('tr-TR').format(activeUsersTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#3B82F6' }} />
                  <span>Sessions</span>
                  <span className="ml-2 text-slate-300">{new Intl.NumberFormat('tr-TR').format(sessionsTotal)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#EC4899' }} />
                  <span>Events</span>
                  <span className="ml-2 text-slate-300">{new Intl.NumberFormat('tr-TR').format(eventsTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <StartGuide open={showStartGuide} onOpenChange={setShowStartGuide} userId={user?.uid} />
    </div>
  );
}
