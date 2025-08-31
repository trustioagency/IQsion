// client/src/lib/firebase.ts

import { initializeApp } from "firebase/app";
// signInWithPopup'ın import edildiğinden emin oluyoruz
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGYFAjUXAolGzajfun-ow8i3xA90f_pek",
  authDomain: "maint-ca347.firebaseapp.com",
  projectId: "maint-ca347",
  storageBucket: "maint-ca347.firebasestorage.app",
  messagingSenderId: "839632752295",
  appId: "1:839632752295:web:a214c66678468f1988d582",
  measurementId: "G-X60QV6VC73"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Helper function for signing in with Google
export const signInWithGoogle = async () => {
  // signInWithRedirect yerine tekrar signInWithPopup kullanıyoruz
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  if (user && user.uid) {
    localStorage.setItem('userUid', user.uid);
  }
  return result;
};