import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, firebaseEnabled } from './firebase';

export function watchAuth(callback) {
  if (!firebaseEnabled) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signUp(email, password) {
  if (!firebaseEnabled) throw new Error('Firebase is not configured. Add your keys to .env first.');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signIn(email, password) {
  if (!firebaseEnabled) throw new Error('Firebase is not configured. Add your keys to .env first.');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut() {
  if (!firebaseEnabled) return;
  await fbSignOut(auth);
}
