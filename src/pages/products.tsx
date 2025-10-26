import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  Filter, 
  Search,
  Eye,
  ShoppingCart,
  Target,
  Lightbulb,
  Zap,
  AlertCircle,
  TrendingDown,
  CheckCircle,
  Users,
  BarChart3,
  DollarSign,
  Trophy,
  Link2 as Link
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type ShopifyVariant = {
  id: number | string;
  price?: string;
  inventory_quantity?: number;
  inventory_item_id?: number | string;
  inventory_cost?: number;
};

type ShopifyImage = {
  src?: string;
};

type ShopifyProduct = {
  id: number | string;
  title: string;
  vendor?: string;
  product_type?: string;
  status?: string;
  created_at?: string;
  image?: ShopifyImage | null;
  images?: ShopifyImage[];
  variants?: ShopifyVariant[];
  cost?: string | number;
  costSource?: 'shopify' | 'manual';
};

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  salesCount: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  stock: number;
  performanceScore: number;
  performanceGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  image: string;
  insights: ProductInsight[];
}

interface ProductInsight {
  type: 'champion' | 'bundle' | 'audience' | 'stock' | 'warning';
  title: string;
  description: string;
  action?: string;
  actionType?: 'campaign' | 'segment' | 'restock';
}

export default function Products() {
  const { user } = useAuth();
  const uid = (user as any)?.uid || (user as any)?.id;
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('performanceScore');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [costInputs, setCostInputs] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'success' | 'error'>>({});

  const { data: shopifyProductsData, isLoading: shopifyLoading, error: shopifyError } = useQuery<{ products: ShopifyProduct[] } | null>({
    queryKey: ['shopify-products', uid],
    enabled: !!uid,
    queryFn: async () => {
      const res = await fetch(`/api/shopify/products?userId=${encodeURIComponent(uid)}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    }
  });

  // Mock data
  const overviewStats = {
    totalProducts: 152,
    totalRevenue: 1200000,
    topCategory: 'Elektronik',
    avgProfitMargin: 28
  };

  const categoryDistribution = [
    { category: 'Elektronik', revenue: 450000, percentage: 37.5 },
    { category: 'Giyim', revenue: 380000, percentage: 31.7 },
    { category: 'Ev & Yaşam', revenue: 230000, percentage: 19.2 },
    { category: 'Spor', revenue: 140000, percentage: 11.7 }
  ];

  const products: Product[] = [
    {
      id: 1,
      name: 'Akıllı Telefon Model X',
      sku: 'TEL-001',
      category: 'Elektronik',
      price: 8500,
      salesCount: 89,
      revenue: 756500,
      profit: 302600,
      profitMargin: 40,
      stock: 23,
      performanceScore: 92,
      performanceGrade: 'A+',
      image: '/api/placeholder/60/60',
      insights: [
        {
          type: 'champion',
          title: 'ŞAMPİYON ÜRÜN',
          description: 'Bu ürün, son 30 günde en çok ciro getiren ilk 5 ürününüz arasında ve kârlılık marjı da ortalamanın %40 üzerinde. Bu ürünün stoklarını daima dolu tutun.',
        },
        {
          type: 'bundle',
          title: 'BİRLİKTE ALIM FIRSATI',
          description: 'Bu ürünü alan müşterilerin %65\'i, \'Kablosuz Kulaklık Model Y\' ürününü de satın alıyor. Bu iki ürünü bir paket (bundle) olarak %10 indirimle sunarak sepet ortalamasını artırabilirsiniz.',
          action: 'Kampanya Oluştur',
          actionType: 'campaign'
        },
        {
          type: 'audience',
          title: 'KİTLE EŞLEŞMESİ',
          description: 'Bu ürün, özellikle \'Yüksek LTV\'li Müşteriler\' segmentiniz tarafından tercih ediliyor. Bu segmente yönelik \'Model X\' odaklı bir e-posta kampanyası ile tekrar satış potansiyeli yüksek.',
          action: 'Segmenti Gör',
          actionType: 'segment'
        },
        {
          type: 'stock',
          title: 'STOK UYARISI',
          description: 'Mevcut satış hızına göre stoklarınız 12 gün içinde tükenebilir. Tedarik sürecini başlatmanız önerilir.',
          action: 'Tedarik Planla',
          actionType: 'restock'
        }
      ]
    },
    {
      id: 2,
      name: 'Kablosuz Kulaklık Model Y',
      sku: 'KUL-002',
      category: 'Elektronik',
      price: 450,
      salesCount: 156,
      revenue: 70200,
      profit: 21060,
      profitMargin: 30,
      stock: 87,
      performanceScore: 85,
      performanceGrade: 'A',
      image: '/api/placeholder/60/60',
      insights: [
        {
          type: 'bundle',
          title: 'POPÜLER İKİLİ',
          description: 'Akıllı Telefon Model X ile sıklıkla birlikte satın alınıyor. Bundle kampanyalarında kullanılabilir.',
        }
      ]
    },
    {
      id: 3,
      name: 'Casual T-Shirt Beyaz',
      sku: 'GIY-003',
      category: 'Giyim',
      price: 89,
      salesCount: 234,
      revenue: 20826,
      profit: 6248,
      profitMargin: 30,
      stock: 145,
      performanceScore: 72,
      performanceGrade: 'B+',
      image: '/api/placeholder/60/60',
      insights: [
        {
          type: 'warning',
          title: 'DÜŞÜK MARJ UYARISI',
          description: 'Bu ürünün kârlılık marjı kategori ortalamasının altında. Maliyet optimizasyonu veya fiyat artışı değerlendirilebilir.',
        }
      ]
    }
  ];

  const getPerformanceColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'A': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'B+': case 'B': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'C+': case 'C': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'D': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'champion': return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'bundle': return <Link className="w-4 h-4 text-blue-400" />;
      case 'audience': return <Target className="w-4 h-4 text-purple-400" />;
      case 'stock': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredProducts = products
    .filter(product => 
      (filterCategory === 'all' || product.category === filterCategory) &&
      (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'performanceScore': return b.performanceScore - a.performanceScore;
        case 'revenue': return b.revenue - a.revenue;
        case 'profit': return b.profit - a.profit;
        case 'salesCount': return b.salesCount - a.salesCount;
        default: return 0;
      }
    });

  // Shopify products filtered list for the table
  const shopifyProducts = shopifyProductsData?.products || [];
  const filteredShopifyProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return shopifyProducts.filter(p => {
      const title = (p.title || '').toLowerCase();
      const vendor = (p.vendor || '').toLowerCase();
      return !term || title.includes(term) || vendor.includes(term);
    });
  }, [shopifyProducts, searchTerm]);

  const saveCost = useMutation({
    mutationFn: async ({ id, cost }: { id: string | number; cost: string }) => {
      const res = await fetch(`/api/shopify/products/${encodeURIComponent(String(id))}/cost?userId=${encodeURIComponent(uid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost }),
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Maliyet kaydedilemedi');
      }
      return res.json();
    },
    onMutate: ({ id }) => {
      setSaveStatus((s) => ({ ...s, [String(id)]: 'saving' }));
    },
    onSuccess: (_data, { id }) => {
      setSaveStatus((s) => ({ ...s, [String(id)]: 'success' }));
      // Bir süre sonra ibareyi kaldır
      setTimeout(() => {
        setSaveStatus((s) => ({ ...s, [String(id)]: 'idle' }));
      }, 2000);
    },
    onError: (_err, { id }) => {
      setSaveStatus((s) => ({ ...s, [String(id)]: 'error' }));
      setTimeout(() => {
        setSaveStatus((s) => ({ ...s, [String(id)]: 'idle' }));
      }, 2500);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-products', uid] });
    }
  });

  const handleCostChange = (id: string | number, value: string) => {
    setCostInputs(prev => ({ ...prev, [String(id)]: value }));
  };

  return (
    <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Ürün Performans Paneli</h1>
                <p className="text-slate-400">Ürünlerinizin ticari DNA'sını analiz edin ve pazarlama stratejilerinizi optimize edin</p>
              </div>
            </div>

            {/* A. Genel Bakış Paneli */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Package className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-slate-400 text-sm mb-2">Toplam Aktif Ürün</h4>
                  <p className="text-2xl font-bold text-white">{overviewStats.totalProducts}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-slate-400 text-sm mb-2">Toplam Satış Hacmi (30 Gün)</h4>
                  <p className="text-2xl font-bold text-white">₺{(overviewStats.totalRevenue / 1000000).toFixed(1)}M</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Star className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-slate-400 text-sm mb-2">En Çok Satan Kategori</h4>
                  <p className="text-2xl font-bold text-white">{overviewStats.topCategory}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h4 className="text-slate-400 text-sm mb-2">Ortalama Kârlılık Marjı</h4>
                  <p className="text-2xl font-bold text-white">%{overviewStats.avgProfitMargin}</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Kategorilere Göre Ciro Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryDistribution.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-300">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-medium">₺{(category.revenue / 1000).toFixed(0)}K</span>
                        <span className="text-slate-400">%{category.percentage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Aksiyon Önerileri */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  AI Aksiyon Önerileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Yüksek Öncelikli Aksiyonlar */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                    Yüksek Öncelikli Aksiyonlar
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-slate-800/50 mr-3">
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">Stok Kritik Seviyede</h5>
                              <p className="text-slate-400 text-sm">15 ürün kritik stok seviyesinde</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">
                          En çok satan ürünlerinizden 15'inin stoğu 10'un altına düştü. Acil stok takviyesi gerekli.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">Yüksek Öncelik</span>
                          <Button size="sm" className="bg-slate-700 hover:bg-slate-600">
                            Stok Listesi
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-slate-800/50 mr-3">
                              <TrendingDown className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-white">Düşük Performanslı Ürünler</h5>
                              <p className="text-slate-400 text-sm">23 ürün son 30 günde hiç satılmadı</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">
                          Stokta bulunan ancak satış performansı düşük ürünler için indirim kampanyası düzenleyin.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">Yüksek Öncelik</span>
                          <Button size="sm" className="bg-slate-700 hover:bg-slate-600">
                            Kampanya Öner
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Diğer Öneriler */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    Fırsat Önerileri
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-slate-700 mr-3">
                              <Star className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                              <h6 className="font-medium text-white">Şampiyon Ürün Promosyonu</h6>
                              <p className="text-slate-400 text-xs">En çok satan 5 ürününüz</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">
                          En yüksek performanslı ürünlerinizi öne çıkaran özel bir vitrin oluşturun.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">+₺45K gelir</span>
                          <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600">
                            Detaylar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-slate-700 mr-3">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h6 className="font-medium text-white">Cross-Sell Fırsatları</h6>
                              <p className="text-slate-400 text-xs">Birlikte satılabilir ürünler</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">
                          Müşterilerin sıkça birlikte aldığı ürün kombinasyonlarını analiz edin.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">+%15 AOV</span>
                          <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600">
                            Analiz Et
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-slate-700 mr-3">
                              <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h6 className="font-medium text-white">Fiyat Optimizasyonu</h6>
                              <p className="text-slate-400 text-xs">Karlılık artırma fırsatı</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">
                          AI ile talep analizi yaparak optimal fiyatlandırma önerileri alın.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">+%8 kâr</span>
                          <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600">
                            Hesapla
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shopify Ürünleri Tablosu */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-white">Shopify Ürünleri</CardTitle>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Ürün ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-slate-300 w-48"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {shopifyLoading && (
                    <div className="text-slate-400 text-sm p-4">Shopify ürünleri yükleniyor...</div>
                  )}
                  {shopifyError && (
                    <div className="text-red-400 text-sm p-4">Shopify ürünleri alınamadı.</div>
                  )}
                  {!shopifyLoading && !shopifyError && (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Ürün</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Marka</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Kategori</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Fiyat</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Maliyet</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Stok</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Durum</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">Oluşturma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredShopifyProducts.map((p) => {
                          const img = p.image?.src || p.images?.[0]?.src || '';
                          const prices = (p.variants || []).map(v => Number(v.price || 0)).filter(n => Number.isFinite(n) && n > 0);
                          const priceMin = prices.length ? Math.min(...prices) : 0;
                          const priceMax = prices.length ? Math.max(...prices) : 0;
                          const priceLabel = prices.length > 1 ? `₺${priceMin.toLocaleString('tr-TR')} - ₺${priceMax.toLocaleString('tr-TR')}` : `₺${priceMin.toLocaleString('tr-TR')}`;
                          const stock = (p.variants || []).reduce((acc, v) => acc + (v.inventory_quantity || 0), 0);
                          const created = p.created_at ? new Date(p.created_at).toLocaleDateString('tr-TR') : '';
                          return (
                            <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-700 rounded overflow-hidden flex items-center justify-center">
                                    {img ? (
                                      <img src={img} alt={p.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-5 h-5 text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-white font-medium line-clamp-1" title={p.title}>{p.title}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-300">{p.vendor || '-'}</td>
                              <td className="py-3 px-4">
                                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                                  {p.product_type || '-'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-white">{priceLabel}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={costInputs[String(p.id)] ?? String(p.cost ?? '')}
                                    onChange={(e) => handleCostChange(p.id, e.target.value)}
                                    placeholder="₺0"
                                    className="h-8 w-28 bg-slate-700 border-slate-600 text-slate-200"
                                    disabled={p.costSource === 'shopify'}
                                  />
                                  {p.costSource !== 'shopify' ? (
                                    <Button
                                      size="sm"
                                      className="h-8 px-2 bg-slate-700 hover:bg-slate-600"
                                      disabled={saveStatus[String(p.id)] === 'saving' || ((costInputs[String(p.id)] ?? String(p.cost ?? '')).trim() === String(p.cost ?? ''))}
                                      onClick={() => saveCost.mutate({ id: p.id, cost: (costInputs[String(p.id)] ?? String(p.cost ?? '')).trim() })}
                                    >
                                      {saveStatus[String(p.id)] === 'saving' ? 'Kaydediliyor...' : 'Kaydet'}
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-slate-400 border border-slate-600 rounded px-2 py-1">Shopify</span>
                                  )}
                                  {saveStatus[String(p.id)] === 'success' && (
                                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" /> Kaydedildi
                                    </span>
                                  )}
                                  {saveStatus[String(p.id)] === 'error' && (
                                    <span className="text-red-400 text-xs flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5" /> Hata
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-white">{stock}</td>
                              <td className="py-3 px-4 text-slate-300">{p.status || '-'}</td>
                              <td className="py-3 px-4 text-slate-300">{created}</td>
                            </tr>
                          );
                        })}
                        {!filteredShopifyProducts.length && (
                          <tr>
                            <td colSpan={8} className="py-6 px-4 text-slate-400 text-sm">Hiç ürün bulunamadı.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>

    </div>
  );
}