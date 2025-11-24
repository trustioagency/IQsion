import { BasePlatformService, PlatformCredentials, PlatformDataPoint } from './platformService';

export class GoogleAdsService extends BasePlatformService {
  private readonly baseUrl = 'https://googleads.googleapis.com/v14';

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/customers:listAccessibleCustomers`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Google Ads authentication failed:', error);
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
          client_id: process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
          refresh_token: this.credentials.refreshToken || '',
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing Google Ads token:', error);
      return this.credentials.accessToken;
    }
  }

  async fetchMetrics(startDate: string, endDate: string): Promise<PlatformDataPoint[]> {
    try {
      const query = `
        SELECT 
          segments.date,
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value
        FROM campaign 
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;

      const response = await fetch(`${this.baseUrl}/customers/${this.credentials.accountId}/googleAds:searchStream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const dataPoints: PlatformDataPoint[] = [];

      if (response.ok) {
        const data = await response.json();

        data.results?.forEach((result: any) => {
          const date = result.segments.date;
          const campaignId = result.campaign.id;
          const campaignName = result.campaign.name;

          dataPoints.push(
            {
              date,
              metric: 'impressions',
              value: parseInt(result.metrics.impressions),
              platform: 'google_ads',
              campaignId,
              campaignName,
            },
            {
              date,
              metric: 'clicks',
              value: parseInt(result.metrics.clicks),
              platform: 'google_ads',
              campaignId,
              campaignName,
            },
            {
              date,
              metric: 'spend',
              value: parseInt(result.metrics.cost_micros) / 1000000,
              platform: 'google_ads',
              campaignId,
              campaignName,
            },
            {
              date,
              metric: 'conversions',
              value: parseFloat(result.metrics.conversions),
              platform: 'google_ads',
              campaignId,
              campaignName,
            }
          );
        });
      }

      return dataPoints;
    } catch (error) {
      console.error('Error fetching Google Ads metrics:', error);
      return [];
    }
  }

  async fetchCampaigns(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status
        FROM campaign
      `;

      const response = await fetch(`${this.baseUrl}/customers/${this.credentials.accountId}/googleAds:search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching Google Ads campaigns:', error);
      return [];
    }
  }

  async isTokenValid(): Promise<boolean> {
    return await this.authenticate();
  }
}