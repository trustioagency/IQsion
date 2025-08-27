import { apiRequest } from "./queryClient";

export interface MarketAnalysisRequest {
  industry: string;
  websiteUrl?: string;
  competitors?: string;
}

export interface MarketAnalysisResult {
  summary: string;
  trends: string[];
  competitors: { name: string; analysis: string }[];
  opportunities: string[];
  risks: string[];
  targetAudience: string;
}

export interface DashboardData {
  totalRevenue: number;
  totalAdSpend: number;
  avgRoas: number;
  totalConversions: number;
  metrics: any[];
}

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
}

export const api = {
  // Market Analysis
  analyzeMarket: async (data: MarketAnalysisRequest): Promise<MarketAnalysisResult> => {
    const response = await apiRequest('POST', '/api/ai/market-analysis', data);
    return response.json();
  },

  // Dashboard
  getDashboardData: async (dateRange: string, platform: string): Promise<DashboardData> => {
    const response = await apiRequest('GET', `/api/dashboard?dateRange=${dateRange}&platform=${platform}`);
    return response.json();
  },

  // AI Chat
  sendChatMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await apiRequest('POST', '/api/ai/chat', data);
    return response.json();
  },

  // Brand Profile
  getBrandProfile: async () => {
    const response = await apiRequest('GET', '/api/brand-profile');
    return response.json();
  },

  // Platform Management
  connectPlatform: async (platform: string, credentials: any) => {
    const response = await apiRequest('POST', '/api/platforms/connect', {
      platform,
      credentials,
    });
    return response.json();
  },

  disconnectPlatform: async (platform: string) => {
    const response = await apiRequest('POST', '/api/platforms/disconnect', {
      platform,
    });
    return response.json();
  },

  syncPlatformData: async (platform: string, startDate?: string, endDate?: string) => {
    const response = await apiRequest('POST', '/api/platforms/sync', {
      platform,
      startDate,
      endDate,
    });
    return response.json();
  },

  testPlatformConnection: async (platform: string) => {
    const response = await apiRequest('POST', '/api/platforms/test', {
      platform,
    });
    return response.json();
  },

  // Attribution Analysis
  getAttributionModel: async (modelType: string, timeRange: string = '30d') => {
    const response = await apiRequest('GET', `/api/attribution/models/${modelType}?timeRange=${timeRange}`);
    return response.json();
  },

  getCustomerJourneys: async (limit: number = 10) => {
    const response = await apiRequest('GET', `/api/attribution/customer-journeys?limit=${limit}`);
    return response.json();
  },

  generateSampleAttributionData: async () => {
    const response = await apiRequest('POST', '/api/attribution/generate-sample-data');
    return response.json();
  },

  processCustomerJourneys: async () => {
    const response = await apiRequest('POST', '/api/attribution/process-journeys');
    return response.json();
  },

  saveBrandProfile: async (data: any) => {
    const response = await apiRequest('POST', '/api/brand-profile', data);
    return response.json();
  },

  // Platform Connections
  getConnections: async () => {
    const response = await apiRequest('GET', '/api/connections');
    return response.json();
  },

  // Tasks
  getTasks: async () => {
    const response = await apiRequest('GET', '/api/tasks');
    return response.json();
  },

  createTask: async (data: any) => {
    const response = await apiRequest('POST', '/api/tasks', data);
    return response.json();
  },

  updateTask: async (id: string, data: any) => {
    const response = await apiRequest('PUT', `/api/tasks/${id}`, data);
    return response.json();
  },
};
