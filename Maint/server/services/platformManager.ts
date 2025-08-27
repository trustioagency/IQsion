
import { storage } from '../storage';
import { PlatformServiceFactory, PlatformDataPoint } from './platformService';
import { InsertRawEvent, InsertMarketingMetric } from '@shared/schema';

export class PlatformManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async syncAllPlatforms(startDate: string, endDate: string): Promise<void> {
    const connections = await storage.getPlatformConnections(this.userId);
    const activeConnections = connections.filter(conn => conn.isConnected);

    for (const connection of activeConnections) {
      try {
        await this.syncPlatform(connection.platform, startDate, endDate);
        
        // Update last sync time
        await storage.updatePlatformConnection(connection.id, {
          lastSyncAt: new Date(),
        });
      } catch (error) {
        console.error(`Error syncing ${connection.platform}:`, error);
      }
    }
  }

  private async syncPlatform(platform: string, startDate: string, endDate: string): Promise<void> {
    const connection = await this.getPlatformConnection(platform);
    if (!connection) return;

    const credentials = {
      accessToken: connection.accessToken || '',
      refreshToken: connection.refreshToken || '',
      accountId: connection.accountId || '',
    };

    const service = PlatformServiceFactory.create(platform, credentials);
    
    // Check if token is valid
    const isValid = await service.isTokenValid();
    if (!isValid) {
      console.error(`Invalid token for platform: ${platform}`);
      return;
    }

    // Fetch metrics
    const metrics = await service.fetchMetrics(startDate, endDate);
    
    // Store raw events for attribution analysis
    await this.storeRawEvents(metrics);
    
    // Store aggregated marketing metrics
    await this.storeMarketingMetrics(metrics);
  }

  private async storeRawEvents(dataPoints: PlatformDataPoint[]): Promise<void> {
    for (const point of dataPoints) {
      // Convert data points to raw events for attribution analysis
      if (point.metric === 'clicks' || point.metric === 'impressions' || point.metric === 'conversions') {
        const rawEvent: InsertRawEvent = {
          userId: this.userId,
          sessionId: crypto.randomUUID(),
          customerId: 'unknown', // This would come from actual tracking
          eventType: this.mapMetricToEventType(point.metric),
          platform: this.mapPlatformName(point.platform),
          campaignId: point.campaignId,
          campaignName: point.campaignName,
          revenue: point.metric === 'conversions' ? point.value : null,
          eventTimestamp: new Date(point.date),
        };

        await storage.insertRawEvent(rawEvent);
      }
    }
  }

  private async storeMarketingMetrics(dataPoints: PlatformDataPoint[]): Promise<void> {
    // Group data points by date and platform for aggregation
    const grouped = dataPoints.reduce((acc, point) => {
      const key = `${point.date}-${point.platform}`;
      if (!acc[key]) {
        acc[key] = {
          date: point.date,
          platform: point.platform,
          metrics: {},
        };
      }
      acc[key].metrics[point.metric] = (acc[key].metrics[point.metric] || 0) + point.value;
      return acc;
    }, {} as any);

    for (const item of Object.values(grouped) as any[]) {
      const metrics = item.metrics;
      
      const marketingMetric: InsertMarketingMetric = {
        userId: this.userId,
        platform: this.mapPlatformName(item.platform),
        metricDate: new Date(item.date),
        revenue: metrics.revenue || metrics.conversion_value || null,
        adSpend: metrics.spend || metrics.cost || null,
        roas: metrics.revenue && metrics.spend ? metrics.revenue / metrics.spend : null,
        conversions: Math.round(metrics.conversions || 0),
        clicks: Math.round(metrics.clicks || 0),
        impressions: Math.round(metrics.impressions || 0),
        ctr: metrics.ctr || (metrics.clicks && metrics.impressions ? metrics.clicks / metrics.impressions : null),
        cpc: metrics.cpc || (metrics.spend && metrics.clicks ? metrics.spend / metrics.clicks : null),
        cpa: metrics.conversion_cost || (metrics.spend && metrics.conversions ? metrics.spend / metrics.conversions : null),
      };

      await storage.insertMarketingMetric(marketingMetric);
    }
  }

  private mapMetricToEventType(metric: string): string {
    switch (metric) {
      case 'impressions': return 'impression';
      case 'clicks': return 'click';
      case 'conversions': return 'purchase';
      default: return 'visit';
    }
  }

  private mapPlatformName(platform: string): string {
    switch (platform) {
      case 'google_ads': return 'google';
      case 'google_analytics': return 'google';
      case 'google_search_console': return 'google';
      case 'meta': return 'meta';
      case 'tiktok': return 'tiktok';
      case 'shopify': return 'shopify';
      default: return platform;
    }
  }

  private async getPlatformConnection(platform: string) {
    const connections = await storage.getPlatformConnections(this.userId);
    return connections.find(conn => conn.platform === platform && conn.isConnected);
  }

  async testConnection(platform: string): Promise<boolean> {
    const connection = await this.getPlatformConnection(platform);
    if (!connection) return false;

    try {
      const credentials = {
        accessToken: connection.accessToken || '',
        refreshToken: connection.refreshToken || '',
        accountId: connection.accountId || '',
      };

      const service = PlatformServiceFactory.create(platform, credentials);
      return await service.authenticate();
    } catch (error) {
      console.error(`Connection test failed for ${platform}:`, error);
      return false;
    }
  }
}
