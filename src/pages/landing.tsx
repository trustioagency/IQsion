import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
  Shield,
  RefreshCw,
  MessageCircle,
  X,
  Send,
  ArrowRight,
  CheckCircle,
  Users,
  Target,
  Globe,
  Smartphone
} from "lucide-react";
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

export default function Landing() {
  const { t, language } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Auth actions should go to app subdomain ONLY in production domains.
  // In local dev (localhost:5173) we must stay local to avoid unwanted redirects.
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{language === 'tr' ? 'Pazarlama Zekası' : 'Marketing Intelligence'}</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">{t('features')}</a>
              <a href="#dashboard" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">{t('dashboard')}</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">{language === 'tr' ? 'Fiyatlandırma' : 'Pricing'}</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">{t('contact')}</a>
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="text-gray-600 hover:text-gray-900"
              >
                {t('login')}
              </Button>
              <Button 
                onClick={handleStartTrial}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6"
              >
                {t('startFree')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 mb-6 px-4 py-2">
              🚀 {language === 'tr' ? 'KOBİ\'ler için özel olarak tasarlandı' : 'Specially designed for SMEs'}
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t('heroTitle')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">
                {t('heroSubtitle')}
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {t('heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={handleStartTrial}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg"
              >
                {t('tryFree')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {t('watchDemo')}
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Kredi kartı gerektirmez</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>5 dakikada kurulum</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>24/7 destek</span>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Entegre Platformlar</span>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">Shopify</Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">Meta Ads</Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">Google Ads</Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">TikTok Ads</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tüm Pazarlama Verileriniz Tek Noktada
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time dashboard ile performansınızı takip edin, AI önerileri alın ve otomatik eylemler gerçekleştirin.
            </p>
          </div>

          {/* Dashboard Interface */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            <Card className="relative bg-white border border-gray-200 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-500">app.pazarlamazekasi.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Canlı Veri</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded">+12.5%</span>
                      </div>
                      <h4 className="text-gray-500 text-sm mb-2">Toplam Gelir</h4>
                      <p className="text-2xl font-bold text-gray-900">₺156,750</p>
                      <p className="text-gray-400 text-xs mt-2">Bu ay</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-red-600 text-sm font-semibold bg-red-50 px-2 py-1 rounded">+8.2%</span>
                      </div>
                      <h4 className="text-gray-500 text-sm mb-2">Reklam Harcaması</h4>
                      <p className="text-2xl font-bold text-gray-900">₺42,350</p>
                      <p className="text-gray-400 text-xs mt-2">Bu ay</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded">+5.1%</span>
                      </div>
                      <h4 className="text-gray-500 text-sm mb-2">ROAS</h4>
                      <p className="text-2xl font-bold text-gray-900">3.7x</p>
                      <p className="text-gray-400 text-xs mt-2">Ortalama</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded">+18.3%</span>
                      </div>
                      <h4 className="text-gray-500 text-sm mb-2">Dönüşümler</h4>
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                      <p className="text-gray-400 text-xs mt-2">Bu ay</p>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Recommendations */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">AI Önerileri</h4>
                        <p className="text-gray-600 text-sm">Performansınızı artırmak için kişiselleştirilmiş öneriler</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-white/80 border border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-green-700 font-semibold">Fırsat</span>
                          </div>
                          <p className="text-gray-900 font-medium mb-2">TikTok bütçesini %30 artır</p>
                          <p className="text-gray-600 text-sm mb-3">En yüksek ROAS performansı gösteren kanal. Potansiyel +₺15,600 ek gelir.</p>
                          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                            Uygula
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 border border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-orange-700 font-semibold">Uyarı</span>
                          </div>
                          <p className="text-gray-900 font-medium mb-2">Google Ads CPC artışı</p>
                          <p className="text-gray-600 text-sm mb-3">Son 7 günde %18 CPC artışı tespit edildi. Anahtar kelime optimizasyonu öneriliyor.</p>
                          <Button size="sm" variant="outline" className="border-gray-300">
                            Detayları Gör
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pazarlama Kararlarınızı AI ile Otomatize Edin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg transition-all hover:scale-105">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="text-sm text-gray-500 space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
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
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Basit ve Şeffaf Fiyatlandırma
            </h2>
            <p className="text-xl text-gray-600">
              KOBİ'ler için uygun fiyatlarla güçlü pazarlama zekası
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Başlangıç</h3>
                <p className="text-gray-600 mb-6">Küçük işletmeler için ideal</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">₺299</span>
                  <span className="text-gray-600">/ay</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">2 platform entegrasyonu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Temel AI analizi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Haftalık raporlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">E-posta desteği</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">
                  Başla
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-white border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-2">En Popüler</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Profesyonel</h3>
                <p className="text-gray-600 mb-6">Büyüyen işletmeler için</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">₺599</span>
                  <span className="text-gray-600">/ay</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Sınırsız platform entegrasyonu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Gelişmiş AI analizi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Otomatik optimizasyon</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Günlük raporlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Öncelikli destek</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Başla
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kurumsal</h3>
                <p className="text-gray-600 mb-6">Büyük şirketler için</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">₺1,299</span>
                  <span className="text-gray-600">/ay</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Özel entegrasyonlar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">API erişimi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Özel AI modelleri</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Real-time analitik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Özel hesap yöneticisi</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">
                  İletişime Geç
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pazarlama Performansınızı Bir Sonraki Seviyeye Taşımaya Hazır mısınız?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            14 gün ücretsiz deneme. Kredi kartı gerektirmez. 
            5 dakikada kurulum tamamlanır.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => (window.location.href = `${appBase}/auth`)}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100"
            >
              Ücretsiz Denemeyi Başlat
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Demo Rezervasyonu
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Pazarlama Zekası</span>
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
                © 2024 Pazarlama Zekası. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-500 hover:text-white transition-colors">Gizlilik Politikası</a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">Kullanım Şartları</a>
                <a href="#" className="text-gray-500 hover:text-white transition-colors">Çerezler</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Assistant Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>

        {isChatOpen && (
          <Card className="absolute bottom-16 right-0 w-80 h-96 bg-white border border-gray-200 shadow-2xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
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