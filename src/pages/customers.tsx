
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  User, Search, Plus, Target, Brain, Zap, 
  Users, Calendar, MapPin, Heart, Eye, 
  TrendingUp, Smartphone, Monitor, Globe,
  RefreshCw, AlertCircle, CheckCircle,
  PieChart, BarChart3, LineChart,
  DollarSign, ShoppingCart, Clock,
  Filter, Download, Settings
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type ShopifyCustomer = {
  id: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  orders_count?: number;
  total_spent?: string;
  created_at?: string;
  state?: string;
  default_address?: { city?: string; country?: string } | null;
};

export default function CustomersPage() {
  const { user } = useAuth();
  const uid = (user as any)?.uid || (user as any)?.id;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Dashboard Metrics
  const dashboardMetrics = {
    totalCustomers: 12450,
    avgLTV: 5250,
    avgCAC: 185,
    customerGrowth: 12.5
  };

  // Saved Segments
  const savedSegments = [
    {
      id: 1,
      name: 'Yüksek LTV\'li Müşteriler (VIP)',
      customerCount: 420,
      avgLTV: 12500,
      rules: 'LTV > 10000 TL VE Son alışveriş < 30 gün',
      lastUpdate: '2 saat önce',
      status: 'active'
    },
    {
      id: 2,
      name: 'Riskli Müşteriler',
      customerCount: 180,
      avgLTV: 3200,
      rules: 'Son alışveriş > 90 gün VE LTV > 2000 TL',
      lastUpdate: '1 saat önce',
      status: 'active'
    },
    {
      id: 3,
      name: 'Sadık Müşteriler',
      customerCount: 890,
      avgLTV: 8750,
      rules: 'Sipariş sayısı >= 5 VE Tekrar satın alma oranı > 60%',
      lastUpdate: '30 dakika önce',
      status: 'active'
    }
  ];

  // Personas
  const personas = [
    {
      id: 1,
      name: 'Girişimci Gökhan',
      description: '28-35 yaş arası teknoloji girişimcisi',
      targetSize: '~15,000',
      matchedCustomers: 342,
      accuracy: 85,
      demographics: {
        age: '28-35',
        gender: 'Erkek',
        location: 'İstanbul, Ankara',
        income: '₺15,000+'
      },
      interests: ['Teknoloji', 'Girişimcilik', 'SaaS'],
      channels: ['LinkedIn Ads', 'Google Search']
    },
    {
      id: 2,
      name: 'Üniversiteli Zeynep',
      description: '19-24 yaş arası üniversite öğrencisi',
      targetSize: '~45,000',
      matchedCustomers: 856,
      accuracy: 92,
      demographics: {
        age: '19-24',
        gender: 'Kadın',
        location: 'İstanbul, İzmir, Ankara',
        income: '₺3,000-8,000'
      },
      interests: ['Moda', 'Sosyal Medya', 'Müzik'],
      channels: ['Instagram Ads', 'TikTok Ads']
    }
  ];

  // Action Recommendations
  const actionRecommendations = [
    {
      id: 1,
      type: 'campaign',
      title: 'VIP Müşteriler İçin Özel Kampanya',
      description: 'Yüksek LTV\'li müşterilerinize özel indirim kampanyası düzenleyin',
      segment: 'Yüksek LTV\'li Müşteriler (VIP)',
      estimatedImpact: '+₺25,000 gelir',
      effort: 'Orta',
      priority: 'Yüksek',
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      id: 2,
      type: 'retention',
      title: 'Riskli Müşteri Geri Kazanım',
      description: 'Son 90 günde alışveriş yapmayan müşterilere e-posta serisi gönder',
      segment: 'Riskli Müşteriler',
      estimatedImpact: '+180 müşteri geri kazanım',
      effort: 'Düşük',
      priority: 'Yüksek',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20'
    },
    {
      id: 3,
      type: 'lookalike',
      title: 'Girişimci Gökhan Lookalike Kitle',
      description: 'En başarılı persona\'nıza benzer yeni kitleler oluşturun',
      segment: 'Girişimci Gökhan Personası',
      estimatedImpact: '+15,000 kişilik yeni kitle',
      effort: 'Düşük',
      priority: 'Orta',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 4,
      type: 'crosssell',
      title: 'Sadık Müşteri Cross-Sell',
      description: 'Sadık müşterilerinize komplementer ürün önerileri sunun',
      segment: 'Sadık Müşteriler',
      estimatedImpact: '+₺18,500 cross-sell geliri',
      effort: 'Orta',
      priority: 'Orta',
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 5,
      type: 'automation',
      title: 'Otomatik Segment Güncelleme',
      description: 'Müşteri davranışlarına göre segmentleri otomatik güncelleyin',
      segment: 'Tüm Segmentler',
      estimatedImpact: '+%25 segmentasyon doğruluğu',
      effort: 'Yüksek',
      priority: 'Düşük',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      id: 6,
      type: 'insights',
      title: 'Müşteri Davranış Analizi',
      description: 'AI ile müşteri davranış kalıplarını analiz edin',
      segment: 'Tüm Müşteriler',
      estimatedImpact: 'Yeni içgörüler keşfet',
      effort: 'Düşük',
      priority: 'Orta',
      icon: <Brain className="w-5 h-5" />,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20'
    }
  ];

  const CreateSegmentModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-6">Akıllı Segment Oluşturucu</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Segment Adı</label>
            <Input 
              placeholder="Örn: Yüksek Değerli Müşteriler"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Koşullar</label>
            <div className="bg-slate-700 rounded-lg p-4 space-y-4">
              <div className="text-center text-slate-300 font-medium">
                Tüm Müşteriler Arasından ŞU Koşulları Sağlayanları Getir:
              </div>
              
              <div className="grid grid-cols-3 gap-3 items-center">
                <Select>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue placeholder="LTV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltv">LTV</SelectItem>
                    <SelectItem value="last-order">Son Alışveriş Tarihi</SelectItem>
                    <SelectItem value="order-count">Sipariş Sayısı</SelectItem>
                    <SelectItem value="channel">Geldiği Kanal</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue placeholder="büyüktür" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">büyüktür</SelectItem>
                    <SelectItem value="lt">küçüktür</SelectItem>
                    <SelectItem value="eq">eşittir</SelectItem>
                    <SelectItem value="between">arasında</SelectItem>
                  </SelectContent>
                </Select>

                <Input 
                  placeholder="5000"
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>

              <div className="text-center">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">VE</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 items-center">
                <Select>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue placeholder="Son Alışveriş Tarihi" />
                  </SelectTrigger>
                </Select>

                <Select>
                  <SelectTrigger className="bg-slate-600 border-slate-500">
                    <SelectValue placeholder="30 günden daha önceydi" />
                  </SelectTrigger>
                </Select>

                <Input 
                  placeholder="30"
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>

              <Button variant="outline" className="w-full bg-slate-600 border-slate-500 text-slate-300">
                <Plus className="w-4 h-4 mr-2" />
                Koşul Ekle
              </Button>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-400 font-medium mb-2">SONUÇLAR (Anlık Güncellenir):</h4>
            <div className="space-y-2 text-slate-300">
              <div>Bu koşullara uyan <span className="text-white font-bold">42 Müşteri</span> bulundu.</div>
              <div>Bu segmentin Ortalama LTV'si: <span className="text-green-400 font-bold">₺7,250</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              Segmenti Kaydet
            </Button>
            <Button variant="outline" className="flex-1 bg-slate-700 border-slate-600">
              Bu Segmentten Remarketing Kitlesi Oluştur
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-slate-400"
            onClick={() => setShowCreateModal(false)}
          >
            İptal
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Akıllı Kitle Merkezi</h1>
                <p className="text-slate-400">Gösterge paneli, segmentler, personalar ve AI keşifleri</p>
              </div>
              
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Segment Oluştur
              </Button>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Gösterge Paneli
                </TabsTrigger>
                <TabsTrigger value="segments" className="data-[state=active]:bg-slate-700">
                  <Users className="w-4 h-4 mr-2" />
                  Segmentler
                </TabsTrigger>
                <TabsTrigger value="personas" className="data-[state=active]:bg-slate-700">
                  <User className="w-4 h-4 mr-2" />
                  Personalar
                </TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:bg-slate-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Aksiyon Önerileri
                </TabsTrigger>
                <TabsTrigger value="discover" className="data-[state=active]:bg-slate-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Keşfet
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Toplam Müşteri Sayısı</p>
                          <p className="text-2xl font-bold text-white">{dashboardMetrics.totalCustomers.toLocaleString()}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Ortalama Müşteri LTV</p>
                          <p className="text-2xl font-bold text-white">₺{dashboardMetrics.avgLTV.toLocaleString()}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Müşteri Edinme Maliyeti</p>
                          <p className="text-2xl font-bold text-white">₺{dashboardMetrics.avgCAC}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Müşteri Artışı</p>
                          <p className="text-2xl font-bold text-green-400">+{dashboardMetrics.customerGrowth}%</p>
                        </div>
                        <LineChart className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">LTV'ye Göre Müşteri Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <PieChart className="w-32 h-32 text-slate-600" />
                        <div className="text-center text-slate-400 ml-4">
                          <p>Pasta Grafiği</p>
                          <p className="text-sm">Veri yüklenecek</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Müşterilerin Geldiği Kanallar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <BarChart3 className="w-32 h-32 text-slate-600" />
                        <div className="text-center text-slate-400 ml-4">
                          <p>Çubuk Grafik</p>
                          <p className="text-sm">Veri yüklenecek</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Segments Tab */}
              <TabsContent value="segments" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Segment ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-slate-300 pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="bg-slate-800 border-slate-600">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrele
                    </Button>
                    <Button variant="outline" className="bg-slate-800 border-slate-600">
                      <Download className="w-4 h-4 mr-2" />
                      Dışa Aktar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {savedSegments.map((segment) => (
                    <Card key={segment.id} className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-white font-medium text-lg">{segment.name}</h4>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            Aktif
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Müşteri Sayısı:</span>
                            <span className="text-white font-medium">{segment.customerCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ortalama LTV:</span>
                            <span className="text-green-400 font-medium">₺{segment.avgLTV.toLocaleString()}</span>
                          </div>
                          <div className="text-sm text-slate-400">
                            <span className="font-medium">Kurallar:</span> {segment.rules}
                          </div>
                          <div className="text-xs text-slate-500">
                            Son güncelleme: {segment.lastUpdate}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-slate-700 border-slate-600">
                            Detaylar
                          </Button>
                          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Kampanyada Kullan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Personas Tab */}
              <TabsContent value="personas" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {personas.map((persona) => (
                    <Card key={persona.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-white font-medium text-lg">{persona.name}</h4>
                            <p className="text-slate-400 text-sm">{persona.description}</p>
                          </div>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                            {persona.accuracy}% İsabet
                          </Badge>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Hedef Büyüklük:</span>
                            <span className="text-white">{persona.targetSize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Eşleşen Müşteri:</span>
                            <span className="text-green-400 font-medium">{persona.matchedCustomers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Yaş:</span>
                            <span className="text-white">{persona.demographics.age}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-slate-300 font-medium mb-2">İlgi Alanları</h5>
                          <div className="flex flex-wrap gap-1">
                            {persona.interests.map((interest, i) => (
                              <Badge key={i} variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-slate-700 border-slate-600">
                            Düzenle
                          </Button>
                          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Segment İle Eşleştir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Action Recommendations Tab */}
              <TabsContent value="actions" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Aksiyon Önerileri</h3>
                    <p className="text-slate-400">Segmentleriniz ve personalarınız temelinde önerilen pazarlama aksiyonları</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="bg-slate-800 border-slate-600">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrele
                    </Button>
                  </div>
                </div>

                {/* Priority Actions */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                    Yüksek Öncelikli Aksiyonlar
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {actionRecommendations
                      .filter(action => action.priority === 'Yüksek')
                      .map((action) => (
                        <Card key={action.id} className={`${action.bgColor} border ${action.bgColor.replace('bg-', 'border-').replace('/10', '/20')} hover:bg-opacity-20 cursor-pointer`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-lg bg-slate-800/50 mr-3`}>
                                  <div className={action.color}>
                                    {action.icon}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-white font-semibold">{action.title}</h5>
                                  <p className="text-slate-400 text-sm">{action.description}</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-red-500/20 text-red-300 text-xs">
                                {action.priority}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Hedef Segment:</span>
                                <span className="text-white font-medium">{action.segment}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Tahmini Etki:</span>
                                <span className={action.color}>{action.estimatedImpact}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Çaba Seviyesi:</span>
                                <span className="text-white">{action.effort}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                Aksiyonu Başlat
                              </Button>
                              <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600">
                                Detaylar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                </div>

                {/* Other Actions */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    Diğer Öneriler
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {actionRecommendations
                      .filter(action => action.priority !== 'Yüksek')
                      .map((action) => (
                        <Card key={action.id} className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 cursor-pointer">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-lg bg-slate-700 mr-3`}>
                                  <div className={action.color}>
                                    {action.icon}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-white font-medium text-sm">{action.title}</h5>
                                </div>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  action.priority === 'Orta' 
                                    ? 'bg-yellow-500/20 text-yellow-300' 
                                    : 'bg-slate-500/20 text-slate-300'
                                }`}
                              >
                                {action.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-slate-400 text-xs mb-3">{action.description}</p>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Etki:</span>
                                <span className={action.color}>{action.estimatedImpact}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Çaba:</span>
                                <span className="text-white">{action.effort}</span>
                              </div>
                            </div>

                            <Button size="sm" className="w-full bg-slate-700 hover:bg-slate-600 text-xs">
                              Başlat
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                </div>

                {/* Quick Stats */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <h4 className="text-white font-semibold mb-4">Aksiyon İstatistikleri</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">2</div>
                        <div className="text-slate-400 text-sm">Yüksek Öncelik</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">3</div>
                        <div className="text-slate-400 text-sm">Orta Öncelik</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">₺43,500</div>
                        <div className="text-slate-400 text-sm">Tahmini Etki</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">6</div>
                        <div className="text-slate-400 text-sm">Toplam Öneri</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discover Tab */}
              <TabsContent value="discover" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Akıllı Kitle Keşfi</h3>
                    <p className="text-slate-400 mb-6">
                      Veri kaynaklarınızı bağlayın ve AI'nın sizin için yeni hedef kitle önerileri bulmasını izleyin
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <ShoppingCart className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <h4 className="text-white font-medium mb-1">E-ticaret Verileri</h4>
                          <p className="text-slate-400 text-sm">Shopify, WooCommerce</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <Globe className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <h4 className="text-white font-medium mb-1">Web Analytics</h4>
                          <p className="text-slate-400 text-sm">Google Analytics</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4 text-center">
                          <Eye className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <h4 className="text-white font-medium mb-1">Reklam Platformları</h4>
                          <p className="text-slate-400 text-sm">Meta, Google, TikTok</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Veri Kaynaklarını Yapılandır
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Shopify Müşteri Listesi */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-white">Shopify Müşterileri</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Müşteri ara..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-slate-200 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CustomersTable uid={uid} searchTerm={customerSearch} />
              </CardContent>
            </Card>

      {showCreateModal && <CreateSegmentModal />}
    </div>
  );
}

function CustomersTable({ uid, searchTerm }: { uid?: string; searchTerm: string }) {
  const { data, isLoading, error } = useQuery<{ customers: ShopifyCustomer[] } | any>({
    queryKey: ['shopify-customers', uid],
    enabled: !!uid,
    queryFn: async () => {
      const res = await fetch(`/api/shopify/customers?userId=${encodeURIComponent(uid!)}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    }
  });

  const customers: ShopifyCustomer[] = (data?.customers || []) as ShopifyCustomer[];
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = customers.map(c => ({
      ...c,
      _name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
    }));
    const out = list.filter(c => {
      if (!term) return true;
      return (
        c._name.toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.phone || '').toLowerCase().includes(term)
      );
    });
    // Sort by created_at desc
    out.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    return out;
  }, [customers, searchTerm]);

  if (!uid) {
    return <div className="text-slate-400 text-sm">Giriş yapın veya test modunu kullanın.</div>;
  }
  if (isLoading) {
    return <div className="text-slate-400 text-sm">Müşteriler yükleniyor...</div>;
  }
  if (error) {
    return <div className="text-red-400 text-sm">Müşteriler alınamadı.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-300">Müşteri</th>
            <th className="text-left py-3 px-4 text-slate-300">E-posta</th>
            <th className="text-left py-3 px-4 text-slate-300">Telefon</th>
            <th className="text-left py-3 px-4 text-slate-300">Konum</th>
            <th className="text-right py-3 px-4 text-slate-300">Sipariş</th>
            <th className="text-right py-3 px-4 text-slate-300">Toplam Harcama</th>
            <th className="text-left py-3 px-4 text-slate-300">Kayıt</th>
            <th className="text-left py-3 px-4 text-slate-300">Durum</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => {
            const name = `${c.first_name || ''} ${c.last_name || ''}`.trim() || (c.email || '—');
            const loc = c.default_address ? [c.default_address.city, c.default_address.country].filter(Boolean).join(', ') : '—';
            const spent = Number.parseFloat(String(c.total_spent || '0')) || 0;
            const created = c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '';
            const orders = Number(c.orders_count || 0);
            return (
              <tr key={String(c.id)} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-600 text-slate-300 flex items-center justify-center text-xs">
                      {name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div className="text-white font-medium">{name}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300">{c.email || '—'}</td>
                <td className="py-3 px-4 text-slate-300">{c.phone || '—'}</td>
                <td className="py-3 px-4 text-slate-300">{loc || '—'}</td>
                <td className="py-3 px-4 text-right text-white">{orders}</td>
                <td className="py-3 px-4 text-right text-white">₺{spent.toLocaleString('tr-TR')}</td>
                <td className="py-3 px-4 text-slate-300">{created}</td>
                <td className="py-3 px-4">
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">{c.state || '—'}</Badge>
                </td>
              </tr>
            );
          })}
          {!filtered.length && (
            <tr>
              <td colSpan={8} className="py-6 px-4 text-slate-400 text-sm">Müşteri bulunamadı.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
