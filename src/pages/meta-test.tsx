import React from 'react';
import MetaAdsWidget from '../../../attached_assets/MetaAdsWidget';

export default function MetaTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Meta Reklam Test Sayfası</h1>
      <MetaAdsWidget language="tr" dateRange="30d" platform="meta" />
    </div>
  );
}
