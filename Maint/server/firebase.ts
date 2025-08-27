import admin from "firebase-admin";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

export default admin;
