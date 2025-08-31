import { useState } from "react";
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
import { Bell, Search, User, Settings, LogOut, Globe, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { type User as UserType } from "@shared/schema";
import { useIsMobile } from "../../hooks/use-mobile";
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../ui/input';

interface HeaderProps {
  currentPage: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = logout;



  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">

        {/* Left side - Page title and breadcrumb */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{currentPage}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Pazarlama Zekası</span>
              <span>/</span>
              <span>{currentPage}</span>
            </div>
          </div>
        </div>

        {/* Right side - Search, notifications, language, user menu */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2 min-w-[300px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('search') + "..."}
              className="bg-transparent text-slate-300 placeholder-slate-400 outline-none flex-1 text-sm"
            />
          </div>

          {/* Language Toggle */}
          <LanguageSwitcher />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white p-2"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <div className="notification-badge">3</div>
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

              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
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