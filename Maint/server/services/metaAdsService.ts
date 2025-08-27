import { BasePlatformService, PlatformCredentials, PlatformDataPoint } from './platformService';

export class MetaAdsService extends BasePlatformService {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';
  private adAccountId: string;

  constructor(credentials: PlatformCredentials & { adAccountId: string }) {
    super(credentials);
    this.adAccountId = (credentials as any).adAccountId;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?access_token=${this.credentials.accessToken}`
      );
      return response.ok;
    } catch (error) {
      console.error('Meta Ads authentication failed:', error);
      return false;
    }
  }

  async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID || '',
          client_secret: process.env.META_APP_SECRET || '',
          fb_exchange_token: this.credentials.accessToken,
        }),
      });

      const data = await response.json();
      return data.access_token || this.credentials.accessToken;
    } catch (error) {
      console.error('Error refreshing Meta token:', error);
      return this.credentials.accessToken;
    }
  }

  async fetchMetrics(startDate: string, endDate: string): Promise<PlatformDataPoint[]> {
    const metrics: PlatformDataPoint[] = [];

    try {
      const fields = [
        'impressions',
        'clicks',
        'spend',
        'actions',
        'action_values',
        'campaign_id',
        'campaign_name',
        'date_start'
      ].join(',');

      const response = await fetch(
        `${this.baseUrl}/act_${this.adAccountId}/insights?fields=${fields}&time_range={"since":"${startDate}","until":"${endDate}"}&level=campaign&access_token=${this.credentials.accessToken}`
      );

      if (response.ok) {
        const data = await response.json();

        data.data?.forEach((insight: any) => {
          const date = insight.date_start;
          const campaignId = insight.campaign_id;
          const campaignName = insight.campaign_name;

          metrics.push(
            {
              date,
              metric: 'impressions',
              value: parseInt(insight.impressions || '0'),
              platform: 'meta',
              campaignId,
              campaignName,
            },
            {
              date,
              metric: 'clicks',
              value: parseInt(insight.clicks || '0'),
              platform: 'meta',
              campaignId,
              campaignName,
            },
            {
              date,
              metric: 'spend',
              value: parseFloat(insight.spend || '0'),
              platform: 'meta',
              campaignId,
              campaignName,
            }
          );

          // Process actions (conversions)
          if (insight.actions) {
            insight.actions.forEach((action: any) => {
              if (action.action_type === 'purchase' || action.action_type === 'offsite_conversion.fb_pixel_purchase') {
                metrics.push({
                  date,
                  metric: 'conversions',
                  value: parseInt(action.value || '0'),
                  platform: 'meta',
                  campaignId,
                  campaignName,
                });
              }
            });
          }

          // Process action values (conversion values)
          if (insight.action_values) {
            insight.action_values.forEach((actionValue: any) => {
              if (actionValue.action_type === 'purchase' || actionValue.action_type === 'offsite_conversion.fb_pixel_purchase') {
                metrics.push({
                  date,
                  metric: 'conversion_value',
                  value: parseFloat(actionValue.value || '0'),
                  platform: 'meta',
                  campaignId,
                  campaignName,
                });
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching Meta Ads metrics:', error);
    }

    return metrics;
  }

  async fetchCampaigns(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/act_${this.adAccountId}/campaigns?fields=id,name,status&access_token=${this.credentials.accessToken}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
    } catch (error) {
      console.error('Error fetching Meta Ads campaigns:', error);
    }
    return [];
  }

  async isTokenValid(): Promise<boolean> {
    return this.authenticate();
  }
}