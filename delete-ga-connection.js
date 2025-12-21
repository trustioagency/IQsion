const admin = require('firebase-admin');

const serviceAccount = require('./Maint/server/maint-ca347-firebase-adminsdk-fbsvc-e8c566eb2c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://maint-ca347-default-rtdb.firebaseio.com'
});

async function deleteGAConnection() {
  try {
    const userId = 'CzBHVr3v1GS6s6yDivYyRIS4yJs1';
    
    console.log('🗑️  Deleting Google Analytics connection...');
    
    await admin.database()
      .ref(`platformConnections/${userId}/google_analytics`)
      .remove();
    
    console.log('✅ Google Analytics connection deleted from Firebase');
    console.log('');
    console.log('Now go to Settings page and click "Bağla" button to reconnect!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteGAConnection();
