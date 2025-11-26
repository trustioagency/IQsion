import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Bell, User, Settings, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { type User as UserType } from "../../types/user";
import { useIsMobile } from "../../hooks/use-mobile";
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocation } from "wouter";

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();

  const handleLogout = logout;

  const pageTitle = useMemo(() => {
    if (currentPage) return currentPage;
    const path = location || '/dashboard';
  const map: Record<string, string> = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/market-analysis': 'Market Analysis',
      '/competitor-analysis': 'Competitor Analysis',
      '/attribution': 'Attribution',
      '/profitability': 'Profitability',
      '/kpi-analysis': 'KPI Analysis',
      '/touchpoint-analysis': 'Touchpoint Analysis',
      '/customers': 'Customers',
      '/products': 'Products',
      '/campaigns': 'Campaigns',
      '/collaborations': 'Collaborations',
      '/strategy': 'Strategy',
      '/creative': 'Creative',
      '/reports': 'Reports',
      '/opportunities': 'Opportunities',
      '/scenarios': 'Scenarios',
      '/ai-assistant': 'AI Assistant',
      '/autopilot': 'Autopilot',
      '/team': 'Team',
      '/settings': t('settings'),
    };
    const found = Object.keys(map).find(k => path === k || (k !== '/' && path.startsWith(k)));
    return (found ? map[found] : 'Dashboard');
  }, [location, currentPage, t]);



  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">

        {/* Left side - Logo, Page title and breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/iqsion.logo.png" 
              alt="IQsion" 
              className="h-8 w-auto"
            />
          </button>
          
          <div className="hidden md:block h-8 w-px bg-slate-600"></div>
          
          <div>
            <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">IQsion</button>
              <span className="text-slate-500">/</span>
              <span className="text-slate-300">{pageTitle}</span>
            </div>
          </div>
        </div>

        {/* Right side - language, notifications, user menu */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <LanguageSwitcher />

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white p-2 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full border border-red-400 shadow">3</span>
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={(user as UserType)?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="bg-slate-700 text-slate-300">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">
                    {(user as UserType)?.firstName} {(user as UserType)?.lastName}
                  </p>
                  <p className="text-xs text-slate-400">Admin</p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-slate-800 border-slate-700"
            >
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={(user as UserType)?.profileImageUrl ?? undefined} alt="Profile" />
                    <AvatarFallback className="bg-slate-700 text-slate-300">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {(user as UserType)?.firstName} {(user as UserType)?.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{(user as UserType)?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-500 text-xs">
                    Pro Plan
                  </Badge>
                  <div className="status-indicator online text-xs text-slate-400">
                    Online
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-slate-700" />

              <DropdownMenuItem 
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('iq:open-start-guide'));
                    }
                  } catch (e) { /* no-op */ }
                }}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('onboardingStart')}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                {t('profile')}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-700" />

              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}