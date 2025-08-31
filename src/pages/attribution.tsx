import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';

import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, Target, Users, 
  ShoppingCart, DollarSign, Calendar, Filter, ArrowUpDown,
  Eye, Share2, MousePointer, Smartphone, Monitor, Tablet,
  Facebook, Instagram, Search, Mail, MessageCircle, Brain,
  Sparkles, Lightbulb, AlertTriangle, Zap, Send, ChevronDown,
  ArrowRight
} from "lucide-react";
import AIChatPanel from "../components/ai-chat-panel";
import { useQuery } from '@tanstack/react-query';

export default function Attribution() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedModel, setSelectedModel] = useState('lastClick');
  const [results, setResults] = useState<any>(null);

  // API call to get attribution models
  const { data: models } = useQuery({
    queryKey: ['attribution-models'],
    queryFn: async () => {
      const response = await fetch('/api/attribution/models');
      return response.json();
    }
  });

  // API call to calculate attribution
  const calculateAttribution = async () => {
    try {
      const response = await fetch('/api/attribution/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          dateRange: '30d'
        })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Attribution calculation failed:', error);
    }
  };

  useEffect(() => {
    if (selectedModel) {
      calculateAttribution();
    }
  }, [selectedModel]);

  // Revenue distribution data for different models
  const revenueDistribution = {
    lastClick: {
      'Google Ads': 60,
      'Meta Ads': 15,
      'Instagram': 10,
      'TikTok Ads': 8,
      'Email': 4,
      'Direkt': 3
    },
    firstClick: {
      'Google Ads': 25,
      'Meta Ads': 20,
      'Instagram': 30,
      'TikTok Ads': 15,
      'Email': 5,
      'Direkt': 5
    },
    linear: {
      'Google Ads': 40,
      'Meta Ads': 22,
      'Instagram': 18,
      'TikTok Ads': 12,
      'Email': 5,
      'Direkt': 3
    },
    smart: {
      'Google Ads': 40,
      'Meta Ads': 20,
      'Instagram': 35,
      'TikTok Ads': 3,
      'Email': 1,
      'Direkt': 1
    }
  };

  const customerJourneys = [
    {
      percentage: 42,
      path: [
        { channel: 'Instagram', icon: <Eye className="w-5 h-5" />, action: 'Reklam Gösterimi', color: 'from-pink-500 to-rose-500' },
        { channel: 'Website', icon: <MousePointer className="w-5 h-5" />, action: 'Ürün Sayfası', color: 'from-blue-500 to-cyan-500' },
        { channel: 'Google', icon: <Search className="w-5 h-5" />, action: 'Marka Araması', color: 'from-green-500 to-emerald-500' },
        { channel: 'Satın Alma', icon: <ShoppingCart className="w-5 h-5" />, action: 'Dönüşüm', color: 'from-purple-500 to-violet-500' }
      ]
    },
    {
      percentage: 28,
      path: [
        { channel: 'TikTok', icon: <Eye className="w-5 h-5" />, action: 'Video İzleme', color: 'from-gray-800 to-gray-900' },
        { channel: 'Website', icon: <MousePointer className="w-5 h-5" />, action: 'Anasayfa', color: 'from-blue-500 to-cyan-500' },
        { channel: 'Email', icon: <Users className="w-5 h-5" />, action: 'Kampanya', color: 'from-orange-500 to-red-500' },
        { channel: 'Satın Alma', icon: <ShoppingCart className="w-5 h-5" />, action: 'Dönüşüm', color: 'from-purple-500 to-violet-500' }
      ]
    },
    {
      percentage: 30,
      path: [
        { channel: 'Google Ads', icon: <Search className="w-5 h-5" />, action: 'Arama Reklamı', color: 'from-blue-600 to-blue-700' },
        { channel: 'Website', icon: <MousePointer className="w-5 h-5" />, action: 'Kategori Sayfası', color: 'from-blue-500 to-cyan-500' },
        { channel: 'Satın Alma', icon: <ShoppingCart className="w-5 h-5" />, action: 'Direkt Dönüşüm', color: 'from-purple-500 to-violet-500' }
      ]
    }
  ];

  const insights = [
    {
      id: 1,
      icon: <Target className="w-5 h-5 text-blue-400" />,
      title: "Hedef Kitle Analizi",
      content: "Instagram'dan gelen müşterilerinizin %68'i 25-34 yaş aralığında. Bu segment için özel kampanyalar oluşturabilirsiniz.",
      type: "info"
    },
    {
      id: 2,
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      title: "Büyüme Fırsatı",
      content: "Email Marketing kanalınızın dönüşüm oranı %12 ile sektör ortalamasının 3 katı. Bu başarıyı diğer kanallarda da uygulayabilirsiniz.",
      type: "success"
    },
    {
      id: 3,
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      title: "Dikkat Edilmesi Gereken",
      content: "Google Ads'teki tıklama maliyetleriniz son 2 haftada %15 arttı. Anahtar kelime stratejinizi gözden geçirmenizi öneriyorum.",
      type: "warning"
    },
    {
      id: 4,
      icon: <Lightbulb className="w-5 h-5 text-purple-400" />,
      title: "Strateji Önerisi",
      content: "TikTok'tan gelen genç kullanıcıları Instagram'da retargeting ile yakalayarak dönüşüm oranınızı %25 artırabilirsiniz.",
      type: "tip"
    },
    {
      id: 5,
      icon: <TrendingDown className="w-5 h-5 text-red-400" />,
      title: "Performans Uyarısı",
      content: "Meta Ads kampanyalarınızın CTR'ı düşüş eğiliminde. Kreatif materyallerinizi yenilemenin zamanı gelmiş olabilir.",
      type: "alert"
    }
  ];

  const currentData = revenueDistribution[selectedModel as keyof typeof revenueDistribution];

  const getChannelColor = (channel: string) => {
    const colors: { [key: string]: string } = {
      'Google Ads': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'Meta Ads': 'bg-gradient-to-r from-blue-600 to-blue-700',
      'Instagram': 'bg-gradient-to-r from-pink-500 to-rose-500',
      'TikTok Ads': 'bg-gradient-to-r from-gray-800 to-black',
      'Email': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'Direkt': 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    return colors[channel] || 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const modelOptions = [
    { value: 'lastClick', label: 'Son Tıklama', desc: 'Satışı tamamlayan son adım' },
    { value: 'firstClick', label: 'İlk Tıklama', desc: 'İlk tanışma adımı' },
    { value: 'linear', label: 'Lineer Model', desc: 'Eşit dağılım' },
    { value: 'smart', label: 'Akıllı Model', desc: 'AI tabanlı analiz', premium: true }
  ];

  return (
        <main className="h-full overflow-y-auto bg-slate-800/50 p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">

            {/* Header with Filters */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Atıflandırma Komuta Merkezi</h1>
                <p className="text-slate-400">Merve'yi adım adım yönlendiren akıllı analiz platformu</p>
              </div>

              {/* Filter Controls */}
              <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-300">Bakış Açısı:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {modelOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={selectedModel === option.value ? 'default' : 'outline'}
                          size="sm"
                          className={`h-auto px-4 py-2 flex flex-col gap-1 min-w-[120px] relative transition-all duration-200 ${
                            selectedModel === option.value 
                              ? option.premium 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0' 
                                : 'bg-blue-600 hover:bg-blue-700 border-0'
                              : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-slate-300'
                          }`}
                          onClick={() => setSelectedModel(option.value)}
                        >
                          <div className="flex items-center gap-1">
                            {option.premium && <Sparkles className="w-3 h-3" />}
                            <span className="font-medium text-xs">{option.label}</span>
                          </div>
                          <span className="text-xs opacity-80 text-center">{option.desc}</span>
                          {option.premium && (
                            <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 py-0">
                              AI
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-300 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="7d">Son 7 gün</SelectItem>
                          <SelectItem value="30d">Son 30 gün</SelectItem>
                          <SelectItem value="90d">Son 90 gün</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Distribution */}
            <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Hazine Dağılımı
                </CardTitle>
                <p className="text-slate-400 text-sm">Toplam cironun kanallar arasındaki dağılımı</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(currentData).map(([channel, percentage]) => (
                    <div key={channel} className="bg-slate-700/30 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{channel}</span>
                        <span className="text-white font-bold text-lg">%{percentage}</span>
                      </div>
                      <div className="w-full bg-slate-600/50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${getChannelColor(channel)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Journeys - Redesigned */}
            <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Altın Patikalar
                </CardTitle>
                <p className="text-slate-400 text-sm">En yaygın müşteri yolculukları</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {customerJourneys.map((journey, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-slate-300 font-medium">Yolculuk {index + 1}</span>
                        </div>
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30">
                          %{journey.percentage} Dönüşüm
                        </Badge>
                      </div>

                      <div className="relative">
                        {/* Connection line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 -translate-y-1/2 z-0" />

                        <div className="relative z-10 flex items-center justify-between">
                          {journey.path.map((step, stepIndex) => (
                            <div key={stepIndex} className="flex flex-col items-center group">
                              <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-3 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                                {step.icon}
                              </div>
                              <div className="text-center space-y-1">
                                <span className="text-sm font-medium text-white">{step.channel}</span>
                                <span className="text-xs text-slate-400">{step.action}</span>
                              </div>

                              {stepIndex < journey.path.length - 1 && (
                                <div className="absolute top-8 left-full w-full flex items-center justify-center pointer-events-none">
                                  <ArrowRight className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights with Chat */}
            <AIChatPanel 
              pageContext="Atıflandırma Analizi"
              insights={insights}
              suggestions={[
                'En etkili kanal hangisi?',
                'Instagram vs Google performans karşılaştırması',
                'Müşteri yolculuğunu analiz et',
                'Bütçe dağılımı öner'
              ]}
            />

          </div>
        </main>
  );
}