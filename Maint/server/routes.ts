
import express from "express";
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
  const scopes = 'read_orders,read_products,read_customers';
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
    // Tokenı ve mağaza adresini veritabanına kaydet
    await admin.database().ref(`platformConnections/${state}/shopify`).set({
      storeUrl: shop,
      accessToken,
      isConnected: true,
      createdAt: Date.now(),
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
    // Shopify ürünlerini çek
    const response = await axios.get(`https://${storeUrl}/admin/api/2023-04/products.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    const products = response.data.products || [];
    // Firebase'den maliyetleri çek
    const costsSnap = await admin.database().ref(`shopifyProductCosts/${userId}`).once('value');
    const costs = costsSnap.val() || {};
    // Her ürüne cost ekle
    const productsWithCost = products.map((p: any) => ({
      ...p,
      cost: costs[p.id] || ""
    }));
    res.json({ products: productsWithCost });
  } catch (error) {
    res.status(500).json({ error: 'Shopify ürünleri alınamadı', details: error instanceof Error ? error.message : String(error) });
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
    const response = await axios.get(`https://${storeUrl}/admin/api/2023-04/orders.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Shopify siparişleri alınamadı', details: error instanceof Error ? error.message : String(error) });
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
    const response = await axios.get(`https://${storeUrl}/admin/api/2023-04/customers.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Shopify müşterileri alınamadı', details: error instanceof Error ? error.message : String(error) });
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
          Authorization: `Bearer ${accessToken}`,
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
    const response = await axios.get(`https://${storeUrl}/admin/api/2023-07/orders.json?status=any&limit=5`, {
      headers: {
        'X-Shopify-Access-Token': shopifyConn.accessToken,
        'Content-Type': 'application/json',
      }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: 'Shopify canlı veri alınamadı', details: error instanceof Error ? error.message : String(error) });
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
      return res.status(502).json({ message: 'Google Ads sorgusu başarısız', details: e?.message || String(e) });
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
        await admin.database().ref(`platformConnections/${userId}/shopify`).set({ storeUrl });
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
  const propertyId = req.query.propertyId || 'YOUR_GA4_PROPERTY_ID';
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
