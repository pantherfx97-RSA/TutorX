import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from './firebase-applet-config.json';

// Use environment variables if available (Vite style), otherwise fallback to JSON
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;

const app = initializeApp(firebaseConfig);

// Standard Firestore initialization
export const db = getFirestore(app, firestoreDatabaseId || '(default)');

// Standard Auth initialization
export const auth = getAuth();

// Validate connection to Firestore
async function testConnection() {
  console.log("Testing Firestore connection...");
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful.");
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.log("Firestore reachable (Permission Denied as expected).");
    } else {
      console.error("Firestore connection failed:", error.code, error.message);
    }
  }
}

setTimeout(testConnection, 2000);
