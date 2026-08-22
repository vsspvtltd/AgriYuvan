import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missingEnvVars = requiredEnvVars.filter((key) => !import.meta.env[key]);

if (missingEnvVars.length > 0) {
  console.warn(
    `Missing Firebase environment variables: ${missingEnvVars.join(', ')}. Create a local .env file using the required VITE_FIREBASE_* values from your Firebase project. Using mock mode for development.`,
  );
  // Don't throw error in development, just warn
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDLZJfuwMBUEx69iu-cVDbv3frGskqKhAk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'agriyuvan-849be.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'agriyuvan-849be',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'agriyuvan-849be.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '846291032982',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:846291032982:web:240cbe42894b56e173dbb7',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Y2TEXBNVW5',
};

console.log('Firebase config loaded:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  isDemo: missingEnvVars.length > 0,
});

let app: FirebaseApp | null, auth: Auth | null, db: Firestore | null, initialized = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.languageCode = 'en';
  db = getFirestore(app);
  initialized = true;
  console.log('Firebase initialized successfully in demo mode');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  console.warn('Running without Firebase - demo mode enabled');
  // Create null objects for development
  app = null;
  auth = null;
  db = null;
  initialized = false;
}

export { auth, db, initialized };
export default app;

// Helper function to ensure db is initialized
export function getFirestoreDB(): Firestore {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }
  return db;
}
