const admin = require('firebase-admin');

const serviceAccount = require('./Maint/server/maint-ca347-firebase-adminsdk-fbsvc-e8c566eb2c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://maint-ca347-default-rtdb.firebaseio.com'
});

async function checkGAConnection() {
  try {
    const userId = 'CzBHVr3v1GS6s6yDivYyRIS4yJs1';
    
    console.log('🔍 Checking GA connection for user:', userId);
    console.log('');
    
    const snapshot = await admin.database()
      .ref(`platformConnections/${userId}/google_analytics`)
      .once('value');
    
    const gaConn = snapshot.val();
    
    if (!gaConn) {
      console.log('❌ No GA connection found!');
      return;
    }
    
    console.log('📊 GA Connection Details:');
    console.log('='.repeat(80));
    console.log('Property ID:', gaConn.propertyId || 'NOT SET');
    console.log('Is Connected:', gaConn.isConnected);
    console.log('Has Access Token:', !!gaConn.accessToken);
    console.log('Has Refresh Token:', !!gaConn.refreshToken);
    console.log('Token Expires At:', gaConn.expiresAt || 'NOT SET');
    console.log('Last Updated:', gaConn.updatedAt || 'NOT SET');
    console.log('');
    
    // Check if token expired
    if (gaConn.expiresAt) {
      const expiresAt = new Date(gaConn.expiresAt);
      const now = new Date();
      const isExpired = expiresAt < now;
      
      console.log('🕒 Token Status:');
      console.log('  Expires:', expiresAt.toISOString());
      console.log('  Now:', now.toISOString());
      console.log('  Is Expired:', isExpired ? '❌ YES' : '✅ NO');
      console.log('');
      
      if (isExpired) {
        console.log('⚠️  Access token has EXPIRED! Need to refresh.');
      }
    }
    
    // Test API call with current token
    if (gaConn.accessToken && gaConn.propertyId) {
      console.log('🧪 Testing GA4 API call...');
      
      const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${gaConn.propertyId}:runReport`;
      const today = new Date().toISOString().split('T')[0];
      
      const body = {
        dateRanges: [{ startDate: today, endDate: today }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }],
      };
      
      try {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gaConn.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        
        const result = await response.json();
        
        console.log('  Status:', response.status, response.statusText);
        console.log('  Response:', JSON.stringify(result, null, 2));
        
        if (!response.ok) {
          console.log('');
          console.log('❌ API call FAILED!');
          if (result.error) {
            console.log('Error Code:', result.error.code);
            console.log('Error Message:', result.error.message);
            console.log('Error Status:', result.error.status);
          }
        } else {
          console.log('');
          console.log('✅ API call SUCCESS!');
        }
      } catch (err) {
        console.log('❌ API call threw error:', err.message);
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkGAConnection();
