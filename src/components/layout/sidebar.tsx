import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Users,
  Megaphone,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  GitBranch,
  DollarSign,
  BarChart2,
  MapPin,
  Wand2,
  Search,
  Facebook,
  Music,
  Calendar,
  User,
  Package,
  Heart,
  Handshake,
  Palette,
  Layers,
  Bot,
  Zap,
  CheckSquare,
  Users2,
  Play
} from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { getNavigationUrl } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const iconMap = {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Users,
  Megaphone,
  FileText,
  Settings,
  GitBranch,
  DollarSign,
  BarChart2,
  MapPin,
  Wand2,
  Search,
  Facebook,
  Music,
  Calendar,
  User,
  Package,
  Heart,
  Handshake,
  Palette,
  Layers,
  Bot,
  Zap,
  CheckSquare,
  Users2,
  Play
};

const renderIcon = (iconName: string) => {
  const Icon = iconMap[iconName as keyof typeof iconMap];
  return Icon ? <Icon className="w-5 h-5 flex-shrink-0" /> : null;
};

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const { language, t } = useLanguage();

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-800 border-r border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Pazarlama Zekası</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white p-1"
        >
          {isMobile ? (
            isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />
          ) : (
            isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Group navigation items by category */}
          {Object.entries(
            NAVIGATION_ITEMS.reduce((groups, item) => {
              if (!groups[item.category]) {
                groups[item.category] = [];
              }
              groups[item.category].push(item);
              return groups;
            }, {} as Record<string, typeof NAVIGATION_ITEMS>)
          ).map(([category, items]) => (
            <div key={category}>
              {(!isCollapsed || isMobile) && (
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                  {category === 'genel' && t('general')}
                  {category === 'analiz' && t('analysis')}
                  {category === 'cro' && t('cro')}
                  {category === 'kanallar' && t('channels')}
                  {category === 'yonetim' && t('management')}
                  {category === 'strateji' && t('strategy')}
                  {category === 'yardimci' && t('helper')}
                  {category === 'otomasyon' && t('automation')}
                  {category === 'yapilandirma' && t('configuration')}
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = location === getNavigationUrl(item.href);
                  return (
                    <a
                      key={item.id}
                      href={getNavigationUrl(item.href)}
                      className={cn(
                        "sidebar-nav-item flex items-center gap-3 px-3 py-2 text-sm font-medium cursor-pointer rounded-lg transition-colors",
                        isActive
                          ? 'active bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation(getNavigationUrl(item.href));
                        closeMobileSidebar();
                      }}
                    >
                      {renderIcon(item.icon)}
                      {(!isCollapsed || isMobile) && (
                        <span className="truncate">{t(item.labelKey as any)}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {(!isCollapsed || isMobile) && <span>{language === 'tr' ? 'Sistem Aktif' : t('systemActive')}</span>}
        </div>
      </div>
    </div>
  );

  // Mobile overlay handling
  if (isMobile && isMobileOpen) {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
        <div className="absolute top-0 left-0 h-full w-80 max-w-[80vw] z-51">
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Mobile menu button
  if (isMobile && !isMobileOpen) {
    return (
      <div className="fixed top-4 left-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="text-slate-400 hover:text-white p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0`}>
      {sidebarContent}
    </div>
  );
}