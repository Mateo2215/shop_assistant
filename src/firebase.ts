import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

// persistentLocalCache enables offline support (Faza 3 PWA requirement)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
})

// Anonymous Auth: gives every visitor a token without a login screen, so the
// Firestore rules can require request.auth != null instead of being fully open.
export const auth = getAuth(app)

export const HOUSEHOLD_ID = import.meta.env.VITE_HOUSEHOLD_ID
