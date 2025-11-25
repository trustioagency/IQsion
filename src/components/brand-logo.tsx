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
    // İkas original logo - Green "ikas" text with distinctive styling
    return (
      <svg width={size} height={size * 0.4} viewBox="0 0 120 48" role="img" aria-label={title || 'İkas'}>
        <text x="60" y="32" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="700" fill="#00B67A" textAnchor="middle" letterSpacing="-1">
          ikas
        </text>
      </svg>
    );
  }
  if (name === 'googleads') {
    // Google Ads logo - Three colored shapes (yellow triangle, green triangle, blue pill)
    return (
      <svg width={size} height={size} viewBox="0 0 192 192" role="img" aria-label={title || 'Google Ads'}>
        {/* Yellow triangle (bottom left) */}
        <path d="M40 150 L20 120 L60 120 Z" fill="#FBBC04"/>
        {/* Green triangle (bottom center) */}
        <path d="M96 150 L76 120 L116 120 Z" fill="#34A853"/>
        {/* Blue elongated triangle/pill (top right) */}
        <path d="M155 40 L175 90 L135 90 Z" fill="#4285F4"/>
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
