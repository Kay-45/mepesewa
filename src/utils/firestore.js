import {
  doc, setDoc, getDoc, onSnapshot,
  collection, addDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, firebaseEnabled } from '../firebase';

// ── Household profile ────────────────────────────────────────────
// Stored at: users/{uid}/profile/household

export async function saveHousehold(uid, data) {
  if (!firebaseEnabled || !uid) return;
  await setDoc(doc(db, 'users', uid, 'profile', 'household'), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function loadHousehold(uid) {
  if (!firebaseEnabled || !uid) return null;
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'household'));
  return snap.exists() ? snap.data() : null;
}

export function watchHousehold(uid, callback) {
  if (!firebaseEnabled || !uid) return () => {};
  return onSnapshot(
    doc(db, 'users', uid, 'profile', 'household'),
    (snap) => callback(snap.exists() ? snap.data() : null)
  );
}

// ── Expenses ─────────────────────────────────────────────────────
// Stored at: users/{uid}/expenses/{expenseId}

export async function addExpenseToFirestore(uid, expense) {
  if (!firebaseEnabled || !uid) return null;
  const ref = await addDoc(collection(db, 'users', uid, 'expenses'), {
    ...expense,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteExpenseFromFirestore(uid, expenseId) {
  if (!firebaseEnabled || !uid) return;
  await deleteDoc(doc(db, 'users', uid, 'expenses', expenseId));
}

export function watchExpenses(uid, callback) {
  if (!firebaseEnabled || !uid) return () => {};
  const q = query(
    collection(db, 'users', uid, 'expenses'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const expenses = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      date: d.data().date || new Date().toISOString(),
    }));
    callback(expenses);
  });
}

// ── Savings goals ─────────────────────────────────────────────────
// Stored at: users/{uid}/goals/{goalId}

export async function addGoalToFirestore(uid, goal) {
  if (!firebaseEnabled || !uid) return null;
  const ref = await addDoc(collection(db, 'users', uid, 'goals'), {
    ...goal,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGoalInFirestore(uid, goalId, updates) {
  if (!firebaseEnabled || !uid) return;
  await setDoc(doc(db, 'users', uid, 'goals', goalId), updates, { merge: true });
}

export async function deleteGoalFromFirestore(uid, goalId) {
  if (!firebaseEnabled || !uid) return;
  await deleteDoc(doc(db, 'users', uid, 'goals', goalId));
}

export function watchGoals(uid, callback) {
  if (!firebaseEnabled || !uid) return () => {};
  return onSnapshot(
    collection(db, 'users', uid, 'goals'),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}
