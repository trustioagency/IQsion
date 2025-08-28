
import admin from 'firebase-admin';
import serviceAccount from './maint-ca347-firebase-adminsdk-fbsvc-e8c566eb2c.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  databaseURL: 'https://maint-ca347-default-rtdb.firebaseio.com'
});

export default admin;
