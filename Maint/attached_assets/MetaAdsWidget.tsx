import React, { useEffect, useState } from 'react';
import WidgetChart from './WidgetChart';
import { MetaIcon } from './icons_1753609863036';

interface MetaAdsWidgetProps {
  language: 'tr' | 'en';
  dateRange: string;
  platform: string;
}

const MetaAdsWidget: React.FC<MetaAdsWidgetProps> = ({ language, dateRange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Reklam hesabı ID'sini bir kez çek ve state'e ata
  useEffect(() => {
    fetch('/api/connections?userId=test-user')
      .then(res => res.json())
      .then(connections => {
        const metaConn = connections && connections.meta_ads;
        setAccountId(metaConn?.accountId || null);
      })
      .catch(() => setAccountId(null));
  }, []);

  // Tarih aralığına göre since/until hesapla
  function getDateRangeParams(range: string) {
    const now = new Date();
    let since = '';
    let until = '';
    // until: bugünün tarihi yerine bir gün öncesi, son günü dahil etmek için bir gün ileri
    const untilDate = new Date(now); untilDate.setDate(untilDate.getDate()); until = untilDate.toISOString().slice(0, 10);
    if (range === '7d') {
      // since: until - 6 gün
      const d = new Date(untilDate); d.setDate(d.getDate() - 6); since = d.toISOString().slice(0, 10);
    } else if (range === '30d') {
      const d = new Date(untilDate); d.setDate(d.getDate() - 29); since = d.toISOString().slice(0, 10);
    } else if (range === '14d') {
      const d = new Date(untilDate); d.setDate(d.getDate() - 13); since = d.toISOString().slice(0, 10);
    } else {
      const d = new Date(untilDate); d.setDate(d.getDate() - 6); since = d.toISOString().slice(0, 10);
    }
    return { since, until };
  }

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    const { since, until } = getDateRangeParams(dateRange);
    fetch(`/api/meta/ads/raw?userId=test-user&adAccountId=${accountId}&fields=spend,impressions,reach,clicks,campaign_name&since=${since}&until=${until}`)
      .then(res => res.json())
      .then(json2 => {
        if (json2.error || json2.message) {
          setError(json2.error?.message || json2.message);
          setData(null);
        } else {
          setData(json2.data || json2);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Veri alınamadı');
        setLoading(false);
      });
  }, [accountId, dateRange]);

  return (
    <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg p-4 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <MetaIcon className="w-6 h-6 text-blue-400" />
        <span className="font-bold text-white text-lg">Meta Reklam Verisi</span>
      </div>
      {loading && <div className="text-slate-300">Yükleniyor...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {/* Sadece özet metrikler */}
      {!loading && !error && data && Array.isArray(data) ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center min-h-[260px] border-2 border-blue-400 bg-slate-800">
            <div className="text-xs text-slate-400 mb-1">Toplam Harcama</div>
            <div className="text-2xl font-bold">{data.reduce((sum: number, item: any) => sum + Number(item.spend || 0), 0).toLocaleString()} ₺</div>
              {/* Test amaçlı sabit veriyle grafik */}
              <WidgetChart
                data={[
                  { date: '2025-08-01', value: 1200 },
                  { date: '2025-08-02', value: 1800 },
                  { date: '2025-08-03', value: 900 },
                  { date: '2025-08-04', value: 2100 },
                  { date: '2025-08-05', value: 1700 },
                  { date: '2025-08-06', value: 2500 },
                  { date: '2025-08-07', value: 1300 },
                ]}
                label="Spend"
              />
          </div>
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-1">Gösterim</div>
            <div className="text-2xl font-bold">{data.reduce((sum: number, item: any) => sum + Number(item.impressions || 0), 0).toLocaleString()}</div>
              {/* Dinamik Gösterim Grafiği */}
              <WidgetChart
                data={data.map((item: any) => ({ date: item.date || item.campaign_name || '', value: Number(item.impressions || 0) }))}
                label="Impressions"
              />
          </div>
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-1">Erişim</div>
            <div className="text-2xl font-bold">{data.reduce((sum: number, item: any) => sum + Number(item.reach || 0), 0).toLocaleString()}</div>
              {/* Dinamik Erişim Grafiği */}
              <WidgetChart
                data={data.map((item: any) => ({ date: item.date || item.campaign_name || '', value: Number(item.reach || 0) }))}
                label="Reach"
              />
          </div>
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-1">Tıklama</div>
            <div className="text-2xl font-bold">{data.reduce((sum: number, item: any) => sum + Number(item.clicks || 0), 0).toLocaleString()}</div>
              {/* Dinamik Tıklama Grafiği */}
              <WidgetChart
                data={data.map((item: any) => ({ date: item.date || item.campaign_name || '', value: Number(item.clicks || 0) }))}
                label="Clicks"
              />
          </div>
        </div>
      ) : data && data.length === 0 ? (
        <div className="text-sm text-muted-foreground">Veri bulunamadı. Bu reklam hesabında son 30 gün için veri yok.</div>
      ) : (
        null
      )}
      {!loading && !error && (!data || (Array.isArray(data) && data.length === 0)) && (
        <div className="text-slate-400">Veri yok veya bağlantı yapılmadı.</div>
      )}
    </div>
  );
};

export default MetaAdsWidget;
