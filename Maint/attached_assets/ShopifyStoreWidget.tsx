import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ShopifyStoreWidgetProps {
  userId?: string;
}

const ShopifyStoreWidget: React.FC<ShopifyStoreWidgetProps> = ({ userId = 'test-user' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/shopify/orders?userId=${userId}`).then(res => res.json()),
      fetch(`/api/shopify/products?userId=${userId}`).then(res => res.json()),
      fetch(`/api/shopify/customers?userId=${userId}`).then(res => res.json()),
    ])
      .then(([ordersRes, productsRes, customersRes]) => {
        setOrders(ordersRes.orders || []);
        setProducts(productsRes.products || []);
        setCustomers(customersRes.customers || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Shopify verileri alınamadı');
        setLoading(false);
      });
  }, [userId]);

  // Basit metrikler
  const totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
  const totalOrders = orders.length;
  const totalProductsSold = orders.reduce((sum, o) => sum + (o.line_items?.reduce((s, li) => s + li.quantity, 0) || 0), 0);
  const totalRefunds = orders.filter(o => o.financial_status === 'refunded').length;
  const conversionRate = customers.length > 0 ? (totalOrders / customers.length) * 100 : 0;

  if (loading) return <div className="text-white">Yükleniyor...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Toplam Satış</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">{totalSales.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Satılan Ürün</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-400">{totalProductsSold}</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">İade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-400">{totalRefunds}</div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Dönüşüm Oranı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-400">{conversionRate.toFixed(2)}%</div>
        </CardContent>
      </Card>
    </>
  );
};

export default ShopifyStoreWidget;
