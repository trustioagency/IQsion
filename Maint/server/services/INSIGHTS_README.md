# 🔍 AI Insights System - Geliştirme Rehberi

## 📁 Dosya Yapısı

```
Maint/server/services/
└── insightsService.ts    # Tüm anomali detection SQL'leri burada
```

## 🎯 Mevcut Senaryolar

1. **Cost Spike** - Harcama artışı (7 gün, %10+)
2. **CTR Drop** - CTR düşüşü (7 gün, %10+)
3. **Low ROAS** - Düşük ROAS (<3x, min $50)
4. **Zero Conversions** - Sıfır dönüşüm (min $20)
5. **CVR Drop** - Dönüşüm oranı düşüşü (14 gün, %20+)

---

## ➕ Yeni Senaryo Ekleme (Adım Adım)

### Örnek: "CPC Spike" (Tıklama başına maliyet artışı) ekleyelim

### 1️⃣ Config'e Ekle

`insightsService.ts` dosyasında `ANOMALY_CONFIG` objesine yeni senaryo ekle:

```typescript
export const ANOMALY_CONFIG = {
  // ... mevcut senaryolar ...
  
  cpcSpike: {
    enabled: true,
    lookbackDays: 7,
    changeThreshold: 30, // % artış
    highPriorityThreshold: 50,
    minClicks: 100, // Minimum tıklama sayısı
    limit: 3,
  },
};
```

### 2️⃣ Type'a Ekle

```typescript
export type AnomalyType = 
  | 'cost_spike' 
  | 'ctr_drop' 
  | 'low_roas' 
  | 'zero_conversions'
  | 'cpc_spike';  // YENİ!
```

### 3️⃣ SQL Fonksiyonu Yaz

`InsightsService` class'ına yeni private metod ekle:

```typescript
/**
 * 5. CPC Spike Detection
 * Detect accounts with 30%+ CPC increase
 */
private async detectCpcSpikes(userId: string): Promise<Anomaly[]> {
  const config = ANOMALY_CONFIG.cpcSpike;
  
  const query = `
    WITH recent_week AS (
      SELECT 
        source,
        accountId,
        SAFE_DIVIDE(SUM(costMicros), SUM(clicks) * 1000000) as cpc,
        SUM(clicks) as clicks
      FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
      WHERE userId = @userId 
        AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays} DAY)
        AND clicks IS NOT NULL AND costMicros IS NOT NULL
      GROUP BY source, accountId
      HAVING SUM(clicks) > ${config.minClicks}
    ),
    previous_week AS (
      SELECT 
        source,
        accountId,
        SAFE_DIVIDE(SUM(costMicros), SUM(clicks) * 1000000) as cpc
      FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
      WHERE userId = @userId 
        AND date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays * 2} DAY) 
        AND DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays + 1} DAY)
        AND clicks IS NOT NULL AND costMicros IS NOT NULL
      GROUP BY source, accountId
    )
    SELECT 
      r.source,
      r.accountId,
      r.cpc as current_cpc,
      p.cpc as previous_cpc,
      ROUND(((r.cpc - p.cpc) / p.cpc) * 100, 2) as change_pct,
      r.clicks
    FROM recent_week r
    JOIN previous_week p ON r.source = p.source AND r.accountId = p.accountId
    WHERE r.cpc > p.cpc * ${1 + config.changeThreshold / 100}
    ORDER BY change_pct DESC
    LIMIT ${config.limit}
  `;

  const [rows] = await this.bq.query({
    query,
    params: { userId },
    location: process.env.BQ_LOCATION || 'US',
  });

  return rows.map((row: any) => ({
    type: 'cpc_spike',
    priority: row.change_pct > config.highPriorityThreshold ? 'high' : 'medium',
    source: row.source,
    accountId: row.accountId,
    currentCpc: row.current_cpc,
    previousCpc: row.previous_cpc,
    changePct: row.change_pct,
    clicks: row.clicks,
  }));
}
```

### 4️⃣ Ana Fonksiyona Çağrı Ekle

`detectAnomalies()` metoduna yeni senaryoyu ekle:

```typescript
async detectAnomalies(userId: string): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  try {
    // Mevcut senaryolar...
    if (ANOMALY_CONFIG.costSpike.enabled) {
      const costSpikes = await this.detectCostSpikes(userId);
      anomalies.push(...costSpikes);
    }
    
    // ... diğer senaryolar ...
    
    // YENİ SENARYO!
    if (ANOMALY_CONFIG.cpcSpike.enabled) {
      const cpcSpikes = await this.detectCpcSpikes(userId);
      anomalies.push(...cpcSpikes);
    }

    return anomalies;
  } catch (err) {
    console.error('[INSIGHTS] Error:', err);
    return [];
  }
}
```

### 5️⃣ Config Description Ekle

`getConfigDescription()` metoduna case ekle:

```typescript
static getConfigDescription(type: AnomalyType): string {
  const config = ANOMALY_CONFIG[type];
  
  switch (type) {
    // ... mevcut case'ler ...
    
    case 'cpcSpike':
      return `CPC artışı ${config.changeThreshold}%+ (min ${config.minClicks} tıklama)`;
    
    default:
      return '';
  }
}
```

### ✅ Bitti! Deploy Et

```bash
cd Maint
npm run build
gcloud run deploy iqsion-api --source . --region us-central1
```

---

## 🧪 Test Etme

### 1. Config'i Kontrol Et
```bash
curl https://iqsion-api.../api/insights/config
```

### 2. Anomali Detect Et
```bash
curl -X POST https://iqsion-api.../api/insights/detect-anomalies \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user"}'
```

### 3. Full Insights Generate Et
```bash
curl -X POST https://iqsion-api.../api/insights/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user"}'
```

---

## 💡 Örnek Senaryolar (Eklenebilir)

### 1. **Budget Burnout** - Bütçe tükeniyor
```typescript
budgetBurnout: {
  enabled: true,
  lookbackDays: 30,
  burnRateThreshold: 80, // Bütçenin %80'i tükendi
  daysRemaining: 5, // Ay bitmeden 5 gün kaldı
  limit: 5,
}
```

### 2. **Audience Fatigue** - Kitle yorulması
```typescript
audienceFatigue: {
  enabled: true,
  lookbackDays: 14,
  frequencyThreshold: 5, // Kullanıcı başına 5+ gösterim
  ctrDropThreshold: 30, // %30 CTR düşüşü
  limit: 3,
}
```

### 3. **Ad Rejection** - Reklam reddi
```typescript
adRejection: {
  enabled: true,
  lookbackDays: 7,
  minRejections: 3,
  priority: 'high' as const,
  limit: 5,
}
```

### 4. **Competitor Price Drop** - Rakip fiyat düşüşü
```typescript
competitorPriceDrop: {
  enabled: true,
  lookbackDays: 1,
  priceDropThreshold: 10, // %10+ düşüş
  priority: 'high' as const,
  limit: 10,
}
```

### 5. **Seasonal Trend** - Sezonsal trend
```typescript
seasonalTrend: {
  enabled: true,
  compareYearAgo: true,
  changeThreshold: 50, // %50+ artış/düşüş
  minSamples: 7, // Min 7 günlük veri
  limit: 5,
}
```

---

## ⚙️ Config Parametreleri

| Parametre | Tip | Açıklama | Örnek |
|-----------|-----|----------|-------|
| `enabled` | boolean | Senaryo aktif mi? | `true` |
| `lookbackDays` | number | Kaç gün geriye bak | `7` |
| `changeThreshold` | number | Değişim eşiği (%) | `20` |
| `highPriorityThreshold` | number | Yüksek öncelik eşiği | `50` |
| `minSpendUsd` | number | Min harcama ($) | `100` |
| `minClicks` | number | Min tıklama | `1000` |
| `limit` | number | Max sonuç sayısı | `3` |
| `priority` | string | Sabit öncelik | `'high'` |

---

## 📊 BigQuery Tablo Yapısı

`metrics_daily` tablosu kolonları:
- `userId` - Kullanıcı ID
- `date` - Tarih (DATE)
- `source` - Kaynak (meta_ads, google_ads, shopify, ga4)
- `accountId` - Hesap ID
- `costMicros` - Maliyet (mikro)
- `revenueMicros` - Gelir (mikro)
- `clicks` - Tıklama
- `impressions` - Gösterim
- `conversions` - Dönüşüm
- `transactions` - İşlem

---

## 🚨 Best Practices

1. ✅ **Her zaman `SAFE_DIVIDE` kullan** - Sıfıra bölme hatası önler
2. ✅ **`HAVING` ile minimum threshold** - Anlamsız sonuçları filtreler
3. ✅ **`LIMIT` ekle** - Maliyet kontrolü
4. ✅ **`IS NOT NULL` kontrolü** - Eksik veri sorununu önler
5. ✅ **`enabled` flag kullan** - Kolayca açıp kapatabilirsin
6. ✅ **Config'den değer al** - Hard-coded değer kullanma
7. ✅ **Try-catch kullan** - Hata bir senaryoyu patlatmasın

---

## 🔧 Troubleshooting

### Anomali bulunamıyor
- BigQuery'de veri var mı kontrol et
- Threshold'lar çok yüksek olabilir (düşür)
- `lookbackDays` çok uzun olabilir (kısalt)
- `enabled: false` olabilir

### SQL hatası
- BigQuery Console'da SQL'i test et
- `@userId` parametresini kontrol et
- Tablo/kolon adlarını doğrula

### AI insight oluşmuyor
- Gemini API key kontrolü
- `analyzeAnomaliesWithAI()` loglarına bak
- Token limiti aşılmış olabilir

---

## 📚 Kaynaklar

- [BigQuery SQL Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax)
- [Google Gemini API](https://ai.google.dev/docs)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)

---

**Son Güncelleme:** 27 Aralık 2025
**Geliştirici:** IQsion AI Team
