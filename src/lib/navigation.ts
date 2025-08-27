import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Zap, 
  Eye, 
  MousePointer2, 
  Brain, 
  Settings,
  FileText,
  Lightbulb,
  PlayCircle,
  CheckSquare
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  category: 'analytics' | 'growth' | 'strategy' | 'tools' | 'settings';
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Analytics
  { id: 'dashboard', label: 'Genel Bakış', href: '/', icon: 'BarChart3', category: 'analytics' },
  { id: 'market-analysis', label: 'Pazar Analizi', href: '/market-analysis', icon: 'TrendingUp', category: 'analytics' },
  { id: 'attribution', label: 'Atıflandırma', href: '/attribution', icon: 'Target', category: 'analytics' },
  { id: 'profitability', label: 'Karlılık Analizi', href: '/profitability', icon: 'DollarSign', category: 'analytics' },
  { id: 'kpi-analysis', label: 'KPI Analizi', href: '/kpi-analysis', icon: 'BarChart3', category: 'analytics' },

  // Growth
  { id: 'customers', label: 'Müşteri Analizi', href: '/customers', icon: 'Users', category: 'growth' },
  { id: 'touchpoint-analysis', label: 'CRO Sihirbazı', href: '/touchpoint-analysis', icon: 'MousePointer2', category: 'growth' },
  { id: 'channels', label: 'Kanal Performansı', href: '/channels', icon: 'BarChart3', category: 'growth' },

  // Strategy
  { id: 'strategy', label: 'Strateji', href: '/strategy', icon: 'Brain', category: 'strategy' },
  { id: 'creative', label: 'Kreatif Analiz', href: '/creative', icon: 'Lightbulb', category: 'strategy' },
  { id: 'reports', label: 'Raporlar', href: '/reports', icon: 'FileText', category: 'strategy' },
  { id: 'opportunities', label: 'Fırsatlar ve Aksiyonlar', href: '/opportunities', icon: 'Lightbulb', category: 'strategy' },
  { id: 'scenarios', label: 'Senaryolar', href: '/scenarios', icon: 'PlayCircle', category: 'strategy' },

  // Settings
  { id: 'settings', label: 'Ayarlar', href: '/settings', icon: 'Settings', category: 'settings' },
];

// Navigation utility to preserve test mode across routes
export function getNavigationUrl(path: string): string {
  const isTestMode = window.location.search.includes('test=true');
  return isTestMode ? `${path}?test=true` : path;
}

export function navigateWithTestMode(path: string): void {
  const url = getNavigationUrl(path);
  window.location.href = url;
}