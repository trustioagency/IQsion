import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AIChatPanel from "@/components/ai-chat-panel";
import { 
  MousePointer2, 
  Eye, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  CheckCircle,
  XCircle,
  Brain,
  Lightbulb
} from "lucide-react";

export default function TouchpointAnalysis() {
  const [activeTab, setActiveTab] = useState("heuristics");
  const [urlToAnalyze, setUrlToAnalyze] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const heuristicChecks = [
    {
      category: "Sayfa Yüklenme",
      checks: [
        { name: "Sayfa yüklenme hızı", status: "passed", score: 85, description: "Sayfa 2.3 saniyede yükleniyor" },
        { name: "Mobil uyumluluk", status: "warning", score: 72, description: "Bazı öğeler mobilde kesiliyor" },
        { name: "CLS (Layout Shift)", status: "passed", score: 91, description: "Düşük layout shift değeri" }
      ]
    },
    {
      category: "Kullanıcı Deneyimi",
      checks: [
        { name: "CTA görünürlüğü", status: "failed", score: 45, description: "Ana CTA fold altında kalıyor" },
        { name: "Form kullanılabilirliği", status: "passed", score: 88, description: "Form alanları net ve erişilebilir" },
        { name: "Navigasyon netliği", status: "warning", score: 65, description: "Menü yapısı karmaşık" }
      ]
    },
    {
      category: "Güvenilirlik",
      checks: [
        { name: "SSL sertifikası", status: "passed", score: 100, description: "Geçerli SSL sertifikası mevcut" },
        { name: "Sosyal kanıt", status: "warning", score: 60, description: "Müşteri yorumları görünmüyor" },
        { name: "İletişim bilgileri", status: "passed", score: 85, description: "İletişim bilgileri açık ve net" }
      ]
    }
  ];

  const croRecommendations = [
    {
      priority: 'high',
      title: 'Ana CTA Konumunu Optimize Et',
      description: 'Ana call-to-action butonu fold üstüne taşınmalı. Mevcut konumda %40 daha az görülüyor.',
      impact: '+%25 dönüşüm artışı bekleniyor',
      effort: 'Düşük',
      timeline: '1-2 gün'
    },
    {
      priority: 'high',
      title: 'Mobil Deneyimi İyileştir',
      description: 'Mobil trafiğin %68\'i var ancak mobil dönüşüm oranı %40 daha düşük.',
      impact: '+%30 mobil dönüşüm',
      effort: 'Orta',
      timeline: '1 hafta'
    },
    {
      priority: 'medium',
      title: 'Sosyal Kanıt Ekle',
      description: 'Müşteri yorumları ve değerlendirmeleri sayfada görünmüyor.',
      impact: '+%15 güven artışı',
      effort: 'Düşük',
      timeline: '2-3 gün'
    },
    {
      priority: 'medium',
      title: 'Sayfa Hızını Artır',
      description: 'Görselleri optimize ederek yüklenme süresini 1.5 saniyeye düşürün.',
      impact: '+%10 bounce rate iyileştirmesi',
      effort: 'Orta',
      timeline: '3-5 gün'
    }
  ];

  const behavioralData = {
    heatmapInsights: [
      "Kullanıcıların %78'i sayfanın üst %50'sinde kalıyor",
      "Yan menü elemanları hiç tıklanmıyor",
      "Form alanlarında %35 abandon rate var"
    ],
    userFlowIssues: [
      "Checkout'ta %45 abandonment",
      "Ürün sayfasından %30 bounce",
      "Arama sonuçlarında %60 no-click"
    ]
  };

  const handleAnalyzeUrl = async () => {
    if (!urlToAnalyze) return;

    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex h-full">
      {/* Left Column - Main Content (70%) */}
      <div className="flex-1 w-[70%] p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                      <MousePointer2 className="w-6 h-6 text-blue-400" />
                      CRO Sihirbazı
                    </h1>
                    <p className="text-slate-400">Dönüşüm oranlarınızı artırmak için sayfa analizi ve optimizasyon önerileri</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Analiz edilecek URL"
                      value={urlToAnalyze}
                      onChange={(e) => setUrlToAnalyze(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-slate-300 flex-1 max-w-md"
                    />
                    <Button 
                      onClick={handleAnalyzeUrl}
                      disabled={!urlToAnalyze || isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isAnalyzing ? "Analiz Ediliyor..." : "Analiz Et"}
                    </Button>
                  </div>
                </div>

                {/* Analysis Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="bg-slate-800 border-slate-700 w-full justify-start">
                    <TabsTrigger value="heuristics" className="data-[state=active]:bg-slate-700 px-6 py-3">
                      Heuristik Analiz
                    </TabsTrigger>
                    <TabsTrigger value="recommendations" className="data-[state=active]:bg-slate-700 px-6 py-3">
                      CRO Önerileri
                    </TabsTrigger>
                    <TabsTrigger value="behavioral" className="data-[state=active]:bg-slate-700 px-6 py-3">
                      Davranışsal Analiz
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="heuristics" className="space-y-6 mt-6">
                    {/* Heuristic Checks */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      {heuristicChecks.map((category, categoryIndex) => (
                        <Card key={categoryIndex} className="bg-slate-800 border-slate-700">
                          <CardHeader>
                            <CardTitle className="text-white text-lg">{category.category}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {category.checks.map((check, checkIndex) => (
                                <div key={checkIndex} className="bg-slate-700 p-4 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(check.status)}
                                      <span className="text-white font-medium text-sm">{check.name}</span>
                                    </div>
                                    <span className={`font-bold ${getScoreColor(check.score)}`}>
                                      {check.score}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-sm">{check.description}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-6 mt-6">
                    {/* CRO Recommendations */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {croRecommendations.map((rec, index) => (
                        <Card key={index} className="bg-slate-800 border-slate-700">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                rec.priority === 'high' ? 'bg-red-400' : 'bg-yellow-400'
                              }`}></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-white font-semibold">{rec.title}</h3>
                                  <Badge variant="outline" className={`${
                                    rec.priority === 'high' ? 'border-red-500 text-red-400' : 'border-yellow-500 text-yellow-400'
                                  }`}>
                                    {rec.priority === 'high' ? 'Yüksek' : 'Orta'} Öncelik
                                  </Badge>
                                </div>
                                <p className="text-slate-400 text-sm mb-4">{rec.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="text-slate-500">Etki:</span>
                                    <span className="text-green-400 ml-2">{rec.impact}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">Efor:</span>
                                    <span className="text-slate-300 ml-2">{rec.effort}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-slate-500">Süre:</span>
                                    <span className="text-slate-300 ml-2">{rec.timeline}</span>
                                  </div>
                                </div>
                                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-sm">
                                  Uygula
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="behavioral" className="space-y-6 mt-6">
                    {/* Behavioral Analysis */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Eye className="w-5 h-5 text-blue-400" />
                            Heatmap İçgörüleri
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {behavioralData.heatmapInsights.map((insight, index) => (
                              <div key={index} className="bg-slate-700 p-3 rounded-lg">
                                <p className="text-slate-300 text-sm">{insight}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Kullanıcı Akışı Sorunları
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {behavioralData.userFlowIssues.map((issue, index) => (
                              <div key={index} className="bg-slate-700 p-3 rounded-lg">
                                <p className="text-slate-300 text-sm">{issue}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

        {/* Right Column - AI Chat Panel (30%) */}
        <div className="w-[30%] border-l border-slate-700 p-4 overflow-y-auto">
          <AIChatPanel 
            pageContext="CRO Sihirbazı"
            insights={[
              {
                id: '1',
                type: 'warning',
                title: 'Ana CTA Görünürlüğü Düşük',
                description: 'Ana call-to-action butonu fold altında kalıyor. Yukarı taşınması öneriliyor.',
                action: 'Öneriyi uygula',
                icon: Target
              },
              {
                id: '2',
                type: 'opportunity',
                title: 'Mobil Optimizasyon Fırsatı',
                description: 'Mobil dönüşüm oranı %40 daha düşük. İyileştirme potansiyeli yüksek.',
                action: 'Mobil önerileri görüntüle',
                icon: TrendingUp
              }
            ]}
            suggestions={[
              'CTA pozisyonunu nasıl optimize edebilirim?',
              'Mobil dönüşüm oranını artırmanın yolları',
              'Sayfa yüklenme hızını nasıl artırabilirim?',
              'Kullanıcı deneyimi skorumu nasıl yükseltebilirim?'
            ]}
          />
        </div>
      </div>
  );
}