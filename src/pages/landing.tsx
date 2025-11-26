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
  LineChart
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
      <header className="bg-gray-950 border-b border-gray-900 sticky top-0 z-40">
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
      <section className="bg-gray-950 py-20 lg:py-32">
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
                  <span>5 dakikada kurulum</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>7/24 Destek</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Kredi kartı gerektirmez</span>
                </span>
              </div>

              {/* References Marquee */}
              <div className="mt-12">
                <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .marquee-track { animation: marquee 40s linear infinite; will-change: transform; }`}</style>
                <div className="overflow-hidden">
                  <h3 className="text-center text-base font-medium text-gray-300 mb-12">Türkiye'nin önde gelen e-ticaret markalarının güvendiği platform</h3>
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
              Tüm Verileriniz Tek Noktada
            </h2>
            <p className="text-lg text-gray-400">
              O da <span className="bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent font-semibold">akıllı bir nokta</span>
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
              Pazarlama Yönetimini Yeniden Tanımlayın
            </h2>
            <p className="text-lg font-light text-gray-400 max-w-3xl mx-auto">
              {activeDashboardView === 'overview' && 'Real-time dashboard ile tüm metriklerinizi anlık takip edin'}
              {activeDashboardView === 'ai' && 'Yapay zeka size ne yapmanız gerektiğini söyler, siz sadece onaylayın'}
              {activeDashboardView === 'audit' && 'Sitenizi otomatik tarıyor, sorunları tespit edip çözüm üretiyor'}
              {activeDashboardView === 'team' && 'Ekibinizle aynı platform üzerinde işbirliği yapın, onay süreçlerini yönetin'}
            </p>
          </div>

          {/* Dashboard View Tabs */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <button 
              onClick={() => setActiveDashboardView('overview')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'overview' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Genel Bakış
            </button>
            <button 
              onClick={() => setActiveDashboardView('ai')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'ai' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              AI Önerileri
            </button>
            <button 
              onClick={() => setActiveDashboardView('audit')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'audit' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Teknik Audit
            </button>
            <button 
              onClick={() => setActiveDashboardView('team')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'team' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Ekip & İşbirliği
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

              <CardContent className="p-8">
                {/* Overview View */}
                {activeDashboardView === 'overview' && (
                  <>
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                  <Card className="bg-gray-900 border border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold bg-green-500/20 px-2 py-1 rounded">+12.5%</span>
                      </div>
                      <h4 className="text-gray-400 text-sm mb-2">Toplam Gelir</h4>
                      <p className="text-2xl font-medium text-white">₺3,156,750</p>
                      <p className="text-gray-500 text-xs mt-2">Bu ay</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-orange-400" />
                        </div>
                        <span className="text-red-400 text-sm font-semibold bg-red-500/20 px-2 py-1 rounded">+8.2%</span>
                      </div>
                      <h4 className="text-gray-400 text-sm mb-2">Reklam Harcaması</h4>
                      <p className="text-2xl font-medium text-white">₺542,350</p>
                      <p className="text-gray-500 text-xs mt-2">Bu ay</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center">
                          <Zap className="w-6 h-6 text-gray-300" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold bg-green-500/20 px-2 py-1 rounded">+5.1%</span>
                      </div>
                      <h4 className="text-gray-400 text-sm mb-2">ROAS</h4>
                      <p className="text-2xl font-medium text-white">4.2x</p>
                      <p className="text-gray-500 text-xs mt-2">Ortalama</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold bg-green-500/20 px-2 py-1 rounded">+18.3%</span>
                      </div>
                      <h4 className="text-gray-400 text-sm mb-2">Dönüşümler</h4>
                      <p className="text-2xl font-medium text-white">12,470</p>
                      <p className="text-gray-500 text-xs mt-2">Bu ay</p>
                    </CardContent>
                  </Card>

                  {/* Net Kar */}
                  <Card className="bg-gray-900 border border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold bg-green-500/20 px-2 py-1 rounded">+3.1%</span>
                      </div>
                      <h4 className="text-gray-400 text-sm mb-2">Net Kar</h4>
                      <p className="text-2xl font-medium text-white">₺1,478,420</p>
                      <p className="text-gray-500 text-xs mt-2">Bu ay</p>
                    </CardContent>
                  </Card>

                  {/* Kâr Marjı */}
                  <Card className="bg-gray-900 border border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold bg-green-500/20 px-2 py-1 rounded">+1.4%</span>
                      </div>
                      <h4 className="text-gray-400 text-sm mb-2">Kâr Marjı</h4>
                      <p className="text-2xl font-medium text-white">36.4%</p>
                      <p className="text-gray-500 text-xs mt-2">Bu ay</p>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Recommendations */}
                <Card className="bg-gray-900/90 border border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">AI Önerileri</h4>
                        <p className="text-gray-300 text-sm">Performansınızı artırmak için kişiselleştirilmiş öneriler</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-gray-800/80 border border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-gray-300" />
                            </div>
                            <span className="text-gray-300 font-semibold">Fırsat</span>
                          </div>
                          <p className="text-white font-medium mb-2">TikTok bütçesini %30 artır</p>
                          <p className="text-gray-300 text-sm mb-3">En yüksek ROAS performansı gösteren kanal. Potansiyel +₺15,600 ek gelir.</p>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="border-gray-600 text-gray-300">TikTok Ads</Badge>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">Bütçe</Badge>
                                <Badge className="bg-gray-700 text-gray-300">%90 Güven</Badge>
                              </div>
                              <Button size="sm" className="bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                            Uygula
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800/80 border border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-gray-300" />
                            </div>
                            <span className="text-gray-300 font-semibold">Uyarı</span>
                          </div>
                          <p className="text-white font-medium mb-2">Google Ads CPC artışı</p>
                          <p className="text-gray-300 text-sm mb-3">Son 7 günde %18 CPC artışı tespit edildi. Anahtar kelime optimizasyonu öneriliyor.</p>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="border-gray-600 text-gray-300">Google Ads</Badge>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">Teklif</Badge>
                            <Badge className="bg-gray-700 text-gray-300">%84 Güven</Badge>
                          </div>
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                            Detayları Gör
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
                </>
                )}

                {/* AI Insights View */}
                {activeDashboardView === 'ai' && (
                  <div className="space-y-6">
                    <Card className="bg-gray-900/90 border border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">AI Önerileri</h4>
                            <p className="text-gray-300 text-sm">Performansınızı artırmak için kişiselleştirilmiş öneriler</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-gray-800/80 border border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                </div>
                                <span className="text-green-400 font-semibold">Fırsat</span>
                              </div>
                              <p className="text-white font-medium mb-2">TikTok bütçesini %30 artır</p>
                              <p className="text-gray-300 text-sm mb-3">En yüksek ROAS performansı gösteren kanal. Potansiyel +₺15,600 ek gelir.</p>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="border-gray-600 text-gray-300">TikTok Ads</Badge>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">Bütçe</Badge>
                                <Badge className="bg-gray-700 text-gray-300">%90 Güven</Badge>
                              </div>
                              <Button size="sm" className="bg-gray-700 text-white hover:bg-gray-600 transition-colors w-full">
                                Uygula
                              </Button>
                            </CardContent>
                          </Card>

                          <Card className="bg-gray-800/80 border border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
                                  <Zap className="w-4 h-4 text-orange-400" />
                                </div>
                                <span className="text-orange-400 font-semibold">Uyarı</span>
                              </div>
                              <p className="text-white font-medium mb-2">Google Ads CPC artışı</p>
                              <p className="text-gray-300 text-sm mb-3">Son 7 günde %18 CPC artışı tespit edildi. Anahtar kelime optimizasyonu öneriliyor.</p>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="border-gray-600 text-gray-300">Google Ads</Badge>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">Teklif</Badge>
                                <Badge className="bg-gray-700 text-gray-300">%84 Güven</Badge>
                              </div>
                              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full">
                                Detayları Gör
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Technical Audit View */}
                {activeDashboardView === 'audit' && (
                  <div className="space-y-6">
                    {/* Audit Score Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="bg-gray-900 border border-gray-700">
                        <CardContent className="p-6">
                          <h4 className="text-gray-400 text-sm mb-2">SEO Skoru</h4>
                          <div className="flex items-end gap-2">
                            <p className="text-4xl font-bold text-green-400">87</p>
                            <span className="text-gray-500 text-sm mb-1">/100</span>
                          </div>
                          <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{width: '87%'}}></div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border border-gray-700">
                        <CardContent className="p-6">
                          <h4 className="text-gray-400 text-sm mb-2">Performance</h4>
                          <div className="flex items-end gap-2">
                            <p className="text-4xl font-bold text-yellow-400">72</p>
                            <span className="text-gray-500 text-sm mb-1">/100</span>
                          </div>
                          <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{width: '72%'}}></div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border border-gray-700">
                        <CardContent className="p-6">
                          <h4 className="text-gray-400 text-sm mb-2">Accessibility</h4>
                          <div className="flex items-end gap-2">
                            <p className="text-4xl font-bold text-green-400">94</p>
                            <span className="text-gray-500 text-sm mb-1">/100</span>
                          </div>
                          <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{width: '94%'}}></div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border border-gray-700">
                        <CardContent className="p-6">
                          <h4 className="text-gray-400 text-sm mb-2">Best Practices</h4>
                          <div className="flex items-end gap-2">
                            <p className="text-4xl font-bold text-orange-400">68</p>
                            <span className="text-gray-500 text-sm mb-1">/100</span>
                          </div>
                          <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{width: '68%'}}></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Issues List */}
                    <Card className="bg-gray-800/50 border border-gray-700">
                      <CardContent className="p-6">
                        <h3 className="text-white font-medium mb-4">Tespit Edilen Sorunlar</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-red-400 text-xs">!</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">Kritik: Eksik meta açıklamaları</p>
                              <p className="text-gray-400 text-xs mt-1">12 sayfa meta description içermiyor</p>
                            </div>
                            <Badge className="bg-red-500/20 text-red-400">Yüksek</Badge>
                          </div>

                          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-yellow-400 text-xs">!</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">Uyarı: Optimize edilmemiş görseller</p>
                              <p className="text-gray-400 text-xs mt-1">8 görsel boyut optimizasyonu gerekiyor (toplam 2.4 MB)</p>
                            </div>
                            <Badge className="bg-yellow-500/20 text-yellow-400">Orta</Badge>
                          </div>

                          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-blue-400 text-xs">i</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">Bilgi: Alt tag eksiklikleri</p>
                              <p className="text-gray-400 text-xs mt-1">5 görselde alt attribute bulunmuyor</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-400">Düşük</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Team Collaboration View */}
                {activeDashboardView === 'team' && (
                  <div className="space-y-6">
                    {/* Team Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-800/50 border border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="text-white font-medium mb-4">Ekip Aktivitesi</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                                AY
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">Ayşe Yılmaz</p>
                                <p className="text-gray-400 text-xs">Meta kampanyası için bütçe artışı önerdi</p>
                                <p className="text-gray-500 text-xs mt-1">5 dakika önce</p>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400">Onaylandı</Badge>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                                MK
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">Mehmet Kaya</p>
                                <p className="text-gray-400 text-xs">Q1 raporunu paylaştı</p>
                                <p className="text-gray-500 text-xs mt-1">2 saat önce</p>
                              </div>
                              <Badge className="bg-blue-500/20 text-blue-400">Yeni</Badge>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                                ZA
                              </div>
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">Zeynep Arslan</p>
                                <p className="text-gray-400 text-xs">TikTok kampanyasına yorum yaptı</p>
                                <p className="text-gray-500 text-xs mt-1">1 gün önce</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800/50 border border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="text-white font-medium mb-4">Bekleyen Onaylar</h3>
                          <div className="space-y-3">
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-white font-medium text-sm">Bütçe Artış Talebi</p>
                                <Badge className="bg-yellow-500/20 text-yellow-400">Bekliyor</Badge>
                              </div>
                              <p className="text-gray-400 text-xs mb-3">Google Ads için ₺50,000 ek bütçe</p>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1">
                                  Onayla
                                </Button>
                                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs flex-1">
                                  Reddet
                                </Button>
                              </div>
                            </div>

                            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-white font-medium text-sm">Kampanya Durdurma</p>
                                <Badge className="bg-yellow-500/20 text-yellow-400">Bekliyor</Badge>
                              </div>
                              <p className="text-gray-400 text-xs mb-3">Düşük performanslı 3 kampanya için</p>
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs flex-1">
                                  Onayla
                                </Button>
                                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs flex-1">
                                  İncele
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Team Members */}
                    <Card className="bg-gray-800/50 border border-gray-700">
                      <CardContent className="p-6">
                        <h3 className="text-white font-medium mb-4">Ekip Üyeleri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              AY
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">Ayşe Yılmaz</p>
                              <p className="text-gray-400 text-xs">Marketing Manager</p>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              MK
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">Mehmet Kaya</p>
                              <p className="text-gray-400 text-xs">Data Analyst</p>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                              ZA
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">Zeynep Arslan</p>
                              <p className="text-gray-400 text-xs">Creative Director</p>
                            </div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
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
              Sadece Rapor Değil, <span className="bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent font-semibold">Aksiyon</span>
            </h2>
            <p className="text-xl font-light text-gray-400 max-w-3xl mx-auto">
              Günde saatler harcadığınız analiz, rapor ve optimizasyon işlerini IQsion sizin için yapar. Siz sadece takip edin ve kontrol edin, operasyonu O'na bırakın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Karar Mekanizması & Otomatik Aksiyonlar",
                description: "Günlerce süren kampanya analiz ve optimizasyon işini 5 dakikaya indirin. Gemini AI analiz eder, önerir, siz sadece onaylayın.",
                features: [
                  "Tek tıkla kampanya optimizasyonu",
                  "Ekip üyelerine aksiyon ataması",
                  "Otomatik budget reallocations"
                ]
              },
              {
                icon: TrendingUp,
                title: "MMM & Forecasting",
                description: "Haftalık süren karmaşık bütçe planlamasını otomatikleştirin. 30-90 günlük satış tahminleri ve kâr odaklı bütçe dağılımı saniyeler içinde hazır.",
                features: [
                  "30-90 günlük satış projeksiyonları",
                  "Kanal bazlı katkı analizi",
                  "Profit-focused budget allocation"
                ]
              },
              {
                icon: Bell,
                title: "Akıllı Anomali Tespit & Monitoring",
                description: "Manuel takipten kurtulun, sorunları siz fark etmeden önce uyarı alın. 7/24 otomatik izleme ile günde saatler kazanın.",
                features: [
                  "7/24 otomatik izleme",
                  "Proaktif uyarılar (Slack, email, SMS)",
                  "Site performans ve SEO monitoring"
                ]
              },
              {
                icon: CircleDollarSign,
                title: "Karlılık Odaklı Attribution",
                description: "Excel'de günlerce süren kârlılık analizini otomatikleştirin. Gerçek ROI'nizi anında görün, hangi kanallara yatırım yapacağınıza hızla karar verin.",
                features: [
                  "Profit-first attribution modeling",
                  "Multi-touch customer journey tracking",
                  "Gerçek ROI hesaplama (ürün maliyetleri dahil)"
                ]
              },
              {
                icon: LineChart,
                title: "Yönetici Dashboard'ları",
                description: "Haftalık rapor hazırlama ritüelini bitirin. Executive summary otomatik oluşturulur, e-posta ile gönderilir. Siz toplantılara hazır girin.",
                features: [
                  "Executive summary views",
                  "Otomatik haftalık/aylık raporlama",
                  "Key metrics tracking (CAC, LTV, ROAS, Profit)"
                ]
              },
              {
                icon: Zap,
                title: "Custom Workflow Builder",
                description: "IT ekibine bağımlı kalmayın, kendi otomasyon kurallarınızı dakikalar içinde kurun. No-code builder ile onay zincirleri, uyarılar ve aksiyonları sürükle-bırak.",
                features: [
                  "No-code workflow builder",
                  "Özelleştirilebilir onay zincirleri",
                  "Custom trigger & action rules"
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
              Basit ve Şeffaf Fiyatlandırma
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              KOBİ'ler için uygun fiyatlarla güçlü pazarlama zekası
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
                Şirketler
              </button>
              <button 
                onClick={() => setActiveAudience('agencies')}
                className={`px-8 py-3 rounded-xl border font-medium transition-colors ${
                  activeAudience === 'agencies' 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Ajanslar
              </button>
              <button 
                onClick={() => setActiveAudience('entrepreneurs')}
                className={`px-8 py-3 rounded-xl border font-medium transition-colors ${
                  activeAudience === 'entrepreneurs' 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                Girişimciler
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
                      <p className="text-gray-300 text-sm">Veri odaklı kararlar alarak pazarlama bütçenizi optimize edin</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">Tüm kanallarınızı tek yerden yönetin ve performansı artırın</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">AI destekli önerilerle rekabette öne geçin</p>
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
                      <p className="text-gray-300 text-sm">Çoklu müşteri hesaplarını tek platformdan yönetin</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">Otomatik raporlama ile zamandan tasarruf edin</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Database className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">Müşterilerinize profesyonel analizler sunun</p>
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
                      <p className="text-gray-300 text-sm">Sınırlı bütçeyle maksimum etki yaratın</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Map className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">Kolay kullanım ile hızlı başlayın, uzmanlık gerektirmez</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900/50 border border-gray-800">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-300 text-sm">İşinizi büyütürken pazarlama stratejinizi geliştirin</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-gray-800 border border-gray-700">
              <CardContent className="p-8">
                <h3 className="text-xl font-normal text-white mb-2">Başlangıç</h3>
                <p className="text-gray-300 mb-6">Küçük işletmeler için ideal</p>
                <div className="mb-6">
                  <span className="text-4xl font-light text-white">₺299</span>
                  <span className="text-gray-400">/ay</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">2 platform entegrasyonu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Temel AI analizi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Haftalık raporlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">E-posta desteği</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all shadow-sm rounded-xl font-medium">
                  Başla
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gray-800 border-2 border-blue-800 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-800 to-blue-950 text-white px-4 py-2">En Popüler</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-normal text-white mb-2">Profesyonel</h3>
                <p className="text-gray-300 mb-6">Büyüyen işletmeler için</p>
                <div className="mb-6">
                  <span className="text-4xl font-light text-white">₺599</span>
                  <span className="text-gray-400">/ay</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Sınırsız platform entegrasyonu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Gelişmiş AI analizi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Otomatik optimizasyon</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Günlük raporlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Öncelikli destek</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all shadow-sm rounded-xl font-medium">
                  Başla
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-gray-800 border border-gray-700">
              <CardContent className="p-8">
                <h3 className="text-xl font-normal text-white mb-2">Kurumsal</h3>
                <p className="text-gray-300 mb-6">Büyük şirketler için</p>
                <div className="mb-6">
                  <span className="text-4xl font-light text-white">₺1,299</span>
                  <span className="text-gray-400">/ay</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Özel entegrasyonlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">API erişimi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Özel AI modelleri</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Real-time analitik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Özel hesap yöneticisi</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white transition-all shadow-sm rounded-xl font-medium">
                  İletişime Geç
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-light text-white mb-4">
              {t('testimonials')}
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">100+ e-ticaret işletmesi IQsion ile büyümesini hızlandırdı.</p>
          </div>
          <div className="relative">
            <div className="overflow-x-auto hide-scrollbar py-4">
              <div className="flex gap-6 min-w-max">
                {[
                  { quote: 'ROAS oranlarımızı %38 artırdık, bütçe optimizasyonu artık otomatik.', name: 'Ahmet K.', role: 'Dijital Pazarlama Müdürü' },
                  { quote: 'Tek panelden tüm verileri görmek ekip iletişimini hızlandırdı.', name: 'Elif S.', role: 'Growth Lead' },
                  { quote: 'AI önerileri ile kampanya ayarlama süresi %60 azaldı.', name: 'Mert T.', role: 'Performance Specialist' },
                  { quote: 'Segmentasyon önerileri sayesinde yeni müşteri edinim maliyeti düştü.', name: 'Selin Y.', role: 'E-commerce Manager' },
                  { quote: 'Otomatik aksiyonlar günlük operasyonu %40 azalttı.', name: 'Burak A.', role: 'Marketing Lead' }
                ].map((tst, i) => (
                  <Card key={i} className="bg-gray-800 border border-gray-700 hover:shadow-lg transition-shadow w-80 flex-shrink-0">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-3">
                        <div className="text-yellow-400 flex gap-1 mb-2">
                          {[...Array(5)].map((_,si) => <Star key={si} className="w-4 h-4" />)}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">"{tst.quote}"</p>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-700">
                        <p className="font-semibold text-white text-sm">{tst.name}</p>
                        <p className="text-xs text-gray-400">{tst.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-xl text-gray-300">
              Merak ettiklerinize yanıtlar
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'IQsion nasıl çalışır?',
                answer: 'IQsion, pazarlama platformlarınızı (Google Ads, Meta, TikTok, Shopify vb.) bağlayarak tüm verilerinizi tek bir panelde toplar. AI destekli analizler ile performansınızı gerçek zamanlı izler ve otomatik öneriler sunar.'
              },
              {
                question: 'Hangi platformlarla entegre olabilir?',
                answer: 'Google Ads, Meta (Facebook & Instagram), TikTok Ads, Google Analytics, Shopify ve daha fazlası ile entegrasyon sağlıyoruz. Yeni platformlar sürekli eklenmektedir.'
              },
              {
                question: 'Kurulum ne kadar sürer?',
                answer: 'Ortalama 5 dakika içinde hesabınızı oluşturabilir ve ilk platformunuzu bağlayabilirsiniz. Detaylı analizler için verilerinizin toplanması 24 saat içinde tamamlanır.'
              },
              {
                question: 'Ücretsiz deneme döneminde tüm özelliklere erişebilir miyim?',
                answer: 'Evet! 14 günlük ücretsiz deneme süresince profesyonel plandaki tüm özelliklere sınırsız erişiminiz olacak. Kredi kartı bilgisi gerektirmez.'
              },
              {
                question: 'Verilerim güvende mi?',
                answer: 'Verileriniz 256-bit SSL şifreleme ile korunur ve ISO 27001 sertifikalı sunucularda saklanır. Hiçbir veri üçüncü taraflarla paylaşılmaz.'
              },
              {
                question: 'Planımı istediğim zaman değiştirebilir miyim?',
                answer: 'Evet, planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. Değişiklikler anında geçerli olur ve ücret hesaplaması orantılı yapılır.'
              },
              {
                question: 'Teknik bilgiye ihtiyaç var mı?',
                answer: 'Hayır! IQsion kullanıcı dostu arayüzü ile hiçbir teknik bilgi gerektirmez. Basit tıklamalarla platformlarınızı bağlayıp analizlerinize başlayabilirsiniz.'
              },
              {
                question: 'Destek hizmeti nasıl?',
                answer: 'Tüm planlarda e-posta desteği sunuyoruz. Profesyonel ve Kurumsal planlarda öncelikli destek ve özel hesap yöneticisi hizmeti bulunmaktadır.'
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-gray-900/50 border border-gray-800">
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors rounded-xl"
                  >
                    <span className="text-white font-medium text-lg pr-4">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-5 pt-2">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              Pazarlama İçgörüleri
            </h2>
            <p className="text-xl text-gray-300">
              E-ticaret ve dijital pazarlama dünyasından en güncel stratejiler
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
              Tüm Yazıları Görüntüle
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
                Pazarlama İpuçlarını Kaçırmayın
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Her hafta e-ticaret ve dijital pazarlama stratejileri, AI trendleri ve platform güncellemeleri hakkında özel içerikler alın.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-600 h-14"
                />
                <Button className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white px-8 rounded-xl font-medium transition-all whitespace-nowrap h-14">
                  Abone Ol
                </Button>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Spam göndermiyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
  <section className="py-20 bg-gray-950">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-light text-white mb-6">
            Pazarlama Performansınızı Bir Sonraki Seviyeye Taşımaya Hazır mısınız?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            14 gün ücretsiz deneme. Kredi kartı gerektirmez. 
            5 dakikada kurulum tamamlanır.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => (window.location.href = `${appBase}/auth`)}
              className="bg-gradient-to-r from-blue-800 to-blue-950 hover:from-blue-900 hover:to-black text-white px-8 py-4 rounded-xl font-medium text-lg shadow-sm transition-all"
            >
              {t('tryFree')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="ghost"
              className="border-2 border-blue-800 text-blue-300 hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-950 hover:text-white px-8 py-4 rounded-xl font-medium text-lg shadow-sm transition-all"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {t('requestDemo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-white">IQsion</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                KOBİ'ler için tasarlanmış yapay zeka destekli pazarlama platformu. 
                Verilerinizi birleştirin, kârınızı artırın.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-sm text-gray-400">500+ mutlu müşteri</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Ürün</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Dokümantasyonu</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Güvenlik</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Destek</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Video Eğitimler</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Canlı Destek</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2025 IQsion. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <button onClick={() => setOpenModal('privacy')} className="text-gray-500 hover:text-white transition-colors">Gizlilik Politikası</button>
                <button onClick={() => setOpenModal('terms')} className="text-gray-500 hover:text-white transition-colors">Kullanım Şartları</button>
                <button onClick={() => setOpenModal('cookies')} className="text-gray-500 hover:text-white transition-colors">Çerezler</button>
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
                  {openModal === 'privacy' && 'Gizlilik Politikası'}
                  {openModal === 'terms' && 'Kullanım Şartları'}
                  {openModal === 'cookies' && 'Çerez Politikası'}
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
                  placeholder="Sorunuzu yazın..."
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