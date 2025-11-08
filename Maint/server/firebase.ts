
import admin from 'firebase-admin';

// IMPORTANT: Removed direct import of service account JSON to avoid embedding secrets in source & bundle.
// Cloud Run provides a default service account. Grant it Firebase Admin (or specific) permissions.
// Initialization will use Application Default Credentials. For local dev, you can still set GOOGLE_APPLICATION_CREDENTIALS
// or run `gcloud auth application-default login`.

if (!admin.apps.length) {
  admin.initializeApp({
    // Prefer env-provided database URL; fallback kept for convenience (non-secret).
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://maint-ca347-default-rtdb.firebaseio.com'
  });
}

export default admin;
