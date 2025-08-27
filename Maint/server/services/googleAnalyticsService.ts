
import { BasePlatformService, PlatformCredentials, PlatformDataPoint } from './platformService';

export class GoogleAnalyticsService extends BasePlatformService {
  private readonly baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
  private propertyId: string;

  constructor(credentials: PlatformCredentials & { propertyId: string }) {
    super(credentials);
    this.propertyId = (credentials as any).propertyId;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/properties/${this.propertyId}/metadata`,
        {
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error('Google Analytics authentication failed:', error);
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
      console.error('Error refreshing Google Analytics token:', error);
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
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'users' },
          { name: 'pageviews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'conversions' },
          { name: 'totalRevenue' }
        ],
        dimensions: [
          { name: 'date' },
          { name: 'sourceMedium' }
        ],
      };

      const response = await fetch(
        `${this.baseUrl}/properties/${this.propertyId}:runReport`,
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
          const date = row.dimensionValues[0].value;
          const sourceMedium = row.dimensionValues[1].value;
          
          const metricValues = row.metricValues;
          
          metrics.push(
            {
              date,
              metric: 'sessions',
              value: parseInt(metricValues[0].value || '0'),
              platform: 'google_analytics',
              campaignName: sourceMedium,
            },
            {
              date,
              metric: 'users',
              value: parseInt(metricValues[1].value || '0'),
              platform: 'google_analytics',
              campaignName: sourceMedium,
            },
            {
              date,
              metric: 'pageviews',
              value: parseInt(metricValues[2].value || '0'),
              platform: 'google_analytics',
              campaignName: sourceMedium,
            },
            {
              date,
              metric: 'bounce_rate',
              value: parseFloat(metricValues[3].value || '0'),
              platform: 'google_analytics',
              campaignName: sourceMedium,
            },
            {
              date,
              metric: 'avg_session_duration',
              value: parseFloat(metricValues[4].value || '0'),
              platform: 'google_analytics',
              campaignName: sourceMedium,
            },
            {
              date,
              metric: 'conversions',
              value: parseFloat(metricValues[5].value || '0'),
              platform: 'google_analytics',
              campaignName: sourceMedium,
            },
            {
              date,
              metric: 'revenue',
              value: parseFloat(metricValues[6].value || '0'),
              platform: 'google_analytics',
              campaignName: sourceMedium,
            }
          );
        });
      }
    } catch (error) {
      console.error('Error fetching Google Analytics metrics:', error);
    }

    return metrics;
  }

  async fetchCampaigns(): Promise<any[]> {
    // Google Analytics doesn't have campaigns per se, but we can return traffic sources
    try {
      const requestBody = {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'sessions' }],
        dimensions: [{ name: 'sourceMedium' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 50,
      };

      const response = await fetch(
        `${this.baseUrl}/properties/${this.propertyId}:runReport`,
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
          name: row.dimensionValues[0].value,
          sessions: row.metricValues[0].value,
        })) || [];
      }
    } catch (error) {
      console.error('Error fetching Google Analytics traffic sources:', error);
    }
    return [];
  }
}
