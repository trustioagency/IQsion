
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Palette, TrendingUp, Eye, MousePointer, Heart, Share, Download, Plus } from "lucide-react";

export default function Creative() {
  const [platform, setPlatform] = useState('all');
  const [creativeType, setCreativeType] = useState('all');

  const creatives = [
    {
      id: 1,
      title: 'Bahar Koleksiyonu Video',
      type: 'video',
      platform: 'meta',
      status: 'active',
      impressions: 125430,
      clicks: 3890,
      ctr: 3.1,
      engagement: 8.2,
      spend: 4250,
      conversions: 89,
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'İndirim Kampanyası Banner',
      type: 'image',
      platform: 'google',
      status: 'paused',
      impressions: 89650,
      clicks: 2340,
      ctr: 2.6,
      engagement: 5.8,
      spend: 3180,
      conversions: 67,
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Ürün Tanıtım Carousel',
      type: 'carousel',
      platform: 'tiktok',
      status: 'active',
      impressions: 156780,
      clicks: 4590,
      ctr: 2.9,
      engagement: 12.4,
      spend: 2890,
      conversions: 124,
      thumbnail: '/api/placeholder/300/200'
    }
  ];

  const creativeInsights = [
    { metric: 'En İyi CTR', value: '3.1%', creative: 'Bahar Koleksiyonu Video', change: '+0.5%' },
    { metric: 'En Yüksek Engagement', value: '12.4%', creative: 'Ürün Tanıtım Carousel', change: '+2.1%' },
    { metric: 'En Düşük CPC', value: '₺1.85', creative: 'İndirim Kampanyası Banner', change: '-₺0.25' },
    { metric: 'En İyi ROAS', value: '4.8x', creative: 'Bahar Koleksiyonu Video', change: '+0.3x' }
  ];

  const getPlatformColor = (platform: string): string => {
    const colors = {
      meta: 'bg-blue-500/20 text-blue-400',
      google: 'bg-red-500/20 text-red-400',
      tiktok: 'bg-black/20 text-white'
    };
  return colors[platform as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'carousel': return '📱';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Kreatif Yönetimi</h1>
                <p className="text-slate-400">Reklamlarınızın görsel performansını analiz edin</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">Tüm Platformlar</SelectItem>
                    <SelectItem value="meta">Meta</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={creativeType} onValueChange={setCreativeType}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">Tüm Tipler</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Görsel</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Kreatif
                </Button>
              </div>
            </div>

            {/* Creative Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {creativeInsights.map((insight, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Palette className="w-8 h-8 text-purple-400" />
                      <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                        {insight.change}
                      </Badge>
                    </div>
                    <h4 className="text-slate-400 text-sm mb-2">{insight.metric}</h4>
                    <p className="text-2xl font-bold text-white mb-1">{insight.value}</p>
                    <p className="text-slate-500 text-xs">{insight.creative}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Creative Performance */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Kreatif Performansı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creatives.map((creative) => (
                    <div key={creative.id} className="bg-slate-700/50 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-slate-600 flex items-center justify-center text-4xl">
                        {getTypeIcon(creative.type)}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-white font-medium">{creative.title}</h4>
                          <Badge variant="secondary" className={getPlatformColor(creative.platform)}>
                            {creative.platform.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <span className="text-slate-400">Gösterim:</span>
                            <span className="text-white ml-1">{creative.impressions.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Tıklama:</span>
                            <span className="text-white ml-1">{creative.clicks.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">CTR:</span>
                            <span className="text-green-400 ml-1">{creative.ctr}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Engagement:</span>
                            <span className="text-blue-400 ml-1">{creative.engagement}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Harcama:</span>
                            <span className="text-white ml-1">₺{creative.spend.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Dönüşüm:</span>
                            <span className="text-white ml-1">{creative.conversions}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className={`${
                            creative.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {creative.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                          </Badge>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

    </div>
  );
}
