
import { BasePlatformService, PlatformCredentials, PlatformDataPoint } from './platformService';
import crypto from 'crypto';

export class TikTokAdsService extends BasePlatformService {
  private readonly baseUrl = 'https://business-api.tiktok.com/open_api/v1.3';
  private advertiserId: string;
  private appId: string;
  private secret: string;

  constructor(credentials: PlatformCredentials & { advertiserId: string; appId: string; secret: string }) {
    super(credentials);
    this.advertiserId = (credentials as any).advertiserId;
    this.appId = (credentials as any).appId;
    this.secret = (credentials as any).secret;
  }

  private generateSignature(path: string, timestamp: number): string {
    const message = this.secret + path + timestamp;
    return crypto.createHmac('sha256', this.secret).update(message).digest('hex');
  }

  async authenticate(): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const path = '/oauth2/advertiser/get/';
      const signature = this.generateSignature(path, timestamp);

      const response = await fetch(
        `${this.baseUrl}${path}`,
        {
          method: 'GET',
          headers: {
            'Access-Token': this.credentials.accessToken,
            'X-Tt-Logid': crypto.randomUUID(),
            'Content-Type': 'application/json',
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error('TikTok Ads authentication failed:', error);
      return false;
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth2/refresh_token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.appId,
          secret: this.secret,
          refresh_token: this.credentials.refreshToken,
        }),
      });

      const data = await response.json();
      if (data.code === 0) {
        this.credentials.accessToken = data.data.access_token;
        return data.data.access_token;
      }
      throw new Error('Failed to refresh TikTok token');
    } catch (error) {
      console.error('Error refreshing TikTok Ads token:', error);
      throw error;
    }
  }

  async isTokenValid(): Promise<boolean> {
    return this.authenticate();
  }

  async fetchMetrics(startDate: string, endDate: string): Promise<PlatformDataPoint[]> {
    const metrics: PlatformDataPoint[] = [];

    try {
      const requestBody = {
        advertiser_id: this.advertiserId,
        report_type: 'BASIC',
        data_level: 'AUCTION_CAMPAIGN',
        dimensions: ['campaign_id', 'stat_time_day'],
        metrics: [
          'spend',
          'impressions',
          'clicks',
          'ctr',
          'cpc',
          'conversions',
          'conversion_rate',
          'conversion_cost'
        ],
        start_date: startDate,
        end_date: endDate,
        page: 1,
        page_size: 1000,
      };

      const response = await fetch(
        `${this.baseUrl}/report/integrated/get/`,
        {
          method: 'POST',
          headers: {
            'Access-Token': this.credentials.accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.code === 0 && data.data?.list) {
          data.data.list.forEach((item: any) => {
            const date = item.dimensions.stat_time_day;
            const campaignId = item.dimensions.campaign_id;

            metrics.push(
              {
                date,
                metric: 'spend',
                value: parseFloat(item.metrics.spend || '0'),
                platform: 'tiktok',
                campaignId,
              },
              {
                date,
                metric: 'impressions',
                value: parseInt(item.metrics.impressions || '0'),
                platform: 'tiktok',
                campaignId,
              },
              {
                date,
                metric: 'clicks',
                value: parseInt(item.metrics.clicks || '0'),
                platform: 'tiktok',
                campaignId,
              },
              {
                date,
                metric: 'ctr',
                value: parseFloat(item.metrics.ctr || '0'),
                platform: 'tiktok',
                campaignId,
              },
              {
                date,
                metric: 'cpc',
                value: parseFloat(item.metrics.cpc || '0'),
                platform: 'tiktok',
                campaignId,
              },
              {
                date,
                metric: 'conversions',
                value: parseFloat(item.metrics.conversions || '0'),
                platform: 'tiktok',
                campaignId,
              }
            );
          });
        }
      }
    } catch (error) {
      console.error('Error fetching TikTok Ads metrics:', error);
    }

    return metrics;
  }

  async fetchCampaigns(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/campaign/get/?advertiser_id=${this.advertiserId}`,
        {
          headers: {
            'Access-Token': this.credentials.accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.data?.list || [];
      }
    } catch (error) {
      console.error('Error fetching TikTok Ads campaigns:', error);
    }
    return [];
  }
}
