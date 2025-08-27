

import React from 'react';
import { Page } from '../types';
import { ChartBarIcon, CogIcon, LightBulbIcon, BuildingStorefrontIcon, UserGroupIcon, UsersIcon, SparklesIcon, DocumentChartBarIcon, SquaresPlusIcon, BoltIcon, RocketLaunchIcon, ClipboardDocumentListIcon, EyeIcon, ScaleIcon, ShoppingBagIcon, StarIcon, CalendarDaysIcon, BrainIcon, MapPinIcon, GoogleIcon, MetaIcon, TikTokIcon, BriefcaseIcon, ClipboardDocumentCheckIcon, TreasureChestIcon, CurrencyDollarIcon, ShareIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, CursorArrowRaysIcon, WandIcon, ChartBarSquareIcon, CubeTransparentIcon, PresentationChartBarIcon } from './icons';
import { translations } from '../translations';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  language: 'tr' | 'en';
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const NavItem: React.FC<{
  page: Page;
  activePage: Page;
  setActivePage: (page: Page) => void;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}> = ({ page, activePage, setActivePage, icon, label, isCollapsed }) => {
  const isActive = activePage === page;
  return (
    <li
      onClick={() => setActivePage(page)}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${
        isActive
          ? 'bg-sky-500 text-white shadow-lg'
          : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
      }`}
      title={isCollapsed ? label : undefined}
    >
      {icon}
      {!isCollapsed && <span className="ml-4 font-medium whitespace-nowrap">{label}</span>}
    </li>
  );
};

const NavHeader: React.FC<{ children: React.ReactNode; isCollapsed: boolean }> = ({ children, isCollapsed }) => (
    isCollapsed
    ? <hr className="my-4 mx-2 border-t border-slate-700/50" />
    : <h3 className="px-3 mt-6 mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase whitespace-nowrap">{children}</h3>
);


const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, language, isCollapsed, setIsCollapsed }) => {
  const t = translations[language];

  return (
    <aside className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-64'} bg-slate-900 text-white flex-shrink-0 p-4 border-r border-slate-700/50 flex flex-col`}>
      <div className={`flex items-center mb-8 ${isCollapsed ? 'justify-center' : 'px-0'}`}>
        <BuildingStorefrontIcon className="w-8 h-8 text-sky-400 flex-shrink-0" />
        {!isCollapsed && <h1 className="text-xl font-bold ml-3 whitespace-nowrap">{t.appName}</h1>}
      </div>
      <nav className="flex-grow overflow-y-auto overflow-x-hidden pb-4">
        <NavHeader isCollapsed={isCollapsed}>{t.navHeaders.general}</NavHeader>
        <ul>
          <NavItem
            page={Page.Dashboard}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<ChartBarIcon className="w-6 h-6" />}
            label={t.pages[Page.Dashboard]}
            isCollapsed={isCollapsed}
          />
        </ul>
        <NavHeader isCollapsed={isCollapsed}>{t.navHeaders.analysis}</NavHeader>
        <ul>
           <NavItem
            page={Page.MarketAnalysis}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<LightBulbIcon className="w-6 h-6" />}
            label={t.pages[Page.MarketAnalysis]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.CompetitorAnalysis}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<EyeIcon className="w-6 h-6" />}
            label={t.pages[Page.CompetitorAnalysis]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.ImpactAnalysis}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<ScaleIcon className="w-6 h-6" />}
            label={t.pages[Page.ImpactAnalysis]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Profitability}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            label={t.pages[Page.Profitability]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.AudienceProfitability}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<TreasureChestIcon className="w-6 h-6" />}
            label={t.pages[Page.AudienceProfitability]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Strategy}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<DocumentChartBarIcon className="w-6 h-6" />}
            label={t.pages[Page.Strategy]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Creative}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<SparklesIcon className="w-6 h-6" />}
            label={t.pages[Page.Creative]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Reports}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
            label={t.pages[Page.Reports]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.Opportunities}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<CalendarDaysIcon className="w-6 h-6" />}
            label={t.pages[Page.Opportunities]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.Scenarios}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<MapPinIcon className="w-6 h-6" />}
            label={t.pages[Page.Scenarios]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.KpiAnalysis}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<ChartBarSquareIcon className="w-6 h-6" />}
            label={t.pages[Page.KpiAnalysis]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.GemiAI}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<CubeTransparentIcon className="w-6 h-6" />}
            label={t.pages[Page.GemiAI]}
            isCollapsed={isCollapsed}
          />
        </ul>

         <NavHeader isCollapsed={isCollapsed}>{t.navHeaders.cro}</NavHeader>
        <ul>
          <NavItem
            page={Page.ConversionWizard}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<WandIcon className="w-6 h-6" />}
            label={t.pages[Page.ConversionWizard]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.TouchpointAnalysis}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<CursorArrowRaysIcon className="w-6 h-6" />}
            label={t.pages[Page.TouchpointAnalysis]}
            isCollapsed={isCollapsed}
          />
        </ul>

        <NavHeader isCollapsed={isCollapsed}>{t.navHeaders.channels}</NavHeader>
        <ul>
          <NavItem
            page={Page.Google}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<GoogleIcon className="w-6 h-6" />}
            label={t.pages[Page.Google]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.Meta}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<MetaIcon className="w-6 h-6" />}
            label={t.pages[Page.Meta]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.TikTok}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<TikTokIcon className="w-6 h-6 p-0.5 rounded-sm bg-white" />}
            label={t.pages[Page.TikTok]}
            isCollapsed={isCollapsed}
          />
        </ul>

        <NavHeader isCollapsed={isCollapsed}>{t.navHeaders.management}</NavHeader>
         <ul>
           <NavItem
            page={Page.MediaPlan}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<PresentationChartBarIcon className="w-6 h-6" />}
            label={t.pages[Page.MediaPlan]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Audiences}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<UserGroupIcon className="w-6 h-6" />}
            label={t.pages[Page.Audiences]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Customers}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<UsersIcon className="w-6 h-6" />}
            label={t.pages[Page.Customers]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Products}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<ShoppingBagIcon className="w-6 h-6" />}
            label={t.pages[Page.Products]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Loyalty}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<StarIcon className="w-6 h-6" />}
            label={t.pages[Page.Loyalty]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Collaborations}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<ShareIcon className="w-6 h-6" />}
            label={t.pages[Page.Collaborations]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Autopilot}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<BrainIcon className="w-6 h-6" />}
            label={t.pages[Page.Autopilot]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Actions}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<BoltIcon className="w-6 h-6" />}
            label={t.pages[Page.Actions]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Tasks}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
            label={t.pages[Page.Tasks]}
            isCollapsed={isCollapsed}
          />
          <NavItem
            page={Page.Ekip}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<BriefcaseIcon className="w-6 h-6" />}
            label={t.pages[Page.Ekip]}
            isCollapsed={isCollapsed}
          />
           <NavItem
            page={Page.Automations}
            activePage={activePage}
            setActivePage={setActivePage}
            icon={<RocketLaunchIcon className="w-6 h-6" />}
            label={t.pages[Page.Automations]}
            isCollapsed={isCollapsed}
          />
        </ul>
      </nav>
      <div className="mt-auto">
         <NavHeader isCollapsed={isCollapsed}>{t.navHeaders.configuration}</NavHeader>
         <ul>
            <NavItem
                page={Page.Connections}
                activePage={activePage}
                setActivePage={setActivePage}
                icon={<SquaresPlusIcon className="w-6 h-6" />}
                label={t.pages[Page.Connections]}
                isCollapsed={isCollapsed}
            />
            <NavItem
                page={Page.Settings}
                activePage={activePage}
                setActivePage={setActivePage}
                icon={<CogIcon className="w-6 h-6" />}
                label={t.pages[Page.Settings]}
                isCollapsed={isCollapsed}
            />
         </ul>
         <div className="border-t border-slate-700/50 mt-4 pt-4">
             <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center w-full p-3 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                aria-label={isCollapsed ? t.sidebar.expandMenu : t.sidebar.collapseMenu}
             >
                {isCollapsed ? (
                    <ChevronDoubleRightIcon className="w-6 h-6 mx-auto" />
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <span className="font-medium whitespace-nowrap">{t.sidebar.collapseMenu}</span>
                        <ChevronDoubleLeftIcon className="w-6 h-6" />
                    </div>
                )}
            </button>
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;