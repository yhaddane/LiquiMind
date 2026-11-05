import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { AuthUser } from '../types';

export interface FirebaseConfigInput {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_CONFIG_KEY = 'liquimind_firebase_config';

export function getSavedFirebaseConfig(): FirebaseConfigInput | null {
  try {
    const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
    const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
    if (envApiKey && envProjectId) {
      return {
        apiKey: envApiKey,
        authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
        projectId: envProjectId,
        storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
        messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
      };
    }
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.apiKey && parsed.projectId) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveFirebaseConfig(config: FirebaseConfigInput | null) {
  if (!config) {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
    return;
  }
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
}

export function initFirebaseInstance() {
  const cfg = getSavedFirebaseConfig();
  if (!cfg) return null;
  try {
    const app = getApps().length === 0 ? initializeApp(cfg) : getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  } catch (err) {
    console.warn('Initialisation Firebase ignorée:', err);
    return null;
  }
}

export async function signInWithGoogleFirebase(): Promise<AuthUser> {
  const instance = initFirebaseInstance();
  if (instance) {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(instance.auth, provider);
    const u = result.user;
    return {
      uid: u.uid,
      displayName: u.displayName || 'Utilisateur Google',
      email: u.email || 'user@gmail.com',
      photoURL: u.photoURL || undefined,
      provider: 'google',
      lastSyncedAt: new Date().toISOString(),
    };
  }

  // Fallback Cloud Google Identity simulation if no custom Firebase project keys are set yet
  return {
    uid: 'google_uid_yassine_haddane',
    displayName: 'Yassine Haddane',
    email: 'yassine.haddane@gmail.com',
    photoURL: 'https://ui-avatars.com/api/?name=Yassine+Haddane&background=c4f24e&color=101011&bold=true',
    provider: 'google',
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function signOutFirebase(): Promise<void> {
  const instance = initFirebaseInstance();
  if (instance) {
    await fbSignOut(instance.auth);
  }
}

export async function syncDataToFirestore(uid: string, payload: Record<string, any>): Promise<boolean> {
  const instance = initFirebaseInstance();
  const timestamp = new Date().toISOString();
  // Save local cloud snapshot regardless
  try {
    localStorage.setItem(`liquimind_cloud_snapshot_${uid}`, JSON.stringify({ ...payload, updatedAt: timestamp }));
  } catch {}

  if (!instance) return true;

  try {
    const userDocRef = doc(instance.db, 'users', uid);
    await setDoc(userDocRef, { ...payload, updatedAt: timestamp }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore write warning:', err);
    return false;
  }
}

export async function loadDataFromFirestore(uid: string): Promise<Record<string, any> | null> {
  const instance = initFirebaseInstance();
  if (instance) {
    try {
      const userDocRef = doc(instance.db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.warn('Firestore read warning:', err);
    }
  }

  try {
    const localSnap = localStorage.getItem(`liquimind_cloud_snapshot_${uid}`);
    return localSnap ? JSON.parse(localSnap) : null;
  } catch {
    return null;
  }
}

export function subscribeToFirebaseAuth(callback: (user: User | null) => void) {
  const instance = initFirebaseInstance();
  if (!instance) return () => {};
  return onAuthStateChanged(instance.auth, callback);
}
