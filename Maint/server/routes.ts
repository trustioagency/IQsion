
import express from "express";
import admin from "./firebase";
import axios from "axios";
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
  const storeUrl = req.query.storeUrl as string;
  const userId = req.query.userId as string || 'test-user';
  const scopes = 'read_orders,read_products,read_customers';
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI!;
  const authUrl = `https://${storeUrl}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${userId}`;
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
    const accessToken = googleAdsConn.accessToken;
    const apiUrl = 'https://googleads.googleapis.com/v14/customers:listAccessibleCustomers';
    let apiRes;
    try {
      apiRes = await fetch('https://googleads.googleapis.com/v14/customers:listAccessibleCustomers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
    } catch (apiErr) {
      return res.status(500).json({ message: 'Google Ads API bağlantı hatası', error: String(apiErr) });
    }
    const status = apiRes.status;
    const text = await apiRes.text();
    console.log('[GoogleAds DEBUG] API response status:', status);
    console.log('[GoogleAds DEBUG] API response body:', text);
    if (status !== 200) {
      return res.status(status).json({ message: 'Google Ads API hata', status, raw: text });
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ message: 'Google Ads API JSON parse hatası', error: String(e), raw: text });
    }
    const accounts = (data.resourceNames || []).map((name: string) => {
      const id = name.split('/')[1];
      return { id, name };
    });
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

// Google Ads OAuth bağlantı endpointi
router.get('/api/auth/googleads/connect', async (req: express.Request, res: express.Response) => {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_ADS_REDIRECT_URI;
  const scope = 'https://www.googleapis.com/auth/adwords';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
});

// Google Ads OAuth callback endpointi
router.get('/api/auth/googleads/callback', async (req: express.Request, res: express.Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  if (!code) return res.status(400).send('Google OAuth kodu eksik.');
  try {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_ADS_REDIRECT_URI;
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
    // Firebase'e kaydet
    const userId = typeof req.query.userId === 'string' ? req.query.userId : 'test-user';
    await admin.database().ref(`platformConnections/${userId}/google_ads`).set({
  accessToken: tokenData.access_token,
  refreshToken: tokenData.refresh_token,
  expiresIn: tokenData.expires_in,
  createdAt: Date.now(),
  isConnected: true,
    });
  res.send('<script>window.location.replace("http://localhost:5173/settings")</script>');
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
        if (!accountId) {
          return res.status(400).json({ message: 'Google Ads reklam hesabı ID eksik.' });
        }
        await admin.database().ref(`platformConnections/${userId}/google_ads/accountId`).set(accountId);
        return res.json({ message: 'Google Ads reklam hesabı güncellendi.', accountId });
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
  // Meta Reklam OAuth connect endpoint
  router.get('/api/auth/meta/connect', async (req, res) => {
  const clientId = process.env.META_APP_ID;
  console.log('META_APP_ID:', clientId);
    const redirectUri = process.env.META_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/meta/callback`;
    const scope = [
      'ads_management',
      'business_management',
      'pages_show_list',
      'pages_read_engagement',
    ].join(',');
    const state = encodeURIComponent(Math.random().toString(36).substring(2));
    const authUrl =
      `https://www.facebook.com/v19.0/dialog/oauth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${state}`;
    res.redirect(authUrl);
  });

  // Meta Reklam OAuth callback endpoint
  router.get('/api/auth/meta/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
      return res.redirect('/settings?connection=error&platform=meta_ads');
    }
    try {
      const params = new URLSearchParams();
      params.append('client_id', process.env.META_APP_ID!);
      params.append('client_secret', process.env.META_APP_SECRET!);
      params.append('redirect_uri', process.env.META_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/meta/callback`);
      params.append('code', code as string);
      const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);
      const tokenData = await tokenRes.json();
      if (tokenData.error || !tokenData.access_token) {
        return res.redirect('/settings?connection=error&platform=meta_ads');
      }
      const userId = req.query.userId || 'test-user';
      // Ad account ID'yi Facebook API'dan çek
      let accountId = null;
      let accountName = null;
      try {
        const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?access_token=${tokenData.access_token}`);
        const accountsData = await accountsRes.json();
        if (accountsData.data && accountsData.data.length > 0) {
          accountId = accountsData.data[0].id;
          accountName = accountsData.data[0].name || null;
        }
      } catch (err) {
        // Ad account ID çekilemezse null bırak
      }
      await admin.database().ref(`platformConnections/${userId}/meta_ads`).set({
        isConnected: true,
        platform: 'meta_ads',
        accessToken: tokenData.access_token,
        accountId,
        accountName,
        lastSyncAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  return res.send('<script>window.location.replace("http://localhost:5173/settings?connection=success&platform=meta_ads")</script>');
  return res.send('<script>window.location.replace("/settings")</script>');
  return res.send('<script>window.location.replace("http://localhost:5173/settings")</script>');
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
        endDate = 'today';
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
  // Platform bağlantılarını güncelleyen endpoint (adAccountId/propertyId kaydetme)
  router.post('/api/connections', async (req, res) => {
    try {
      const userId = req.query.userId || req.body.userId || 'test-user';
      const platform = req.body.platform;
      if (!platform) {
        return res.status(400).json({ message: 'Platform belirtilmedi.' });
      }
      // Meta Reklam Hesabı güncelleme
      if (platform === 'meta_ads') {
        const accountId = req.body.accountId;
        if (!accountId) {
          return res.status(400).json({ message: 'Ad Account ID eksik.' });
        }
        // Mevcut bağlantı bilgilerini çek
        const snapshot = await admin.database().ref(`platformConnections/${userId}/meta_ads`).once('value');
        const metaData = snapshot.val() || {};
        // Sadece accountId güncelle
        await admin.database().ref(`platformConnections/${userId}/meta_ads`).update({
          accountId,
          updatedAt: new Date().toISOString(),
        });
        return res.json({ message: 'Meta ad account ID güncellendi.', accountId });
      }
      // Google Analytics propertyId güncelleme
      if (platform === 'google_analytics') {
        const propertyId = req.body.propertyId;
        if (!propertyId) {
          return res.status(400).json({ message: 'Property ID eksik.' });
        }
        // Mevcut bağlantı bilgilerini çek
        const snapshot = await admin.database().ref(`platformConnections/${userId}/google_analytics`).once('value');
        const gaData = snapshot.val() || {};
        // Sadece propertyId güncelle
        await admin.database().ref(`platformConnections/${userId}/google_analytics`).update({
          propertyId,
          updatedAt: new Date().toISOString(),
        });
        return res.json({ message: 'Google Analytics property ID güncellendi.', propertyId });
      }
      return res.status(400).json({ message: 'Desteklenmeyen platform.' });
    } catch (error) {
      console.error('Platform bağlantısı güncelleme hatası:', error);
      res.status(500).json({ message: 'Bağlantı güncellenemedi', error });
    }
  });
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
