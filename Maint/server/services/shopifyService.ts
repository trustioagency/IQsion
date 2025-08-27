import { BasePlatformService, PlatformCredentials, PlatformDataPoint } from './platformService';

export class ShopifyService extends BasePlatformService {
  private readonly baseUrl: string;

  constructor(credentials: PlatformCredentials) {
    super(credentials);
    this.baseUrl = `https://${credentials.accountId}.myshopify.com/admin/api/2023-10`;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': this.credentials.accessToken,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Shopify authentication failed:', error);
      return false;
    }
  }

  async refreshAccessToken(): Promise<string> {
    // Shopify tokens don't expire, so return the same token
    return this.credentials.accessToken;
  }

  async fetchMetrics(startDate: string, endDate: string): Promise<PlatformDataPoint[]> {
    try {
      const dataPoints: PlatformDataPoint[] = [];

      // Fetch orders for revenue data
      const ordersResponse = await fetch(`${this.baseUrl}/orders.json?created_at_min=${startDate}&created_at_max=${endDate}&status=any`, {
        headers: {
          'X-Shopify-Access-Token': this.credentials.accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();

        // Group orders by date
        const ordersByDate = ordersData.orders.reduce((acc: any, order: any) => {
          const date = order.created_at.split('T')[0];
          if (!acc[date]) {
            acc[date] = { revenue: 0, orders: 0 };
          }
          acc[date].revenue += parseFloat(order.total_price);
          acc[date].orders += 1;
          return acc;
        }, {});

        // Convert to data points
        Object.entries(ordersByDate).forEach(([date, data]: [string, any]) => {
          dataPoints.push({
            date,
            metric: 'revenue',
            value: data.revenue,
            platform: 'shopify',
          });
          dataPoints.push({
            date,
            metric: 'orders',
            value: data.orders,
            platform: 'shopify',
          });
        });
      }

      return dataPoints;
    } catch (error) {
      console.error('Error fetching Shopify metrics:', error);
      return [];
    }
  }

  async fetchCampaigns(): Promise<any[]> {
    // Shopify doesn't have campaigns in the traditional sense
    return [];
  }

  async isTokenValid(): Promise<boolean> {
    return await this.authenticate();
  }

  async fetchProducts(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': this.credentials.accessToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.products;
      }
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
    }
    return [];
  }

  async fetchCustomers(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/customers.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': this.credentials.accessToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.customers;
      }
    } catch (error) {
      console.error('Error fetching Shopify customers:', error);
    }
    return [];
  }
}