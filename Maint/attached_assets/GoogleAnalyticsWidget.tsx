import React, { useState } from 'react';
import { useLanguage } from './translations_1753609852222';

// Example widget for Google Analytics connection
const GoogleAnalyticsWidget: React.FC = () => {
  const { t } = useLanguage();
  const [propertyId, setPropertyId] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const handleConnect = async () => {
    setStatus('loading');
    try {
      // Send propertyId to backend (adjust endpoint as needed)
      const res = await fetch(`/api/auth/google/callback?propertyId=${propertyId}`);
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="text-lg font-bold mb-2">{t.connections?.google_analytics_title || 'Google Analytics'}</h2>
      <input
        type="text"
        className="border px-2 py-1 rounded w-full mb-2"
        placeholder={t.connections?.property_id_placeholder || 'Property ID'}
        value={propertyId}
        onChange={e => setPropertyId(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleConnect}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? t.connections?.connecting || 'Connecting...' : t.connections?.connect || 'Connect'}
      </button>
      {status === 'success' && <div className="text-green-600 mt-2">{t.connections?.connected || 'Connected!'}</div>}
      {status === 'error' && <div className="text-red-600 mt-2">{t.connections?.error || 'Error connecting.'}</div>}
    </div>
  );
};

export default GoogleAnalyticsWidget;
