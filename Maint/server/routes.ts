
import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import admin from "./firebase";
import axios from "axios";
import { GoogleAdsApi } from 'google-ads-api';
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
    const primary = await callModel('gemini-1.5-flash-001');
    if (primary.ok && primary.text) {
      if (isDebug) {
        const dbg = { model: 'gemini-1.5-flash', finishReason: (primary as any)?.raw?.candidates?.[0]?.finishReason || null };
        return res.json({ response: primary.text, _debug: dbg });
      }
      return res.json({ response: primary.text });
    }
    // If blocked or empty, try a more capable model
  const secondary = await callModel('gemini-1.5-pro-001');
    if (secondary.ok && secondary.text) {
      if (isDebug) {
        const dbg = { model: 'gemini-1.5-pro', finishReason: (secondary as any)?.raw?.candidates?.[0]?.finishReason || null };
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
          fetchWithTimeout(`${baseUrl}/api/meta/summary?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
          fetchWithTimeout(`${baseUrl}/api/googleads/summary?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
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
  try {
    // Firebase ile kullanıcıyı bul
    const user = await admin.auth().getUserByEmail(email);
    // Şifre kontrolü için Firebase Auth REST API kullanılmalı
    // Test ortamı için basit kontrol: şifreyi veritabanında saklıyorsanız karşılaştırabilirsiniz
    const userDataSnap = await admin.database().ref(`users/${user.uid}`).once('value');
    const userData = userDataSnap.val();
    if (!userData || userData.password !== password) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
    }
    return res.json({ message: 'Giriş başarılı', uid: user.uid });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return res.status(401).json({ message: 'Giriş başarısız', error: error instanceof Error ? error.message : String(error) });
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
  const computedRedirect = `${req.protocol}://${normalizedHost}/api/auth/shopify/callback`;
  const redirectEnv = process.env.SHOPIFY_REDIRECT_URI || '';
  const redirectUri = /localhost:5000|127\.0\.0\.1:5000/.test(redirectEnv) ? computedRedirect : (redirectEnv || computedRedirect);
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
  const authUrl = `https://${storeUrl}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(userId)}`;
  res.redirect(authUrl);
});

// Shopify OAuth callback endpointi
router.get('/api/auth/shopify/callback', async (req, res) => {
  const { code, hmac, shop, state } = req.query;
  if (!code || !shop) return res.status(400).send('Eksik parametre');
  try {
    // Access token al
    const tokenRes = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
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
    // Kullanıcıyı ayarlar sayfasına yönlendir
    res.send('<script>window.location.replace("http://localhost:5173/settings?connection=success&platform=shopify")</script>');
  } catch (err) {
    res.send('<script>window.location.replace("http://localhost:5173/settings?connection=error&platform=shopify")</script>');
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
        fetchWithTimeout(`${baseUrl}/api/meta/summary?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
        fetchWithTimeout(`${baseUrl}/api/googleads/summary?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
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
        fetchWithTimeout(`${baseUrl}/api/meta/summary?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
        fetchWithTimeout(`${baseUrl}/api/googleads/summary?${qs}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } }, 15000),
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

    // Proactive token refresh if expired (access token lifetime ~1h). We refresh if > (expiresIn-60s)
    try {
      if (refreshToken && googleAdsConn.expiresIn && googleAdsConn.createdAt) {
        const ageMs = Date.now() - Number(googleAdsConn.createdAt);
        const ttlMs = (Number(googleAdsConn.expiresIn) - 60) * 1000; // refresh 60s early
        if (ageMs > ttlMs) {
          const params = new URLSearchParams();
          params.append('client_id', process.env.GOOGLE_ADS_CLIENT_ID || '');
          params.append('client_secret', process.env.GOOGLE_ADS_CLIENT_SECRET || '');
          params.append('refresh_token', refreshToken);
          params.append('grant_type', 'refresh_token');
          const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
          const tokenJson = await tokenResp.json();
          if (tokenResp.ok && tokenJson.access_token) {
            await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
              accessToken: tokenJson.access_token,
              expiresIn: tokenJson.expires_in,
              updatedAt: new Date().toISOString(),
              createdAt: Date.now(),
            });
            console.log('[GoogleAds REFRESH] access token yenilendi (accounts endpoint).');
          } else {
            console.warn('[GoogleAds REFRESH] refresh başarısız:', tokenJson);
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

    // 1) If MCC (loginCustomerId) is provided, prefer GAQL to fetch sub-accounts with names
    if (loginCustomerId && refreshToken) {
      try {
        const anyClient: any = client as any;
        const customer = anyClient.Customer ? anyClient.Customer({ customer_id: loginCustomerId, refresh_token: refreshToken, login_customer_id: loginCustomerId }) : null;
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

    // If nothing accessible, return empty array (UI will allow manual entry)
    if (!resourceNames.length) return res.json({ accounts: [] });

    // Enrich with names via GAQL (best-effort)
    const ids = resourceNames.map((n) => String(n).split('/')[1]).filter(Boolean);
    const accounts: Array<{ id: string; displayName: string }> = [];
    for (const id of ids) {
      let displayName = id;
      try {
        if (refreshToken) {
          const anyClient: any = client as any;
          const self = anyClient.Customer ? anyClient.Customer({ customer_id: id, refresh_token: refreshToken, login_customer_id: loginCustomerId || undefined }) : null;
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
    // Proactive refresh before GAQL if needed
    try {
      if (gaConn?.refreshToken && gaConn?.expiresIn && gaConn?.createdAt) {
        const ageMs = Date.now() - Number(gaConn.createdAt);
        const ttlMs = (Number(gaConn.expiresIn) - 60) * 1000;
        if (ageMs > ttlMs) {
          const params = new URLSearchParams();
          params.append('client_id', process.env.GOOGLE_ADS_CLIENT_ID || '');
          params.append('client_secret', process.env.GOOGLE_ADS_CLIENT_SECRET || '');
          params.append('refresh_token', gaConn.refreshToken);
          params.append('grant_type', 'refresh_token');
          const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString()
          });
          const tokenJson = await tokenResp.json();
          if (tokenResp.ok && tokenJson.access_token) {
            await admin.database().ref(`platformConnections/${userId}/google_ads`).update({
              accessToken: tokenJson.access_token,
              expiresIn: tokenJson.expires_in,
              updatedAt: new Date().toISOString(),
              createdAt: Date.now(),
            });
            gaConn.accessToken = tokenJson.access_token;
            console.log('[GoogleAds REFRESH] access token yenilendi (summary endpoint).');
          } else {
            console.warn('[GoogleAds REFRESH] refresh başarısız:', tokenJson);
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
      const msg = e?.message ? String(e.message) : String(e);
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
      return res.status(502).json({ message: 'Google Ads sorgusu başarısız', details: msg });
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

// Google Ads OAuth bağlantı endpointi
router.get('/api/auth/googleads/connect', async (req: express.Request, res: express.Response) => {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  // Normalize host and compute redirect dynamically to avoid port mismatches (e.g., 5000 vs 5001)
  const rawHost = req.get('host') || 'localhost:5001';
  const normalizedHost = rawHost.replace('127.0.0.1', 'localhost');
  const computedRedirect = `${req.protocol}://${normalizedHost}/api/auth/googleads/callback`;
  const redirectEnv = process.env.GOOGLE_ADS_REDIRECT_URI;
  const redirectUri = (redirectEnv && /localhost:5000|127\.0\.0\.1:5000/.test(redirectEnv)) ? computedRedirect : (redirectEnv || computedRedirect);
  const scope = 'https://www.googleapis.com/auth/adwords';
  const uid = typeof req.query.userId === 'string' ? req.query.userId : '';
  const stateRaw = uid ? `uid:${uid}|${Math.random().toString(36).slice(2)}` : Math.random().toString(36).slice(2);
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${encodeURIComponent(stateRaw)}`;
  console.log('[GOOGLE ADS CONNECT] redirectUri=', redirectUri, 'state=', stateRaw);
  res.redirect(authUrl);
});

// Google Ads OAuth callback endpointi
router.get('/api/auth/googleads/callback', async (req: express.Request, res: express.Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const stateParam = typeof req.query.state === 'string' ? req.query.state : '';
  if (!code) return res.status(400).send('Google OAuth kodu eksik.');
  try {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    // Use same normalization logic as in connect
    const rawHost = req.get('host') || 'localhost:5001';
    const normalizedHost = rawHost.replace('127.0.0.1', 'localhost');
    const computedRedirect = `${req.protocol}://${normalizedHost}/api/auth/googleads/callback`;
    const redirectEnv = process.env.GOOGLE_ADS_REDIRECT_URI;
    const redirectUri = (redirectEnv && /localhost:5000|127\.0\.0\.1:5000/.test(redirectEnv)) ? computedRedirect : (redirectEnv || computedRedirect);
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
    if (!tokenData.access_token) throw new Error('Token alınamadı');
    // userId: state içinden oku, yoksa query fallback
    let stateUserId: string | null = null;
    if (stateParam) {
      try {
        const decoded = decodeURIComponent(stateParam);
        if (decoded.startsWith('uid:')) stateUserId = decoded.split('|')[0].replace('uid:', '');
      } catch (_) {}
    }
    const userId = (stateUserId || (typeof req.query.userId === 'string' ? req.query.userId : null)) || 'test-user';
    await admin.database().ref(`platformConnections/${userId}/google_ads`).set({
  accessToken: tokenData.access_token,
  refreshToken: tokenData.refresh_token,
  expiresIn: tokenData.expires_in,
  createdAt: Date.now(),
  isConnected: true,
    });
  res.send('<script>window.location.replace("http://localhost:5173/settings?connection=success&platform=google_ads")</script>');
  } catch (err) {
    res.status(500).send('Google Ads token alma hatası: ' + err);
  }
});

// Google Ads bağlantısını temizleyen (disconnect) endpoint
router.post('/api/googleads/disconnect', async (req, res) => {
  try {
    const userId = (req.body.userId as string) || 'test-user';
    await admin.database().ref(`platformConnections/${userId}/google_ads`).remove();
    return res.json({ message: 'Google Ads bağlantısı silindi.' });
  } catch (e) {
    return res.status(500).json({ message: 'Google Ads bağlantısı silinemedi', error: String(e) });
  }
});

// ...existing code...
  // Reklam hesabı seçimini güncelleyen endpoint
  router.post('/api/connections', async (req, res) => {
    try {
      const userId = req.body.userId || 'test-user';
      const platform = req.body.platform;
      // Shopify mağaza adresi kaydetme
      if (platform === 'shopify') {
        const storeUrl = req.body.storeUrl;
        if (!storeUrl) {
          return res.status(400).json({ message: 'Shopify mağaza adresi eksik.' });
        }
        // update kullan: accessToken/isConnected gibi alanları silme
        await admin.database().ref(`platformConnections/${userId}/shopify`).update({ storeUrl, updatedAt: new Date().toISOString() });
        return res.json({ message: 'Shopify mağaza adresi kaydedildi.', storeUrl });
      }
      // Meta reklam hesabı güncelleme
      if (platform === 'meta_ads') {
        const accountId = req.body.accountId;
        if (!accountId) {
          return res.status(400).json({ message: 'Reklam hesabı ID eksik.' });
        }
        await admin.database().ref(`platformConnections/${userId}/meta_ads/accountId`).set(accountId);
        return res.json({ message: 'Reklam hesabı güncellendi.', accountId });
      }
      // Google Analytics propertyId güncelleme
      if (platform === 'google_analytics') {
        const propertyId = req.body.propertyId;
        if (!propertyId) {
          return res.status(400).json({ message: 'Property ID eksik.' });
        }
        await admin.database().ref(`platformConnections/${userId}/google_analytics/propertyId`).set(propertyId);
        return res.json({ message: 'Google Analytics property ID güncellendi.', propertyId });
      }
      // Google Ads reklam hesabı güncelleme
      if (platform === 'google_ads') {
        const accountId = req.body.accountId;
        const loginCustomerId = req.body.loginCustomerId;
        if (loginCustomerId) {
          await admin.database().ref(`platformConnections/${userId}/google_ads/loginCustomerId`).set(loginCustomerId);
        }
        if (accountId) {
          await admin.database().ref(`platformConnections/${userId}/google_ads/accountId`).set(accountId);
        }
        return res.json({ message: 'Google Ads bağlantısı güncellendi.', accountId, loginCustomerId });
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
  // Meta bağlantısını kaldırma endpointi
  router.post('/api/disconnect', async (req, res) => {
    try {
      const userId = req.query.userId || req.body.userId || 'test-user';
      const platform = req.query.platform || req.body.platform;
      if (!platform) {
        return res.status(400).json({ message: 'Platform belirtilmedi.' });
      }
      await admin.database().ref(`platformConnections/${userId}/${platform}`).remove();
      res.json({ message: `${platform} bağlantısı kaldırıldı.` });
    } catch (error) {
      res.status(500).json({ message: 'Bağlantı kaldırılamadı', error });
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
      // Varsayılan metrikler: spend, impressions, reach, clicks
      const defaultFields = 'spend,impressions,reach,clicks,campaign_name';
      const fields = req.query.fields || defaultFields;
      // Tarih filtresi: date_preset (last_7d, last_30d) veya time_range (start/end)
  // Varsayılan olarak son 7 gün
  let datePreset = '';
  let timeRange = '';
  // Kesin tarih aralığı: son 7 gün
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const since = sevenDaysAgo.toISOString().slice(0, 10);
  const until = today.toISOString().slice(0, 10);
  timeRange = `&time_range={\"since\":\"${since}\",\"until\":\"${until}\"}`;
  // Eğer query'den tarih gelirse onu kullan
  if (req.query.start_date && req.query.end_date) {
    timeRange = `&time_range={\"since\":\"${req.query.start_date}\",\"until\":\"${req.query.end_date}\"}`;
  }
  const filtering = '&filtering=[{"field":"campaign.delivery_info","operator":"IN","value":["active"]}]';
  const url = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=${fields}${timeRange}${filtering}&level=ad&access_token=${accessToken}`;
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
      // Ads Manager ile hizalanması için: clicks=inline_link_clicks, CTR=CTR(all)
      const dayFields = ['spend','impressions','inline_link_clicks','ctr','inline_link_click_ctr'].join(',');
      const dailyUrl = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=${dayFields}&level=account&time_increment=1&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
      const dayResp = await fetchWithTimeout(dailyUrl, { method: 'GET' }, 20000);
      const dayJson = await dayResp.json();
      if (!dayResp.ok || dayJson.error) {
        return res.status(dayResp.status || 500).json({ message: 'Meta günlük veriler alınamadı', error: dayJson.error || dayJson });
      }

      const dayMap: Record<string, { spend: number; impressions: number; clicks: number; ctr: number; link_ctr: number; } > = {};
      for (const r of (dayJson.data || [])) {
        const d = r.date_start || '';
        if (!d) continue;
        dayMap[d] = {
          spend: Number(r.spend || 0),
          impressions: Number(r.impressions || 0),
          // clicks: use link clicks to match CPC column in Ads Manager
          clicks: Number(r.inline_link_clicks || 0),
          // ctr: keep CTR(all) from API to avoid rounding mismatch
          ctr: Number(r.ctr || 0),
          link_ctr: Number(r.inline_link_click_ctr || 0),
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
      const totalFields = ['spend','impressions','inline_link_clicks','ctr'].join(',');
      const totalUrl = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=${totalFields}&level=account&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
      const totResp = await fetchWithTimeout(totalUrl, { method: 'GET' }, 20000);
      const totJson = await totResp.json();
      if (!totResp.ok || totJson.error) {
        return res.status(totResp.status || 500).json({ message: 'Meta toplam veriler alınamadı', error: totJson.error || totJson });
      }
      const totalRow = (totJson.data || [])[0] || {};
      const tSpend = Number(totalRow.spend || 0);
      const tImpr = Number(totalRow.impressions || 0);
      const tLinkClicks = Number(totalRow.inline_link_clicks || 0);
      const tCtrAll = Number(totalRow.ctr || 0);
      const tCpc = tLinkClicks > 0 ? tSpend / tLinkClicks : 0;

      return res.json({
        rows,
        totals: { spend: tSpend, impressions: tImpr, clicks: tLinkClicks, ctr: tCtrAll, cpc: tCpc },
        requestedRange: { startDate: since, endDate: until }
      });
    } catch (error) {
      console.error('[Meta SUMMARY ERROR]', error);
      return res.status(500).json({ message: 'Meta özet verisi çekilemedi', error: String(error) });
    }
  });
  // Meta Reklam OAuth connect endpoint
  router.get('/api/auth/meta/connect', async (req, res) => {
    const clientId = process.env.META_APP_ID;
    const rawHost = req.get('host') || 'localhost:5001';
    const normalizedHost = rawHost.replace('127.0.0.1', 'localhost');
    const computedRedirect = `${req.protocol}://${normalizedHost}/api/auth/meta/callback`;
    // Eğer env'de yanlış bir port (örn. 5000) tanımlıysa yine de computed'ı tercih et
    const redirectEnv = process.env.META_REDIRECT_URI;
    const redirectUri = (redirectEnv && /localhost:5000|127\.0\.0\.1:5000/.test(redirectEnv)) ? computedRedirect : (redirectEnv || computedRedirect);
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
      return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=error&platform=meta_ads")</script>');
    }
    try {
      const rawHost = req.get('host') || 'localhost:5001';
      const normalizedHost = rawHost.replace('127.0.0.1', 'localhost');
      const computedRedirect = `${req.protocol}://${normalizedHost}/api/auth/meta/callback`;
      const redirectEnv = process.env.META_REDIRECT_URI;
      const redirectUri = (redirectEnv && /localhost:5000|127\.0\.0\.1:5000/.test(redirectEnv)) ? computedRedirect : (redirectEnv || computedRedirect);
      const params = new URLSearchParams();
      params.append('client_id', process.env.META_APP_ID!);
      params.append('client_secret', process.env.META_APP_SECRET!);
      params.append('redirect_uri', redirectUri);
      params.append('code', code);
      const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);
      const tokenData = await tokenRes.json();
      if (tokenData.error || !tokenData.access_token) {
        return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=error&platform=meta_ads")</script>');
      }
      // Short-lived token'ı long-lived ile değiştir
      let accessToken: string = tokenData.access_token;
      try {
        const exchangeUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
        exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
        exchangeUrl.searchParams.set('client_id', process.env.META_APP_ID || '');
        exchangeUrl.searchParams.set('client_secret', process.env.META_APP_SECRET || '');
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
      return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=success&platform=meta_ads")</script>');
    } catch (err) {
      return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=error&platform=meta_ads")</script>');
    }
  });
  // Kullanıcının bağlantı durumlarını döndüren endpoint
  router.get('/api/connections', async (req, res) => {
    try {
      const userId = req.query.userId || 'test-user';
      const snapshot = await admin.database().ref(`platformConnections/${userId}`).once('value');
      const connections = snapshot.val() || {};
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
      const redirectUri = (redirectEnv && /localhost:5000|127\.0\.0\.1:5000/.test(redirectEnv)) ? computedRedirect : (redirectEnv || computedRedirect);
      const uid = typeof req.query.userId === 'string' ? req.query.userId : '';
      const stateRaw = uid ? `uid:${uid}|${Math.random().toString(36).slice(2)}` : Math.random().toString(36).slice(2);
      const scope = [
        'ads.read',
        'ads.management',
        'report.data',
        'ad.account.read'
      ].join(',');
      const authUrl =
        `https://business-api.tiktok.com/open_api/v1.3/oauth2/authorize?` +
        `client_key=${encodeURIComponent(clientKey)}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${encodeURIComponent(stateRaw)}`;
      return res.redirect(authUrl);
    } catch (e) {
      return res.status(500).send('TikTok connect hatası: ' + (e as any)?.message || String(e));
    }
  });

  // --- TikTok Ads OAuth: Callback ---
  router.get('/api/auth/tiktok/callback', async (req, res) => {
    try {
      const code = String(req.query.code || '');
      const stateParam = String(req.query.state || '');
      if (!code) {
        return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=error&platform=tiktok")</script>');
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
        return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=error&platform=tiktok")</script>');
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
        return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=error&platform=tiktok")</script>');
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
      return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=success&platform=tiktok")</script>');
    } catch (e) {
      return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=error&platform=tiktok")</script>');
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

  // Google OAuth callback endpoint
  router.get('/api/auth/google/callback', async (req, res) => {
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
      return res.redirect('http://localhost:5173/settings?connection=error&platform=google_analytics');
    }
    try {
      const params = new URLSearchParams();
      params.append('code', code as string);
      params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
      params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
      const effectiveRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
      params.append('redirect_uri', effectiveRedirectUri);
      params.append('grant_type', 'authorization_code');
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) {
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
      return res.redirect('http://localhost:5173/settings?connection=success&platform=google_analytics');
    } catch (err) {
      return res.redirect('/settings?connection=error&platform=google_analytics');
    }
  });

  // Google Analytics OAuth connect endpoint
  router.get('/api/auth/google/connect', async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
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
    res.redirect(authUrl);
  });
export default router;

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
