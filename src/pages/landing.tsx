import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
  Building2
} from "lucide-react";
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import BrandLogo from '../components/brand-logo';
export default function Landing() {
  const { t, language } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [activeAudience, setActiveAudience] = useState<'companies' | 'agencies' | 'entrepreneurs'>('companies');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeDashboardView, setActiveDashboardView] = useState<'overview' | 'ai' | 'audit' | 'team'>('overview');
  const [openModal, setOpenModal] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  // Hero typewriter headline phrases (TR/EN)
  const phrasesTr = [
    'AI Destekli Büyüme Ortağı',
    'Kârlılık Odaklı Pazarlama Otomasyonları',
    'Veriye Dayalı Tahminleme Modelleri'
  ];
  const phrasesEn = [
    'AI-Powered Growth Partner',
    'Profit-Focused Marketing Automations',
    'Data-Driven Forecasting Models'
  ];
  const [typedText, setTypedText] = useState('');
  const [twIndex, setTwIndex] = useState(0); // phrase index
  const [isDeleting, setIsDeleting] = useState(false);
  const HOLD_DONE_MS = 1500; // hold after fully typed
  const HOLD_EMPTY_MS = 500; // hold after fully deleted
  useEffect(() => {
    const list = language === 'tr' ? phrasesTr : phrasesEn;
    const current = list[twIndex % list.length] || '';
    const typingSpeed = isDeleting ? 35 : 55;
    const doneTyping = !isDeleting && typedText === current;
    const doneDeleting = isDeleting && typedText === '';

    const timeout = setTimeout(() => {
      if (doneTyping) {
        setIsDeleting(true);
        return;
      }
      if (doneDeleting) {
        setIsDeleting(false);
        setTwIndex((i) => (i + 1) % list.length);
        return;
      }
      const next = isDeleting
        ? current.slice(0, Math.max(0, typedText.length - 1))
        : current.slice(0, typedText.length + 1);
      setTypedText(next);
    }, doneTyping ? HOLD_DONE_MS : doneDeleting ? HOLD_EMPTY_MS : typingSpeed);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedText, isDeleting, twIndex, language]);

  // Auth actions should go to app subdomain ONLY in production domains.
  const appBase = (() => {
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname;
    const isProdHost = ['iqsion.com', 'www.iqsion.com', 'app.iqsion.com'].includes(host);
    if (!isProdHost) return '';
    return host !== 'app.iqsion.com' ? 'https://app.iqsion.com' : '';
  })();

  const handleLogin = () => {
    window.location.href = `${appBase}/auth`;
  };

  const handleStartTrial = () => {
    window.location.href = `${appBase}/api/login`;
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
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors font-normal px-4 py-2 rounded-lg hover:bg-gray-800/50">{t('contact')}</a>
            </nav>
            {/* Actions */}
            <div className="flex items-center gap-5 ml-auto shrink-0">
              <LanguageSwitcher />
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
          <div className="text-center max-w-6xl mx-auto overflow-visible">
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}} .caret-inline{display:inline-block;width:2px;height:0.9em;background:#9ca3af;margin-left:4px;vertical-align:-2px;animation:blink 1s step-end infinite}`}</style>

            <h1 className="font-light text-white mb-6 leading-[1.15] mt-8">
              <span className="block text-[clamp(20px,2.6vw,36px)] font-normal">{language === 'tr' ? 'Markalar için' : 'For Brands'}</span>
              <span className="block bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent whitespace-nowrap tracking-tight text-[clamp(28px,5.2vw,64px)] font-bold">
                {typedText}<span className="caret-inline" aria-hidden="true"></span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-400 mb-8 leading-relaxed max-w-5xl mx-auto [text-wrap:balance] font-light">
              {descText}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
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
                className="border-2 border-blue-800 text-white hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-950 hover:text-white px-8 py-4 rounded-xl font-light text-base shadow-md transition-all"
              >
                <Play className="w-4 h-4 mr-2" />
                {t('watchDemo')}
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-6 whitespace-nowrap overflow-x-auto hide-scrollbar px-2">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{t('heroFeatureSetup')}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{t('heroFeature247Support')}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{t('heroFeatureNoCard')}</span>
                </span>
              </div>

              {/* References Marquee */}
              <div className="mt-12">
                <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .marquee-track { animation: marquee 40s linear infinite; will-change: transform; }`}</style>
                <div className="overflow-hidden">
                  <h3 className="text-center text-base font-medium text-gray-300 mb-12">{t('heroTrustedBy')}</h3>
                  <div className="relative">
                    <div className="flex marquee-track w-[200%]">
                      {[1,2].map(loop => (
                        <div key={loop} className="flex items-center w-1/2 gap-16" style={{justifyContent: 'space-evenly'}}>
                          {/* Hepsiburada */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 200 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="700" fill="currentColor">hepsiburada</text>
                          </svg>
                          {/* Trendyol */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 160 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="700" fill="currentColor">trendyol</text>
                          </svg>
                          {/* Çiçeksepeti */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 180 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="700" fill="currentColor">çiçeksepeti</text>
                          </svg>
                          {/* N11 */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 80 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="700" fill="currentColor">n11</text>
                          </svg>
                          {/* GittiGidiyor */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 180 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="700" fill="currentColor">gittigidiyor</text>
                          </svg>
                          {/* Morhipo */}
                          <svg className="h-8 text-gray-400 opacity-50 hover:opacity-70 transition-opacity grayscale" viewBox="0 0 140 40" fill="none">
                            <text x="0" y="28" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="700" fill="currentColor">morhipo</text>
                          </svg>
                        </div>
                      ))}
                    </div>
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

            {/* Rotating orbit container */}
            <div className="orbit-track absolute" style={{width: '380px', height: '380px'}}>
              {/* Meta - Top */}
              <div className="platform-item absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 flex items-center justify-center text-gray-400">
                    <BrandLogo name="meta" size={32} mono={true} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">Meta</span>
                </div>
              </div>

              {/* Google Ads - Top Right */}
              <div className="platform-item absolute" style={{top: '7%', right: '18%'}}>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 flex items-center justify-center">
                    <svg width={32} height={32} viewBox="0 0 192 192" className="text-gray-400">
                      {/* Blue pill shape - top right */}
                      <path d="M120 40 Q150 40 150 70 Q150 100 120 100 L90 100 Q120 100 120 70 Q120 40 90 40 Z" fill="currentColor" opacity="0.8"/>
                      {/* Yellow triangle - left */}
                      <path d="M40 120 L80 60 L80 120 Z" fill="currentColor" opacity="0.6"/>
                      {/* Green circle - bottom left */}
                      <circle cx="60" cy="140" r="25" fill="currentColor" opacity="0.5"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">Google Ads</span>
                </div>
              </div>

              {/* Shopify - Right */}
              <div className="platform-item absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 flex items-center justify-center text-gray-400">
                    <BrandLogo name="shopify" size={32} mono={true} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">Shopify</span>
                </div>
              </div>

              {/* TikTok - Bottom Right */}
              <div className="platform-item absolute" style={{bottom: '7%', right: '18%'}}>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 flex items-center justify-center text-gray-400">
                    <BrandLogo name="tiktok" size={28} mono={true} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">TikTok</span>
                </div>
              </div>

              {/* Analytics - Bottom */}
              <div className="platform-item absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 flex items-center justify-center text-gray-400">
                    <BrandLogo name="googleanalytics" size={30} mono={true} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">Analytics</span>
                </div>
              </div>

              {/* İkas - Bottom Left */}
              <div className="platform-item absolute" style={{bottom: '7%', left: '18%'}}>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-[20px] font-bold text-gray-400">ikas</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">İkas</span>
                </div>
              </div>

              {/* LinkedIn - Left */}
              <div className="platform-item absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 flex items-center justify-center">
                    <svg width={32} height={32} viewBox="0 0 192 192" className="text-gray-400" fill="currentColor">
                      <rect x="30" y="30" width="132" height="132" rx="20"/>
                      <text x="96" y="125" textAnchor="middle" fontSize="90" fontWeight="700" fill="black">in</text>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400">LinkedIn</span>
                </div>
              </div>

              {/* Search Console - Top Left */}
              <div className="platform-item absolute" style={{top: '7%', left: '18%'}}>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 flex items-center justify-center">
                    <svg width={32} height={32} viewBox="0 0 192 192" className="text-gray-400">
                      <circle cx="96" cy="96" r="70" fill="none" stroke="currentColor" strokeWidth="12"/>
                      <path d="M96 40 L96 96 L140 96" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">Console</span>
                </div>
              </div>
            </div>
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
              {activeDashboardView === 'team' && t('dashboardTeamSubtitle')}
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
              onClick={() => setActiveDashboardView('team')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'team' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {t('dashboardTabTeam')}
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
                    <span className="text-xs text-gray-400">Canlı Veri</span>
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
                    <span className="text-gray-400 text-xs">{t('dashboardDataSources')}</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Google Ads */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center" title="Google Ads">
                        <svg className="w-3 h-3" viewBox="0 0 24 24">
                          <path fill="#FBBC04" d="M12 2L3 14h6l-3 8 12-14h-6z"/>
                        </svg>
                      </div>
                      {/* Meta */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center" title="Meta">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 36 36" fill="#0081FB">
                          <path d="M20.3 12.3c-1.6-2.6-3.5-3.8-5.6-3.8-3.4 0-6.2 2.8-6.2 6.2 0 2.6 1.6 4.8 3.9 5.8l.4.2v6.8l.6-.4c2.9-2 5.6-4.8 7.8-8.2 1.8-2.8 2.8-5.4 2.8-7.4 0-.8-.2-1.5-.6-2.1-.9.9-2.1 1.5-3.5 1.7-.3.3-.4.7-.4 1.1 0 .7.3 1.3.8 1.7z"/>
                          <path d="M27.7 11.9c0-3.4-2.8-6.2-6.2-6.2-2.1 0-4 1.1-5.1 2.8 1.3.2 2.5.8 3.4 1.7 1.6 1.6 2.4 3.8 2.4 6.6 0 2.4-1 5-2.8 7.8-1.4 2.2-3.1 4.3-5 6.2 2.1-.7 3.9-2.1 5-4 1.6-2.6 2.5-5.5 2.5-8.7 0-2 .5-3.8 1.5-5.3.2.3.3.7.3 1.1z"/>
                        </svg>
                      </div>
                      {/* Shopify */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center" title="Shopify">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#95BF47">
                          <path d="M14.5 3c-.1 0-.3.1-.4.1-.1 0-.6.1-.7.1-.3 0-.5.1-.7.2-.1-.1-.2-.2-.4-.3-.5-.4-1.2-.6-1.9-.6h-.2c-.1-.1-.2-.3-.3-.4C9.5 1.3 8.9 1 8.2 1c-1.9 0-3.7 1.6-4.3 3.8-.4 1.4-.7 3.1.1 4.1l.1.1v.1L2 20.5l8.5 1.5L21 19.8l-1.5-7.1c-.1-.6-.6-1-1.2-1h-.1c-.2-.8-.6-1.5-1.2-2-.3-.2-.6-.4-.9-.5 0-.2.1-.4.1-.6 0-.3 0-.5-.1-.8-.1-.5-.3-1-.6-1.4-.3-.4-.7-.7-1.2-.9-.3-.1-.6-.2-.8-.2zM8.2 2.5c.3 0 .6.1.8.3.2.2.3.4.4.7-.6.2-1.3.4-2 .6-.4-1.2.1-1.6.8-1.6z"/>
                        </svg>
                      </div>
                      {/* TikTok */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center" title="TikTok">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#00F2EA" d="M9 12c0 1.7 1.3 3 3 3s3-1.3 3-3V6h3c0-1.7-1.3-3-3-3h-3v9c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2V7c-2.2 0-4 1.8-4 4s1.8 4 4 4z"/>
                          <path fill="#FF004F" d="M15 6h3c0 1.7 1.3 3 3 3v-3c-1.7 0-3-1.3-3-3h-3v9c0 1.7-1.3 3-3 3v-3c1.1 0 2-.9 2-2V6z"/>
                        </svg>
                      </div>
                      {/* LinkedIn */}
                      <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center" title="LinkedIn">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#0A66C2">
                          <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8 17H6V9h2v8zM7 8a1 1 0 110-2 1 1 0 010 2zm11 9h-2v-4c0-1-.5-1.5-1-1.5s-1 .5-1 1.5v4h-2V9h2v1c.3-.5 1-1 2-1s2 1 2 2.5V17z"/>
                        </svg>
                      </div>
                      <span className="text-gray-500 text-xs ml-1">+3</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm font-medium">{t('dashboardLast30Days')}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: KPI Cards + AI Insights */}
                  <div className="flex-1 space-y-6">
                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: TrendingUp, label: t('dashboardTotalRevenue'), value: '₺3,156,750', change: '+12.5%', color: 'green', trend: [65, 68, 72, 70, 75, 78, 82, 80, 85, 88, 92, 90, 95, 100], isPositive: true },
                        { icon: BarChart3, label: t('dashboardAdSpend'), value: '₺542,350', change: '+8.2%', color: 'orange', trend: [60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92], isPositive: false },
                        { icon: Zap, label: 'ROAS', value: '4.2x', change: '+5.1%', color: 'purple', trend: [70, 72, 75, 73, 78, 80, 82, 85, 87, 89, 92, 94, 96, 95], isPositive: true },
                        { icon: Users, label: t('dashboardConversions'), value: '12,470', change: '+18.3%', color: 'blue', trend: [55, 58, 62, 65, 68, 72, 75, 78, 82, 85, 88, 91, 95, 98], isPositive: true },
                        { icon: CircleDollarSign, label: t('dashboardNetProfit'), value: '₺1,478,420', change: '+3.1%', color: 'emerald', trend: [80, 82, 78, 85, 88, 86, 90, 92, 95, 93, 97, 98, 100, 96], isPositive: true },
                        { icon: BarChart2, label: t('dashboardProfitMargin'), value: '36.4%', change: '+1.4%', color: 'indigo', trend: [88, 86, 90, 89, 92, 91, 94, 93, 95, 96, 97, 98, 99, 100], isPositive: true }
                      ].map((kpi, i) => (
                        <Card key={i} className="bg-gray-900/50 border border-gray-700/50 hover:border-gray-600 transition-all group">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className={`w-8 h-8 ${
                                kpi.color === 'green' ? 'bg-green-600/20' :
                                kpi.color === 'orange' ? 'bg-orange-600/20' :
                                kpi.color === 'purple' ? 'bg-purple-600/20' :
                                kpi.color === 'blue' ? 'bg-blue-600/20' :
                                kpi.color === 'emerald' ? 'bg-emerald-600/20' :
                                'bg-indigo-600/20'
                              } rounded-lg flex items-center justify-center`}>
                                <kpi.icon className={`w-4 h-4 ${
                                  kpi.color === 'green' ? 'text-green-400' :
                                  kpi.color === 'orange' ? 'text-orange-400' :
                                  kpi.color === 'purple' ? 'text-purple-400' :
                                  kpi.color === 'blue' ? 'text-blue-400' :
                                  kpi.color === 'emerald' ? 'text-emerald-400' :
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
                                      kpi.color === 'orange' ? '#f97316' :
                                      kpi.color === 'purple' ? '#a855f7' :
                                      kpi.color === 'blue' ? '#3b82f6' :
                                      kpi.color === 'emerald' ? '#10b981' :
                                      '#6366f1'
                                    } stopOpacity="0.3"/>
                                    <stop offset="100%" stopColor={
                                      kpi.color === 'green' ? '#22c55e' :
                                      kpi.color === 'orange' ? '#f97316' :
                                      kpi.color === 'purple' ? '#a855f7' :
                                      kpi.color === 'blue' ? '#3b82f6' :
                                      kpi.color === 'emerald' ? '#10b981' :
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
                                    kpi.color === 'orange' ? '#f97316' :
                                    kpi.color === 'purple' ? '#a855f7' :
                                    kpi.color === 'blue' ? '#3b82f6' :
                                    kpi.color === 'emerald' ? '#10b981' :
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
                                <span className="text-green-400 text-xs font-semibold uppercase">{t('dashboardOpportunity')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">%90 {t('dashboardConfidence')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardInsight1Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardInsight1Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-3">{t('dashboardAutoApply')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardAddToTodo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardViewDetails')}</Button>
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
                                <span className="text-yellow-400 text-xs font-semibold uppercase">{t('dashboardAnomaly')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">%84 {t('dashboardConfidence')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardInsight2Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardInsight2Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white h-7 text-xs px-3">{t('dashboardAnalyze')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardAddToTodo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardViewDetails')}</Button>
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
                                <span className="text-blue-400 text-xs font-semibold uppercase">{t('dashboardStrategy')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">{t('dashboardDeepAnalysis')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardInsight3Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardInsight3Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3">{t('dashboardCreateCampaign')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardAddToTodo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardViewDetails')}</Button>
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
                          <h4 className="text-white font-semibold text-sm">{t('dashboardTodayInsightTitle')}</h4>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed mb-4">
                          {t('dashboardTodayInsightText')}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{t('dashboardAIConfidenceScore')}</span>
                          <span className="text-blue-400 font-semibold">%94</span>
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
                            <h4 className="text-white font-semibold text-sm">{t('dashboardAIChatTitle')}</h4>
                            <p className="text-gray-400 text-xs">{t('dashboardAIChatSubtitle')}</p>
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
                      {/* Reklam - Bütçe Optimizasyonu */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-green-400 text-xs font-semibold uppercase">{t('dashboardAICard1Label')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">%92 {t('dashboardConfidence')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardAICard1Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardAICard1Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-3">{t('dashboardAutoApply')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardAddToTodo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardViewDetails')}</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* CRO - Ödeme Sayfası */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <Lightbulb className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-400 text-xs font-semibold uppercase">{t('dashboardAICard2Label')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">%88 {t('dashboardConfidence')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardAICard2Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardAICard2Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3">{t('dashboardAICard2Button')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardAddToTodo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardViewDetails')}</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mağaza İçi - Ürün Sayfası */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <BarChart2 className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-purple-400 text-xs font-semibold uppercase">{t('dashboardAICard3Label')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">%85 {t('dashboardConfidence')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardAICard3Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardAICard3Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs px-3">{t('dashboardAICard3Button')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardAddToTodo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">{t('dashboardViewDetails')}</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Anomali - Google Ads */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <AlertCircle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-400 text-xs font-semibold uppercase">{t('dashboardAICard4Label')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">%91 {t('dashboardConfidence')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardAICard4Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardAICard4Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white h-7 text-xs px-3">{t('dashboardAnalyze')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">To-Do'ya Ekle</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Detayları Gör →</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Segmentasyon - Müşteri */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-indigo-400 text-xs font-semibold uppercase">{t('dashboardAICard5Label')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">%89 {t('dashboardConfidence')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardAICard5Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardAICard5Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs px-3">{t('dashboardAICard5Button')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">To-Do'ya Ekle</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Detayları Gör →</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Email Marketing */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <Send className="w-5 h-5 text-pink-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-pink-400 text-xs font-semibold uppercase">{t('dashboardAICard6Label')}</span>
                                <Badge className="bg-gray-800 text-gray-300 text-xs">%86 {t('dashboardConfidence')}</Badge>
                              </div>
                              <h4 className="text-white font-medium text-sm mb-1">{t('dashboardAICard6Title')}</h4>
                              <p className="text-gray-400 text-xs mb-3">{t('dashboardAICard6Desc')}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white h-7 text-xs px-3">{t('dashboardAICard6Button')}</Button>
                                <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 h-7 text-xs px-3">{t('dashboardAssignTo')}</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">To-Do'ya Ekle</Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7 text-xs px-3">Detayları Gör →</Button>
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
                            <h4 className="text-white font-semibold text-sm">{t('dashboardAISummaryTitle')}</h4>
                          </div>
                          <p className="text-gray-300 text-xs leading-relaxed mb-4">
                            {t('dashboardAISummaryText')}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{t('dashboardAISummaryAdOpt')}</span>
                              <span className="text-green-400 font-semibold">+₺28,400</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{t('dashboardAISummaryCRO')}</span>
                              <span className="text-blue-400 font-semibold">+₺47,200</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{t('dashboardAISummaryStore')}</span>
                              <span className="text-purple-400 font-semibold">+₺31,800</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">{t('dashboardAISummarySegmentation')}</span>
                              <span className="text-indigo-400 font-semibold">+₺156,000</span>
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
                              <h4 className="text-white font-semibold text-sm">{t('dashboardAIChatTitle')}</h4>
                              <p className="text-gray-400 text-xs">{t('dashboardAIChatSubtitle2')}</p>
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
                                {t('dashboardAIChatWelcome2')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                              <p className="text-gray-300 text-xs">{t('dashboardAIChatQuestion1')}</p>
                            </button>
                            <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                              <p className="text-gray-300 text-xs">{t('dashboardAIChatQuestion2')}</p>
                            </button>
                            <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 transition-colors">
                              <p className="text-gray-300 text-xs">{t('dashboardAIChatQuestion3')}</p>
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
                              <div className="text-xs text-gray-400">{t('dashboardAuditSuccess')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-400 mb-1">8</div>
                              <div className="text-xs text-gray-400">{t('dashboardAuditWarning')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-400 mb-1">3</div>
                              <div className="text-xs text-gray-400">{t('dashboardAuditCritical')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400 mb-1">12</div>
                              <div className="text-xs text-gray-400">{t('dashboardAuditImprovement')}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Category Scores */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: t('dashboardAuditCategorySEO'), score: 87, color: 'green', icon: '🔍', issues: 5 },
                          { label: t('dashboardAuditCategoryPerformance'), score: 72, color: 'yellow', icon: '⚡', issues: 8 },
                          { label: t('dashboardAuditCategoryGoogleAds'), score: 91, color: 'green', icon: '📢', issues: 2 },
                          { label: t('dashboardAuditCategoryMetaAds'), score: 85, color: 'green', icon: '📱', issues: 4 },
                          { label: t('dashboardAuditCategorySecurity'), score: 94, color: 'green', icon: '🔒', issues: 1 },
                          { label: t('dashboardAuditCategoryMobile'), score: 68, color: 'orange', icon: '📱', issues: 6 }
                        ].map((cat, i) => (
                          <Card key={i} className="bg-gray-900/50 border border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{cat.icon}</span>
                                  <div>
                                    <h4 className="text-white text-sm font-medium">{cat.label}</h4>
                                    <p className="text-gray-500 text-xs">{cat.issues} {t('dashboardAuditIssues')}</p>
                                  </div>
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
                        {/* SEO Issues */}
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">🔍</span>
                              <h4 className="text-white font-semibold text-sm">{t('dashboardAuditSEOTitle')}</h4>
                              <Badge className="bg-gray-800 text-gray-300 text-xs ml-auto">5 {t('dashboardAuditIssues')}</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">{t('dashboardAuditIssue1Title')}</p>
                                  <p className="text-gray-400 text-xs">{t('dashboardAuditIssue1Desc')}</p>
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 text-xs shrink-0">{t('dashboardAuditSeverityCritical')}</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">{t('dashboardAuditIssue2Title')}</p>
                                  <p className="text-gray-400 text-xs">{t('dashboardAuditIssue2Desc')}</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">{t('dashboardAuditSeverityMedium')}</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">{t('dashboardAuditIssue3Title')}</p>
                                  <p className="text-gray-400 text-xs">{t('dashboardAuditIssue3Desc')}</p>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs shrink-0">{t('dashboardAuditSeverityLow')}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Performance Issues */}
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">⚡</span>
                              <h4 className="text-white font-semibold text-sm">{t('dashboardAuditPerformanceTitle')}</h4>
                              <Badge className="bg-gray-800 text-gray-300 text-xs ml-auto">8 {t('dashboardAuditIssues')}</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">{t('dashboardAuditIssue4Title')}</p>
                                  <p className="text-gray-400 text-xs">{t('dashboardAuditIssue4Desc')}</p>
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 text-xs shrink-0">{t('dashboardAuditSeverityCritical')}</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">{t('dashboardAuditIssue5Title')}</p>
                                  <p className="text-gray-400 text-xs">{t('dashboardAuditIssue5Desc')}</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">{t('dashboardAuditSeverityMedium')}</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">{t('dashboardAuditIssue6Title')}</p>
                                  <p className="text-gray-400 text-xs">{t('dashboardAuditIssue6Desc')}</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">{t('dashboardAuditSeverityMedium')}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Google Ads Audit */}
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">📢</span>
                              <h4 className="text-white font-semibold text-sm">{t('dashboardAuditGoogleAdsHealth')}</h4>
                              <Badge className="bg-gray-800 text-gray-300 text-xs ml-auto">2 {t('dashboardAuditIssues')}</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">{t('dashboardAuditIssue7Title')}</p>
                                  <p className="text-gray-400 text-xs">{t('dashboardAuditIssue7Desc')}</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">{t('dashboardAuditSeverityMedium')}</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">{t('dashboardAuditIssue8Title')}</p>
                                  <p className="text-gray-400 text-xs">{t('dashboardAuditIssue8Desc')}</p>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs shrink-0">{t('dashboardAuditSeverityLow')}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Meta Ads Audit */}
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xl">📱</span>
                              <h4 className="text-white font-semibold text-sm">Meta Ads Hesap Sağlığı</h4>
                              <Badge className="bg-gray-800 text-gray-300 text-xs ml-auto">4 {t('dashboardAuditIssues')}</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Pixel event kurulumu eksik: Purchase eventi çalışmıyor</p>
                                  <p className="text-gray-400 text-xs">Conversion optimizasyonu yapılamıyor. ROAS ölçümü hatalı.</p>
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 text-xs shrink-0">Kritik</Badge>
                              </div>
                              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium text-xs mb-1">Lookalike audience güncel değil: 4+ ay önce oluşturulmuş</p>
                                  <p className="text-gray-400 text-xs">Yeni müşteri verileri ile refresh edilmeli.</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs shrink-0">Orta</Badge>
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
                                <p className="text-white text-xs font-medium">{t('dashboardAuditFixMetaPixel')}</p>
                                <Badge className="bg-red-500/20 text-red-400 text-xs">{t('dashboardAuditSeverityCritical')}</Badge>
                              </div>
                              <p className="text-gray-400 text-xs">~2 {t('dashboardAuditHours')}</p>
                            </button>
                            <button className="w-full text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg p-3 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white text-xs font-medium">{t('dashboardAuditAddMeta')}</p>
                                <Badge className="bg-red-500/20 text-red-400 text-xs">{t('dashboardAuditSeverityCritical')}</Badge>
                              </div>
                              <p className="text-gray-400 text-xs">~4 {t('dashboardAuditHours')}</p>
                            </button>
                            <button className="w-full text-left bg-gray-900/50 hover:bg-gray-900 border border-gray-700 rounded-lg p-3 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white text-xs font-medium">{t('dashboardAuditOptimizeImages')}</p>
                                <Badge className="bg-red-500/20 text-red-400 text-xs">{t('dashboardAuditSeverityCritical')}</Badge>
                              </div>
                              <p className="text-gray-400 text-xs">~1 {t('dashboardAuditHours')}</p>
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
                              {t('dashboardAuditTotalImpact')} <span className="text-white font-semibold">+₺58,300/ay</span> {t('dashboardAuditMonthlyRevenue')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Last Scan Info */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <h4 className="text-white font-semibold text-sm">{t('dashboardAuditScanStatus')}</h4>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">{t('dashboardAuditLastScanLabel')}</span>
                              <span className="text-gray-300">2 {t('dashboardAuditHoursAgo')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">{t('dashboardAuditPagesScanned')}</span>
                              <span className="text-gray-300">47 {t('dashboardAuditPages')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">{t('dashboardAuditNextScan')}</span>
                              <span className="text-gray-300">22 {t('dashboardAuditHours')}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full mt-4 border-gray-700 text-gray-300 hover:bg-gray-800 h-8 text-xs">
                            {t('dashboardAuditScanNow')}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Team Collaboration View */}
                {activeDashboardView === 'team' && (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Activity & Approvals */}
                    <div className="flex-1 space-y-6">
                      {/* Team Stats Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-400 text-xs">{t('dashboardTeamActiveMembers')}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">8</div>
                            <div className="text-xs text-green-400 mt-1">+2 {t('dashboardTeamThisMonth')}</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-gray-400 text-xs">{t('dashboardTeamCompleted')}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">47</div>
                            <div className="text-xs text-gray-400 mt-1">{t('dashboardTeamTask')} ({t('dashboardTeamThisMonth')})</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-yellow-400" />
                              <span className="text-gray-400 text-xs">{t('dashboardTeamPending')}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">5</div>
                            <div className="text-xs text-yellow-400 mt-1">{t('dashboardTeamApprovalNeeded')}</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-900/50 border border-gray-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="w-4 h-4 text-purple-400" />
                              <span className="text-gray-400 text-xs">{t('dashboardTeamComments')}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">124</div>
                            <div className="text-xs text-gray-400 mt-1">{t('dashboardTeamThisWeek')}</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent Activity Feed */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-5">
                          <h3 className="text-white font-semibold mb-4 text-sm">{t('dashboardTeamRecentActivities')}</h3>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                AY
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white text-xs font-semibold">Ayşe Yılmaz</p>
                                  <Badge className="bg-green-500/20 text-green-400 text-xs">{t('dashboardTeamBadgeApproved')}</Badge>
                                </div>
                                <p className="text-gray-400 text-xs mb-1">{t('dashboardTeamActivity3')}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>5 {t('dashboardTeamMinutesAgo')}</span>
                                  <span>•</span>
                                  <span className="text-green-400">+₺8,400 {t('dashboardTeamExpectedImpact')}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                MK
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white text-xs font-semibold">Mehmet Kaya</p>
                                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">{t('dashboardTeamBadgeNewReport')}</Badge>
                                </div>
                                <p className="text-gray-400 text-xs mb-1">{t('dashboardTeamActivity1')}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>2 {t('dashboardTeamHoursAgo')}</span>
                                  <span>•</span>
                                  <button className="text-blue-400 hover:text-blue-300">{t('dashboardTeamViewReport')} →</button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                ZA
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white text-xs font-semibold">Zeynep Arslan</p>
                                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">{t('dashboardTeamBadgeComment')}</Badge>
                                </div>
                                <p className="text-gray-400 text-xs mb-1">{t('dashboardTeamActivity4')}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>5 {t('dashboardTeamHoursAgo')}</span>
                                  <span>•</span>
                                  <span>3 {t('dashboardTeamReplies')}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                EB
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white text-xs font-semibold">Emre Bilgin</p>
                                  <Badge className="bg-red-500/20 text-red-400 text-xs">Acil</Badge>
                                </div>
                                <p className="text-gray-400 text-xs mb-1">Google Ads kampanyası "Kış İndirimi" duraklatıldı - ROAS hedefin altında</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>1 gün önce</span>
                                  <span>•</span>
                                  <span className="text-red-400">Aksiyon gerekli</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                SK
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white text-xs font-semibold">Selin Kara</p>
                                  <Badge className="bg-green-500/20 text-green-400 text-xs">{t('dashboardTeamBadgeCompleted')}</Badge>
                                </div>
                                <p className="text-gray-400 text-xs mb-1">{t('dashboardTeamActivity2')}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>1 {t('dashboardTeamDaysAgo')}</span>
                                  <span>•</span>
                                  <span>Test 14 gün sürecek</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pending Approvals */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold text-sm">Bekleyen Onaylar</h3>
                            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">5 Onay</Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-yellow-400" />
                                  <p className="text-white font-semibold text-sm">Bütçe Artış Talebi</p>
                                </div>
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Yüksek Öncelik</Badge>
                              </div>
                              <p className="text-gray-400 text-xs mb-1">Google Ads - "Black Friday Kampanyası" için ₺50,000 ek bütçe</p>
                              <p className="text-gray-500 text-xs mb-3">Tahmini ROAS: 4.8x • ROI: +₺240,000</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    AY
                                  </div>
                                  <span>Ayşe Yılmaz</span>
                                  <span>•</span>
                                  <span>2 saat önce</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-3">
                                    Onayla
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 h-7 text-xs px-3">
                                    Reddet
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-blue-400" />
                                  <p className="text-white font-semibold text-sm">{t('dashboardAIPauseCampaignTitle')}</p>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs">{t('dashboardAIMediumPriority')}</Badge>
                              </div>
                              <p className="text-gray-400 text-xs mb-1">{t('dashboardAIPauseCampaignDesc')}</p>
                              <p className="text-gray-500 text-xs mb-3">{t('dashboardAIPauseCampaignSavings')}: ₺18,400/ay • ROAS &lt; 2.0</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    EB
                                  </div>
                                  <span>Emre Bilgin</span>
                                  <span>•</span>
                                  <span>5 {t('dashboardTeamHoursAgo')}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-3">
                                    {t('dashboardAIPauseCampaignApprove')}
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 h-7 text-xs px-3">
                                    {t('dashboardAIPauseCampaignDetails')}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-purple-400" />
                                  <p className="text-white font-semibold text-sm">Yeni Ekip Üyesi Davet</p>
                                </div>
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">Düşük Öncelik</Badge>
                              </div>
                              <p className="text-gray-400 text-xs mb-1">PPC Specialist pozisyonu için Can Demir'i ekibe davet et</p>
                              <p className="text-gray-500 text-xs mb-3">Rol: Editor • Erişim: Google Ads, Meta Ads</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    MK
                                  </div>
                                  <span>Mehmet Kaya</span>
                                  <span>•</span>
                                  <span>1 gün önce</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-3">
                                    Onayla
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 h-7 text-xs px-3">
                                    Reddet
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right: Team Members & Performance */}
                    <div className="w-full lg:w-80 space-y-6">
                      {/* Team Members */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold text-sm">Ekip Üyeleri</h3>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 h-7 text-xs px-2">
                              + Davet Et
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-colors cursor-pointer">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 relative">
                                AY
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">Ayşe Yılmaz</p>
                                <p className="text-gray-400 text-xs truncate">Marketing Manager</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white text-sm font-bold">8</p>
                                <p className="text-gray-500 text-xs">görev</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-colors cursor-pointer">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 relative">
                                MK
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">Mehmet Kaya</p>
                                <p className="text-gray-400 text-xs truncate">Data Analyst</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white text-sm font-bold">12</p>
                                <p className="text-gray-500 text-xs">görev</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-colors cursor-pointer">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 relative">
                                ZA
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-900"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">Zeynep Arslan</p>
                                <p className="text-gray-400 text-xs truncate">Creative Director</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white text-sm font-bold">5</p>
                                <p className="text-gray-500 text-xs">görev</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-colors cursor-pointer">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 relative">
                                EB
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">Emre Bilgin</p>
                                <p className="text-gray-400 text-xs truncate">PPC Specialist</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white text-sm font-bold">15</p>
                                <p className="text-gray-500 text-xs">görev</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700/50 transition-colors cursor-pointer">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 relative">
                                SK
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate">Selin Kara</p>
                                <p className="text-gray-400 text-xs truncate">CRO Manager</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white text-sm font-bold">7</p>
                                <p className="text-gray-500 text-xs">görev</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Team Performance */}
                      <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-800/50">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            <h4 className="text-white font-semibold text-sm">Ekip Performansı</h4>
                          </div>
                          <p className="text-gray-300 text-xs mb-4 leading-relaxed">
                            Bu ay ekip %92 verimlilikle çalışıyor. Ortalama task tamamlama süresi 2.3 gün.
                          </p>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400 text-xs">Tamamlanan Görevler</span>
                                <span className="text-green-400 text-xs font-semibold">47/51</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{width: '92%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400 text-xs">{t('dashboardTeamAvgResponseTime')}</span>
                                <span className="text-blue-400 text-xs font-semibold">1.2 {t('dashboardAuditHours')}</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{width: '88%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-gray-400 text-xs">{t('dashboardTeamApprovalTime')}</span>
                                <span className="text-yellow-400 text-xs font-semibold">4.5 {t('dashboardAuditHours')}</span>
                              </div>
                              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{width: '75%'}}></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      <Card className="bg-gray-900/50 border border-gray-700/50">
                        <CardContent className="p-5">
                          <h4 className="text-white font-semibold text-sm mb-3">Hızlı İşlemler</h4>
                          <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 h-9 text-xs">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Ekip Mesajı Gönder
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 h-9 text-xs">
                              <Calendar className="w-4 h-4 mr-2" />
                              Toplantı Planla
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 h-9 text-xs">
                              <Bell className="w-4 h-4 mr-2" />
                              Bildirim Ayarları
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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
            <p className="text-xl font-light text-gray-400 max-w-3xl mx-auto">
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
                <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all">
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
                <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all">
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
                <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all">
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
                <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all">
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
                    company: 'ModaVista E-ticaret',
                    industry: 'Fashion & Retail',
                    logo: 'MV',
                    metric1: '+156%',
                    metric1Label: t('caseStudyRoasIncrease'),
                    metric2: '₺2.4M',
                    metric2Label: t('caseStudyMonthlyRevenue'),
                    quote: t('caseStudy1Quote'),
                    author: t('caseStudy1Author'),
                    role: t('caseStudy1Role'),
                    image: 'AD',
                    challenge: t('caseStudy1Challenge'),
                    solution: t('caseStudy1Solution'),
                    bgColor: 'from-blue-950/20'
                  },
                  {
                    company: 'TechGear Store',
                    industry: 'Electronics',
                    logo: 'TG',
                    metric1: '+89%',
                    metric1Label: t('caseStudyConversionIncrease'),
                    metric2: '-42%',
                    metric2Label: t('caseStudyCAC'),
                    quote: t('caseStudy2Quote'),
                    author: t('caseStudy2Author'),
                    role: 'E-commerce Manager',
                    image: 'MY',
                    challenge: t('caseStudy2Challenge'),
                    solution: t('caseStudy2Solution'),
                    bgColor: 'from-gray-900/50'
                  },
                  {
                    company: 'BeautyBox Kozmetik',
                    industry: 'Beauty & Cosmetics',
                    logo: 'BB',
                    metric1: '3.2x',
                    metric1Label: t('caseStudyROI'),
                    metric2: '+124%',
                    metric2Label: t('caseStudyOrganicTraffic'),
                    quote: t('caseStudy3Quote'),
                    author: t('caseStudy3Author'),
                    role: 'Digital Marketing Lead',
                    image: 'ZK',
                    challenge: t('caseStudy3Challenge'),
                    solution: t('caseStudy3Solution'),
                    bgColor: 'from-purple-950/20'
                  },
                  {
                    company: 'FitLife Nutrition',
                    industry: 'Health & Wellness',
                    logo: 'FL',
                    metric1: '+210%',
                    metric1Label: t('caseStudyEmailConversion'),
                    metric2: '₺890K',
                    metric2Label: t('caseStudyYearlySavings'),
                    quote: t('caseStudy4Quote'),
                    author: t('caseStudy4Author'),
                    role: 'Growth Hacker',
                    image: 'CO',
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

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white px-8 py-6 text-base">
              {t('caseStudiesViewAll')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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
              <Button className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white px-6 py-3">
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('faqLiveChatButton')}
              </Button>
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 px-6 py-3">
                {t('faqEmailButton')}
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
                title: 'E-ticarette ROAS Optimizasyonu: 2025 Stratejileri',
                excerpt: 'Reklam yatırım getirinizi maksimize etmek için kanıtlanmış 7 taktik.',
                date: '15 Kasım 2025',
                readTime: '5 dk',
                category: 'Strateji'
              },
              {
                title: 'AI ile Müşteri Segmentasyonu Nasıl Yapılır?',
                excerpt: 'Yapay zeka destekli segmentasyon ile dönüşüm oranlarınızı %40 artırın.',
                date: '12 Kasım 2025',
                readTime: '7 dk',
                category: 'AI & Otomasyon'
              },
              {
                title: 'TikTok Ads vs Meta Ads: 2025 Karşılaştırması',
                excerpt: 'Hangi platform işiniz için daha uygun? Detaylı analiz ve öneriler.',
                date: '8 Kasım 2025',
                readTime: '6 dk',
                category: 'Kanal Analizi'
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
              onClick={() => (window.location.href = `${appBase}/auth`)}
              className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white px-12 py-6 rounded-xl font-medium text-lg transition-all"
            >
              {t('ctaTryFree')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
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
                  <p className="text-sm text-gray-400">Son güncelleme: 25 Kasım 2025</p>
                  
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
                      <li>Pazarlama platformu verileri (Google Ads, Meta Ads, TikTok Ads hesap metrikleri)</li>
                      <li>Kullanım verileri (platform içi aktiviteler, tıklama davranışları)</li>
                      <li>Teknik bilgiler (IP adresi, tarayıcı türü, cihaz bilgileri)</li>
                      <li>Ödeme bilgileri (şifrelenmiş kredi kartı bilgileri)</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-white mb-3">3. Bilgilerin Kullanımı</h3>
                    <p className="leading-relaxed mb-3">Toplanan bilgiler şu amaçlarla kullanılır:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Platformun sunduğu hizmetleri sağlamak ve geliştirmek</li>
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
                </div>
              )}

              {openModal === 'terms' && (
                <div className="text-gray-300 space-y-6">
                  <p className="text-sm text-gray-400">Son güncelleme: 25 Kasım 2025</p>
                  
                  <section>
                    <h3 className="text-lg font-semibold text-white mb-3">1. Hizmet Şartları</h3>
                    <p className="leading-relaxed">
                      IQsion platformunu kullanarak, bu kullanım şartlarını kabul etmiş olursunuz. 
                      Platform, e-ticaret işletmeleri için pazarlama analizi ve optimizasyon hizmeti sunar.
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
                </div>
              )}

              {openModal === 'cookies' && (
                <div className="text-gray-300 space-y-6">
                  <p className="text-sm text-gray-400">Son güncelleme: 25 Kasım 2025</p>
                  
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
                      <li>Intercom - Müşteri desteği</li>
                      <li>Hotjar - Kullanıcı deneyimi analizi</li>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Assistant Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white rounded-full p-4 shadow-lg transition-all"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>

        {isChatOpen && (
          <Card className="absolute bottom-16 right-0 w-80 h-96 bg-gray-800 border border-gray-700 shadow-2xl rounded-2xl">
            <CardHeader className="bg-gray-900 text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AI Asistanınız</h4>
                    <p className="text-xs opacity-90">Pazarlama konusunda size yardımcı olacağım</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="text-white/80 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="h-64 overflow-y-auto p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                  <p className="text-gray-700 text-sm">
                    Merhaba! Size nasıl yardımcı olabilirim? 
                    ROAS analizi, bütçe optimizasyonu veya müşteri segmentasyonu hakkında sorularınızı sorabilirsiniz.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 text-xs">
                  📊 ROAS Analizi
                </Button>
                <Button size="sm" variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 text-xs">
                  💰 Bütçe Optimizasyonu
                </Button>
                <Button size="sm" variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 text-xs">
                  👥 Müşteri İnsights
                </Button>
              </div>
            </CardContent>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('faqQuestionPlaceholder')}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-gray-50 text-gray-700 rounded-lg px-3 py-2 text-sm border border-gray-200 focus:border-blue-500 focus:outline-none"
                />
                <Button 
                  size="sm"
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}