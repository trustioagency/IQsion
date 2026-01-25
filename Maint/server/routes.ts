import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import admin from "./firebase";
import axios from "axios";
import { GoogleAdsApi } from 'google-ads-api';
import { ensureDatasetAndTable, insertMetrics, queryByUserAndRange, applyRetentionForUser, applyRetentionForUserAndSource, ensureGa4Tables, insertGa4Daily, insertGa4GeoDaily, getBigQuery } from "./bigquery";
import * as hubspot from "./hubspot";
// Basit fetch timeout helper
async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res as unknown as Response;
  } finally {
    clearTimeout(id);
  }
}
const router = express.Router();

// Helper: settings redirect (avoids hard-coded localhost in production)
function buildAppBase(req: express.Request) {
  // 1) Prefer explicit APP_URL (e.g., https://app.iqsion.com)
  const envApp = (process.env.APP_URL || '').trim().replace(/\/$/,'');
  if (envApp) return envApp;
  // 2) Prefer forwarded headers when behind proxy (trust proxy enabled)
  const xfProto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const xfHost = (req.headers['x-forwarded-host'] as string) || req.get('host') || '';
  const host = xfHost.replace('127.0.0.1', 'localhost');
  const isLocal = /localhost|127\.0\.0\.1/.test(host);
  if (isLocal) {
    // In dev, keep Vite’s port for SPA
    return `${req.protocol}://${host.replace(/:\d+$/, ':5173')}`;
  }
  // In prod, force https and strip any port
  return `${xfProto || 'https'}://${host.replace(/:.*/, '')}`;
}
function buildApiBase(req: express.Request) {
  const envApi = (process.env.API_URL || '').trim().replace(/\/$/, '');
  if (envApi) return envApi;
  const proto = ((req.headers['x-forwarded-proto'] as string) || req.protocol || 'https').trim();
  const host = ((req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:5001').trim();
  return `${proto}://${host}`.replace(/\/$/, '');
}

function normalizeBqDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val.slice(0, 10);
  if (typeof val === 'object') {
    const valueField = (val as any).value;
    if (typeof valueField === 'string') return valueField.slice(0, 10);
    if (typeof valueField === 'number') return String(valueField).slice(0, 10);
    if (typeof (val as any).toISOString === 'function') {
      return (val as any).toISOString().slice(0, 10);
    }
  }
  return String(val).slice(0, 10);
}

// Türkiye timezone'unda bugünün tarihini döndür (UTC+3)
function getTurkeyDate(offsetDays: number = 0): string {
  const now = new Date();
  const turkeyOffset = 3 * 60 * 60 * 1000; // UTC+3
  const turkeyNow = new Date(now.getTime() + turkeyOffset + (offsetDays * 24 * 60 * 60 * 1000));
  const year = turkeyNow.getUTCFullYear();
  const month = String(turkeyNow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(turkeyNow.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function settingsRedirect(res: express.Response, req: express.Request, platform: string, ok: boolean) {
  const base = buildAppBase(req);
  const status = ok ? 'success' : 'error';
  // SPA içi yönlendirme: window.location.replace ile döndür (callback domaini API olduğu için HTML <script> en garanti yöntem)
  return res.send(`<script>window.location.replace('${base}/settings?connection=${status}&platform=${encodeURIComponent(platform)}')</script>`);
}

// Debug endpoint: expose (masked) env presence and computed redirect URIs for OAuth flows
// Helps diagnose "client_id=undefined" veya yanlış redirect sorunları lokal & prod.
router.get('/api/auth/debug', (req, res) => {
  const host = (req.get('host') || 'localhost:5001').replace('127.0.0.1','localhost');
  const xfHost = (req.headers['x-forwarded-host'] as string) || null;
  const xfProto = (req.headers['x-forwarded-proto'] as string) || null;
  const base = buildAppBase(req);
  const mask = (v?: string) => {
    if (!v) return null;
    const raw = v.trim().replace(/^"|"$/g,'');
    if (raw.length <= 8) return raw.replace(/./g,'*');
    return raw.slice(0,4) + '...' + raw.slice(-4);
  };
  const data = {
    host,
    forwarded: { host: xfHost, proto: xfProto },
    base,
    computed: {
      googleAnalyticsRedirect: `${base}/api/auth/google/callback`,
      googleAdsRedirect: `${base}/api/auth/googleads/callback`,
      searchConsoleRedirect: `${base}/api/auth/searchconsole/callback`,
      metaRedirect: `${base}/api/auth/meta/callback`,
      shopifyRedirect: `${base}/api/auth/shopify/callback`,
      tiktokRedirect: `${base}/api/auth/tiktok/callback`,
    },
    env: {
      GOOGLE_CLIENT_ID: (process.env.GOOGLE_CLIENT_ID || '').trim() || null,
      GOOGLE_REDIRECT_URI: (process.env.GOOGLE_REDIRECT_URI || '').trim() || null,
      GOOGLE_ADS_CLIENT_ID: (process.env.GOOGLE_ADS_CLIENT_ID || '').trim() || null,
      GOOGLE_ADS_REDIRECT_URI: (process.env.GOOGLE_ADS_REDIRECT_URI || '').trim() || null,
      GOOGLE_SC_CLIENT_ID: (process.env.GOOGLE_SC_CLIENT_ID || '').trim() || null,
      GOOGLE_SC_REDIRECT: (process.env.GOOGLE_SC_REDIRECT || '').trim() || null,
      // Meta değerlerini tamamen açığa çıkarmamak için maskele
      META_APP_ID: mask(process.env.META_APP_ID),
      META_REDIRECT_URI: mask(process.env.META_REDIRECT_URI),
      SHOPIFY_API_KEY: mask(process.env.SHOPIFY_API_KEY),
      SHOPIFY_REDIRECT_URI: (process.env.SHOPIFY_REDIRECT_URI || '').trim() || null,
      TIKTOK_CLIENT_KEY: mask(process.env.TIKTOK_CLIENT_KEY),
      TIKTOK_REDIRECT_URI: (process.env.TIKTOK_REDIRECT_URI || '').trim() || null,
      CORS_ORIGINS: (process.env.CORS_ORIGINS || '').trim() || null,
      APP_URL: (process.env.APP_URL || '').trim() || null,
      NODE_ENV: process.env.NODE_ENV || null,
    },
    notes: [
      'Lokal ortamda OAuth provider ayarlarında aşağıdaki callback URLlerinin kayıtlı olduğundan emin olun.',
      'client_id=undefined sorunu genelde env dosyasının yüklenmemesi veya değişken adının paneldekiyle farklı olmasından kaynaklanır.',
      'TikTok için local testte TIKTOK_REDIRECT_URI değerini cloudflare tüneli yerine localhost kullanın.',
    ]
  };
  res.json(data);
});

// --- TikTok site verification (URL prefix) ---
// Serve a plain text file at the path TikTok expects, content from env
const TIKTOK_SITE_VERIFY_PATH = (process.env.TIKTOK_SITE_VERIFY_PATH || '/tiktok-developer-verify.txt').trim();
const TIKTOK_SITE_VERIFY_CONTENT = (process.env.TIKTOK_SITE_VERIFY_CONTENT || '').trim();
const defaultVerifyPaths = ['/tiktok-developers-site-verification.txt', '/tiktok-developer-verify.txt'];
let envVerifyPath = (process.env.TIKTOK_SITE_VERIFY_PATH || '').trim();
if (!envVerifyPath || !envVerifyPath.startsWith('/')) envVerifyPath = '';
const possibleVerifyPaths = Array.from(new Set([envVerifyPath, ...defaultVerifyPaths].filter(Boolean)));
for (const p of possibleVerifyPaths) {
  router.get(p, async (_req, res) => {
    // Load content lazily at request time to avoid import-order issues
    let content = (process.env.TIKTOK_SITE_VERIFY_CONTENT || '').trim();
    if (!content) {
      try {
        const here = path.dirname(new URL(import.meta.url).pathname);
        const candidates = [
          path.resolve(process.cwd(), 'server', 'env'),
          path.resolve(process.cwd(), 'Maint', 'server', 'env'),
          path.resolve(here, 'env'),
        ];
        for (const fp of candidates) {
          try {
            const r = dotenv.config({ path: fp });
            if (!r.error) {
              content = (process.env.TIKTOK_SITE_VERIFY_CONTENT || '').trim();
              if (content) break;
            }
          } catch {}
        }
      } catch {}
    }
    if (!content) {
      return res.status(404).type('text/plain').send('TikTok verification content not configured. Set TIKTOK_SITE_VERIFY_CONTENT in env.');
    }
    return res.type('text/plain').send(content);
  });
}

// --- AI: Chat endpoint (Gemini via REST) ---

router.post('/api/ai/chat', async (req, res) => {
  try {
    // Ensure GEMINI_API_KEY is loaded even if server wasn't restarted after env edit
    let apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      try {
        const here = path.dirname(new URL(import.meta.url).pathname);
        const candidates = [
          // when running via `npm --prefix Maint run dev`
          path.resolve(process.cwd(), 'server', 'env'),
          path.resolve(process.cwd(), 'Maint', 'server', 'env'),
          path.resolve(here, 'env'),
        ];
        for (const p of candidates) {
          const r = dotenv.config({ path: p });
          if (!r.error) break;
        }
        apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
          for (const p of candidates) {
            try {
              const txt = fs.readFileSync(p, 'utf-8');
              const line = txt.split(/\r?\n/).find(l => /^\s*GEMINI_API_KEY\s*=/.test(l) && !/^\s*#/.test(l));
              if (line) {
                const val = line.split('=')[1]?.trim()?.replace(/^"|"$/g, '');
                if (val) { apiKey = val; break; }
              }
            } catch (_) {}
          }
        }
      } catch (_) {}
    }
  const { message, context, debug: bodyDebug } = (req.body || {}) as { message?: string; context?: string; debug?: any };
  const isDebug = String((req.query as any)?.debug || bodyDebug || '') === '1' && process.env.NODE_ENV !== 'production';
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    // Fallback when API key is missing: return a helpful dev-mode reply
    if (!apiKey) {
      const fallback = `Dev mode yanıtı: Henüz gerçek bir AI anahtarı yapılandırılmadı. (GEMINI_API_KEY)` +
        `\n\nSorduğunuz: "${message}"` +
        (context ? `\nBağlam: ${context}` : '') +
        `\n\nKurulum: Maint/server/env dosyasına GEMINI_API_KEY ekleyin ve sunucuyu yeniden başlatın.`;
      return res.json({ response: fallback });
    }

    const systemPrompt = [
      'You are IQsion AI, a marketing analytics copilot for SMEs.',
      'Answer briefly, in clear Turkish when the user is Turkish, otherwise English.',
      'Use practical marketing language, give concrete next actions when helpful.',
      'If metrics are needed, remind the user you can analyze the dashboard data on request.',
    ].join(' ');

    const userPrompt = [
      context ? `Bağlam: ${context}` : '',
      `Kullanıcı mesajı: ${message}`,
    ].filter(Boolean).join('\n');

    // Helper to call a given model and parse text
    const callModel = async (model: string) => {
      const body = {
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 512,
        },
      } as any;
      // Try v1, then v1beta for compatibility
      const tryOnce = async (version: 'v1' | 'v1beta') => {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const r = await fetchWithTimeout(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, 15000);
        const j = await (r.json() as Promise<any>);
        return { r, j };
      };
      let { r, j } = await tryOnce('v1');
      if (!r.ok && r.status === 404) {
        ({ r, j } = await tryOnce('v1beta'));
      }
      if (!r.ok) {
        const msg = j?.error?.message || 'Gemini API error';
        if (process.env.NODE_ENV !== 'production') {
          console.error('[AI CHAT GEMINI ERROR]', model, r.status, msg);
        }
        return { ok: false as const, status: r.status, error: msg, raw: j };
      }
      // Collect text parts, guard different shapes
      const candidate = (j?.candidates && j.candidates[0]) || null;
      const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
      const texts = parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).filter(Boolean);
      const text = texts.join('\n').trim();
      const blocked = j?.promptFeedback?.blockReason || candidate?.safetyRatings?.[0]?.blockedReason || candidate?.finishReason;
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AI CHAT DEBUG]', model, {
          hasText: Boolean(text),
          finishReason: candidate?.finishReason || null,
          blockReason: j?.promptFeedback?.blockReason || null,
        });
      }
      return { ok: true as const, text, blocked, raw: j };
    };

    // Try flash first, then pro as a fallback if empty/blocked
    const primary = await callModel('gemini-2.0-flash-001');
    if (primary.ok && primary.text) {
      if (isDebug) {
        const dbg = { model: 'gemini-2.0-flash', finishReason: (primary as any)?.raw?.candidates?.[0]?.finishReason || null };
        return res.json({ response: primary.text, _debug: dbg });
      }
      return res.json({ response: primary.text });
    }
    // If blocked or empty, try a more capable model
  const secondary = await callModel('gemini-2.5-pro');
    if (secondary.ok && secondary.text) {
      if (isDebug) {
        const dbg = { model: 'gemini-2.5-pro', finishReason: (secondary as any)?.raw?.candidates?.[0]?.finishReason || null };
        return res.json({ response: secondary.text, _debug: dbg });
      }
      return res.json({ response: secondary.text });
    }

    // If Gemini is unavailable or not enabled, optionally fallback to OpenAI if key exists
    const openaiKey = process.env.OPENAI_API_KEY || '';
    if (openaiKey) {
      try {
        const oaBody = {
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 512,
        } as any;
        const oaRes = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify(oaBody),
        }, 15000);
        const oaJson: any = await oaRes.json();
        if (oaRes.ok) {
          const txt = String(oaJson?.choices?.[0]?.message?.content || '').trim();
          if (txt) {
            if (isDebug) return res.json({ response: txt, _debug: { model: oaBody.model, provider: 'openai' } });
            return res.json({ response: txt });
          }
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[AI CHAT OPENAI ERROR]', oaRes.status, oaJson);
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[AI CHAT OPENAI EXCEPTION]', (e as any)?.message || String(e));
        }
      }
    }
    // If the API returns NOT_FOUND for models, the Generative Language API is likely not enabled for this key/project
    const notFound = (err: any) => typeof err?.status === 'number' && err.status === 404;
    if (!primary.ok && notFound(primary) || !secondary.ok && notFound(secondary)) {
      const hint = 'AI modeli bu proje için etkin değil. Lütfen Google Cloud Console > APIs & Services bölümünden "Generative Language API"yi etkinleştirin ve bu API için bir API anahtarı oluşturun.';
      const payload: any = { response: hint };
      if (isDebug) payload._debug = { primary: (primary as any)?.raw || null, secondary: (secondary as any)?.raw || null };
      return res.json(payload);
    }
    const blocked = (primary as any)?.blocked || (secondary as any)?.blocked;
    if (blocked) {
      const payload: any = { response: `İçerik üretimi tamamlanamadı (${blocked}). Lütfen isteği daha nötr/iş odaklı ve kısa şekilde yeniden ifade edin.` };
      if (isDebug) payload._debug = { blocked };
      return res.json(payload);
    }
    if (process.env.NODE_ENV !== 'production') {
      const sniff = (obj: any) => {
        try { return JSON.stringify(obj).slice(0, 600); } catch { return String(obj); }
      };
      console.warn('[AI CHAT] Empty response from Gemini (both models). flash=', sniff((primary as any)?.raw), ' pro=', sniff((secondary as any)?.raw));
    }
    // If 404 model not found, surface a clear enablement hint for the user
    const pErr = (primary as any)?.raw?.error?.status || (secondary as any)?.raw?.error?.status;
    const pCode = (primary as any)?.raw?.error?.code || (secondary as any)?.raw?.error?.code;
    if (pCode === 404 || pErr === 'NOT_FOUND') {
      return res.json({ response: 'AI modeli bu proje için etkin değil. Lütfen Google Cloud Console > APIs & Services bölümünden "Generative Language API"yi etkinleştirin ve bu API için bir API anahtarı oluşturun.' });
    }
    const payload: any = { response: 'Üzgünüm, şu an yanıt üretemedim. Lütfen mesajınızı biraz daha net ve kısa yazın (örn: “ROAS nedir, 1 cümle?”).' };
    if (isDebug) payload._debug = { flash: (primary as any)?.raw || null, pro: (secondary as any)?.raw || null };
    return res.json(payload);
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error('[AI CHAT ERROR]', msg);
    return res.status(500).json({ message: 'AI chat failed', error: msg });
  }
});

// --- Onboarding + Pixel Tracking ---
// Generate a unique pixel for the user (idempotent)
router.post('/api/pixel/create', async (req, res) => {
  try {
    let userUid: any = req.headers['x-user-uid'] || req.query.userId;
    if (Array.isArray(userUid)) userUid = userUid[0];
    const uid = typeof userUid === 'string' && userUid.length > 0 ? userUid : 'test-user';
    const existing = (await admin.database().ref(`pixels/${uid}`).once('value')).val();
    if (existing?.pixelId) {
      return res.json({ pixelId: existing.pixelId, createdAt: existing.createdAt, lastSeenAt: existing.lastSeenAt || null, scriptUrl: `${process.env.APP_URL || ''}/p.js?pid=${existing.pixelId}` });
    }
    const pixelId = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
    const createdAt = Date.now();
    await admin.database().ref(`pixels/${uid}`).set({ pixelId, createdAt, lastSeenAt: null });
    await admin.database().ref(`pixelMap/${pixelId}`).set({ uid });
    return res.json({ pixelId, createdAt, lastSeenAt: null, scriptUrl: `${process.env.APP_URL || ''}/p.js?pid=${pixelId}` });
  } catch (err) {
    return res.status(500).json({ message: 'Pixel oluşturulamadı', error: err instanceof Error ? err.message : String(err) });
  }
});

// Pixel status for onboarding UI
router.get('/api/pixel/status', async (req, res) => {
  try {
    let userUid: any = req.headers['x-user-uid'] || req.query.userId;
    if (Array.isArray(userUid)) userUid = userUid[0];
    const uid = typeof userUid === 'string' && userUid.length > 0 ? userUid : 'test-user';
    const p = (await admin.database().ref(`pixels/${uid}`).once('value')).val();
    if (!p) return res.json({ hasPixel: false });
    return res.json({ hasPixel: true, pixelId: p.pixelId, lastSeenAt: p.lastSeenAt || null, scriptUrl: `${process.env.APP_URL || ''}/p.js?pid=${p.pixelId}` });
  } catch (err) {
    return res.status(500).json({ message: 'Pixel durumu alınamadı', error: err instanceof Error ? err.message : String(err) });
  }
});

// Onboarding status: connections, pixel, profile
router.get('/api/onboarding/status', async (req, res) => {
  try {
    let userUid: any = req.headers['x-user-uid'] || req.query.userId;
    if (Array.isArray(userUid)) userUid = userUid[0];
    const uid = typeof userUid === 'string' && userUid.length > 0 ? userUid : 'test-user';
    const connectionsSnap = await admin.database().ref(`platformConnections/${uid}`).once('value');
    const connections = connectionsSnap.val() || {};
    const pixel = (await admin.database().ref(`pixels/${uid}`).once('value')).val() || null;
    const profile = (await admin.database().ref(`brandProfiles/${uid}`).once('value')).val() || {};
    const status = {
      connections: {
        shopify: !!connections.shopify?.isConnected,
        google_analytics: !!connections.google_analytics?.accessToken,
        meta_ads: !!connections.meta_ads?.isConnected,
        google_ads: !!connections.google_ads?.isConnected,
      },
      pixel: {
        hasPixel: !!pixel?.pixelId,
        lastSeenAt: pixel?.lastSeenAt || null,
      },
      profile: {
        hasProfile: Boolean(profile?.industry || profile?.companyName || profile?.companySize),
      }
    };
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ message: 'Onboarding durumu alınamadı', error: err instanceof Error ? err.message : String(err) });
  }
});

// Tracking script (public)
router.get('/p.js', async (req, res) => {
  const pid = String(req.query.pid || '').trim();
  if (!pid) return res.status(400).type('text/plain').send('/* missing pid */');
  const appUrl = process.env.APP_URL || `${req.protocol}://${(req.get('host') || '').replace('127.0.0.1','localhost')}`;
  const js = `(()=>{try{const pid='${pid}';const u='${appUrl}';const send=e=>{const i=new Image();const p=new URL(u+'/c.gif');Object.entries(e).forEach(([k,v])=>p.searchParams.set(k, String(v)));i.src=p.toString();};
  const ev={pid, e:'pv', url:location.href, ref:document.referrer, tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'', ts:Date.now()};
  send(ev);
  window.IQsionPixel={track:(name,props)=>send({pid,e:name,...(props||{}),url:location.href,ts:Date.now()})};
}catch(e){}})();`;
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  return res.send(js);
});

// Collector 1x1 gif
router.get('/c.gif', async (req, res) => {
  try {
    const pid = String(req.query.pid || '').trim();
    if (!pid) return res.status(400).end();
    const mapSnap = await admin.database().ref(`pixelMap/${pid}`).once('value');
    const map = mapSnap.val();
    const uid = map?.uid;
    if (!uid) return res.status(404).end();
    const now = Date.now();
    const payload = {
      pid,
      e: String(req.query.e || 'pv'),
      url: String(req.query.url || ''),
      ref: String(req.query.ref || ''),
      tz: String(req.query.tz || ''),
      ua: req.get('user-agent') || '',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      ts: Number(req.query.ts || now),
    };
    await admin.database().ref(`rawEvents/${uid}`).push(payload);
    await admin.database().ref(`pixels/${uid}`).update({ lastSeenAt: now });
  } catch (_) {
    // swallow errors for collector
  } finally {
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.end(gif);
  }
});

// --- Attribution: KPI-based sources ranking ---
// GET /api/attribution/sources?kpi=traffic|revenue|profit&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&userId=...
router.get('/api/attribution/sources', async (req, res) => {
  try {
    const kpi = typeof req.query.kpi === 'string' ? req.query.kpi : 'traffic';
    const userId = (typeof req.query.userId === 'string' && req.query.userId) ? req.query.userId : 'test-user';
    // Default: last 30 days ending yesterday
    const today = new Date();
    const endD = new Date(today); endD.setDate(today.getDate() - 1);
    const startD = new Date(endD); startD.setDate(endD.getDate() - 29);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : fmt(startD);
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : fmt(endD);

    const baseProto = req.protocol || 'http';
    const host = (req.get('host') || 'localhost:5001').replace('127.0.0.1', 'localhost');
    const baseUrl = `${baseProto}://${host}`;
    // Helper to normalize referrers to channels
    const normalizeChannel = (ref: string | null | undefined, sourceName?: string | null): string => {
      const s = (String(ref || '').toLowerCase());
      const src = String(sourceName || '').toLowerCase();
      if (/google|gclid|utm_source=google/.test(s) || src.includes('google')) return 'google';
      if (/facebook|instagram|fb|meta|utm_source=facebook|utm_source=instagram/.test(s) || src.includes('facebook') || src.includes('instagram') || src.includes('meta')) return 'meta';
      if (/tiktok|utm_source=tiktok/.test(s) || src.includes('tiktok')) return 'tiktok';
      if (/mail|email|utm_source=email|utm_medium=email/.test(s) || src.includes('email')) return 'email';
      if (!s || s === 'null') return 'direct';
      if (/organic|utm_medium=organic|utm_source=organic/.test(s)) return 'organic';
      // Fallbacks
      if (/ref|utm_source=referral/.test(s)) return 'referral';
      return 'other';
    };

    if (kpi === 'traffic') {
      // Ensure GA connection exists
      const gaSnap = await admin.database().ref(`platformConnections/${userId}/google_analytics`).once('value');
      const gaConn = gaSnap.val();
      if (!gaConn || !gaConn.accessToken) {
        return res.json({ kpi: 'traffic', startDate, endDate, total: 0, sources: [], note: 'Google Analytics bağlantısı bulunamadı.' });
      }
      // Query GA summary per channel and rank by sessions
      const channels = ['google', 'meta', 'tiktok', 'email', 'organic'];
      const results: Array<{ channel: string; value: number }> = [];
      for (const ch of channels) {
        try {
          const qs = `userId=${encodeURIComponent(userId)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&channel=${encodeURIComponent(ch)}`;
          const r = await fetchWithTimeout(`${baseUrl}/api/analytics/summary?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000);
          if (r.ok) {
            const j: any = await r.json();
            const sessions = Number(j?.totals?.sessions || 0);
            results.push({ channel: ch, value: sessions });
          } else {
            results.push({ channel: ch, value: 0 });
          }
        } catch (_) {
          results.push({ channel: ch, value: 0 });
        }
      }
      const total = results.reduce((a, b) => a + b.value, 0);
      if (total === 0) {
        return res.json({ kpi: 'traffic', startDate, endDate, total: 0, sources: [], note: 'Seçilen aralıkta trafik verisi bulunamadı veya yetki yok.' });
      }
      const ranked = results
        .map(r => ({ ...r, share: Number(((r.value / total) * 100).toFixed(2)) }))
        .sort((a, b) => b.value - a.value);

      // Derive simple journeys from top channels
      const top = ranked.slice(0, 3);
      const toJourney = (ch: string) => {
        const base = [{ key: 'website' }];
        if (ch === 'google') return [{ key: 'google' }, ...base, { key: 'purchase' }];
        if (ch === 'meta') return [{ key: 'instagram' }, ...base, { key: 'purchase' }];
        if (ch === 'tiktok') return [{ key: 'tiktok' }, ...base, { key: 'purchase' }];
        if (ch === 'email') return [{ key: 'email' }, ...base, { key: 'purchase' }];
        if (ch === 'organic') return [{ key: 'organic' }, ...base, { key: 'purchase' }];
        return [{ key: ch }, ...base, { key: 'purchase' }];
      };
      const journeys = top.map(t => ({ percentage: t.share, steps: toJourney(t.channel) }));

      return res.json({ kpi: 'traffic', startDate, endDate, total, sources: ranked, journeys });
    }

    // revenue and profit need Shopify orders by referrer/source
    // Load Shopify connection
    const shopSnap = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const shopConn = shopSnap.val();
    if (!shopConn?.storeUrl || !shopConn?.accessToken) {
      return res.json({ kpi, startDate, endDate, sources: [], total: 0, note: 'Shopify bağlantısı bulunamadı.' });
    }

    // Fetch orders in range with necessary fields
    const base = `https://${shopConn.storeUrl}/admin/api/2025-01/orders.json`;
    const params = new URLSearchParams();
    params.set('status', 'any');
    params.set('limit', '250');
    params.set('created_at_min', `${startDate}T00:00:00Z`);
    params.set('created_at_max', `${endDate}T23:59:59Z`);
    // include fields with referrer info
    // Note: not all fields are filterable; we fetch full objects in chunks via pagination
    let nextUrl: string | null = `${base}?${params.toString()}`;
    const orders: any[] = [];
    let safety = 0;
    while (nextUrl && safety < 50) {
      safety++;
      const r = await fetchWithTimeout(nextUrl, { method: 'GET', headers: { 'X-Shopify-Access-Token': shopConn.accessToken, 'Content-Type': 'application/json' } }, 20000);
      const j: any = await r.json();
      if (!r.ok) break;
      const chunk: any[] = j?.orders || [];
      orders.push(...chunk);
      const link = (r as any).headers?.get ? (r as any).headers.get('link') : undefined;
      if (link && /<([^>]+)>; rel="next"/i.test(link)) {
        const m = link.match(/<([^>]+)>; rel="next"/i);
        nextUrl = m ? m[1] : null;
      } else {
        nextUrl = null;
      }
    }

    // Aggregate revenue and counts by channel from referring_site/source_name
    const byChannel: Record<string, { revenue: number; orders: number } > = {};
    let totalRevenue = 0;
    for (const o of orders) {
      if (o?.cancelled_at) continue;
      const fs = String(o?.financial_status || '').toLowerCase();
      const isPaid = ['paid','partially_paid','partially_refunded'].includes(fs);
      // For revenue: include non-cancelled orders; if you prefer only paid, set isPaid
      const price = Number.parseFloat(String(o?.total_price || o?.subtotal_price || '0')) || 0;
      const ref = o?.referring_site || o?.landing_site || '';
      const ch = normalizeChannel(ref, o?.source_name);
      if (!byChannel[ch]) byChannel[ch] = { revenue: 0, orders: 0 };
      byChannel[ch].revenue += price;
      byChannel[ch].orders += 1;
      totalRevenue += price;
    }

    // If profit requested, fetch ad spend per major channel
    let spendBy: Record<string, number> = { google: 0, meta: 0, tiktok: 0 };
    if (kpi === 'profit') {
      try {
        const qs = `userId=${encodeURIComponent(userId)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
        const [metaRes, gadsRes] = await Promise.allSettled([
          fetchWithTimeout(`${baseUrl}/api/meta/summary-bq?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
          fetchWithTimeout(`${baseUrl}/api/googleads/summary-bq?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
        ]);
        const extractSpend = async (r: any) => {
          if (r.status !== 'fulfilled') return 0;
          const res = r.value as Response;
          if (!res.ok) return 0;
          const j: any = await res.json();
          return Number(j?.totals?.spend || 0);
        };
        spendBy.meta = await extractSpend(metaRes);
        spendBy.google = await extractSpend(gadsRes);
      } catch (_) {}
    }

    const sources = Object.entries(byChannel).map(([channel, val]) => {
      const revenue = Number(val.revenue.toFixed(2));
      const spend = kpi === 'profit' ? (spendBy[channel as keyof typeof spendBy] || 0) : 0;
      const profitApprox = revenue - spend;
      const value = kpi === 'revenue' ? revenue : profitApprox;
      return { channel, revenue, orders: val.orders, spend, value };
    }).sort((a, b) => b.value - a.value);

    const total = kpi === 'revenue' ? totalRevenue : sources.reduce((a, s) => a + s.value, 0);
    const ranked = sources.map(s => ({ ...s, share: total > 0 ? Number(((s.value / total) * 100).toFixed(2)) : 0 }));

    // Derive simple journeys from top contributors
    const top = ranked.slice(0, 3);
    const toJourney = (ch: string) => {
      const base = [{ key: 'website' }];
      if (ch === 'google') return [{ key: 'google' }, ...base, { key: 'purchase' }];
      if (ch === 'meta') return [{ key: 'instagram' }, ...base, { key: 'purchase' }];
      if (ch === 'tiktok') return [{ key: 'tiktok' }, ...base, { key: 'purchase' }];
      if (ch === 'email') return [{ key: 'email' }, ...base, { key: 'purchase' }];
      if (ch === 'organic') return [{ key: 'organic' }, ...base, { key: 'purchase' }];
      return [{ key: ch }, ...base, { key: 'purchase' }];
    };
    const journeys = top.map(t => ({ percentage: t.share, steps: toJourney(t.channel) }));

    const note = kpi === 'profit' ? 'Kar yaklaşık hesaplandı (COGS dahil değildir). Dilerseniz COGS ile detaylandırılabilir.' : undefined;
    return res.json({ kpi, startDate, endDate, total, sources: ranked, journeys, note });
  } catch (error) {
    console.error('[ATTRIBUTION SOURCES ERROR]', error);
    return res.status(500).json({ message: 'Atıflandırma kaynakları hesaplanamadı', error: String(error) });
  }
});

// Kullanıcı bilgisi döndüren endpoint
router.get('/api/auth/user', async (req, res) => {
  // userUid frontend'den header veya query ile gelmeli
  let userUid = req.headers['x-user-uid'] || req.query.uid;
  if (Array.isArray(userUid)) userUid = userUid[0];
  if (!userUid || typeof userUid !== 'string') {
    return res.status(401).json({ message: 'Kullanıcı oturumu yok.' });
  }
  try {
    // Demo/test UID için örnek kullanıcı döndür
    if (userUid === 'demo-uid-123') {
      return res.json({
        uid: 'demo-uid-123',
        email: 'demo@demo.com',
        firstName: 'Demo',
        lastName: 'Kullanıcı',
        companyName: 'Demo Şirketi',
        profileImageUrl: '',
      });
    }
    const userRecord = await admin.auth().getUser(userUid);
    const userDataSnap = await admin.database().ref(`users/${userUid}`).once('value');
    const userData = userDataSnap.val();
    // Google ile girişte isim ve görsel userRecord'dan alınır
    const firstName = userRecord.displayName?.split(' ')[0] || userData?.firstName || '';
    const lastName = userRecord.displayName?.split(' ').slice(1).join(' ') || userData?.lastName || '';
    const profileImageUrl = userRecord.photoURL || userData?.profileImageUrl || '';
    return res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      firstName,
      lastName,
      companyName: userData?.companyName || '',
      profileImageUrl,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Kullanıcı bulunamadı.' });
  }
});

// Test kullanıcı endpointi: useAuth test modunda bunu çağırır
router.get('/api/auth/test-user', async (_req, res) => {
  return res.json({
    uid: 'demo-uid-123',
    email: 'demo@demo.com',
    firstName: 'Demo',
    lastName: 'Kullanıcı',
    companyName: 'Demo Şirketi',
    profileImageUrl: '',
  });
});

// Test endpoint: Router ve Express çalışıyor mu?
router.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor' });
});

// Marka profili oku
router.get('/api/brand-profile', async (req, res) => {
  try {
    let userUid: any = req.headers['x-user-uid'] || req.query.userId;
    if (Array.isArray(userUid)) userUid = userUid[0];
    const uid = typeof userUid === 'string' && userUid.length > 0 ? userUid : 'test-user';
    const snap = await admin.database().ref(`brandProfiles/${uid}`).once('value');
    const data = snap.val() || {};
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Brand profile alınamadı', error: err instanceof Error ? err.message : String(err) });
  }
});

// Marka profili güncelle
router.post('/api/brand-profile', async (req, res) => {
  try {
    let userUid: any = req.headers['x-user-uid'] || req.query.userId;
    if (Array.isArray(userUid)) userUid = userUid[0];
    const uid = typeof userUid === 'string' && userUid.length > 0 ? userUid : 'test-user';
    const payload = req.body || {};
    await admin.database().ref(`brandProfiles/${uid}`).update({
      ...payload,
      updatedAt: Date.now(),
    });
    const snap = await admin.database().ref(`brandProfiles/${uid}`).once('value');
    return res.json(snap.val() || {});
  } catch (err) {
    return res.status(500).json({ message: 'Brand profile güncellenemedi', error: err instanceof Error ? err.message : String(err) });
  }
});

// (tekrar) kaldırıldı
// (tekrar) kaldırıldı
// const router = express.Router();
// (tekrar) kaldırıldı

// Manuel hesap oluşturma (signup) endpointi
router.post('/api/auth/signup', async (req, res) => {
  console.log('[SIGNUP ENDPOINT] İstek geldi:', req.method, req.url);
  const { email, password, firstName, lastName, companyName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-posta ve şifre zorunlu.' });
  }
  try {
    // Firebase ile kullanıcı oluştur
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName || ''} ${lastName || ''}`.trim(),
    });
    // Ek profil bilgilerini ve şifreyi test ortamı için veritabanına kaydet
    await admin.database().ref(`users/${userRecord.uid}`).set({
      email,
      password,
      firstName,
      lastName,
      companyName,
      createdAt: Date.now(),
    });
    return res.json({ message: 'Kayıt başarılı', uid: userRecord.uid });
  } catch (error) {
    console.error('[SIGNUP ERROR]', error);
    return res.status(500).json({ message: 'Kayıt başarısız', error: error instanceof Error ? error.message : String(error) });
  }
});

// Manuel login endpointi
router.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-posta ve şifre zorunlu.' });
  }
  const isDev = process.env.NODE_ENV !== 'production';
  try {
    let userRecord: any | null = null;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (e: any) {
      const code = (e?.code || '').toString();
      // Lokal geliştirmeyi hızlandırmak için: kullanıcı yoksa otomatik oluştur (yalnızca development)
      if (isDev && code.includes('auth/user-not-found')) {
        userRecord = await admin.auth().createUser({ email, password, displayName: '' });
        await admin.database().ref(`users/${userRecord.uid}`).set({ email, password, createdAt: Date.now() });
      } else {
        throw e;
      }
    }

    // Şifre kontrolü (yalnız dev amaçlı basit kontrol). Prod için gerçek Auth REST akışı önerilir.
    const uid = userRecord.uid as string;
    const snap = await admin.database().ref(`users/${uid}`).once('value');
    let userData = snap.val();
    if (!userData || userData.password !== password) {
      if (isDev) {
        // Lokal uyum için şifre kaydını otomatik düzelt
        await admin.database().ref(`users/${uid}`).update({ email, password, updatedAt: Date.now() });
        userData = { email, password };
      } else {
        return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
      }
    }
    return res.json({ message: 'Giriş başarılı', uid });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    // ADC eksik ise yol gösterici mesaj
    const hint = (error instanceof Error && /project/i.test(error.message) && /credentials|projectId|initializeApp/i.test(error.message))
      ? 'Lokal için Firebase Admin kimlik bilgilerini ayarlayın: GOOGLE_APPLICATION_CREDENTIALS veya `gcloud auth application-default login`'
      : undefined;
    return res.status(401).json({ message: 'Giriş başarısız', error: error instanceof Error ? error.message : String(error), hint });
  }
});






// (tekrar) kaldırıldı
// (tekrar) kaldırıldı
// const router = express.Router();

// (tekrar) kaldırıldı
// Shopify OAuth başlatma endpointi
router.get('/api/auth/shopify/connect', (req, res) => {
  let storeUrl = (req.query.storeUrl as string) || '';
  const userId = (req.query.userId as string) || 'test-user';
  // read_all_orders: 60 günden eski siparişleri de okuyabilmek için
  const scopes = 'read_orders,read_all_orders,read_products,read_customers';
  // Normalize host and compute redirect dynamically to avoid port mismatches in local (e.g., 5000 vs 5001)
  const rawHost = req.get('host') || 'localhost:5001';
  const normalizedHost = rawHost.replace('127.0.0.1', 'localhost');
  const computedRedirect = `${buildAppBase(req)}/api/auth/shopify/callback`;
  const redirectEnv = (process.env.SHOPIFY_REDIRECT_URI || '').trim();
  const redirectUri = /localhost:5000|127\.0\.0\.1:5000/.test(redirectEnv) ? computedRedirect : ((redirectEnv || computedRedirect)).trim();
  // Normalize storeUrl: allow 'mystore' or 'mystore.myshopify.com', strip protocol
  storeUrl = (storeUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/\.myshopify\.com$/i.test(storeUrl)) {
    storeUrl = `${storeUrl}.myshopify.com`;
  }
  console.log('[SHOPIFY CONNECT]', {
    storeUrl,
    rawHost,
    normalizedHost,
    redirectEnv,
    computedRedirect,
    usingRedirect: redirectUri,
    userId,
  });
  const shopifyKey = (process.env.SHOPIFY_API_KEY || '').trim();
  const authUrl = `https://${storeUrl}/admin/oauth/authorize?client_id=${shopifyKey}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(userId)}`;
  res.redirect(authUrl);
});

// Shopify OAuth callback endpointi
router.get('/api/auth/shopify/callback', async (req, res) => {
  const { code, hmac, shop, state } = req.query;
  if (!code || !shop) return res.status(400).send('Eksik parametre');
  try {
    // Access token al
    const tokenRes = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: (process.env.SHOPIFY_API_KEY || '').trim(),
      client_secret: (process.env.SHOPIFY_API_SECRET || '').trim(),
      code,
    });
    const accessToken = tokenRes.data.access_token;
    // Hedef kullanıcı: state (uid) yoksa query'den al, yoksa 'test-user'
    const stateUid = typeof state === 'string' && state.length ? state : (typeof req.query.userId === 'string' ? req.query.userId : 'test-user');
    // Tokenı ve mağaza adresini veritabanına kaydet (update ile mevcut alanları koru)
    await admin.database().ref(`platformConnections/${stateUid}/shopify`).update({
      storeUrl: shop,
      accessToken,
      isConnected: true,
      updatedAt: new Date().toISOString(),
      ...(Date.now() ? { createdAt: Date.now() } : {}),
    });
    
    // Fire-and-forget initial BigQuery ingest
    try {
      const adminKey = (process.env.ADMIN_API_KEY || '').trim();
      if (adminKey) {
        const ingestBase = buildApiBase(req);
        const settingsSnap = await admin.database().ref(`settings/${stateUid}`).once('value');
        const settings = settingsSnap.val() || {};
        const ingestDays = Number(settings.initialIngestDays || 30);
        
        const today = new Date();
        const endD = new Date(today); endD.setDate(today.getDate() - 1);
        const startD = new Date(endD); startD.setDate(endD.getDate() - (ingestDays - 1));
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        const body = JSON.stringify({ userId: stateUid, from: fmt(startD), to: fmt(endD) });
        fetchWithTimeout(`${ingestBase}/api/ingest/shopify`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body }, 10000).catch(()=>{});
      }
    } catch (err) {
      console.error('[Shopify CALLBACK] initial ingest failed:', err);
    }
    
    // Kullanıcıyı ayarlar sayfasına yönlendir
    return settingsRedirect(res, req, 'shopify', true);
  } catch (err) {
  return settingsRedirect(res, req, 'shopify', false);
  }
});

// Shopify ürünleri çekme endpointi
// Shopify ürünleri çekme endpointi (maliyet ile birlikte)
router.get('/api/shopify/products', async (req, res) => {
  try {
    const userId = req.query.userId || 'test-user';
    const snapshot = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const shopifyConn = snapshot.val();
    if (!shopifyConn || !shopifyConn.storeUrl) {
      return res.status(400).json({ error: 'Shopify mağaza adresi bulunamadı.' });
    }
    const storeUrl = shopifyConn.storeUrl;
    const accessToken = shopifyConn.accessToken;
    if (!accessToken) {
      return res.status(400).json({ error: 'Shopify access token bulunamadı.' });
    }
    // Shopify ürünlerini çek (güncel API versiyonu)
    const response = await axios.get(`https://${storeUrl}/admin/api/2025-01/products.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    const products = response.data.products || [];
    // Tüm varyantların inventory_item_id'lerini toplayıp cost bilgilerini çek
    const allInventoryItemIds: Array<string | number> = [];
    for (const p of products) {
      const variants = Array.isArray(p?.variants) ? p.variants : [];
      for (const v of variants) {
        if (v && (v.inventory_item_id !== undefined && v.inventory_item_id !== null)) {
          allInventoryItemIds.push(v.inventory_item_id);
        }
      }
    }
    const uniqueIds = Array.from(new Set(allInventoryItemIds.map(String)));
    const chunk = <T,>(arr: T[], size = 250): T[][] => {
      const out: T[][] = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };
    const idChunks = chunk(uniqueIds, 250);
    const invCostMap: Record<string, number> = {};
    for (const ch of idChunks) {
      if (!ch.length) continue;
      const invRes = await axios.get(`https://${storeUrl}/admin/api/2025-01/inventory_items.json`, {
        params: { ids: ch.join(',') },
        headers: { 'X-Shopify-Access-Token': accessToken }
      });
      const items = invRes.data?.inventory_items || [];
      for (const it of items) {
        const idStr = String(it.id);
        const costNum = Number(it.cost);
        if (Number.isFinite(costNum) && costNum > 0) {
          invCostMap[idStr] = costNum;
        }
      }
    }
    // Firebase'den maliyetleri çek
    const costsSnap = await admin.database().ref(`shopifyProductCosts/${userId}`).once('value');
    const costs = costsSnap.val() || {};
    // Her ürüne cost ekle: önce Shopify inventory cost'larından türet, yoksa manuel kayıtlı cost'u kullan
    const productsWithCost = products.map((p: any) => {
      const variants = Array.isArray(p?.variants) ? p.variants : [];
      const variantCosts: number[] = [];
      for (const v of variants) {
        const idStr = String(v?.inventory_item_id ?? '');
        const c = idStr ? invCostMap[idStr] : undefined;
        if (typeof c === 'number' && Number.isFinite(c) && c > 0) variantCosts.push(c);
      }
      const shopifyAvgCost = variantCosts.length ? (variantCosts.reduce((a, b) => a + b, 0) / variantCosts.length) : undefined;
      const manualCostRaw = costs[p.id];
      const manualCost = manualCostRaw !== undefined && manualCostRaw !== null && String(manualCostRaw).length > 0 ? manualCostRaw : "";
      const hasShopifyCost = typeof shopifyAvgCost === 'number' && Number.isFinite(shopifyAvgCost) && shopifyAvgCost > 0;
      return {
        ...p,
        cost: hasShopifyCost ? Number(shopifyAvgCost.toFixed(2)) : manualCost,
        costSource: hasShopifyCost ? 'shopify' : (manualCost ? 'manual' : undefined),
      };
    });
    res.json({ products: productsWithCost });
  } catch (error: any) {
    const msg = error?.response?.data || (error instanceof Error ? error.message : String(error));
    console.error('[SHOPIFY PRODUCTS ERROR]', msg);
    res.status(500).json({ error: 'Shopify ürünleri alınamadı', details: msg });
  }
});

// Shopify ürün maliyeti kaydetme endpointi
router.post('/api/shopify/products/:id/cost', async (req, res) => {
  try {
    const userId = req.query.userId || 'test-user';
    const productId = req.params.id;
    const { cost } = req.body;
    if (!productId) return res.status(400).json({ error: 'Ürün ID eksik.' });
    await admin.database().ref(`shopifyProductCosts/${userId}/${productId}`).set(cost);
    res.json({ success: true, productId, cost });
  } catch (error) {
    res.status(500).json({ error: 'Maliyet kaydedilemedi', details: error instanceof Error ? error.message : String(error) });
  }
});

// Shopify siparişleri çekme endpointi
router.get('/api/shopify/orders', async (req, res) => {
  try {
    const userId = req.query.userId || 'test-user';
    const snapshot = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const shopifyConn = snapshot.val();
    if (!shopifyConn || !shopifyConn.storeUrl) {
      return res.status(400).json({ error: 'Shopify mağaza adresi bulunamadı.' });
    }
    const storeUrl = shopifyConn.storeUrl;
    const accessToken = shopifyConn.accessToken;
    if (!accessToken) {
      return res.status(400).json({ error: 'Shopify access token bulunamadı.' });
    }
    const response = await axios.get(`https://${storeUrl}/admin/api/2025-01/orders.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    res.json(response.data);
  } catch (error: any) {
    const msg = error?.response?.data || (error instanceof Error ? error.message : String(error));
    console.error('[SHOPIFY ORDERS ERROR]', msg);
    res.status(500).json({ error: 'Shopify siparişleri alınamadı', details: msg });
  }
});

// Shopify müşterileri çekme endpointi
router.get('/api/shopify/customers', async (req, res) => {
  try {
    const userId = req.query.userId || 'test-user';
    const snapshot = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const shopifyConn = snapshot.val();
    if (!shopifyConn || !shopifyConn.storeUrl) {
      return res.status(400).json({ error: 'Shopify mağaza adresi bulunamadı.' });
    }
    const storeUrl = shopifyConn.storeUrl;
    const accessToken = shopifyConn.accessToken;
    if (!accessToken) {
      return res.status(400).json({ error: 'Shopify access token bulunamadı.' });
    }
    const response = await axios.get(`https://${storeUrl}/admin/api/2025-01/customers.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    res.json(response.data);
  } catch (error: any) {
    const msg = error?.response?.data || (error instanceof Error ? error.message : String(error));
    console.error('[SHOPIFY CUSTOMERS ERROR]', msg);
    res.status(500).json({ error: 'Shopify müşterileri alınamadı', details: msg });
  }
});

// Customers metrics: total customers, avg LTV, avg orders/customer, CAC
router.get('/api/customers/metrics', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    // Optional date range for ad spend (defaults last 30 days, till yesterday)
    const today = new Date();
    const endD = new Date(today); endD.setDate(today.getDate() - 1);
    const startD = new Date(endD); startD.setDate(endD.getDate() - 29);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const since = typeof req.query.startDate === 'string' ? req.query.startDate : fmt(startD);
    const until = typeof req.query.endDate === 'string' ? req.query.endDate : fmt(endD);

    // Shopify connection
    const snap = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const conn = snap.val();
    if (!conn?.storeUrl || !conn?.accessToken) {
      return res.json({
        requestedRange: { startDate: since, endDate: until },
        totals: { totalCustomers: 0, avgLTV: 0, avgOrdersPerCustomer: 0, cac: 0, adSpend: 0, currency: 'TRY' }
      });
    }

    // 1) Total customers via count endpoint
    let totalCustomers = 0;
    try {
      const countRes = await axios.get(`https://${conn.storeUrl}/admin/api/2025-01/customers/count.json`, {
        headers: { 'X-Shopify-Access-Token': conn.accessToken }
      });
      totalCustomers = Number(countRes.data?.count || 0);
    } catch (e) {
      totalCustomers = 0;
    }

    // 2) Iterate all customers to compute sums (LTV and orders)
    let sumTotalSpent = 0;
    let sumOrders = 0;
    let fetched = 0;
    let nextUrl: string | null = `https://${conn.storeUrl}/admin/api/2025-01/customers.json?limit=250&fields=id,total_spent,orders_count,created_at`;
    let safety = 0;
    while (nextUrl && safety < 100) {
      safety++;
      const r = await axios.get(nextUrl, { headers: { 'X-Shopify-Access-Token': conn.accessToken } });
      const customers: any[] = r.data?.customers || [];
      for (const c of customers) {
        const spent = Number.parseFloat(String(c?.total_spent ?? '0')) || 0;
        const orders = Number(c?.orders_count || 0);
        sumTotalSpent += spent;
        sumOrders += orders;
      }
      fetched += customers.length;
      const link = (r.headers?.link || r.headers?.Link) as string | undefined;
      if (link && /<([^>]+)>; rel="next"/i.test(link)) {
        const m = link.match(/<([^>]+)>; rel="next"/i);
        nextUrl = m ? m[1] : null;
      } else {
        nextUrl = null;
      }
      // If count is known and we've fetched all, break early
      if (totalCustomers && fetched >= totalCustomers) break;
    }

    const avgLTV = totalCustomers > 0 ? (sumTotalSpent / totalCustomers) : 0;
    const avgOrdersPerCustomer = totalCustomers > 0 ? (sumOrders / totalCustomers) : 0;

    // 3) Ad spend from existing endpoints (Meta + Google Ads) for the period
    let adSpend = 0;
    try {
      const baseProto = (req.protocol || 'http');
      const host = (req.get('host') || 'localhost:5001').replace('127.0.0.1', 'localhost');
      const baseUrl = `${baseProto}://${host}`;
      const qs = `userId=${encodeURIComponent(userId)}&startDate=${encodeURIComponent(since)}&endDate=${encodeURIComponent(until)}`;
      const [metaRes, gadsRes] = await Promise.allSettled([
        fetchWithTimeout(`${baseUrl}/api/meta/summary-bq?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
        fetchWithTimeout(`${baseUrl}/api/googleads/summary-bq?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
      ]);
      const getSpend = async (r: any) => {
        if (r.status !== 'fulfilled') return 0;
        const res = r.value as Response;
        if (!res.ok) return 0;
        const json: any = await res.json();
        return Number(json?.totals?.spend || 0);
      };
      adSpend += await getSpend(metaRes);
      adSpend += await getSpend(gadsRes);
    } catch (_) {}

    const cac = totalCustomers > 0 ? (adSpend / totalCustomers) : 0;

    return res.json({
      requestedRange: { startDate: since, endDate: until },
      totals: {
        totalCustomers,
        avgLTV: Number(avgLTV.toFixed(2)),
        avgOrdersPerCustomer: Number(avgOrdersPerCustomer.toFixed(2)),
        cac: Number(cac.toFixed(2)),
        adSpend: Number(adSpend.toFixed(2)),
        currency: 'TRY',
      }
    });
  } catch (error) {
    console.error('[CUSTOMERS METRICS ERROR]', error);
    return res.status(500).json({ message: 'Müşteri metrikleri hesaplanamadı', error: String(error) });
  }
});

// Shopify access scopes görüntüleme (teşhis amaçlı)
router.get('/api/shopify/access-scopes', async (req, res) => {
  try {
    const userId = req.query.userId || 'test-user';
    const snapshot = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const shopifyConn = snapshot.val();
    if (!shopifyConn || !shopifyConn.storeUrl || !shopifyConn.accessToken) {
      return res.status(400).json({ error: 'Shopify bağlantısı veya token yok.' });
    }
    const storeUrl = shopifyConn.storeUrl;
    const r = await axios.get(`https://${storeUrl}/admin/oauth/access_scopes.json`, {
      headers: { 'X-Shopify-Access-Token': shopifyConn.accessToken }
    });
    return res.json(r.data);
  } catch (error: any) {
    const msg = error?.response?.data || (error instanceof Error ? error.message : String(error));
    console.error('[SHOPIFY SCOPES ERROR]', msg);
    return res.status(500).json({ error: 'Shopify access scopes alınamadı', details: msg });
  }
});

// Shopify özet verisi: günlük sipariş ve ciro (varsayılan son 30 gün, dün bitiş)
router.get('/api/shopify/summary', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    const snap = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const conn = snap.val();
    if (!conn?.storeUrl || !conn?.accessToken) {
      return res.status(400).json({ message: 'Shopify bağlantısı bulunamadı.' });
    }
    // Tarih aralığı: son 30 gün, dünü bitiş al
    const today = new Date();
    const endD = new Date(today); endD.setDate(today.getDate() - 1);
    const startD = new Date(endD); startD.setDate(endD.getDate() - 29);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const since = typeof req.query.startDate === 'string' ? req.query.startDate : fmt(startD);
    const until = typeof req.query.endDate === 'string' ? req.query.endDate : fmt(endD);

  // İsteğe bağlı gelir modu: 'paid' (sadece ödenmişler) veya 'gross' (iptal olmayan tüm siparişlerin toplamı)
  const revenueMode = (typeof req.query.revenueMode === 'string' ? req.query.revenueMode : 'gross') as 'paid' | 'gross';

  // Pagination ile tüm siparişleri çek
    const base = `https://${conn.storeUrl}/admin/api/2025-01/orders.json`;
    const params = new URLSearchParams();
    params.set('status', 'any');
    params.set('limit', '250');
    params.set('created_at_min', `${since}T00:00:00Z`);
    params.set('created_at_max', `${until}T23:59:59Z`);
  params.set('fields', 'id,created_at,total_price,subtotal_price,financial_status,cancelled_at,currency');

    let nextUrl: string | null = `${base}?${params.toString()}`;
  const dayMap: Record<string, { orders: number; revenueGross: number; revenuePaid: number } > = {};
    let currency: string | null = null;
    let safetyCount = 0;

    while (nextUrl && safetyCount < 50) { // 50 * 250 = 12.5k orders max per request
      safetyCount++;
      const r = await fetchWithTimeout(nextUrl, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': conn.accessToken,
          'Content-Type': 'application/json',
        },
      }, 20000);
      const json: any = await r.json();
      if (!r.ok) {
        return res.status(r.status).json({ message: 'Shopify orders alınamadı', error: json });
      }
      const orders: any[] = json.orders || [];
      for (const o of orders) {
        if (!currency && o.currency) currency = o.currency;
        // İptal edilen siparişleri hariç tut
        if (o.cancelled_at) continue;
        const fs = String(o.financial_status || '').toLowerCase();
        const date = String(o.created_at || '').slice(0, 10);
        const price = Number.parseFloat(String(o.total_price || o.subtotal_price || '0')) || 0;
        if (!dayMap[date]) dayMap[date] = { orders: 0, revenueGross: 0, revenuePaid: 0 };
        // Sipariş sayısını finansal statüden bağımsız (iptal değilse) sayalım
        dayMap[date].orders += 1;
        // Brüt gelir: iptal olmayan tüm siparişlerin toplamı
        dayMap[date].revenueGross += price;
        // Ödenmiş gelir: yalnızca ödeme gerçekleşen statüler
        if (['paid','partially_paid','partially_refunded'].includes(fs)) {
          dayMap[date].revenuePaid += price;
        }
      }
      // Cursor pagination: Link header kontrolü
      const link = (r as any).headers?.get ? (r as any).headers.get('link') : undefined;
      if (link && /<([^>]+)>; rel="next"/i.test(link)) {
        const m = link.match(/<([^>]+)>; rel="next"/i);
        nextUrl = m ? m[1] : null;
      } else {
        nextUrl = null;
      }
    }

    // Zero-fill ve günlük dizi
    const rows: Array<{ date: string; orders: number; revenue: number }> = [];
    const cur = new Date(since as string);
    const end = new Date(until as string);
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      const v = dayMap[key] || { orders: 0, revenueGross: 0, revenuePaid: 0 } as any;
      const rev = revenueMode === 'paid' ? v.revenuePaid : v.revenueGross;
      rows.push({ date: key, orders: v.orders, revenue: Number(rev.toFixed(2)) });
      cur.setDate(cur.getDate() + 1);
    }

    const totals = rows.reduce((acc, d) => { acc.orders += d.orders; acc.revenue += d.revenue; return acc; }, { orders: 0, revenue: 0 });
    const aov = totals.orders > 0 ? totals.revenue / totals.orders : 0;

    return res.json({
      rows,
      totals: { ...totals, aov: Number(aov.toFixed(2)), currency: currency || 'TRY', revenueMode },
      requestedRange: { startDate: since, endDate: until }
    });
  } catch (error) {
    console.error('[Shopify SUMMARY ERROR]', error);
    return res.status(500).json({ message: 'Shopify özet verisi çekilemedi', error: String(error) });
  }
});

// Shopify summary from BigQuery (metrics_daily)
router.get('/api/shopify/summary-bq', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    const revenueMode = (typeof req.query.revenueMode === 'string' ? req.query.revenueMode : 'gross') as 'paid' | 'gross';
    
    // Get selected shop from connections
    let storeUrl: string | undefined = undefined;
    try {
      const snap = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
      storeUrl = snap.val()?.storeUrl?.replace(/^https?:\/\//,'').replace(/\/$/,'') || undefined;
    } catch (_) {}
    
    // Default range: last 30 days ending yesterday
    const today = new Date();
    const endD = new Date(today); endD.setDate(today.getDate() - 1);
    const startD = new Date(endD); startD.setDate(endD.getDate() - 29);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const since = typeof req.query.startDate === 'string' ? req.query.startDate : fmt(startD);
    const until = typeof req.query.endDate === 'string' ? req.query.endDate : fmt(endD);

    const bq = getBigQuery();
    const dataset = process.env.BQ_DATASET || 'iqsion';
    
    // If storeUrl is set, filter by it; otherwise return all stores (backward compatibility)
    const accountFilter = storeUrl ? 'AND accountId = @accountId' : '';
    
    const sql = `
      WITH LatestRows AS (
        SELECT date,
               transactions,
               revenueMicros,
               ROW_NUMBER() OVER (PARTITION BY date ORDER BY createdAt DESC) as rn
        FROM \`${bq.projectId}.${dataset}.metrics_daily\`
        WHERE userId = @userId AND source = 'shopify' ${accountFilter} AND date BETWEEN DATE(@start) AND DATE(@end)
      )
      SELECT date,
             CAST(transactions AS INT64) AS orders,
             CAST(revenueMicros AS INT64) AS revenueMicros
      FROM LatestRows
      WHERE rn = 1
      ORDER BY date
    `;
    
    const params: any = { userId, start: since, end: until };
    if (storeUrl) params.accountId = storeUrl;
    
    const [job] = await bq.createQueryJob({
      query: sql,
      params,
      location: process.env.BQ_LOCATION || 'US',
    });
    const [rows] = await job.getQueryResults();

    const map: Record<string, { orders: number; revenue: number }> = {};
    for (const r of rows as any[]) {
      const d = normalizeBqDate(r.date);
      const orders = Number(r.orders || 0);
      const revenue = Number(r.revenueMicros || 0) / 1_000_000;
      map[d] = { orders, revenue };
    }

    const series: Array<{ date: string; orders: number; revenue: number }> = [];
    const cur = new Date(since);
    const end = new Date(until);
    while (cur <= end) {
      const key = cur.toISOString().slice(0,10);
      const v = map[key] || { orders: 0, revenue: 0 };
      series.push({ date: key, orders: v.orders, revenue: Number(v.revenue.toFixed(2)) });
      cur.setDate(cur.getDate()+1);
    }

    const totals = series.reduce((acc, d) => { acc.orders += d.orders; acc.revenue += d.revenue; return acc; }, { orders: 0, revenue: 0 });
    const aov = totals.orders > 0 ? totals.revenue / totals.orders : 0;

    return res.json({
      rows: series,
      totals: { ...totals, aov: Number(aov.toFixed(2)), currency: 'TRY', revenueMode },
      requestedRange: { startDate: since, endDate: until }
    });
  } catch (error) {
    console.error('[Shopify SUMMARY BQ ERROR]', error);
    return res.status(500).json({ message: 'Shopify BQ özet verisi çekilemedi', error: String(error) });
  }
});

// Profitability summary: revenue, COGS, gross/net profit, margin, ROAS (best-effort)
router.get('/api/profitability/summary', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    const revenueMode = (typeof req.query.revenueMode === 'string' ? req.query.revenueMode : 'gross') as 'paid' | 'gross';
    const today = new Date();
    const endD = new Date(today); endD.setDate(today.getDate() - 1);
    const startD = new Date(endD); startD.setDate(endD.getDate() - 29);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const since = typeof req.query.startDate === 'string' ? req.query.startDate : fmt(startD);
    const until = typeof req.query.endDate === 'string' ? req.query.endDate : fmt(endD);

    // Get Shopify connection
    const shopSnap = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const shopConn = shopSnap.val();
    if (!shopConn?.storeUrl || !shopConn?.accessToken) {
      return res.status(200).json({
        requestedRange: { startDate: since, endDate: until },
        currency: 'TRY',
        rows: [],
        totals: { revenue: 0, cogs: 0, grossProfit: 0, netProfit: 0, margin: 0, adSpend: 0, roas: null }
      });
    }

    // Fetch all orders with line_items in range
    const base = `https://${shopConn.storeUrl}/admin/api/2025-01/orders.json`;
    const params = new URLSearchParams();
    params.set('status', 'any');
    params.set('limit', '250');
    params.set('created_at_min', `${since}T00:00:00Z`);
    params.set('created_at_max', `${until}T23:59:59Z`);
    // include necessary fields; omit fields filter to ensure line_items are included

    let nextUrl: string | null = `${base}?${params.toString()}`;
    const orders: any[] = [];
    let currency: string | null = null;
    let safety = 0;
    while (nextUrl && safety < 50) {
      safety++;
      const r = await fetchWithTimeout(nextUrl, {
        method: 'GET',
        headers: { 'X-Shopify-Access-Token': shopConn.accessToken, 'Content-Type': 'application/json' },
      }, 20000);
      const json: any = await r.json();
      if (!r.ok) return res.status(r.status).json({ message: 'Shopify orders alınamadı', error: json });
      const chunk: any[] = json.orders || [];
      for (const o of chunk) {
        if (!currency && o.currency) currency = o.currency;
        orders.push(o);
      }
      const link = (r as any).headers?.get ? (r as any).headers.get('link') : undefined;
      if (link && /<([^>]+)>; rel="next"/i.test(link)) {
        const m = link.match(/<([^>]+)>; rel="next"/i);
        nextUrl = m ? m[1] : null;
      } else {
        nextUrl = null;
      }
    }

    // Collect variant_ids to map inventory_item_id
    const variantIds = new Set<string>();
    for (const o of orders) {
      const items = Array.isArray(o?.line_items) ? o.line_items : [];
      for (const li of items) {
        if (li && li.variant_id) variantIds.add(String(li.variant_id));
      }
    }
    const vIdList = Array.from(variantIds);
    const chunker = <T,>(arr: T[], size = 250): T[][] => {
      const res: T[][] = [];
      for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
      return res;
    };
    const vChunks = chunker(vIdList, 250);
    const variantToInv: Record<string, string> = {};
    for (const ch of vChunks) {
      if (!ch.length) continue;
      const vRes = await axios.get(`https://${shopConn.storeUrl}/admin/api/2025-01/variants.json`, {
        params: { ids: ch.join(',') },
        headers: { 'X-Shopify-Access-Token': shopConn.accessToken }
      });
      const variants = vRes.data?.variants || [];
      for (const v of variants) {
        if (v?.id && v?.inventory_item_id) variantToInv[String(v.id)] = String(v.inventory_item_id);
      }
    }

    // Fetch inventory items to get cost
    const invIds = Array.from(new Set(Object.values(variantToInv)));
    const invChunks = chunker(invIds, 250);
    const invCostMap: Record<string, number> = {};
    for (const ch of invChunks) {
      if (!ch.length) continue;
      const invRes = await axios.get(`https://${shopConn.storeUrl}/admin/api/2025-01/inventory_items.json`, {
        params: { ids: ch.join(',') },
        headers: { 'X-Shopify-Access-Token': shopConn.accessToken }
      });
      const items = invRes.data?.inventory_items || [];
      for (const it of items) {
        const costNum = Number(it?.cost);
        if (Number.isFinite(costNum) && costNum > 0) invCostMap[String(it.id)] = costNum;
      }
    }

    // Manual costs by product id
    const manualCostsSnap = await admin.database().ref(`shopifyProductCosts/${userId}`).once('value');
    const manualCosts = manualCostsSnap.val() || {};

    // Build daily aggregates
    type DayAgg = { revenueGross: number; revenuePaid: number; cogs: number };
    const dayMap: Record<string, DayAgg> = {};
    for (const o of orders) {
      if (o?.cancelled_at) continue; // skip cancelled
      const date = String(o?.created_at || '').slice(0, 10);
      const fs = String(o?.financial_status || '').toLowerCase();
      const price = Number.parseFloat(String(o?.total_price || o?.subtotal_price || '0')) || 0;
      if (!dayMap[date]) dayMap[date] = { revenueGross: 0, revenuePaid: 0, cogs: 0 };
      dayMap[date].revenueGross += price;
      if (['paid','partially_paid','partially_refunded'].includes(fs)) dayMap[date].revenuePaid += price;
      // COGS from line items
      const items = Array.isArray(o?.line_items) ? o.line_items : [];
      for (const li of items) {
        const qty = Number(li?.quantity || 0);
        if (!qty) continue;
        const variantId = li?.variant_id ? String(li.variant_id) : '';
        const invId = variantId ? variantToInv[variantId] : undefined;
        let unitCost: number | null = null;
        if (invId && invCostMap[invId] !== undefined) {
          unitCost = invCostMap[invId];
        } else if (li?.product_id && manualCosts[li.product_id] !== undefined) {
          const m = Number(manualCosts[li.product_id]);
          if (Number.isFinite(m) && m >= 0) unitCost = m;
        }
        if (unitCost !== null) dayMap[date].cogs += unitCost * qty;
      }
    }

    // Build rows (zero-filled)
    const rows: Array<{ date: string; revenue: number; cogs: number; grossProfit: number; netProfit: number }> = [];
    const cur = new Date(since as string);
    const end = new Date(until as string);
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      const v = dayMap[key] || { revenueGross: 0, revenuePaid: 0, cogs: 0 };
      const revenue = revenueMode === 'paid' ? v.revenuePaid : v.revenueGross;
      const cogs = v.cogs;
      const gross = revenue - cogs;
      rows.push({ date: key, revenue: Number(revenue.toFixed(2)), cogs: Number(cogs.toFixed(2)), grossProfit: Number(gross.toFixed(2)), netProfit: 0 });
      cur.setDate(cur.getDate() + 1);
    }

    const totals = rows.reduce((acc, r) => {
      acc.revenue += r.revenue; acc.cogs += r.cogs; acc.grossProfit += r.grossProfit; return acc;
    }, { revenue: 0, cogs: 0, grossProfit: 0 });

    // Fetch ad spends (best-effort) from existing endpoints
    let adSpend = 0;
    try {
      const baseProto = (req.protocol || 'http');
      const host = (req.get('host') || 'localhost:5001').replace('127.0.0.1', 'localhost');
      const baseUrl = `${baseProto}://${host}`;
      const qs = `userId=${encodeURIComponent(userId)}&startDate=${encodeURIComponent(since)}&endDate=${encodeURIComponent(until)}`;
      const [metaRes, gadsRes] = await Promise.allSettled([
        fetchWithTimeout(`${baseUrl}/api/meta/summary-bq?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
        fetchWithTimeout(`${baseUrl}/api/googleads/summary-bq?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
      ]);
      const getSpend = async (r: any) => {
        if (r.status !== 'fulfilled') return 0;
        const res = r.value as Response;
        if (!res.ok) return 0;
        const json: any = await res.json();
        return Number(json?.totals?.spend || 0);
      };
      adSpend += await getSpend(metaRes);
      adSpend += await getSpend(gadsRes);
    } catch (_) {}

    // Compute net profit and ROAS
    const grossProfitTotal = totals.grossProfit;
    const netProfitTotal = totals.revenue - totals.cogs - adSpend;
    const margin = totals.revenue > 0 ? (netProfitTotal / totals.revenue) * 100 : 0;
    const roas = adSpend > 0 ? (totals.revenue / adSpend) : null;

    // Distribute daily net profit assuming even ad spend per day proportionate to revenue
    const totalRevenue = totals.revenue || 1;
    const dailyRows = rows.map(r => {
      const share = r.revenue / totalRevenue;
      const dailyAdSpend = adSpend * share;
      const net = r.grossProfit - dailyAdSpend;
      return { ...r, netProfit: Number(net.toFixed(2)) };
    });

    return res.json({
      requestedRange: { startDate: since, endDate: until },
      currency: currency || 'TRY',
      rows: dailyRows,
      totals: {
        revenue: Number(totals.revenue.toFixed(2)),
        cogs: Number(totals.cogs.toFixed(2)),
        grossProfit: Number(grossProfitTotal.toFixed(2)),
        netProfit: Number(netProfitTotal.toFixed(2)),
        margin: Number(margin.toFixed(2)),
        adSpend: Number(adSpend.toFixed(2)),
        roas: roas === null ? null : Number(roas.toFixed(2)),
        revenueMode,
      }
    });
  } catch (error) {
    console.error('[PROFITABILITY SUMMARY ERROR]', error);
    return res.status(500).json({ message: 'Karlılık özeti hesaplanamadı', error: String(error) });
  }
});

// Google Ads bağlı kullanıcıya ait tüm ad account'ları listeleyen endpoint
router.get('/api/googleads/accounts', async (req, res) => {
  try {
    const userId = req.query.userId || 'test-user';
    const snapshot = await admin.database().ref(`platformConnections/${userId}/google_ads`).once('value');
    const googleAdsConn = snapshot.val();
    if (!googleAdsConn || !googleAdsConn.accessToken) {
      return res.status(400).json({ message: 'Google Ads bağlantısı yok veya access token bulunamadı.' });
    }
    const accessToken = googleAdsConn.accessToken as string;
    const refreshToken = googleAdsConn.refreshToken as string | undefined;
    const loginCustomerId = (googleAdsConn.loginCustomerId || '') as string;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
      developer_token: developerToken,
    });

    // Proactive token refresh if expired (access token lifetime ~1h). Try multiple client pairs if needed.
    try {
      if (refreshToken && googleAdsConn.expiresIn && googleAdsConn.createdAt) {
        const ageMs = Date.now() - Number(googleAdsConn.createdAt);
        const ttlMs = (Number(googleAdsConn.expiresIn) - 60) * 1000; // refresh 60s early
        if (ageMs > ttlMs) {
          const tryPairs: Array<{ id: string; secret: string } > = [];
          const storedId = String(googleAdsConn.oauthClientId || '').trim();
          const storedSecret = String(googleAdsConn.oauthClientSecret || '').trim();
          if (storedId && storedSecret) tryPairs.push({ id: storedId, secret: storedSecret });
          const adsId = (process.env.GOOGLE_ADS_CLIENT_ID || '').trim();
          const adsSecret = (process.env.GOOGLE_ADS_CLIENT_SECRET || '').trim();
          if (adsId && adsSecret) tryPairs.push({ id: adsId, secret: adsSecret });
          const genId = (process.env.GOOGLE_CLIENT_ID || '').trim();
          const genSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
          if (genId && genSecret) tryPairs.push({ id: genId, secret: genSecret });

          let refreshed: any = null;
          for (const pair of tryPairs) {
            try {
              const params = new URLSearchParams();
              params.append('client_id', pair.id);
              params.append('client_secret', pair.secret);
              params.append('refresh_token', refreshToken);
              params.append('grant_type', 'refresh_token');
              const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
              });
              const tokenJson = await tokenResp.json();
              if (tokenResp.ok && tokenJson.access_token) {
                refreshed = { token: tokenJson, pair };
                break;
              }
            } catch (_) {}
          }
          if (refreshed) {
            await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
              accessToken: refreshed.token.access_token,
              expiresIn: refreshed.token.expires_in,
              updatedAt: new Date().toISOString(),
              createdAt: Date.now(),
              oauthClientId: refreshed.pair.id,
              oauthClientSecret: refreshed.pair.secret ? 'set' : undefined,
            });
            console.log('[GoogleAds REFRESH] access token yenilendi (accounts endpoint).');
          } else {
            console.warn('[GoogleAds REFRESH] refresh başarısız: tüm client_id denemeleri başarısız');
          }
        }
      }
    } catch (e) {
      console.warn('[GoogleAds REFRESH] hata:', e);
    }

    // Re-read accessToken if we refreshed
    const freshSnap = await admin.database().ref(`platformConnections/${userId}/google_ads`).once('value');
    const freshConn = freshSnap.val();
    const effectiveAccessToken = freshConn?.accessToken || accessToken;

    // 1) Try to auto-detect MCC if not provided - use REST listAccessibleCustomers
    let effectiveLoginCustomerId = loginCustomerId;
    if (!effectiveLoginCustomerId) {
      try {
        const tryList = async (version: string) => {
          const url = `https://googleads.googleapis.com/${version}/customers:listAccessibleCustomers`;
          const r = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${effectiveAccessToken}`, 'developer-token': developerToken },
          });
          if (!r.ok) throw new Error(`listAccessibleCustomers ${version} failed: ${r.status}`);
          return (await r.json()) as { resourceNames?: string[] };
        };
        const j17 = await tryList('v17');
        const resourceNames = j17.resourceNames || [];
        if (resourceNames.length > 0) {
          // First accessible customer becomes loginCustomerId (usually MCC or primary account)
          const firstId = String(resourceNames[0]).split('/')[1];
          if (firstId) {
            effectiveLoginCustomerId = firstId;
            // Save it for future use
            await admin.database().ref(`platformConnections/${userId}/google_ads/loginCustomerId`).set(firstId);
            console.log(`[GoogleAds MCC Auto-detect] loginCustomerId set to ${firstId}`);
          }
        }
      } catch (e) {
        console.warn('[GoogleAds MCC Auto-detect] failed:', e);
      }
    }

    // 2) If MCC (loginCustomerId) is provided or detected, prefer GAQL to fetch sub-accounts with names
    if (effectiveLoginCustomerId && refreshToken) {
      try {
        const anyClient: any = client as any;
        const customer = anyClient.Customer ? anyClient.Customer({ customer_id: effectiveLoginCustomerId, refresh_token: refreshToken, login_customer_id: effectiveLoginCustomerId }) : null;
        if (customer && customer.query) {
          const gaql = `SELECT customer_client.id, customer_client.descriptive_name, customer_client.status FROM customer_client WHERE customer_client.manager = false`;
          const rows = await customer.query(gaql);
          const accounts = (rows || []).map((r: any) => ({ id: r.customer_client?.id?.toString?.() || '', displayName: r.customer_client?.descriptive_name || '' }));
          if (accounts.length) return res.json({ accounts });
        }
      } catch (e) {
        console.warn('[GoogleAds SDK] MCC subaccount query failed:', e);
      }
    }

    // 2) Otherwise, use REST to list accessible customers (ids), then enrich displayName via a tiny GAQL per id
    const tryList = async (version: string) => {
      const url = `https://googleads.googleapis.com/${version}/customers:listAccessibleCustomers`;
      const r = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${effectiveAccessToken}`,
          'developer-token': developerToken,
        },
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`listAccessibleCustomers ${version} failed: ${r.status} ${txt}`);
      }
      return (await r.json()) as { resourceNames?: string[] };
    };

    let resourceNames: string[] = [];
    try {
      // Prefer v17, fallback to v18 if needed
      const j17 = await tryList('v17');
      resourceNames = j17.resourceNames || [];
      if (!resourceNames.length) {
        try {
          const j18 = await tryList('v18');
          resourceNames = j18.resourceNames || [];
        } catch (_) {}
      }
    } catch (e) {
      console.warn('[GoogleAds REST] listAccessibleCustomers failed:', e);
    }

    // If nothing accessible, record diagnostic and return empty array (UI allows manual entry)
    if (!resourceNames.length) {
      try {
        await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
          lastError: 'no_accessible_customers',
          lastErrorAt: new Date().toISOString(),
        });
      } catch(_) {}
      return res.json({ accounts: [] });
    }

    // Enrich with names via GAQL (best-effort)
    const ids = resourceNames.map((n) => String(n).split('/')[1]).filter(Boolean);
    const accounts: Array<{ id: string; displayName: string }> = [];
    for (const id of ids) {
      let displayName = id;
      try {
        if (refreshToken) {
          const anyClient: any = client as any;
          const self = anyClient.Customer ? anyClient.Customer({ customer_id: id, refresh_token: refreshToken, login_customer_id: effectiveLoginCustomerId || undefined }) : null;
          if (self && self.query) {
            const row = await self.query('SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1');
            const name = Array.isArray(row) && row[0]?.customer?.descriptive_name;
            if (name) displayName = name as string;
          }
        }
      } catch (e) {
        // ignore per-account errors; keep ID as displayName
      }
      accounts.push({ id, displayName });
    }

    res.json({ accounts });
  } catch (err) {
    console.error('[GoogleAds DEBUG] /api/googleads/accounts error:', err);
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const msg = (err instanceof Error ? err.message : String(err)) || 'unknown';
      const tag = /invalid_client/i.test(msg) ? 'invalid_client' : 'accounts_error';
      await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
        lastError: tag,
        lastErrorMessage: msg.slice(0,400),
        lastErrorAt: new Date().toISOString(),
      });
    } catch(_) {}
    res.status(500).json({ message: 'Google Ads hesapları alınamadı', error: String(err) });
  }
});

// Shopify canlı veri (orders) - kullanıcıya özel token ile
router.get('/api/shopify/data', async (req: express.Request, res: express.Response) => {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : 'test-user';
    const snapshot = await admin.database().ref(`platformConnections/${userId}/shopify`).once('value');
    const shopifyConn = snapshot.val();
    if (!shopifyConn || !shopifyConn.storeUrl || !shopifyConn.accessToken) {
      return res.status(400).json({ error: 'Shopify bağlantısı veya token bulunamadı.' });
    }
    const storeUrl = shopifyConn.storeUrl;
    const response = await axios.get(`https://${storeUrl}/admin/api/2025-01/orders.json?status=any&limit=5`, {
      headers: {
        'X-Shopify-Access-Token': shopifyConn.accessToken,
        'Content-Type': 'application/json',
      }
    });
    res.json(response.data);
  } catch (error: any) {
    const msg = error?.response?.data || (error instanceof Error ? error.message : String(error));
    console.error('[SHOPIFY DATA ERROR]', msg);
    res.status(500).json({ error: 'Shopify canlı veri alınamadı', details: msg });
  }
});

// Google Ads özet verisi (hızlı test endpointi)
router.get('/api/googleads/summary', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;

    // Bağlantı bilgileri
    const snapshot = await admin.database().ref(`platformConnections/${userId}/google_ads`).once('value');
    const gaConn = snapshot.val();
    if (!gaConn?.accessToken) {
      return res.status(400).json({ message: 'Google Ads bağlantısı bulunamadı (token eksik).' });
    }
    const refreshToken: string | undefined = gaConn.refreshToken;
    let accountId: string | undefined = gaConn.accountId;
    const loginCustomerId: string | undefined = gaConn.loginCustomerId || undefined;

    // Eğer hesap seçili değilse, erişilebilir ilk hesabı bulmayı dene
    if (!accountId) {
      try {
        const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
        const listUrl = `https://googleads.googleapis.com/v17/customers:listAccessibleCustomers`;
        const r = await fetch(listUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${gaConn.accessToken}`, 'developer-token': devToken },
        });
        if (r.ok) {
          const j = await r.json();
          const first = (j.resourceNames || [])[0];
          const id = first ? String(first).split('/')[1] : undefined;
          if (id) {
            accountId = id;
            await admin.database().ref(`platformConnections/${userId}/google_ads`).update({ accountId: id, updatedAt: new Date().toISOString() });
          }
        }
      } catch (_) {}
    }
    if (!accountId) {
      return res.status(400).json({ message: 'Google Ads hesap ID bulunamadı. Ayarlar > Google Ads bölümünden bir hesap seçin.' });
    }

    // Tarih aralığı (son 7 gün, dünü bitiş olarak al)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const defaultStart = new Date(yesterday);
    defaultStart.setDate(yesterday.getDate() - 6);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const since = startDate || fmt(defaultStart);
    const until = endDate || fmt(yesterday);

    // GAQL ile günlük metrikleri çek (hesap seviyesi)
    // Proactive refresh before GAQL if needed (try stored and both client pairs)
    try {
      if (gaConn?.refreshToken && gaConn?.expiresIn && gaConn?.createdAt) {
        const ageMs = Date.now() - Number(gaConn.createdAt);
        const ttlMs = (Number(gaConn.expiresIn) - 60) * 1000;
        if (ageMs > ttlMs) {
          const tryPairs: Array<{ id: string; secret: string } > = [];
          const storedId = String(gaConn.oauthClientId || '').trim();
          const storedSecret = String(gaConn.oauthClientSecret || '').trim();
          if (storedId && storedSecret) tryPairs.push({ id: storedId, secret: storedSecret });
          const adsId = (process.env.GOOGLE_ADS_CLIENT_ID || '').trim();
          const adsSecret = (process.env.GOOGLE_ADS_CLIENT_SECRET || '').trim();
          if (adsId && adsSecret) tryPairs.push({ id: adsId, secret: adsSecret });
          const genId = (process.env.GOOGLE_CLIENT_ID || '').trim();
          const genSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
          if (genId && genSecret) tryPairs.push({ id: genId, secret: genSecret });

          let refreshed: any = null;
          for (const pair of tryPairs) {
            try {
              const params = new URLSearchParams();
              params.append('client_id', pair.id);
              params.append('client_secret', pair.secret);
              params.append('refresh_token', gaConn.refreshToken);
              params.append('grant_type', 'refresh_token');
              const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString()
              });
              const tokenJson = await tokenResp.json();
              if (tokenResp.ok && tokenJson.access_token) {
                refreshed = { token: tokenJson, pair };
                break;
              }
            } catch (_) {}
          }
          if (refreshed) {
            await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
              accessToken: refreshed.token.access_token,
              expiresIn: refreshed.token.expires_in,
              updatedAt: new Date().toISOString(),
              createdAt: Date.now(),
              oauthClientId: refreshed.pair.id,
              oauthClientSecret: refreshed.pair.secret ? 'set' : undefined,
            });
            gaConn.accessToken = refreshed.token.access_token;
            console.log('[GoogleAds REFRESH] access token yenilendi (summary endpoint).');
          } else {
            console.warn('[GoogleAds REFRESH] refresh başarısız: tüm client_id denemeleri başarısız');
          }
        }
      }
    } catch (e) {
      console.warn('[GoogleAds REFRESH] hata (summary):', e);
    }

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    });
    const anyClient: any = client as any;
    const customer = anyClient.Customer ? anyClient.Customer({ customer_id: accountId, refresh_token: refreshToken, login_customer_id: loginCustomerId }) : null;
    if (!customer || !customer.query) {
      return res.status(500).json({ message: 'Google Ads SDK başlatılamadı.' });
    }

    const gaql = `
      SELECT
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM customer
      WHERE segments.date BETWEEN '${since}' AND '${until}'
      ORDER BY segments.date
    `;

    let rows: any[] = [];
    try {
      rows = await customer.query(gaql);
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : (typeof e === 'object' ? JSON.stringify(e) : String(e));
      console.error('[GoogleAds GAQL ERROR]', { message: msg, raw: e, gaql, accountId, loginCustomerId });
      // If refresh token is revoked/invalid, surface a clear 401 and mark as disconnected
      if (/invalid_grant/i.test(msg) || /UNAUTHENTICATED/i.test(msg)) {
        try {
          await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
            isConnected: false,
            lastError: 'invalid_grant',
            lastErrorAt: new Date().toISOString(),
          });
        } catch (_) {}
        return res.status(401).json({
          message: 'Google Ads oturumunun süresi dolmuş. Lütfen Ayarlar > Google Ads bölümünden yeniden bağlanın.',
          details: 'invalid_grant',
        });
      }
      // Capture invalid_client separately
      if (/invalid_client/i.test(msg)) {
        try {
          await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
            lastError: 'invalid_client',
            lastErrorMessage: msg.slice(0,400),
            lastErrorAt: new Date().toISOString(),
          });
        } catch(_) {}
      }
      return res.status(502).json({ message: 'Google Ads sorgusu başarısız', details: msg, gaql });
    }

    // Günlük satırlar + toplamlar
    const daily = rows.map((r: any) => ({
      date: r.segments?.date,
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      spend: Number(r.metrics?.cost_micros || 0) / 1_000_000,
      conversions: Number(r.metrics?.conversions || 0),
    }));

    const totals = daily.reduce(
      (acc, d) => {
        acc.impressions += d.impressions;
        acc.clicks += d.clicks;
        acc.spend += d.spend;
        acc.conversions += d.conversions;
        return acc;
      },
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

    return res.json({
      accountId,
      requestedRange: { since, until },
      rows: daily,
      totals: { ...totals, ctr, cpc },
    });
  } catch (err) {
    console.error('[GoogleAds DEBUG] /api/googleads/summary error:', err);
    res.status(500).json({ message: 'Google Ads özet verisi alınamadı', error: String(err) });
  }
});

// Google Ads summary from BigQuery (metrics_daily)
router.get('/api/googleads/summary-bq', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    // Get selected accountId from stored connection
    let accountId: string | undefined = undefined;
    try {
      const snap = await admin.database().ref(`platformConnections/${userId}/google_ads`).once('value');
      accountId = snap.val()?.accountId?.replace(/-/g, '') || undefined;
    } catch (_) {}
    // Default range: last 7 days ending yesterday
    const today = new Date();
    const endD = new Date(today); endD.setDate(today.getDate() - 1);
    const startD = new Date(endD); startD.setDate(endD.getDate() - 6);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const since = typeof req.query.startDate === 'string' ? req.query.startDate : fmt(startD);
    const until = typeof req.query.endDate === 'string' ? req.query.endDate : fmt(endD);

    const bq = getBigQuery();
    const dataset = process.env.BQ_DATASET || 'iqsion';
    
    // If accountId is set, filter by it; otherwise return all accounts (backward compatibility)
    const accountFilter = accountId ? 'AND accountId = @accountId' : '';
    
    // Google Ads verileri kampanya bazında kaydediliyor, tüm kampanyaları toplamamız gerekiyor
    // Her kampanya-gün kombinasyonu için en son kaydı al, sonra günlük topla
    const sql = `
      WITH LatestPerCampaign AS (
        SELECT date, campaignId, impressions, clicks, costMicros, transactions,
               ROW_NUMBER() OVER (PARTITION BY date, campaignId ORDER BY createdAt DESC) as rn
        FROM \`${bq.projectId}.${dataset}.metrics_daily\`
        WHERE userId = @userId AND source = 'google_ads' ${accountFilter} AND date BETWEEN DATE(@start) AND DATE(@end)
      )
      SELECT date,
             SUM(CAST(impressions AS INT64)) AS impressions,
             SUM(CAST(clicks AS INT64)) AS clicks,
             SUM(CAST(costMicros AS INT64)) AS costMicros,
             SUM(CAST(COALESCE(transactions, 0) AS INT64)) AS conversions
      FROM LatestPerCampaign
      WHERE rn = 1
      GROUP BY date
      ORDER BY date
    `;
    
    const params: any = { userId, start: since, end: until };
    if (accountId) params.accountId = accountId;
    
    const [job] = await bq.createQueryJob({
      query: sql,
      params,
      location: process.env.BQ_LOCATION || 'US',
    });
    const [rows] = await job.getQueryResults();

    const map: Record<string, { impressions: number; clicks: number; spend: number; conversions: number; }> = {};
    for (const r of rows as any[]) {
      const d = normalizeBqDate(r.date);
      map[d] = {
        impressions: Number(r.impressions || 0),
        clicks: Number(r.clicks || 0),
        spend: Number(r.costMicros || 0) / 1_000_000,
        conversions: Number(r.conversions || 0),
      };
    }

    const series: Array<{ date: string; impressions: number; clicks: number; spend: number; conversions: number }> = [];
    const cur = new Date(since);
    const end = new Date(until);
    while (cur <= end) {
      const key = cur.toISOString().slice(0,10);
      const v = map[key] || { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
      series.push({ date: key, impressions: v.impressions, clicks: v.clicks, spend: v.spend, conversions: v.conversions });
      cur.setDate(cur.getDate()+1);
    }

    const totals = series.reduce((acc, d) => {
      acc.impressions += d.impressions;
      acc.clicks += d.clicks;
      acc.spend += d.spend;
      acc.conversions += d.conversions;
      return acc;
    }, { impressions: 0, clicks: 0, spend: 0, conversions: 0 });
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

    return res.json({
      // maintain existing shape
      accountId,
      requestedRange: { since, until },
      rows: series,
      totals: { ...totals, ctr, cpc },
    });
  } catch (error) {
    console.error('[GoogleAds SUMMARY BQ ERROR]', error);
    return res.status(500).json({ message: 'Google Ads BQ özet verisi çekilemedi', error: String(error) });
  }
});

// Google Ads OAuth bağlantı endpointi
router.get('/api/auth/googleads/connect', async (req: express.Request, res: express.Response) => {
  // IMPORTANT: Use ONLY Google Ads specific credentials
  const clientId = (process.env.GOOGLE_ADS_CLIENT_ID || '').trim();
    if (!clientId) {
      console.error('[GOOGLE ADS CONNECT] GOOGLE_ADS_CLIENT_ID not set in environment');
      return settingsRedirect(res, req, 'google_ads', false);
    }
  // Normalize host and compute redirect dynamically to avoid port mismatches (e.g., 5000 vs 5001)
  const redirectEnv = (process.env.GOOGLE_ADS_REDIRECT_URI || '').trim();
  const computedRedirect = `${buildAppBase(req)}/api/auth/googleads/callback`;
  const redirectUri = (redirectEnv || computedRedirect).trim();
  const scope = 'https://www.googleapis.com/auth/adwords';
  const uid = typeof req.query.userId === 'string' ? req.query.userId : '';
  const stateRaw = uid ? `uid:${uid}|${Math.random().toString(36).slice(2)}` : Math.random().toString(36).slice(2);
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${encodeURIComponent(stateRaw)}`;
  console.log('[GOOGLE ADS CONNECT] redirectUri=', redirectUri, 'state=', stateRaw);
  if (!redirectUri) return res.status(500).json({ message: 'Redirect URI missing for Google Ads OAuth' });
  res.redirect(authUrl);
});

// Google Ads OAuth callback endpointi
router.get('/api/auth/googleads/callback', async (req: express.Request, res: express.Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
  if (!code) return res.status(400).send('Google OAuth kodu eksik.');
  try {
  // IMPORTANT: Use ONLY Google Ads specific credentials, no fallback to generic Google OAuth
  const clientId = (process.env.GOOGLE_ADS_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_ADS_CLIENT_SECRET || '').trim();
  
  if (!clientId || !clientSecret) {
    console.error('[GOOGLE ADS CALLBACK] Missing GOOGLE_ADS_CLIENT_ID or GOOGLE_ADS_CLIENT_SECRET');
    return res.status(500).send('Google Ads OAuth credentials not configured');
  }
    // Use same normalization logic as in connect
    const redirectEnv = (process.env.GOOGLE_ADS_REDIRECT_URI || '').trim();
    const computedRedirect = `${buildAppBase(req)}/api/auth/googleads/callback`;
    const redirectUri = (redirectEnv || computedRedirect).trim();
    
    // Debug: Log credentials being used (first/last 10 chars only for security)
    console.error('[GOOGLE ADS CREDENTIALS]', {
      clientId: clientId ? `${clientId.substring(0, 20)}...${clientId.substring(clientId.length - 10)}` : 'MISSING',
      clientSecret: clientSecret ? `${clientSecret.substring(0, 10)}...${clientSecret.substring(clientSecret.length - 5)}` : 'MISSING',
      redirectUri: redirectUri,
      clientIdLength: clientId.length,
      clientSecretLength: clientSecret.length
    });
    
    // Token alma
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientId || '');
    params.append('client_secret', clientSecret || '');
  params.append('redirect_uri', redirectUri || '');
    params.append('grant_type', 'authorization_code');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const tokenData = await tokenRes.json();
    console.error('[GOOGLE ADS TOKEN DEBUG]', tokenRes.status, tokenData);
    if (!tokenRes.ok || !tokenData.access_token) {
      const reason = tokenData.error_description || tokenData.error || 'unknown';
      throw new Error(`Token alınamadı (${reason})`);
    }
    // userId: state içinden oku, yoksa query fallback
    let stateUserId: string | null = null;
    if (stateParam) {
      try {
        const decoded = decodeURIComponent(stateParam);
        if (decoded.startsWith('uid:')) stateUserId = decoded.split('|')[0].replace('uid:', '');
      } catch (_) {}
    }
    const userId = (stateUserId || (typeof req.query.userId === 'string' ? req.query.userId : null)) || 'test-user';
    
    console.error('[GOOGLE ADS SAVE TO FIREBASE]', {
      userId,
      clientIdUsed: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
      clientIdFromGoogleAds: process.env.GOOGLE_ADS_CLIENT_ID ? 'YES' : 'NO',
      clientIdFromGeneric: process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO'
    });
    
    await admin.database().ref(`platformConnections/${userId}/google_ads`).set({
  accessToken: tokenData.access_token,
  refreshToken: tokenData.refresh_token,
  expiresIn: tokenData.expires_in,
  createdAt: Date.now(),
  isConnected: true,
  oauthClientId: clientId,
  oauthClientSecret: clientSecret ? 'set' : undefined,
    });
    // Note: Auto-detection of Google Ads accounts is challenging with google-ads-api v21
    // The user should select their account from the dropdown in Settings UI
    // The /api/googleads/accounts endpoint will fetch the list when they open the dropdown
    console.error('[GOOGLE ADS CALLBACK] Connection successful, user can now select account from dropdown');
    // NOT: Otomatik veri çekme kaldırıldı!
    // Kullanıcı hesap seçtikten sonra frontend'den veri çekme tetiklenecek
  return settingsRedirect(res, req, 'google_ads', true);
  } catch (err) {
    res.status(500).send('Google Ads token alma hatası: ' + err);
  }
});

// Google Ads bağlantısını temizleyen (disconnect) endpoint
router.post('/api/googleads/disconnect', async (req, res) => {
  try {
    const userId = (req.body.userId as string) || 'test-user';
    // Firebase bağlantısını sil
    await admin.database().ref(`platformConnections/${userId}/google_ads`).remove();

    // BigQuery tarafında sadece bu platforma ait verileri temizle
    try {
      const bq = getBigQuery();
      const dataset = process.env.BQ_DATASET || 'iqsion';
      const deleteSql = `
        DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
        WHERE userId = @userId AND source = 'google_ads'
      `;
      const [job] = await bq.createQueryJob({
        query: deleteSql,
        params: { userId },
        location: process.env.BQ_LOCATION || 'US',
      });
      await job.getQueryResults();
      console.log(`[DISCONNECT] Deleted BigQuery data for ${userId}/google_ads`);
    } catch (bqErr) {
      console.error(`[DISCONNECT] BigQuery cleanup failed for ${userId}/google_ads:`, bqErr);
      // BigQuery silme başarısız olsa bile disconnect devam etsin
    }

    return res.json({ message: 'Google Ads bağlantısı ve verileri silindi.' });
  } catch (e) {
    return res.status(500).json({ message: 'Google Ads bağlantısı silinemedi', error: String(e) });
  }
});

// Google Ads debug: surface connection and env presence (masked)
router.get('/api/googleads/debug', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    const snap = await admin.database().ref(`platformConnections/${userId}/google_ads`).once('value');
    const c = snap.val() || {};
    const mask = (v?: string) => {
      if (!v) return null;
      const s = String(v);
      if (s.length <= 6) return '***';
      return s.slice(0,3) + '***' + s.slice(-3);
    };
    const ageMs = c?.createdAt ? (Date.now() - Number(c.createdAt)) : null;
    const ttlMs = c?.expiresIn ? (Number(c.expiresIn) * 1000) : null;
    res.json({
      connection: {
        isConnected: !!c?.isConnected,
        accountId: c?.accountId || null,
        loginCustomerId: c?.loginCustomerId || null,
        hasAccessToken: !!c?.accessToken,
        hasRefreshToken: !!c?.refreshToken,
        createdAt: c?.createdAt || null,
        ageMs,
        expiresIn: c?.expiresIn || null,
        expiresInMs: ttlMs,
        oauthClientIdMasked: mask(c?.oauthClientId || '')
      },
      env: {
        GOOGLE_ADS_CLIENT_ID: (process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '').trim() ? 'set' : 'missing',
        GOOGLE_ADS_CLIENT_SECRET: (process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '').trim() ? 'set' : 'missing',
        GOOGLE_ADS_DEVELOPER_TOKEN: (process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '').trim() ? 'set' : 'missing',
      }
    });
  } catch (e) {
    res.status(500).json({ message: 'debug failed', error: String(e) });
  }
});

// Google Ads deep diagnose: attempt listAccessibleCustomers with all client pairs
router.get('/api/googleads/diagnose', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    const snap = await admin.database().ref(`platformConnections/${userId}/google_ads`).once('value');
    const c = snap.val() || {};
    const refreshToken: string | undefined = c.refreshToken;
    const accessToken: string | undefined = c.accessToken;
    const devToken = (process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '').trim();
    const pairs: Array<{ label: string; id: string; secret: string }> = [];
    const pushPair = (label: string, id?: string, secret?: string) => {
      const i = (id || '').trim(); const s = (secret || '').trim();
      if (i && s) pairs.push({ label, id: i, secret: s });
    };
    pushPair('stored', c.oauthClientId, undefined); // stored secret masked, skip if unknown
    pushPair('ads', process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
    pushPair('generic', process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    // Deduplicate by id
    const seen = new Set<string>();
    const finalPairs = pairs.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
    const attempts: any[] = [];
    // Helper: listAccessibleCustomers using provided access token
    const tryList = async (token: string, version: string) => {
      const url = `https://googleads.googleapis.com/${version}/customers:listAccessibleCustomers`;
      const r = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${token}`, 'developer-token': devToken } });
      const txt = await r.text();
      let json: any = null; try { json = JSON.parse(txt); } catch { json = { raw: txt }; }
      return { status: r.status, ok: r.ok, body: json };
    };
    // If refresh needed, attempt with each pair
    const refreshedTokens: Array<{ pair: any; token: any }> = [];
    if (refreshToken) {
      for (const pair of finalPairs) {
        if (!pair.secret) continue; // skip stored without secret
        try {
          const params = new URLSearchParams();
          params.append('client_id', pair.id);
          params.append('client_secret', pair.secret);
          params.append('refresh_token', refreshToken);
          params.append('grant_type', 'refresh_token');
          const tokenResp = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
          const tokenJson = await tokenResp.json();
          attempts.push({ type: 'refresh', clientLabel: pair.label, clientId: pair.id, status: tokenResp.status, ok: tokenResp.ok, error: tokenJson.error || null });
          if (tokenResp.ok && tokenJson.access_token) {
            refreshedTokens.push({ pair, token: tokenJson });
          }
        } catch (e: any) {
          attempts.push({ type: 'refresh', clientLabel: pair.label, clientId: pair.id, status: -1, ok: false, error: e?.message || String(e) });
        }
      }
    }
    // Try listAccessibleCustomers with existing accessToken first
    if (accessToken) {
      try {
        const list17 = await tryList(accessToken, 'v17');
        attempts.push({ type: 'listAccessibleCustomers', clientLabel: 'existing', version: 'v17', ...list17 });
        if (!list17.ok) {
          const list18 = await tryList(accessToken, 'v18');
          attempts.push({ type: 'listAccessibleCustomers', clientLabel: 'existing', version: 'v18', ...list18 });
        }
      } catch (e: any) {
        attempts.push({ type: 'listAccessibleCustomers', clientLabel: 'existing', version: 'v17', status: -1, ok: false, error: e?.message || String(e) });
      }
    }
    // Try with each refreshed token
    for (const rt of refreshedTokens) {
      try {
        const list17 = await tryList(rt.token.access_token, 'v17');
        attempts.push({ type: 'listAccessibleCustomers', clientLabel: rt.pair.label, version: 'v17', ...list17 });
        if (!list17.ok) {
          const list18 = await tryList(rt.token.access_token, 'v18');
          attempts.push({ type: 'listAccessibleCustomers', clientLabel: rt.pair.label, version: 'v18', ...list18 });
        }
      } catch (e: any) {
        attempts.push({ type: 'listAccessibleCustomers', clientLabel: rt.pair.label, version: 'v17', status: -1, ok: false, error: e?.message || String(e) });
      }
    }
    // Summarize probable root cause
    let probable: string | null = null;
    if (!devToken) probable = 'Developer token missing';
    else if (!attempts.some(a => a.type === 'listAccessibleCustomers' && a.ok && Array.isArray(a.body?.resourceNames) && a.body.resourceNames.length)) {
      const hasInvalidClient = attempts.some(a => String(a.body?.error?.message || '').match(/invalid_client/i));
      if (hasInvalidClient) probable = 'OAuth client mismatch (reconnect using Ads client)';
      else {
        const permDenied = attempts.some(a => String(a.body?.error?.message || '').match(/permission|auth/i));
        probable = permDenied ? 'Developer token or Google user lacks Ads account access' : 'No accessible customers returned';
      }
    } else {
      probable = 'OK';
    }
    res.json({ userId, hasRefreshToken: !!refreshToken, hasAccessToken: !!accessToken, developerTokenPresent: !!devToken, attempts, probable });
  } catch (e: any) {
    res.status(500).json({ message: 'diagnose failed', error: e?.message || String(e) });
  }
});

// ...existing code...
  // Reklam hesabı seçimini güncelleyen endpoint
  router.post('/api/connections', async (req, res) => {
    try {
      const userId = req.body.userId || 'test-user';
      const platform = req.body.platform;
      // Search Console: selected site kaydet
      if (platform === 'search_console') {
        const siteUrl = req.body.siteUrl;
        if (!siteUrl || typeof siteUrl !== 'string') {
          return res.status(400).json({ message: 'siteUrl eksik.' });
        }
        await admin.database().ref(`platformConnections/${userId}/search_console/selectedSite`).set(siteUrl);
        await admin.database().ref(`platformConnections/${userId}/search_console/updatedAt`).set(new Date().toISOString());
        return res.json({ message: 'Search Console site seçimi güncellendi.', siteUrl });
      }
      // Shopify mağaza adresi kaydetme
      if (platform === 'shopify') {
        const storeUrl = req.body.storeUrl;
        if (!storeUrl) {
          return res.status(400).json({ message: 'Shopify mağaza adresi eksik.' });
        }
        
        // ADIM 1: Eski mağazanın BigQuery verilerini sil
        try {
          const bq = getBigQuery();
          const dataset = process.env.BQ_DATASET || 'iqsion';
          console.log(`[SHOPIFY STORE CHANGE] Deleting old store data for ${userId}`);
          
          await bq.query({
            query: `
              DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
              WHERE userId = @userId AND source = 'shopify' AND accountId = @accountId
            `,
            params: { userId, accountId: storeUrl },
            location: process.env.BQ_LOCATION || 'US',
          });
          
          console.log(`[SHOPIFY STORE CHANGE] Old data deleted for ${userId}`);
        } catch (err) {
          console.error('[SHOPIFY STORE CHANGE] Failed to delete old data:', err);
          // Devam et, ingest yine de çalışsın
        }
        
        // ADIM 2: Yeni mağazayı Firebase'e kaydet
        await admin.database().ref(`platformConnections/${userId}/shopify`).update({ storeUrl, updatedAt: new Date().toISOString() });
        
        // ADIM 3: Yeni mağaza için veri çek
        try {
          const adminKey = (process.env.ADMIN_API_KEY || '').trim();
          const ingestBase = buildApiBase(req);
          const settingsSnap = await admin.database().ref(`settings/${userId}`).once('value');
          const settings = settingsSnap.val() || {};
          const ingestDays = Number(settings.initialIngestDays || 30);
          
          const today = new Date();
          const endD = new Date(today); endD.setDate(today.getDate() - 1);
          const startD = new Date(endD); startD.setDate(endD.getDate() - (ingestDays - 1));
          const fmt = (d: Date) => d.toISOString().slice(0, 10);
          const body = JSON.stringify({ userId, from: fmt(startD), to: fmt(endD) });
          
          console.log(`[SHOPIFY STORE CHANGE] Triggering ingest for ${userId}, new store: ${storeUrl}`);
          fetchWithTimeout(`${ingestBase}/api/ingest/shopify`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', ...(adminKey ? { 'x-admin-key': adminKey } : {}) }, 
            body 
          }, 15000).catch((err) => {
            console.error('[SHOPIFY STORE CHANGE] Ingest failed:', err);
          });
        } catch (err) {
          console.error('[SHOPIFY STORE CHANGE] Error triggering ingest:', err);
        }
        
        return res.json({ message: 'Shopify mağaza adresi kaydedildi. Eski veriler silindi, yeni veriler çekiliyor.', storeUrl });
      }
      // Meta reklam hesabı güncelleme
      if (platform === 'meta_ads') {
        const accountId = req.body.accountId;
        if (!accountId) {
          return res.status(400).json({ message: 'Reklam hesabı ID eksik.' });
        }
        
        // ADIM 1: Eski hesabın BigQuery verilerini sil
        try {
          const bq = getBigQuery();
          const dataset = process.env.BQ_DATASET || 'iqsion';
          console.log(`[META ACCOUNT CHANGE] Deleting old account data for ${userId}`);
          
          await bq.query({
            query: `
              DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
              WHERE userId = @userId AND source = 'meta_ads' AND accountId = @accountId
            `,
            params: { userId, accountId },
            location: process.env.BQ_LOCATION || 'US',
          });
          
          console.log(`[META ACCOUNT CHANGE] Old data deleted for ${userId}`);
        } catch (err) {
          console.error('[META ACCOUNT CHANGE] Failed to delete old data:', err);
          // Devam et, ingest yine de çalışsın
        }
        
        // ADIM 2: Yeni hesabı Firebase'e kaydet
        await admin.database().ref(`platformConnections/${userId}/meta_ads/accountId`).set(accountId);
        // Reset sync markers so yeni hesap tam aralıkla ingest edilsin
        await admin.database().ref(`platformConnections/${userId}/meta_ads`).update({
          accountId,
          updatedAt: new Date().toISOString(),
          lastSyncAt: null,
          lastIngestRange: null,
        });
        
        // ADIM 3: Yeni hesap için veri çek
        try {
          const adminKey = (process.env.ADMIN_API_KEY || '').trim();
          const ingestBase = buildApiBase(req);
          const settingsSnap = await admin.database().ref(`settings/${userId}`).once('value');
          const settings = settingsSnap.val() || {};
          const ingestDays = Number(settings.initialIngestDays || 30);
          
          const today = new Date();
          const endD = new Date(today); endD.setDate(today.getDate() - 1);
          const startD = new Date(endD); startD.setDate(endD.getDate() - (ingestDays - 1));
          const fmt = (d: Date) => d.toISOString().slice(0, 10);
          const body = JSON.stringify({ userId, from: fmt(startD), to: fmt(endD) });
          
          console.log(`[META ACCOUNT CHANGE] Triggering ingest for ${userId}, new account: ${accountId}`);
          fetchWithTimeout(`${ingestBase}/api/ingest/meta-ads`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', ...(adminKey ? { 'x-admin-key': adminKey } : {}) }, 
            body 
          }, 15000).catch((err) => {
            console.error('[META ACCOUNT CHANGE] Ingest failed:', err);
          });
        } catch (err) {
          console.error('[META ACCOUNT CHANGE] Error triggering ingest:', err);
        }
        
        return res.json({ message: 'Reklam hesabı güncellendi. Eski veriler silindi, yeni veriler çekiliyor.', accountId });
      }
      // Google Analytics propertyId güncelleme
      if (platform === 'google_analytics') {
        const propertyId = req.body.propertyId;
        if (!propertyId) {
          return res.status(400).json({ message: 'Property ID eksik.' });
        }
        
        // ADIM 1: Eski property'nin BigQuery verilerini sil
        try {
          const bq = getBigQuery();
          const dataset = process.env.BQ_DATASET || 'iqsion';
          console.log(`[GA4 PROPERTY CHANGE] Deleting old property data for ${userId}`);
          
          await bq.query({
            query: `
              DELETE FROM \`${bq.projectId}.${dataset}.ga4_daily\`
              WHERE userId = @userId
            `,
            params: { userId },
            location: process.env.BQ_LOCATION || 'US',
          });
          
          await bq.query({
            query: `
              DELETE FROM \`${bq.projectId}.${dataset}.ga4_geo_daily\`
              WHERE userId = @userId
            `,
            params: { userId },
            location: process.env.BQ_LOCATION || 'US',
          });
          
          console.log(`[GA4 PROPERTY CHANGE] Old data deleted for ${userId}`);
        } catch (err) {
          console.error('[GA4 PROPERTY CHANGE] Failed to delete old data:', err);
          // Devam et, ingest yine de çalışsın
        }
        
        // ADIM 2: Yeni property'yi Firebase'e kaydet
        await admin.database().ref(`platformConnections/${userId}/google_analytics/propertyId`).set(propertyId);
        await admin.database().ref(`platformConnections/${userId}/google_analytics/updatedAt`).set(new Date().toISOString());
        
        // ADIM 3: Yeni property için veri çek
        try {
          const adminKey = (process.env.ADMIN_API_KEY || '').trim();
          const ingestBase = buildApiBase(req);
          const settingsSnap = await admin.database().ref(`settings/${userId}`).once('value');
          const settings = settingsSnap.val() || {};
          const ingestDays = Number(settings.initialIngestDays || 30);
          
          const today = new Date();
          const endD = new Date(today); endD.setDate(today.getDate() - 1);
          const startD = new Date(endD); startD.setDate(endD.getDate() - (ingestDays - 1));
          const fmt = (d: Date) => d.toISOString().slice(0, 10);
          const body = JSON.stringify({ userId, from: fmt(startD), to: fmt(endD) });
          
          console.log(`[GA4 PROPERTY CHANGE] Triggering ingest for ${userId}, new property: ${propertyId}`);
          fetchWithTimeout(`${ingestBase}/api/ingest/ga4`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', ...(adminKey ? { 'x-admin-key': adminKey } : {}) }, 
            body 
          }, 15000).catch((err) => {
            console.error('[GA4 PROPERTY CHANGE] Ingest failed:', err);
          });
        } catch (err) {
          console.error('[GA4 PROPERTY CHANGE] Error triggering ingest:', err);
        }
        
        return res.json({ message: 'Google Analytics property ID güncellendi. Eski veriler silindi, yeni veriler çekiliyor.', propertyId });
      }
      // Google Ads reklam hesabı güncelleme
      if (platform === 'google_ads') {
        const accountId = req.body.accountId;
        const loginCustomerId = req.body.loginCustomerId;
        
        // Eğer hesap değişiyorsa, eski verileri sil
        if (accountId) {
          try {
            const bq = getBigQuery();
            const dataset = process.env.BQ_DATASET || 'iqsion';
            console.log(`[GOOGLE ADS ACCOUNT CHANGE] Deleting old account data for ${userId}`);
            
            await bq.query({
              query: `
                DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
                WHERE userId = @userId AND source = 'google_ads' AND accountId = @accountId
              `,
              params: { userId, accountId },
              location: process.env.BQ_LOCATION || 'US',
            });
            
            console.log(`[GOOGLE ADS ACCOUNT CHANGE] Old data deleted for ${userId}`);
          } catch (err) {
            console.error('[GOOGLE ADS ACCOUNT CHANGE] Failed to delete old data:', err);
            // Devam et, ingest yine de çalışsın
          }
        }
        
        if (loginCustomerId) {
          await admin.database().ref(`platformConnections/${userId}/google_ads/loginCustomerId`).set(loginCustomerId);
        }
        if (accountId) {
          // Reset sync markers to force fresh ingest for the new account
          await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
            accountId,
            updatedAt: new Date().toISOString(),
            lastSyncAt: null,
            lastIngestRange: null,
          });
          // Fire-and-forget initial ingest (kullanıcının initialIngestDays ayarını oku)
          try {
            const adminKey = (process.env.ADMIN_API_KEY || '').trim();
            const ingestBase = buildApiBase(req);
            const settingsSnap = await admin.database().ref(`settings/${userId}`).once('value');
            const settings = settingsSnap.val() || {};
            const ingestDays = Number(settings.initialIngestDays || 30);
            
            const today = new Date();
            const endD = new Date(today); endD.setDate(today.getDate() - 1);
            const startD = new Date(endD); startD.setDate(endD.getDate() - (ingestDays - 1));
            const fmt = (d: Date) => d.toISOString().slice(0, 10);
            const body = JSON.stringify({ userId, from: fmt(startD), to: fmt(endD) });
            
            console.log(`[GOOGLE ADS ACCOUNT CHANGE] Triggering ingest for ${userId}, new account: ${accountId}`);
            fetchWithTimeout(`${ingestBase}/api/ingest/google-ads`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(adminKey ? { 'x-admin-key': adminKey } : {}) }, body }, 10000).catch((err) => {
              console.error('[GOOGLE ADS ACCOUNT CHANGE] Ingest failed:', err);
            });
          } catch (err) {
            console.error('[GOOGLE ADS ACCOUNT CHANGE] Error triggering ingest:', err);
          }
        }
        return res.json({ message: 'Google Ads bağlantısı güncellendi. Eski veriler silindi, yeni veriler çekiliyor.', accountId, loginCustomerId });
      }
      // TikTok reklam hesabı güncelleme
      if (platform === 'tiktok') {
        const accountId = req.body.accountId;
        if (!accountId) {
          return res.status(400).json({ message: 'Reklam hesabı ID eksik.' });
        }
        await admin.database().ref(`platformConnections/${userId}/tiktok/accountId`).set(accountId);
        return res.json({ message: 'TikTok reklam hesabı güncellendi.', accountId });
      }
      // LinkedIn Ads reklam hesabı güncelleme
      if (platform === 'linkedin_ads') {
        const accountId = req.body.accountId;
        if (!accountId) {
          return res.status(400).json({ message: 'Reklam hesabı ID eksik.' });
        }
        await admin.database().ref(`platformConnections/${userId}/linkedin_ads/accountId`).set(accountId);
        // İlk ingest tetikle (son 7 gün) - fire and forget
        try {
          const adminKey = (process.env.ADMIN_API_KEY || '').trim();
          const ingestBase = buildApiBase(req);
          const today = new Date();
          const endD = new Date(today); endD.setDate(today.getDate() - 1);
          const startD = new Date(endD); startD.setDate(endD.getDate() - 6);
          const fmt = (d: Date) => d.toISOString().slice(0, 10);
          const body = JSON.stringify({ userId, from: fmt(startD), to: fmt(endD) });
          fetchWithTimeout(`${ingestBase}/api/ingest/linkedin-ads`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(adminKey ? { 'x-admin-key': adminKey } : {}) }, body }, 10000).catch(()=>{});
        } catch {}
        return res.json({ message: 'LinkedIn Ads reklam hesabı güncellendi.', accountId });
      }
      return res.status(400).json({ message: 'Desteklenmeyen platform.' });
    } catch (error) {
      res.status(500).json({ message: 'Bağlantı güncellenemedi', error });
    }
  });
  // Facebook Ads API'den ham veri çekme (test amaçlı)
  router.get('/api/meta/ads/raw', async (req, res) => {
    try {
      const accessToken = req.query.accessToken || process.env.META_ACCESS_TOKEN;
      const adAccountId = req.query.adAccountId || 'act_1614280352239098';
      const since = req.query.since || '2025-08-09';
      const until = req.query.until || '2025-08-16';
      // Ads Manager ile birebir aynı metrikler ve seviye
      const fields = [
        'spend',
        'impressions',
        'reach',
        'clicks'
      ].join(',');
      const level = 'campaign';
      let url = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=${fields}&level=${level}&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
  // Tüm kampanyalar çekilecek, filtering kaldırıldı
  console.log('[MetaAds RAW TEST] Facebook API URL:', url);
  let allData: any[] = [];
      let nextUrl = url;
      // Pagination desteği
      while (nextUrl) {
        const response = await fetch(nextUrl);
        const data = await response.json();
        if (data.error) {
          console.error('[MetaAds RAW ERROR] Facebook API error:', JSON.stringify(data.error));
          break;
        }
        if (data.warnings) {
          console.warn('[MetaAds RAW WARNING] Facebook API warnings:', JSON.stringify(data.warnings));
        }
        if (data.message) {
          console.warn('[MetaAds RAW MESSAGE] Facebook API message:', JSON.stringify(data.message));
        }
        if (data.data) {
          allData = allData.concat(data.data);
        }
        nextUrl = data.paging && data.paging.next ? data.paging.next : null;
      }
      console.log('[MetaAds RAW TEST] Facebook API response:', JSON.stringify(allData));
      res.json({ data: allData });
    } catch (err) {
      console.error('[MetaAds RAW ERROR] Exception:', err);
      res.status(500).json({ error: 'Meta raw test failed', details: err });
    }
  });
  // Kullanıcının Meta ad account'larını listeleyen endpoint
  router.get('/api/meta/adaccounts', async (req, res) => {
    try {
      const userId = req.query.userId || 'test-user';
      // Firebase'den access token çek
      const snapshot = await admin.database().ref(`platformConnections/${userId}/meta_ads`).once('value');
      const metaData = snapshot.val();
      const accessToken = metaData?.accessToken || req.query.accessToken || process.env.META_ACCESS_TOKEN;
      if (!accessToken) {
        return res.status(400).json({ message: 'Meta access token eksik.' });
      }
      // Facebook API'dan ad account'ları çek
      const url = `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Ad account listesi alınamadı', error });
    }
  });

  // BigQuery cleanup endpoint - hesap değişikliğinde eski hesabın verilerini sil
  router.post('/api/bigquery/cleanup', async (req, res) => {
    try {
      const userId = (req.query.userId || req.body.userId || 'test-user') as string;
      const platform = (req.query.platform || req.body.platform) as string;
      let accountId = (req.query.accountId || req.body.accountId) as string;
      
      if (!platform) {
        return res.status(400).json({ message: 'Platform belirtilmedi.' });
      }
      if (!accountId) {
        return res.status(400).json({ message: 'Account ID belirtilmedi.' });
      }

      // Google Ads accountId'leri tireleri temizle (BigQuery'de tiresiz saklanıyor)
      if (platform === 'google_ads') {
        accountId = String(accountId).replace(/-/g, '');
      }

      const bq = getBigQuery();
      const dataset = process.env.BQ_DATASET || 'iqsion';
      let deletedRows = 0;

      // Platform'a göre silme işlemi
      if (platform === 'google_analytics') {
        // GA4 için propertyId ile sil
        const deleteDailySql = `
          DELETE FROM \`${bq.projectId}.${dataset}.ga4_daily\`
          WHERE userId = @userId AND propertyId = @accountId
        `;
        const [dailyJob] = await bq.createQueryJob({
          query: deleteDailySql,
          params: { userId, accountId },
          location: process.env.BQ_LOCATION || 'US',
        });
        const [dailyResult] = await dailyJob.getQueryResults();
        
        const deleteGeoSql = `
          DELETE FROM \`${bq.projectId}.${dataset}.ga4_geo_daily\`
          WHERE userId = @userId AND propertyId = @accountId
        `;
        const [geoJob] = await bq.createQueryJob({
          query: deleteGeoSql,
          params: { userId, accountId },
          location: process.env.BQ_LOCATION || 'US',
        });
        await geoJob.getQueryResults();
        
        console.log(`[CLEANUP] Deleted GA4 data for ${userId}/property=${accountId}`);
      } else {
        // Diğer platformlar için accountId ile sil
        const deleteSql = `
          DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
          WHERE userId = @userId AND source = @platform AND accountId = @accountId
        `;
        const [job] = await bq.createQueryJob({
          query: deleteSql,
          params: { userId, platform, accountId },
          location: process.env.BQ_LOCATION || 'US',
        });
        const [result] = await job.getQueryResults();
        console.log(`[CLEANUP] Deleted metrics data for ${userId}/${platform}/account=${accountId}`);
      }

      return res.json({ success: true, message: `${platform} hesabının verileri temizlendi (accountId: ${accountId})` });
    } catch (error) {
      console.error('[CLEANUP] Error:', error);
      return res.status(500).json({ message: 'Veri temizleme başarısız', error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Meta bağlantısını kaldırma endpointi
  router.post('/api/disconnect', async (req, res) => {
    try {
      const userId = (req.query.userId || req.body.userId || 'test-user') as string;
      const rawPlatform = (req.query.platform || req.body.platform) as string | undefined;
      if (!rawPlatform) {
        return res.status(400).json({ message: 'Platform belirtilmedi.' });
      }
      const normalize = (p: string) => {
        const id = String(p).trim();
        if (id === 'google_search_console') return 'search_console';
        return id;
      };
      const platform = normalize(rawPlatform);
      const refBase = admin.database().ref(`platformConnections/${userId}`);
      
      // ÖNCELİKLE BigQuery cleanup yap (Firebase'den silmeden önce propertyId/accountId al)
      try {
        const bq = getBigQuery();
        const dataset = process.env.BQ_DATASET || 'iqsion';
        
        // Special handling for Google Analytics - delete from GA4 tables
        if (platform === 'google_analytics') {
          // Get current propertyId from Firebase BEFORE deletion
          const gaSnapshot = await refBase.child('google_analytics').once('value');
          const gaData = gaSnapshot.val();
          const propertyId = gaData?.propertyId;
          
          if (propertyId) {
            // Delete from ga4_daily
            const deleteDailySql = `
              DELETE FROM \`${bq.projectId}.${dataset}.ga4_daily\`
              WHERE userId = @userId AND propertyId = @propertyId
            `;
            const [dailyJob] = await bq.createQueryJob({
              query: deleteDailySql,
              params: { userId, propertyId },
              location: process.env.BQ_LOCATION || 'US',
            });
            await dailyJob.getQueryResults();
            
            // Delete from ga4_geo_daily
            const deleteGeoSql = `
              DELETE FROM \`${bq.projectId}.${dataset}.ga4_geo_daily\`
              WHERE userId = @userId AND propertyId = @propertyId
            `;
            const [geoJob] = await bq.createQueryJob({
              query: deleteGeoSql,
              params: { userId, propertyId },
              location: process.env.BQ_LOCATION || 'US',
            });
            await geoJob.getQueryResults();
            
            console.log(`[DISCONNECT] Deleted GA4 data for ${userId}/property=${propertyId}`);
          } else {
            // propertyId yoksa userId ile tüm GA4 verilerini sil
            console.log(`[DISCONNECT] No propertyId found, deleting all GA4 data for ${userId}`);
            const deleteDailySql = `DELETE FROM \`${bq.projectId}.${dataset}.ga4_daily\` WHERE userId = @userId`;
            const [dailyJob] = await bq.createQueryJob({
              query: deleteDailySql,
              params: { userId },
              location: process.env.BQ_LOCATION || 'US',
            });
            await dailyJob.getQueryResults();
            
            const deleteGeoSql = `DELETE FROM \`${bq.projectId}.${dataset}.ga4_geo_daily\` WHERE userId = @userId`;
            const [geoJob] = await bq.createQueryJob({
              query: deleteGeoSql,
              params: { userId },
              location: process.env.BQ_LOCATION || 'US',
            });
            await geoJob.getQueryResults();
          }
        } else {
          // Regular platform - get accountId first, then delete from metrics_daily
          const platformSnapshot = await refBase.child(platform).once('value');
          const platformData = platformSnapshot.val();
          let accountId = platformData?.accountId;
          
          // Google Ads accountId'leri tireleri temizle (BigQuery'de tiresiz saklanıyor)
          if (platform === 'google_ads' && accountId) {
            accountId = String(accountId).replace(/-/g, '');
          }
          
          if (accountId) {
            // accountId varsa spesifik sil
            const deleteSql = `
              DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
              WHERE userId = @userId AND source = @source AND accountId = @accountId
            `;
            const [job] = await bq.createQueryJob({
              query: deleteSql,
              params: { userId, source: platform, accountId },
              location: process.env.BQ_LOCATION || 'US',
            });
            await job.getQueryResults();
            console.log(`[DISCONNECT] Deleted BigQuery data for ${userId}/${platform}/account=${accountId}`);
          } else {
            // accountId yoksa source bazlı sil
            const deleteSql = `
              DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
              WHERE userId = @userId AND source = @source
            `;
            const [job] = await bq.createQueryJob({
              query: deleteSql,
              params: { userId, source: platform },
              location: process.env.BQ_LOCATION || 'US',
            });
            await job.getQueryResults();
            console.log(`[DISCONNECT] Deleted BigQuery data for ${userId}/${platform} (all accounts)`);
          }
        }
      } catch (bqErr) {
        console.error(`[DISCONNECT] BigQuery cleanup failed for ${userId}/${platform}:`, bqErr);
        // Don't fail the disconnect if BigQuery cleanup fails
      }

      // SONRA Firebase'den bağlantıyı sil
      await refBase.child(platform).remove();
      
      // Backwards-compat: if caller sent the other alias, remove both
      if (rawPlatform === 'google_search_console') {
        await refBase.child('google_search_console').remove().catch(() => {});
      } else if (rawPlatform === 'search_console') {
        await refBase.child('google_search_console').remove().catch(() => {});
      }

      return res.json({ message: `${platform} bağlantısı ve verileri kaldırıldı.` });
    } catch (error) {
      return res.status(500).json({ message: 'Bağlantı kaldırılamadı', error: error instanceof Error ? error.message : String(error) });
    }
  });
  // Meta (Facebook/Instagram) reklam verisi çekme endpointi
  router.get('/api/meta/ads', async (req, res) => {
    try {
      const userId = req.query.userId || 'test-user';
      // Firebase'den ilgili kullanıcının Meta bağlantı bilgilerini çek
      const snapshot = await admin.database().ref(`platformConnections/${userId}/meta_ads`).once('value');
      const metaData = snapshot.val();
      const accessToken = metaData?.accessToken || req.query.accessToken || process.env.META_ACCESS_TOKEN;
      const adAccountId = metaData?.accountId || req.query.adAccountId || process.env.META_AD_ACCOUNT_ID;
      if (!accessToken || !adAccountId) {
        console.log('[MetaAds DEBUG] Eksik accessToken veya adAccountId:', { accessToken, adAccountId });
        return res.status(400).json({ message: 'Meta access token veya ad account ID eksik.' });
      }
      // Dinamik parametreler: fields, date_preset veya time_range
      // Click metriğini seç: 'all' (clicks) veya 'link' (inline_link_clicks)
      const clickMetric = String(req.query.clickMetric || 'all').toLowerCase();
      // Varsayılan metrikler: spend, impressions, reach ve seçilen click metriği + kampanya adı
      const baseFields = ['spend','impressions','reach','campaign_name'];
      const clickFields = clickMetric === 'link' ? ['inline_link_clicks','inline_link_click_ctr'] : ['clicks','ctr'];
      const defaultFields = [...baseFields, ...clickFields].join(',');
      const fields = (req.query.fields as string) || defaultFields;
      // Tarih filtresi: kesin aralık kullan. Varsayılan: son 7 gün, dünü bitiş al (partial-day farklarını önler)
      let datePreset = '';
      let timeRange = '';
      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
      const start = new Date(yesterday); start.setDate(yesterday.getDate() - 6);
      const since = start.toISOString().slice(0, 10);
      const until = yesterday.toISOString().slice(0, 10);
      timeRange = `&time_range={\"since\":\"${since}\",\"until\":\"${until}\"}`;
      // Eğer query'den tarih gelirse onu kullan
      if (req.query.start_date && req.query.end_date) {
        timeRange = `&time_range={\"since\":\"${req.query.start_date}\",\"until\":\"${req.query.end_date}\"}`;
      }
      // Teslimat filtresi: delivery=active ise sadece aktif kampanyaları filtrele, aksi halde filtreleme yapma
      const delivery = String(req.query.delivery || '').toLowerCase();
      const filtering = delivery === 'active' ? '&filtering=[{"field":"campaign.delivery_info","operator":"IN","value":["active"]}]' : '';
      const level = (req.query.level as string) || 'ad';
      const url = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=${fields}${timeRange}${filtering}&level=${encodeURIComponent(level)}&access_token=${accessToken}`;
          console.log('[MetaAds DEBUG] Facebook API URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        console.error('[MetaAds ERROR] Facebook API error:', JSON.stringify(data.error));
      }
        console.log('[MetaAds DEBUG] Facebook API response:', JSON.stringify(data));
        if (data.error) {
          console.error('[MetaAds ERROR] Facebook API error:', JSON.stringify(data.error));
        }
        if (data.warnings) {
          console.warn('[MetaAds WARNING] Facebook API warnings:', JSON.stringify(data.warnings));
        }
        if (data.message) {
          console.warn('[MetaAds MESSAGE] Facebook API message:', JSON.stringify(data.message));
        }
      res.json(data);
    } catch (error) {
      console.error('Meta reklam verisi çekme hatası:', error);
      res.status(500).json({ message: 'Meta reklam verisi çekilemedi', error });
    }
  });

  // Meta (Facebook/Instagram) özet verisi (toplamlar) endpointi
  router.get('/api/meta/summary', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
      const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
      // Bağlantı bilgilerini çek
      const snapshot = await admin.database().ref(`platformConnections/${userId}/meta_ads`).once('value');
      const metaData = snapshot.val();
      const accessToken = metaData?.accessToken || process.env.META_ACCESS_TOKEN;
      let adAccountId = metaData?.accountId || process.env.META_AD_ACCOUNT_ID || '';
      if (!accessToken) {
        return res.status(400).json({ message: 'Meta bağlantısı bulunamadı (token eksik).' });
      }
      // Eğer hesap ID yoksa otomatik tespit et ve kalıcı kaydet
      if (!adAccountId) {
        try {
          const accResp = await fetchWithTimeout(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${accessToken}`, { method: 'GET' }, 10000);
          const accJson: any = await accResp.json();
          const first = accJson?.data?.[0];
          if (first?.id) {
            adAccountId = first.id;
            await admin.database().ref(`platformConnections/${userId}/meta_ads`).update({
              accountId: first.id,
              accountName: first.name || null,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          // yoksay; hesap bulunamazsa aşağıda hata verilecek
        }
      }
      if (!adAccountId) {
        return res.status(400).json({ message: 'Meta ad account ID bulunamadı. Lütfen Ayarlar > Meta Ads bölümünden bir hesap seçin.' });
      }

      // Tarih aralığı zorunlu; yoksa son 30 gün (dün dahil) uygula
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const defaultStart = new Date(yesterday);
      defaultStart.setDate(yesterday.getDate() - 29);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const since = startDate || fmt(defaultStart);
      const until = endDate || fmt(yesterday);

      // 1) Günlük kırılımla verileri çek (grafikler için)
      // Ads Manager uyumu: varsayılan clicks=clicks (all). İsteğe bağlı link tıklaması için clickMetric=link kullan.
      const clickMetric = (typeof req.query.clickMetric === 'string' ? req.query.clickMetric : 'all').toLowerCase();
      const dayFields = clickMetric === 'link'
        ? ['spend','impressions','inline_link_clicks','ctr','inline_link_click_ctr'].join(',')
        : ['spend','impressions','clicks','ctr'].join(',');
      const dailyUrl = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=${dayFields}&level=account&time_increment=1&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
      const dayResp = await fetchWithTimeout(dailyUrl, { method: 'GET' }, 20000);
      const dayJson = await dayResp.json();
      if (!dayResp.ok || dayJson.error) {
        return res.status(dayResp.status || 500).json({ message: 'Meta günlük veriler alınamadı', error: dayJson.error || dayJson });
      }

      const dayMap: Record<string, { spend: number; impressions: number; clicks: number; ctr: number; link_ctr?: number; } > = {};
      for (const r of (dayJson.data || [])) {
        const d = r.date_start || '';
        if (!d) continue;
        dayMap[d] = {
          spend: Number(r.spend || 0),
          impressions: Number(r.impressions || 0),
          // clicks: seçilen click metriğine göre
          clicks: clickMetric === 'link' ? Number(r.inline_link_clicks || 0) : Number(r.clicks || 0),
          // ctr: CTR(all) kullan
          ctr: Number(r.ctr || 0),
          ...(clickMetric === 'link' ? { link_ctr: Number(r.inline_link_click_ctr || 0) } : {}),
        };
      }
      // Zero-fill missing days for chart continuity
      const rows: Array<{ date: string; spend: number; impressions: number; clicks: number; ctr: number }> = [];
      const cursor = new Date(since);
      const endD = new Date(until);
      while (cursor <= endD) {
        const key = cursor.toISOString().slice(0, 10);
        const v = dayMap[key] || { spend: 0, impressions: 0, clicks: 0, ctr: 0, link_ctr: 0 } as any;
        rows.push({ date: key, spend: v.spend, impressions: v.impressions, clicks: v.clicks, ctr: v.ctr });
        cursor.setDate(cursor.getDate() + 1);
      }

      // 2) Toplamları tek satırda çek (Ads Manager toplamıyla daha uyumlu)
      const totalFields = (clickMetric === 'link'
        ? ['spend','impressions','inline_link_clicks','ctr']
        : ['spend','impressions','clicks','ctr']
      ).join(',');
      const totalUrl = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=${totalFields}&level=account&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
      const totResp = await fetchWithTimeout(totalUrl, { method: 'GET' }, 20000);
      const totJson = await totResp.json();
      if (!totResp.ok || totJson.error) {
        return res.status(totResp.status || 500).json({ message: 'Meta toplam veriler alınamadı', error: totJson.error || totJson });
      }
  const totalRow = (totJson.data || [])[0] || {};
  const tSpend = Number(totalRow.spend || 0);
  const tImpr = Number(totalRow.impressions || 0);
  const tClicks = clickMetric === 'link' ? Number(totalRow.inline_link_clicks || 0) : Number(totalRow.clicks || 0);
  const tCtrAll = Number(totalRow.ctr || 0);
  const tCpc = tClicks > 0 ? tSpend / tClicks : 0;

      return res.json({
        rows,
        totals: { spend: tSpend, impressions: tImpr, clicks: tClicks, ctr: tCtrAll, cpc: tCpc, clickMetric },
        requestedRange: { startDate: since, endDate: until }
      });
    } catch (error) {
      console.error('[Meta SUMMARY ERROR]', error);
      return res.status(500).json({ message: 'Meta özet verisi çekilemedi', error: String(error) });
    }
  });

  // Meta (Facebook/Instagram) summary from BigQuery (metrics_daily)
  router.get('/api/meta/summary-bq', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const clickMetric = (typeof req.query.clickMetric === 'string' ? req.query.clickMetric : 'all').toLowerCase();

      // Get selected accountId from connections
      const snap = await admin.database().ref(`platformConnections/${userId}/meta_ads`).once('value');
      const metaConn = snap.val() || {};
      let accountId = metaConn.accountId || metaConn.adAccountId || '';
      if (accountId && !String(accountId).startsWith('act_')) {
        accountId = 'act_' + String(accountId).replace(/[^0-9]/g,'');
      }

      // Default range: last 30 days ending yesterday
      const today = new Date();
      const endD = new Date(today); endD.setDate(today.getDate() - 1);
      const startD = new Date(endD); startD.setDate(endD.getDate() - 29);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const since = typeof req.query.startDate === 'string' ? req.query.startDate : fmt(startD);
      const until = typeof req.query.endDate === 'string' ? req.query.endDate : fmt(endD);

      const bq = getBigQuery();
      const dataset = process.env.BQ_DATASET || 'iqsion';
      
      // If accountId is set, filter by it; otherwise return all accounts (backward compatibility)
      const accountFilter = accountId ? 'AND accountId = @accountId' : '';
      
      // Duplicate'leri önlemek için her date için MAX(createdAt) olan satırları seç
      const sql = `
        WITH latest AS (
          SELECT userId, source, accountId, date, MAX(createdAt) as maxCreated
          FROM \`${bq.projectId}.${dataset}.metrics_daily\`
          WHERE userId = @userId AND source = 'meta_ads' ${accountFilter} AND date BETWEEN DATE(@start) AND DATE(@end)
          GROUP BY userId, source, accountId, date
        )
        SELECT m.date,
               SUM(CAST(m.impressions AS INT64)) AS impressions,
               SUM(CAST(m.clicks AS INT64)) AS clicks,
               SUM(CAST(m.costMicros AS INT64)) AS costMicros
        FROM \`${bq.projectId}.${dataset}.metrics_daily\` m
        INNER JOIN latest l ON m.userId=l.userId AND m.source=l.source AND COALESCE(m.accountId, '') = COALESCE(l.accountId, '') AND m.date=l.date AND m.createdAt=l.maxCreated
        GROUP BY m.date
        ORDER BY m.date
      `;
      const params: any = { userId, start: since, end: until };
      if (accountId) params.accountId = accountId;
      
      const [job] = await bq.createQueryJob({
        query: sql,
        params,
        location: process.env.BQ_LOCATION || 'US',
      });
      const [rows] = await job.getQueryResults();

      const map: Record<string, { impressions: number; clicks: number; spend: number; }> = {};
      for (const r of rows as any[]) {
        const d = normalizeBqDate(r.date);
        const impressions = Number(r.impressions || 0);
        const clicks = Number(r.clicks || 0);
        const spend = Number(r.costMicros || 0) / 1_000_000;
        map[d] = { impressions, clicks, spend };
      }

      const series: Array<{ date: string; spend: number; impressions: number; clicks: number; ctr: number }> = [];
      const cur = new Date(since);
      const end = new Date(until);
      while (cur <= end) {
        const key = cur.toISOString().slice(0,10);
        const v = map[key] || { impressions: 0, clicks: 0, spend: 0 };
        const ctr = v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0;
        series.push({ date: key, spend: v.spend, impressions: v.impressions, clicks: v.clicks, ctr });
        cur.setDate(cur.getDate()+1);
      }

      const totals = series.reduce((acc, d) => {
        acc.impressions += d.impressions;
        acc.clicks += d.clicks;
        acc.spend += d.spend;
        return acc;
      }, { impressions: 0, clicks: 0, spend: 0 });
      const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

      return res.json({
        rows: series,
        totals: { spend: totals.spend, impressions: totals.impressions, clicks: totals.clicks, ctr, cpc, clickMetric },
        requestedRange: { startDate: since, endDate: until }
      });
    } catch (error) {
      console.error('[Meta SUMMARY BQ ERROR]', error);
      return res.status(500).json({ message: 'Meta BQ özet verisi çekilemedi', error: String(error) });
    }
  });

  // Meta: Audiences summary (custom + lookalike counts)
  router.get('/api/meta/audiences/summary', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const snapshot = await admin.database().ref(`platformConnections/${userId}/meta_ads`).once('value');
      const metaData = snapshot.val();
      const accessToken = metaData?.accessToken || process.env.META_ACCESS_TOKEN;
      let adAccountId = metaData?.accountId || process.env.META_AD_ACCOUNT_ID || '';
      if (!accessToken) return res.status(400).json({ message: 'Meta bağlantısı yok' });
      if (!adAccountId) {
        try {
          const accResp = await fetchWithTimeout(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${accessToken}`, { method: 'GET' }, 10000);
          const accJson: any = await accResp.json();
          const first = accJson?.data?.[0];
          if (first?.id) {
            adAccountId = first.id;
            await admin.database().ref(`platformConnections/${userId}/meta_ads`).update({ accountId: first.id, accountName: first.name || null, updatedAt: new Date().toISOString() });
          }
        } catch {}
      }
      if (!adAccountId) return res.status(400).json({ message: 'Meta ad account ID yok' });

      // Fetch custom audiences (including lookalike subtype)
      const fields = encodeURIComponent('id,name,subtype,approximate_count,lookalike_spec');
      const url = `https://graph.facebook.com/v19.0/${adAccountId}/customaudiences?fields=${fields}&limit=100&access_token=${accessToken}`;
      const resp = await fetchWithTimeout(url, { method: 'GET' }, 20000);
      const json: any = await resp.json();
      if (!resp.ok || json.error) {
        return res.status(resp.status || 500).json({ message: 'Audiences alınamadı', error: json.error || json });
      }
      const list = json.data || [];
      let customCount = 0;
      let lookalikeCount = 0;
      for (const a of list) {
        const subtype = String(a.subtype || '').toUpperCase();
        if (subtype === 'LOOKALIKE') lookalikeCount++;
        else customCount++;
      }
      return res.json({ customCount, lookalikeCount, total: list.length });
    } catch (error) {
      console.error('[Meta AUDIENCES SUMMARY ERROR]', error);
      return res.status(500).json({ message: 'Meta audiences özet alınamadı', error: String(error) });
    }
  });

  // Meta: Catalog status (best-effort)
  router.get('/api/meta/catalog/status', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const snapshot = await admin.database().ref(`platformConnections/${userId}/meta_ads`).once('value');
      const metaData = snapshot.val();
      const accessToken = metaData?.accessToken || process.env.META_ACCESS_TOKEN;
      let adAccountId = metaData?.accountId || process.env.META_AD_ACCOUNT_ID || '';
      if (!accessToken) return res.status(400).json({ message: 'Meta bağlantısı yok' });
      if (!adAccountId) {
        try {
          const accResp = await fetchWithTimeout(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${accessToken}`, { method: 'GET' }, 10000);
          const accJson: any = await accResp.json();
          const first = accJson?.data?.[0];
          if (first?.id) {
            adAccountId = first.id;
            await admin.database().ref(`platformConnections/${userId}/meta_ads`).update({ accountId: first.id, accountName: first.name || null, updatedAt: new Date().toISOString() });
          }
        } catch {}
      }
      if (!adAccountId) return res.status(400).json({ message: 'Meta ad account ID yok' });

      // Try common edges to detect linked catalogs
      const tryUrls = [
        `https://graph.facebook.com/v19.0/${adAccountId}/owned_product_catalogs?fields=id,name&access_token=${accessToken}`,
        `https://graph.facebook.com/v19.0/${adAccountId}/product_catalogs?fields=id,name&access_token=${accessToken}`
      ];
      let catalogs: any[] = [];
      for (const u of tryUrls) {
        try {
          const r = await fetchWithTimeout(u, { method: 'GET' }, 10000);
          const j: any = await r.json();
          if (r.ok && !j.error && Array.isArray(j.data)) { catalogs = j.data; break; }
        } catch {}
      }
      const hasCatalog = Array.isArray(catalogs) && catalogs.length > 0;
      return res.json({ hasCatalog, count: catalogs.length || 0, names: catalogs.map((c: any) => c.name).filter(Boolean) });
    } catch (error) {
      console.error('[Meta CATALOG STATUS ERROR]', error);
      return res.status(500).json({ message: 'Meta katalog durumu alınamadı', error: String(error) });
    }
  });

  // Meta: Targeting summary (sample ad sets)
  router.get('/api/meta/targeting/summary', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const snapshot = await admin.database().ref(`platformConnections/${userId}/meta_ads`).once('value');
      const metaData = snapshot.val();
      const accessToken = metaData?.accessToken || process.env.META_ACCESS_TOKEN;
      let adAccountId = metaData?.accountId || process.env.META_AD_ACCOUNT_ID || '';
      if (!accessToken) return res.status(400).json({ message: 'Meta bağlantısı yok' });
      if (!adAccountId) {
        try {
          const accResp = await fetchWithTimeout(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${accessToken}`, { method: 'GET' }, 10000);
          const accJson: any = await accResp.json();
          const first = accJson?.data?.[0];
          if (first?.id) {
            adAccountId = first.id;
            await admin.database().ref(`platformConnections/${userId}/meta_ads`).update({ accountId: first.id, accountName: first.name || null, updatedAt: new Date().toISOString() });
          }
        } catch {}
      }
      if (!adAccountId) return res.status(400).json({ message: 'Meta ad account ID yok' });

      const fields = encodeURIComponent('id,name,targeting,configured_status,effective_status');
      const url = `https://graph.facebook.com/v19.0/${adAccountId}/adsets?fields=${fields}&limit=50&access_token=${accessToken}`;
      const resp = await fetchWithTimeout(url, { method: 'GET' }, 20000);
      const json: any = await resp.json();
      if (!resp.ok || json.error) {
        return res.status(resp.status || 500).json({ message: 'Adset targeting alınamadı', error: json.error || json });
      }
      const list = json.data || [];
      let hasGeo = false, hasAge = false, hasInterests = false;
      for (const a of list) {
        const t = a.targeting || {};
        if (!hasGeo && t?.geo_locations && (t.geo_locations.countries?.length || t.geo_locations.locations?.length)) hasGeo = true;
        if (!hasAge && (typeof t.age_min === 'number' || typeof t.age_max === 'number')) hasAge = true;
        const flex = t?.flexible_spec || [];
        const interests = t?.interests || [];
        if (!hasInterests && ((Array.isArray(interests) && interests.length > 0) || flex.some((f: any) => Array.isArray(f.interests) && f.interests.length > 0))) hasInterests = true;
        if (hasGeo && hasAge && hasInterests) break;
      }
      return res.json({ sampleCount: list.length, hasGeo, hasAge, hasInterests });
    } catch (error) {
      console.error('[Meta TARGETING SUMMARY ERROR]', error);
      return res.status(500).json({ message: 'Meta targeting özeti alınamadı', error: String(error) });
    }
  });

  // Meta: Health score history (append & read) - simple list of {timestamp, score, grade}
  router.get('/api/meta/health/history', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const snap = await admin.database().ref(`platformConnections/${userId}/meta_ads/healthHistory`).once('value');
      const history = snap.val() || [];
      return res.json({ history });
    } catch (e) {
      console.error('[Meta HEALTH HISTORY READ ERROR]', e);
      return res.status(500).json({ message: 'Health geçmişi okunamadı', error: String(e) });
    }
  });

  router.post('/api/meta/health/history', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const { score, grade } = req.body || {};
      if (typeof score !== 'number' || !grade) {
        return res.status(400).json({ message: 'Eksik skor/grade' });
      }
      const ref = admin.database().ref(`platformConnections/${userId}/meta_ads/healthHistory`);
      const snap = await ref.once('value');
      const existing = snap.val() || [];
      const entry = { timestamp: new Date().toISOString(), score, grade };
      const next = [...existing.slice(-199), entry]; // cap at 200
      await ref.set(next);
      return res.json({ ok: true, entry, total: next.length });
    } catch (e) {
      console.error('[Meta HEALTH HISTORY WRITE ERROR]', e);
      return res.status(500).json({ message: 'Health geçmişi yazılamadı', error: String(e) });
    }
  });

  /* ===================== GOOGLE SEARCH CONSOLE CONNECTION ===================== */
  // Initiate OAuth for Search Console
  router.get('/api/auth/searchconsole/connect', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const clientId = ((process.env.GOOGLE_SC_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID || '') as string).trim();
      // Normalize host to avoid 127.0.0.1 vs localhost mismatches in OAuth client settings
      const rawHost = req.get('host') || 'localhost:5001';
      const normalizedHost = rawHost.replace('127.0.0.1', 'localhost');
      const computedRedirect = `${req.protocol}://${normalizedHost}/api/auth/searchconsole/callback`;
      const redirectUri = ((process.env.GOOGLE_SC_REDIRECT || computedRedirect) as string).trim();
      const scope = encodeURIComponent('https://www.googleapis.com/auth/webmasters.readonly');
      const state = encodeURIComponent(`${userId}:${Date.now()}`);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=offline&prompt=consent&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
      return res.json({ url: authUrl });
    } catch (e) {
      console.error('[SearchConsole CONNECT ERROR]', e);
      return res.status(500).json({ message: 'Search Console bağlanma başlatılamadı', error: String(e) });
    }
  });

  // OAuth callback for Search Console
  router.get('/api/auth/searchconsole/callback', async (req, res) => {
    try {
      const code = req.query.code as string | undefined;
      const stateRaw = req.query.state as string | undefined;
      if (!code) return res.status(400).send('code eksik');
      const userId = stateRaw?.split(':')[0] || 'test-user';
      const clientId = ((process.env.GOOGLE_SC_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID || '') as string).trim();
      const clientSecret = ((process.env.GOOGLE_SC_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET || '') as string).trim();
      // Use the same host normalization as in the connect handler
      const rawHost = req.get('host') || 'localhost:5001';
      const normalizedHost = rawHost.replace('127.0.0.1', 'localhost');
      const computedRedirect = `${req.protocol}://${normalizedHost}/api/auth/searchconsole/callback`;
      const redirectUri = ((process.env.GOOGLE_SC_REDIRECT || computedRedirect) as string).trim();

      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('redirect_uri', redirectUri);
      params.append('grant_type', 'authorization_code');
      const tokenResp = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params });
      const tokenJson: any = await tokenResp.json();
      if (!tokenResp.ok || tokenJson.error) {
        console.error('[SearchConsole TOKEN ERROR]', tokenJson);
  return settingsRedirect(res, req, 'search_console', false);
      }
      const accessToken = tokenJson.access_token;
      const refreshToken = tokenJson.refresh_token;
      const expiresIn = tokenJson.expires_in;

      // Fetch sites list
      const sitesResp = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const sitesJson: any = await sitesResp.json();
      const siteEntries = Array.isArray(sitesJson.siteEntry) ? sitesJson.siteEntry : [];
      const sites = siteEntries.map((s: any) => ({ url: s.siteUrl, permissionLevel: s.permissionLevel }));

      await admin.database().ref(`platformConnections/${userId}/search_console`).set({
        platform: 'search_console',
        accessToken,
        refreshToken: refreshToken || null,
        expiresIn,
        createdAt: Date.now(),
        sites,
        selectedSite: sites[0]?.url || null,
        isConnected: true,
        updatedAt: new Date().toISOString()
      });

  return settingsRedirect(res, req, 'search_console', true);
    } catch (e) {
      console.error('[SearchConsole CALLBACK ERROR]', e);
  return settingsRedirect(res, req, 'search_console', false);
    }
  });

  // List Search Console sites (refresh if token near expiry)
  router.get('/api/searchconsole/sites', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const snap = await admin.database().ref(`platformConnections/${userId}/search_console`).once('value');
      const sc = snap.val();
      if (!sc || !sc.accessToken) return res.status(404).json({ message: 'Search Console bağlı değil' });
      let accessToken = sc.accessToken as string;
      const refreshToken = sc.refreshToken as string | undefined;
      if (refreshToken && sc.expiresIn && sc.createdAt) {
        const ageMs = Date.now() - Number(sc.createdAt);
        const ttlMs = (Number(sc.expiresIn) - 60) * 1000;
        if (ageMs > ttlMs) {
          const params = new URLSearchParams();
          params.append('client_id', process.env.GOOGLE_SC_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID || '');
          params.append('client_secret', process.env.GOOGLE_SC_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET || '');
          params.append('refresh_token', refreshToken);
          params.append('grant_type', 'refresh_token');
          try {
            const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params });
            const j: any = await r.json();
            if (r.ok && j.access_token) {
              accessToken = j.access_token;
              await admin.database().ref(`platformConnections/${userId}/search_console`).update({
                accessToken,
                expiresIn: j.expires_in,
                createdAt: Date.now(),
                updatedAt: new Date().toISOString()
              });
            } else {
              console.warn('[SearchConsole REFRESH] başarısız', j);
            }
          } catch (err) {
            console.warn('[SearchConsole REFRESH] hata:', err);
          }
        }
      }
      if (sc.sites && Array.isArray(sc.sites) && sc.sites.length > 0) {
        return res.json({ sites: sc.sites, selectedSite: sc.selectedSite || null });
      }
      // fallback live fetch
      const sitesResp = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
        method: 'GET', headers: { Authorization: `Bearer ${accessToken}` }
      });
      const sitesJson: any = await sitesResp.json();
      const siteEntries = Array.isArray(sitesJson.siteEntry) ? sitesJson.siteEntry : [];
      const sites = siteEntries.map((s: any) => ({ url: s.siteUrl, permissionLevel: s.permissionLevel }));
      await admin.database().ref(`platformConnections/${userId}/search_console/sites`).set(sites);
      return res.json({ sites, selectedSite: sc.selectedSite || sites[0]?.url || null });
    } catch (e) {
      console.error('[SearchConsole SITES ERROR]', e);
      return res.status(500).json({ message: 'Search Console siteleri alınamadı', error: String(e) });
    }
  });

  // Basic Search Analytics query (top queries & pages)
  router.post('/api/searchconsole/query', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const { siteUrl, startDate, endDate, dimensions } = req.body || {};
      const snap = await admin.database().ref(`platformConnections/${userId}/search_console`).once('value');
      const sc = snap.val();
      if (!sc || !sc.accessToken) return res.status(404).json({ message: 'Search Console bağlı değil' });
      const selSite = siteUrl || sc.selectedSite;
      if (!selSite) return res.status(400).json({ message: 'siteUrl eksik' });
      const sd = startDate || new Date(Date.now() - 14 * 86400000).toISOString().slice(0,10);
      const ed = endDate || new Date(Date.now() - 1 * 86400000).toISOString().slice(0,10);
      const dims = Array.isArray(dimensions) && dimensions.length > 0 ? dimensions : ['query'];
      let accessToken = sc.accessToken as string;
      const refreshToken = sc.refreshToken as string | undefined;
      if (refreshToken && sc.expiresIn && sc.createdAt) {
        const ageMs = Date.now() - Number(sc.createdAt);
        const ttlMs = (Number(sc.expiresIn) - 60) * 1000;
        if (ageMs > ttlMs) {
          const params = new URLSearchParams();
          params.append('client_id', process.env.GOOGLE_SC_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID || '');
          params.append('client_secret', process.env.GOOGLE_SC_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET || '');
          params.append('refresh_token', refreshToken);
          params.append('grant_type', 'refresh_token');
          try {
            const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params });
            const j: any = await r.json();
            if (r.ok && j.access_token) {
              accessToken = j.access_token;
              await admin.database().ref(`platformConnections/${userId}/search_console`).update({
                accessToken,
                expiresIn: j.expires_in,
                createdAt: Date.now(),
                updatedAt: new Date().toISOString()
              });
            }
          } catch {}
        }
      }
      const queryUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(selSite)}/searchAnalytics/query`;
      const body = {
        startDate: sd,
        endDate: ed,
        dimensions: dims,
        rowLimit: 50
      };
      const qResp = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body)
      });
      const qJson: any = await qResp.json();
      if (!qResp.ok || qJson.error) {
        return res.status(qResp.status || 500).json({ message: 'Search Analytics alınamadı', error: qJson.error || qJson });
      }
      return res.json({ rows: qJson.rows || [], requestedRange: { startDate: sd, endDate: ed }, dimensions: dims });
    } catch (e) {
      console.error('[SearchConsole QUERY ERROR]', e);
      return res.status(500).json({ message: 'Search Console sorgu hatası', error: String(e) });
    }
  });

  // DEV: Debug endpoint to inspect Search Console connections across users
  router.get('/api/debug/searchconsole', async (req, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Not available in production' });
      }
      const snap = await admin.database().ref('platformConnections').once('value');
      const all = snap.val() || {};
      const summary = Object.keys(all).map(uid => ({
        uid,
        hasSearchConsole: !!all[uid]?.search_console,
        selectedSite: all[uid]?.search_console?.selectedSite || null,
        isConnected: all[uid]?.search_console?.isConnected || false,
      }));
      return res.json({ users: summary });
    } catch (e) {
      return res.status(500).json({ message: 'Debug error', error: String(e) });
    }
  });
  // Meta Reklam OAuth connect endpoint
  router.get('/api/auth/meta/connect', async (req, res) => {
    const clientId = (process.env.META_APP_ID || '').trim();
    const clientSecret = (process.env.META_APP_SECRET || '').trim();
    if (!clientId || !clientSecret) {
      return settingsRedirect(res, req, 'meta_ads', false);
    }
    const redirectEnv = (process.env.META_REDIRECT_URI || '').trim();
    const computedRedirect = `${buildAppBase(req)}/api/auth/meta/callback`;
    const redirectUri = (redirectEnv || computedRedirect).trim();
    const scope = [
      'ads_read',
      'ads_management',
      'business_management',
      'pages_show_list',
      'pages_read_engagement',
    ].join(',');
    const uid = typeof req.query.userId === 'string' ? req.query.userId : '';
    // userId'yi state içinde taşı (google akışındaki gibi)
    const stateRaw = uid ? `uid:${uid}|${Math.random().toString(36).slice(2)}` : Math.random().toString(36).slice(2);
    const state = encodeURIComponent(stateRaw);
    const authUrl =
      `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${state}`;
    console.log('[META CONNECT] redirectUri=', redirectUri, 'state=', stateRaw);
    res.redirect(authUrl);
  });

  // Meta Reklam OAuth callback endpoint
  router.get('/api/auth/meta/callback', async (req, res) => {
    const code = req.query.code as string | undefined;
    const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
    let stateUserId: string | null = null;
    if (stateParam) {
      try {
        const decoded = decodeURIComponent(stateParam);
        if (decoded.startsWith('uid:')) {
          stateUserId = decoded.split('|')[0].replace('uid:', '');
        } else {
          const maybe = JSON.parse(decoded);
          if (maybe && typeof maybe.uid === 'string') stateUserId = maybe.uid;
        }
      } catch (_) {}
    }
    if (!code) {
  return settingsRedirect(res, req, 'meta_ads', false);
    }
    try {
      const redirectEnv = (process.env.META_REDIRECT_URI || '').trim();
      const computedRedirect = `${buildAppBase(req)}/api/auth/meta/callback`;
      const redirectUri = (redirectEnv || computedRedirect).trim();
      const params = new URLSearchParams();
      params.append('client_id', (process.env.META_APP_ID || '').trim());
      params.append('client_secret', (process.env.META_APP_SECRET || '').trim());
      params.append('redirect_uri', redirectUri);
      params.append('code', code);
      const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);
      const tokenData = await tokenRes.json();
      if (tokenData.error || !tokenData.access_token) {
  return settingsRedirect(res, req, 'meta_ads', false);
      }
      // Short-lived token'ı long-lived ile değiştir
      let accessToken: string = tokenData.access_token;
      try {
        const exchangeUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
        exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
        exchangeUrl.searchParams.set('client_id', (process.env.META_APP_ID || '').trim());
        exchangeUrl.searchParams.set('client_secret', (process.env.META_APP_SECRET || '').trim());
        exchangeUrl.searchParams.set('fb_exchange_token', accessToken);
        const longResp = await fetchWithTimeout(exchangeUrl.toString(), { method: 'GET' }, 10000);
        const longJson: any = await longResp.json();
        if (longResp.ok && longJson.access_token) {
          accessToken = longJson.access_token;
        }
      } catch (_) {}
      const userId = (stateUserId || (typeof req.query.userId === 'string' ? req.query.userId : null)) || 'test-user';
      // Ad account ID'yi Facebook API'dan çek
      let accountId: string | null = null;
      let accountName: string | null = null;
      try {
        const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?access_token=${accessToken}`);
        const accountsData = await accountsRes.json();
        if (accountsData.data && accountsData.data.length > 0) {
          accountId = accountsData.data[0].id;
          accountName = accountsData.data[0].name || null;
        }
      } catch (_) {}
      await admin.database().ref(`platformConnections/${userId}/meta_ads`).set({
        isConnected: true,
        platform: 'meta_ads',
        accessToken,
        accountId,
        accountName,
        lastSyncAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log('[META CALLBACK] saved connection for userId=', userId, { accountId, accountName: accountName || undefined });
      // NOT: Otomatik veri çekme kaldırıldı!
      // Kullanıcı hesap seçtikten sonra frontend'den veri çekme tetiklenecek
      // Bu sayede kullanıcı istediği hesabı seçebilir
      return settingsRedirect(res, req, 'meta_ads', true);
    } catch (err) {
  return settingsRedirect(res, req, 'meta_ads', false);
    }
  });
  // Admin endpoint: Meta hesap değiştirme
  router.post('/api/update-meta-account', async (req, res) => {
    const adminKey = req.headers['x-admin-key'] as string;
    if (!adminKey || adminKey !== (process.env.ADMIN_API_KEY || '').trim()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { userId, accountId } = req.body;
    if (!userId || !accountId) {
      return res.status(400).json({ error: 'userId and accountId required' });
    }
    try {
      const metaRef = admin.database().ref(`platformConnections/${userId}/meta_ads`);
      const snap = await metaRef.once('value');
      const existing = snap.val() || {};
      const oldAccountId = existing.accountId;
      
      // Eski hesap varsa ve farklıysa, eski hesabın BigQuery verilerini sil
      if (oldAccountId && oldAccountId !== accountId) {
        try {
          const bq = getBigQuery();
          const dataset = process.env.BQ_DATASET || 'iqsion';
          const deleteOldSql = `
            DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
            WHERE userId = @userId AND source = 'meta_ads' AND accountId = @oldAccountId
          `;
          const [job] = await bq.createQueryJob({
            query: deleteOldSql,
            params: { userId, oldAccountId },
            location: process.env.BQ_LOCATION || 'US',
          });
          await job.getQueryResults();
          console.log(`[ADMIN] Deleted old Meta account data: ${oldAccountId} for user ${userId}`);
        } catch (delErr) {
          console.error('[ADMIN] Failed to delete old Meta account data:', delErr);
        }
      }
      
      await metaRef.update({
        accountId,
        updatedAt: new Date().toISOString(),
      });
      console.log('[ADMIN] Updated Meta account for', userId, 'to', accountId);
      res.json({ ok: true, accountId });
    } catch (err: any) {
      console.error('[ADMIN] Meta account update error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Kullanıcının bağlantı durumlarını döndüren endpoint
  router.get('/api/connections', async (req, res) => {
    try {
      const userId = req.query.userId || 'test-user';
      const snapshot = await admin.database().ref(`platformConnections/${userId}`).once('value');
      const connections = snapshot.val() || {};
      // Normalize keys for frontend expectations
      if (connections.search_console && !connections.google_search_console) {
        connections.google_search_console = connections.search_console;
      }
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: 'Bağlantı durumu alınamadı', error });
    }
  });

  // --- TikTok Ads OAuth: Connect ---
  router.get('/api/auth/tiktok/connect', async (req, res) => {
    try {
      const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
      if (!clientKey) {
        return res.status(400).send('TikTok client key eksik (TIKTOK_CLIENT_KEY).');
      }
      const rawHost = req.get('host') || 'localhost:5001';
      const normalizedHost = rawHost.replace('127.0.0.1', 'localhost');
      const computedRedirect = `${req.protocol}://${normalizedHost}/api/auth/tiktok/callback`;
      const redirectEnv = process.env.TIKTOK_REDIRECT_URI;
      // Eğer prod ortamı ise env’deki URI’yı kullan, değilse dinamik oluştur.
      const redirectUri = redirectEnv || computedRedirect;
      const uid = typeof req.query.userId === 'string' ? req.query.userId : '';
      const stateRaw = uid ? `uid:${uid}|${Math.random().toString(36).slice(2)}` : Math.random().toString(36).slice(2);
      // TikTok OAuth 2.0 parametreleri – 404 sebebi yanlış base domain ve eksik response_type
      const scope = [
        'ads.read',
        'ads.management',
        'report.data',
        'ad.account.read'
      ].join(',');
      // Doğru yetkilendirme endpointi: https://ads.tiktok.com/marketing_api/auth
      // Gerekli query: app_id (client_key), state, scope, redirect_uri (urlencode), response_type=code
      const authUrl =
        `https://ads.tiktok.com/marketing_api/auth?` +
        `app_id=${encodeURIComponent(clientKey)}` +
        `&state=${encodeURIComponent(stateRaw)}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code`;
      return res.redirect(authUrl);
    } catch (e) {
      return res.status(500).send('TikTok connect hatası: ' + ((e as any)?.message || String(e)));
    }
  });

  // --- TikTok Ads OAuth: Callback ---
  router.get('/api/auth/tiktok/callback', async (req, res) => {
    try {
      const code = String(req.query.code || '');
      const stateParam = String(req.query.state || '');
      if (!code) {
  return settingsRedirect(res, req, 'tiktok', false);
      }
      let stateUserId: string | null = null;
      if (stateParam) {
        try {
          const decoded = decodeURIComponent(stateParam);
          if (decoded.startsWith('uid:')) stateUserId = decoded.split('|')[0].replace('uid:', '');
        } catch (_) {}
      }
      const userId = (stateUserId || (typeof req.query.userId === 'string' ? req.query.userId : null)) || 'test-user';

      const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
      if (!clientKey || !clientSecret) {
  return settingsRedirect(res, req, 'tiktok', false);
      }

      // Token exchange
      const tokenUrl = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/';
      const tokenResp = await fetchWithTimeout(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_key: clientKey, client_secret: clientSecret, code, grant_type: 'authorization_code' }),
      }, 15000);
      const tokenJson: any = await tokenResp.json();
      if (!tokenResp.ok || !tokenJson?.data?.access_token) {
  return settingsRedirect(res, req, 'tiktok', false);
      }
      const accessToken: string = tokenJson.data.access_token;
      const refreshToken: string | null = tokenJson.data.refresh_token || null;
      const expiresIn: number | null = tokenJson.data.expires_in || null;

      // Fetch advertiser list (optional)
      let advertiserIds: string[] = [];
      try {
        const advUrl = `https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/?access_token=${encodeURIComponent(accessToken)}`;
        const advResp = await fetchWithTimeout(advUrl, { method: 'GET' }, 15000);
        const advJson: any = await advResp.json();
        const list: any[] = advJson?.data?.list || [];
        advertiserIds = list.map((it: any) => String(it.advertiser_id || it.advertiser_id_str || it.advertiser_id_encrypted || it.id)).filter(Boolean);
      } catch (_) {}

      await admin.database().ref(`platformConnections/${userId}/tiktok`).set({
        isConnected: true,
        platform: 'tiktok',
        accessToken,
        refreshToken,
        expiresIn,
        advertiserIds,
        accountId: advertiserIds[0] || null,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      
      console.log('[TIKTOK CALLBACK] saved connection for userId=', userId, { accountId: advertiserIds[0] || null });
      // Auto-ingest disabled - user needs to select account first, ingest triggered from frontend
      console.log('[TIKTOK CALLBACK] User needs to select account, ingest will be triggered from frontend after selection');
      return settingsRedirect(res, req, 'tiktok', true);
    } catch (e) {
  return settingsRedirect(res, req, 'tiktok', false);
    }
  });

  // TikTok: Kullanıcının reklam hesaplarını listele
  router.get('/api/tiktok/adaccounts', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      const snap = await admin.database().ref(`platformConnections/${userId}/tiktok`).once('value');
      const tk = snap.val();
      const accessToken = tk?.accessToken || '';
      if (!accessToken) return res.status(400).json({ message: 'TikTok access token bulunamadı.' });
      const url = `https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/?access_token=${encodeURIComponent(accessToken)}`;
      const r = await fetchWithTimeout(url, { method: 'GET' }, 15000);
      const j = await r.json();
      return res.json(j);
    } catch (e) {
      return res.status(500).json({ message: 'TikTok adaccounts alınamadı', error: String(e) });
    }
  });
  // Google Analytics veri çekme endpointi
  router.get('/api/analytics/summary', async (req, res) => {
    try {
      // Minimum log: istek geldi
      const userId = req.query.userId || 'test-user';
      const snapshot = await admin.database().ref(`platformConnections/${userId}/google_analytics`).once('value');
      const connection = snapshot.val();
      if (!connection || !connection.accessToken) {
        return res.status(400).json({ message: 'Google Analytics bağlantısı yok veya token bulunamadı.' });
      }
      // Token süresi kontrolü ve otomatik yenileme
      let accessToken = connection.accessToken;
      let expiresAt = connection.expiresAt ? new Date(connection.expiresAt) : null;
      const now = new Date();
      if (expiresAt && expiresAt < now && connection.refreshToken) {
        console.warn('Google Analytics accessToken süresi dolmuş! Otomatik yenileniyor...');
        try {
          const params = new URLSearchParams();
          params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
          params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
          params.append('refresh_token', connection.refreshToken);
          params.append('grant_type', 'refresh_token');
          const resp = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          }, 10000);
          const data = await resp.json();
          if (data.access_token) {
            accessToken = data.access_token;
            expiresAt = new Date(now.getTime() + (data.expires_in || 3600) * 1000);
            await admin.database().ref(`platformConnections/${userId}/google_analytics`).update({
              accessToken,
              expiresAt: expiresAt.toISOString(),
              updatedAt: now.toISOString(),
            });
          } else {
            return res.status(401).json({ message: 'Google Analytics accessToken yenileme başarısız.', error: data });
          }
        } catch (err) {
          return res.status(500).json({ message: 'Google Analytics accessToken yenileme hatası.', error: err });
        }
      }
  const propertyId = (req.query.propertyId as string) || connection.propertyId || 'YOUR_GA4_PROPERTY_ID';
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
      if (!startDate || !endDate) {
        startDate = '7daysAgo';
        endDate = 'yesterday';
      }
      // Basit cache: 2 dakika
      const cacheKey = `cache/ga/summary/${userId}/${propertyId}/${startDate}-${endDate}`;
      const cacheSnap = await admin.database().ref(cacheKey).once('value');
      const cached = cacheSnap.val();
      const nowTs = Date.now();
      const ttlMs = 2 * 60 * 1000;
      if (cached && cached.cachedAt && (nowTs - cached.cachedAt) < ttlMs) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached.data);
      }
      // Optional channel filter mapping
      let dimensionFilter: any = undefined;
      if (channel && channel !== 'all') {
        // Prefer sessionSource for platform-specific filters; use default channel grouping for organic/email
        const bySource: Record<string, string> = {
          google: 'google',
          meta: 'facebook', // note: could also be 'instagram'
          tiktok: 'tiktok',
        };
        const byGrouping: Record<string, string> = {
          email: 'Email',
          organic: 'Organic Search',
        };
        if (bySource[channel]) {
          dimensionFilter = {
            filter: {
              fieldName: 'sessionSource',
              stringFilter: { matchType: 'EXACT', value: bySource[channel] },
            }
          };
        } else if (byGrouping[channel]) {
          dimensionFilter = {
            filter: {
              fieldName: 'sessionDefaultChannelGrouping',
              stringFilter: { matchType: 'EXACT', value: byGrouping[channel] },
            }
          };
        }
      }

      const requestBody = {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'newUsers' },
          { name: 'activeUsers' },
          { name: 'averageSessionDuration' },
          { name: 'eventCount' }
        ],
        dimensions: [{ name: 'date' }],
        ...(dimensionFilter ? { dimensionFilter } : {}),
      };
      // (Dupe /api/connections kaldırıldı)
      // 1) Detailed by date (for charts)
      const response = await fetchWithTimeout(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
        10000
      );
      if (response.ok) {
        const detailedData = await response.json();

        // 2) Overall totals without dimensions (for accurate KPIs)
        const overallReqBody = {
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: 'sessions' },
            { name: 'newUsers' },
            { name: 'activeUsers' },
            { name: 'averageSessionDuration' },
            { name: 'eventCount' },
          ],
          ...(dimensionFilter ? { dimensionFilter } : {}),
        } as any;
        let totals: any = undefined;
        try {
          const overallResp = await fetchWithTimeout(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(overallReqBody),
            },
            10000
          );
          if (overallResp.ok) {
            const overallData = await overallResp.json();
            const mHeaders = (overallData.metricHeaders || []).map((m: any) => m.name);
            const firstRow = (overallData.rows || [])[0];
            if (firstRow && firstRow.metricValues) {
              totals = {} as any;
              for (let i = 0; i < mHeaders.length; i++) {
                const name = mHeaders[i];
                const val = Number(firstRow.metricValues[i]?.value || '0');
                totals[name] = Number.isFinite(val) ? val : 0;
              }
            }
          }
        } catch (_) {
          // totals alınamazsa yoksay
        }

  const combined = { ...detailedData, totals, requestedRange: { startDate, endDate }, channelApplied: channel || 'all' };
        await admin.database().ref(cacheKey).set({ data: combined, cachedAt: Date.now() });
        res.setHeader('X-Cache', 'MISS');
        res.json(combined);
      } else {
        const errorData = await response.text();
        res.status(500).json({ message: 'Veri çekilemedi', error: errorData });
      }
    } catch (error) {
  res.status(500).json({ message: '[GA] Veri çekilemedi', error });
    }
  });

  // Analytics summary from BigQuery (GA4 tables)
  router.get('/api/analytics/summary-bq', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'test-user';
      // Accept GA-style relative dates or ISO YYYY-MM-DD
      const relOrStart = (req.query.startDate as string) || '7daysAgo';
      const relOrEnd = (req.query.endDate as string) || 'yesterday';
      const parseRel = (val: string): string => {
        const today = new Date();
        const tzFix = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        const isISO = /^\d{4}-\d{2}-\d{2}$/.test(val);
        if (isISO) return val;
        const lc = val.toLowerCase();
        if (lc === 'today') return tzFix(today).toISOString().slice(0,10);
        if (lc === 'yesterday') { const y = new Date(today); y.setDate(today.getDate()-1); return tzFix(y).toISOString().slice(0,10); }
        const m = lc.match(/(\d+)daysago/);
        if (m) { const n = Number(m[1]); const d = new Date(today); d.setDate(today.getDate()-n); return tzFix(d).toISOString().slice(0,10); }
        return val;
      };
      const endISO = parseRel(relOrEnd);
      let startISO = parseRel(relOrStart);
      // If start was relative like 7daysAgo and end is yesterday, ensure inclusive range length
      // GA semantics: 7daysAgo..yesterday includes 7 days; keep as parsed

      const bq = getBigQuery();
      const dataset = process.env.BQ_DATASET || 'iqsion';
      // Ensure tables exist (best-effort, no-op if present)
      try { await ensureGa4Tables(); } catch {}

      const sql = `
        WITH LatestRows AS (
          SELECT date,
                 sessions,
                 avgSessionDurationSec,
                 activeUsers,
                 newUsers,
                 eventCount,
                 ROW_NUMBER() OVER (PARTITION BY date ORDER BY createdAt DESC) as rn
          FROM \`${bq.projectId}.${dataset}.ga4_daily\`
          WHERE userId = @userId AND date BETWEEN @start AND @end
        )
        SELECT date,
               CAST(sessions AS INT64) AS sessions,
               CAST(avgSessionDurationSec AS FLOAT64) AS avgSessionDurationSec,
               CAST(activeUsers AS INT64) AS activeUsers,
               CAST(newUsers AS INT64) AS newUsers,
               CAST(eventCount AS INT64) AS eventCount
        FROM LatestRows
        WHERE rn = 1
        ORDER BY date
      `;
      const [job] = await bq.createQueryJob({
        query: sql,
        params: { userId, start: startISO, end: endISO },
        location: process.env.BQ_LOCATION || 'US',
      });
      const [rows] = await job.getQueryResults();

      // Zero-fill date series
      const map: Record<string, any> = {};
      for (const r of rows as any[]) {
        const d = normalizeBqDate(r.date);
        map[d] = {
          sessions: Number(r.sessions || 0),
          avgSessionDurationSec: Number(r.avgSessionDurationSec || 0),
          activeUsers: Number(r.activeUsers || 0),
          newUsers: Number(r.newUsers || 0),
          eventCount: Number(r.eventCount || 0),
        };
      }
      const cur = new Date(startISO);
      const end = new Date(endISO);
      const seq: Array<{ date: string; sessions: number; avgSessionDurationSec: number; activeUsers: number; newUsers: number; eventCount: number }> = [];
      while (cur <= end) {
        const key = cur.toISOString().slice(0,10);
        const v = map[key] || { sessions: 0, avgSessionDurationSec: 0, activeUsers: 0, newUsers: 0, eventCount: 0 };
        seq.push({ date: key, sessions: v.sessions, avgSessionDurationSec: v.avgSessionDurationSec, activeUsers: v.activeUsers, newUsers: v.newUsers, eventCount: v.eventCount });
        cur.setDate(cur.getDate()+1);
      }

      // Compose GA-like response
      const dimensionHeaders = [{ name: 'date' }];
      const metricHeaders = [
        { name: 'sessions' },
        { name: 'newUsers' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'eventCount' },
      ];
      const toYYYYMMDD = (iso: string) => iso.replace(/-/g,'');
      const dataRows = seq.map(r => ({
        dimensionValues: [{ value: toYYYYMMDD(r.date) }],
        metricValues: [
          { value: String(r.sessions || 0) },
          { value: String(r.newUsers || 0) },
          { value: String(r.activeUsers || 0) },
          { value: String(r.avgSessionDurationSec || 0) },
          { value: String(r.eventCount || 0) },
        ]
      }));
      const totalsCalc = seq.reduce((acc, r) => {
        acc.sessions += r.sessions;
        acc.activeUsers += r.activeUsers;
        acc.newUsers += r.newUsers;
        acc.eventCount += r.eventCount;
        // Ağırlıklı ortalama için: toplam süre = ortalama × oturum sayısı
        acc.totalDurationSeconds += (r.avgSessionDurationSec || 0) * (r.sessions || 0);
        return acc;
      }, { sessions: 0, activeUsers: 0, newUsers: 0, eventCount: 0, totalDurationSeconds: 0 } as any);
      const totals = {
        sessions: totalsCalc.sessions,
        newUsers: totalsCalc.newUsers,
        activeUsers: totalsCalc.activeUsers,
        // Ağırlıklı ortalama: toplam süre / toplam oturum
        averageSessionDuration: totalsCalc.sessions > 0 ? (totalsCalc.totalDurationSeconds / totalsCalc.sessions) : 0,
        eventCount: totalsCalc.eventCount,
      };

      return res.json({
        dimensionHeaders,
        metricHeaders,
        rows: dataRows,
        totals,
        requestedRange: { startDate: startISO, endDate: endISO },
        channelApplied: (req.query.channel as string) || 'all',
      });
    } catch (e) {
      console.error('[GA4 SUMMARY BQ ERROR]', e);
      return res.status(500).json({ message: 'GA4 BQ özeti alınamadı', error: String(e) });
    }
  });

  // Google OAuth callback endpoint
  router.get('/api/auth/google/callback', async (req, res) => {
    console.log('[GA CALLBACK] Received callback:', {
      hasCode: !!req.query.code,
      hasState: !!req.query.state,
      hasError: !!req.query.error,
      error: req.query.error,
      errorDescription: req.query.error_description
    });
    
    const code = req.query.code;
    let propertyId = req.query.propertyId;
    const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
    // state içinden userId yakala (format: uid:<uid>|<random>)
    let stateUserId: string | null = null;
    if (stateParam) {
      try {
        if (stateParam.startsWith('uid:')) {
          stateUserId = stateParam.split('|')[0].replace('uid:', '');
        } else {
          // JSON taşındıysa
          const maybe = JSON.parse(stateParam);
          if (maybe && typeof maybe.uid === 'string') stateUserId = maybe.uid;
        }
      } catch (_) {
        // yoksay
      }
    }
    
    if (!code) {
      console.error('[GA CALLBACK] No authorization code received');
      return settingsRedirect(res, req, 'google_analytics', false);
    }
    
    try {
      const params = new URLSearchParams();
      params.append('code', code as string);
      const gaClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
      const gaClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
      
      console.log('[GA CALLBACK] Exchanging code for token:', {
        hasClientId: !!gaClientId,
        hasClientSecret: !!gaClientSecret,
        userId: stateUserId
      });
      
      params.append('client_id', gaClientId);
      params.append('client_secret', gaClientSecret);
      const effectiveRedirectUri = (process.env.GOOGLE_REDIRECT_URI || '').trim() || `${buildAppBase(req)}/api/auth/google/callback`;
      params.append('redirect_uri', effectiveRedirectUri);
      params.append('grant_type', 'authorization_code');
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const tokenData = await tokenRes.json();
      
      if (tokenData.error) {
        console.error('[GA CALLBACK] Token exchange failed:', tokenData);
        return res.redirect('/settings?connection=error&platform=google_analytics');
      }
      const userId = (stateUserId || (typeof req.query.userId === 'string' ? req.query.userId : null)) || 'test-user';
      // Eğer propertyId yoksa Google Analytics API'dan otomatik çek
      if (!propertyId) {
        try {
          const accountRes = await fetch('https://analyticsadmin.googleapis.com/v1alpha/accounts', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          const accountData = await accountRes.json();
          if (accountData.accounts && accountData.accounts.length > 0) {
            const accountId = accountData.accounts[0].name.split('/')[1];
            // Property listesini çek
            const propertyRes = await fetch(`https://analyticsadmin.googleapis.com/v1alpha/accounts/${accountId}/properties`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
              },
            });
            const propertyData = await propertyRes.json();
            if (propertyData.properties && propertyData.properties.length > 0) {
              propertyId = propertyData.properties[0].name.replace('properties/', '');
            }
          }
        } catch (err) {
          console.error('Google Analytics propertyId otomatik çekilemedi:', err);
        }
      }
      await admin.database().ref(`platformConnections/${userId}/google_analytics`).set({
        isConnected: true,
        platform: 'google_analytics',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        propertyId: propertyId || null,
        accountId: null,
        accountName: null,
        lastSyncAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      console.log('[GA4 CALLBACK] saved connection for userId=', userId, { propertyId });
      // NOT: Otomatik veri çekme kaldırıldı!
      // Kullanıcı property seçtikten sonra frontend'den veri çekme tetiklenecek
  return settingsRedirect(res, req, 'google_analytics', true);
    } catch (err) {
      return res.redirect('/settings?connection=error&platform=google_analytics');
    }
  });

  // Google Analytics OAuth connect endpoint
  router.get('/api/auth/google/connect', async (req, res) => {
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    if (!clientId) {
      console.error('[GOOGLE AUTH] No GOOGLE_CLIENT_ID configured');
      // UI akışını bozmayalım; Settings'e hata ile dönelim
      return settingsRedirect(res, req, 'google_analytics', false);
    }
    const redirectUri = (process.env.GOOGLE_REDIRECT_URI || '').trim() || `${buildAppBase(req)}/api/auth/google/callback`;
    const scope = [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics.edit',
      'https://www.googleapis.com/auth/analytics.manage.users',
      'openid',
      'email',
      'profile'
    ].join(' ');
    const uid = typeof req.query.userId === 'string' ? req.query.userId : '';
    // userId'yi state ile taşı
    const stateRaw = uid ? `uid:${uid}|${Math.random().toString(36).slice(2)}` : Math.random().toString(36).slice(2);
    const state = encodeURIComponent(stateRaw);
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${state}`;
    if (!redirectUri) return res.status(500).json({ message: 'GOOGLE_REDIRECT_URI is not configured and computed redirect failed.' });
    
    console.log('[GOOGLE AUTH] Redirecting to Google OAuth:', {
      userId: uid,
      clientId: clientId.substring(0, 20) + '...',
      redirectUri,
      authUrl: authUrl.substring(0, 100) + '...'
    });
    
    res.redirect(authUrl);
  });
/* ===================== LINKEDIN ADS INTEGRATION (OAuth + Analytics) ===================== */
// Env vars: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI
// Stored under platformConnections/<uid>/linkedin_ads

// Initiate LinkedIn OAuth (marketing scopes) - userId passed via state
router.get('/api/auth/linkedin/connect', async (req, res) => {
  try {
    const clientId = (process.env.LINKEDIN_CLIENT_ID || '').trim();
    const clientSecret = (process.env.LINKEDIN_CLIENT_SECRET || '').trim();
    if (!clientId || !clientSecret) {
      return settingsRedirect(res, req, 'linkedin_ads', false);
    }
    const base = buildAppBase(req);
    const redirectEnv = (process.env.LINKEDIN_REDIRECT_URI || '').trim();
    const computed = `${base}/api/auth/linkedin/callback`;
    const redirectUri = (redirectEnv || computed).trim();
    const uid = typeof req.query.userId === 'string' ? req.query.userId : '';
    const stateRaw = uid ? `uid:${uid}|${Math.random().toString(36).slice(2)}` : Math.random().toString(36).slice(2);
    // Offline access needed for refresh token: use access_type=offline, prompt=consent equivalent for LinkedIn via scope w/ offline_access
    const scope = [
      'r_ads',            // read ads accounts
      'r_ads_reporting',  // read ads analytics
      'rw_ads',           // manage (future use)
      'r_basicprofile',   // basic profile (to map user)
      'offline_access'    // refresh token
    ].join(' ');
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${encodeURIComponent(stateRaw)}`;
    console.log('[LINKEDIN CONNECT]', { redirectUri, uid, stateRaw });
    return res.redirect(authUrl);
  } catch (e) {
    return settingsRedirect(res, req, 'linkedin_ads', false);
  }
});

// LinkedIn OAuth callback
router.get('/api/auth/linkedin/callback', async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
  if (!code) return settingsRedirect(res, req, 'linkedin_ads', false);
  let stateUserId: string | null = null;
  if (stateParam) {
    try {
      const decoded = decodeURIComponent(stateParam);
      if (decoded.startsWith('uid:')) stateUserId = decoded.split('|')[0].replace('uid:', '');
    } catch {}
  }
  try {
    const clientId = (process.env.LINKEDIN_CLIENT_ID || '').trim();
    const clientSecret = (process.env.LINKEDIN_CLIENT_SECRET || '').trim();
    const redirectEnv = (process.env.LINKEDIN_REDIRECT_URI || '').trim();
    const base = buildAppBase(req);
    const computed = `${base}/api/auth/linkedin/callback`;
    const redirectUri = (redirectEnv || computed).trim();
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    const tokenResp = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString()
    });
    const tokenJson: any = await tokenResp.json();
    if (!tokenResp.ok || !tokenJson.access_token) {
      return settingsRedirect(res, req, 'linkedin_ads', false);
    }
    const accessToken = tokenJson.access_token;
    const expiresIn = tokenJson.expires_in;
    // LinkedIn issues refresh_token only in certain flows; attempt second call if not present
    let refreshToken: string | null = tokenJson.refresh_token || null;
    const userId = (stateUserId || (typeof req.query.userId === 'string' ? req.query.userId : null)) || 'test-user';
    // Fetch basic profile to store reference (v2 me endpoint)
    let profileId: string | null = null;
    try {
      const meResp = await fetch('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      const meJson: any = await meResp.json();
      profileId = meJson?.id || null;
    } catch {}
    await admin.database().ref(`platformConnections/${userId}/linkedin_ads`).set({
      platform: 'linkedin_ads',
      isConnected: true,
      accessToken,
      refreshToken,
      expiresIn,
      createdAt: Date.now(),
      updatedAt: new Date().toISOString(),
      profileId,
    });
    
    console.log('[LINKEDIN CALLBACK] saved connection for userId=', userId, { profileId });
    // Auto-ingest disabled - user needs to select account first, ingest triggered from frontend
    console.log('[LINKEDIN CALLBACK] User needs to select account, ingest will be triggered from frontend after selection');
    return settingsRedirect(res, req, 'linkedin_ads', true);
  } catch (e) {
    return settingsRedirect(res, req, 'linkedin_ads', false);
  }
});

// LinkedIn ad accounts list
router.get('/api/linkedin/accounts', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    const snap = await admin.database().ref(`platformConnections/${userId}/linkedin_ads`).once('value');
    const c = snap.val();
    if (!c?.accessToken) return res.status(400).json({ message: 'LinkedIn bağlantısı yok.' });
    // List accounts (sponsored accounts)
    const url = 'https://api.linkedin.com/v2/adAccountsV2?count=50';
    const r = await fetch(url, { headers: { Authorization: `Bearer ${c.accessToken}` } });
    const j: any = await r.json();
    if (!r.ok) return res.status(r.status).json({ message: 'LinkedIn adAccounts alınamadı', error: j });
    const elements = Array.isArray(j.elements) ? j.elements : [];
    const accounts = elements.map((e: any) => {
      const urn = e?.id || e?.account || e?.externalId || '';
      const id = String(urn).replace(/urn:li:sponsoredAccount:/,'');
      return { id, name: e?.name || id };
    });
    return res.json({ accounts });
  } catch (e) {
    return res.status(500).json({ message: 'LinkedIn hesapları çekilemedi', error: String(e) });
  }
});

// LinkedIn summary (last 7 days, daily breakdown)
router.get('/api/linkedin/summary', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'test-user';
    const snap = await admin.database().ref(`platformConnections/${userId}/linkedin_ads`).once('value');
    const c = snap.val();
    if (!c?.accessToken) return res.status(400).json({ message: 'LinkedIn bağlantısı yok.' });
    let accountId = c?.accountId;
    if (!accountId) {
      // Try to auto-pick first account if not set
      try {
        const accResp = await fetch('https://api.linkedin.com/v2/adAccountsV2?count=1', { headers: { Authorization: `Bearer ${c.accessToken}` } });
        const accJson: any = await accResp.json();
        const first = accJson?.elements?.[0];
        if (first) {
          const urn = first?.id || '';
          accountId = String(urn).replace(/urn:li:sponsoredAccount:/,'');
          await admin.database().ref(`platformConnections/${userId}/linkedin_ads/accountId`).set(accountId);
        }
      } catch {}
    }
    if (!accountId) return res.status(400).json({ message: 'LinkedIn reklam hesabı seçilmedi.' });
    // Date range
    const today = new Date();
    const endD = new Date(today); endD.setDate(today.getDate() - 1);
    const startD = new Date(endD); startD.setDate(endD.getDate() - 6);
    const fmtNum = (d: Date) => d.toISOString().slice(0,10).replace(/-/g,'');
    const sinceNum = fmtNum(startD);
    const untilNum = fmtNum(endD);
    // adAnalytics request (pivot: ACCOUNT) - daily granularity by passing time granularity not directly available; emulate by splitting
    const days: Date[] = []; const cursor = new Date(startD); while (cursor <= endD) { days.push(new Date(cursor)); cursor.setDate(cursor.getDate()+1); }
    const daily: Array<{ date: string; impressions: number; clicks: number; spend: number; }> = [];
    for (const d of days) {
      const dayStart = fmtNum(d); const dayEnd = fmtNum(d);
      const body = {
        pivot: 'ACCOUNT',
        timeRange: { start: Number(dayStart), end: Number(dayEnd) },
        accounts: [ `urn:li:sponsoredAccount:${accountId}` ],
        fields: [ 'impressions', 'clicks', 'costInLocalCurrency' ]
      } as any;
      try {
        const resp = await fetch('https://api.linkedin.com/v2/adAnalyticsV2', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.accessToken}` }, body: JSON.stringify(body)
        });
        const j: any = await resp.json();
        const row = Array.isArray(j.elements) ? j.elements[0] : null;
        daily.push({
          date: d.toISOString().slice(0,10),
          impressions: Number(row?.impressions || 0),
          clicks: Number(row?.clicks || 0),
          spend: Number(row?.costInLocalCurrency || 0),
        });
      } catch {
        daily.push({ date: d.toISOString().slice(0,10), impressions: 0, clicks: 0, spend: 0 });
      }
    }
    const totals = daily.reduce((acc, r) => { acc.impressions += r.impressions; acc.clicks += r.clicks; acc.spend += r.spend; return acc; }, { impressions: 0, clicks: 0, spend: 0 });
    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    return res.json({ accountId, rows: daily, totals: { ...totals, ctr, cpc } });
  } catch (e) {
    return res.status(500).json({ message: 'LinkedIn özet alınamadı', error: String(e) });
  }
});

// Ingest LinkedIn metrics into BigQuery (secured)
router.post('/api/ingest/linkedin-ads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { userId, from, to } = (req.body || {}) as { userId?: string; from?: string; to?: string };
    const uid = userId || 'test-user';
    const startISO = from || new Date(Date.now() - 7*86400000).toISOString().slice(0,10);
    const endISO = to || new Date(Date.now() - 1*86400000).toISOString().slice(0,10);
    const snap = await admin.database().ref(`platformConnections/${uid}/linkedin_ads`).once('value');
    const c = snap.val();
    if (!c?.accessToken) return res.status(400).json({ message: 'No LinkedIn access token' });
    const accountId = c?.accountId;
    if (!accountId) return res.status(400).json({ message: 'No LinkedIn accountId' });
    const start = new Date(startISO); const end = new Date(endISO);
    const days: Date[] = []; const cursor = new Date(start); while (cursor <= end) { days.push(new Date(cursor)); cursor.setDate(cursor.getDate()+1); }
    const rowsToInsert: any[] = [];
    const fmtNum = (d: Date) => d.toISOString().slice(0,10).replace(/-/g,'');
    for (const d of days) {
      const dayStart = fmtNum(d); const dayEnd = fmtNum(d);
      const body = {
        pivot: 'ACCOUNT',
        timeRange: { start: Number(dayStart), end: Number(dayEnd) },
        accounts: [ `urn:li:sponsoredAccount:${accountId}` ],
        fields: [ 'impressions', 'clicks', 'costInLocalCurrency' ]
      } as any;
      try {
        const resp = await fetch('https://api.linkedin.com/v2/adAnalyticsV2', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.accessToken}` }, body: JSON.stringify(body)
        });
        const j: any = await resp.json();
        const row = Array.isArray(j.elements) ? j.elements[0] : null;
        rowsToInsert.push({
          userId: String(uid),
          source: 'linkedin_ads',
          date: d.toISOString().slice(0,10),
          impressions: Number(row?.impressions || 0),
          clicks: Number(row?.clicks || 0),
          costMicros: Math.round(Number(row?.costInLocalCurrency || 0) * 1_000_000),
          transactions: 0,
          sessions: 0,
          revenueMicros: 0,
          campaignId: null,
          adGroupId: null,
        });
      } catch {
        rowsToInsert.push({ userId: String(uid), source: 'linkedin_ads', date: d.toISOString().slice(0,10), impressions: 0, clicks: 0, costMicros: 0, transactions: 0, sessions: 0, revenueMicros: 0, campaignId: null, adGroupId: null });
      }
    }
    if (rowsToInsert.length) await insertMetrics(rowsToInsert);
    res.json({ ok: true, inserted: rowsToInsert.length });
  } catch (e: any) {
    res.status(500).json({ message: 'LinkedIn ingest failed', error: e?.message || String(e) });
  }
});

/* ===================== HUBSPOT CRM INTEGRATION (OAuth + API) ===================== */
// Env vars: HUBSPOT_CLIENT_ID, HUBSPOT_CLIENT_SECRET, HUBSPOT_REDIRECT_URI
// Stored under connections table with platform='hubspot'

// Initiate HubSpot OAuth
router.get('/api/auth/hubspot/connect', hubspot.hubspotAuthRedirect);

// HubSpot OAuth callback
router.get('/api/auth/hubspot/callback', hubspot.hubspotOAuthCallback);

// Get HubSpot contacts
router.get('/api/hubspot/contacts', hubspot.getHubSpotContacts);

// Get HubSpot deals
router.get('/api/hubspot/deals', hubspot.getHubSpotDeals);

// Get HubSpot companies
router.get('/api/hubspot/companies', hubspot.getHubSpotCompanies);

// Test HubSpot connection
router.get('/api/hubspot/summary', hubspot.testHubSpotConnection);

// Disconnect HubSpot
router.post('/api/hubspot/disconnect', hubspot.disconnectHubSpot);

// Google Analytics property listesi endpointi
router.get('/api/analytics/properties', async (req, res) => {
  const userId = req.query.userId || 'test-user';
  const force = req.query.force === '1' || req.query.force === 'true';
  try {
    // Kullanıcının GA bağlantısını al
    const snapshot = await admin.database().ref(`platformConnections/${userId}/google_analytics`).once('value');
    const gaConn = snapshot.val();
    if (!gaConn || !gaConn.accessToken) {
      return res.status(400).json({ properties: [], error: 'no_token' });
    }

    // Token ve cache hazırlığı
    let accessToken: string = gaConn.accessToken;
    const cacheKey = `cache/ga/properties/${userId}`;

    // Cache (force değilse)
    if (!force) {
      const cacheSnap = await admin.database().ref(cacheKey).once('value');
      const cached = cacheSnap.val();
      const nowTs = Date.now();
      const ttlMs = 10 * 60 * 1000; // 10 dakika
      if (cached && cached.cachedAt && (nowTs - cached.cachedAt) < ttlMs) {
        res.setHeader('X-Cache', 'HIT');
        return res.json({ properties: cached.properties || [] });
      }
    }

    // Gerekirse token yenile (expiresAt geçmişse) – sessiz dene
    try {
      const now = new Date();
      const expiresAt = gaConn.expiresAt ? new Date(gaConn.expiresAt) : null;
      if (expiresAt && expiresAt < now && gaConn.refreshToken) {
        const params = new URLSearchParams();
        params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
        params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
        params.append('refresh_token', gaConn.refreshToken);
        params.append('grant_type', 'refresh_token');
        const resp = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params,
        }, 10000);
        const data = await resp.json();
        if (data.access_token) {
          accessToken = data.access_token;
          const newExpires = new Date(now.getTime() + (data.expires_in || 3600) * 1000);
          await admin.database().ref(`platformConnections/${userId}/google_analytics`).update({
            accessToken,
            expiresAt: newExpires.toISOString(),
            updatedAt: now.toISOString(),
          });
        }
      }
    } catch (_) {}

    // İsteğe bağlı: yetkili Google hesabının e-postasını çek (debug amaçlı)
    let meEmail: string | undefined;
    try {
      const meResp = await fetchWithTimeout('https://www.googleapis.com/oauth2/v3/userinfo', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }, 8000);
      if (meResp.ok) {
        const me = await meResp.json();
        meEmail = me.email;
      }
    } catch (_) {}

    // accountSummaries üzerinden tüm property'leri topla (v1beta)
    let allProperties: { id: string; name: string; accountId?: string }[] = [];
    let nextPageToken: string | undefined;
    let triedRefresh = false;

    const fetchSummaries = async (tokenToUse: string) => {
      const url = new URL('https://analyticsadmin.googleapis.com/v1beta/accountSummaries');
      url.searchParams.set('pageSize', '200');
      if (nextPageToken) url.searchParams.set('pageToken', String(nextPageToken));
      const resp = await fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json',
        },
      }, 10000);
      return resp;
    };

    do {
      let resp = await fetchSummaries(accessToken);
      if (resp.status === 401 && gaConn.refreshToken && !triedRefresh) {
        // Bir kez token yenileyip tekrar dene
        triedRefresh = true;
        try {
          const params = new URLSearchParams();
          params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
          params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
          params.append('refresh_token', gaConn.refreshToken);
          params.append('grant_type', 'refresh_token');
          const refreshResp = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          }, 10000);
          const data = await refreshResp.json();
          if (data.access_token) {
            accessToken = data.access_token;
            resp = await fetchSummaries(accessToken);
          }
        } catch (_) {}
      }
      if (!resp.ok) {
        const raw = await resp.text();
        return res.status(resp.status).json({ properties: [], error: 'admin_account_summaries_failed', raw });
      }
      const json = await resp.json();
      const summaries = json.accountSummaries || [];
      for (const s of summaries) {
        const accountId = String(s.account).split('/')[1];
        const props = s.propertySummaries || [];
        for (const p of props) {
          allProperties.push({
            id: String(p.property).replace('properties/', ''),
            name: p.displayName || p.property,
            accountId,
          });
        }
      }
      nextPageToken = json.nextPageToken;
    } while (nextPageToken);

    if (allProperties.length > 0) {
      await admin.database().ref(cacheKey).set({ properties: allProperties, cachedAt: Date.now() });
      res.setHeader('X-Cache', 'MISS');
    }
    return res.json({ properties: allProperties, meEmail });
  } catch (err) {
    return res.status(500).json({ properties: [], error: 'server_error' });
  }
});

// ===== BigQuery Admin/Test Endpoints (secured) =====
function requireAdmin(req: express.Request, res: express.Response): boolean {
  const key = process.env.ADMIN_API_KEY;
  // If admin key is set, enforce it; otherwise allow (needed in production where key may be absent)
  if (key) {
    const header = req.header('x-admin-key');
    if (header !== key) {
      res.status(403).json({ message: 'forbidden' });
      return false;
    }
    return true;
  }
  return true;
}

router.post('/api/bq/ensure', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { dataset, table } = await ensureDatasetAndTable();
    res.json({ ok: true, dataset: dataset.id, table: table.id });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e?.message || 'error' });
  }
});

router.post('/api/bq/insert-test', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { userId = 'demo', days = 7 } = (req.body || {}) as { userId?: string; days?: number };
  try {
    const today = new Date();
    const rows = Array.from({ length: Number(days) }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const clicks = Math.floor(100 + Math.random() * 400);
      const impressions = Math.floor(clicks * (5 + Math.random() * 10));
      const costMicros = Math.floor(clicks * (20000 + Math.random() * 100000));
      const revenueMicros = Math.floor(clicks * (50000 + Math.random() * 200000));
      return {
        userId: String(userId),
        source: ['google_ads', 'meta_ads', 'tiktok_ads'][i % 3],
        date,
        campaignId: `cmp_${i % 4}`,
        adGroupId: `adg_${i % 7}`,
        impressions,
        clicks,
        costMicros,
        transactions: Math.floor(clicks * 0.02),
        sessions: Math.floor(clicks * 1.4),
        revenueMicros,
      };
    });
    const result = await insertMetrics(rows);
    res.json({ ok: true, ...result });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e?.message || 'error' });
  }
});

router.get('/api/bq/summary', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const userId = String((req.query as any)?.userId || 'demo');
    const from = String((req.query as any)?.from || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
    const to = String((req.query as any)?.to || new Date().toISOString().slice(0, 10));
    const rows = await queryByUserAndRange(userId, from, to);
    res.json({ ok: true, rows });
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e?.message || 'error' });
  }
});

// Admin: Belirli bir kullanıcının tüm BigQuery verilerini ve bağlantılarını temizle
router.post('/api/admin/purge-user-data', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const userId = String(req.body?.userId || req.query?.userId || '').trim();
    if (!userId) return res.status(400).json({ message: 'userId gerekli' });

    // Firebase bağlantılarını ve ayarlarını temizle (tam reset için)
    await Promise.all([
      admin.database().ref(`platformConnections/${userId}`).remove(),
      admin.database().ref(`settings/${userId}`).remove(),
    ]);

    // BigQuery tablolarını temizle
    try {
      const bq = getBigQuery();
      const dataset = process.env.BQ_DATASET || 'iqsion';
      const queries = [
        `DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\` WHERE userId = @userId`,
        `DELETE FROM \`${bq.projectId}.${dataset}.ga4_daily\` WHERE userId = @userId`,
        `DELETE FROM \`${bq.projectId}.${dataset}.ga4_geo_daily\` WHERE userId = @userId`,
      ];
      for (const query of queries) {
        const [job] = await bq.createQueryJob({
          query,
          params: { userId },
          location: process.env.BQ_LOCATION || 'US',
        });
        await job.getQueryResults();
      }
      console.log(`[PURGE] Deleted BQ data for ${userId}`);
    } catch (err) {
      console.error('[PURGE] BigQuery cleanup failed:', err);
    }

    return res.json({ ok: true, userId, message: 'Kullanıcı verileri temizlendi' });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || 'error' });
  }
});

// ===== Admin: List GA4 connected users (secured) =====
router.get('/api/admin/ga4/connected', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const snap = await admin.database().ref('platformConnections').once('value');
    const all = snap.val() || {};
    const list: Array<{ userId: string; propertyId?: string; hasAccessToken: boolean; hasRefreshToken: boolean }>= [];
    for (const [uid, conns] of Object.entries<any>(all)) {
      const ga = conns?.google_analytics || {};
      if (ga && (ga.accessToken || ga.refreshToken)) {
        list.push({
          userId: uid,
          propertyId: ga.propertyId,
          hasAccessToken: !!ga.accessToken,
          hasRefreshToken: !!ga.refreshToken,
        });
      }
    }
    // sort: prefer ones with propertyId and refreshToken
    list.sort((a,b)=> (Number(!!b.propertyId)+Number(!!b.hasRefreshToken)) - (Number(!!a.propertyId)+Number(!!a.hasRefreshToken)));
    return res.json({ ok: true, count: list.length, users: list.slice(0, 50) });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e?.message || 'error' });
  }
});

// ===== User Settings: Retention Days =====
// GET settings
router.get('/api/settings', async (req, res) => {
  try {
    let userUid: any = req.headers['x-user-uid'] || req.query.userId;
    if (Array.isArray(userUid)) userUid = userUid[0];
    const uid = typeof userUid === 'string' && userUid.length > 0 ? userUid : 'test-user';
    const snap = await admin.database().ref(`settings/${uid}`).once('value');
    const val = snap.val() || {};
    const defaultRetention = Number(process.env.DEFAULT_RETENTION_DAYS || 90);
    if (typeof val.retentionDays !== 'number') val.retentionDays = defaultRetention;
    if (typeof val.initialIngestDays !== 'number') val.initialIngestDays = 30;
    if (!val.platforms || typeof val.platforms !== 'object') val.platforms = {};
    if (!val.platforms.meta_ads || typeof val.platforms.meta_ads !== 'object') val.platforms.meta_ads = {};
    if (typeof val.platforms.meta_ads.retentionDays !== 'number') {
      val.platforms.meta_ads.retentionDays = val.retentionDays;
    }
    if (typeof val.platforms.meta_ads.initialIngestDays !== 'number') {
      val.platforms.meta_ads.initialIngestDays = val.initialIngestDays;
    }
    return res.json(val);
  } catch (e) {
    return res.status(500).json({ message: 'Settings okunamadı' });
  }
});

// ===== GA4 Ingest to BigQuery (secured) =====
router.post('/api/ingest/ga4', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { userId, from, to, propertyId: bodyPropertyId, accessToken: bodyAccessToken } = (req.body || {}) as { userId?: string; from?: string; to?: string; propertyId?: string; accessToken?: string };
    const uid = String(userId || 'test-user');
    
    // Kullanıcı ayarlarını oku
    const settingsSnap = await admin.database().ref(`settings/${uid}`).once('value');
    const userSettings = settingsSnap.val() || {};
    const gaPrefs = (userSettings.platforms && userSettings.platforms.google_analytics) || {};
    const defaultInitial = Number(gaPrefs.initialIngestDays || userSettings.initialIngestDays || 30);
    
    // Türkiye timezone'unda tarih hesapla (bugün + N gün geriye)
    const endDate = (to && String(to)) || getTurkeyDate(0); // Bugün dahil
    const startDate = (from && String(from)) || getTurkeyDate(-defaultInitial); // N gün geriye

    await ensureGa4Tables();

    // Read GA connection from Firebase
    const gaConnSnap = await admin.database().ref(`platformConnections/${uid}/google_analytics`).once('value');
    const gaConn = gaConnSnap.val() || {};
    const propertyId = (bodyPropertyId || (req.query.propertyId as string) || gaConn?.propertyId);
    if (!propertyId) return res.status(400).json({ message: 'No GA4 property selected' });

    // Eski GA4 kayıtlarını temizle (daily + geo) ki tekrar ingest duplikasyon yaratmasın
    try {
      const bq = getBigQuery();
      const dataset = process.env.BQ_DATASET || 'iqsion';
      const params = { userId: uid, start: startDate, end: endDate, propertyId };
      const queries = [
        `DELETE FROM \`${bq.projectId}.${dataset}.ga4_daily\` WHERE userId = @userId AND date BETWEEN DATE(@start) AND DATE(@end) AND propertyId = @propertyId`,
        `DELETE FROM \`${bq.projectId}.${dataset}.ga4_geo_daily\` WHERE userId = @userId AND date BETWEEN DATE(@start) AND DATE(@end) AND propertyId = @propertyId`
      ];
      for (const sql of queries) {
        const [job] = await bq.createQueryJob({
          query: sql,
          params,
          location: process.env.BQ_LOCATION || 'US',
        });
        await job.getQueryResults();
      }
      console.log(`[GA4 INGEST] Deleted old data for ${uid}/${propertyId} from ${startDate} to ${endDate}`);
    } catch (err) {
      console.error('[GA4 INGEST] Delete old GA4 data failed:', err);
    }

    // Access token refresh if needed (reuse logic similar to properties endpoint)
    let accessToken: string = bodyAccessToken || gaConn.accessToken || '';
    try {
      if (!bodyAccessToken) {
        const now = new Date();
        const expiresAt = gaConn.expiresAt ? new Date(gaConn.expiresAt) : null;
        if (gaConn.refreshToken && (!accessToken || !expiresAt || (expiresAt && expiresAt < now))) {
          const tryRefresh = async () => {
            const params1 = new URLSearchParams();
            params1.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
            params1.append('client_secret', process.env.GOOGLE_CLIENT_SECRET || '');
            params1.append('refresh_token', gaConn.refreshToken);
            params1.append('grant_type', 'refresh_token');
            let rr = await fetchWithTimeout('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params1 }, 12000);
            let dj = await rr.json();
            if (!dj.access_token && process.env.GOOGLE_SC_CLIENT_ID && process.env.GOOGLE_SC_CLIENT_SECRET) {
              const params2 = new URLSearchParams();
              params2.append('client_id', process.env.GOOGLE_SC_CLIENT_ID || '');
              params2.append('client_secret', process.env.GOOGLE_SC_CLIENT_SECRET || '');
              params2.append('refresh_token', gaConn.refreshToken);
              params2.append('grant_type', 'refresh_token');
              rr = await fetchWithTimeout('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params2 }, 12000);
              dj = await rr.json();
            }
            return dj;
          };
          const data = await tryRefresh();
          if (data.access_token) {
            accessToken = data.access_token;
            const newExpires = new Date(now.getTime() + (data.expires_in || 3600) * 1000);
            await admin.database().ref(`platformConnections/${uid}/google_analytics`).update({
              accessToken,
              expiresAt: newExpires.toISOString(),
              updatedAt: now.toISOString(),
            });
          }
        }
      }
    } catch (_) {}
    if (!accessToken) return res.status(400).json({ message: 'No GA access token' });

    const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`;
    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } as any;

    // 1) Daily totals
    const dailyBody = {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'eventCount' },
        { name: 'bounceRate' },
      ],
    };
    let dailyResp = await fetchWithTimeout(baseUrl, { method: 'POST', headers, body: JSON.stringify(dailyBody) }, 20000);
    let dailyJson: any = await dailyResp.json();
    if (!dailyResp.ok && (dailyResp as any).status === 401 && gaConn.refreshToken && !bodyAccessToken) {
      try {
        const tryRefresh2 = async () => {
          const params1 = new URLSearchParams();
          params1.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
          params1.append('client_secret', process.env.GOOGLE_CLIENT_SECRET || '');
          params1.append('refresh_token', gaConn.refreshToken);
          params1.append('grant_type', 'refresh_token');
          let rr = await fetchWithTimeout('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params1 }, 12000);
          let dj = await rr.json();
          if (!dj.access_token && process.env.GOOGLE_SC_CLIENT_ID && process.env.GOOGLE_SC_CLIENT_SECRET) {
            const params2 = new URLSearchParams();
            params2.append('client_id', process.env.GOOGLE_SC_CLIENT_ID || '');
            params2.append('client_secret', process.env.GOOGLE_SC_CLIENT_SECRET || '');
            params2.append('refresh_token', gaConn.refreshToken);
            params2.append('grant_type', 'refresh_token');
            rr = await fetchWithTimeout('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params2 }, 12000);
            dj = await rr.json();
          }
          return dj;
        };
        const data = await tryRefresh2();
        if (data.access_token) {
          accessToken = data.access_token;
          headers['Authorization'] = `Bearer ${accessToken}`;
          const now2 = new Date();
          const newExpires2 = new Date(now2.getTime() + (data.expires_in || 3600) * 1000);
          await admin.database().ref(`platformConnections/${uid}/google_analytics`).update({
            accessToken,
            expiresAt: newExpires2.toISOString(),
            updatedAt: now2.toISOString(),
          });
          // retry once
          dailyResp = await fetchWithTimeout(baseUrl, { method: 'POST', headers, body: JSON.stringify(dailyBody) }, 20000);
          dailyJson = await dailyResp.json();
        }
      } catch (_) {}
    }
    if (!dailyResp.ok) {
      console.error('[GA4 INGEST] Daily report failed:', {
        status: dailyResp.status,
        statusText: dailyResp.statusText,
        propertyId,
        userId: uid,
        details: dailyJson
      });
      return res.status(500).json({ message: 'GA4 daily report failed', details: dailyJson });
    }
    const dailyRows = Array.isArray(dailyJson.rows) ? dailyJson.rows : [];
    const dailyToInsert = dailyRows.map((r: any) => {
      const d = (r.dimensionValues?.[0]?.value || '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
      const m = (idx: number, fallback = 0) => Number(r.metricValues?.[idx]?.value || fallback);
      return {
        userId: uid,
        date: d,
        propertyId,
        sessions: Math.round(m(0, 0)),
        avgSessionDurationSec: m(1, 0),
        activeUsers: Math.round(m(2, 0)),
        newUsers: Math.round(m(3, 0)),
        eventCount: Math.round(m(4, 0)),
        bounceRate: m(5, 0),
      };
    });
    if (dailyToInsert.length) await insertGa4Daily(dailyToInsert);

    // 2) Geo by region per day
    const geoBody = {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }, { name: 'region' }],
      metrics: [ { name: 'sessions' }, { name: 'activeUsers' } ],
    };
    let geoResp = await fetchWithTimeout(baseUrl, { method: 'POST', headers, body: JSON.stringify(geoBody) }, 20000);
    let geoJson: any = await geoResp.json();
    if (!geoResp.ok && (geoResp as any).status === 401 && gaConn.refreshToken && !bodyAccessToken) {
      // If token expired between calls, try one refresh and retry geo
      try {
        const tryRefresh3 = async () => {
          const params1 = new URLSearchParams();
          params1.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
          params1.append('client_secret', process.env.GOOGLE_CLIENT_SECRET || '');
          params1.append('refresh_token', gaConn.refreshToken);
          params1.append('grant_type', 'refresh_token');
          let rr = await fetchWithTimeout('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params1 }, 12000);
          let dj = await rr.json();
          if (!dj.access_token && process.env.GOOGLE_SC_CLIENT_ID && process.env.GOOGLE_SC_CLIENT_SECRET) {
            const params2 = new URLSearchParams();
            params2.append('client_id', process.env.GOOGLE_SC_CLIENT_ID || '');
            params2.append('client_secret', process.env.GOOGLE_SC_CLIENT_SECRET || '');
            params2.append('refresh_token', gaConn.refreshToken);
            params2.append('grant_type', 'refresh_token');
            rr = await fetchWithTimeout('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params2 }, 12000);
            dj = await rr.json();
          }
          return dj;
        };
        const data = await tryRefresh3();
        if (data.access_token) {
          accessToken = data.access_token;
          headers['Authorization'] = `Bearer ${accessToken}`;
          geoResp = await fetchWithTimeout(baseUrl, { method: 'POST', headers, body: JSON.stringify(geoBody) }, 20000);
          geoJson = await geoResp.json();
        }
      } catch (_) {}
    }
    if (geoResp.ok) {
      const geoRows = Array.isArray(geoJson.rows) ? geoJson.rows : [];
      const geoToInsert = geoRows.map((r: any) => {
        const d = (r.dimensionValues?.[0]?.value || '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        const region = String(r.dimensionValues?.[1]?.value || '');
        const m = (idx: number, fallback = 0) => Number(r.metricValues?.[idx]?.value || fallback);
        return {
          userId: uid,
          date: d,
          propertyId,
          region,
          sessions: Math.round(m(0, 0)),
          activeUsers: Math.round(m(1, 0)),
        };
      });
      if (geoToInsert.length) await insertGa4GeoDaily(geoToInsert);
    }

    return res.json({ ok: true, insertedDaily: dailyToInsert.length, startDate, endDate, propertyId });
  } catch (e: any) {
    return res.status(500).json({ message: 'GA4 ingest failed', error: e?.message || 'error' });
  }
});

// ===== GA4 Manual Refresh (Settings page specific endpoint used by frontend) =====
router.post('/api/ingest/ga4/refresh', async (req, res) => {
  try {
    const uid = String(req.body?.userId || req.query?.userId || 'test-user');
    const range = String(req.body?.range || req.query?.range || '7d');

    // Türkiye timezone'unda tarih aralığını hesapla (bugün dahil)
    // "Son 7 Gün" = bugün + 7 gün geriye = 8 gün veri → -7
    // "Son 30 Gün" = bugün + 30 gün geriye = 31 gün veri → -30
    // "Son 90 Gün" = bugün + 90 gün geriye = 91 gün veri → -90
    const endDate = getTurkeyDate(0);
    let startDate = endDate;
    switch (range) {
      case 'today':
        startDate = endDate;
        break;
      case '30d':
        startDate = getTurkeyDate(-30);
        break;
      case '90d':
        startDate = getTurkeyDate(-90);
        break;
      case '7d':
      default:
        startDate = getTurkeyDate(-7);
        break;
    }

    const ingestBase = buildApiBase(req);
    const adminKey = (process.env.ADMIN_API_KEY || '').trim();
    const resp = await fetchWithTimeout(`${ingestBase}/api/ingest/ga4`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminKey ? { 'x-admin-key': adminKey } : {}),
      },
      body: JSON.stringify({ userId: uid, from: startDate, to: endDate }),
    }, 120000);

    const data = await resp.json();
    if (resp.ok) {
      return res.json({
        ok: true,
        message: 'GA4 verileri güncellendi',
        range,
        startDate,
        endDate,
        insertedDaily: data.insertedDaily || data.inserted || 0,
      });
    }

    return res.status(resp.status).json({
      ok: false,
      message: 'GA4 manuel güncelleme başarısız',
      details: data,
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      message: 'GA4 manuel güncelleme hatası',
      error: e?.message || 'error',
    });
  }
});

// ===== Generic Manual Refresh for ALL Platforms (Settings page) =====
router.post('/api/ingest/refresh', async (req, res) => {
  try {
    const uid = String(req.body?.userId || req.query?.userId || 'test-user');
    const platform = String(req.body?.platform || req.query?.platform || 'ga4'); // 'ga4', 'meta_ads', 'google_ads', 'shopify'
    const range = String(req.body?.range || req.query?.range || '7d'); // 'today', '7d', '30d', '90d'
    
    // Türkiye timezone'unda tarih aralığını hesapla
    // "Son N gün" = bugün + N gün geriye (N+1 günlük veri)
    let startDate: string;
    let endDate: string = getTurkeyDate(0);
    
    switch (range) {
      case 'today':
        startDate = endDate;
        break;
      case '7d':
        // Son 7 gün = bugün + 7 gün geriye = 8 günlük veri
        startDate = getTurkeyDate(-7);
        break;
      case '30d':
        // Son 30 gün = bugün + 30 gün geriye = 31 günlük veri
        startDate = getTurkeyDate(-30);
        break;
      case '90d':
        // Son 90 gün = bugün + 90 gün geriye = 91 günlük veri
        startDate = getTurkeyDate(-90);
        break;
      default:
        startDate = getTurkeyDate(-7);
    }
    
    // Map platform to ingest endpoint
    const platformMap: Record<string, string> = {
      'ga4': '/api/ingest/ga4',
      'google_analytics': '/api/ingest/ga4',
      'meta_ads': '/api/ingest/meta-ads',
      'google_ads': '/api/ingest/google-ads',
      'shopify': '/api/ingest/shopify',
    };
    
    const endpoint = platformMap[platform];
    if (!endpoint) {
      return res.status(400).json({ ok: false, message: `Unsupported platform: ${platform}` });
    }
    
    // Call platform-specific ingest endpoint
    const ingestBase = buildApiBase(req);
    const ingestUrl = `${ingestBase}${endpoint}`;
    const adminKey = (process.env.ADMIN_API_KEY || '').trim();
    
    const response = await fetchWithTimeout(ingestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminKey ? { 'x-admin-key': adminKey } : {}),
      },
      body: JSON.stringify({ userId: uid, from: startDate, to: endDate }),
    }, 120000); // 120 second timeout for large ranges
    
    const data = await response.json();
    
    if (response.ok) {
      return res.json({ 
        ok: true, 
        message: `${platform} verileri güncellendi`, 
        platform,
        range, 
        startDate, 
        endDate, 
        inserted: data.inserted || data.insertedDaily || 0
      });
    } else {
      return res.status(response.status).json({ 
        ok: false, 
        message: `${platform} güncelleme başarısız`, 
        details: data 
      });
    }
  } catch (e: any) {
    return res.status(500).json({ 
      ok: false, 
      message: 'Manuel güncelleme hatası', 
      error: e?.message || 'error' 
    });
  }
});

// ===== Shopify Ingest to BigQuery (secured) =====
router.post('/api/ingest/shopify', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { userId, from, to } = (req.body || {}) as { userId?: string; from?: string; to?: string };
    const uid = String(userId || 'test-user');
    
    // Kullanıcı ayarlarını oku
    const settingsSnap = await admin.database().ref(`settings/${uid}`).once('value');
    const userSettings = settingsSnap.val() || {};
    const shopifyPrefs = (userSettings.platforms && userSettings.platforms.shopify) || {};
    const defaultInitial = Number(shopifyPrefs.initialIngestDays || userSettings.initialIngestDays || 30);
    
    // Türkiye timezone'unda tarih hesapla (bugün + N gün geriye)
    const endDate = (to && String(to)) || getTurkeyDate(0); // Bugün dahil
    const startDate = (from && String(from)) || getTurkeyDate(-defaultInitial); // N gün geriye

    const shopSnap = await admin.database().ref(`platformConnections/${uid}/shopify`).once('value');
    const shopConn = shopSnap.val() || {};
    const storeUrl = String(shopConn.storeUrl || '').trim().replace(/^https?:\/\//,'').replace(/\/$/,'');
    const accessToken = String(shopConn.accessToken || '');
    if (!storeUrl || !accessToken) return res.status(400).json({ message: 'Shopify bağlantısı bulunamadı (storeUrl/accessToken)' });

    // Önce bu tarih aralığındaki eski Shopify verilerini temizle (mağaza bazlı)
    try {
      const bq = getBigQuery();
      const dataset = process.env.BQ_DATASET || 'iqsion';
      const deleteSql = `
        DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
        WHERE userId = @userId AND source = 'shopify' AND accountId = @accountId AND date BETWEEN DATE(@start) AND DATE(@end)
      `;
      const [deleteJob] = await bq.createQueryJob({
        query: deleteSql,
        params: { userId: uid, accountId: storeUrl, start: startDate, end: endDate },
        location: process.env.BQ_LOCATION || 'US',
      });
      await deleteJob.getQueryResults();
    } catch (err) {
      console.error('[Shopify INGEST] Delete old data failed:', err);
    }

    const baseUrl = `https://${storeUrl}/admin/api/2023-10`;
    const headers = { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' } as any;

    // Paginate orders between dates, status=paid/any
    const params = new URLSearchParams({
      status: 'any',
      created_at_min: `${startDate}T00:00:00Z`,
      created_at_max: `${endDate}T23:59:59Z`,
      limit: '250',
      fields: 'id,created_at,total_price,currency,financial_status',
      order: 'created_at asc'
    });
    let nextUrl = `${baseUrl}/orders.json?${params.toString()}`;
    const bucket: Record<string, { revenue: number; orders: number }>= {};
    let pages = 0;
    while (nextUrl && pages < 50) {
      pages++;
      const r = await fetchWithTimeout(nextUrl, { method: 'GET', headers }, 20000);
      if (!r.ok) break;
      const data: any = await r.json();
      const orders = Array.isArray(data.orders) ? data.orders : [];
      for (const o of orders) {
        const date = String(o.created_at || '').slice(0,10);
        const total = Number(o.total_price || 0);
        if (!bucket[date]) bucket[date] = { revenue: 0, orders: 0 };
        bucket[date].revenue += isFinite(total) ? total : 0;
        bucket[date].orders += 1;
      }
      // pagination
      const link = r.headers.get('link') || '';
      const m = link.match(/<([^>]+)>; rel="next"/);
      nextUrl = m ? m[1] : '';
    }

    const rows = Object.entries(bucket).map(([date, v]) => ({
      userId: uid,
      source: 'shopify',
      accountId: storeUrl,
      date,
      impressions: null as any,
      clicks: null as any,
      costMicros: null as any,
      sessions: null as any,
      transactions: v.orders,
      revenueMicros: Math.round(v.revenue * 1_000_000),
    }));
    if (rows.length) await insertMetrics(rows as any);
    return res.json({ ok: true, inserted: rows.length, startDate, endDate });
  } catch (e: any) {
    return res.status(500).json({ message: 'Shopify ingest failed', error: e?.message || 'error' });
  }
});

// ===== Google Ads Ingest to BigQuery (secured) =====
router.post('/api/ingest/google-ads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { userId, from, to } = (req.body || {}) as { userId?: string; from?: string; to?: string };
    const uid = String(userId || 'test-user');
    
    // Kullanıcı ayarlarını oku
    const settingsSnap = await admin.database().ref(`settings/${uid}`).once('value');
    const userSettings = settingsSnap.val() || {};
    const gadsPrefs = (userSettings.platforms && userSettings.platforms.google_ads) || {};
    const defaultInitial = Number(gadsPrefs.initialIngestDays || userSettings.initialIngestDays || 30);
    
    // Türkiye timezone'unda tarih hesapla (bugün + N gün geriye)
    const endDate = (to && String(to)) || getTurkeyDate(0); // Bugün dahil
    const startDate = (from && String(from)) || getTurkeyDate(-defaultInitial); // N gün geriye

    const snap = await admin.database().ref(`platformConnections/${uid}/google_ads`).once('value');
    const gads = snap.val() || {};
    const refresh_token = gads.refreshToken || gads.refresh_token;
    const customer_id = (gads.accountId || gads.customerId || '').replace(/-/g,'');
    const login_customer_id = (gads.loginCustomerId || '').replace(/-/g,'') || undefined;
    if (!refresh_token || !customer_id) return res.status(400).json({ message: 'Google Ads bağlantısı eksik (refresh_token/accountId)' });

    // IMPORTANT: Always use environment variables for OAuth credentials
    const oauth_client_id = (process.env.GOOGLE_ADS_CLIENT_ID || '').trim();
    const oauth_client_secret = (process.env.GOOGLE_ADS_CLIENT_SECRET || '').trim();
    
    if (!oauth_client_id || !oauth_client_secret) {
      console.error('[GOOGLE ADS INGEST] Missing GOOGLE_ADS_CLIENT_ID or GOOGLE_ADS_CLIENT_SECRET');
      return res.status(500).json({ message: 'Google Ads OAuth credentials not configured' });
    }
    
    console.error('[GOOGLE ADS INGEST] Using credentials:', {
      clientIdPrefix: oauth_client_id.substring(0, 20),
      developedToken: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN
    });

    // Önce bu tarih aralığındaki eski Google Ads verilerini sil (duplicate önleme)
    try {
      const bq = getBigQuery();
      const dataset = process.env.BQ_DATASET || 'iqsion';
      const deleteSql = `
        DELETE FROM \`${bq.projectId}.${dataset}.metrics_daily\`
        WHERE userId = @userId AND source = 'google_ads' AND accountId = @accountId AND date BETWEEN DATE(@start) AND DATE(@end)
      `;
      const [deleteJob] = await bq.createQueryJob({
        query: deleteSql,
        params: { userId: uid, accountId: customer_id, start: startDate, end: endDate },
        location: process.env.BQ_LOCATION || 'US',
      });
      await deleteJob.getQueryResults();
    } catch (e) {
      console.error('[Google Ads INGEST] Delete old data failed:', e);
    }

    const api = new GoogleAdsApi({
      client_id: oauth_client_id,
      client_secret: oauth_client_secret,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });
    const customer = (api as any).Customer({ customer_id, refresh_token, login_customer_id });
    // GAQL günlük metrikler
    const query = `
      SELECT segments.date, campaign.id, metrics.impressions, metrics.clicks, metrics.cost_micros
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    `;
    let rows: any[] = [];
    try {
      rows = await customer.query(query);
    } catch (err) {
      return res.status(500).json({ message: 'Google Ads query failed', error: String(err) });
    }
    const toInsert = rows.map((r: any) => ({
      userId: uid,
      source: 'google_ads',
      accountId: customer_id,
      date: r.segments?.date,
      campaignId: String(r.campaign?.id || ''),
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      costMicros: Number(r.metrics?.cost_micros || 0),
      sessions: null as any,
      transactions: null as any,
      revenueMicros: null as any,
    }));
    if (toInsert.length) await insertMetrics(toInsert as any);
    return res.json({ ok: true, inserted: toInsert.length, startDate, endDate });
  } catch (e: any) {
    return res.status(500).json({ message: 'Google Ads ingest failed', error: e?.message || 'error' });
  }
});

// ===== Meta Ads Ingest to BigQuery (secured) =====
router.post('/api/ingest/meta-ads', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { userId, from, to } = (req.body || {}) as { userId?: string; from?: string; to?: string };
    const uid = String(userId || 'test-user');

    const snap = await admin.database().ref(`platformConnections/${uid}/meta_ads`).once('value');
    const meta = snap.val() || {};
    const accessToken = meta.accessToken || process.env.META_ACCESS_TOKEN || '';
    let adAccountId = meta.accountId || meta.adAccountId || '';
    if (!adAccountId) return res.status(400).json({ message: 'Meta Ads bağlantısı eksik (accountId/accessToken)' });
    if (!String(adAccountId).startsWith('act_')) adAccountId = 'act_' + String(adAccountId).replace(/[^0-9]/g,'');

    const settingsSnap = await admin.database().ref(`settings/${uid}`).once('value');
    const userSettings = settingsSnap.val() || {};
    const metaPrefs = (userSettings.platforms && userSettings.platforms.meta_ads) || {};
    const defaultInitial = Number(metaPrefs.initialIngestDays || userSettings.initialIngestDays || 30);
    const defaultRetention = Number(metaPrefs.retentionDays || userSettings.retentionDays || process.env.DEFAULT_RETENTION_DAYS || 90);
    // Türkiye timezone'unda bugünü kullan (UTC yerine)
    const fallbackEnd = (to && String(to)) || getTurkeyDate(0);
    const windowDays = Math.max(1, (from || meta.lastSyncAt) ? Number(defaultRetention) : Number(defaultInitial));
    const computeStart = () => {
      // windowDays gün geriye + bugün = windowDays+1 günlük veri
      // Örn: 30 gün ayarı → bugün + 30 gün geriye = 31 günlük veri (ki "Son 30 Gün" filtresi çalışsın)
      return getTurkeyDate(-windowDays);
    };
    const since = (from && String(from)) || computeStart();
    const until = fallbackEnd;

    // MERGE kullandığımız için DELETE'e gerek yok (streaming buffer sorunu çözüldü)

    const fields = [
      'impressions','clicks','spend','actions','action_values','date_start'
    ].join(',');
    let url = `https://graph.facebook.com/v19.0/${encodeURIComponent(adAccountId)}/insights?fields=${fields}&level=account&time_increment=1&time_range={"since":"${since}","until":"${until}"}&access_token=${encodeURIComponent(accessToken)}`;
    let inserted = 0;
    for (let page = 0; page < 10 && url; page++) {
      const resp = await fetchWithTimeout(url, { method: 'GET' }, 20000);
      const j: any = await resp.json();
      if (!resp.ok) return res.status(500).json({ message: 'Meta insights failed', details: j });
      const data = Array.isArray(j.data) ? j.data : [];
      const toInsert = data.map((insight: any) => {
        const date = insight.date_start;
        const impressions = Number(insight.impressions || 0);
        const clicks = Number(insight.clicks || 0);
        const spend = Number(insight.spend || 0);
        let purchases = 0;
        let revenue = 0;
        for (const a of (insight.actions || [])) {
          if (a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase') purchases += Number(a.value || 0);
        }
        for (const av of (insight.action_values || [])) {
          if (av.action_type === 'purchase' || av.action_type === 'offsite_conversion.fb_pixel_purchase') revenue += Number(av.value || 0);
        }
        return {
          userId: uid,
          source: 'meta_ads',
          accountId: adAccountId,
          date,
          campaignId: null as any,
          impressions,
          clicks,
          costMicros: Math.round(spend * 1_000_000),
          sessions: null as any,
          transactions: purchases,
          revenueMicros: Math.round(revenue * 1_000_000),
        };
      });
      if (toInsert.length) {
        await insertMetrics(toInsert as any);
        inserted += toInsert.length;
      }
      url = (j.paging && j.paging.next) ? j.paging.next : '';
    }
    try {
      await admin.database().ref(`platformConnections/${uid}/meta_ads`).update({
        lastSyncAt: new Date().toISOString(),
        lastIngestRange: { since, until },
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Meta INGEST] failed to update connection metadata:', err);
    }
    // Retention cleanup artık MERGE ile otomatik (eski DELETE streaming buffer hatası veriyordu)
    // try {
    //   await applyRetentionForUserAndSource(uid, 'meta_ads', Number(defaultRetention) || 90);
    // } catch (err) {
    //   console.error('[Meta INGEST] retention cleanup failed:', err);
    // }
    return res.json({ ok: true, inserted, since, until });
  } catch (e: any) {
    return res.status(500).json({ message: 'Meta Ads ingest failed', error: e?.message || 'error' });
  }
});

// POST settings (apply retention immediately)
router.post('/api/settings', async (req, res) => {
  try {
    let userUid: any = req.headers['x-user-uid'] || req.query.userId || req.body?.userId;
    if (Array.isArray(userUid)) userUid = userUid[0];
    const uid = typeof userUid === 'string' && userUid.length > 0 ? userUid : 'test-user';
    const { retentionDays, initialIngestDays, platforms } = (req.body || {}) as {
      retentionDays?: number;
      initialIngestDays?: number;
      platforms?: Record<string, { retentionDays?: number; initialIngestDays?: number }>;
    };
    
    const updateData: any = { updatedAt: Date.now() };
    
    if (typeof retentionDays === 'number') {
      const days = Number(retentionDays || process.env.DEFAULT_RETENTION_DAYS || 90);
      updateData.retentionDays = days;
      try { await applyRetentionForUser(uid, days); } catch (e) { /* sessiz */ }
    }
    
    if (typeof initialIngestDays === 'number') {
      updateData.initialIngestDays = Number(initialIngestDays || 30);
    }

    const baseRef = admin.database().ref(`settings/${uid}`);
    await baseRef.update(updateData);

    if (platforms && typeof platforms === 'object') {
      const metaInput = platforms.meta_ads;
      if (metaInput && typeof metaInput === 'object') {
        const payload: any = {};
        if (typeof metaInput.retentionDays === 'number') {
          payload.retentionDays = Number(metaInput.retentionDays || process.env.DEFAULT_RETENTION_DAYS || 90);
          try { await applyRetentionForUserAndSource(uid, 'meta_ads', payload.retentionDays); } catch (e) { /* sessiz */ }
        }
        if (typeof metaInput.initialIngestDays === 'number') {
          payload.initialIngestDays = Number(metaInput.initialIngestDays || 30);
        }
        if (Object.keys(payload).length > 0) {
          payload.updatedAt = Date.now();
          await baseRef.child('platforms/meta_ads').update(payload);
        }
      }
    }

    const snapshot = await baseRef.once('value');
    return res.json(snapshot.val() || {});
  } catch (e) {
    return res.status(500).json({ message: 'Settings kaydedilemedi' });
  }
});

// ===== Realtime Sync (Her 10 dakikada, sadece bugünü günceller) =====
router.post('/api/cron/realtime-sync', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // 23:55-23:59 arası çalışma! Günlük kapanışa bırak
    if (currentHour === 23 && currentMinute >= 55) {
      return res.json({
        success: true,
        skipped: true,
        reason: 'Waiting for daily close (23:55-23:59)',
        timestamp: now.toISOString(),
      });
    }

    const allConnsSnap = await admin.database().ref('platformConnections').once('value');
    const allConns = allConnsSnap.val() || {};
    
    const results: Array<{ userId: string; platform: string; status: string; inserted?: number; error?: string }> = [];
    // Türkiye timezone'unda bugünü hesapla (UTC+3)
    const turkeyOffset = 3 * 60 * 60 * 1000; // 3 saat
    const turkeyNow = new Date(now.getTime() + turkeyOffset);
    const fmt = (d: Date) => {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const today = fmt(turkeyNow);
    
    for (const [userId, userConns] of Object.entries(allConns)) {
      const platforms = userConns as Record<string, any>;
      
      // Sadece bugünü çek (Türkiye timezone)
      const from = today;
      const to = today;
      
      // Meta Ads
      if (platforms.meta_ads?.isConnected && platforms.meta_ads?.accessToken) {
        try {
          const body = JSON.stringify({ userId, from, to });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/meta-ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'meta_ads', status: 'success', inserted: data.inserted || 0 });
        } catch (err: any) {
          results.push({ userId, platform: 'meta_ads', status: 'error', error: err.message });
        }
      }
      
      // Google Ads
      if (platforms.google_ads?.isConnected && platforms.google_ads?.refreshToken) {
        try {
          const body = JSON.stringify({ userId, from, to });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/google-ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'google_ads', status: 'success', inserted: data.inserted || 0 });
        } catch (err: any) {
          results.push({ userId, platform: 'google_ads', status: 'error', error: err.message });
        }
      }
      
      // Shopify
      if (platforms.shopify?.isConnected && platforms.shopify?.accessToken) {
        try {
          const body = JSON.stringify({ userId, from, to });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/shopify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'shopify', status: 'success', inserted: data.inserted || 0 });
        } catch (err: any) {
          results.push({ userId, platform: 'shopify', status: 'error', error: err.message });
        }
      }
      
      // GA4 (bugünün verisini çek - GA4 realtime veri sağlıyor)
      const gaConn = platforms.google_analytics || platforms.analytics;
      if (gaConn?.isConnected && gaConn?.refreshToken) {
        try {
          // GA4 için bugünü çek (Türkiye timezone)
          const body = JSON.stringify({ userId, from: today, to: today });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/ga4`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'ga4', status: 'success', inserted: data.inserted || 0 });
        } catch (err: any) {
          results.push({ userId, platform: 'ga4', status: 'error', error: err.message });
        }
      }
    }
    
    return res.json({ 
      success: true,
      type: 'realtime',
      message: 'Realtime sync completed', 
      timestamp: now.toISOString(),
      totalJobs: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results 
    });
  } catch (e: any) {
    return res.status(500).json({ message: 'Realtime sync failed', error: e.message });
  }
});

// ===== Daily Close (Her gün 23:59'da, günü kesin kapatır) =====
router.post('/api/cron/daily-close', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  
  try {
    const allConnsSnap = await admin.database().ref('platformConnections').once('value');
    const allConns = allConnsSnap.val() || {};
    
    const results: Array<{ userId: string; platform: string; status: string; inserted?: number; error?: string }> = [];
    // Türkiye timezone'unda bugünü hesapla (UTC+3)
    const now = new Date();
    const turkeyOffset = 3 * 60 * 60 * 1000;
    const turkeyNow = new Date(now.getTime() + turkeyOffset);
    const fmt = (d: Date) => {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const today = fmt(turkeyNow);
    
    for (const [userId, userConns] of Object.entries(allConns)) {
      const platforms = userConns as Record<string, any>;
      
      const from = today;
      const to = today;
      
      // Meta Ads - Günün kesin kapanışı
      if (platforms.meta_ads?.isConnected && platforms.meta_ads?.accessToken) {
        try {
          const body = JSON.stringify({ userId, from, to });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/meta-ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'meta_ads', status: 'success', inserted: data.inserted || 0 });
          
          // Günün kapandığını işaretle
          await admin.database().ref(`platformConnections/${userId}/meta_ads`).update({
            lastDayClose: today,
            lastSyncAt: new Date().toISOString(),
          });
        } catch (err: any) {
          results.push({ userId, platform: 'meta_ads', status: 'error', error: err.message });
        }
      }
      
      // Google Ads
      if (platforms.google_ads?.isConnected && platforms.google_ads?.refreshToken) {
        try {
          const body = JSON.stringify({ userId, from, to });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/google-ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'google_ads', status: 'success', inserted: data.inserted || 0 });
          
          await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
            lastDayClose: today,
            lastSyncAt: new Date().toISOString(),
          });
        } catch (err: any) {
          results.push({ userId, platform: 'google_ads', status: 'error', error: err.message });
        }
      }
      
      // Shopify
      if (platforms.shopify?.isConnected && platforms.shopify?.accessToken) {
        try {
          const body = JSON.stringify({ userId, from, to });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/shopify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'shopify', status: 'success', inserted: data.inserted || 0 });
          
          await admin.database().ref(`platformConnections/${userId}/shopify`).update({
            lastDayClose: today,
            lastSyncAt: new Date().toISOString(),
          });
        } catch (err: any) {
          results.push({ userId, platform: 'shopify', status: 'error', error: err.message });
        }
      }
      
      // GA4 (dünün verisini çek çünkü GA4 UTC timezone kullanıyor ve processing delay var)
      const gaConn = platforms.google_analytics || platforms.analytics;
      if (gaConn?.isConnected && gaConn?.refreshToken) {
        try {
          // GA4 için bugünü çek (Türkiye timezone)
          const body = JSON.stringify({ userId, from: today, to: today });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/ga4`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'ga4', status: 'success', inserted: data.inserted || 0 });
          
          const gaKey = platforms.google_analytics ? 'google_analytics' : 'analytics';
          await admin.database().ref(`platformConnections/${userId}/${gaKey}`).update({
            lastDayClose: today,
            lastSyncAt: new Date().toISOString(),
          });
        } catch (err: any) {
          results.push({ userId, platform: 'ga4', status: 'error', error: err.message });
        }
      }
    }
    
    return res.json({ 
      success: true,
      type: 'daily_close',
      message: 'Daily close completed - all days finalized', 
      timestamp: new Date().toISOString(),
      closedDate: today,
      totalJobs: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results 
    });
  } catch (e: any) {
    return res.status(500).json({ message: 'Daily close failed', error: e.message });
  }
});

// ===== Legacy Daily Sync (Eski sistem, şimdilik kalsın) =====
router.post('/api/cron/daily-sync', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  
  try {
    const allConnsSnap = await admin.database().ref('platformConnections').once('value');
    const allConns = allConnsSnap.val() || {};
    
    const results: Array<{ userId: string; platform: string; status: string; inserted?: number; error?: string }> = [];
    // Türkiye timezone'unda tarih hesapla (UTC+3)
    const now = new Date();
    const turkeyOffset = 3 * 60 * 60 * 1000;
    const turkeyNow = new Date(now.getTime() + turkeyOffset);
    const fmt = (d: Date) => {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const today = fmt(turkeyNow);
    const yesterdayDate = new Date(turkeyNow.getTime() - 24 * 60 * 60 * 1000);
    const yesterday = fmt(yesterdayDate);
    
    for (const [userId, userConns] of Object.entries(allConns)) {
      const platforms = userConns as Record<string, any>;
      
      // Kullanıcının retention ayarını oku (varsayılan 90 gün)
      const settingsSnap = await admin.database().ref(`settings/${userId}`).once('value');
      const settings = settingsSnap.val() || {};
      const retentionDays = Number(settings.retentionDays || 90);
      const syncStartDate = new Date(turkeyNow.getTime() - retentionDays * 24 * 60 * 60 * 1000);
      const syncStart = fmt(syncStartDate);
      
      // Meta Ads
      if (platforms.meta_ads?.isConnected && platforms.meta_ads?.accessToken) {
        try {
          const body = JSON.stringify({ userId, from: syncStart, to: yesterday });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/meta-ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'meta_ads', status: 'success', inserted: data.inserted || 0 });
        } catch (err: any) {
          results.push({ userId, platform: 'meta_ads', status: 'error', error: err.message });
        }
      }
      
      // Google Ads
      if (platforms.google_ads?.isConnected && platforms.google_ads?.refreshToken) {
        try {
          const body = JSON.stringify({ userId, from: syncStart, to: yesterday });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/google-ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'google_ads', status: 'success', inserted: data.inserted || 0 });
        } catch (err: any) {
          results.push({ userId, platform: 'google_ads', status: 'error', error: err.message });
        }
      }
      
      // Shopify
      if (platforms.shopify?.isConnected && platforms.shopify?.accessToken) {
        try {
          const body = JSON.stringify({ userId, from: syncStart, to: yesterday });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/shopify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'shopify', status: 'success', inserted: data.inserted || 0 });
        } catch (err: any) {
          results.push({ userId, platform: 'shopify', status: 'error', error: err.message });
        }
      }
      
      // GA4
      const gaConn = platforms.google_analytics || platforms.analytics;
      if (gaConn?.isConnected && gaConn?.refreshToken) {
        try {
          const body = JSON.stringify({ userId, from: syncStart, to: yesterday });
          const ingestRes = await fetchWithTimeout(`${buildApiBase(req)}/api/ingest/ga4`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': process.env.ADMIN_API_KEY || '' },
            body
          }, 30000);
          const data = await ingestRes.json();
          results.push({ userId, platform: 'ga4', status: 'success', inserted: data.inserted || 0 });
        } catch (err: any) {
          results.push({ userId, platform: 'ga4', status: 'error', error: err.message });
        }
      }
    }
    
    return res.json({ 
      message: 'Daily sync completed', 
      timestamp: new Date().toISOString(),
      totalJobs: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results 
    });
  } catch (e: any) {
    return res.status(500).json({ message: 'Daily sync failed', error: e.message });
  }
});

// ===== DEBUG: Check GA4 duplicates =====
router.get('/api/debug/ga4-duplicates', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const bq = getBigQuery();
    const dataset = process.env.BQ_DATASET || 'iqsion';

    // Check for duplicates (same date, same propertyId)
    const duplicateQuery = `
      SELECT 
        date,
        propertyId,
        COUNT(*) as row_count
      FROM \`${bq.projectId}.${dataset}.ga4_daily\`
      WHERE userId = @userId
      GROUP BY date, propertyId
      HAVING COUNT(*) > 1
      ORDER BY date DESC
      LIMIT 50
    `;

    const [duplicates] = await bq.query({
      query: duplicateQuery,
      params: { userId },
      location: process.env.BQ_LOCATION || 'US',
    });

    // Get overall stats
    const statsQuery = `
      SELECT 
        propertyId,
        COUNT(*) as total_rows,
        COUNT(DISTINCT date) as unique_dates,
        MIN(date) as first_date,
        MAX(date) as last_date
      FROM \`${bq.projectId}.${dataset}.ga4_daily\`
      WHERE userId = @userId
      GROUP BY propertyId
      ORDER BY total_rows DESC
    `;

    const [stats] = await bq.query({
      query: statsQuery,
      params: { userId },
      location: process.env.BQ_LOCATION || 'US',
    });

    return res.json({
      userId,
      stats,
      duplicates,
      hasDuplicates: duplicates.length > 0,
      duplicateCount: duplicates.length,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'error' });
  }
});

// ===== AI INSIGHTS: Anomaly Detection & Recommendations =====

import { InsightsService, ANOMALY_CONFIG } from './services/insightsService';

// Helper: Detect anomalies from BigQuery data
async function detectAnomalies(userId: string): Promise<any[]> {
  const bq = getBigQuery();
  const insightsService = new InsightsService(bq);
  return await insightsService.detectAnomalies(userId);
}

// Endpoint: Get insights configuration
router.get('/api/insights/config', async (req, res) => {
  try {
    const config = Object.entries(ANOMALY_CONFIG).map(([type, settings]) => ({
      type,
      ...settings,
      description: InsightsService.getConfigDescription(type as any),
    }));

    return res.json({ config });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'error' });
  }
});

// Endpoint: Detect anomalies (test endpoint)
router.post('/api/insights/detect-anomalies', async (req, res) => {
  // Temporarily disabled for testing
  // if (!requireAdmin(req, res)) return;
  
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const anomalies = await detectAnomalies(userId);

    return res.json({
      userId,
      anomaliesFound: anomalies.length,
      anomalies,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'error' });
  }
});

// Helper: Analyze anomalies with AI (minimal tokens)
async function analyzeAnomaliesWithAI(anomalies: any[]): Promise<any[]> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || anomalies.length === 0) return [];

  const insights: any[] = [];

  // Process max 5 anomalies to save cost
  const topAnomalies = anomalies.slice(0, 5);

  for (const anomaly of topAnomalies) {
    try {
      // Kategorileri belirle
      const getCategory = (type: string) => {
        if (['cost_spike', 'cpc_spike'].includes(type)) return 'anomali';
        if (['ctr_drop', 'cvr_drop', 'impression_drop'].includes(type)) return 'anomali';
        if (['low_roas', 'zero_conversions'].includes(type)) return 'optimizasyon';
        return 'içgörü';
      };

      // Create concise prompt (minimal tokens)
      let prompt = '';
      
      if (anomaly.type === 'cost_spike') {
        prompt = `E-ticaret reklam analizi:
Platform: ${anomaly.source}
Durum: Harcama %${anomaly.changePct} arttı (Önceki: $${anomaly.previousCost}, Şimdi: $${anomaly.currentCost})

Kısa ve net yanıt ver:
- Başlık: (max 8 kelime, yalın dil)
- Aksiyon: (tek cümle, ne yapmalı)`;
      } else if (anomaly.type === 'ctr_drop') {
        prompt = `E-ticaret reklam analizi:
Platform: ${anomaly.source}
Durum: CTR %${Math.abs(anomaly.changePct)} düştü (Önceki: %${anomaly.previousCtr.toFixed(2)}, Şimdi: %${anomaly.currentCtr.toFixed(2)})

Kısa ve net yanıt ver:
- Başlık: (max 8 kelime, yalın dil)
- Aksiyon: (tek cümle, ne yapmalı)`;
      } else if (anomaly.type === 'low_roas') {
        prompt = `E-ticaret reklam analizi:
Platform: ${anomaly.source}
Durum: Düşük ROAS (${anomaly.roas}x, Harcama: $${anomaly.cost}, Gelir: $${anomaly.revenue})

Kısa ve net yanıt ver:
- Başlık: (max 8 kelime, yalın dil)
- Aksiyon: (tek cümle, ne yapmalı)`;
      } else if (anomaly.type === 'zero_conversions') {
        prompt = `E-ticaret reklam analizi:
Platform: ${anomaly.source}
Durum: Harcama var ama satış yok (Harcama: $${anomaly.cost}, Tıklama: ${anomaly.clicks})

Kısa ve net yanıt ver:
- Başlık: (max 8 kelime, yalın dil)
- Aksiyon: (tek cümle, ne yapmalı)`;
      } else if (anomaly.type === 'cpc_spike') {
        prompt = `E-ticaret reklam analizi:
Platform: ${anomaly.source}
Durum: CPC %${anomaly.changePct} arttı (Önceki: $${anomaly.previousCpc.toFixed(2)}, Şimdi: $${anomaly.currentCpc.toFixed(2)})

Kısa ve net yanıt ver:
- Başlık: (max 8 kelime, yalın dil)
- Aksiyon: (tek cümle, ne yapmalı)`;
      } else if (anomaly.type === 'impression_drop') {
        prompt = `E-ticaret reklam analizi:
Platform: ${anomaly.source}
Durum: Gösterim %${Math.abs(anomaly.changePct)} düştü (Önceki: ${anomaly.previousImpressions.toLocaleString()}, Şimdi: ${anomaly.currentImpressions.toLocaleString()})

Kısa ve net yanıt ver:
- Başlık: (max 8 kelime, yalın dil)
- Aksiyon: (tek cümle, ne yapmalı)`;
      } else {
        continue; // Skip unknown types
      }

      // Call Gemini with minimal config (flash model = cheapest)
      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          maxOutputTokens: 200, // Keep it short
        },
      };

      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${encodeURIComponent(apiKey)}`;
      const r = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }, 10000);

      const j = await r.json() as any;
      if (!r.ok) {
        console.error('[AI INSIGHTS] Gemini error:', r.status, j);
        continue;
      }

      const candidate = j?.candidates?.[0];
      const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
      const aiText = parts.map((p: any) => p?.text || '').join('\n').trim();

      console.log('[AI INSIGHTS] Gemini raw response:', aiText);

      if (!aiText) {
        console.log('[AI INSIGHTS] No text in Gemini response');
        continue;
      }

      // Parse AI response (expecting "Başlık: ...\nAksiyon: ...")
      const lines = aiText.split('\n').filter((l: string) => l.trim());
      let title = 'Dikkat Gerekli';
      let action = 'Kampanyaları gözden geçir';
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Remove ** markdown formatting
        const cleaned = trimmed.replace(/\*\*/g, '');
        
        if (cleaned.match(/^-?\s*başlık:/i)) {
          title = cleaned.replace(/^-?\s*başlık:\s*/i, '').trim();
        } else if (cleaned.match(/^-?\s*aksiyon:/i)) {
          action = cleaned.replace(/^-?\s*aksiyon:\s*/i, '').trim();
        }
      }

      console.log('[AI INSIGHTS] Parsed - title:', title, ', action:', action);

      // Get category based on anomaly type
      const category = getCategory(anomaly.type);

      insights.push({
        id: `ins_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: anomaly.type,
        category,
        priority: anomaly.priority,
        title,
        action,
        source: anomaly.source,
        data: anomaly,
        generatedAt: Date.now(),
      });

    } catch (err) {
      console.error('[AI INSIGHTS] Error processing anomaly:', err);
      continue;
    }
  }

  return insights;
}

// Endpoint: Generate insights with AI
router.post('/api/insights/generate', async (req, res) => {
  // Temporarily disabled for testing
  // if (!requireAdmin(req, res)) return;
  
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // 1. Detect anomalies
    const anomalies = await detectAnomalies(userId);

    if (anomalies.length === 0) {
      return res.json({
        userId,
        anomaliesDetected: 0,
        insights: [],
        message: 'No anomalies detected - all metrics look good!',
      });
    }

    // 2. Analyze with AI (only top 5 to save cost)
    const insights = await analyzeAnomaliesWithAI(anomalies);

    // 3. Save to Firebase
    if (insights.length > 0) {
      await admin.database().ref(`insights/${userId}`).set({
        insights,
        generatedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    return res.json({
      userId,
      anomaliesDetected: anomalies.length,
      insightsGenerated: insights.length,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'error' });
  }
});

// GET endpoint to fetch insights
router.get('/api/insights', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId required' });
    }

    // Fetch from Firebase
    const snapshot = await admin.database().ref(`insights/${userId}`).once('value');
    const data = snapshot.val();

    if (!data) {
      return res.json({
        userId,
        insights: [],
        generatedAt: 0,
        expiresAt: 0,
      });
    }

    // Auto-cleanup: Remove insights older than 7 days
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (data.insights && data.insights.length > 0) {
      const activeInsights = data.insights.filter((ins: any) => {
        const age = now - ins.generatedAt;
        return age < SEVEN_DAYS_MS;
      });

      // If any insights were removed, update Firebase
      if (activeInsights.length !== data.insights.length) {
        await admin.database().ref(`insights/${userId}`).update({
          insights: activeInsights,
          generatedAt: data.generatedAt,
          expiresAt: data.expiresAt
        });
        data.insights = activeInsights;
      }
    }

    // Check if expired
    if (data.expiresAt && data.expiresAt < now) {
      // Insights expired, trigger regeneration in background (no wait)
      detectAnomalies(userId)
        .then(async anomalies => {
          if (anomalies.length > 0) {
            const insights = await analyzeAnomaliesWithAI(anomalies);
            await admin.database().ref(`insights/${userId}`).set({
              insights,
              generatedAt: Date.now(),
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            });
          }
        })
        .catch(err => console.error('Background insight generation failed:', err));

      return res.json({
        userId,
        insights: [],
        generatedAt: 0,
        expiresAt: 0,
      });
    }

    return res.json({
      userId,
      insights: data.insights || [],
      generatedAt: data.generatedAt || 0,
      expiresAt: data.expiresAt || 0,
    });
  } catch (e: any) {
    console.error('Error fetching insights:', e);
    return res.status(500).json({ error: e?.message || 'error' });
  }
});

// Resolve (mark as completed) an insight
router.post('/api/insights/resolve', async (req, res) => {
  try {
    const { userId, insightId } = req.body;
    if (!userId || !insightId) {
      return res.status(400).json({ error: 'userId and insightId required' });
    }

    // Fetch current insights
    const snapshot = await admin.database().ref(`insights/${userId}`).once('value');
    const data = snapshot.val();

    if (!data || !data.insights) {
      return res.status(404).json({ error: 'No insights found' });
    }

    // Remove the resolved insight
    const updatedInsights = data.insights.filter((ins: any) => ins.id !== insightId);

    // Save resolved insight to history
    const resolvedInsight = data.insights.find((ins: any) => ins.id === insightId);
    if (resolvedInsight) {
      const historyRef = admin.database().ref(`insights/${userId}/history`);
      await historyRef.push({
        ...resolvedInsight,
        resolvedAt: Date.now(),
        status: 'resolved'
      });
    }

    // Update active insights
    await admin.database().ref(`insights/${userId}`).update({
      insights: updatedInsights,
      generatedAt: data.generatedAt,
      expiresAt: data.expiresAt
    });

    return res.json({
      success: true,
      message: 'Insight marked as resolved',
      remainingInsights: updatedInsights.length
    });
  } catch (e: any) {
    console.error('Error resolving insight:', e);
    return res.status(500).json({ error: e?.message || 'error' });
  }
});

// Daily Cron Job: Auto-generate insights for all active users
router.get('/api/cron/daily-insights', async (req, res) => {
  // Verify this is from Cloud Scheduler (optional but recommended)
  const cronHeader = req.get('X-Cloudscheduler');
  if (!cronHeader && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Forbidden - Not from Cloud Scheduler' });
  }

  try {
    console.log('[CRON] Starting daily insights generation...');
    
    // Get all users from Firebase
    const usersSnapshot = await admin.database().ref('platformConnections').once('value');
    const usersData = usersSnapshot.val() || {};
    const userIds = Object.keys(usersData);
    
    console.log(`[CRON] Found ${userIds.length} users to process`);
    
    let processed = 0;
    let failed = 0;
    
    for (const userId of userIds) {
      try {
        // Check if user has any connected platforms
        const userPlatforms = usersData[userId];
        const hasConnections = Object.values(userPlatforms || {}).some(
          (platform: any) => platform?.isConnected === true
        );
        
        if (!hasConnections) {
          console.log(`[CRON] Skipping ${userId} - no active connections`);
          continue;
        }
        
        // Detect anomalies
        const anomalies = await detectAnomalies(userId);
        
        if (anomalies.length === 0) {
          console.log(`[CRON] No anomalies for ${userId}`);
          processed++;
          continue;
        }
        
        console.log(`[CRON] Detected ${anomalies.length} anomalies for ${userId}`);
        
        // Analyze with AI (top 5 only to save cost)
        const insights = await analyzeAnomaliesWithAI(anomalies);
        
        if (insights.length > 0) {
          // Save to Firebase
          await admin.database().ref(`insights/${userId}`).set({
            insights,
            generatedAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          });
          
          console.log(`[CRON] Generated ${insights.length} insights for ${userId}`);
        }
        
        processed++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`[CRON] Failed for user ${userId}:`, error);
        failed++;
      }
    }
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalUsers: userIds.length,
      processed,
      failed,
      message: `Daily insights generation completed`,
    };
    
    console.log('[CRON] Summary:', summary);
    
    return res.json(summary);
    
  } catch (e: any) {
    console.error('[CRON] Daily insights job failed:', e);
    return res.status(500).json({ error: e?.message || 'error' });
  }
});

export default router;

