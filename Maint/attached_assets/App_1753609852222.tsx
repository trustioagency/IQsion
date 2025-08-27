

import React, { useState, useEffect } from 'react';
import { Page } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './Dashboard';
import MarketAnalysis from './pages/MarketAnalysis';
import Settings from './pages/Settings';
import Strategy from './pages/Strategy';
import Creative from './pages/Creative';
import Audiences from './pages/Audiences';
import Customers from './pages/Customers';
import Connections from './pages/Connections';
import Actions from './pages/Actions';
import Tasks from './pages/Tasks';
import Automations from './pages/Automations';
import Reports from './pages/Reports';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import Onboarding from './pages/Onboarding';
import ImpactAnalysis from './pages/ImpactAnalysis';
import Products from './pages/Products';
import Loyalty from './pages/Loyalty';
import Opportunities from './pages/Opportunities';
import Autopilot from './pages/Autopilot';
import Scenarios from './pages/Scenarios';
import GooglePerformance from './pages/GooglePerformance';
import MetaPerformance from './pages/MetaPerformance';
import TikTokPerformance from './pages/TikTokPerformance';
import Ekip from './pages/Ekip';
import AIAssistant from './components/AIAssistant';
import { ChatBubbleBottomCenterTextIcon } from './components/icons';
import AudienceProfitability from './pages/AudienceProfitability';
import { translations } from './translations';
import Profitability from './pages/Profitability';
import Collaborations from './pages/Collaborations';
import TouchpointAnalysis from './pages/TouchpointAnalysis';
import ConversionWizard from './pages/ConversionWizard';
import KpiAnalysis from './pages/KpiAnalysis';
import GemiAI from './pages/GemiAI';
import MediaPlan from './pages/MediaPlan';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [language, setLanguage] = useState<'tr' | 'en'>(() => {
    const storedLang = localStorage.getItem('language');
    return (storedLang === 'tr' || storedLang === 'en') ? storedLang : 'tr';
  });

  useEffect(() => {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
  }, [language]);


  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} language={language} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard setActivePage={setActivePage} language={language} />;
      case Page.MarketAnalysis:
        return <MarketAnalysis language={language} />;
      case Page.CompetitorAnalysis:
        return <CompetitorAnalysis language={language} />;
      case Page.ImpactAnalysis:
        return <ImpactAnalysis language={language} />;
      case Page.Strategy:
        return <Strategy language={language} />;
      case Page.Creative:
        return <Creative language={language} />;
      case Page.Reports:
        return <Reports language={language} />;
      case Page.Opportunities:
        return <Opportunities language={language} />;
      case Page.Scenarios:
        return <Scenarios language={language} />;
      case Page.Google:
        return <GooglePerformance language={language} />;
      case Page.Meta:
        return <MetaPerformance language={language} />;
      case Page.TikTok:
        return <TikTokPerformance language={language} />;
      case Page.MediaPlan:
        return <MediaPlan language={language} />;
      case Page.Audiences:
        return <Audiences language={language} />;
      case Page.Customers:
        return <Customers language={language} />;
      case Page.Products:
        return <Products language={language} />;
      case Page.Loyalty:
        return <Loyalty language={language} />;
      case Page.TouchpointAnalysis:
        return <TouchpointAnalysis language={language} />;
      case Page.ConversionWizard:
        return <ConversionWizard language={language} />;
      case Page.KpiAnalysis:
        return <KpiAnalysis language={language} />;
      case Page.GemiAI:
        return <GemiAI language={language} />;
      case Page.Autopilot:
        return <Autopilot language={language} />;
      case Page.Actions:
        return <Actions language={language} />;
      case Page.Tasks:
        return <Tasks language={language} />;
      case Page.Ekip:
        return <Ekip language={language} />;
      case Page.AudienceProfitability:
        return <AudienceProfitability language={language} />;
      case Page.Profitability:
        return <Profitability language={language} />;
      case Page.Collaborations:
        return <Collaborations language={language} />;
      case Page.Automations:
        return <Automations language={language} />;
      case Page.Connections:
        return <Connections language={language} />;
      case Page.Settings:
        return <Settings language={language} />;
      default:
        return <Dashboard setActivePage={setActivePage} language={language} />;
    }
  };
  
  const translatedPageTitle = translations[language].pages[activePage] || activePage;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300 overflow-hidden">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        language={language}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Header 
          currentPage={translatedPageTitle} 
          language={language} 
          setLanguage={setLanguage} 
        />
        <main className="h-full overflow-y-auto bg-slate-800/50 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>

       <button
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className="fixed bottom-6 right-6 z-40 bg-sky-600 text-white rounded-full p-4 shadow-lg hover:bg-sky-500 transition-transform hover:scale-110"
          aria-label={translations[language].pageContent.aiAssistant.title}
        >
          <ChatBubbleBottomCenterTextIcon className="w-8 h-8"/>
        </button>

      <AIAssistant
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          activePage={activePage}
          language={language}
      />
    </div>
  );
};

export default App;