import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { 
  Users, TrendingUp, TrendingDown, DollarSign, Target, Crown, 
  AlertTriangle, Plus, Eye, Share2, Star, Award, ArrowUpRight
} from "lucide-react";

export default function Affiliate() {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data for affiliate partners
  const affiliateData = [
    {
      id: 1,
      name: "Ayşe Moda",
      username: "@aysemoda",
      avatar: "/api/placeholder/40/40",
      sales: 89750,
      commission: 8975,
      conversionRate: 3.2,
      orders: 156,
      followers: "125K",
      platform: "instagram",
      status: "active",
      performance: "excellent"
    },
    {
      id: 2,
      name: "Lifestyle Elif",
      username: "@lifestyleelif",
      avatar: "/api/placeholder/40/40",
      sales: 67320,
      commission: 6732,
      conversionRate: 2.8,
      orders: 124,
      followers: "89K",
      platform: "tiktok",
      status: "active",
      performance: "good"
    },
    {
      id: 3,
      name: "Moda Zehra",
      username: "@modazehra",
      avatar: "/api/placeholder/40/40",
      sales: 45890,
      commission: 4589,
      conversionRate: 2.1,
      orders: 98,
      followers: "67K",
      platform: "instagram",
      status: "active",
      performance: "average"
    },
    {
      id: 4,
      name: "Beauty Merve",
      username: "@beautymerve",
      avatar: "/api/placeholder/40/40",
      sales: 23450,
      commission: 2345,
      conversionRate: 1.4,
      orders: 45,
      followers: "156K",
      platform: "youtube",
      status: "warning",
      performance: "poor"
    },
    {
      id: 5,
      name: "Style Büşra",
      username: "@stylebusra",
      avatar: "/api/placeholder/40/40",
      sales: 56780,
      commission: 5678,
      conversionRate: 2.6,
      orders: 89,
      followers: "78K",
      platform: "instagram",
      status: "active",
      performance: "good"
    }
  ];

  // Get top performer
  const topPerformer = affiliateData.reduce((prev, current) => 
    (prev.sales > current.sales) ? prev : current
  );

  // Get warning performer
  const warningPerformer = affiliateData.find(affiliate => affiliate.performance === "poor");

  const getPerformanceBadge = (performance: string, conversionRate: number) => {
    switch (performance) {
      case 'excellent':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Star className="w-3 h-3 mr-1" />
            Mükemmel ({conversionRate}%)
          </Badge>
        );
      case 'good':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            İyi ({conversionRate}%)
          </Badge>
        );
      case 'average':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Target className="w-3 h-3 mr-1" />
            Orta ({conversionRate}%)
          </Badge>
        );
      case 'poor':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <TrendingDown className="w-3 h-3 mr-1" />
            Zayıf ({conversionRate}%)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-600 text-slate-400">
            {conversionRate}%
          </Badge>
        );
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>;
      case 'tiktok':
        return <div className="w-3 h-3 bg-black rounded-full"></div>;
      case 'youtube':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-6">

            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Affiliate Merkezi</h1>
                <p className="text-slate-400">
                  Influencer ve affiliate ortaklarınızın performansını izleyin, 
                  komisyonları yönetin ve işbirliklerinizi optimize edin.
                </p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Affiliate Ekle
              </Button>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="7d">Son 7 Gün</SelectItem>
                  <SelectItem value="30d">Son 30 Gün</SelectItem>
                  <SelectItem value="90d">Son 90 Gün</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Highlight Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performer Card */}
              <Card className="bg-gradient-to-br from-emerald-500/10 via-slate-800 to-slate-800 border-emerald-500/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Ayın Affiliate'i
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 ring-2 ring-emerald-500/50">
                      <AvatarImage src={topPerformer.avatar} />
                      <AvatarFallback className="bg-emerald-500 text-white">
                        {topPerformer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{topPerformer.name}</h3>
                      <p className="text-slate-400 text-sm">{topPerformer.username}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getPlatformIcon(topPerformer.platform)}
                        <span className="text-slate-400 text-xs">{topPerformer.followers} takipçi</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-400">
                        ₺{topPerformer.sales.toLocaleString()}
                      </p>
                      <p className="text-slate-400 text-sm">Toplam Satış</p>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mt-2">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        {topPerformer.conversionRate}% CVR
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warning Card */}
              <Card className="bg-gradient-to-br from-red-500/10 via-slate-800 to-slate-800 border-red-500/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Performans Uyarısı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {warningPerformer && (
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-red-500/50">
                        <AvatarImage src={warningPerformer.avatar} />
                        <AvatarFallback className="bg-red-500 text-white">
                          {warningPerformer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg">{warningPerformer.name}</h3>
                        <p className="text-slate-400 text-sm">{warningPerformer.username}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getPlatformIcon(warningPerformer.platform)}
                          <span className="text-slate-400 text-xs">{warningPerformer.followers} takipçi</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-400">
                          {warningPerformer.conversionRate}%
                        </p>
                        <p className="text-slate-400 text-sm">Düşük CVR</p>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mt-2">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Dikkat Gerekiyor
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Leaderboard */}
            <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Performans Liderlik Tablosu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Affiliate</TableHead>
                      <TableHead className="text-slate-300">Getirilen Satış</TableHead>
                      <TableHead className="text-slate-300">Hakedilen Komisyon</TableHead>
                      <TableHead className="text-slate-300">Dönüşüm Oranı</TableHead>
                      <TableHead className="text-slate-300">Siparişler</TableHead>
                      <TableHead className="text-slate-300">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliateData.map((affiliate, index) => (
                      <TableRow key={affiliate.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={affiliate.avatar} />
                                <AvatarFallback className="bg-slate-600 text-slate-300">
                                  {affiliate.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {index === 0 && (
                                <Crown className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{affiliate.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-slate-400 text-sm">{affiliate.username}</p>
                                {getPlatformIcon(affiliate.platform)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-white">₺{affiliate.sales.toLocaleString()}</p>
                            <p className="text-slate-400 text-xs">{affiliate.followers} takipçi</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-emerald-400">₺{affiliate.commission.toLocaleString()}</p>
                        </TableCell>
                        <TableCell>
                          {getPerformanceBadge(affiliate.performance, affiliate.conversionRate)}
                        </TableCell>
                        <TableCell>
                          <p className="text-white">{affiliate.orders}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              <Eye className="w-3 h-3 mr-1" />
                              Detay
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              <Share2 className="w-3 h-3 mr-1" />
                              İletişim
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

    </div>
  );
}
