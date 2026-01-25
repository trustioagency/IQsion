import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import ContactFormModal from "../components/ContactFormModal";
import {
  TrendingUp,
  Database,
  Brain,
  Lightbulb,
  Zap,
  Map,
  BarChart3,
  Play,
  Calendar,
  Star,
  MessageCircle,
  X,
  Send,
  ArrowRight,
  CheckCircle,
  Users,
  ChevronDown,
  AlertCircle,
  DollarSign,
  ChevronRight,
  Bell,
  CircleDollarSign,
  BarChart2,
  LineChart,
  Building2,
  Plus,
  Target,
  BarChart
} from "lucide-react";
import { useLanguage } from '../contexts/LanguageContext';
import BrandLogo from '../components/brand-logo';
export default function Landing() {
  const { t, language } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [activeAudience, setActiveAudience] = useState<'companies' | 'agencies' | 'entrepreneurs'>('companies');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeDashboardView, setActiveDashboardView] = useState<'overview' | 'ai' | 'audit' | 'reports' | 'attribution'>('overview');
  const [openModal, setOpenModal] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  // Auth actions should go to app subdomain ONLY in production domains.
  const appBase = (() => {
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname;
    const isProdHost = ['iqsion.com', 'www.iqsion.com', 'app.iqsion.com'].includes(host);
    if (!isProdHost) return '';
    return host !== 'app.iqsion.com' ? 'https://app.iqsion.com' : '';
  })();

  const [contactModal, setContactModal] = useState<{ open: boolean; type: 'demo' | 'contact' }>({
    open: false,
    type: 'contact'
  });

  const handleLogin = () => {
    window.location.href = `${appBase}/auth`;
  };

  const handleStartTrial = () => {
    window.location.href = '/auth';
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessage('');
  };
  // Prevent widow in hero description (keep last two words together)
  const descText = (() => {
    const s = t('heroDescription');
    try { return s.replace(/\s([^\s]+)$/, '\u00A0$1'); } catch { return s; }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-b border-gray-900 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-24 w-full py-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 mr-10 group shrink-0" aria-label="IQsion Anasayfa">
              <img 
                src="/iqsion.logo.png" 
                alt="IQsion" 
                className="h-12 w-auto mix-blend-lighten"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all whitespace-nowrap">IQsion</span>
            </a>
            {/* Nav */}
            <nav className="hidden md:flex items-center gap-2 mx-auto whitespace-nowrap bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl px-6 py-3">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors font-normal px-4 py-2 rounded-lg hover:bg-gray-800/50">{t('features')}</a>
              <a href="#dashboard" className="text-gray-300 hover:text-white transition-colors font-normal px-4 py-2 rounded-lg hover:bg-gray-800/50">{t('dashboard')}</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors font-normal px-4 py-2 rounded-lg hover:bg-gray-800/50">{language === 'tr' ? 'Fiyatlandırma' : 'Pricing'}</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors font-normal px-4 py-2 rounded-lg hover:bg-gray-800/50">{t('testimonials')}</a>
              <button onClick={() => setContactModal({ open: true, type: 'contact' })} className="text-gray-300 hover:text-white transition-colors font-normal px-4 py-2 rounded-lg hover:bg-gray-800/50">{t('contact')}</button>
            </nav>
            {/* Actions */}
            <div className="flex items-center gap-5 ml-auto shrink-0">
              <Button
                variant="ghost"
                onClick={handleLogin}
                className="text-gray-300 hover:text-white whitespace-nowrap font-medium px-6 py-2 rounded-xl transition-colors"
              >
                {t('login')}
              </Button>
              <Button
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white rounded-xl px-6 py-2 shadow-sm whitespace-nowrap transition-all font-medium"
              >
                {t('tryFree')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-950 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-6xl overflow-visible">
            <h1 className="font-light text-white mb-6 leading-[1.15] mt-8">
              <span className="block text-[clamp(16px,1.8vw,24px)] font-normal text-gray-300 mb-3">{language === 'tr' ? 'Yeni Nesil' : 'Next Generation'}</span>
              <span className="block tracking-tight text-[clamp(28px,5.2vw,64px)] font-bold leading-tight">
                <span className="text-white">
                  {language === 'tr' ? 'Pazarlama İstihbaratı ' : 'Marketing Intelligence for '}
                </span>
                <span className="bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent">
                  {language === 'tr' ? 'B2B SaaS için' : 'B2B SaaS'}
                </span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed max-w-5xl font-light whitespace-nowrap overflow-visible">
              {descText}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white px-8 py-4 rounded-xl font-light text-base shadow-md transition-all"
              >
                {t('tryFree')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="ghost"
                onClick={() => setContactModal({ open: true, type: 'demo' })}
                className="border-2 border-blue-800 text-white hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-950 hover:text-white px-8 py-4 rounded-xl font-light text-base shadow-md transition-all"
              >
                <Play className="w-4 h-4 mr-2" />
                {t('watchDemo')}
              </Button>
            </div>

            {/* References Marquee */}
            <div className="mt-16">
                <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .marquee-track { animation: marquee 40s linear infinite; will-change: transform; }`}</style>
                <div className="overflow-hidden">
                  <h3 className="text-center text-base font-medium text-gray-300 mb-12">{t('heroTrustedBy')}</h3>
                  <div className="relative">
                    <div className="flex marquee-track w-[200%]">
                      {[1,2].map(loop => (
                        <div key={loop} className="flex items-center w-1/2 gap-16" style={{justifyContent: 'space-evenly'}}>
                          {/* Intercom */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 140 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="currentColor">Intercom</text>
                          </svg>
                          {/* Mixpanel */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 140 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="currentColor">Mixpanel</text>
                          </svg>
                          {/* Amplitude */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 150 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="currentColor">Amplitude</text>
                          </svg>
                          {/* Calendly */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 130 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="currentColor">Calendly</text>
                          </svg>
                          {/* Airtable */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 120 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="currentColor">Airtable</text>
                          </svg>
                          {/* Webflow */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 130 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" fill="currentColor">Webflow</text>
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrated Platforms */}
      <section id="platforms" className="py-20 bg-gray-950 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
              {t('platformsTitle')}
            </h2>
            <p className="text-lg text-gray-400">
              {t('platformsSubtitle')} <span className="bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent font-semibold">{t('platformsSmartPoint')}</span>
            </p>
          </div>
          
          <style>{`
            @keyframes rotate { 
              from { transform: rotate(0deg); } 
              to { transform: rotate(360deg); } 
            }
            .orbit-track { 
              animation: rotate 30s linear infinite; 
            }
            .platform-item {
              /* Animasyon yok */
            }
            .platform-item > div {
              /* İçerideki div'i ters döndürerek sabit tut */
              animation: rotate 30s linear infinite reverse;
            }
            @keyframes pulse-line {
              0%, 100% { opacity: 0; }
              50% { opacity: 0.4; }
            }
            .connection-line {
              animation: pulse-line 3s ease-in-out infinite;
            }
          `}</style>
          
          <div className="relative flex items-center justify-center" style={{minHeight: '400px'}}>
            {/* Center - IQsion Logo */}
            <div className="absolute z-20 w-28 h-28 flex items-center justify-center">
              <img 
                src="/iqsion.logo.png" 
                alt="IQsion" 
                className="w-full h-full object-contain mix-blend-lighten drop-shadow-2xl"
              />
            </div>

            {/* Connection lines from center to platforms */}
            <svg className="absolute inset-0" style={{width: '100%', height: '100%', pointerEvents: 'none'}}>
              <line x1="50%" y1="50%" x2="50%" y2="10%" className="connection-line" stroke="#1e40af" strokeWidth="1" />
              <line x1="50%" y1="50%" x2="65%" y2="15%" className="connection-line" stroke="#1e40af" strokeWidth="1" style={{animationDelay: '0.4s'}} />
              <line x1="50%" y1="50%" x2="82%" y2="50%" className="connection-line" stroke="#1e40af" strokeWidth="1" style={{animationDelay: '0.8s'}} />
              <line x1="50%" y1="50%" x2="65%" y2="85%" className="connection-line" stroke="#1e40af" strokeWidth="1" style={{animationDelay: '1.2s'}} />
              <line x1="50%" y1="50%" x2="50%" y2="90%" className="connection-line" stroke="#1e40af" strokeWidth="1" style={{animationDelay: '1.6s'}} />
              <line x1="50%" y1="50%" x2="35%" y2="85%" className="connection-line" stroke="#1e40af" strokeWidth="1" style={{animationDelay: '2s'}} />
              <line x1="50%" y1="50%" x2="18%" y2="50%" className="connection-line" stroke="#1e40af" strokeWidth="1" style={{animationDelay: '2.4s'}} />
              <line x1="50%" y1="50%" x2="35%" y2="15%" className="connection-line" stroke="#1e40af" strokeWidth="1" style={{animationDelay: '2.8s'}} />
            </svg>

            {/* Rotating orbit ring - sadece çizgi */}
            <div className="orbit-track absolute rounded-full" style={{width: '380px', height: '380px'}}></div>

            {/* Static platform logos - orbit dışında */}
            <div className="absolute" style={{width: '380px', height: '380px'}}>
              {/* Meta - Top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                  <BrandLogo name="meta" size={40} mono={true} />
                </div>
              </div>

              {/* Google Ads - Top Right */}
              <div className="absolute" style={{top: '7%', right: '18%'}}>
                <div className="h-10 w-10 flex items-center justify-center">
                  <img src="/Google_Ads_logo.svg.png" alt="Google Ads" className="w-10 h-10 object-contain grayscale opacity-60" />
                </div>
              </div>

              {/* TikTok - Right */}
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                  <BrandLogo name="tiktok" size={40} mono={true} />
                </div>
              </div>

              {/* Reddit - Bottom Right */}
              <div className="absolute" style={{bottom: '7%', right: '18%'}}>
                <div className="h-10 w-10 flex items-center justify-center">
                  <img src="/reddit-icon-logo.png" alt="Reddit" className="w-10 h-10 object-contain grayscale opacity-60" />
                </div>
              </div>

              {/* Analytics - Bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                  <BrandLogo name="googleanalytics" size={40} mono={true} />
                </div>
              </div>

              {/* HubSpot - Bottom Left */}
              <div className="absolute" style={{bottom: '10%', left: '20%'}}>
                <div className="h-10 w-10 flex items-center justify-center">
                  <img src="/hubspot.svg" alt="HubSpot" className="w-11 h-11 object-contain grayscale opacity-60" />
                </div>
              </div>

              {/* LinkedIn - Left */}
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
                <div className="h-10 w-10 flex items-center justify-center">
                  <svg width={40} height={40} viewBox="0 0 192 192" className="text-gray-400" fill="currentColor">
                    <rect x="30" y="30" width="132" height="132" rx="20"/>
                    <text x="96" y="125" textAnchor="middle" fontSize="90" fontWeight="700" fill="black">in</text>
                  </svg>
                </div>
              </div>

              {/* Salesforce - Top Left */}
              <div className="absolute" style={{top: '7%', left: '18%'}}>
                <div className="h-10 w-10 flex items-center justify-center">
                  <img src="/Salesforce.com_logo.svg.png" alt="Salesforce" className="w-10 h-10 object-contain grayscale opacity-60" />
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Intelligence Cycle */}
          <div className="mt-20 text-center">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-light">
              <span className="text-gray-300">Analysis</span>
              <span className="text-gray-400">, </span>
              <span className="text-gray-300">Prediction</span>
              <span className="text-gray-400">, </span>
              <span className="text-gray-300">Action</span>
              <span className="text-gray-400">, </span>
              <span className="bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent font-medium">Automation</span>
            </h3>
            <p className="mt-6 text-gray-500 text-lg font-light max-w-3xl mx-auto">
              Intelligence Transforming Chaos into Clarity. Derived from its DNA: "IQ" + "Action"
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              {t('dashboardMainTitle')}
            </h2>
            <p className="text-lg font-light text-gray-400 max-w-3xl mx-auto">
              {activeDashboardView === 'overview' && t('dashboardOverviewSubtitle')}
              {activeDashboardView === 'ai' && t('dashboardAISubtitle')}
              {activeDashboardView === 'audit' && t('dashboardAuditSubtitle')}
              {activeDashboardView === 'reports' && 'Build custom reports to visualize your B2B SaaS metrics exactly how you need them'}
              {activeDashboardView === 'attribution' && 'Understand which channels drive your highest-value customers and optimize your acquisition strategy'}
            </p>
          </div>

          {/* Dashboard View Tabs */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-8 flex-wrap px-2">
            <button 
              onClick={() => setActiveDashboardView('overview')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'overview' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {t('dashboardTabOverview')}
            </button>
            <button 
              onClick={() => setActiveDashboardView('ai')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'ai' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {t('dashboardTabAI')}
            </button>
            <button 
              onClick={() => setActiveDashboardView('audit')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'audit' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {t('dashboardTabAudit')}
            </button>
            <button 
              onClick={() => setActiveDashboardView('reports')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'reports' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Custom Reports
            </button>
            <button 
              onClick={() => setActiveDashboardView('attribution')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'attribution' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Attribution
            </button>
          </div>

          {/* Dashboard Interface */}
          <div className="relative">
            <Card className="relative bg-gray-800 border border-gray-700 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gray-900 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-400">app.iqsion.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-400">Live Data</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Overview View */}
                {activeDashboardView === 'overview' && (
                  <>
                {/* Date Filter & Data Sources */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-400 text-xs">Data Sources:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Google Ads */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center p-1" title="Google Ads">
                        <img src="/Google_Ads_logo.svg.png" className="w-full h-full object-contain opacity-60" alt="Google Ads" />
                      </div>
                      {/* Meta */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center" title="Meta">
                        <BrandLogo name="meta" size={16} mono={true} />
                      </div>
                      {/* HubSpot */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center p-1" title="HubSpot">
                        <img src="/hubspot.svg" className="w-full h-full object-contain opacity-60" alt="HubSpot" />
                      </div>
                      {/* Google Analytics */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center" title="Google Analytics">
                        <BrandLogo name="googleanalytics" size={16} mono={true} />
                      </div>
                      <span className="text-gray-500 text-xs ml-1">+3</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm font-medium">Last 30 Days</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: KPI Cards + AI Insights */}
                  <div className="flex-1 space-y-6">
                    {/* KPI Cards Grid - B2B SaaS: All-in-One Platform - CRM + Sales + Marketing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: TrendingUp, label: 'Total Revenue', value: '$847K', change: '+28.5%', color: 'green', trend: [60, 63, 67, 70, 74, 78, 82, 85, 88, 92, 95, 97, 99, 100], isPositive: true },
                        { icon: CircleDollarSign, label: 'MRR (Monthly Recurring)', value: '$124K', change: '+15.3%', color: 'emerald', trend: [65, 68, 71, 74, 77, 80, 83, 86, 89, 92, 94, 96, 98, 100], isPositive: true },
                        { icon: Users, label: 'Total Leads', value: '2,847', change: '+23.4%', color: 'blue', trend: [55, 58, 62, 65, 68, 72, 75, 78, 82, 85, 88, 91, 95, 98], isPositive: true },
                        { icon: TrendingUp, label: 'Qualified Leads (MQL)', value: '1,124', change: '+18.7%', color: 'cyan', trend: [60, 63, 67, 70, 73, 76, 80, 83, 86, 89, 92, 94, 97, 100], isPositive: true },
                        { icon: CircleDollarSign, label: 'Pipeline Value (Open Deals)', value: '$2.4M', change: '+31.2%', color: 'violet', trend: [65, 68, 72, 75, 78, 82, 85, 88, 92, 95, 97, 99, 100, 98], isPositive: true },
                        { icon: Zap, label: 'Customer LTV', value: '$18.5K', change: '+9.8%', color: 'purple', trend: [70, 72, 75, 78, 81, 84, 87, 90, 92, 94, 96, 97, 99, 100], isPositive: true },
                        { icon: BarChart3, label: 'Ad Spend', value: '$42K', change: '+8.2%', color: 'orange', trend: [60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92], isPositive: false },
                        { icon: Zap, label: 'ROAS', value: '5.8x', change: '+12.3%', color: 'pink', trend: [70, 72, 75, 78, 82, 85, 88, 91, 94, 96, 98, 99, 100, 98], isPositive: true },
                        { icon: BarChart2, label: 'Cost per Lead (CPL)', value: '$14.87', change: '-15.6%', color: 'indigo', trend: [95, 92, 88, 85, 82, 78, 75, 72, 68, 65, 62, 58, 55, 52], isPositive: true }
                      ].map((kpi, i) => (
                        <Card key={i} className="bg-gray-900/50 border border-gray-700/50 hover:border-gray-600 transition-all group">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className={`w-8 h-8 ${
                                kpi.color === 'green' ? 'bg-green-600/20' :
                                kpi.color === 'emerald' ? 'bg-emerald-600/20' :
                                kpi.color === 'cyan' ? 'bg-cyan-600/20' :
                                kpi.color === 'blue' ? 'bg-blue-600/20' :
                                kpi.color === 'violet' ? 'bg-violet-600/20' :
                                kpi.color === 'purple' ? 'bg-purple-600/20' :
                                kpi.color === 'pink' ? 'bg-pink-600/20' :
                                kpi.color === 'orange' ? 'bg-orange-600/20' :
                                'bg-indigo-600/20'
                              } rounded-lg flex items-center justify-center`}>
                                <kpi.icon className={`w-4 h-4 ${
                                  kpi.color === 'green' ? 'text-green-400' :
                                  kpi.color === 'emerald' ? 'text-emerald-400' :
                                  kpi.color === 'cyan' ? 'text-cyan-400' :
                                  kpi.color === 'blue' ? 'text-blue-400' :
                                  kpi.color === 'violet' ? 'text-violet-400' :
                                  kpi.color === 'purple' ? 'text-purple-400' :
                                  kpi.color === 'pink' ? 'text-pink-400' :
                                  kpi.color === 'orange' ? 'text-orange-400' :
                                  'text-indigo-400'
                                }`} />
                              </div>
                              <span className={`${kpi.isPositive ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'} text-xs font-medium px-2 py-0.5 rounded`}>
                                {kpi.change}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs mb-1">{kpi.label}</p>
                            <p className="text-xl font-semibold text-white mb-3">{kpi.value}</p>
                            
                            {/* Line chart */}
                            <div className="h-12 relative">
                              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <defs>
                                  <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={
                                      kpi.color === 'green' ? '#22c55e' :
                                      kpi.color === 'emerald' ? '#10b981' :
                                      kpi.color === 'cyan' ? '#06b6d4' :
                                      kpi.color === 'blue' ? '#3b82f6' :
                                      kpi.color === 'violet' ? '#8b5cf6' :
                                      kpi.color === 'purple' ? '#a855f7' :
                                      kpi.color === 'pink' ? '#ec4899' :
                                      kpi.color === 'orange' ? '#f97316' :
                                      '#6366f1'
                                    } stopOpacity="0.3"/>
                                    <stop offset="100%" stopColor={
                                      kpi.color === 'green' ? '#22c55e' :
                                      kpi.color === 'emerald' ? '#10b981' :
                                      kpi.color === 'cyan' ? '#06b6d4' :
                                      kpi.color === 'blue' ? '#3b82f6' :
                                      kpi.color === 'violet' ? '#8b5cf6' :
                                      kpi.color === 'purple' ? '#a855f7' :
                                      kpi.color === 'pink' ? '#ec4899' :
                                      kpi.color === 'orange' ? '#f97316' :
                                      '#6366f1'
                                    } stopOpacity="0.05"/>
                                  </linearGradient>
                                </defs>
                                {/* Area fill */}
                                <path
                                  d={`M 0,40 ${kpi.trend.map((val, idx) => 
                                    `L ${(idx / (kpi.trend.length - 1)) * 100},${40 - (val / 100) * 35}`
                                  ).join(' ')} L 100,40 Z`}
                                  fill={`url(#gradient-${i})`}
                                />
                                {/* Line */}
                                <path
                                  d={`M ${kpi.trend.map((val, idx) => 
                                    `${(idx / (kpi.trend.length - 1)) * 100},${40 - (val / 100) * 35}`
                                  ).join(' L ')}`}
                                  fill="none"
                                  stroke={
                                    kpi.color === 'green' ? '#22c55e' :
                                    kpi.color === 'emerald' ? '#10b981' :
                                    kpi.color === 'cyan' ? '#06b6d4' :
                                    kpi.color === 'blue' ? '#3b82f6' :
                                    kpi.color === 'violet' ? '#8b5cf6' :
                                    kpi.color === 'purple' ? '#a855f7' :
                                    kpi.color === 'pink' ? '#ec4899' :
                                    kpi.color === 'orange' ? '#f97316' :
                                    '#6366f1'
                                  }
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* AI Insights - Vertical Layout */}
                    <div className="space-y-3">
                      {/* Opportunity */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-green-400 text-xs font-semibold uppercase">OPPORTUNITY</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">92% Confidence</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Optimize Lead Nurturing for Enterprise Segment</h4>
                              <p className="text-gray-400 text-xs mb-3">Enterprise leads respond 3.2x better to LinkedIn + Email touchpoints. Reallocating 30% of display budget could increase MQLs by ~340/month.</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-3">Auto Apply</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add to Todo</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Anomaly */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <AlertCircle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-400 text-xs font-semibold uppercase">ANOMALY</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">88% Confidence</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Sales Cycle Extended for Mid-Market Deals</h4>
                              <p className="text-gray-400 text-xs mb-3">Mid-market opportunities are taking 18 days longer than usual (47 vs 29 days). Main bottleneck: technical evaluation stage. Consider adding product demos earlier.</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white h-7 text-xs px-3">Analyze</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add to Todo</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Strategic Insight */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <Lightbulb className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-400 text-xs font-semibold uppercase">STRATEGY</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">Deep Analysis</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Launch Account-Based Marketing for Top 50 Accounts</h4>
                              <p className="text-gray-400 text-xs mb-3">Data shows 12 high-intent accounts visiting pricing 8+ times. ABM campaign targeting C-suite could accelerate pipeline by $780K in Q2.</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3">Create Campaign</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add to Todo</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Right: Today's Insight + IQsion AI Chat */}
                  <div className="w-full lg:w-80 space-y-6">
                    {/* Today's Insight */}
                    <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-blue-400" />
                          <h4 className="text-white font-semibold text-sm">Today's Insight</h4>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed mb-4">
                          Your SaaS trial-to-paid conversion rate improved 14% this week. Key driver: new in-app onboarding flow. Consider expanding this to all user segments.
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">AI Confidence Score</span>
                          <span className="text-blue-400 font-semibold">96%</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* IQsion AI Chat */}
                    <Card className="bg-gray-900/50 border border-gray-700/50">
                      <CardHeader className="bg-gray-800/50 border-b border-gray-700/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">IQsion AI Assistant</h4>
                            <p className="text-gray-400 text-xs">Ask anything about your data</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <Brain className="w-3 h-3 text-white" />
                          </div>
                          <div className="bg-gray-800 rounded-lg rounded-tl-none p-3 flex-1">
                            <p className="text-gray-300 text-xs">
                              {t('dashboardAIChatWelcome')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                            <p className="text-gray-300 text-xs">{t('dashboardAIChatOption1')}</p>
                          </button>
                          <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                            <p className="text-gray-300 text-xs">{t('dashboardAIChatOption2')}</p>
                          </button>
                          <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                            <p className="text-gray-300 text-xs">{t('dashboardAIChatOption3')}</p>
                          </button>
                        </div>

                        <div className="pt-3 border-t border-gray-700/50">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={t('dashboardAIChatPlaceholder')}
                              className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 placeholder:text-gray-500 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gray-600"
                            />
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0">
                              <Send className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                </>
                )}

                {/* AI Insights View */}
                {activeDashboardView === 'ai' && (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: AI Insights List */}
                    <div className="flex-1 space-y-3">
                      {/* LinkedIn ABM Campaign */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-green-400 text-xs font-semibold uppercase">OPPORTUNITY · ADVERTISING</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">92% Confidence</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Launch LinkedIn ABM campaign for top 50 enterprise accounts</h4>
                              <p className="text-gray-400 text-xs mb-3">LinkedIn shows highest engagement with 4.2x CTR in the last 30 days. Enterprise decision-makers are 78% more active on LinkedIn. Targeting C-suite could accelerate pipeline by $124K in Q1.</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-3">Auto Apply</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add To To-Do</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details →</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Demo Flow Optimization */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <Lightbulb className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-400 text-xs font-semibold uppercase">STRATEGY · CRO</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">88% Confidence</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Demo request drop-off rate 34% - Add instant meeting scheduler</h4>
                              <p className="text-gray-400 text-xs mb-3">34% of enterprise prospects abandon demo requests before scheduling. By offering 1-click calendar integration with Calendly/Google Calendar, potential to reduce drop-off rate to 12%. Monthly +$87K additional pipeline opportunity.</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3">Start Development</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add To To-Do</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details →</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Lead Scoring Enhancement */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <BarChart2 className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-purple-400 text-xs font-semibold uppercase">OPPORTUNITY · IN-STORE</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">85% Confidence</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Implement AI lead scoring model for sales prioritization</h4>
                              <p className="text-gray-400 text-xs mb-3">Sales team spends 60% of time on low-intent leads. According to behavior analysis, 43% of high-value deals show specific patterns. By adding predictive lead scoring, sales efficiency can increase by 27% on average (+$56K/month).</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs px-3">Apply Now</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add To To-Do</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details →</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Competitor Keyword Analysis */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <AlertCircle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-400 text-xs font-semibold uppercase">ANOMALY · ADVERTISING</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">91% Confidence</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Google Ads CPC 22% increase - Competitor activity</h4>
                              <p className="text-gray-400 text-xs mb-3">CPC average rose from $4.20 to $5.13 in the last 7 days. 3 new competitors are bidding aggressively on the same keywords. Potential to reduce CPC to $3.80 with long-tail keyword transition + negative keyword optimization.</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white h-7 text-xs px-3">Analyze</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add To To-Do</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details →</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Account Segmentation - Customer Intelligence */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-indigo-400 text-xs font-semibold uppercase">STRATEGY · SEGMENTATION</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">89% Confidence</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Create industry-specific content strategy for top 3 verticals</h4>
                              <p className="text-gray-400 text-xs mb-3">Data shows FinTech, HealthTech, and SaaS verticals generate 67% of pipeline but receive generic messaging. Industry-tailored case studies and use cases could increase conversion by 34% (+$45K monthly opportunity).</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs px-3">Create Strategy</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add To To-Do</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details →</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Email Nurture Automation */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <Send className="w-5 h-5 text-pink-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-pink-400 text-xs font-semibold uppercase">OPPORTUNITY · EMAIL</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">86% Confidence</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">Launch 7-touch email nurture for trial users who don't activate</h4>
                              <p className="text-gray-400 text-xs mb-3">52% of trial signups don't complete onboarding. Automated email sequence with product tips, case studies, and personal check-ins can increase activation rate by 28%. Estimated 180 additional activations/month.</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white h-7 text-xs px-3">Setup Automation</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">Assign To</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Add To To-Do</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">View Details →</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right: AI Summary + Chat */}
                    <div className="w-80 space-y-6">
                      {/* AI Summary */}
                      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-5 h-5 text-blue-400" />
                            <h4 className="text-white font-semibold text-sm">AI Recommendations</h4>
                          </div>
                          <p className="text-gray-300 text-xs leading-relaxed mb-4">
                            I've detected 6 high-impact opportunities for this month. Total potential: <span className="text-white font-semibold">+$312,100</span> additional pipeline. Most urgent: LinkedIn ABM campaign and demo flow optimization.
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">LinkedIn ABM Campaign</span>
                              <span className="text-green-400 font-semibold">+$124K</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Demo Flow Optimization</span>
                              <span className="text-blue-400 font-semibold">+$87K</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Lead Scoring Model</span>
                              <span className="text-purple-400 font-semibold">+$56K</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Email Nurture Sequences</span>
                              <span className="text-indigo-400 font-semibold">+$45K</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* IQsion AI Chat */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardHeader className="bg-gray-800/50 border-b border-gray-700/50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold text-sm">IQsion AI</h4>
                              <p className="text-gray-400 text-xs">Ask about recommendations</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                            <div className="bg-gray-800 rounded-lg rounded-tl-none p-3 flex-1">
                              <p className="text-gray-300 text-xs">
                                Which recommendation would you like to implement first? LinkedIn ABM can be launched in 2 weeks with immediate results.
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                              <p className="text-gray-300 text-xs">💡 How to launch ABM campaign?</p>
                            </button>
                            <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                              <p className="text-gray-300 text-xs">📊 What's needed for demo optimization?</p>
                            </button>
                            <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                              <p className="text-gray-300 text-xs">📧 Show email automation details</p>
                            </button>
                          </div>

                          <div className="pt-3 border-t border-gray-700/50">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Ask something..."
                                className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 placeholder:text-gray-500 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gray-600"
                              />
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 p-0">
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Technical Audit View */}
                {activeDashboardView === 'audit' && (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Audit Categories & Details */}
                    <div className="flex-1 space-y-6">
                      {/* Overall Score */}
                      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-white font-semibold text-lg mb-1">{t('dashboardAuditHealthScore')}</h3>
                              <p className="text-gray-400 text-xs">{t('dashboardAuditLastScan')} 2 {t('dashboardAuditHoursAgo')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="flex items-end gap-1">
                                  <span className="text-4xl font-bold text-yellow-400">78</span>
                                  <span className="text-gray-500 text-lg mb-1">/100</span>
                                </div>
                                <p className="text-xs text-gray-400">{t('dashboardAuditGood')}</p>
                              </div>
                              <div className="relative w-20 h-20">
                                <svg className="transform -rotate-90 w-20 h-20">
                                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-800" />
                                  <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="226" strokeDashoffset="49" className="text-yellow-400" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-white">78%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-400 mb-1">24</div>
                              <div className="text-xs text-gray-400">Successful</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-400 mb-1">8</div>
                              <div className="text-xs text-gray-400">Warning</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-400 mb-1">3</div>
                              <div className="text-xs text-gray-400">Critical</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400 mb-1">12</div>
                              <div className="text-xs text-gray-400">Improvement</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Category Scores */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: 'CRM & Sales Ops', score: 87, color: 'green', issues: 4 },
                          { label: 'Web Performance', score: 72, color: 'yellow', issues: 6 },
                          { label: 'Paid Acquisition', score: 91, color: 'green', issues: 3 },
                          { label: 'Organic Growth', score: 83, color: 'green', issues: 5 }
                        ].map((cat, i) => (
                          <Card key={i} className="bg-gray-900/50 border border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="text-white text-sm font-medium">{cat.label}</h4>
                                  <p className="text-gray-500 text-xs">{cat.issues} issues</p>
                                </div>
                                <div className={`text-2xl font-bold ${
                                  cat.color === 'green' ? 'text-green-400' :
                                  cat.color === 'yellow' ? 'text-yellow-400' :
                                  'text-orange-400'
                                }`}>
                                  {cat.score}
                                </div>
                              </div>
                              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${
                                  cat.color === 'green' ? 'bg-green-500' :
                                  cat.color === 'yellow' ? 'bg-yellow-500' :
                                  'bg-orange-500'
                                }`} style={{width: `${cat.score}%`}}></div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Detailed Issues by Category */}
                      <div className="space-y-4">
                        {/* CRM & Sales Ops Issues */}
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="text-white font-semibold text-sm">CRM & Sales Ops</h4>
                              <Badge className="bg-gray-800 text-gray-300 text-xs ml-auto">4 issues</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">HubSpot API sync failing: Contact duplicates detected</p>
                                  <p className="text-gray-400 text-xs">278 duplicate contacts. Lead scoring accuracy impacted by 34%.</p>
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 text-xs shrink-0">Critical</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Salesforce deal stages not mapped to pipeline</p>
                                  <p className="text-gray-400 text-xs">Revenue forecasting data incomplete. Requires field mapping update.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Medium</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">LinkedIn Lead Gen Forms integration inactive</p>
                                  <p className="text-gray-400 text-xs">Leads not auto-flowing to CRM. Manual entry required.</p>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs shrink-0">Low</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Web Performance Issues */}
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="text-white font-semibold text-sm">Web Performance</h4>
                              <Badge className="bg-gray-800 text-gray-300 text-xs ml-auto">6 issues</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Demo page load time: 4.2s (target: &lt;2s)</p>
                                  <p className="text-gray-400 text-xs">42% of visitors abandon before demo form loads. Compress images and enable CDN.</p>
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 text-xs shrink-0">Critical</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">SSL certificate expires in 12 days</p>
                                  <p className="text-gray-400 text-xs">Auto-renewal not configured. Browser warnings will impact trust.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Medium</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Mobile responsive issues on pricing page</p>
                                  <p className="text-gray-400 text-xs">Table layout breaks on mobile. 18% bounce rate on mobile devices.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Medium</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Paid Acquisition Audit */}
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="text-white font-semibold text-sm">Paid Acquisition</h4>
                              <Badge className="bg-gray-800 text-gray-300 text-xs ml-auto">3 issues</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">LinkedIn conversion tracking not configured</p>
                                  <p className="text-gray-400 text-xs">Lead Gen campaign ROI unmeasurable. Install Insight Tag on all pages.</p>
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 text-xs shrink-0">Critical</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Google Ads: 12 keywords with quality score &lt;5</p>
                                  <p className="text-gray-400 text-xs">High CPC impact. Ad relevance and landing page experience need improvement.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Medium</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Meta audience overlap 68% across campaigns</p>
                                  <p className="text-gray-400 text-xs">Internal competition driving up costs. Segment audiences by funnel stage.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Medium</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Organic Growth Audit */}
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="text-white font-semibold text-sm">Organic Growth</h4>
                              <Badge className="bg-gray-800 text-gray-300 text-xs ml-auto">5 issues</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">12 landing pages missing meta descriptions</p>
                                  <p className="text-gray-400 text-xs">Organic CTR 40% below industry avg. Critical for demo page visibility.</p>
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 text-xs shrink-0">Critical</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Blog lacks bottom-funnel content for buyers</p>
                                  <p className="text-gray-400 text-xs">Ranking for awareness-stage only. No "vs competitor" or comparison content.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Medium</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">No structured data for product pages</p>
                                  <p className="text-gray-400 text-xs">Missing SoftwareApplication schema. Lost rich snippet opportunities.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Medium</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Backlink profile lacks industry authority sites</p>
                                  <p className="text-gray-400 text-xs">Domain authority 38. Target guest posts on G2, Capterra review sites.</p>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs shrink-0">Low</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Internal linking structure not optimized</p>
                                  <p className="text-gray-400 text-xs">Demo page not linked from blog posts. Implement content hub strategy.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Medium</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Right: Quick Actions & Summary */}
                    <div className="w-full lg:w-80 space-y-6">
                      {/* Quick Fix Actions */}
                      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-800/50">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-5 h-5 text-green-400" />
                            <h4 className="text-white font-semibold text-sm">{t('dashboardAuditQuickFixes')}</h4>
                          </div>
                          <p className="text-gray-300 text-xs mb-4 leading-relaxed">
                            {t('dashboardAuditQuickFixesDesc')}
                          </p>
                          <div className="space-y-2">
                            <button className="w-full text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg p-3 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white text-xs font-medium">Fix LinkedIn conversion tracking</p>
                                <Badge className="bg-red-500/20 text-red-400 text-xs">Critical</Badge>
                              </div>
                              <p className="text-gray-400 text-xs">~3 hours</p>
                            </button>
                            <button className="w-full text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg p-3 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white text-xs font-medium">Add meta descriptions to all pages</p>
                                <Badge className="bg-red-500/20 text-red-400 text-xs">Critical</Badge>
                              </div>
                              <p className="text-gray-400 text-xs">~2 hours</p>
                            </button>
                            <button className="w-full text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg p-3 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white text-xs font-medium">Optimize demo page load time</p>
                                <Badge className="bg-red-500/20 text-red-400 text-xs">Critical</Badge>
                              </div>
                              <p className="text-gray-400 text-xs">~4 hours</p>
                            </button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Impact Summary */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            <h4 className="text-white font-semibold text-sm">{t('dashboardAuditImpactTitle')}</h4>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400 text-xs">{t('dashboardAuditSiteSpeed')}</span>
                                <span className="text-green-400 text-xs font-semibold">+58%</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{width: '58%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400 text-xs">{t('dashboardAuditOrganicTraffic')}</span>
                                <span className="text-green-400 text-xs font-semibold">+24%</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{width: '24%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400 text-xs">{t('dashboardAuditAdsConversion')}</span>
                                <span className="text-green-400 text-xs font-semibold">+31%</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{width: '31%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400 text-xs">{t('dashboardAuditMobileExp')}</span>
                                <span className="text-yellow-400 text-xs font-semibold">+42%</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{width: '42%'}}></div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-gray-300 text-xs leading-relaxed">
                              Estimated <span className="text-white font-semibold">+$58,300/mo</span> additional monthly revenue potential when all issues are fixed.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Last Scan Info */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <h4 className="text-white font-semibold text-sm">Scan Status</h4>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Last Scan</span>
                              <span className="text-gray-300">2 hours ago</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Data Points Scanned</span>
                              <span className="text-gray-300">47 points</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Next Scan</span>
                              <span className="text-gray-300">22 hours</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full mt-4 border-gray-700 text-gray-300 hover:bg-gray-800 h-8 text-xs">
                            Scan Now
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Custom Reports View */}
                {activeDashboardView === 'reports' && (
                  <div className="space-y-6">
                    {/* Report Builder Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">Custom Report Builder</h3>
                        <p className="text-gray-400 text-sm">Create custom reports tailored to your business needs</p>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Report
                      </Button>
                    </div>

                    {/* Saved Reports Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="bg-gray-900/50 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <BarChart className="w-5 h-5 text-blue-400" />
                              <h4 className="text-white font-semibold text-sm">Monthly MRR Breakdown</h4>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-3">Track MRR by plan type, cohort, and churn impact</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Last updated: 2h ago</span>
                            <button className="text-blue-400 hover:text-blue-300">View →</button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900/50 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-green-400" />
                              <h4 className="text-white font-semibold text-sm">Sales Pipeline Velocity</h4>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-3">Avg days in each deal stage, conversion rates</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Last updated: 1h ago</span>
                            <button className="text-blue-400 hover:text-blue-300">View →</button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900/50 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-purple-400" />
                              <h4 className="text-white font-semibold text-sm">Lead Source Performance</h4>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-3">Compare CPL, MQL rate, SQL conversion by source</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Last updated: 3h ago</span>
                            <button className="text-blue-400 hover:text-blue-300">View →</button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900/50 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-yellow-400" />
                              <h4 className="text-white font-semibold text-sm">CAC Payback Period</h4>
                            </div>
                            <Badge className="bg-gray-500/20 text-gray-400 text-xs">Scheduled</Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-3">Time to recover customer acquisition cost</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Runs: Weekly on Mon</span>
                            <button className="text-blue-400 hover:text-blue-300">Edit →</button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900/50 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Target className="w-5 h-5 text-red-400" />
                              <h4 className="text-white font-semibold text-sm">Churn Risk Dashboard</h4>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-3">Customers with low engagement & usage scores</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Last updated: 30m ago</span>
                            <button className="text-blue-400 hover:text-blue-300">View →</button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900/50 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer group">
                        <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[140px]">
                          <Plus className="w-8 h-8 text-gray-600 group-hover:text-blue-400 transition-colors mb-2" />
                          <p className="text-gray-500 group-hover:text-gray-400 text-sm font-medium transition-colors">Create New Report</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Report Templates */}
                    <Card className="bg-gray-900/50 border border-gray-700/50">
                      <CardContent className="p-5">
                        <h4 className="text-white font-semibold text-sm mb-4">Popular Templates</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
                            <div className="flex items-start gap-3">
                              <BarChart className="w-5 h-5 text-blue-400 mt-0.5" />
                              <div className="flex-1">
                                <h5 className="text-white text-sm font-semibold mb-1">SaaS Executive Summary</h5>
                                <p className="text-gray-400 text-xs">MRR, ARR, churn, CAC, LTV - all key metrics</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer">
                            <div className="flex items-start gap-3">
                              <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                              <div className="flex-1">
                                <h5 className="text-white text-sm font-semibold mb-1">Growth Metrics Dashboard</h5>
                                <p className="text-gray-400 text-xs">User growth, activation, expansion revenue</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Attribution View */}
                {activeDashboardView === 'attribution' && (
                  <div className="space-y-6">
                    {/* Attribution Model Selector */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">Attribution Analysis</h3>
                        <p className="text-gray-400 text-sm">Understand which touchpoints drive conversions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2">
                          <option>Multi-Touch (W-shaped)</option>
                          <option>First Touch</option>
                          <option>Last Touch</option>
                          <option>Linear</option>
                          <option>Time Decay</option>
                        </select>
                      </div>
                    </div>

                    {/* Attribution Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-400 text-xs">Total Touchpoints</span>
                          </div>
                          <div className="text-2xl font-bold text-white">2,847</div>
                          <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-gray-400 text-xs">Converted Leads</span>
                          </div>
                          <div className="text-2xl font-bold text-white">412</div>
                          <div className="text-xs text-green-400 mt-1">+18.3% vs last month</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-400 text-xs">Avg Journey Length</span>
                          </div>
                          <div className="text-2xl font-bold text-white">6.4</div>
                          <div className="text-xs text-gray-400 mt-1">Touchpoints per customer</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-400 text-xs">Revenue Attributed</span>
                          </div>
                          <div className="text-2xl font-bold text-white">$847K</div>
                          <div className="text-xs text-green-400 mt-1">+28.5% MoM</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Channel Attribution Table */}
                    <Card className="bg-gray-900/50 border border-gray-700/50">
                      <CardContent className="p-5">
                        <h4 className="text-white font-semibold text-sm mb-4">Channel Performance (W-shaped Model)</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              LI
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-sm font-semibold">LinkedIn Ads</span>
                                <span className="text-white text-sm font-bold">$324K</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">38% attributed revenue</span>
                                <span className="text-green-400">156 conversions</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-blue-500" style={{width: '38%'}}></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              OR
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-sm font-semibold">Organic Search</span>
                                <span className="text-white text-sm font-bold">$186K</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">22% attributed revenue</span>
                                <span className="text-green-400">91 conversions</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-green-500" style={{width: '22%'}}></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              WB
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-sm font-semibold">Webinars</span>
                                <span className="text-white text-sm font-bold">$169K</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">20% attributed revenue</span>
                                <span className="text-green-400">83 conversions</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-purple-500" style={{width: '20%'}}></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              EM
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-sm font-semibold">Email Marketing</span>
                                <span className="text-white text-sm font-bold">$127K</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">15% attributed revenue</span>
                                <span className="text-green-400">62 conversions</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-orange-500" style={{width: '15%'}}></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              PD
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-sm font-semibold">Paid Search (Google)</span>
                                <span className="text-white text-sm font-bold">$41K</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">5% attributed revenue</span>
                                <span className="text-green-400">20 conversions</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-red-500" style={{width: '5%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Customer Journey Visualization */}
                    <Card className="bg-gray-900/50 border border-gray-700/50">
                      <CardContent className="p-5">
                        <h4 className="text-white font-semibold text-sm mb-4">Common Conversion Paths</h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-400 text-xs">Most Common Path (28% of conversions)</span>
                              <span className="text-white text-sm font-bold">$237K revenue</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">Organic Search</Badge>
                              <span className="text-gray-600">→</span>
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">Webinar</Badge>
                              <span className="text-gray-600">→</span>
                              <Badge className="bg-orange-500/20 text-orange-400 text-xs">Email Nurture</Badge>
                              <span className="text-gray-600">→</span>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">LinkedIn Ad</Badge>
                              <span className="text-gray-600">→</span>
                              <Badge className="bg-green-500/20 text-green-400 text-xs">Demo Request</Badge>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-400 text-xs">High-Value Path (18% of conversions)</span>
                              <span className="text-white text-sm font-bold">$184K revenue</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">LinkedIn Ad</Badge>
                              <span className="text-gray-600">→</span>
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">Webinar</Badge>
                              <span className="text-gray-600">→</span>
                              <Badge className="bg-green-500/20 text-green-400 text-xs">Demo Request</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              {t('actionTitle')} <span className="bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent font-semibold">{t('actionTitleHighlight')}</span>
            </h2>
            <p className="text-lg font-light text-gray-400 max-w-4xl mx-auto">
              {t('actionSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                title: t('actionCard1Title'),
                description: t('actionCard1Description'),
                features: [
                  t('actionCard1Feature1'),
                  t('actionCard1Feature2'),
                  t('actionCard1Feature3')
                ]
              },
              {
                icon: TrendingUp,
                title: t('actionCard2Title'),
                description: t('actionCard2Description'),
                features: [
                  t('actionCard2Feature1'),
                  t('actionCard2Feature2'),
                  t('actionCard2Feature3')
                ]
              },
              {
                icon: Bell,
                title: t('actionCard3Title'),
                description: t('actionCard3Description'),
                features: [
                  t('actionCard3Feature1'),
                  t('actionCard3Feature2'),
                  t('actionCard3Feature3')
                ]
              },
              {
                icon: CircleDollarSign,
                title: t('actionCard4Title'),
                description: t('actionCard4Description'),
                features: [
                  t('actionCard4Feature1'),
                  t('actionCard4Feature2'),
                  t('actionCard4Feature3')
                ]
              },
              {
                icon: LineChart,
                title: t('actionCard5Title'),
                description: t('actionCard5Description'),
                features: [
                  t('actionCard5Feature1'),
                  t('actionCard5Feature2'),
                  t('actionCard5Feature3')
                ]
              },
              {
                icon: Zap,
                title: t('actionCard6Title'),
                description: t('actionCard6Description'),
                features: [
                  t('actionCard6Feature1'),
                  t('actionCard6Feature2'),
                  t('actionCard6Feature3')
                ]
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <feature.icon className="w-9 h-9 stroke-[1.5]" style={{
                      stroke: 'url(#iconGradient' + index + ')',
                      fill: 'none'
                    }} />
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                      <defs>
                        <linearGradient id={'iconGradient' + index} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">{feature.title}</h3>
                  <p className="text-sm font-light text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              {t('featuresTitle')}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t('featuresSubtitle')}
            </p>

            {/* Target Audience Tabs */}
            <div className="flex justify-center gap-3 mb-12">
              <button 
                onClick={() => setActiveAudience('companies')}
                className={`px-8 py-3 rounded-xl border font-medium transition-colors ${
                  activeAudience === 'companies' 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {t('featuresTabCompanies')}
              </button>
              <button 
                onClick={() => setActiveAudience('agencies')}
                className={`px-8 py-3 rounded-xl border font-medium transition-colors ${
                  activeAudience === 'agencies' 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {t('featuresTabAgencies')}
              </button>
              <button 
                onClick={() => setActiveAudience('entrepreneurs')}
                className={`px-8 py-3 rounded-xl border font-medium transition-colors ${
                  activeAudience === 'entrepreneurs' 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {t('featuresTabEntrepreneurs')}
              </button>
            </div>

            {/* Audience Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {activeAudience === 'companies' && (
                <>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresCard1Title')}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresCard2Title')}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresCard3Title')}</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeAudience === 'agencies' && (
                <>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresAgency1')}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresAgency2')}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Database className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresAgency3')}</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeAudience === 'entrepreneurs' && (
                <>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Lightbulb className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresEntrepreneur1')}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Map className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresEntrepreneur2')}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">{t('featuresEntrepreneur3')}</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-light text-white mb-2">{t('pricingFreePlan')}</h3>
                  <p className="text-gray-400 text-sm">{t('pricingFreeDesc')}</p>
                </div>
                <ul className="space-y-3 mb-8 min-h-[240px]">
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeature1Platform')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureBasicDashboard')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureMonthlyReports')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureCommunitySupport')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeature7DaysHistory')}</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all"
                  onClick={() => setContactModal({ open: true, type: 'contact' })}
                >
                  {t('pricingContactUs')}
                </Button>
              </CardContent>
            </Card>

            {/* Starter Plan */}
            <Card className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-light text-white mb-2">{t('pricingStarterPlan')}</h3>
                  <p className="text-gray-400 text-sm">{t('pricingStarterDesc')}</p>
                </div>
                <ul className="space-y-3 mb-8 min-h-[240px]">
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeature3Platforms')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureBasicAI')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureWeeklyReports')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureEmailSupport')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeature30DaysHistory')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureBasicCompetitor')}</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all"
                  onClick={() => setContactModal({ open: true, type: 'contact' })}
                >
                  {t('pricingContactUs')}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan - Most Popular */}
            <Card className="bg-gradient-to-br from-blue-950/30 to-gray-900/50 border border-blue-900/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-900/80 text-blue-200 px-4 py-1 text-xs border border-blue-800/50">
                  {t('pricingMostPopular')}
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-light text-white mb-2">{t('pricingProPlan')}</h3>
                  <p className="text-gray-400 text-sm">{t('pricingProDesc')}</p>
                </div>
                <ul className="space-y-3 mb-8 min-h-[240px]">
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">{t('pricingFeatureUnlimited')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">{t('pricingFeatureAdvancedAI')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">{t('pricingFeatureAutoOptimization')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">{t('pricingFeatureDailyReports')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">{t('pricingFeaturePrioritySupport')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">{t('pricingFeature1YearHistory')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">{t('pricingFeatureDetailedCompetitor')}</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all"
                  onClick={() => setContactModal({ open: true, type: 'contact' })}
                >
                  {t('pricingContactUs')}
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h3 className="text-xl font-light text-white mb-2">{t('pricingEnterprisePlan')}</h3>
                  <p className="text-gray-400 text-sm">{t('pricingEnterpriseDesc')}</p>
                </div>
                <ul className="space-y-3 mb-8 min-h-[240px]">
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureCustomIntegrations')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureAPIAccess')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureCustomAI')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureRealTimeAnalytics')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureAccountManager')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureUnlimitedHistory')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureSLA')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-400 text-sm">{t('pricingFeatureCustomTraining')}</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all"
                  onClick={() => setContactModal({ open: true, type: 'contact' })}
                >
                  {t('pricingContactUs')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="testimonials" className="py-24 bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              {t('caseStudiesTitle')}
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              {t('caseStudiesSubtitle')}
            </p>
          </div>

          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide pb-8">
              <div className="flex gap-6 min-w-max px-4">
                {[
                  {
                    company: 'CloudSync',
                    industry: 'Cloud Storage SaaS',
                    logo: 'CS',
                    metric1: '+156%',
                    metric1Label: t('caseStudyRoasIncrease'),
                    metric2: '$84K',
                    metric2Label: t('caseStudyMonthlyRevenue'),
                    quote: t('caseStudy1Quote'),
                    author: t('caseStudy1Author'),
                    role: t('caseStudy1Role'),
                    image: 'SM',
                    challenge: t('caseStudy1Challenge'),
                    solution: t('caseStudy1Solution'),
                    bgColor: 'from-blue-950/20'
                  },
                  {
                    company: 'DataFlow Analytics',
                    industry: 'Data Analytics Platform',
                    logo: 'DF',
                    metric1: '+89%',
                    metric1Label: t('caseStudyConversionIncrease'),
                    metric2: '-42%',
                    metric2Label: t('caseStudyCAC'),
                    quote: t('caseStudy2Quote'),
                    author: t('caseStudy2Author'),
                    role: 'VP of Growth',
                    image: 'DC',
                    challenge: t('caseStudy2Challenge'),
                    solution: t('caseStudy2Solution'),
                    bgColor: 'from-gray-900/50'
                  },
                  {
                    company: 'SalesForce Pro',
                    industry: 'Sales Automation',
                    logo: 'SF',
                    metric1: '3.2x',
                    metric1Label: t('caseStudyROI'),
                    metric2: '+124%',
                    metric2Label: t('caseStudyOrganicTraffic'),
                    quote: t('caseStudy3Quote'),
                    author: t('caseStudy3Author'),
                    role: 'Head of Marketing',
                    image: 'ER',
                    challenge: t('caseStudy3Challenge'),
                    solution: t('caseStudy3Solution'),
                    bgColor: 'from-purple-950/20'
                  },
                  {
                    company: 'TechStack Solutions',
                    industry: 'DevOps Platform',
                    logo: 'TS',
                    metric1: '+210%',
                    metric1Label: t('caseStudyEmailConversion'),
                    metric2: '180h',
                    metric2Label: t('caseStudyYearlySavings'),
                    quote: t('caseStudy4Quote'),
                    author: t('caseStudy4Author'),
                    role: 'Marketing Director',
                    image: 'JP',
                    challenge: t('caseStudy4Challenge'),
                    solution: t('caseStudy4Solution'),
                    bgColor: 'from-green-950/20'
                  }
                ].map((caseStudy, i) => (
                  <Card key={i} className={`bg-gradient-to-br ${caseStudy.bgColor} to-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all w-[420px] flex-shrink-0 group`}>
                    <CardContent className="p-8">
                      {/* Header with logo and industry */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-3">
                            <span className="text-white font-bold text-sm">{caseStudy.logo}</span>
                          </div>
                          <h3 className="text-white font-semibold text-lg mb-1">{caseStudy.company}</h3>
                          <p className="text-gray-400 text-xs">{caseStudy.industry}</p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                        <div>
                          <div className="text-2xl font-bold text-white mb-1">{caseStudy.metric1}</div>
                          <div className="text-xs text-gray-400">{caseStudy.metric1Label}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white mb-1">{caseStudy.metric2}</div>
                          <div className="text-xs text-gray-400">{caseStudy.metric2Label}</div>
                        </div>
                      </div>

                      {/* Quote */}
                      <div className="mb-6">
                        <p className="text-gray-300 text-sm leading-relaxed italic">
                          &quot;{caseStudy.quote}&quot;
                        </p>
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-3 pb-6 mb-6 border-b border-gray-800">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {caseStudy.image}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{caseStudy.author}</p>
                          <p className="text-gray-400 text-xs">{caseStudy.role}</p>
                        </div>
                      </div>

                      {/* Challenge & Solution */}
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="text-gray-500 uppercase font-semibold mb-1">{t('caseStudyChallenge')}</div>
                          <div className="text-gray-400">{caseStudy.challenge}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase font-semibold mb-1">{t('caseStudySolution')}</div>
                          <div className="text-gray-300">{caseStudy.solution}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Gradient overlays for scroll indication */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-white mb-6">
              {t('faqTitle')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('faqSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                category: t('faqCategoryStart'),
                question: t('faqQ1'),
                answer: t('faqA1')
              },
              {
                category: t('faqCategoryIntegration'),
                question: t('faqQ2'),
                answer: t('faqA2')
              },
              {
                category: t('faqCategoryCost'),
                question: t('faqQ3'),
                answer: t('faqA3')
              },
              {
                category: t('faqCategorySecurity'),
                question: t('faqQ4'),
                answer: t('faqA4')
              },
              {
                category: t('faqCategoryUsage'),
                question: t('faqQ5'),
                answer: t('faqA5')
              },
              {
                category: t('faqCategoryResults'),
                question: t('faqQ6'),
                answer: t('faqA6')
              },
              {
                category: t('faqCategoryFlexibility'),
                question: t('faqQ7'),
                answer: t('faqA7')
              },
              {
                category: t('faqCategorySupport'),
                question: t('faqQ8'),
                answer: t('faqA8')
              },
              {
                category: t('faqCategoryAI'),
                question: t('faqQ9'),
                answer: t('faqA9')
              },
              {
                category: t('faqCategoryScale'),
                question: t('faqQ10'),
                answer: t('faqA10')
              },
              {
                category: t('faqCategoryComparison'),
                question: t('faqQ11'),
                answer: t('faqA11')
              },
              {
                category: t('faqCategoryFuture'),
                question: t('faqQ12'),
                answer: t('faqA12')
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all group">
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-8 py-6 flex items-start justify-between text-left hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1 pr-4">
                      <div className="flex-1">
                        <Badge className="bg-gray-800 text-gray-400 border-0 mb-2 text-xs">
                          {faq.category}
                        </Badge>
                        <h3 className="text-white font-medium text-lg leading-tight">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform mt-1 ${
                        openFaqIndex === index ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-8 pb-6 pt-2">
                      <p className="text-gray-300 leading-relaxed text-base">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center p-8 bg-gradient-to-br from-blue-950/20 to-gray-900/50 border border-gray-800 rounded-2xl">
            <h3 className="text-2xl font-light text-white mb-3">
              {t('faqMoreQuestionsTitle')}
            </h3>
            <p className="text-gray-400 mb-6">
              {t('faqMoreQuestionsDesc')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800 px-6 py-3"
                onClick={() => window.location.href = 'mailto:contact@iqsion.com'}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              {t('blogTitle')}
            </h2>
            <p className="text-xl text-gray-300">
              {t('blogSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Multi-Touch Attribution: B2B SaaS Strategy 2025',
                excerpt: '7 proven tactics to maximize your lead-to-revenue attribution.',
                date: 'Nov 15, 2025',
                readTime: '5 min',
                category: 'Strategy'
              },
              {
                title: 'AI-Powered Lead Scoring: Implementation Guide',
                excerpt: 'Increase your SQL conversion by 40% with AI-driven segmentation.',
                date: 'Nov 12, 2025',
                readTime: '7 min',
                category: 'AI & Automation'
              },
              {
                title: 'LinkedIn Ads vs Google Ads: 2025 B2B Comparison',
                excerpt: 'Which platform is right for your business? Detailed analysis.',
                date: 'Nov 8, 2025',
                readTime: '6 min',
                category: 'Channel Analysis'
              }
            ].map((post, index) => (
              <Card key={index} className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors group cursor-pointer">
                <CardContent className="p-0">
                  <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                        {post.category}
                      </Badge>
                      <span className="text-gray-500 text-xs">{post.date}</span>
                      <span className="text-gray-500 text-xs">• {post.readTime}</span>
                    </div>
                    <h3 className="text-white font-medium text-lg mb-2 group-hover:text-gray-300 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8 py-3 rounded-xl font-medium">
              {t('blogViewAll')}
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-light text-white mb-4">
                {t('newsletterTitle')}
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                {t('newsletterDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder={t('newsletterPlaceholder')}
                  className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-600 h-14"
                />
                <Button className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white px-8 rounded-xl font-medium transition-all whitespace-nowrap h-14">
                  {t('newsletterButton')}
                </Button>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                {t('newsletterDisclaimer')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-gray-400 mb-12 text-lg">
            {t('ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              size="lg"
              onClick={() => (window.location.href = '/auth')}
              className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white px-12 py-6 rounded-xl font-medium text-lg transition-all"
            >
              {t('ctaTryFree')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              onClick={() => setContactModal({ open: true, type: 'demo' })}
              className="bg-transparent border-2 border-blue-800 hover:border-blue-700 text-white hover:text-gray-100 px-12 py-6 rounded-xl font-medium text-lg transition-all"
            >
              {t('ctaRequestDemo')}
            </Button>
          </div>
          <p className="text-gray-500 text-sm">
            {t('ctaDisclaimer')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <a href="/" className="flex items-center gap-3 mb-6 group">
                <img 
                  src="/iqsion.logo.png" 
                  alt="IQsion" 
                  className="h-10 w-auto mix-blend-lighten"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-900 transition-all">IQsion</span>
              </a>
              <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                {t('footerDescription')}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-300 font-medium ml-2">5.0</span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-400">500+ {t('footerBusinesses')}</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">{t('footerProduct')}</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">{t('footerFeatures')}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t('footerPricing')}</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">{t('footerCaseStudies')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerIntegrations')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerUpdates')}</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">{t('footerSupport')}</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footerHelpCenter')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerDocumentation')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerAPIReference')}</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">{t('footerContact')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerStatus')}</a></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">{t('footerCompany')}</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footerAbout')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerBlog')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerCareers')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerPressKit')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footerPartners')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2025 IQsion. {t('footerCopyright')}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <button onClick={() => setOpenModal('privacy')} className="text-gray-500 hover:text-white transition-colors">{t('footerPrivacy')}</button>
                <button onClick={() => setOpenModal('terms')} className="text-gray-500 hover:text-white transition-colors">{t('footerTerms')}</button>
                <button onClick={() => setOpenModal('cookies')} className="text-gray-500 hover:text-white transition-colors">{t('footerCookies')}</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-gray-900 border border-gray-700 max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader className="bg-gray-800 border-b border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-light text-white">
                  {openModal === 'privacy' && t('footerPrivacy')}
                  {openModal === 'terms' && t('footerTerms')}
                  {openModal === 'cookies' && t('footerCookies')}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setOpenModal(null)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {openModal === 'privacy' && (
                <div className="text-gray-300 space-y-6">
                  <p className="text-sm text-gray-400">{language === 'tr' ? 'Son güncelleme: 25 Ocak 2026' : 'Last updated: January 25, 2026'}</p>
                  
                  {language === 'tr' ? (
                    <>
                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">1. Giriş</h3>
                        <p className="leading-relaxed">
                          IQsion olarak, kullanıcılarımızın gizliliğini korumayı en önemli önceliklerimizden biri olarak görüyoruz. 
                          Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklar.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">2. Toplanan Bilgiler</h3>
                        <p className="leading-relaxed mb-3">Platform üzerinden aşağıdaki bilgiler toplanmaktadır:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Hesap bilgileri (ad, soyad, e-posta adresi, şirket adı)</li>
                          <li>CRM ve pazarlama platformu verileri (HubSpot, Salesforce, Google Ads, LinkedIn Ads metrikleri)</li>
                          <li>Kullanım verileri (platform içi aktiviteler, özellik kullanımı)</li>
                          <li>Teknik bilgiler (IP adresi, tarayıcı türü, cihaz bilgileri)</li>
                          <li>Ödeme bilgileri (şifrelenmiş kredi kartı bilgileri)</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">3. Bilgilerin Kullanımı</h3>
                        <p className="leading-relaxed mb-3">Toplanan bilgiler şu amaçlarla kullanılır:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Lead scoring ve attribution hizmetlerini sağlamak</li>
                          <li>AI destekli analiz ve öneriler oluşturmak</li>
                          <li>Müşteri desteği sunmak</li>
                          <li>Faturalandırma ve ödeme işlemlerini yürütmek</li>
                          <li>Güvenlik ve dolandırıcılık önleme</li>
                          <li>Yasal yükümlülükleri yerine getirmek</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">4. Veri Güvenliği</h3>
                        <p className="leading-relaxed">
                          Verileriniz, endüstri standardı güvenlik önlemleriyle korunmaktadır. 256-bit SSL şifreleme, 
                          ISO 27001 sertifikalı sunucular ve düzenli güvenlik denetimleri ile verilerinizin güvenliğini sağlıyoruz. 
                          Tüm çalışanlarımız gizlilik sözleşmesi kapsamında hareket eder.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">5. Üçüncü Taraf Paylaşımı</h3>
                        <p className="leading-relaxed mb-3">
                          Verileriniz, aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Açık rızanız olduğunda</li>
                          <li>Yasal zorunluluk olduğunda</li>
                          <li>Hizmet sağlayıcılarımızla (ödeme işlemcileri, bulut sunucu sağlayıcıları) sınırlı olarak</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">6. Haklarınız</h3>
                        <p className="leading-relaxed mb-3">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                          <li>İşlenmişse bilgi talep etme</li>
                          <li>Verilerin işlenme amacını öğrenme</li>
                          <li>Yurt içinde veya yurt dışında aktarılan üçüncü kişileri bilme</li>
                          <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
                          <li>Verilerin silinmesini veya yok edilmesini isteme</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">7. İletişim</h3>
                        <p className="leading-relaxed">
                          Gizlilik politikamız hakkında sorularınız için{' '}
                          <a href="mailto:privacy@iqsion.com" className="text-blue-400 hover:text-blue-300">
                            privacy@iqsion.com
                          </a>{' '}
                          adresinden bizimle iletişime geçebilirsiniz.
                        </p>
                      </section>
                    </>
                  ) : (
                    <>
                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">1. Introduction</h3>
                        <p className="leading-relaxed">
                          At IQsion, we consider protecting the privacy of our users as one of our top priorities. 
                          This Privacy Policy explains how your personal data is collected, used, stored, and protected.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">2. Information Collected</h3>
                        <p className="leading-relaxed mb-3">The following information is collected through the platform:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Account information (first name, last name, email address, company name)</li>
                          <li>CRM and marketing platform data (HubSpot, Salesforce, Google Ads, LinkedIn Ads metrics)</li>
                          <li>Usage data (in-platform activities, feature usage)</li>
                          <li>Technical information (IP address, browser type, device information)</li>
                          <li>Payment information (encrypted credit card details)</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">3. Use of Information</h3>
                        <p className="leading-relaxed mb-3">The collected information is used for the following purposes:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Providing lead scoring and attribution services</li>
                          <li>Generating AI-powered analysis and recommendations</li>
                          <li>Providing customer support</li>
                          <li>Processing billing and payments</li>
                          <li>Security and fraud prevention</li>
                          <li>Fulfilling legal obligations</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">4. Data Security</h3>
                        <p className="leading-relaxed">
                          Your data is protected with industry-standard security measures. We ensure the security of your data with 
                          256-bit SSL encryption, ISO 27001 certified servers, and regular security audits. 
                          All our employees operate under non-disclosure agreements.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">5. Third-Party Sharing</h3>
                        <p className="leading-relaxed mb-3">
                          Your data is not shared with third parties except in the following cases:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>When you provide explicit consent</li>
                          <li>When legally required</li>
                          <li>On a limited basis with our service providers (payment processors, cloud server providers)</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">6. Your Rights</h3>
                        <p className="leading-relaxed mb-3">Under GDPR, you have the following rights:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Learn whether your personal data is being processed</li>
                          <li>Request information if it has been processed</li>
                          <li>Learn the purpose of data processing</li>
                          <li>Know third parties to whom data is transferred domestically or internationally</li>
                          <li>Request correction of incomplete or inaccurate data</li>
                          <li>Request deletion or destruction of data</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">7. Contact</h3>
                        <p className="leading-relaxed">
                          For questions about our privacy policy, please contact us at{' '}
                          <a href="mailto:privacy@iqsion.com" className="text-blue-400 hover:text-blue-300">
                            privacy@iqsion.com
                          </a>.
                        </p>
                      </section>
                    </>
                  )}
                </div>
              )}

              {openModal === 'terms' && (
                <div className="text-gray-300 space-y-6">
                  <p className="text-sm text-gray-400">{language === 'tr' ? 'Son güncelleme: 25 Ocak 2026' : 'Last updated: January 25, 2026'}</p>
                  
                  {language === 'tr' ? (
                    <>
                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">1. Hizmet Şartları</h3>
                        <p className="leading-relaxed">
                          IQsion platformunu kullanarak, bu kullanım şartlarını kabul etmiş olursunuz. 
                          Platform, B2B SaaS şirketleri için lead scoring, attribution ve pazarlama otomasyonu hizmeti sunar.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">2. Hesap Sorumluluğu</h3>
                        <p className="leading-relaxed mb-3">Kullanıcı olarak:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Hesap bilgilerinizi güvenli tutmakla yükümlüsünüz</li>
                          <li>Hesabınızda gerçekleşen tüm aktivitelerden sorumlusunuz</li>
                          <li>Doğru ve güncel bilgiler sağlamalısınız</li>
                          <li>18 yaşından büyük olmalısınız veya yasal vasi onayına sahip olmalısınız</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">3. Hizmet Kullanımı</h3>
                        <p className="leading-relaxed mb-3">Platform kullanımında yasaktır:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Yasadışı amaçlar için kullanım</li>
                          <li>Başkalarının haklarını ihlal etme</li>
                          <li>Platformu kötüye kullanma veya sisteme zarar verme</li>
                          <li>Otomatik botlar veya scraping araçları kullanma</li>
                          <li>Verilerinizi yetkisiz kişilerle paylaşma</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">4. Ödeme ve Faturalama</h3>
                        <p className="leading-relaxed">
                          Abonelik ücretleri aylık veya yıllık olarak tahsil edilir. Ücretsiz deneme süresi sonunda 
                          otomatik olarak ücretli plana geçiş yapılır. İptal işlemi en az 24 saat önceden yapılmalıdır. 
                          İadeler, hizmet kullanım durumuna göre değerlendirilir.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">5. Fikri Mülkiyet</h3>
                        <p className="leading-relaxed">
                          Platform üzerindeki tüm içerik, tasarım, logo ve yazılımlar IQsion'un fikri mülkiyetidir. 
                          Kullanıcılar, yalnızca kişisel verileri üzerinde mülkiyet hakkına sahiptir.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">6. Hizmet Garantisi</h3>
                        <p className="leading-relaxed">
                          Platform "olduğu gibi" sunulur. %99.9 uptime hedefimiz olmakla birlikte, 
                          kesintisiz hizmet garantisi veremeyiz. Bakım ve güncellemeler önceden duyurulur.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">7. Fesih</h3>
                        <p className="leading-relaxed">
                          Hesabınızı istediğiniz zaman kapatabilirsiniz. IQsion, şartları ihlal eden hesapları 
                          önceden haber vermeksizin askıya alabilir veya kapatabilir.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">8. İletişim</h3>
                        <p className="leading-relaxed">
                          Kullanım şartları hakkında sorularınız için{' '}
                          <a href="mailto:legal@iqsion.com" className="text-blue-400 hover:text-blue-300">
                            legal@iqsion.com
                          </a>{' '}
                          adresinden bizimle iletişime geçebilirsiniz.
                        </p>
                      </section>
                    </>
                  ) : (
                    <>
                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">1. Terms of Service</h3>
                        <p className="leading-relaxed">
                          By using the IQsion platform, you accept these terms of use. 
                          The platform provides lead scoring, attribution, and marketing automation services for B2B SaaS companies.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">2. Account Responsibility</h3>
                        <p className="leading-relaxed mb-3">As a user:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>You are responsible for keeping your account information secure</li>
                          <li>You are responsible for all activities in your account</li>
                          <li>You must provide accurate and up-to-date information</li>
                          <li>You must be over 18 years of age or have legal guardian approval</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">3. Service Usage</h3>
                        <p className="leading-relaxed mb-3">The following are prohibited when using the platform:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Use for illegal purposes</li>
                          <li>Violation of others' rights</li>
                          <li>Abuse of the platform or damage to the system</li>
                          <li>Use of automated bots or scraping tools</li>
                          <li>Sharing your data with unauthorized persons</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">4. Payment and Billing</h3>
                        <p className="leading-relaxed">
                          Subscription fees are charged monthly or annually. After the free trial period ends, 
                          you will automatically transition to a paid plan. Cancellation must be made at least 24 hours in advance. 
                          Refunds are evaluated based on service usage.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">5. Intellectual Property</h3>
                        <p className="leading-relaxed">
                          All content, design, logos, and software on the platform are the intellectual property of IQsion. 
                          Users only have ownership rights over their personal data.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">6. Service Guarantee</h3>
                        <p className="leading-relaxed">
                          The platform is provided "as is". While we target 99.9% uptime, 
                          we cannot guarantee uninterrupted service. Maintenance and updates will be announced in advance.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">7. Termination</h3>
                        <p className="leading-relaxed">
                          You can close your account at any time. IQsion may suspend or close accounts that violate the terms 
                          without prior notice.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">8. Contact</h3>
                        <p className="leading-relaxed">
                          For questions about our terms of service, please contact us at{' '}
                          <a href="mailto:legal@iqsion.com" className="text-blue-400 hover:text-blue-300">
                            legal@iqsion.com
                          </a>.
                        </p>
                      </section>
                    </>
                  )}
                </div>
              )}

              {openModal === 'cookies' && (
                <div className="text-gray-300 space-y-6">
                  <p className="text-sm text-gray-400">{language === 'tr' ? 'Son güncelleme: 25 Ocak 2026' : 'Last updated: January 25, 2026'}</p>
                  
                  {language === 'tr' ? (
                    <>
                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">1. Çerez Nedir?</h3>
                        <p className="leading-relaxed">
                          Çerezler, web sitelerini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. 
                          Kullanıcı deneyimini iyileştirmek, site trafiğini analiz etmek ve kişiselleştirilmiş içerik sunmak için kullanılır.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">2. Kullandığımız Çerez Türleri</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-white mb-2">Zorunlu Çerezler</h4>
                            <p className="leading-relaxed">
                              Platformun çalışması için gereklidir. Oturum yönetimi, güvenlik ve temel işlevsellik sağlar. 
                              Bu çerezler devre dışı bırakılamaz.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2">Performans Çerezleri</h4>
                            <p className="leading-relaxed">
                              Site trafiğini ve kullanıcı davranışlarını analiz eder. Google Analytics gibi araçlar kullanılır. 
                              Anonim veri toplar.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2">İşlevsellik Çerezleri</h4>
                            <p className="leading-relaxed">
                              Dil tercihi, tema seçimi gibi kişiselleştirme ayarlarınızı hatırlar. 
                              Kullanıcı deneyimini iyileştirir.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2">Pazarlama Çerezleri</h4>
                            <p className="leading-relaxed">
                              Reklam kampanyalarının etkinliğini ölçer. Üçüncü taraf reklamcılar tarafından kullanılabilir. 
                              Rızanızla etkinleştirilir.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">3. Çerez Kontrolü</h3>
                        <p className="leading-relaxed mb-3">
                          Çerezleri kontrol etmek için:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz</li>
                          <li>İlk ziyaretinizde çıkan çerez onay panelinden tercihlerinizi belirleyebilirsiniz</li>
                          <li>Hesap ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz</li>
                        </ul>
                        <p className="leading-relaxed mt-3">
                          Not: Zorunlu çerezleri engellemek platformun düzgün çalışmasını engelleyebilir.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">4. Üçüncü Taraf Çerezler</h3>
                        <p className="leading-relaxed mb-3">
                          Platformumuzda aşağıdaki üçüncü taraf hizmetler çerez kullanır:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Google Analytics - Trafik analizi</li>
                          <li>Stripe - Ödeme işlemleri</li>
                          <li>Firebase - Kimlik doğrulama ve veri yönetimi</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">5. Çerez Saklama Süresi</h3>
                        <p className="leading-relaxed">
                          Oturum çerezleri tarayıcı kapatıldığında silinir. Kalıcı çerezler 30 gün ile 2 yıl arasında saklanır. 
                          Saklama süreleri çerez türüne göre değişir.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">6. İletişim</h3>
                        <p className="leading-relaxed">
                          Çerez politikamız hakkında sorularınız için{' '}
                          <a href="mailto:privacy@iqsion.com" className="text-blue-400 hover:text-blue-300">
                            privacy@iqsion.com
                          </a>{' '}
                          adresinden bizimle iletişime geçebilirsiniz.
                        </p>
                      </section>
                    </>
                  ) : (
                    <>
                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">1. What are Cookies?</h3>
                        <p className="leading-relaxed">
                          Cookies are small text files saved to your device when you visit websites. 
                          They are used to improve user experience, analyze site traffic, and provide personalized content.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">2. Types of Cookies We Use</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-white mb-2">Essential Cookies</h4>
                            <p className="leading-relaxed">
                              Required for the platform to function. Provides session management, security, and basic functionality. 
                              These cookies cannot be disabled.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2">Performance Cookies</h4>
                            <p className="leading-relaxed">
                              Analyzes site traffic and user behavior. Tools like Google Analytics are used. 
                              Collects anonymous data.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2">Functionality Cookies</h4>
                            <p className="leading-relaxed">
                              Remembers your personalization settings like language preference and theme selection. 
                              Improves user experience.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2">Marketing Cookies</h4>
                            <p className="leading-relaxed">
                              Measures the effectiveness of advertising campaigns. May be used by third-party advertisers. 
                              Activated with your consent.
                            </p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">3. Cookie Control</h3>
                        <p className="leading-relaxed mb-3">
                          To control cookies:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>You can delete or block cookies from your browser settings</li>
                          <li>You can set your preferences from the cookie consent panel on your first visit</li>
                          <li>You can manage your cookie preferences from your account settings</li>
                        </ul>
                        <p className="leading-relaxed mt-3">
                          Note: Blocking essential cookies may prevent the platform from functioning properly.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">4. Third-Party Cookies</h3>
                        <p className="leading-relaxed mb-3">
                          The following third-party services use cookies on our platform:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Google Analytics - Traffic analysis</li>
                          <li>Stripe - Payment processing</li>
                          <li>Firebase - Authentication and data management</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">5. Cookie Storage Duration</h3>
                        <p className="leading-relaxed">
                          Session cookies are deleted when the browser is closed. Persistent cookies are stored for 30 days to 2 years. 
                          Storage durations vary by cookie type.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold text-white mb-3">6. Contact</h3>
                        <p className="leading-relaxed">
                          For questions about our cookie policy, please contact us at{' '}
                          <a href="mailto:privacy@iqsion.com" className="text-blue-400 hover:text-blue-300">
                            privacy@iqsion.com
                          </a>.
                        </p>
                      </section>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Form Modal */}
      <ContactFormModal 
        open={contactModal.open}
        onOpenChange={(open) => setContactModal(prev => ({ ...prev, open }))}
        type={contactModal.type}
      />
    </div>
  );
}