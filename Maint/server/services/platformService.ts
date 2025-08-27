
export interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  accountId?: string;
  expiresAt?: Date;
}

export interface PlatformDataPoint {
  date: string;
  metric: string;
  value: number;
  platform: string;
  campaignId?: string;
  campaignName?: string;
  adGroupId?: string;
  adId?: string;
}

export abstract class BasePlatformService {
  protected credentials: PlatformCredentials;
  
  constructor(credentials: PlatformCredentials) {
    this.credentials = credentials;
  }

  abstract authenticate(): Promise<boolean>;
  abstract refreshAccessToken(): Promise<string>;
  abstract fetchMetrics(startDate: string, endDate: string): Promise<PlatformDataPoint[]>;
  abstract fetchCampaigns(): Promise<any[]>;
  abstract isTokenValid(): Promise<boolean>;
}

export class PlatformServiceFactory {
  static create(platform: string, credentials: PlatformCredentials): BasePlatformService {
    switch (platform) {
      case 'shopify':
        return new ShopifyService(credentials);
      case 'google_ads':
        return new GoogleAdsService(credentials);
      case 'google_analytics':
        return new GoogleAnalyticsService(credentials);
      case 'meta':
        return new MetaAdsService(credentials);
      case 'tiktok':
        return new TikTokAdsService(credentials);
      case 'google_search_console':
        return new GoogleSearchConsoleService(credentials);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
