import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Target, Plus, TrendingUp, DollarSign, Users, 
  CheckCircle, Clock, ArrowRight, Sparkles, Brain,
  BarChart3, PieChart, PlayCircle, Zap, Activity,
  ShoppingCart, Eye, MousePointer, Instagram, Globe,
  MessageCircle, Calendar, Settings, FileText
} from "lucide-react";

interface StrategyCard {
  id: string;
  title: string;
  kpi: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
  timeframe: 'short' | 'medium' | 'long';
  icon: string;
  color: string;
}

interface ActionSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'automation' | 'analysis';
  icon: string;
  aiPowered: boolean;
}

export default function Strategy() {
  const [selectedAccount, setSelectedAccount] = useState('instagram-main');
  const [selectedCard, setSelectedCard] = useState<StrategyCard | null>(null);
  const [strategyCards, setStrategyCards] = useState<StrategyCard[]>([
    {
      id: '1',
      title: 'Takipçi Artışı',
      kpi: 'Takipçi Sayısı',
      currentValue: 10000,
      targetValue: 11500,
      unit: 'takipçi',
      progress: 60,
      timeframe: 'short',
      icon: 'Users',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      title: 'Etkileşim Oranı',
      kpi: 'Engagement Rate',
      currentValue: 2.1,
      targetValue: 3.0,
      unit: '%',
      progress: 45,
      timeframe: 'short',
      icon: 'MessageCircle',
      color: 'bg-green-500'
    },
    {
      id: '3',
      title: 'Marka Bilinirliği',
      kpi: 'Marka Aramaları',
      currentValue: 250,
      targetValue: 300,
      unit: 'arama/ay',
      progress: 10,
      timeframe: 'medium',
      icon: 'Eye',
      color: 'bg-purple-500'
    },
    {
      id: '4',
      title: 'Web Sitesi Trafiği',
      kpi: 'Sosyal Medya Trafiği',
      currentValue: 1200,
      targetValue: 1500,
      unit: 'ziyaret/ay',
      progress: 30,
      timeframe: 'medium',
      icon: 'Globe',
      color: 'bg-orange-500'
    },
    {
      id: '5',
      title: 'Topluluk Oluşturma',
      kpi: 'Discord Üyeleri',
      currentValue: 0,
      targetValue: 1000,
      unit: 'üye',
      progress: 0,
      timeframe: 'long',
      icon: 'Users',
      color: 'bg-red-500'
    }
  ]);

  const accounts = [
    { id: 'instagram-main', name: 'Instagram - @kullaniciadi', platform: 'Instagram', icon: 'Instagram' },
    { id: 'google-ads-x', name: 'Google Ads - Proje X', platform: 'Google Ads', icon: 'Globe' },
    { id: 'meta-ads-main', name: 'Meta Ads - Ana Hesap', platform: 'Meta', icon: 'Target' },
    { id: 'tiktok-brand', name: 'TikTok - Marka Hesabı', platform: 'TikTok', icon: 'PlayCircle' }
  ];

  const timeframes = {
    short: { title: 'Kısa Vade', subtitle: 'Bu Çeyrek' },
    medium: { title: 'Orta Vade', subtitle: 'Sonraki Çeyrek' },
    long: { title: 'Uzun Vade', subtitle: 'Yıl Sonu' }
  };

  const actionSuggestions: { [key: string]: ActionSuggestion[] } = {
    '1': [
      {
        id: 'content-1',
        title: 'İçerik Önerisi',
        description: 'Rakiplerinizin en çok etkileşim alan son 5 Reel içeriğini analiz ederek size özel 3 yeni Reel fikri oluşturun.',
        type: 'content',
        icon: 'FileText',
        aiPowered: true
      },
      {
        id: 'automation-1',
        title: 'Etkileşim Otomasyonu',
        description: '#pazarlama etiketindeki son 1 saatte paylaşılmış en popüler 10 gönderiye sizin adınıza yorum yapın.',
        type: 'automation',
        icon: 'Zap',
        aiPowered: true
      },
      {
        id: 'analysis-1',
        title: 'Analiz',
        description: 'Takipçi artış hızınızın en yüksek olduğu gün ve saatleri analiz edin.',
        type: 'analysis',
        icon: 'BarChart3',
        aiPowered: false
      }
    ],
    '2': [
      {
        id: 'content-2',
        title: 'Hikaye Stratejisi',
        description: 'Etkileşimi artıracak soru-cevap, anket ve quiz içerikleri oluşturun.',
        type: 'content',
        icon: 'MessageCircle',
        aiPowered: true
      },
      {
        id: 'automation-2',
        title: 'Otomatik Yanıt',
        description: 'Yorumlara otomatik teşekkür mesajları ve etkileşim artırıcı sorular gönder.',
        type: 'automation',
        icon: 'Zap',
        aiPowered: true
      }
    ]
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Users, MessageCircle, Eye, Globe, Instagram, Target, PlayCircle,
      FileText, Zap, BarChart3, Plus, Settings, Brain, Sparkles
    };
    return icons[iconName] || Target;
  };

  const handleCardClick = (card: StrategyCard) => {
    setSelectedCard(card);
  };

  const addNewCard = (timeframe: 'short' | 'medium' | 'long') => {
    const newCard: StrategyCard = {
      id: Date.now().toString(),
      title: 'Yeni Hedef',
      kpi: 'KPI Seçin',
      currentValue: 0,
      targetValue: 100,
      unit: 'birim',
      progress: 0,
      timeframe,
      icon: 'Target',
      color: 'bg-gray-500'
    };
    setStrategyCards([...strategyCards, newCard]);
  };

  const renderStrategyCard = (card: StrategyCard) => {
    const Icon = getIcon(card.icon);
    return (
      <Card 
        key={card.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          selectedCard?.id === card.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => handleCardClick(card)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${card.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-slate-600">{card.kpi}</div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold">
              {card.currentValue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">
              / {card.targetValue.toLocaleString()} {card.unit}
            </span>
          </div>
          <Progress value={card.progress} className="h-2" />
          <div className="text-xs text-slate-500">%{card.progress} tamamlandı</div>
        </CardContent>
      </Card>
    );
  };

  const renderActionPanel = () => {
    if (!selectedCard) {
      return (
        <div className="text-center text-slate-500 py-8">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aksiyon önerilerini görmek için bir hedef seçin</p>
        </div>
      );
    }

    const suggestions = actionSuggestions[selectedCard.id] || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Hedef: {selectedCard.title}</h3>
        </div>

        <div className="text-sm text-slate-600 mb-4">
          Önerilen Aksiyonlar:
        </div>

        {suggestions.map((suggestion, index) => {
          const Icon = getIcon(suggestion.icon);
          return (
            <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      {suggestion.aiPowered && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          <Brain className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex gap-2">
                      {suggestion.type === 'content' && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Fikirleri Oluştur
                        </Button>
                      )}
                      {suggestion.type === 'automation' && (
                        <>
                          <Button size="sm" className="text-xs">
                            Otomatik Uygula
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Settings className="w-3 h-3 mr-1" />
                            Ayarlar
                          </Button>
                        </>
                      )}
                      {suggestion.type === 'analysis' && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Raporu Göster
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
            {/* Header and Account Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Strateji Planlayıcı</h1>
                  <p className="text-muted-foreground mt-1">
                    Pazarlama hedeflerinizi planlayın ve AI destekli önerilerle hedefinize ulaşın
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="account-select" className="text-sm font-medium whitespace-nowrap">
                      Hesap Seçimi:
                    </Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => {
                          const Icon = getIcon(account.icon);
                          return (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {account.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Strategy Timeline (3 columns) */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(timeframes).map(([key, timeframe]) => (
                    <div key={key} className="rounded-lg border-2 border-border bg-card p-4">
                      <div className="text-center mb-4">
                        <h2 className="font-semibold text-card-foreground">{timeframe.title}</h2>
                        <p className="text-sm text-muted-foreground">{timeframe.subtitle}</p>
                      </div>

                      <div className="space-y-4">
                        {strategyCards
                          .filter(card => card.timeframe === key)
                          .map(card => renderStrategyCard(card))}

                        <Button
                          variant="outline"
                          className="w-full border-2 border-dashed border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground bg-card"
                          onClick={() => addNewCard(key as 'short' | 'medium' | 'long')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Yeni Hedef Ekle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Action Panel */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Akıllı Aksiyon Paneli
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderActionPanel()}
                  </CardContent>
                </Card>
              </div>
            </div>
    </div>
  );
}