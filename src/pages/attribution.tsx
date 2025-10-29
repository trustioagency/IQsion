import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from '../components/ui/badge';
 

import { 
  TrendingUp, Users,
  ShoppingCart, DollarSign,
  Eye, 
  MousePointer,
  Search,
  ArrowRight
} from "lucide-react";
// import AIChatPanel from "../components/ai-chat-panel";

export default function Attribution() {
  const [timeRange, setTimeRange] = useState<'7d'|'30d'|'90d'>('30d');
  const [selectedKpi, setSelectedKpi] = useState<'revenue'|'traffic'|'profit'>('revenue');
  const [sources, setSources] = useState<Array<{channel:string; value:number; share:number; revenue?:number; orders?:number; spend?:number}>>([]);
  const [totals, setTotals] = useState<{ total:number; startDate:string; endDate:string; note?:string } | null>(null);
  const [dynJourneys, setDynJourneys] = useState<Array<{ percentage:number; path: Array<{ channel:string; icon:any; action:string; color:string }> }>>([]);

  // Fetch KPI-based sources from backend
  useEffect(() => {
    const toRange = (tr: '7d'|'30d'|'90d') => {
      const today = new Date();
      const endD = new Date(today); endD.setDate(today.getDate() - 1);
      const startD = new Date(endD);
      startD.setDate(endD.getDate() - (tr === '7d' ? 6 : tr === '30d' ? 29 : 89));
      const fmt = (d: Date) => d.toISOString().slice(0,10);
      return { start: fmt(startD), end: fmt(endD) };
    };
    const { start, end } = toRange(timeRange);
    const run = async () => {
      try {
        const r = await fetch(`/api/attribution/sources?kpi=${selectedKpi}&startDate=${start}&endDate=${end}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        setSources(j?.sources || []);
        setTotals({ total: j?.total || 0, startDate: j?.startDate, endDate: j?.endDate, note: j?.note });
        // Map backend journeys to UI structure if present
        const journeys = Array.isArray(j?.journeys) ? j.journeys as Array<{ percentage:number; steps: Array<{ key:string }> }> : [];
        const mapStep = (key: string) => {
          switch (key) {
            case 'google':
              return { channel: 'Google', icon: <Search className="w-5 h-5" />, action: 'Arama', color: 'from-blue-600 to-blue-700' };
            case 'instagram':
            case 'meta':
              return { channel: 'Instagram', icon: <Eye className="w-5 h-5" />, action: 'Reklam Gösterimi', color: 'from-pink-500 to-rose-500' };
            case 'tiktok':
              return { channel: 'TikTok', icon: <Eye className="w-5 h-5" />, action: 'Video İzleme', color: 'from-gray-800 to-gray-900' };
            case 'email':
              return { channel: 'Email', icon: <Users className="w-5 h-5" />, action: 'Kampanya', color: 'from-orange-500 to-red-500' };
            case 'organic':
              return { channel: 'Organik', icon: <Search className="w-5 h-5" />, action: 'Doğal Arama', color: 'from-teal-500 to-emerald-500' };
            case 'website':
              return { channel: 'Website', icon: <MousePointer className="w-5 h-5" />, action: 'Site Ziyareti', color: 'from-blue-500 to-cyan-500' };
            case 'purchase':
              return { channel: 'Satın Alma', icon: <ShoppingCart className="w-5 h-5" />, action: 'Dönüşüm', color: 'from-purple-500 to-violet-500' };
            default:
              return { channel: key, icon: <MousePointer className="w-5 h-5" />, action: 'Adım', color: 'from-slate-500 to-slate-600' };
          }
        };
  const uiJourneys = journeys.map(jn => ({ percentage: Number(jn.percentage || 0), path: (jn.steps || []).map(s => mapStep(s.key)) }));
        setDynJourneys(uiJourneys);
      } catch (e) {
        setSources([]);
        setTotals({ total: 0, startDate: start, endDate: end, note: 'Veri alınamadı' });
        setDynJourneys([]);
      }
    };
    run();
  }, [selectedKpi, timeRange]);

  // --

  const customerJourneys = [
    {
      percentage: 42,
      path: [
        { channel: 'Instagram', icon: <Eye className="w-5 h-5" />, action: 'Reklam Gösterimi', color: 'from-pink-500 to-rose-500' },
        { channel: 'Website', icon: <MousePointer className="w-5 h-5" />, action: 'Ürün Sayfası', color: 'from-blue-500 to-cyan-500' },
        { channel: 'Google', icon: <Search className="w-5 h-5" />, action: 'Marka Araması', color: 'from-green-500 to-emerald-500' },
        { channel: 'Satın Alma', icon: <ShoppingCart className="w-5 h-5" />, action: 'Dönüşüm', color: 'from-purple-500 to-violet-500' }
      ]
    },
    {
      percentage: 28,
      path: [
        { channel: 'TikTok', icon: <Eye className="w-5 h-5" />, action: 'Video İzleme', color: 'from-gray-800 to-gray-900' },
        { channel: 'Website', icon: <MousePointer className="w-5 h-5" />, action: 'Anasayfa', color: 'from-blue-500 to-cyan-500' },
        { channel: 'Email', icon: <Users className="w-5 h-5" />, action: 'Kampanya', color: 'from-orange-500 to-red-500' },
        { channel: 'Satın Alma', icon: <ShoppingCart className="w-5 h-5" />, action: 'Dönüşüm', color: 'from-purple-500 to-violet-500' }
      ]
    },
    {
      percentage: 30,
      path: [
        { channel: 'Google Ads', icon: <Search className="w-5 h-5" />, action: 'Arama Reklamı', color: 'from-blue-600 to-blue-700' },
        { channel: 'Website', icon: <MousePointer className="w-5 h-5" />, action: 'Kategori Sayfası', color: 'from-blue-500 to-cyan-500' },
        { channel: 'Satın Alma', icon: <ShoppingCart className="w-5 h-5" />, action: 'Direkt Dönüşüm', color: 'from-purple-500 to-violet-500' }
      ]
    }
  ];

  // --

  // Color mapping for normalized channels
  const getNormColor = (channel: string) => {
    const map: Record<string,string> = {
      google: 'bg-gradient-to-r from-blue-500 to-blue-600',
      meta: 'bg-gradient-to-r from-indigo-500 to-indigo-700',
      instagram: 'bg-gradient-to-r from-pink-500 to-rose-500',
      tiktok: 'bg-gradient-to-r from-gray-800 to-black',
      email: 'bg-gradient-to-r from-green-500 to-emerald-600',
      organic: 'bg-gradient-to-r from-teal-500 to-teal-700',
      direct: 'bg-gradient-to-r from-slate-500 to-slate-600',
      referral: 'bg-gradient-to-r from-amber-500 to-amber-600',
      other: 'bg-gradient-to-r from-zinc-500 to-zinc-700',
    };
    return map[channel] || map.other;
  };

  // --

  const kpiOptions = [
    { value: 'revenue', label: 'Gelir' },
    { value: 'traffic', label: 'Trafik' },
    { value: 'profit', label: 'Kar (yaklaşık)' },
  ] as const;

  return (
        <main className="h-full overflow-y-auto bg-slate-800/50 p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">

            {/* Header with Filters */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Atıflandırma Komuta Merkezi</h1>
                <p className="text-slate-400">Merve'yi adım adım yönlendiren akıllı analiz platformu</p>
              </div>

              {/* Filter Controls */}
              <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-300">Bakış Açısı:</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select value={selectedKpi} onValueChange={(v)=>setSelectedKpi(v as 'revenue'|'traffic'|'profit')}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-300 w-48">
                          <SelectValue placeholder="KPI seç" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {kpiOptions.map((k)=> (
                            <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                      <Select value={timeRange} onValueChange={(v)=>setTimeRange(v as '7d'|'30d'|'90d')}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-300 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="7d">Son 7 gün</SelectItem>
                          <SelectItem value="30d">Son 30 gün</SelectItem>
                          <SelectItem value="90d">Son 90 gün</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sources ranking by selected KPI */}
            <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Kaynak Sıralaması
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  Seçilen KPI'ya göre kanalların katkısı
                  {totals?.note ? ` — ${totals.note}` : ''}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sources.map((s) => (
                    <div key={s.channel} className="bg-slate-700/30 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium capitalize">{s.channel}</span>
                        <span className="text-white font-bold text-lg">%{s.share}</span>
                      </div>
                      <div className="w-full bg-slate-600/50 rounded-full h-2">
                        <div className={`h-2 rounded-full ${getNormColor(s.channel)}`} style={{ width: `${s.share}%` }} />
                      </div>
                      <div className="text-xs text-slate-400 flex gap-4">
                        {selectedKpi === 'traffic' && <span>Oturum: {s.value.toLocaleString('tr-TR')}</span>}
                        {selectedKpi !== 'traffic' && <span>Değer: {s.value.toLocaleString('tr-TR', { style:'currency', currency:'TRY' })}</span>}
                        {typeof s.orders === 'number' && s.orders > 0 && <span>Sipariş: {s.orders}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Journeys - Redesigned */}
            <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Altın Patikalar
                </CardTitle>
                <p className="text-slate-400 text-sm">En yaygın müşteri yolculukları</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {(dynJourneys.length ? dynJourneys : customerJourneys).map((journey, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-slate-300 font-medium">Yolculuk {index + 1}</span>
                        </div>
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30">
                          %{journey.percentage} Dönüşüm
                        </Badge>
                      </div>

                      <div className="relative">
                        {/* Connection line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 -translate-y-1/2 z-0" />

                        <div className="relative z-10 flex items-center justify-between">
                          {journey.path.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex flex-col items-center group">
                              <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-3 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                                {step.icon}
                              </div>
                              <div className="text-center space-y-1">
                                <span className="text-sm font-medium text-white">{step.channel}</span>
                                <span className="text-xs text-slate-400">{step.action}</span>
                              </div>

                              {stepIndex < journey.path.length - 1 && (
                                <div className="absolute top-8 left-full w-full flex items-center justify-center pointer-events-none">
                                  <ArrowRight className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI panel kaldırıldı */}

          </div>
        </main>
  );
}