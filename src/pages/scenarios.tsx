
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { PlayCircle, TrendingUp, DollarSign, Target, BarChart3, Plus } from "lucide-react";

export default function Scenarios() {
  const scenarios = [
    {
      id: 1,
      title: 'Bütçe %20 Artırım Senaryosu',
      description: 'Mevcut bütçeyi %20 artırırsak nasıl bir performans artışı bekleyebiliriz?',
      status: 'active',
      budgetChange: 20,
      expectedROAS: 4.2,
      expectedRevenue: 185600,
      confidence: 85
    },
    {
      id: 2,
      title: 'Yeni Platform Ekleme (TikTok)',
      description: 'TikTok Ads platformunu eklersek toplam performansa etkisi nasıl olur?',
      status: 'draft',
      budgetChange: 15,
      expectedROAS: 3.8,
      expectedRevenue: 142300,
      confidence: 72
    },
    {
      id: 3,
      title: 'Seasonality Optimizasyonu',
      description: 'Sezonsal dönemlerde bütçe dağılımını optimize edersek sonuçlar nasıl olur?',
      status: 'completed',
      budgetChange: 0,
      expectedROAS: 4.6,
      expectedRevenue: 203400,
      confidence: 91
    }
  ];

  return (
    <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Senaryo Analizi</h1>
                <p className="text-slate-400">Farklı stratejileri test edin ve sonuçları öngörün</p>
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Senaryo
              </Button>
            </div>

            <div className="space-y-6">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">{scenario.title}</h3>
                        <p className="text-slate-400">{scenario.description}</p>
                      </div>
                      <Badge variant="secondary" className={`${
                        scenario.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        scenario.status === 'draft' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {scenario.status === 'active' ? 'Aktif' : 
                         scenario.status === 'draft' ? 'Taslak' : 'Tamamlandı'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-blue-400" />
                          <span className="text-slate-400 text-sm">Bütçe Değişimi</span>
                        </div>
                        <p className="text-white text-xl font-bold">+{scenario.budgetChange}%</p>
                      </div>
                      
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span className="text-slate-400 text-sm">Beklenen ROAS</span>
                        </div>
                        <p className="text-white text-xl font-bold">{scenario.expectedROAS}x</p>
                      </div>
                      
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-purple-400" />
                          <span className="text-slate-400 text-sm">Beklenen Gelir</span>
                        </div>
                        <p className="text-white text-xl font-bold">₺{scenario.expectedRevenue.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-orange-400" />
                          <span className="text-slate-400 text-sm">Güvenilirlik</span>
                        </div>
                        <p className="text-white text-xl font-bold">{scenario.confidence}%</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Senaryoyu Çalıştır
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                        Düzenle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

    </div>
  );
}
