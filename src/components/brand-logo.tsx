import React from 'react';
import { siShopify, siMeta, siTiktok, siGoogleanalytics } from 'simple-icons/icons';

export type BrandName = 'shopify' | 'meta' | 'tiktok' | 'googleads' | 'googleanalytics' | 'ikas';

const ICONS: Record<'shopify' | 'meta' | 'tiktok' | 'googleanalytics', { path: string; hex: string; title: string }> = {
  shopify: { path: siShopify.path, hex: `#${siShopify.hex}`, title: siShopify.title },
  meta: { path: siMeta.path, hex: `#${siMeta.hex}`, title: siMeta.title },
  tiktok: { path: siTiktok.path, hex: `#${siTiktok.hex}`, title: siTiktok.title },
  googleanalytics: { path: siGoogleanalytics.path, hex: `#${siGoogleanalytics.hex}`, title: siGoogleanalytics.title }
};

export default function BrandLogo({ name, size = 28, title, mono = false }: { name: BrandName; size?: number; title?: string; mono?: boolean }) {
  if (name === 'ikas') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={title || 'İkas'} shapeRendering="geometricPrecision">
        <path d="M21 8 10 26h11l-3 14 19-26H26l3-6z" fill="#D7FF00"/>
      </svg>
    );
  }
  if (name === 'googleads') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={title || 'Google Ads'} shapeRendering="geometricPrecision">
        <rect x="26" y="6" width="10" height="32" rx="5" fill="#4285F4" transform="rotate(30 31 22)"/>
        <rect x="12" y="6" width="10" height="32" rx="5" fill="#34A853" transform="rotate(-30 17 22)"/>
        <circle cx="14" cy="36" r="6" fill="#FBBC05"/>
      </svg>
    );
  }
  const icon = ICONS[name as keyof typeof ICONS];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={title || icon.title} shapeRendering="geometricPrecision">
      <path d={icon.path} fill={mono ? 'currentColor' : icon.hex} />
    </svg>
  );
}
