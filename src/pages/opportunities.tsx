
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Play,
  Plus
} from "lucide-react";

export default function Opportunities() {
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [channel, setChannel] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const teamMembers = [
    { id: 1, name: "Ahmet Kaya", role: "Pazarlama Müdürü", avatar: "/api/placeholder/32/32" },
    { id: 2, name: "Zeynep Demir", role: "İçerik Uzmanı", avatar: "/api/placeholder/32/32" },
    { id: 3, name: "Mehmet Yılmaz", role: "Veri Analisti", avatar: "/api/placeholder/32/32" },
    { id: 4, name: "Selin Özkan", role: "Sosyal Medya Uzmanı", avatar: "/api/placeholder/32/32" }
  ];

  const opportunities = [
    {
      id: 1,
      title: 'Google Ads Anahtar Kelime Genişletme',
      description: 'Yüksek performanslı anahtar kelimelerin benzerlerini hedefleyerek %25 daha fazla trafik elde edebilirsiniz.',
      category: 'search',
      priority: 'high',
      channel: 'google_ads',
      potentialImpact: 25,
      estimatedROI: 3.8,
      effort: 'medium',
      status: 'new',
      dueDate: '2024-02-15'
    },
    {
      id: 2,
      title: 'Meta Ads Lookalike Audience Optimizasyonu',
      description: 'En iyi müşterilerinize benzer kitleleri hedefleyerek dönüşüm oranını %18 artırabilirsiniz.',
      category: 'audience',
      priority: 'high',
      channel: 'meta_ads',
      potentialImpact: 18,
      estimatedROI: 4.2,
      effort: 'low',
      status: 'in_progress',
      dueDate: '2024-02-10'
    },
    {
      id: 3,
      title: 'Email Remarketing Kampanyası',
      description: 'Sepetini terk eden müşterilere otomatik email göndererek %12 ek dönüşüm elde edebilirsiniz.',
      category: 'retention',
      priority: 'medium',
      channel: 'email',
      potentialImpact: 12,
      estimatedROI: 6.5,
      effort: 'high',
      status: 'new',
      dueDate: '2024-02-20'
    },
    {
      id: 4,
      title: 'TikTok Video Kreatif Çeşitliliği',
      description: 'Farklı video formatları deneyerek engagement oranını %30 artırma potansiyeli bulunuyor.',
      category: 'creative',
      priority: 'medium',
      channel: 'tiktok_ads',
      potentialImpact: 30,
      estimatedROI: 2.9,
      effort: 'medium',
      status: 'completed',
      dueDate: '2024-01-30'
    },
    {
      id: 5,
      title: 'Mobil Landing Page Optimizasyonu',
      description: 'Mobil sayfa hızını iyileştirerek bounce rate\'i %22 azaltabilir ve dönüşümleri artırabilirsiniz.',
      category: 'conversion',
      priority: 'high',
      channel: 'website',
      potentialImpact: 22,
      estimatedROI: 5.1,
      effort: 'high',
      status: 'new',
      dueDate: '2024-02-25'
    }
  ];

  const actions = [
    {
      id: 1,
      type: "opportunity",
      title: "Remarketing Kampanyanı Ölçeklendir",
      description: "Sepet terk kampanyan 4.27x ROAS ile mükemmel performans gösteriyor. Bütçesini %50 artırarak daha fazla gelir elde edebilirsin.",
      priority: "high",
      channel: "meta_ads",
      estimatedImpact: "+₺32,000 aylık gelir",
      dueDate: "2024-02-10",
      assignedTo: null,
      status: "new"
    },
    {
      id: 2,
      type: "warning",
      title: "Google Kampanyası Optimizasyona İhtiyaç Duyuyor",
      description: "Marka farkındalık kampanyan düşük ROAS gösteriyor. Hedef kitle segmentasyonu ve teklif stratejisi gözden geçirilmeli.",
      priority: "medium",
      channel: "google_ads",
      estimatedImpact: "+₺15,000 potansiyel tasarruf",
      dueDate: "2024-02-15",
      assignedTo: { id: 1, name: "Ahmet Kaya" },
      status: "in_progress"
    },
    {
      id: 3,
      type: "insight",
      title: "TikTok Kampanyası Umut Verici",
      description: "Gen Z hedef kitlen TikTok'ta yüksek engagement gösteriyor. Test süresini uzatıp daha fazla kreatif ekleyebilirsin.",
      priority: "low",
      channel: "tiktok_ads",
      estimatedImpact: "+₺8,000 potansiyel gelir",
      dueDate: "2024-02-20",
      assignedTo: null,
      status: "new"
    },
    {
      id: 4,
      type: "opportunity",
      title: "Email Automation Kurulumu",
      description: "Hoş geldin email serisi kurarak yeni müşteri retention'ı %15 artırabilirsin.",
      priority: "medium",
      channel: "email",
      estimatedImpact: "+₺12,000 potansiyel gelir",
      dueDate: "2024-02-18",
      assignedTo: { id: 2, name: "Zeynep Demir" },
      status: "completed"
    }
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-orange-500/20 text-orange-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-orange-500/20 text-orange-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'new': return <Lightbulb className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'opportunity': return 'bg-green-500/20 text-green-400';
      case 'warning': return 'bg-red-500/20 text-red-400';
      case 'insight': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryName = (category) => {
    const names = {
      search: 'Arama',
      audience: 'Kitle',
      retention: 'Sadakat',
      creative: 'Kreatif',
      conversion: 'Dönüşüm'
    };
    return names[category] || category;
  };

  const getChannelName = (channel) => {
    const names = {
      google_ads: 'Google Ads',
      meta_ads: 'Meta Ads',
      tiktok_ads: 'TikTok Ads',
      email: 'Email',
      website: 'Website',
      organic: 'Organik'
    };
    return names[channel] || channel;
  };

  const getEffortColor = (effort) => {
    switch(effort) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-orange-500/20 text-orange-400';
      case 'high': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleAssignTask = (action) => {
    setSelectedAction(action);
    setAssignDialogOpen(true);
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (priority !== 'all' && opp.priority !== priority) return false;
    if (category !== 'all' && opp.category !== category) return false;
    if (channel !== 'all' && opp.channel !== channel) return false;
    return true;
  });

  const filteredActions = actions.filter(action => {
    if (priority !== 'all' && action.priority !== priority) return false;
    if (channel !== 'all' && action.channel !== channel) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Fırsatlar ve Aksiyonlar</h1>
          <p className="text-slate-400">AI destekli öneriler ve görev yönetimi</p>
        </div>
              
              <div className="flex items-center gap-4">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">Tüm Öncelikler</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">Tüm Kanallar</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                    <SelectItem value="meta_ads">Meta Ads</SelectItem>
                    <SelectItem value="tiktok_ads">TikTok Ads</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="organic">Organik</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    <SelectItem value="search">Arama</SelectItem>
                    <SelectItem value="audience">Kitle</SelectItem>
                    <SelectItem value="retention">Sadakat</SelectItem>
                    <SelectItem value="creative">Kreatif</SelectItem>
                    <SelectItem value="conversion">Dönüşüm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Toplam Fırsat</p>
                      <p className="text-2xl font-bold text-white">{filteredOpportunities.length}</p>
                    </div>
                    <Lightbulb className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Bekleyen Aksiyon</p>
                      <p className="text-2xl font-bold text-white">
                        {filteredActions.filter(a => a.status === 'new').length}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Ortalama ROI</p>
                      <p className="text-2xl font-bold text-white">
                        {(filteredOpportunities.reduce((sum, o) => sum + o.estimatedROI, 0) / filteredOpportunities.length || 0).toFixed(1)}x
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Atanmış Görev</p>
                      <p className="text-2xl font-bold text-white">
                        {filteredActions.filter(a => a.assignedTo).length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Opportunities and Actions */}
            <Tabs defaultValue="opportunities" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="opportunities" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                  Büyüme Fırsatları
                </TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                  Aksiyon Önerileri
                </TabsTrigger>
              </TabsList>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Önerilen Fırsatlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {filteredOpportunities.map((opportunity) => (
                        <div key={opportunity.id} className="bg-slate-700/50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold">{opportunity.title}</h4>
                                <Badge variant="secondary" className={getPriorityColor(opportunity.priority)}>
                                  {opportunity.priority === 'high' ? 'Yüksek' : 
                                   opportunity.priority === 'medium' ? 'Orta' : 'Düşük'}
                                </Badge>
                                <Badge variant="secondary" className={getStatusColor(opportunity.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(opportunity.status)}
                                    {opportunity.status === 'new' ? 'Yeni' : 
                                     opportunity.status === 'in_progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                                  </div>
                                </Badge>
                                <Badge variant="outline" className="text-blue-400 border-blue-400">
                                  {getChannelName(opportunity.channel)}
                                </Badge>
                              </div>
                              <p className="text-slate-300 mb-3">{opportunity.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            <div>
                              <span className="text-slate-400 text-sm">Kategori:</span>
                              <p className="text-white font-medium">{getCategoryName(opportunity.category)}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-sm">Potansiyel Etki:</span>
                              <p className="text-green-400 font-medium">+{opportunity.potentialImpact}%</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-sm">Beklenen ROI:</span>
                              <p className="text-blue-400 font-medium">{opportunity.estimatedROI}x</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-sm">Çaba Seviyesi:</span>
                              <Badge variant="secondary" className={getEffortColor(opportunity.effort)}>
                                {opportunity.effort === 'low' ? 'Düşük' : 
                                 opportunity.effort === 'medium' ? 'Orta' : 'Yüksek'}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-slate-400 text-sm">Hedef Tarih:</span>
                              <p className="text-white font-medium">{opportunity.dueDate}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {opportunity.status === 'new' && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Play className="w-4 h-4 mr-1" />
                                  Uygula
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                Detaylar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Aksiyon Önerileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {filteredActions.map((action) => (
                        <div key={action.id} className="bg-slate-700/50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold">{action.title}</h4>
                                <Badge variant="secondary" className={getTypeColor(action.type)}>
                                  {action.type === 'opportunity' ? 'Fırsat' : 
                                   action.type === 'warning' ? 'Uyarı' : 'İçgörü'}
                                </Badge>
                                <Badge variant="secondary" className={getPriorityColor(action.priority)}>
                                  {action.priority === 'high' ? 'Yüksek' : 
                                   action.priority === 'medium' ? 'Orta' : 'Düşük'}
                                </Badge>
                                <Badge variant="outline" className="text-blue-400 border-blue-400">
                                  {getChannelName(action.channel)}
                                </Badge>
                              </div>
                              <p className="text-slate-300 mb-3">{action.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <span className="text-slate-400 text-sm">Tahmini Etki:</span>
                              <p className="text-green-400 font-medium">{action.estimatedImpact}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-sm">Hedef Tarih:</span>
                              <p className="text-white font-medium">{action.dueDate}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-sm">Durum:</span>
                              <Badge variant="secondary" className={getStatusColor(action.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(action.status)}
                                  {action.status === 'new' ? 'Yeni' : 
                                   action.status === 'in_progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                                </div>
                              </Badge>
                            </div>
                            <div>
                              <span className="text-slate-400 text-sm">Atanan Kişi:</span>
                              {action.assignedTo ? (
                                <div className="flex items-center gap-2 mt-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs">
                                      {action.assignedTo.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-white text-sm">{action.assignedTo.name}</span>
                                </div>
                              ) : (
                                <p className="text-slate-400 font-medium">Atanmamış</p>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {action.status === 'new' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Play className="w-4 h-4 mr-1" />
                                  Başlat
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-slate-600 text-slate-300"
                                onClick={() => handleAssignTask(action)}
                              >
                                <Users className="w-4 h-4 mr-1" />
                                Görev Ata
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

      {/* Assign Task Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Görev Ata</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAction && (
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">{selectedAction.title}</h4>
                <p className="text-slate-300 text-sm">{selectedAction.description}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <label className="text-slate-300 text-sm font-medium">Ekip Üyesi Seç:</label>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-slate-400 text-sm">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setAssignDialogOpen(false)}
                className="border-slate-600 text-slate-300"
              >
                İptal
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setAssignDialogOpen(false)}
              >
                Ata
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
