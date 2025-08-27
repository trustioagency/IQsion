import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  BarChart3,
  Target,
  Lightbulb
} from "lucide-react";
import { useEffect } from "react";

interface MarketAnalysisResult {
  summary: string;
  trends: string[];
  competitors: { name: string; analysis: string }[];
  opportunities: string[];
  risks: string[];
  targetAudience: string;
}

export default function MarketAnalysis() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [industry, setIndustry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [competitors, setCompetitors] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const isTestMode = window.location.search.includes('test=true');
      if (!isTestMode) {
        toast({
          title: "Giriş Gerekli",
          description: "Lütfen giriş yapın veya test modunu deneyin",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/?test=true";
        }, 1000);
      }
    }
  }, [user, authLoading, toast]);

  const analysisMutation = useMutation({
    mutationFn: async (data: { industry: string; websiteUrl?: string; competitors?: string }) => {
      const response = await apiRequest('POST', '/api/ai/market-analysis', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Market analysis completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/analysis'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to analyze market",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!industry.trim()) {
      toast({
        title: "Error",
        description: "Please enter an industry",
        variant: "destructive",
      });
      return;
    }

    analysisMutation.mutate({
      industry,
      websiteUrl: websiteUrl || undefined,
      competitors: competitors || undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const analysisData: MarketAnalysisResult | undefined = analysisMutation.data;

  return (
    <div className="space-y-6">
            
            {/* Analysis Form */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="w-5 h-5" />
                  Pazar Analizi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sektör *
                  </label>
                  <Input
                    placeholder="Örn: E-ticaret, SaaS, Fintech"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website URL (Opsiyonel)
                  </label>
                  <Input
                    placeholder="https://yourwebsite.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ana Rakipler (Opsiyonel)
                  </label>
                  <Textarea
                    placeholder="Rakip firma isimlerini virgülle ayırarak yazın"
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-300"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleAnalyze}
                  disabled={analysisMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {analysisMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analiz Ediliyor...
                    </>
                  ) : (
                    'Pazar Analizini Başlat'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Summary */}
                <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5" />
                      Pazar Durumu Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {analysisData.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Trends */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5" />
                      Güncel Trendler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisData.trends.map((trend, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-slate-300 text-sm">{trend}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunities */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Lightbulb className="w-5 h-5" />
                      Fırsatlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisData.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-300 text-sm">{opportunity}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risks */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <AlertTriangle className="w-5 h-5" />
                      Riskler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisData.risks.map((risk, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-300 text-sm">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Target Audience */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Users className="w-5 h-5" />
                      Hedef Kitle Analizi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {analysisData.targetAudience}
                    </p>
                  </CardContent>
                </Card>

                {/* Competitors */}
                {analysisData.competitors.length > 0 && (
                  <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Target className="w-5 h-5" />
                        Rakip Analizi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisData.competitors.map((competitor, index) => (
                          <Card key={index} className="bg-slate-700 border-slate-600">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="border-slate-500 text-slate-300">
                                  {competitor.name}
                                </Badge>
                              </div>
                              <p className="text-slate-300 text-sm leading-relaxed">
                                {competitor.analysis}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Empty State */}
            {!analysisData && !analysisMutation.isPending && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Pazar Analizinizi Başlatın
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Sektörünüzü girin ve yapay zeka destekli pazar analizi alın. 
                    Trendler, rakipler, fırsatlar ve riskler hakkında detaylı bilgi edinin.
                  </p>
                </CardContent>
              </Card>
            )}
    </div>
  );
}
