
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingData {
  // Temel Bilgiler
  industry: string;
  businessModel: string;
  companySize: string;
  businessAge: string;
  location: string;
  
  // Finansal Bilgiler
  monthlyRevenue: string;
  monthlyAdBudget: string;
  averageOrderValue: string;
  
  // Hedef Kitle
  targetAudience: string;
  ageGroup: string;
  geography: string;
  
  // Pazarlama Durumu
  currentChannels: string[];
  primaryGoal: string;
  painPoints: string[];
  
  // Ürün/Hizmet
  productCategory: string;
  productCount: string;
  seasonality: string;
  
  // Rakip Bilgileri
  mainCompetitors: string;
  competitiveAdvantage: string;
}

const steps = [
  { id: 1, title: "Temel Bilgiler", description: "Şirketiniz hakkında" },
  { id: 2, title: "Finansal Durum", description: "Bütçe ve gelir bilgileri" },
  { id: 3, title: "Hedef Kitle", description: "Müşteri profili" },
  { id: 4, title: "Pazarlama", description: "Mevcut durum ve hedefler" },
  { id: 5, title: "Ürün & Rakipler", description: "Pazar pozisyonu" },
  { id: 6, title: "Tamamlandı", description: "Hoş geldiniz!" }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    industry: '',
    businessModel: '',
    companySize: '',
    businessAge: '',
    location: '',
    monthlyRevenue: '',
    monthlyAdBudget: '',
    averageOrderValue: '',
    targetAudience: '',
    ageGroup: '',
    geography: '',
    currentChannels: [],
    primaryGoal: '',
    painPoints: [],
    productCategory: '',
    productCount: '',
    seasonality: '',
    mainCompetitors: '',
    competitiveAdvantage: ''
  });

  const handleInputChange = (field: keyof OnboardingData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding data and redirect to dashboard
    console.log('Onboarding completed:', formData);
    window.location.href = '/dashboard';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Sektörünüz nedir?</Label>
              <RadioGroup 
                value={formData.industry} 
                onValueChange={(value) => handleInputChange('industry', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ecommerce" id="ecommerce" />
                  <Label htmlFor="ecommerce">E-ticaret</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="saas" id="saas" />
                  <Label htmlFor="saas">Yazılım/SaaS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retail" id="retail" />
                  <Label htmlFor="retail">Perakende</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="services" id="services" />
                  <Label htmlFor="services">Hizmet Sektörü</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manufacturing" id="manufacturing" />
                  <Label htmlFor="manufacturing">Üretim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Diğer</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">İş modeliniz nedir?</Label>
              <RadioGroup 
                value={formData.businessModel} 
                onValueChange={(value) => handleInputChange('businessModel', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="b2c" id="b2c" />
                  <Label htmlFor="b2c">B2C (Tüketiciye Satış)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="b2b" id="b2b" />
                  <Label htmlFor="b2b">B2B (İşletmelere Satış)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="b2b2c" id="b2b2c" />
                  <Label htmlFor="b2b2c">B2B2C (Karma Model)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Çalışan sayınız kaç kişi?</Label>
              <RadioGroup 
                value={formData.companySize} 
                onValueChange={(value) => handleInputChange('companySize', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solo" id="solo" />
                  <Label htmlFor="solo">Sadece ben (1 kişi)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small">2-10 kişi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">11-50 kişi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large">51-200 kişi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enterprise" id="enterprise" />
                  <Label htmlFor="enterprise">200+ kişi</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">İşletmeniz kaç yaşında?</Label>
              <RadioGroup 
                value={formData.businessAge} 
                onValueChange={(value) => handleInputChange('businessAge', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="startup" id="startup" />
                  <Label htmlFor="startup">Yeni kuruluyor (0-1 yıl)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="early" id="early" />
                  <Label htmlFor="early">Erken dönem (1-3 yıl)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="growth" id="growth" />
                  <Label htmlFor="growth">Büyüme döneminde (3-7 yıl)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mature" id="mature" />
                  <Label htmlFor="mature">Olgun işletme (7+ yıl)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="location" className="text-base font-medium">Ana faaliyet gösterdiğiniz şehir/bölge?</Label>
              <Input
                id="location" 
                placeholder="Örn: İstanbul, Türkiye"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Aylık ortalama cironuz ne kadar? (TL)</Label>
              <RadioGroup 
                value={formData.monthlyRevenue} 
                onValueChange={(value) => handleInputChange('monthlyRevenue', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-50k" id="0-50k" />
                  <Label htmlFor="0-50k">0 - 50.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50k-200k" id="50k-200k" />
                  <Label htmlFor="50k-200k">50.000 - 200.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="200k-500k" id="200k-500k" />
                  <Label htmlFor="200k-500k">200.000 - 500.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="500k-1m" id="500k-1m" />
                  <Label htmlFor="500k-1m">500.000 - 1.000.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1m+" id="1m+" />
                  <Label htmlFor="1m+">1.000.000 TL+</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Aylık reklam bütçeniz ne kadar? (TL)</Label>
              <RadioGroup 
                value={formData.monthlyAdBudget} 
                onValueChange={(value) => handleInputChange('monthlyAdBudget', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-5k" id="0-5k" />
                  <Label htmlFor="0-5k">0 - 5.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5k-15k" id="5k-15k" />
                  <Label htmlFor="5k-15k">5.000 - 15.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="15k-50k" id="15k-50k" />
                  <Label htmlFor="15k-50k">15.000 - 50.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50k-100k" id="50k-100k" />
                  <Label htmlFor="50k-100k">50.000 - 100.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100k+" id="100k+" />
                  <Label htmlFor="100k+">100.000 TL+</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Ortalama sipariş tutarınız ne kadar? (TL)</Label>
              <RadioGroup 
                value={formData.averageOrderValue} 
                onValueChange={(value) => handleInputChange('averageOrderValue', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-100" id="0-100" />
                  <Label htmlFor="0-100">0 - 100 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="100-500" id="100-500" />
                  <Label htmlFor="100-500">100 - 500 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="500-1000" id="500-1000" />
                  <Label htmlFor="500-1000">500 - 1.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1000-5000" id="1000-5000" />
                  <Label htmlFor="1000-5000">1.000 - 5.000 TL</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5000+" id="5000+" />
                  <Label htmlFor="5000+">5.000 TL+</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Hedef kitleniz kimler?</Label>
              <RadioGroup 
                value={formData.targetAudience} 
                onValueChange={(value) => handleInputChange('targetAudience', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general-consumer" id="general-consumer" />
                  <Label htmlFor="general-consumer">Genel tüketiciler</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="women" id="women" />
                  <Label htmlFor="women">Kadınlar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="men" id="men" />
                  <Label htmlFor="men">Erkekler</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="professionals" id="professionals" />
                  <Label htmlFor="professionals">Profesyoneller/İş insanları</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parents" id="parents" />
                  <Label htmlFor="parents">Ebeveynler</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="students" id="students" />
                  <Label htmlFor="students">Öğrenciler</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Hedef yaş grubunuz?</Label>
              <RadioGroup 
                value={formData.ageGroup} 
                onValueChange={(value) => handleInputChange('ageGroup', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="18-24" id="18-24" />
                  <Label htmlFor="18-24">18-24 yaş</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="25-34" id="25-34" />
                  <Label htmlFor="25-34">25-34 yaş</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="35-44" id="35-44" />
                  <Label htmlFor="35-44">35-44 yaş</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="45-54" id="45-54" />
                  <Label htmlFor="45-54">45-54 yaş</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="55+" id="55+" />
                  <Label htmlFor="55+">55+ yaş</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Coğrafi hedeflemeniz?</Label>
              <RadioGroup 
                value={formData.geography} 
                onValueChange={(value) => handleInputChange('geography', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local">Yerel (şehir/bölge)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="national" id="national" />
                  <Label htmlFor="national">Ulusal (Türkiye geneli)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="international" id="international" />
                  <Label htmlFor="international">Uluslararası</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Şu anda hangi pazarlama kanallarını kullanıyorsunuz? (Birden fazla seçebilirsiniz)</Label>
              <div className="mt-3 space-y-2">
                {[
                  { id: 'google-ads', label: 'Google Ads' },
                  { id: 'facebook-ads', label: 'Facebook/Instagram Ads' },
                  { id: 'tiktok-ads', label: 'TikTok Ads' },
                  { id: 'seo', label: 'SEO' },
                  { id: 'email', label: 'E-posta Pazarlama' },
                  { id: 'influencer', label: 'Influencer Marketing' },
                  { id: 'content', label: 'İçerik Pazarlama' },
                  { id: 'traditional', label: 'Geleneksel Medya' }
                ].map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={channel.id}
                      checked={formData.currentChannels.includes(channel.id)}
                      onChange={(e) => {
                        const newChannels = e.target.checked
                          ? [...formData.currentChannels, channel.id]
                          : formData.currentChannels.filter(c => c !== channel.id);
                        handleInputChange('currentChannels', newChannels);
                      }}
                    />
                    <Label htmlFor={channel.id}>{channel.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Birincil pazarlama hedefiniz nedir?</Label>
              <RadioGroup 
                value={formData.primaryGoal} 
                onValueChange={(value) => handleInputChange('primaryGoal', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="awareness" id="awareness" />
                  <Label htmlFor="awareness">Marka bilinirliği artırmak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="leads" id="leads" />
                  <Label htmlFor="leads">Potansiyel müşteri elde etmek</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sales" id="sales" />
                  <Label htmlFor="sales">Satışları artırmak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retention" id="retention" />
                  <Label htmlFor="retention">Müşteri sadakatini artırmak</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">En büyük pazarlama zorluklarınız nelerdir? (Birden fazla seçebilirsiniz)</Label>
              <div className="mt-3 space-y-2">
                {[
                  { id: 'budget', label: 'Sınırlı bütçe' },
                  { id: 'targeting', label: 'Doğru kitleye ulaşamama' },
                  { id: 'measurement', label: 'Sonuçları ölçememe' },
                  { id: 'time', label: 'Zaman yetersizliği' },
                  { id: 'expertise', label: 'Teknik bilgi eksikliği' },
                  { id: 'competition', label: 'Yoğun rekabet' }
                ].map((pain) => (
                  <div key={pain.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={pain.id}
                      checked={formData.painPoints.includes(pain.id)}
                      onChange={(e) => {
                        const newPains = e.target.checked
                          ? [...formData.painPoints, pain.id]
                          : formData.painPoints.filter(p => p !== pain.id);
                        handleInputChange('painPoints', newPains);
                      }}
                    />
                    <Label htmlFor={pain.id}>{pain.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Ürün/hizmet kategoriniz nedir?</Label>
              <RadioGroup 
                value={formData.productCategory} 
                onValueChange={(value) => handleInputChange('productCategory', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fashion" id="fashion" />
                  <Label htmlFor="fashion">Moda & Aksesuar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="electronics" id="electronics" />
                  <Label htmlFor="electronics">Elektronik</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beauty" id="beauty" />
                  <Label htmlFor="beauty">Kozmetik & Güzellik</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="food" id="food" />
                  <Label htmlFor="food">Gıda & İçecek</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home">Ev & Yaşam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="services" id="services-cat" />
                  <Label htmlFor="services-cat">Hizmetler</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Kaç farklı ürün/hizmetiniz var?</Label>
              <RadioGroup 
                value={formData.productCount} 
                onValueChange={(value) => handleInputChange('productCount', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-10" id="1-10" />
                  <Label htmlFor="1-10">1-10 ürün</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="11-50" id="11-50" />
                  <Label htmlFor="11-50">11-50 ürün</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="51-200" id="51-200" />
                  <Label htmlFor="51-200">51-200 ürün</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="200+" id="200+" />
                  <Label htmlFor="200+">200+ ürün</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">İşinizde mevsimsellik var mı?</Label>
              <RadioGroup 
                value={formData.seasonality} 
                onValueChange={(value) => handleInputChange('seasonality', value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">Yok, yıl boyunca stabil</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="summer" id="summer" />
                  <Label htmlFor="summer">Yaz aylarında yoğun</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="winter" id="winter" />
                  <Label htmlFor="winter">Kış aylarında yoğun</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="holiday" id="holiday" />
                  <Label htmlFor="holiday">Bayram/tatil dönemlerinde yoğun</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="competitors" className="text-base font-medium">Ana rakiplerinizi belirtir misiniz? (İsteğe bağlı)</Label>
              <Textarea
                id="competitors"
                placeholder="Örn: Nike, Adidas, Puma..."
                value={formData.mainCompetitors}
                onChange={(e) => handleInputChange('mainCompetitors', e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="advantage" className="text-base font-medium">Rakiplerinizden farklı kılan özelliğiniz nedir?</Label>
              <Textarea
                id="advantage"  
                placeholder="Örn: Daha hızlı teslimat, daha uygun fiyat, daha kaliteli ürün..."
                value={formData.competitiveAdvantage}
                onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Kurulum Tamamlandı! 🎉</h3>
              <p className="text-gray-600 mt-2">
                Artık markanızı tanıyoruz ve size özel analizler hazırlayabiliriz.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900">Kolektif Zeka Aktif!</h4>
              <p className="text-blue-700 text-sm mt-1">
                AI asistanınız, aynı sektörden yüzlerce markanın anonimleştirilmiş verisiyle eğitildi. 
                Sıfırdan değil, sektörünüzün bilgeliğiyle başlıyorsunuz.
              </p>
            </div>
            <Button onClick={handleComplete} size="lg" className="w-full">
              Dashboard'a Git
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Markanızı Tanıyalım</h1>
            <span className="text-sm text-gray-500">
              {currentStep}/5 Adım
            </span>
          </div>
          <Progress value={(currentStep / 5) * 100} className="w-full" />
          
          {currentStep <= 5 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600 text-sm">
                {steps[currentStep - 1].description}
              </p>
            </div>
          )}
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader className="pb-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {steps.slice(0, 5).map((step) => (
                  <div
                    key={step.id}
                    className={`w-3 h-3 rounded-full ${
                      step.id <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            {currentStep <= 5 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === 5 ? 'Tamamla' : 'İleri'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
