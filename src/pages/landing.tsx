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
  ChevronDown
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
  const [activeDashboardView, setActiveDashboardView] = useState<'overview' | 'ai' | 'channels'>('overview');
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
              <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white group-hover:text-gray-300 transition-colors whitespace-nowrap">IQsion</span>
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
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl px-6 py-2 shadow-sm whitespace-nowrap transition-colors font-medium"
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
            <Badge className="bg-gray-800 text-gray-200 border-gray-700 mb-6 px-4 py-2">
              🚀 {language === 'tr' ? 'KOBİ\'ler için özel olarak tasarlandı' : 'Specially designed for SMEs'}
            </Badge>

            <h1 className="font-light text-white mb-6 leading-[1.15]">
              <span className="block text-[clamp(20px,2.6vw,36px)] font-normal">{language === 'tr' ? 'Markalar için' : 'For Brands'}</span>
              <span className="block text-white whitespace-nowrap tracking-tight text-[clamp(28px,5.2vw,64px)] font-light">
                {typedText}<span className="caret-inline" aria-hidden="true"></span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-5xl mx-auto [text-wrap:balance]">
              {descText}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={handleStartTrial}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-medium text-lg shadow-md transition-colors"
              >
                {t('tryFree')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="ghost"
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-medium text-lg shadow-md transition-colors"
              >
                <Play className="w-5 h-5 mr-2" />
                {t('watchDemo')}
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-6 whitespace-nowrap overflow-x-auto hide-scrollbar px-2">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Kredi kartı gerektirmez</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>5 dakikada kurulum</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24/7 destek</span>
                </span>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-center mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('integratedPlatforms')}</span>
                </div>
                <style>{`@keyframes marqueePlatforms { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .platforms-track { animation: marqueePlatforms 28s linear infinite; }`}</style>
                <div className="relative overflow-hidden">
                  <div className="flex platforms-track w-[200%] gap-10 py-2 opacity-95">
                    {[1,2].map(loop => (
                      <div key={loop} className="flex items-center justify-around w-1/2 gap-8">
                        {/* Shopify */}
                        <div className="flex flex-col items-center gap-2 min-w-[80px]">
                          <div className="h-10 flex items-center justify-center">
                            <BrandLogo name="shopify" size={36} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">Shopify</span>
                        </div>
                        {/* İkas */}
                        <div className="flex flex-col items-center gap-2 min-w-[80px]">
                          <div className="h-10 flex items-center justify-center">
                            <BrandLogo name="ikas" size={34} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">İkas</span>
                        </div>
                        {/* Meta */}
                        <div className="flex flex-col items-center gap-2 min-w-[80px]">
                          <div className="h-10 flex items-center justify-center">
                            <BrandLogo name="meta" size={36} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">Meta</span>
                        </div>
                        {/* Google Ads */}
                        <div className="flex flex-col items-center gap-2 min-w-[80px]">
                          <div className="h-10 flex items-center justify-center">
                            <BrandLogo name="googleads" size={36} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">Google Ads</span>
                        </div>
                        {/* Google Analytics */}
                        <div className="flex flex-col items-center gap-2 min-w-[80px]">
                          <div className="h-10 flex items-center justify-center">
                            <BrandLogo name="googleanalytics" size={34} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">Analytics</span>
                        </div>
                        {/* TikTok */}
                        <div className="flex flex-col items-center gap-2 min-w-[80px]">
                          <div className="h-10 flex items-center justify-center">
                            <BrandLogo name="tiktok" size={32} />
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">TikTok</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* References Marquee */}
      <section id="references" className="py-10 bg-gray-950">
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .marquee-track { animation: marquee 30s linear infinite; will-change: transform; }`}</style>
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <h3 className="text-center text-sm font-medium text-gray-400 tracking-wider mb-6">{t('references')}</h3>
          <div className="relative">
            <div className="flex marquee-track w-[200%]">
              {[1,2].map(loop => (
                <div key={loop} className="flex items-center justify-around w-1/2 gap-16">
                  {['Hepsiburada','Trendyol','Amazon','Ebay','N11','GittiGidiyor','Migros'].map((brand,idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="h-8 w-24 bg-gray-800 rounded flex items-center justify-center text-[11px] font-semibold text-gray-300 border border-gray-700">
                        {brand}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              Tüm Pazarlama Verileriniz Tek Noktada
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time dashboard ile performansınızı takip edin, AI önerileri alın ve otomatik eylemler gerçekleştirin.
            </p>
          </div>

          {/* Dashboard View Tabs */}
          <div className="flex justify-center gap-3 mb-8">
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
              onClick={() => setActiveDashboardView('channels')}
              className={`px-6 py-2.5 rounded-xl border font-medium transition-colors text-sm ${
                activeDashboardView === 'channels' 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Kanal Performansı
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

                {/* Channel Performance View */}
                {activeDashboardView === 'channels' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-gray-900 border border-gray-700">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-medium">Google Ads</h4>
                            <Badge className="bg-green-500/20 text-green-400">Aktif</Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm">Harcama</p>
                              <p className="text-white text-xl font-medium">₺185,420</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">ROAS</p>
                              <p className="text-white text-xl font-medium">3.8x</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Dönüşüm</p>
                              <p className="text-white text-xl font-medium">4,230</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border border-gray-700">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-medium">Meta Ads</h4>
                            <Badge className="bg-green-500/20 text-green-400">Aktif</Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm">Harcama</p>
                              <p className="text-white text-xl font-medium">₺142,850</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">ROAS</p>
                              <p className="text-white text-xl font-medium">4.1x</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Dönüşüm</p>
                              <p className="text-white text-xl font-medium">3,680</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border border-gray-700">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-medium">TikTok Ads</h4>
                            <Badge className="bg-green-500/20 text-green-400">Aktif</Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-gray-400 text-sm">Harcama</p>
                              <p className="text-white text-xl font-medium">₺98,650</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">ROAS</p>
                              <p className="text-white text-xl font-medium">5.2x</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Dönüşüm</p>
                              <p className="text-white text-xl font-medium">2,840</p>
                            </div>
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
              Pazarlama Kararlarınızı AI ile Otomatize Edin
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Veri analizinden eylem planına kadar tüm pazarlama süreçlerinizi akıllı asistanımızla yönetin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: "Otomatik Veri Entegrasyonu",
                description: "Shopify, Meta, Google Ads, TikTok verilerinizi tek tıkla bağlayın. Manuel veri girişine son verin.",
                features: ["Real-time veri senkronizasyonu", "Güvenli API bağlantıları"]
              },
              {
                icon: Brain,
                title: "Yapay Zeka Analizi", 
                description: "Gelişmiş AI algoritmaları ile pazarlama performansınızı analiz edin ve gelecek trendleri öngörün.",
                features: ["Tahmine dayalı analitik", "Anomali tespit sistemi"]
              },
              {
                icon: Lightbulb,
                title: "Akıllı Öneriler",
                description: "AI asistanınız size hangi reklamları durdurmanız, hangi ürünleri öne çıkarmanız gerektiğini söyler.",
                features: ["Tek tıkla uygulama", "ROI odaklı öneriler"]
              },
              {
                icon: Zap,
                title: "Otomatik Eylemler",
                description: "Kârınızı korumak için otomatik budget ayarlamaları ve reklam optimizasyonları yapın.",
                features: ["Budget koruma sistemi", "Performance monitöring"]
              },
              {
                icon: Map,
                title: "Müşteri Yolculuğu",
                description: "Her müşterinin ilk reklamdan satın almaya kadar olan tüm yolculuğunu görselleştirin.",
                features: ["Touchpoint analizi", "Attribution modeling"]
              },
              {
                icon: BarChart3,
                title: "Akıllı Raporlama",
                description: "Özelleştirilebilir dashboard'lar ve otomatik raporlarla performansınızı takip edin.",
                features: ["Özelleştirilebilir widget'lar", "Otomatik e-posta raporları"]
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-800 border border-gray-700">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-normal text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 mb-6">{feature.description}</p>
                  <ul className="text-sm text-gray-400 space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {item}
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
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white transition-colors shadow-sm">
                  Başla
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gray-800 border-2 border-gray-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gray-700 text-white px-4 py-2">En Popüler</Badge>
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
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white transition-colors shadow-sm">
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
                <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white transition-colors shadow-sm">
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
                <Button className="bg-white text-gray-900 px-8 rounded-xl font-medium hover:bg-gray-100 transition-colors whitespace-nowrap h-14">
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
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-100 shadow-sm transition-colors"
            >
              {t('tryFree')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="ghost"
              className="bg-gray-800 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-700 shadow-sm transition-colors"
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
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-4 shadow-lg transition-colors"
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