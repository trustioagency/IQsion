import React, { useEffect, useState } from 'react';
import { MetaIcon, GoogleIcon } from './icons_1753609863036';

interface UnifiedAdWidgetProps {
  language: 'tr' | 'en';
  dateRange: string;
  platform: 'meta' | 'google' | 'googleads' | 'all';
}

const UnifiedAdWidget: React.FC<UnifiedAdWidgetProps> = ({ language, dateRange, platform }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Kullanıcı bağlantılarını çek
  useEffect(() => {
    fetch('/api/connections?userId=test-user')
      .then(res => res.json())
      .then(connections => {
        setAccountId(connections?.meta_ads?.accountId || null);
        setPropertyId(connections?.google_analytics?.propertyId || null);
      })
      .catch(() => {
        setAccountId(null);
        setPropertyId(null);
      });
  }, []);

  // Tarih aralığına göre since/until hesapla
  function getDateRangeParams(range: string) {
    const now = new Date();
    let since = '';
    let until = '';
    const untilDate = new Date(now); untilDate.setDate(untilDate.getDate()); until = untilDate.toISOString().slice(0, 10);
    if (range === '7d') {
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

  // Veri çekme
  useEffect(() => {
    setLoading(true);
    setError(null);
    const { since, until } = getDateRangeParams(dateRange);
    let fetchUrl = '';
    if (platform === 'meta' && accountId) {
      fetchUrl = `/api/meta/ads/raw?userId=test-user&adAccountId=${accountId}&fields=spend,impressions,reach,clicks,campaign_name&since=${since}&until=${until}`;
    } else if (platform === 'google' && propertyId) {
      fetchUrl = `/api/analytics/summary?userId=test-user&propertyId=${propertyId}&startDate=${since}&endDate=${until}`;
    } else if (platform === 'all' && accountId && propertyId) {
      // Önce Meta, sonra Google verisi çekilecek ve birleştirilecek
      Promise.all([
        fetch(`/api/meta/ads/raw?userId=test-user&adAccountId=${accountId}&fields=spend,impressions,reach,clicks,campaign_name&since=${since}&until=${until}`).then(res => res.json()),
        fetch(`/api/analytics/summary?userId=test-user&propertyId=${propertyId}&startDate=${since}&endDate=${until}`).then(res => res.json())
      ]).then(([metaData, googleData]) => {
        setData({ meta: metaData.data || [], google: googleData.rows || [] });
        setLoading(false);
      }).catch(() => {
        setError('Veri alınamadı');
        setLoading(false);
      });
      return;
    } else {
      setLoading(false);
      setError('Bağlantı veya kimlik eksik');
      return;
    }
    if (fetchUrl) {
      fetch(fetchUrl)
        .then(res => res.json())
        .then(json2 => {
          if (json2.error || json2.message) {
            setError(json2.error?.message || json2.message);
            setData(null);
          } else {
            setData(json2.data || json2.rows || json2);
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Veri alınamadı');
          setLoading(false);
        });
    }
  }, [platform, accountId, propertyId, dateRange]);

  // Gösterim
  return (
    <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg p-4 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        {platform === 'meta' && <MetaIcon className="w-6 h-6 text-blue-400" />}
        {platform === 'google' && <GoogleIcon className="w-6 h-6 text-green-400" />}
        {platform === 'all' && <><MetaIcon className="w-6 h-6 text-blue-400" /><GoogleIcon className="w-6 h-6 text-green-400" /></>}
        <span className="font-bold text-white text-lg">
          {platform === 'meta' ? 'Meta Reklam Verisi' :
           platform === 'google' ? 'Analytics Verisi' :
           platform === 'googleads' ? 'Google Ads Verisi' :
           'Tüm Reklam Verileri'}
        </span>
      </div>
      {loading && <div className="text-slate-300">Yükleniyor...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {/* Meta */}
      <div
        className="w-full grid gap-6 py-2 px-0"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
      >
        {/* Meta kutuları */}
  <div className="min-w-[260px] bg-gradient-to-br from-indigo-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-indigo-300 mb-2 tracking-wide uppercase">Toplam Harcama</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              if (platform === 'meta' && Array.isArray(data)) {
                return data.reduce((sum: number, item: any) => sum + Number(item.spend || 0), 0).toLocaleString() + ' ₺';
              } else if (platform === 'all' && data?.meta) {
                return data.meta.reduce((sum: number, item: any) => sum + Number(item.spend || 0), 0).toLocaleString() + ' ₺';
              } else {
                return '-';
              }
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-pink-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-pink-300 mb-2 tracking-wide uppercase">Gösterim</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              if (platform === 'meta' && Array.isArray(data)) {
                return data.reduce((sum: number, item: any) => sum + Number(item.impressions || 0), 0).toLocaleString();
              } else if (platform === 'all' && data?.meta) {
                return data.meta.reduce((sum: number, item: any) => sum + Number(item.impressions || 0), 0).toLocaleString();
              } else {
                return '-';
              }
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-green-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-green-300 mb-2 tracking-wide uppercase">Tıklama</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              if (platform === 'meta' && Array.isArray(data)) {
                return data.reduce((sum: number, item: any) => sum + Number(item.clicks || 0), 0).toLocaleString();
              } else if (platform === 'all' && data?.meta) {
                return data.meta.reduce((sum: number, item: any) => sum + Number(item.clicks || 0), 0).toLocaleString();
              } else {
                return '-';
              }
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-blue-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-blue-300 mb-2 tracking-wide uppercase">Erişim</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              if (platform === 'meta' && Array.isArray(data)) {
                return data.reduce((sum: number, item: any) => sum + Number(item.reach || 0), 0).toLocaleString();
              } else if (platform === 'all' && data?.meta) {
                return data.meta.reduce((sum: number, item: any) => sum + Number(item.reach || 0), 0).toLocaleString();
              } else {
                return '-';
              }
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-yellow-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-yellow-300 mb-2 tracking-wide uppercase">CTR</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              let totalImpressions = 0;
              let totalClicks = 0;
              if (platform === 'meta' && Array.isArray(data)) {
                totalImpressions = data.reduce((sum: number, item: any) => sum + Number(item.impressions || 0), 0);
                totalClicks = data.reduce((sum: number, item: any) => sum + Number(item.clicks || 0), 0);
              } else if (platform === 'all' && data?.meta) {
                totalImpressions = data.meta.reduce((sum: number, item: any) => sum + Number(item.impressions || 0), 0);
                totalClicks = data.meta.reduce((sum: number, item: any) => sum + Number(item.clicks || 0), 0);
              }
              return totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + '%' : '-';
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-purple-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-purple-300 mb-2 tracking-wide uppercase">Dönüşüm</div>
          <div className="text-3xl font-bold text-white">-</div>
        </div>
        {/* Google kutuları */}
        <div className="min-w-[260px] bg-gradient-to-br from-cyan-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-cyan-300 mb-2 tracking-wide uppercase">Oturum</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              if (platform === 'google' && Array.isArray(data)) {
                return data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[0]?.value || 0), 0);
              } else if (platform === 'googleads') {
                return '-';
              } else if (platform === 'all' && data?.google) {
                return data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[0]?.value || 0), 0);
              } else {
                return '-';
              }
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-orange-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-orange-300 mb-2 tracking-wide uppercase">Yeni Kullanıcı</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              if (platform === 'google' && Array.isArray(data)) {
                return data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[1]?.value || 0), 0);
              } else if (platform === 'googleads') {
                  return '-';
              } else if (platform === 'all' && data?.google) {
                return data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[1]?.value || 0), 0);
              } else {
                return '-';
              }
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-pink-600 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-pink-200 mb-2 tracking-wide uppercase">Aktif Kullanıcı</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              if (platform === 'google' && Array.isArray(data)) {
                return data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[2]?.value || 0), 0);
              } else if (platform === 'googleads') {
                  return '-';
              } else if (platform === 'all' && data?.google) {
                return data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[2]?.value || 0), 0);
              } else {
                return '-';
              }
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-lime-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-lime-300 mb-2 tracking-wide uppercase">Ortalama Oturum Süresi</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              let totalDuration = 0;
              let totalSessions = 0;
              if (platform === 'google' && Array.isArray(data)) {
                totalDuration = data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[3]?.value || 0), 0);
                totalSessions = data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[0]?.value || 0), 0);
              } else if (platform === 'googleads') {
                  return '-';
              } else if (platform === 'all' && data?.google) {
                totalDuration = data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[3]?.value || 0), 0);
                totalSessions = data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[0]?.value || 0), 0);
              }
              return totalSessions > 0 ? (totalDuration / totalSessions).toFixed(2) + ' sn' : '-';
            })()}
          </div>
        </div>
  <div className="min-w-[260px] bg-gradient-to-br from-fuchsia-700 via-slate-800 to-slate-900 shadow-lg rounded-xl p-6 flex flex-col items-center transition-transform hover:scale-[1.03] border border-slate-700">
          <div className="text-xs font-semibold text-fuchsia-300 mb-2 tracking-wide uppercase">Event Count</div>
          <div className="text-3xl font-bold text-white">
            {(() => {
              if (platform === 'google' && Array.isArray(data)) {
                return data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[4]?.value || 0), 0);
              } else if (platform === 'googleads') {
                  return '-';
              } else if (platform === 'all' && data?.google) {
                return data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[4]?.value || 0), 0);
              } else {
                return '-';
              }
            })()}
          </div>
        </div>
      </div>
      {/* Google */}
      {!loading && !error && platform === 'google' && Array.isArray(data) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-1">Oturum</div>
            <div className="text-2xl font-bold">{data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[0]?.value || 0), 0)}</div>
          </div>
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-1">Yeni Kullanıcı</div>
            <div className="text-2xl font-bold">{data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[1]?.value || 0), 0)}</div>
          </div>
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-1">Aktif Kullanıcı</div>
            <div className="text-2xl font-bold">{data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[2]?.value || 0), 0)}</div>
          </div>
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-1">Ortalama Oturum Süresi</div>
            <div className="text-2xl font-bold">{(() => {
              const totalDuration = data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[3]?.value || 0), 0);
              const totalSessions = data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[0]?.value || 0), 0);
              return totalSessions > 0 ? (totalDuration / totalSessions).toFixed(2) + ' sn' : '-';
            })()}</div>
          </div>
          <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
            <div className="text-xs text-slate-400 mb-1">Event Count</div>
            <div className="text-2xl font-bold">{data.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[4]?.value || 0), 0)}</div>
          </div>
        </div>
      )}
      {/* Tüm */}
      {!loading && !error && platform === 'all' && data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Meta */}
          {Array.isArray(data.meta) && (
            <>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Meta Toplam Harcama</div>
                <div className="text-2xl font-bold">{data.meta.reduce((sum: number, item: any) => sum + Number(item.spend || 0), 0).toLocaleString()} ₺</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Meta Gösterim</div>
                <div className="text-2xl font-bold">{data.meta.reduce((sum: number, item: any) => sum + Number(item.impressions || 0), 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Meta Tıklama</div>
                <div className="text-2xl font-bold">{data.meta.reduce((sum: number, item: any) => sum + Number(item.clicks || 0), 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Meta CTR</div>
                <div className="text-2xl font-bold">
                  {(() => {
                    const totalImpressions = data.meta.reduce((sum: number, item: any) => sum + Number(item.impressions || 0), 0);
                    const totalClicks = data.meta.reduce((sum: number, item: any) => sum + Number(item.clicks || 0), 0);
                    return totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + '%' : '-';
                  })()}
                </div>
              </div>
            </>
          )}
          {/* Google */}
          {Array.isArray(data.google) && (
            <>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Google Oturum</div>
                <div className="text-2xl font-bold">{data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[0]?.value || 0), 0)}</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Google Yeni Kullanıcı</div>
                <div className="text-2xl font-bold">{data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[1]?.value || 0), 0)}</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Google Aktif Kullanıcı</div>
                <div className="text-2xl font-bold">{data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[2]?.value || 0), 0)}</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Google Ortalama Oturum Süresi</div>
                <div className="text-2xl font-bold">{(() => {
                  const totalDuration = data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[3]?.value || 0), 0);
                  const totalSessions = data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[0]?.value || 0), 0);
                  return totalSessions > 0 ? (totalDuration / totalSessions).toFixed(2) + ' sn' : '-';
                })()}</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-white flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">Google Event Count</div>
                <div className="text-2xl font-bold">{data.google.reduce((sum: number, row: any) => sum + Number(row.metricValues?.[4]?.value || 0), 0)}</div>
              </div>
            </>
          )}
        </div>
      )}
      {!loading && !error && (!data || (Array.isArray(data) && data.length === 0)) && (
        <div className="text-slate-400">Veri yok veya bağlantı yapılmadı.</div>
      )}
    </div>
  );
};

export default UnifiedAdWidget;
