import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, Info, ExternalLink, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../lib/queryClient";

type InsightType = 'cost_spike' | 'ctr_drop' | 'low_roas' | 'zero_conversions' | 'cvr_drop' | 'cpc_spike' | 'impression_drop' | 'opportunity';
type InsightPriority = 'high' | 'medium' | 'low';
type InsightSource = 'meta_ads' | 'google_ads' | 'shopify' | 'ga4' | 'system';
type InsightCategory = 'anomali' | 'optimizasyon' | 'strateji' | 'içgörü';

interface Insight {
  id: string;
  type: InsightType;
  category?: InsightCategory;
  priority: InsightPriority;
  title: string;
  action: string;
  source: InsightSource;
  data: Record<string, any>;
  generatedAt: number;
}

interface InsightsResponse {
  userId: string;
  insights: Insight[];
  generatedAt: number;
  expiresAt: number;
}

export default function InsightsWidget() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const userId = user?.uid || user?.id; // uid veya id

  const { data: insightsData, isLoading, error } = useQuery<InsightsResponse>({
    queryKey: ['insights', userId],
    queryFn: async () => {
      console.log('[InsightsWidget] Fetching insights for user:', userId);
      const url = `${API_BASE}/api/insights?userId=${userId}`;
      console.log('[InsightsWidget] API URL:', url);
      const res = await fetch(url, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();
      console.log('[InsightsWidget] Response:', data);
      return data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });

  const resolveInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const res = await fetch(`${API_BASE}/api/insights/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, insightId }),
      });
      if (!res.ok) throw new Error('Failed to resolve insight');
      return res.json();
    },
    onSuccess: () => {
      // Refresh insights list
      queryClient.invalidateQueries({ queryKey: ['insights', userId] });
    },
  });

  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case 'cost_spike': return <TrendingUp className="w-4 h-4" />;
      case 'ctr_drop': return <AlertTriangle className="w-4 h-4" />;
      case 'low_roas': return <AlertTriangle className="w-4 h-4" />;
      case 'zero_conversions': return <AlertTriangle className="w-4 h-4" />;
      case 'cvr_drop': return <AlertTriangle className="w-4 h-4" />;
      case 'cpc_spike': return <TrendingUp className="w-4 h-4" />;
      case 'impression_drop': return <AlertTriangle className="w-4 h-4" />;
      case 'opportunity': return <Lightbulb className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: InsightPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getCategoryLabel = (category?: InsightCategory) => {
    if (!category) return 'Anomali';
    switch (category) {
      case 'anomali': return 'Anomali';
      case 'optimizasyon': return 'Optimizasyon';
      case 'strateji': return 'Strateji';
      case 'içgörü': return 'İçgörü';
      default: return 'Anomali';
    }
  };

  const getCategoryColor = (category?: InsightCategory) => {
    if (!category) return 'bg-red-500/20 text-red-400 border-red-500/30';
    switch (category) {
      case 'anomali': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'optimizasyon': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'strateji': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'içgörü': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getSourceLabel = (source: InsightSource) => {
    switch (source) {
      case 'meta_ads': return 'Meta Ads';
      case 'google_ads': return 'Google Ads';
      case 'shopify': return 'Shopify';
      case 'ga4': return 'GA4';
      default: return 'System';
    }
  };

  const formatMetricValue = (key: string, value: any) => {
    if (key.includes('cost') || key.includes('spend') || key.includes('revenue')) {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
    }
    if (key.includes('pct') || key.includes('change')) {
      return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    }
    if (key.includes('roas')) {
      return `${value.toFixed(2)}x`;
    }
    return value;
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            {t('aiInsights') || 'AI Önerileri'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400 text-sm">{t('loading') || 'Yükleniyor...'}</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !insightsData?.insights?.length) {
    return (
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            {t('aiInsights') || 'AI Önerileri'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400 text-sm">
            {error ? 'Öneriler yüklenirken hata oluştu' : 'Şu anda öneri bulunmuyor'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = insightsData.insights;

  return (
    <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          {t('aiInsights') || 'AI Önerileri'}
          <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {insights.length} {t('active') || 'aktif'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-lg hover:bg-slate-900/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-blue-400">
                      {getInsightIcon(insight.type)}
                    </div>
                    <h5 className="font-medium text-white text-base">{insight.title}</h5>
                    <Badge className={`ml-2 ${getCategoryColor(insight.category)}`}>
                      {getCategoryLabel(insight.category)}
                    </Badge>
                    <Badge className={`ml-auto ${getPriorityColor(insight.priority)}`}>
                      {insight.priority === 'high' ? 'Yüksek' : insight.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                  </div>
                  
                  {/* Action Item */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mb-2">
                    <div className="text-sm text-blue-300">{insight.action}</div>
                  </div>

                  {/* Data Metrics */}
                  {insight.data && Object.keys(insight.data).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(insight.data).map(([key, value]) => {
                        if (key === 'accountId' || key === 'period') return null;
                        return (
                          <div key={key} className="text-xs bg-slate-800/50 px-2 py-1 rounded text-slate-300">
                            <span className="text-slate-400">{key}: </span>
                            <span className="font-medium">{formatMetricValue(key, value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{getSourceLabel(insight.source)}</span>
                  <span>•</span>
                  <span>{new Date(insight.generatedAt).toLocaleString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short'
                  })}</span>
                </div>
                <button
                  onClick={() => resolveInsight.mutate(insight.id)}
                  disabled={resolveInsight.isPending}
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Anladım
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
