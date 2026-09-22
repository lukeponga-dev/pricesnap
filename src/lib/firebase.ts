import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: These values are provided by the platform via firebase-applet-config.json
// For this environment, we can import them or hardcode them from the config.
// In a real production app, you'd use import.meta.env.VITE_FIREBASE_...
const firebaseConfig = {
  apiKey: "AIzaSyCBzXycjhiDJWHMT3GYFBjeOW3TBQ8p5g4",
  authDomain: "snapvalue-4607a.firebaseapp.com",
  projectId: "snapvalue-4607a",
  storageBucket: "snapvalue-4607a.firebasestorage.app",
  messagingSenderId: "805381652466",
  appId: "1:805381652466:web:686c60ab8a8860affa756b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
