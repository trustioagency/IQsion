import { BigQuery } from '@google-cloud/bigquery';

// Anomaly Detection Configuration
export const ANOMALY_CONFIG = {
  costSpike: {
    enabled: true,
    lookbackDays: 7,
    changeThreshold: 10,
    highPriorityThreshold: 30,
    limit: 5,
  },
  ctrDrop: {
    enabled: true,
    lookbackDays: 7,
    changeThreshold: 5, // % düşüş (düşürüldü: 10 → 5)
    highPriorityThreshold: 15, // % düşüş (düşürüldü: 20 → 15)
    minImpressions: 100, // düşürüldü: 500 → 100
    limit: 5,
  },
  lowRoas: {
    enabled: true,
    lookbackDays: 7,
    roasThreshold: 5.0, // artırıldı: 3.0 → 5.0 (daha agresif)
    highPriorityThreshold: 2.0, // artırıldı: 1.5 → 2.0
    minSpendUsd: 20, // düşürüldü: 50 → 20
    limit: 5,
  },
  zeroConversions: {
    enabled: true,
    lookbackDays: 7,
    minSpendUsd: 20, // düşürüldü: 50 → 20
    priority: 'high' as const,
    limit: 5,
  },
  cvrDrop: {
    enabled: false, // TEMPORARILY DISABLED
    lookbackDays: 14,
    changeThreshold: 20, // % düşüş
    highPriorityThreshold: 30, // % düşüş
    minClicks: 100,
    limit: 5,
  },
  cpcSpike: {
    enabled: true,
    lookbackDays: 7,
    changeThreshold: 15, // % artış (düşürüldü: 30 → 15)
    highPriorityThreshold: 30, // % artış (düşürüldü: 50 → 30)
    minClicks: 50, // Minimum tıklama sayısı (düşürüldü: 100 → 50)
    limit: 5,
  },
  impressionDrop: {
    enabled: true,
    lookbackDays: 7,
    changeThreshold: 20, // % düşüş (düşürüldü: 40 → 20)
    highPriorityThreshold: 40, // % düşüş (düşürüldü: 60 → 40)
    minImpressions: 500, // Minimum gösterim (düşürüldü: 1000 → 500)
    limit: 5,
  },
};

export type AnomalyType = 'cost_spike' | 'ctr_drop' | 'low_roas' | 'zero_conversions' | 'cvr_drop' | 'cpc_spike' | 'impression_drop';
export type AnomalyPriority = 'high' | 'medium' | 'low';

export interface Anomaly {
  type: AnomalyType;
  priority: AnomalyPriority;
  source: string;
  accountId: string;
  [key: string]: any;
}

export class InsightsService {
  private bq: BigQuery;
  private dataset: string;

  constructor(bigquery: BigQuery, dataset = 'iqsion') {
    this.bq = bigquery;
    this.dataset = dataset;
  }

  /**
   * Detect all anomalies for a user
   */
  async detectAnomalies(userId: string): Promise<Anomaly[]> {
    console.log(`[INSIGHTS] detectAnomalies called for user: ${userId}`);
    const anomalies: Anomaly[] = [];

    try {
      // 1. Cost Spike Detection
      if (ANOMALY_CONFIG.costSpike.enabled) {
        try {
          console.log('[INSIGHTS] Detecting cost spikes...');
          const costSpikes = await this.detectCostSpikes(userId);
          console.log(`[INSIGHTS] Found ${costSpikes.length} cost spikes`);
          anomalies.push(...costSpikes);
        } catch (err: any) {
          console.error('[INSIGHTS] Error in detectCostSpikes:', err.message);
        }
      }

      // 2. CTR Drop Detection
      if (ANOMALY_CONFIG.ctrDrop.enabled) {
        try {
          console.log('[INSIGHTS] Detecting CTR drops...');
          const ctrDrops = await this.detectCtrDrops(userId);
          console.log(`[INSIGHTS] Found ${ctrDrops.length} CTR drops`);
          anomalies.push(...ctrDrops);
        } catch (err: any) {
          console.error('[INSIGHTS] Error in detectCtrDrops:', err.message);
        }
      }

      // 3. Low ROAS Detection
      if (ANOMALY_CONFIG.lowRoas.enabled) {
        try {
          console.log('[INSIGHTS] Detecting low ROAS...');
          const lowRoas = await this.detectLowRoas(userId);
          console.log(`[INSIGHTS] Found ${lowRoas.length} low ROAS`);
          anomalies.push(...lowRoas);
        } catch (err: any) {
          console.error('[INSIGHTS] Error in detectLowRoas:', err.message);
        }
      }

      // 4. Zero Conversions Detection
      if (ANOMALY_CONFIG.zeroConversions.enabled) {
        try {
          console.log('[INSIGHTS] Detecting zero conversions...');
          const zeroConv = await this.detectZeroConversions(userId);
          console.log(`[INSIGHTS] Found ${zeroConv.length} zero conversions`);
          anomalies.push(...zeroConv);
        } catch (err: any) {
          console.error('[INSIGHTS] Error in detectZeroConversions:', err.message);
        }
      }

      // 5. Conversion Rate Drop Detection - DISABLED
      // if (ANOMALY_CONFIG.cvrDrop.enabled) {
      //   const cvrDrops = await this.detectConversionRateDrops(userId);
      //   anomalies.push(...cvrDrops);
      // }

      // 6. CPC Spike Detection
      if (ANOMALY_CONFIG.cpcSpike.enabled) {
        try {
          console.log('[INSIGHTS] Detecting CPC spikes...');
          const cpcSpikes = await this.detectCpcSpikes(userId);
          console.log(`[INSIGHTS] Found ${cpcSpikes.length} CPC spikes`);
          anomalies.push(...cpcSpikes);
        } catch (err: any) {
          console.error('[INSIGHTS] Error in detectCpcSpikes:', err.message);
        }
      }

      // 7. Impression Drop Detection
      if (ANOMALY_CONFIG.impressionDrop.enabled) {
        try {
          console.log('[INSIGHTS] Detecting impression drops...');
          const impressionDrops = await this.detectImpressionDrops(userId);
          console.log(`[INSIGHTS] Found ${impressionDrops.length} impression drops`);
          anomalies.push(...impressionDrops);
        } catch (err: any) {
          console.error('[INSIGHTS] Error in detectImpressionDrops:', err.message);
        }
      }

      console.log(`[INSIGHTS] Detected ${anomalies.length} anomalies for user ${userId}`);
      return anomalies;
    } catch (err) {
      console.error('[INSIGHTS] Error detecting anomalies:', err);
      return [];
    }
  }

  /**
   * 1. Cost Spike Detection
   * Detect accounts with 20%+ cost increase week-over-week
   */
  private async detectCostSpikes(userId: string): Promise<Anomaly[]> {
    const config = ANOMALY_CONFIG.costSpike;
    console.log(`[INSIGHTS] detectCostSpikes: projectId=${this.bq.projectId}, dataset=${this.dataset}`);
    
    const query = `
      WITH recent_week AS (
        SELECT 
          source,
          accountId,
          SUM(costMicros)/1000000 as cost
        FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
        WHERE userId = @userId 
          AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays} DAY)
          AND costMicros IS NOT NULL
        GROUP BY source, accountId
      ),
      previous_week AS (
        SELECT 
          source,
          accountId,
          SUM(costMicros)/1000000 as cost
        FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
        WHERE userId = @userId 
          AND date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays * 2} DAY) 
          AND DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays + 1} DAY)
          AND costMicros IS NOT NULL
        GROUP BY source, accountId
      )
      SELECT 
        r.source,
        r.accountId,
        r.cost as current_cost,
        p.cost as previous_cost,
        ROUND(((r.cost - p.cost) / p.cost) * 100, 2) as change_pct
      FROM recent_week r
      JOIN previous_week p ON r.source = p.source AND r.accountId = p.accountId
      WHERE r.cost > p.cost * ${1 + config.changeThreshold / 100}
      ORDER BY change_pct DESC
      LIMIT ${config.limit}
    `;

    console.log(`[INSIGHTS] Running query for userId=${userId}`);
    
    const [rows] = await this.bq.query({
      query,
      params: { userId },
      location: process.env.BQ_LOCATION || 'US',
    });

    console.log(`[INSIGHTS] Query returned ${rows.length} rows`);

    return rows.map((row: any) => ({
      type: 'cost_spike',
      priority: row.change_pct > config.highPriorityThreshold ? 'high' : 'medium',
      source: row.source,
      accountId: row.accountId,
      currentCost: row.current_cost,
      previousCost: row.previous_cost,
      changePct: row.change_pct,
    }));
  }

  /**
   * 2. CTR Drop Detection
   * Detect accounts with 20%+ CTR decrease
   */
  private async detectCtrDrops(userId: string): Promise<Anomaly[]> {
    const config = ANOMALY_CONFIG.ctrDrop;
    const query = `
      WITH recent_week AS (
        SELECT 
          source,
          accountId,
          SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100 as ctr,
          SUM(clicks) as clicks,
          SUM(impressions) as impressions
        FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
        WHERE userId = @userId 
          AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays} DAY)
          AND clicks IS NOT NULL AND impressions IS NOT NULL
        GROUP BY source, accountId
        HAVING SUM(impressions) > ${config.minImpressions}
      ),
      previous_week AS (
        SELECT 
          source,
          accountId,
          SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100 as ctr
        FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
        WHERE userId = @userId 
          AND date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays * 2} DAY) 
          AND DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays + 1} DAY)
          AND clicks IS NOT NULL AND impressions IS NOT NULL
        GROUP BY source, accountId
      )
      SELECT 
        r.source,
        r.accountId,
        r.ctr as current_ctr,
        p.ctr as previous_ctr,
        ROUND(((r.ctr - p.ctr) / p.ctr) * 100, 2) as change_pct,
        r.clicks,
        r.impressions
      FROM recent_week r
      JOIN previous_week p ON r.source = p.source AND r.accountId = p.accountId
      WHERE r.ctr < p.ctr * ${1 - config.changeThreshold / 100}
      ORDER BY ABS(change_pct) DESC
      LIMIT ${config.limit}
    `;

    const [rows] = await this.bq.query({
      query,
      params: { userId },
      location: process.env.BQ_LOCATION || 'US',
    });

    return rows.map((row: any) => ({
      type: 'ctr_drop',
      priority: Math.abs(row.change_pct) > config.highPriorityThreshold ? 'high' : 'medium',
      source: row.source,
      accountId: row.accountId,
      currentCtr: row.current_ctr,
      previousCtr: row.previous_ctr,
      changePct: row.change_pct,
      clicks: row.clicks,
      impressions: row.impressions,
    }));
  }

  /**
   * 3. Low ROAS Detection
   * Detect accounts with ROAS < 2.0x
   */
  private async detectLowRoas(userId: string): Promise<Anomaly[]> {
    const config = ANOMALY_CONFIG.lowRoas;
    const minSpendMicros = config.minSpendUsd * 1000000;
    
    const query = `
      WITH recent_metrics AS (
        SELECT 
          source,
          accountId,
          SUM(costMicros)/1000000 as cost,
          SUM(revenueMicros)/1000000 as revenue,
          SAFE_DIVIDE(SUM(revenueMicros), SUM(costMicros)) as roas
        FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
        WHERE userId = @userId 
          AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays} DAY)
          AND costMicros IS NOT NULL 
          AND revenueMicros IS NOT NULL
          AND revenueMicros > 0
        GROUP BY source, accountId
        HAVING SUM(costMicros) > ${minSpendMicros}
      )
      SELECT 
        source,
        accountId,
        cost,
        revenue,
        ROUND(roas, 2) as roas
      FROM recent_metrics
      WHERE roas < ${config.roasThreshold}
      ORDER BY cost DESC
      LIMIT ${config.limit}
    `;

    const [rows] = await this.bq.query({
      query,
      params: { userId },
      location: process.env.BQ_LOCATION || 'US',
    });

    return rows.map((row: any) => ({
      type: 'low_roas',
      priority: row.roas < config.highPriorityThreshold ? 'high' : 'medium',
      source: row.source,
      accountId: row.accountId,
      cost: row.cost,
      revenue: row.revenue,
      roas: row.roas,
    }));
  }

  /**
   * 4. Zero Conversions Detection
   * Detect high-spend accounts with zero transactions
   */
  private async detectZeroConversions(userId: string): Promise<Anomaly[]> {
    const config = ANOMALY_CONFIG.zeroConversions;
    const minSpendMicros = config.minSpendUsd * 1000000;
    
    const query = `
      SELECT 
        source,
        accountId,
        SUM(costMicros)/1000000 as cost,
        SUM(COALESCE(transactions, 0)) as transactions,
        SUM(clicks) as clicks
      FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
      WHERE userId = @userId 
        AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays} DAY)
        AND costMicros > ${minSpendMicros}
      GROUP BY source, accountId
      HAVING SUM(COALESCE(transactions, 0)) = 0
      ORDER BY cost DESC
      LIMIT ${config.limit}
    `;

    const [rows] = await this.bq.query({
      query,
      params: { userId },
      location: process.env.BQ_LOCATION || 'US',
    });

    return rows.map((row: any) => ({
      type: 'zero_conversions',
      priority: config.priority,
      source: row.source,
      accountId: row.accountId,
      cost: row.cost,
      clicks: row.clicks,
    }));
  }

  /**
   * 5. Conversion Rate Drop Detection
   * Detect campaigns with 20%+ conversion rate decrease week-over-week
   */
  private async detectConversionRateDrops(userId: string): Promise<Anomaly[]> {
    const config = ANOMALY_CONFIG.cvrDrop;
    const query = `
      WITH recent_data AS (
        SELECT
          accountId,
          DATE(date) as metric_date,
          source,
          SUM(clicks) as clicks,
          SUM(COALESCE(transactions, 0)) as conversions
        FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
        WHERE userId = @userId
          AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays} DAY)
          AND clicks > 0
        GROUP BY accountId, metric_date, source
      ),
      week_comparison AS (
        SELECT
          accountId,
          source,
          SAFE_DIVIDE(
            SUM(CASE WHEN metric_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) THEN conversions END),
            SUM(CASE WHEN metric_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) THEN clicks END)
          ) * 100 as recent_cvr,
          SAFE_DIVIDE(
            SUM(CASE WHEN metric_date < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) THEN conversions END),
            SUM(CASE WHEN metric_date < DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) THEN clicks END)
          ) * 100 as previous_cvr,
          SUM(CASE WHEN metric_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) THEN clicks END) as recent_clicks
        FROM recent_data
        GROUP BY accountId, source
      )
      SELECT
        accountId,
        source,
        recent_cvr,
        previous_cvr,
        recent_clicks,
        SAFE_DIVIDE(recent_cvr - previous_cvr, previous_cvr) * 100 as cvr_change_pct
      FROM week_comparison
      WHERE previous_cvr IS NOT NULL
        AND recent_cvr IS NOT NULL
        AND previous_cvr > 0
        AND recent_clicks >= ${config.minClicks}
        AND SAFE_DIVIDE(recent_cvr - previous_cvr, previous_cvr) <= -${config.changeThreshold / 100}
      ORDER BY cvr_change_pct ASC
      LIMIT ${config.limit}
    `;

    const [rows] = await this.bq.query({
      query,
      params: { userId },
      location: process.env.BQ_LOCATION || 'US',
    });

    return rows.map((row: any) => {
      const changePct = row.cvr_change_pct;
      const priority: 'high' | 'medium' | 'low' =
        changePct <= -config.highPriorityThreshold ? 'high' :
        changePct <= -config.changeThreshold ? 'medium' : 'low';

      return {
        type: 'cvr_drop',
        priority,
        source: row.source,
        accountId: row.accountId,
        recent_cvr: row.recent_cvr,
        previous_cvr: row.previous_cvr,
        cvr_change_pct: changePct,
        recent_clicks: row.recent_clicks,
      };
    });
  }

  /**
   * 6. CPC Spike Detection
   * Detect accounts with 30%+ CPC increase week-over-week
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

  /**
   * 7. Impression Drop Detection
   * Detect accounts with 40%+ impression decrease week-over-week
   */
  private async detectImpressionDrops(userId: string): Promise<Anomaly[]> {
    const config = ANOMALY_CONFIG.impressionDrop;
    
    const query = `
      WITH recent_week AS (
        SELECT 
          source,
          accountId,
          SUM(impressions) as impressions
        FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
        WHERE userId = @userId 
          AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays} DAY)
          AND impressions IS NOT NULL
        GROUP BY source, accountId
        HAVING SUM(impressions) > ${config.minImpressions}
      ),
      previous_week AS (
        SELECT 
          source,
          accountId,
          SUM(impressions) as impressions
        FROM \`${this.bq.projectId}.${this.dataset}.metrics_daily\`
        WHERE userId = @userId 
          AND date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays * 2} DAY) 
          AND DATE_SUB(CURRENT_DATE(), INTERVAL ${config.lookbackDays + 1} DAY)
          AND impressions IS NOT NULL
        GROUP BY source, accountId
      )
      SELECT 
        r.source,
        r.accountId,
        r.impressions as current_impressions,
        p.impressions as previous_impressions,
        ROUND(((r.impressions - p.impressions) / p.impressions) * 100, 2) as change_pct
      FROM recent_week r
      JOIN previous_week p ON r.source = p.source AND r.accountId = p.accountId
      WHERE r.impressions < p.impressions * ${1 - config.changeThreshold / 100}
      ORDER BY change_pct ASC
      LIMIT ${config.limit}
    `;

    const [rows] = await this.bq.query({
      query,
      params: { userId },
      location: process.env.BQ_LOCATION || 'US',
    });

    return rows.map((row: any) => ({
      type: 'impression_drop',
      priority: Math.abs(row.change_pct) > config.highPriorityThreshold ? 'high' : 'medium',
      source: row.source,
      accountId: row.accountId,
      currentImpressions: row.current_impressions,
      previousImpressions: row.previous_impressions,
      changePct: row.change_pct,
    }));
  }

  /**
   * Get human-readable description for anomaly configuration
   */
  static getConfigDescription(type: AnomalyType): string {
    // Map snake_case type to camelCase config key
    const configKey = type.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const config = ANOMALY_CONFIG[configKey as keyof typeof ANOMALY_CONFIG];
    
    if (!config) return '';
    
    switch (type) {
      case 'cost_spike':
        return `Cost artışı ${(config as any).changeThreshold}%+ (${config.lookbackDays} gün)`;
      case 'ctr_drop':
        return `CTR düşüşü ${(config as any).changeThreshold}%+ (min ${(config as any).minImpressions} gösterim)`;
      case 'low_roas':
        return `ROAS < ${(config as any).roasThreshold}x (min $${(config as any).minSpendUsd} harcama)`;
      case 'zero_conversions':
        return `Sıfır dönüşüm (min $${(config as any).minSpendUsd} harcama)`;
      case 'cvr_drop':
        return `Dönüşüm oranı düşüşü ${(config as any).changeThreshold}%+ (min ${(config as any).minClicks} tıklama)`;
      case 'cpc_spike':
        return `CPC artışı ${(config as any).changeThreshold}%+ (min ${(config as any).minClicks} tıklama)`;
      case 'impression_drop':
        return `Gösterim düşüşü ${(config as any).changeThreshold}%+ (min ${(config as any).minImpressions} gösterim)`;
      default:
        return '';
    }
  }
}
