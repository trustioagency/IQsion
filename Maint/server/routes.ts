
import express from "express";
import admin from "./firebase";
import axios from "axios";
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
    return res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      companyName: userData?.companyName || '',
      profileImageUrl: userData?.profileImageUrl || '',
    });
  } catch (error) {
    return res.status(401).json({ message: 'Kullanıcı bulunamadı.' });
  }
});

// Test endpoint: Router ve Express çalışıyor mu?
router.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor' });
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
    const productsWithCost = products.map(p => ({
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
      console.log('[GA] /api/analytics/summary endpointine istek geldi:', {
        query: req.query
      });
      const userId = req.query.userId || 'test-user';
      const snapshot = await admin.database().ref(`platformConnections/${userId}/google_analytics`).once('value');
      const connection = snapshot.val();
      if (!connection || !connection.accessToken) {
        console.error('Google Analytics bağlantısı yok veya token bulunamadı.', { connection });
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
          const resp = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          });
          const data = await resp.json();
          if (data.access_token) {
            accessToken = data.access_token;
            expiresAt = new Date(now.getTime() + (data.expires_in || 3600) * 1000);
            await admin.database().ref(`platformConnections/${userId}/google_analytics`).update({
              accessToken,
              expiresAt: expiresAt.toISOString(),
              updatedAt: now.toISOString(),
            });
            console.log('Google Analytics accessToken otomatik yenilendi. Yeni expiresAt:', expiresAt.toISOString());
          } else {
            console.error('Google Analytics accessToken yenileme başarısız:', data);
            return res.status(401).json({ message: 'Google Analytics accessToken yenileme başarısız.', error: data });
          }
        } catch (err) {
          console.error('Google Analytics accessToken yenileme hatası:', err);
          return res.status(500).json({ message: 'Google Analytics accessToken yenileme hatası.', error: err });
        }
      }
      const propertyId = req.query.propertyId || 'YOUR_GA4_PROPERTY_ID';
      let startDate = req.query.startDate;
      let endDate = req.query.endDate;
      if (!startDate || !endDate) {
        startDate = '7daysAgo';
        endDate = 'today';
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
      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Google Analytics API response:', JSON.stringify(data, null, 2));
        res.json(data);
      } else {
        const errorData = await response.text();
        console.error('Google Analytics API error:', errorData);
        res.status(500).json({ message: 'Veri çekilemedi', error: errorData });
      }
    } catch (error) {
  console.error('[GA] Google Analytics veri çekme hatası:', error);
  res.status(500).json({ message: '[GA] Veri çekilemedi', error });
    }
  });

  // Google OAuth callback endpoint
  router.get('/api/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    let propertyId = req.query.propertyId;
    if (!code) {
      return res.redirect('http://localhost:5173/settings?connection=error&platform=google_analytics');
    }
    try {
      const params = new URLSearchParams();
      params.append('code', code as string);
      params.append('client_id', process.env.GOOGLE_CLIENT_ID!);
      params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET!);
      params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback');
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
      const userId = req.query.userId || 'test-user';
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
    const state = encodeURIComponent(Math.random().toString(36).substring(2));
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
  try {
    // Kullanıcının access token'ını veritabanından al
    const snapshot = await admin.database().ref(`platformConnections/${userId}/google_analytics`).once('value');
    const gaConn = snapshot.val();
    console.log('[GA DEBUG] userId:', userId);
    console.log('[GA DEBUG] gaConn:', gaConn);
    if (!gaConn || !gaConn.accessToken) {
      console.error('[GA DEBUG] Access token bulunamadı!');
      return res.status(400).json({ properties: [] });
    }
    // Token süresi ve scope logu
    if (gaConn.expiresAt) {
      console.log('[GA DEBUG] Token expiresAt:', gaConn.expiresAt);
    }
    if (gaConn.scope) {
      console.log('[GA DEBUG] Token scope:', gaConn.scope);
    }
    // Google Analytics hesabındaki property listesini çek
    const accountsRes = await fetch('https://analyticsadmin.googleapis.com/v1alpha/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${gaConn.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const accountsData = await accountsRes.json();
    console.log('[GA DEBUG] accountsData:', accountsData);
    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      console.error('[GA DEBUG] Hesap bulunamadı veya boş!');
      return res.json({ properties: [] });
    }
  let allProperties: { id: string; name: string }[] = [];
    for (const acc of accountsData.accounts) {
      const accountId = acc.name.split('/')[1];
      console.log('[GA DEBUG] accountId:', accountId);
      try {
        const propertiesRes = await fetch(`https://analyticsadmin.googleapis.com/v1alpha/accounts/${accountId}/properties`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${gaConn.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        console.log(`[GA DEBUG] propertiesRes.status for account ${accountId}:`, propertiesRes.status);
        const propertiesText = await propertiesRes.text();
        console.log(`[GA DEBUG] propertiesRes.body for account ${accountId}:`, propertiesText);
        let propertiesData;
        try {
          propertiesData = JSON.parse(propertiesText);
        } catch (e) {
          console.error(`[GA DEBUG] JSON parse hatası for account ${accountId}:`, e);
          continue;
        }
        const properties = (propertiesData.properties || []).map((p: any) => ({
          id: p.name.replace('properties/', ''),
          name: p.displayName || p.name,
        }));
        allProperties = allProperties.concat(properties);
      } catch (err) {
        console.error(`[GA DEBUG] Property fetch hatası for account ${accountId}:`, err);
      }
    }
    return res.json({ properties: allProperties });
  } catch (err) {
    console.error('[GA DEBUG] Hata:', err);
    return res.status(500).json({ properties: [] });
  }
});
