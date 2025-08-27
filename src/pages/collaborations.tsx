
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Handshake, 
  Users, 
  Star, 
  TrendingUp, 
  Building2, 
  Calendar,
  ArrowRight,
  Plus,
  FileText,
  Target
} from "lucide-react";

export default function Collaborations() {
  return (
    <div className="space-y-6">

            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">İş Birlikleri</h1>
                <p className="text-slate-400">
                  Tüm iş birliği türlerinizi tek merkezden yönetin. Influencer, affiliate ve kurumsal ortaklıklarınızı takip edin.
                </p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Yeni İş Birliği
              </Button>
            </div>

            {/* Partnership Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Affiliate Marketing */}
              <Link href="/collaborations/affiliate">
                <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/80 transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <CardTitle className="text-white">Affiliate Marketing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 mb-4">
                      Influencer ve affiliate ortaklarınızın performansını izleyin, komisyonları yönetin.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>23 Aktif Ortak</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-400">
                        <Star className="w-4 h-4" />
                        <span>4.8 Puan</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Brand Partnerships */}
              <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/80 transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-white">Marka Ortaklıkları</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 mb-4">
                    Kurumsal marka ortaklıkları ve co-marketing kampanyalarınızı yönetin.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Building2 className="w-4 h-4" />
                      <span>8 Aktif Marka</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Calendar className="w-4 h-4" />
                      <span>5 Bekleyen</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strategic Partnerships */}
              <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/80 transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-white">Stratejik Ortaklıklar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 mb-4">
                    Uzun vadeli stratejik iş birlikleri ve joint venture projelerinizi takip edin.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Handshake className="w-4 h-4" />
                      <span>3 Aktif Proje</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <FileText className="w-4 h-4" />
                      <span>2 Müzakere</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">Ayşe Moda ile yeni komisyon anlaşması imzalandı</p>
                      <p className="text-slate-400 text-xs">2 saat önce</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">TechBrand ortaklık önerisi alındı</p>
                      <p className="text-slate-400 text-xs">1 gün önce</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">Q1 ortaklık performans raporu hazırlandı</p>
                      <p className="text-slate-400 text-xs">3 gün önce</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

    </div>
  );
}
