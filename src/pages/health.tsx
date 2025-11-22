import React, { useEffect, useMemo, useState } from 'react';
import StartGuide from '../components/start-guide';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ChevronDown } from 'lucide-react';
import { useLocation } from 'wouter';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';

type MetaSummary = {
  rows: Array<{ date: string; spend: number; impressions: number; clicks: number; ctr: number }>;
  totals: { spend: number; impressions: number; clicks: number; ctr: number; cpc: number };
  requestedRange: { startDate: string; endDate: string };
} | null;

const fetchConnections = async (uid?: string) => {
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const res = await fetch(`/api/connections${qs}`, { credentials: 'include' });
  if (!res.ok) return {} as any;
  return res.json();
};

const fetchMetaSummary = async (uid?: string) => {
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const res = await fetch(`/api/meta/summary-bq${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Meta summary fetch failed');
  return res.json();
};

const fetchPixelStatus = async (uid?: string) => {
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const res = await fetch(`/api/pixel/status${qs}`, { credentials: 'include' });
  if (!res.ok) return { installed: false };
  return res.json();
};

const fetchMetaAudiences = async (uid?: string) => {
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const res = await fetch(`/api/meta/audiences/summary${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Audiences fetch failed');
  return res.json();
};

const fetchMetaCatalog = async (uid?: string) => {
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const res = await fetch(`/api/meta/catalog/status${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Catalog status fetch failed');
  return res.json();
};

const fetchMetaTargeting = async (uid?: string) => {
  const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
  const res = await fetch(`/api/meta/targeting/summary${qs}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Targeting summary fetch failed');
  return res.json();
};

function computeMetaHealth(summary: MetaSummary) {
  // Simple heuristic score out of 100
  if (!summary) return { score: 0, grade: 'F', issues: ['No data'], notes: [] as string[] };
  const t = summary.totals || ({} as any);
  const spend = Number(t.spend || 0);
  const imps = Number(t.impressions || 0);
  const clicks = Number(t.clicks || 0);
  const ctr = Number(t.ctr || (imps > 0 ? (clicks / imps) * 100 : 0));
  const cpc = Number(t.cpc || (clicks > 0 ? spend / clicks : 0));

  let score = 100;
  const issues: string[] = [];
  const notes: string[] = [];

  if (spend <= 0) { score = Math.min(score, 20); issues.push('No recent spend'); }
  if (imps <= 0) { score -= 30; issues.push('No impressions'); }
  if (clicks <= 0) { score -= 20; issues.push('No clicks'); }
  // CTR thresholds (generic)
  if (ctr < 0.5) { score -= 25; issues.push('Very low CTR (<0.5%)'); }
  else if (ctr < 1.0) { score -= 15; issues.push('Low CTR (<1%)'); }
  // CPC thresholds (currency-agnostic heuristic)
  if (cpc > 10) { score -= 25; issues.push('Very high CPC (>10)'); }
  else if (cpc > 5) { score -= 15; issues.push('High CPC (>5)'); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  notes.push(`Spend=${spend.toFixed(2)} • Impressions=${imps} • Clicks=${clicks} • CTR=${ctr.toFixed(2)}% • CPC=${cpc.toFixed(2)}`);
  return { score, grade, issues, notes };
}

export default function HealthPage() {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const uid = (user as any)?.uid || (user as any)?.id || undefined;
  const [openGuide, setOpenGuide] = useState(false);
  const [metaAudit, setMetaAudit] = useState<{ score: number; grade: string; issues: string[]; notes: string[] } | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [metaSummary, setMetaSummary] = useState<MetaSummary>(null);
  const [location, navigate] = useLocation();
  const [saving, setSaving] = useState(false);

  const { data: connections } = useQuery({
    queryKey: ['connections', uid],
    enabled: !!user,
    queryFn: () => fetchConnections(uid)
  });

  const metaConnected: boolean = !!(connections as any)?.meta_ads?.isConnected;
  const { data: pixel } = useQuery({
    queryKey: ['pixelStatus', uid],
    enabled: !!user,
    queryFn: () => fetchPixelStatus(uid)
  });

  const { data: auds, error: audsErr } = useQuery({
    queryKey: ['metaAudiences', uid],
    enabled: !!user && metaConnected,
    queryFn: () => fetchMetaAudiences(uid)
  });

  const { data: catalog, error: catalogErr } = useQuery({
    queryKey: ['metaCatalog', uid],
    enabled: !!user && metaConnected,
    queryFn: () => fetchMetaCatalog(uid)
  });

  const { data: targeting, error: targetingErr } = useQuery({
    queryKey: ['metaTargeting', uid],
    enabled: !!user && metaConnected,
    queryFn: () => fetchMetaTargeting(uid)
  });

  const runMetaAudit = async () => {
    try {
      setAuditing(true);
      const summary = await fetchMetaSummary(uid);
      setMetaSummary(summary);
      setMetaAudit(computeMetaHealth(summary));
    } catch (_e) {
      setMetaAudit({ score: 0, grade: 'F', issues: ['Meta summary not available'], notes: [] });
    } finally {
      setAuditing(false);
    }
  };

  const saveHistory = async () => {
    if (!metaAudit) return;
    try {
      setSaving(true);
      const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
      await fetch(`/api/meta/health/history${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: metaAudit.score, grade: metaAudit.grade })
      });
      // refetch history
      historyRefetch();
    } finally {
      setSaving(false);
    }
  };

  const { data: historyData, refetch: historyRefetch } = useQuery({
    queryKey: ['metaHealthHistory', uid],
    enabled: !!user && metaConnected,
    queryFn: async () => {
      const qs = uid ? `?userId=${encodeURIComponent(uid)}` : '';
      const r = await fetch(`/api/meta/health/history${qs}`, { credentials: 'include' });
      if (!r.ok) throw new Error('history fetch failed');
      return r.json();
    }
  });

  useEffect(() => {
    // Auto-open guide if no basic connections
    if (!authLoading && user) {
      const anyConn = !!((connections as any)?.shopify || (connections as any)?.google_analytics || (connections as any)?.meta_ads || (connections as any)?.google_ads);
      if (!anyConn) setOpenGuide(true);
    }
  }, [user, authLoading, connections]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-white">{t('healthCenter')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOpenGuide(true)}>{t('onboardingStart')}</Button>
        </div>
      </div>

      {/* Onboarding Guide embedded as modal */}
      <StartGuide open={openGuide} onOpenChange={setOpenGuide} userId={uid} />

      {/* Meta Health Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>{t('metaAdsHealth')}</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm px-2 py-0.5 rounded ${metaAudit ? 'bg-slate-700 text-slate-200' : 'bg-slate-700/60 text-slate-400'}`}>
                {metaAudit ? `${t('metaAuditScore')}: ${metaAudit.score} (${metaAudit.grade})` : t('noScoreYet')}
              </span>
              <Button size="sm" onClick={runMetaAudit} disabled={!metaConnected || auditing}>
                {auditing ? t('auditing') : (metaConnected ? t('runAudit') : t('connectFirst'))}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!metaConnected && (
            <div className="text-yellow-300 text-sm">{t('metaAccountNotConnected')}</div>
          )}
          {/* Score Gauge + Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gauge */}
            <div className="flex items-center justify-center">
              <HealthGauge score={metaAudit?.score ?? 0} grade={metaAudit?.grade ?? '-'} />
            </div>
            {/* Checklist */}
            <div className="md:col-span-2 space-y-4">
              {/* Checklist collapsible */}
              <Collapsible defaultOpen>
                <div className="flex items-center justify-between">
                  <div className="text-white font-medium">{t('metaChecklist')}</div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white flex items-center gap-1 data-[state=open]:rotate-0 transition-transform">
                      <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-2">
                  <MetaChecklist 
                    t={t}
                    metaConnected={metaConnected}
                    pixelInstalled={!!pixel?.installed}
                    summary={metaSummary}
                    navigate={navigate}
                    onOpenGuide={() => setOpenGuide(true)}
                    audiences={auds}
                    catalog={catalog}
                    targeting={targeting}
                  />
                </CollapsibleContent>
              </Collapsible>

              {/* History collapsible */}
              <Collapsible>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white">{t('healthHistory')}</div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white flex items-center gap-1">
                      <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-2">
                  <MetaHealthHistory t={t} history={(historyData as any)?.history || []} />
                  {metaAudit && (
                    <div className="mt-3">
                      <Button size="sm" onClick={saveHistory} disabled={saving}>{saving ? '...' : t('saveScore')}</Button>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {metaAudit && (
            <div className="space-y-2">
              <div className="text-sm text-slate-300">{t('metaAuditNotes')}: {metaAudit.notes.join(' • ')}</div>
            </div>
          )}
          {!metaAudit && metaConnected && (
            <div className="text-sm text-slate-400">{t('metaNoScoreYet')}</div>
          )}
        </CardContent>
      </Card>

      {/* Placeholders for other channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700 opacity-70">
          <CardHeader><CardTitle className="text-white">{t('googleAdsHealthSoon')}</CardTitle></CardHeader>
        </Card>
        <Card className="bg-slate-800 border-slate-700 opacity-70">
          <CardHeader><CardTitle className="text-white">{t('tiktokAdsHealthSoon')}</CardTitle></CardHeader>
        </Card>
      </div>
    </div>
  );
}

function HealthGauge({ score, grade }: { score: number; grade: string }) {
  const size = 200;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const palette = clamped >= 80
    ? { from: '#34d399', to: '#84cc16' }
    : clamped >= 60
    ? { from: '#f59e0b', to: '#eab308' }
    : { from: '#ef4444', to: '#f87171' };
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.from} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
          <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* background track */}
        <circle cx={size/2} cy={size/2} r={radius} stroke="#1f2937" strokeWidth={stroke} fill="none" />
        {/* glow underlay */}
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={palette.to}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          opacity={0.25}
          filter="url(#gaugeGlow)"
        />
        {/* gradient foreground */}
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <div className="text-4xl font-extrabold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">{clamped}</div>
        <div className="text-sm text-slate-300">{grade}</div>
        <div className="text-xs text-slate-500">Health</div>
      </div>
    </div>
  );
}

type ChecklistStatus = 'pass' | 'warn' | 'fail' | 'unknown';
function StatusIcon({ status }: { status: ChecklistStatus }) {
  if (status === 'pass') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'warn') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  if (status === 'fail') return <XCircle className="w-4 h-4 text-rose-400" />;
  return <HelpCircle className="w-4 h-4 text-slate-400" />;
}

function MetaChecklist({ t, metaConnected, pixelInstalled, summary, navigate, onOpenGuide, audiences, catalog, targeting }: {
  t: (k: any) => string;
  metaConnected: boolean;
  pixelInstalled: boolean;
  summary: MetaSummary;
  navigate: (to: string) => void;
  onOpenGuide: () => void;
  audiences?: { customCount: number; lookalikeCount: number };
  catalog?: { hasCatalog: boolean };
  targeting?: { hasGeo: boolean; hasAge: boolean; hasInterests: boolean };
}) {
  const totals = summary?.totals;
  const spend = Number(totals?.spend || 0);
  const imps = Number(totals?.impressions || 0);
  const clicks = Number(totals?.clicks || 0);
  const ctr = Number(totals?.ctr || (imps > 0 ? (clicks / imps) * 100 : 0));
  const cpc = Number(totals?.cpc || (clicks > 0 ? spend / clicks : 0));
  const last7 = summary?.rows?.slice(-7) || [];
  const recentActive = last7.some(r => r.spend > 0 || r.impressions > 0);

  const checks: Array<{ key: string; label: string; hint?: string; status: ChecklistStatus; action?: { label: string; onClick: () => void } }>= [
    { key: 'conn', label: t('checkMetaConnected'), status: metaConnected ? 'pass' : 'fail', action: !metaConnected ? { label: t('fixNow'), onClick: () => navigate('/settings') } : undefined },
    { key: 'pixel', label: t('checkPixelInstalled'), status: pixelInstalled ? 'pass' : 'warn', action: !pixelInstalled ? { label: t('openGuide'), onClick: onOpenGuide } : undefined },
    { key: 'catalog', label: t('checkCatalogLinked'), hint: t('hintCatalogLinked'), status: catalog?.hasCatalog ? 'pass' : (metaConnected ? 'warn' : 'unknown'), action: !catalog?.hasCatalog ? { label: t('viewSettings'), onClick: () => navigate('/settings') } : undefined },
    { key: 'custom', label: t('checkCustomAudiences'), hint: t('hintCustomAudiences'), status: (audiences && audiences.customCount > 0) ? 'pass' : (metaConnected ? 'warn' : 'unknown') },
    { key: 'lookalike', label: t('checkLookalikes'), hint: t('hintLookalikes'), status: (audiences && audiences.lookalikeCount > 0) ? 'pass' : (metaConnected ? 'warn' : 'unknown') },
    { key: 'spend', label: t('checkRecentSpend'), status: spend > 0 ? 'pass' : 'fail' },
    { key: 'imps', label: t('checkImpressions'), status: imps > 0 ? 'pass' : 'fail' },
    { key: 'clicks', label: t('checkClicks'), status: clicks > 0 ? 'pass' : 'warn' },
    { key: 'ctr', label: t('checkCtr'), hint: t('hintCtr'), status: ctr >= 1 ? 'pass' : ctr >= 0.5 ? 'warn' : 'fail' },
    { key: 'cpc', label: t('checkCpc'), hint: t('hintCpc'), status: cpc <= 5 ? 'pass' : cpc <= 10 ? 'warn' : 'fail' },
    { key: 'recent', label: t('checkRecentActivity'), status: recentActive ? 'pass' : 'warn' },
    { key: 'tgeo', label: t('checkTargetingGeo'), hint: t('hintTargetingGeo'), status: targeting ? (targeting.hasGeo ? 'pass' : 'warn') : 'unknown' },
    { key: 'tage', label: t('checkTargetingAge'), hint: t('hintTargetingAge'), status: targeting ? (targeting.hasAge ? 'pass' : 'warn') : 'unknown' },
    { key: 'tinterest', label: t('checkTargetingInterests'), hint: t('hintTargetingInterests'), status: targeting ? (targeting.hasInterests ? 'pass' : 'warn') : 'unknown' },
    { key: 'structure', label: t('checkAccountStructure'), hint: t('hintAccountStructure'), status: 'unknown', action: { label: t('viewSettings'), onClick: () => navigate('/settings') } },
    { key: 'creatives', label: t('checkCreativeVariety'), hint: t('hintCreativeVariety'), status: 'unknown' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-medium">{t('metaChecklist')}</div>
        <div className="text-xs text-slate-400">{t('metaChecklistLegend')}</div>
      </div>
      <ul className="divide-y divide-slate-700 rounded-md border border-slate-700 overflow-hidden">
        {checks.map((c) => (
          <li key={c.key} className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-800">
            <StatusIcon status={c.status} />
            <div className="flex-1">
              <div className="text-sm text-white">{c.label}</div>
              {c.hint && <div className="text-xs text-slate-400">{c.hint}</div>}
            </div>
            {c.action && (
              <Button size="sm" variant="secondary" onClick={c.action.onClick}>{c.action.label}</Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetaHealthHistory({ t, history }: { t: (k: any)=>string; history: Array<{timestamp: string; score: number; grade: string}> }) {
  if (!history || history.length === 0) return <div className="mt-6 text-xs text-slate-500">{t('healthHistoryEmpty')}</div>;
  const recent = history.slice(-12); // last 12 entries sparkline
  const max = Math.max(...recent.map(r => r.score), 100);
  const points = recent.map((r, i) => {
    const x = (i / Math.max(1, recent.length -1)) * 100;
    const y = 100 - (r.score / max) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-white">{t('healthHistory')}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500">{t('healthHistoryTrend')}</div>
      </div>
      <div className="p-3 rounded-md bg-slate-800/60 border border-slate-700">
        <svg viewBox="0 0 100 100" className="w-full h-20">
          <polyline
            fill="none"
            stroke="url(#hhgrad)"
            strokeWidth={2}
            points={points}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="hhgrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
          {recent.map((r,i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-slate-900/40 px-2 py-1 rounded">
              <span className="font-mono text-slate-300">{r.score}</span>
              <span className="text-slate-500">{r.grade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
