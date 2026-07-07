import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, firebaseEnabled } from './firebase';

export function watchAuth(callback) {
  if (!firebaseEnabled) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function signUp(email, password, displayName) {
  if (!firebaseEnabled) throw new Error('Firebase is not configured.');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Save the user's display name
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function signIn(email, password) {
  if (!firebaseEnabled) throw new Error('Firebase is not configured.');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut() {
  if (!firebaseEnabled) return;
  await fbSignOut(auth);
}
