import { useState } from "react";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
// ...existing code...
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  DollarSign,
  Users,
  ShoppingCart,
  Mail,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Lightbulb
} from "lucide-react";

export default function Autopilot() {
  const [newAutomationOpen, setNewAutomationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mevcut otomasyonlar
  const automations = [
    {
      id: 1,
      title: "Düşük ROAS Uyarısı",
      description: "ROAS 2.0'ın altına düştüğünde otomatik uyarı gönder",
      type: "alert",
      status: "active",
      trigger: "ROAS < 2.0",
      action: "Email + Slack bildirimi",
      lastRun: "2 saat önce",
      frequency: "Her saat",
      icon: AlertTriangle,
      color: "text-orange-400"
    },
    {
      id: 2,
      title: "Bütçe Optimizasyonu",
      description: "Kötü performans gösteren kampanyaları otomatik duraklat",
      type: "optimization",
      status: "active",
      trigger: "CPA > hedef + %50",
      action: "Kampanyayı duraklat",
      lastRun: "1 gün önce",
      frequency: "Günlük",
      icon: Target,
      color: "text-blue-400"
    },
    {
      id: 3,
      title: "Stok Uyarı Sistemi",
      description: "Kritik stok seviyesinde otomatik kampanya durdurma",
      type: "inventory",
      status: "active",
      trigger: "Stok < 10 adet",
      action: "İlgili ürün kampanyalarını duraklat",
      lastRun: "3 gün önce",
      frequency: "Her 6 saat",
      icon: ShoppingCart,
      color: "text-purple-400"
    },
    {
      id: 4,
      title: "Müşteri Geri Kazanım",
      description: "30 gün satın almayan müşterilere otomatik kampanya",
      type: "retention",
      status: "paused",
      trigger: "Son satın alma > 30 gün",
      action: "%15 indirim kodu gönder",
      lastRun: "1 hafta önce",
      frequency: "Haftalık",
      icon: Users,
      color: "text-green-400"
    }
  ];

  // AI önerileri
  const aiSuggestions = [
    {
      id: 1,
      title: "Sezonsal Bütçe Artırımı",
      description: "Yılbaşı yaklaşıyor, başarılı kampanyanızın bütçesini %30 artırmayı öneriyoruz",
      impact: "Potansiyel +₺25,000 gelir",
      confidence: 87,
      urgency: "high",
      category: "budget"
    },
    {
      id: 2,
      title: "Yeni Hedef Kitle Önerisi",
      description: "25-34 yaş arası kadın kitleniz %40 daha iyi dönüş veriyor",
      impact: "ROAS +0.8 artış beklentisi",
      confidence: 74,
      urgency: "medium",
      category: "targeting"
    },
    {
      id: 3,
      title: "Kreatif Yenileme Uyarısı",
      description: "Ana kreatifinizin CTR'ı son 7 günde %25 düştü",
      impact: "CTR iyileştirmesi bekleniyor",
      confidence: 92,
      urgency: "high",
      category: "creative"
    }
  ];

  // Otomasyon şablonları
  const automationTemplates = [
    {
      id: 1,
      name: "ROAS Uyarı Sistemi",
      description: "Belirli bir ROAS seviyesinin altına düştüğünde uyarı",
      category: "Performans",
      triggers: ["ROAS", "CPA", "CTR"],
      actions: ["Email", "Slack", "SMS"]
    },
    {
      id: 2,
      name: "Otomatik Bid Ayarlama",
      description: "Performansa göre otomatik teklif ayarlama",
      category: "Optimizasyon", 
      triggers: ["CPC", "Position", "Quality Score"],
      actions: ["Bid Adjustment", "Pause Campaign", "Budget Change"]
    },
    {
      id: 3,
      name: "Müşteri Lifecycle",
      description: "Müşteri davranışına göre otomatik kampanyalar",
      category: "CRM",
      triggers: ["Purchase", "Cart Abandonment", "Email Open"],
      actions: ["Send Email", "Create Audience", "Apply Discount"]
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Otopilot</h1>
          <p className="text-slate-400">Pazarlama süreçlerinizi otomatikleştirin ve AI önerilerini takip edin</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300">
            <Settings className="w-4 h-4 mr-2" />
            Ayarlar
          </Button>
          <Dialog open={newAutomationOpen} onOpenChange={setNewAutomationOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Otomasyon
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Yeni Otomasyon Oluştur</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Özel otomasyon kuralınızı tanımlayın
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Otomasyon Adı</Label>
                  <Input placeholder="Örn: Yüksek CPA Uyarısı" className="bg-slate-700 border-slate-600" />
                </div>
                <div>
                  <Label className="text-slate-300">Açıklama</Label>
                  <Textarea placeholder="Bu otomasyonun ne yaptığını açıklayın..." className="bg-slate-700 border-slate-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Tetikleyici</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Koşul seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="roas">ROAS</SelectItem>
                        <SelectItem value="cpa">CPA</SelectItem>
                        <SelectItem value="ctr">CTR</SelectItem>
                        <SelectItem value="budget">Bütçe</SelectItem>
                        <SelectItem value="stock">Stok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">Aksiyon</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Aksiyon seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email Gönder</SelectItem>
                        <SelectItem value="pause">Kampanyayı Durdur</SelectItem>
                        <SelectItem value="budget">Bütçe Değiştir</SelectItem>
                        <SelectItem value="bid">Teklifi Ayarla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setNewAutomationOpen(false)}>
                    İptal
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Otomasyon Oluştur
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700">
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="automations" className="data-[state=active]:bg-slate-700">
            Otomasyonlar
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-slate-700">
            AI Önerileri
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700">
            Şablonlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Aktif Otomasyonlar</p>
                    <p className="text-white text-2xl font-bold">8</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Bu Ay Çalıştırılan</p>
                    <p className="text-white text-2xl font-bold">127</p>
                  </div>
                  <Play className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Tasarruf Edilen</p>
                    <p className="text-white text-2xl font-bold">₺12,450</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Başarı Oranı</p>
                    <p className="text-white text-2xl font-bold">94%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Son Aktiviteler */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "2 dakika önce", action: "Düşük ROAS uyarısı gönderildi", type: "alert" },
                  { time: "1 saat önce", action: "Kampanya otomatik durduruldu", type: "optimization" },
                  { time: "3 saat önce", action: "Bütçe %20 artırıldı", type: "budget" },
                  { time: "1 gün önce", action: "Yeni hedef kitle oluşturuldu", type: "audience" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'alert' ? 'bg-red-400' :
                      activity.type === 'optimization' ? 'bg-blue-400' :
                      activity.type === 'budget' ? 'bg-green-400' : 'bg-purple-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white">{activity.action}</p>
                      <p className="text-slate-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-6">
          <div className="grid gap-6">
            {automations.map((automation) => {
              const IconComponent = automation.icon;
              return (
                <Card key={automation.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-700 ${automation.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{automation.title}</h3>
                          <p className="text-slate-400 text-sm">{automation.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={automation.status === 'active' ? 'default' : 'secondary'} 
                               className={automation.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                          {automation.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                        </Badge>
                        <Switch checked={automation.status === 'active'} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">Tetikleyici</p>
                        <p className="text-white">{automation.trigger}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Aksiyon</p>
                        <p className="text-white">{automation.action}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Son Çalışma</p>
                        <p className="text-white">{automation.lastRun}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        {automation.frequency}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          <Edit className="w-4 h-4 mr-1" />
                          Düzenle
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          <Settings className="w-4 h-4 mr-1" />
                          Ayarlar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <div className="grid gap-6">
            {aiSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{suggestion.title}</h3>
                        <p className="text-slate-400 text-sm">{suggestion.description}</p>
                      </div>
                    </div>
                    <Badge className={getUrgencyColor(suggestion.urgency)}>
                      {suggestion.urgency === 'high' ? 'Yüksek' : 
                       suggestion.urgency === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Beklenen Etki</p>
                      <p className="text-white font-medium">{suggestion.impact}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Güvenilirlik</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${suggestion.confidence}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{suggestion.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Otomasyona Çevir
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      Manuel Uygula
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      Daha Sonra
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automationTemplates.map((template) => (
              <Card key={template.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                    <p className="text-slate-400 text-sm">{template.description}</p>
                  </div>
                  
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300 mb-4">
                    {template.category}
                  </Badge>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Tetikleyiciler</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.triggers.map((trigger, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Aksiyonlar</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.actions.map((action, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Şablonu Kullan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
