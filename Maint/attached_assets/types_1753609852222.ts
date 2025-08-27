

export enum Page {
  Dashboard = 'Dashboard',
  MarketAnalysis = 'Pazar Analizi',
  CompetitorAnalysis = 'Rakip Takibi',
  ImpactAnalysis = 'Etki Analizi',
  Strategy = 'Strateji',
  Creative = 'Kreatif',
  Reports = 'Raporlar',
  Opportunities = 'Fırsatlar',
  Scenarios = 'Senaryolar',
  Google = 'Google Performansı',
  Meta = 'Meta Performansı',
  TikTok = 'TikTok Performansı',
  Audiences = 'Hedef Kitleler',
  Customers = 'Müşteriler',
  People = 'Kişiler',
  Products = 'Ürünler',
  Loyalty = 'Sadakat',
  Autopilot = 'Otopilot',
  Actions = 'Aksiyonlar',
  Tasks = 'Görevler',
  Ekip = 'Ekip',
  Automations = 'Otomatik Uygulamalar',
  Connections = 'Bağlantılar',
  Settings = 'Ayarlar',
  AudienceProfitability = 'Kitle Kârlılığı',
  Profitability = 'Kârlılık Paneli',
  Collaborations = 'İş Birlikleri',
  TouchpointAnalysis = 'Touchpoint Tespiti',
  ConversionWizard = 'Dönüşüm Sihirbazı',
  KpiAnalysis = 'KPI Analizi',
  GemiAI = 'Gemi AI',
  MediaPlan = 'Medya Planı',
}

export type BusinessModel = 'E-Ticaret' | 'SaaS' | 'Hizmet Sağlayıcı' | 'Mobil Uygulama' | 'İçerik Yayıncısı';
export type Industry = 'Moda & Giyim' | 'Sağlık & Wellness' | 'Teknoloji & Yazılım' | 'Finans & Sigorta' | 'Yiyecek & İçecek' | 'Eğitim';
export type CustomerType = 'B2C' | 'B2B' | 'Her ikisi de';
export type BrandMaturity = 'Fikir' | 'Yeni Kurulmuş' | 'Büyüyen' | 'Oturmuş';
export type CompanySize = 'Tek Kişilik' | '2-10' | '11-50' | '51-200' | '200+';
export type MarketingGoal = 'Marka Bilinirliği' | 'Potensiyel Müşteri' | 'Satışları Artırma' | 'Müşteri Sadakati';
export type MonthlyRevenue = '0 - 50K' | '50K - 250K' | '250K - 1M' | '1M - 5M' | '5M+';
export type MonthlyAdBudget = '0 - 5K' | '5K - 25K' | '25K - 100K' | '100K - 500K' | '500K+';
export type BrandVoice = 'Profesyonel & Kurumsal' | 'Samimi & Arkadaşça' | 'Esprili & Eğlenceli' | 'Teknik & Bilgilendirici';

export interface BrandProfile {
  businessModel?: BusinessModel;
  industry?: Industry;
  customerType?: CustomerType;
  brandMaturity?: BrandMaturity;
  companySize?: CompanySize;
  marketingGoal?: MarketingGoal;
  websiteUrl?: string;
  monthlyRevenue?: MonthlyRevenue;
  monthlyAdBudget?: MonthlyAdBudget;
  mainCompetitors?: string;
  targetAudienceDescription?: string;
  brandVoice?: BrandVoice;
}


export interface AnalysisResult {
  summary: string;
  trends: string[];
  competitors: { name: string; analysis: string }[];
  opportunities: string[];
  risks: string[];
  targetAudience: string;
}

export interface WebInsight {
  uri: string;
  title: string;
}

export interface GroundingMetadata {
    groundingChunks: { web: WebInsight }[];
}

export type TimelineEventType = 'Website' | 'Satın Alım' | 'E-posta' | 'Destek' | 'Reklam' | 'Sosyal Medya' | 'E-Ticaret';

export interface TimelineEvent {
    id: number;
    type: TimelineEventType;
    title: string;
    description: string;
    date: string;
    source?: string;
    discountUsed?: boolean;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    company: string;
    status: 'Aktif' | 'Potansiyel' | 'Riskli' | 'Kaybedildi';
    lastContact: string;
    avatar: string;
    timeline: TimelineEvent[];
    predictedLtv: number;
}

export interface LtvSuggestion {
    customerId: number;
    customerName: string;
    customerEmail: string;
    firstPurchaseSummary: string;
    predictedLtv: number;
    actionText: string;
}


export type TaskPriority = 'Yüksek' | 'Orta' | 'Düşük';

export interface Action {
  category: string;
  title: string;
  description: string;
  priority: TaskPriority;
  effort: 'Yüksek' | 'Orta' | 'Düşük';
  rationale: string;
}

export type TaskStatus = 'Yapılacak' | 'Yapılıyor' | 'Tamamlandı';
export type Team = 'Pazarlama' | 'Satış' | 'IT' | 'Ürün' | 'Tasarım';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string; 
    assignee: Team;
}

export interface Person {
  id: number;
  name: string;
  role: string;
  email: string;
  avatar: string;
  team: Team;
}

export interface Competitor {
  id: number;
  name: string;
  url: string;
  logo: string;
  metrics: {
    monthlyTraffic: string;
    socialEngagement: string;
    keywords: string;
  };
  trafficHistory: { month: string; traffic: number }[];
}

export interface CausalImpactAnalysis {
  channel: string;
  icon: React.ReactNode;
  attributedSales: number;
  causalUplift: number;
  naturalSales: number;
}

export interface AnomalyAlert {
  id: number;
  metric: string;
  change: string;
  currentValue: string;
  normalRange: string;
  severity: 'Yüksek' | 'Orta';
  time: string;
}

export type StockStatus = 'Yüksek' | 'Normal' | 'Düşük' | 'Tükendi';

export interface Product {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
  cost: number;
  visits: number;
  conversionRate: number;
  potentialScore: number;
  stock: number;
  stockStatus: StockStatus;
}

export interface StockSuggestion {
  type: 'fırsat' | 'uyarı';
  title: string;
  description: string;
  productName: string;
  productId: number;
}

export interface PriceSuggestion {
    productId: number;
    productName: string;
    currentPrice: number;
    suggestedPrice: number;
    rationale: string;
    profitImpact: number;
}

export type PredictiveSegmentName = 'Satın Alma Eşiğinde' | 'Kayıp Riski Yüksek' | 'Sadık ve Güvende' | 'Fırsat Bekleyenler';

export interface PredictiveSegment {
    name: PredictiveSegmentName;
    description: string;
    customerCount: number;
    icon: React.ReactNode;
}

export interface LoyaltySuggestion {
    type: 'signal' | 'risk';
    title: string;
    description: string;
    actionText: string;
}


export interface PromotionOpportunity {
    title: string;
    description: string;
    productName: string;
    timing: string;
    reason: string;
    icon: React.ReactNode;
}

export type AutopilotStatus = 'active' | 'inactive';
export type FunnelStage = 'Farkındalık' | 'Değerlendirme' | 'Dönüşüm';

export interface FunnelAllocation {
    stage: FunnelStage;
    percentage: number;
}

export interface AutopilotLogEntry {
    id: number;
    time: string;
    action: string;
}

export interface AutopilotState {
    status: AutopilotStatus;
    goal: number;
    budget: number;
    currentValue: number;
    funnel: FunnelAllocation[];
    activityLog: AutopilotLogEntry[];
}

export interface ScenarioPrediction {
    revenue: number;
    newCustomers: number;
    visitors: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ProfitableAudience {
    id: number;
    name: string;
    platform: 'Google' | 'Meta' | 'TikTok';
    poas: number; // Profit on Ad Spend
    profit: number;
    spend: number;
    type: 'treasure' | 'pirate';
}

export interface BudgetReallocationSuggestion {
    sourceAudienceName: string;
    targetAudienceName: string;
    amountLost: number;
}

export interface AttributionData {
  channel: string;
  trueContribution: number;
  lastClickValue: number;
}

export interface AttributionInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface ProfitabilityData {
  revenue: number;
  cogs: number;
  adSpend: number;
  shippingCosts: number;
  transactionFees: number;
  platformFee: number;
  grossProfit: number;
  netProfit: number;
}

export interface ChannelProfitability {
  channel: string;
  profit: number;
  margin: number;
}

export interface ProductProfitability {
  id: number;
  name: string;
  profit: number;
  revenue: number;
  margin: number;
}

export interface Influencer {
  id: number;
  name:string;
  instagramHandle: string;
  avatar: string;
  sales: number;
  commission: number;
  conversionRate: number;
}

export interface CollaborationInsight {
  type: 'highlight' | 'warning';
  title: string;
  description: string;
  influencerName: string;
  icon: React.ReactNode;
}

export interface HeatmapData {
    id: number;
    pageUrl: string;
    pageName: string;
    device: 'Desktop' | 'Mobile';
    heatmapUrl: string; // This will be a placeholder image
    clicks: number;
    scrollDepth: number;
    rageClicks: number;
}

export type ConversionInsightPriority = 'Kritik' | 'Önemli' | 'İyileştirme';
export type ConversionInsightCategory = 'Teknik' | 'UX' | 'Metin';

export interface ConversionInsight {
    id: number;
    priority: ConversionInsightPriority;
    category: ConversionInsightCategory;
    title: string;
    detection: string;
    impact: string;
    action: string;
    helpLink?: string;
    helpLinkText?: string;
    codeSnippet?: string;
}

export type KpiKey = 'roas' | 'cpc' | 'conversion_rate' | 'ctr' | 'cpa' | 'aov';
export type KpiFormat = 'ratio' | 'currency' | 'percentage' | 'decimal';

export interface KpiDefinition {
    key: KpiKey;
    name: string;
    format: KpiFormat;
}

export interface KpiAnalysisData {
    value: number;
    change: number; // as percentage
    trend: { date: string; value: number }[];
    byChannel: { channel: string; value: number }[];
    insight: string;
}

export type MediaChannel = 'Google' | 'Meta' | 'TikTok' | 'İçerik' | 'Diğer';

export interface ChannelAllocation {
  channel: MediaChannel;
  budget: number;
  funnelStage: FunnelStage;
  estimatedKpi: string;
}

export interface MediaPlan {
  strategicRationale: string;
  funnelAllocation: FunnelAllocation[];
  channelBreakdown: ChannelAllocation[];
}

// Types for Customizable Dashboard
export type WidgetKey = 'statCards' | 'trafficChart' | 'alerts' | 'conversionChart' | 'audienceProfitability';

export interface Widget {
    key: WidgetKey;
    title: string;
}

export type DateRangeKey = '7d' | '30d' | '90d';
export type PlatformKey = 'all' | 'google' | 'meta' | 'tiktok';
