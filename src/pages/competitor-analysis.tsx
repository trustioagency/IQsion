
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Users, 
  Search, 
  TrendingUp, 
  Globe, 
  Lightbulb,
  X,
  BarChart3,
  Activity,
  Zap,
  Eye,
  Share2,
  MessageCircle
} from "lucide-react";

interface Competitor {
  id: string;
  name: string;
}

export default function CompetitorAnalysis() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [showRadar, setShowRadar] = useState(false);
  const [activeTab, setActiveTab] = useState('flow');

  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      const competitor: Competitor = {
        id: Date.now().toString(),
        name: newCompetitor.trim()
      };
      setCompetitors([...competitors, competitor]);
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  const discoverCompetitors = () => {
    // Sahte rakipler ekle
    const mockCompetitors = [
      'Amazon Turkey', 'Trendyol', 'Hepsiburada', 'N11', 'GittiGidiyor'
    ];
    const newCompetitors = mockCompetitors.map(name => ({
      id: Date.now() + Math.random().toString(),
      name
    }));
    setCompetitors([...competitors, ...newCompetitors.slice(0, 3)]);
  };

  const startAnalysis = () => {
    if (competitors.length > 0) {
      setShowRadar(true);
    }
  };

  if (showRadar) {
    return (
      <div className="space-y-6">
              
              {/* Başlık */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Pazar Radarı</h1>
                <p className="text-slate-400">
                  Rakiplerinizi ve pazar trendlerini analiz ederek stratejinizi bir adım öteye taşıyın.
                </p>
              </div>

              {/* Radar Paneli */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="w-5 h-5" />
                      Rakip Radar Paneli
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowRadar(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Kuruluma Dön
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-slate-700 border-slate-600">
                      <TabsTrigger value="flow" className="data-[state=active]:bg-blue-600">
                        Rakip Akışı
                      </TabsTrigger>
                      <TabsTrigger value="social" className="data-[state=active]:bg-blue-600">
                        Sosyal Medya
                      </TabsTrigger>
                      <TabsTrigger value="seo" className="data-[state=active]:bg-blue-600">
                        SEO & Web
                      </TabsTrigger>
                      <TabsTrigger value="opportunities" className="data-[state=active]:bg-blue-600">
                        Fırsat Motoru
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="flow" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {competitors.map((competitor) => (
                          <Card key={competitor.id} className="bg-slate-700 border-slate-600">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <Activity className="w-5 h-5 text-blue-400" />
                                <h3 className="font-semibold text-white">{competitor.name}</h3>
                              </div>
                              <div className="space-y-2 text-sm text-slate-300">
                                <div className="flex justify-between">
                                  <span>Günlük Ziyaret:</span>
                                  <span className="text-green-400">
                                    {Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Trend:</span>
                                  <span className="text-orange-400">↗ +{Math.floor(Math.random() * 20 + 5)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pazar Payı:</span>
                                  <span className="text-blue-400">{Math.floor(Math.random() * 15 + 5)}%</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="social" className="mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {competitors.slice(0, 4).map((competitor) => (
                          <Card key={competitor.id} className="bg-slate-700 border-slate-600">
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Share2 className="w-4 h-4" />
                                {competitor.name}
                              </h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-blue-400" />
                                    <span className="text-slate-300">Instagram:</span>
                                  </div>
                                  <div className="text-white">{Math.floor(Math.random() * 500000 + 50000).toLocaleString()} takipçi</div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-400" />
                                    <span className="text-slate-300">Etkileşim:</span>
                                  </div>
                                  <div className="text-white">{(Math.random() * 3 + 1).toFixed(1)}%</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="seo" className="mt-6">
                      <div className="space-y-4">
                        {competitors.map((competitor) => (
                          <Card key={competitor.id} className="bg-slate-700 border-slate-600">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  {competitor.name}
                                </h3>
                                <Badge variant="outline" className="border-green-500 text-green-400">
                                  DA: {Math.floor(Math.random() * 30 + 40)}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-slate-400">Organik Anahtar Kelime</div>
                                  <div className="text-white font-semibold">
                                    {Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">Backlink</div>
                                  <div className="text-white font-semibold">
                                    {Math.floor(Math.random() * 100000 + 20000).toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-slate-400">Sayfa Hızı</div>
                                  <div className="text-white font-semibold">{Math.floor(Math.random() * 30 + 60)}/100</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="opportunities" className="mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-slate-700 border-slate-600">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                              <Lightbulb className="w-5 h-5 text-yellow-400" />
                              Fırsat Alanları
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                  <div className="text-white font-medium">Mobil Optimizasyon</div>
                                  <div className="text-slate-400 text-sm">Rakiplerin %40'ı mobilde zayıf performans gösteriyor</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                  <div className="text-white font-medium">Video İçerik</div>
                                  <div className="text-slate-400 text-sm">Video pazarlamasında boşluk tespit edildi</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                <div>
                                  <div className="text-white font-medium">Yerel SEO</div>
                                  <div className="text-slate-400 text-sm">Yerel aramalar için optimizasyon eksikliği</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-slate-700 border-slate-600">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                              <Zap className="w-5 h-5 text-blue-400" />
                              Hızlı Aksiyonlar
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                                <Eye className="w-4 h-4 mr-2" />
                                Rakip İçerik Analizini Başlat
                              </Button>
                              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                                <Search className="w-4 h-4 mr-2" />
                                Anahtar Kelime Boşluklarını Keşfet
                              </Button>
                              <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Fiyat Karşılaştırması Yap
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Başlık */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Pazar Radarı</h1>
              <p className="text-slate-400">
                Rakiplerinizi ve pazar trendlerini analiz ederek stratejinizi bir adım öteye taşıyın.
              </p>
            </div>

            {/* Kurulum Bölümü */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 space-y-6">
                
                {/* AI ile Rakip Keşfet */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">AI ile Rakipleri Keşfet</h2>
                  <p className="text-slate-400 mb-4">
                    Sektörünüzü veya ürününüzü anlatın, AI potansiyel rakipleri bulsun.
                  </p>
                  <Textarea
                    placeholder="Örn: E-ticaret sektöründe elektronik ürünler satıyoruz, özellikle akıllı telefon ve aksesuar alanında faaliyet gösteriyoruz..."
                    value={analysisPrompt}
                    onChange={(e) => setAnalysisPrompt(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-slate-300 min-h-[100px] mb-4"
                  />
                  <Button 
                    onClick={discoverCompetitors}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Rakipleri Keşfet
                  </Button>
                </div>

                <hr className="border-slate-600" />

                {/* Manuel Rakip Ekleme */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Manuel Olarak Rakip Ekle</h2>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Rakip firma adını girin..."
                      value={newCompetitor}
                      onChange={(e) => setNewCompetitor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                      className="bg-slate-900 border-slate-600 text-slate-300 flex-1"
                    />
                    <Button 
                      onClick={addCompetitor}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Ekle
                    </Button>
                  </div>
                </div>

                {/* Takip Edilen Rakipler */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Takip Edilen Rakipler</h3>
                  <div className="flex flex-wrap gap-2 mb-6 min-h-[50px] p-3 bg-slate-900 border border-slate-600 rounded-md">
                    {competitors.length === 0 ? (
                      <div className="text-slate-500 italic">Henüz rakip eklenmedi...</div>
                    ) : (
                      competitors.map((competitor) => (
                        <Badge 
                          key={competitor.id}
                          variant="outline" 
                          className="border-slate-500 text-slate-300 bg-slate-800 flex items-center gap-2 px-3 py-1"
                        >
                          {competitor.name}
                          <button
                            onClick={() => removeCompetitor(competitor.id)}
                            className="hover:bg-slate-600 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Analizi Başlat */}
                <div className="text-center">
                  <Button 
                    onClick={startAnalysis}
                    disabled={competitors.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Analizi Başlat
                  </Button>
                  {competitors.length === 0 && (
                    <p className="text-slate-500 text-sm mt-2">
                      Analizi başlatmak için en az bir rakip ekleyin
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
    </div>
  );
}
