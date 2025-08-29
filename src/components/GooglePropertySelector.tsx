import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface GooglePropertySelectorProps {
  userId: string;
  onSave?: (propertyId: string) => void;
}

const GooglePropertySelector: React.FC<GooglePropertySelectorProps> = ({ userId = 'test-user', onSave }) => {
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/connections?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        const gaConn = data?.google_analytics;
        if (gaConn?.propertyId) setSelectedProperty(gaConn.propertyId);
        // Property listesi backend'den gelsin
        fetch(`/api/analytics/properties?userId=${userId}`)
          .then(res => res.json())
          .then(list => {
            setProperties(list.properties || []);
            setLoading(false);
          });
      });
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, platform: 'google_analytics', propertyId: selectedProperty })
    });
    setSaved(true);
    setLoading(false);
    if (onSave) onSave(selectedProperty);
  };

  return (
    <Card className="bg-slate-800 border-green-700/50 mb-6">
      <CardHeader>
        <CardTitle className="text-green-300">Google Analytics Property Seçimi</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedProperty} onValueChange={setSelectedProperty} disabled={loading}>
          <SelectTrigger className="bg-slate-700 text-white border-green-700 mb-4">
            <SelectValue placeholder="Property ID seçin" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-green-700">
            {properties.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSave} disabled={!selectedProperty || loading} className="bg-green-600 text-white">
          Kaydet
        </Button>
        {saved && <span className="ml-4 text-green-400">Kaydedildi!</span>}
      </CardContent>
    </Card>
  );
};

export default GooglePropertySelector;
