
import { BasePlatformService, PlatformCredentials, PlatformDataPoint } from './platformService';

export class GoogleSearchConsoleService extends BasePlatformService {
  private readonly baseUrl = 'https://searchconsole.googleapis.com/webmasters/v3';
  private siteUrl: string;

  constructor(credentials: PlatformCredentials & { siteUrl: string }) {
    super(credentials);
    this.siteUrl = (credentials as any).siteUrl;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sites`,
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error('Google Search Console authentication failed:', error);
      return false;
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          refresh_token: this.credentials.refreshToken || '',
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      this.credentials.accessToken = data.access_token;
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing Google Search Console token:', error);
      throw error;
    }
  }

  async isTokenValid(): Promise<boolean> {
    if (this.credentials.expiresAt && new Date() > this.credentials.expiresAt) {
      try {
        await this.refreshAccessToken();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  async fetchMetrics(startDate: string, endDate: string): Promise<PlatformDataPoint[]> {
    const metrics: PlatformDataPoint[] = [];

    try {
      const requestBody = {
        startDate,
        endDate,
        dimensions: ['date', 'query'],
        rowLimit: 1000,
      };

      const response = await fetch(
        `${this.baseUrl}/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        data.rows?.forEach((row: any) => {
          const date = row.keys[0];
          const query = row.keys[1];

          metrics.push(
            {
              date,
              metric: 'impressions',
              value: row.impressions || 0,
              platform: 'google_search_console',
              campaignName: query,
            },
            {
              date,
              metric: 'clicks',
              value: row.clicks || 0,
              platform: 'google_search_console',
              campaignName: query,
            },
            {
              date,
              metric: 'ctr',
              value: row.ctr || 0,
              platform: 'google_search_console',
              campaignName: query,
            },
            {
              date,
              metric: 'position',
              value: row.position || 0,
              platform: 'google_search_console',
              campaignName: query,
            }
          );
        });
      }
    } catch (error) {
      console.error('Error fetching Google Search Console metrics:', error);
    }

    return metrics;
  }

  async fetchCampaigns(): Promise<any[]> {
    // Search Console doesn't have campaigns, return top queries
    try {
      const requestBody = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        dimensions: ['query'],
        rowLimit: 100,
      };

      const response = await fetch(
        `${this.baseUrl}/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.rows?.map((row: any) => ({
          query: row.keys[0],
          impressions: row.impressions,
          clicks: row.clicks,
          ctr: row.ctr,
          position: row.position,
        })) || [];
      }
    } catch (error) {
      console.error('Error fetching Google Search Console queries:', error);
    }
    return [];
  }
}
