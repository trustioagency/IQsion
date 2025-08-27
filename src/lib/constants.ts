import { BarChart3, Users, Target, Zap, Settings, TrendingUp, Eye, DollarSign, FileText, Calendar, Package, GitBranch, MapPin, Search, User, Package2, Heart, Handshake, Palette, Percent, MousePointer, ShoppingCart, CreditCard, Layers, Bot, Play, CheckSquare, Users2, AlertTriangle, AlertCircle, Megaphone } from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    labelKey: 'dashboard',
    href: '/',
    icon: 'LayoutDashboard',
    category: 'general'
  },
  {
    id: 'attribution',
    labelKey: 'attributionModule',
    href: '/attribution',
    icon: 'GitBranch',
    category: 'analiz'
  },
  {
    id: 'profitability',
    labelKey: 'profitabilityPanel',
    href: '/profitability',
    icon: 'DollarSign',
    category: 'analiz'
  },
  {
    id: 'kpi-analysis',
    labelKey: 'kpiAnalysis',
    href: '/kpi-analysis',
    icon: 'BarChart3',
    category: 'analiz'
  },
  {
    id: 'touchpoint-analysis',
    labelKey: 'croCenter',
    href: '/touchpoint-analysis',
    icon: 'MapPin',
    category: 'analiz'
  },
  {
    id: 'market-analysis',
    labelKey: 'marketAnalysis',
    href: '/market-analysis',
    icon: 'TrendingUp',
    category: 'analiz'
  },
  {
    id: 'competitor-analysis',
    labelKey: 'competitorAnalysis',
    href: '/competitor-analysis',
    icon: 'Target',
    category: 'analiz'
  },
  {
    id: 'customers',
    labelKey: 'customers',
    href: '/customers',
    icon: 'Users',
    category: 'yonetim'
  },
  {
    id: 'products',
    labelKey: 'products',
    href: '/products',
    icon: 'Package',
    category: 'yonetim'
  },
  {
    id: 'campaigns',
    labelKey: 'campaigns',
    href: '/campaigns',
    icon: 'Megaphone',
    category: 'yonetim'
  },
  {
    id: 'collaborations',
    labelKey: 'collaborations',
    href: '/collaborations',
    icon: 'Handshake',
    category: 'yonetim'
  },
  {
    id: 'team',
    labelKey: 'teamTasks',
    href: '/team',
    icon: 'Users2',
    category: 'yonetim'
  },
  {
    id: 'strategy',
    labelKey: 'strategyPlanning',
    href: '/strategy',
    icon: 'Target',
    category: 'strateji'
  },
  {
    id: 'creative',
    labelKey: 'creative',
    href: '/creative',
    icon: 'Palette',
    category: 'strateji'
  },
  {
    id: 'reports',
    labelKey: 'reports',
    href: '/reports',
    icon: 'FileText',
    category: 'strateji'
  },
  {
    id: 'opportunities',
    labelKey: 'opportunitiesActions',
    href: '/opportunities',
    icon: 'Zap',
    category: 'otomasyon'
  },
  {
    id: 'autopilot',
    labelKey: 'autopilot',
    href: '/autopilot',
    icon: 'Play',
    category: 'otomasyon'
  },
  {
    id: 'ai-assistant',
    labelKey: 'aiAssistant',
    href: '/ai-assistant',
    icon: 'Bot',
    category: 'otomasyon'
  },
  {
    id: 'settings',
    labelKey: 'settings',
    href: '/settings',
    icon: 'Settings',
    category: 'yapilandirma'
  }
];

export const PLATFORM_COLORS = {
  google: 'hsl(4, 90%, 58%)',
  meta: 'hsl(220, 80%, 60%)',
  tiktok: 'hsl(0, 0%, 0%)',
  shopify: 'hsl(144, 65%, 50%)',
  all: 'hsl(215, 20.2%, 65.1%)'
};

export const METRIC_ICONS = {
  revenue: 'DollarSign',
  adSpend: 'TrendingUp',
  roas: 'Target',
  conversions: 'ShoppingCart',
  clicks: 'MousePointer',
  impressions: 'Eye',
  ctr: 'Percent',
  cpc: 'CreditCard'
};

export const QUICK_ACTIONS = [
  {
    id: 'roas-analysis',
    label: '📊 ROAS Analizi',
    prompt: 'ROAS analizi yapar mısın?'
  },
  {
    id: 'budget-optimization',
    label: '💰 Bütçe Optimizasyonu',
    prompt: 'Bütçemi nasıl optimize edebilirim?'
  },
  {
    id: 'customer-insights',
    label: '👥 Müşteri İnsights',
    prompt: 'Müşteri segmentlerim hakkında insight verir misin?'
  },
  {
    id: 'campaign-performance',
    label: '📈 Kampanya Performansı',
    prompt: 'Kampanya performansımı analiz eder misin?'
  }
];

export const DATE_RANGES = {
  '7d': 'Son 7 gün',
  '30d': 'Son 30 gün',
  '90d': 'Son 90 gün'
};

export const PLATFORMS = {
  'all': 'Tümü',
  'google': 'Google',
  'meta': 'Meta',
  'tiktok': 'TikTok'
};

export const ALERT_TYPES = {
  opportunity: {
    color: 'hsl(153, 60%, 53%)',
    icon: 'TrendingUp',
    label: 'Fırsat'
  },
  warning: {
    color: 'hsl(48, 96%, 53%)',
    icon: 'AlertTriangle',
    label: 'Uyarı'
  },
  alert: {
    color: 'hsl(0, 84.2%, 60.2%)',
    icon: 'AlertCircle',
    label: 'Kritik'
  }
};