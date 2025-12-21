const admin = require('firebase-admin');

const serviceAccount = require('./Maint/server/maint-ca347-firebase-adminsdk-fbsvc-e8c566eb2c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://maint-ca347-default-rtdb.firebaseio.com'
});

async function refreshToken() {
  try {
    const userId = 'CzBHVr3v1GS6s6yDivYyRIS4yJs1';
    
    const snapshot = await admin.database()
      .ref(`platformConnections/${userId}/google_analytics`)
      .once('value');
    
    const gaConn = snapshot.val();
    
    if (!gaConn || !gaConn.refreshToken) {
      console.log('❌ No refresh token found!');
      return;
    }
    
    console.log('🔄 Attempting to refresh token...\n');
    
    // Try with first client ID
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET || '');
    params.append('refresh_token', gaConn.refreshToken);
    params.append('grant_type', 'refresh_token');
    
    console.log('Using Client ID:', (process.env.GOOGLE_CLIENT_ID || '').substring(0, 20) + '...');
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    
    const result = await response.json();
    
    if (result.access_token) {
      console.log('✅ Token refresh SUCCESS!');
      console.log('  New Access Token:', result.access_token.substring(0, 30) + '...');
      console.log('  Expires In:', result.expires_in, 'seconds');
      
      // Update Firebase
      const now = new Date();
      const expiresAt = new Date(now.getTime() + result.expires_in * 1000);
      
      await admin.database()
        .ref(`platformConnections/${userId}/google_analytics`)
        .update({
          accessToken: result.access_token,
          expiresAt: expiresAt.toISOString(),
          updatedAt: now.toISOString()
        });
      
      console.log('  Updated Firebase ✅');
      console.log('  New Expiry:', expiresAt.toISOString());
      
    } else {
      console.log('❌ Token refresh FAILED!');
      console.log('Response:', JSON.stringify(result, null, 2));
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

refreshToken();
