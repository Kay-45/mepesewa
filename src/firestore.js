import {
  doc, setDoc, getDoc, onSnapshot, collection,
  query, where, addDoc, deleteDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db, firebaseEnabled } from './firebase';

// ── Household document ──────────────────────────────────────────
// Each household is a single Firestore doc, shared by an inviteCode.
// Both partners read/write the same doc so income, bills, and savings
// targets stay in sync in real time.

export function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createHousehold(uid, householdData) {
  if (!firebaseEnabled) return null;
  const inviteCode = generateInviteCode();
  const ref = doc(db, 'households', inviteCode);
  await setDoc(ref, {
    ...householdData,
    ownerId: uid,
    memberIds: [uid],
    inviteCode,
    createdAt: serverTimestamp(),
  });
  return inviteCode;
}

export async function joinHousehold(uid, inviteCode) {
  if (!firebaseEnabled) return null;
  const ref = doc(db, 'households', inviteCode.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Invite code not found. Check with your partner.');
  const data = snap.data();
  if (!data.memberIds.includes(uid)) {
    await updateDoc(ref, { memberIds: [...data.memberIds, uid] });
  }
  return snap.data();
}

export function watchHousehold(inviteCode, callback) {
  if (!firebaseEnabled || !inviteCode) return () => {};
  const ref = doc(db, 'households', inviteCode);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export async function updateHousehold(inviteCode, updates) {
  if (!firebaseEnabled) return;
  const ref = doc(db, 'households', inviteCode);
  await updateDoc(ref, updates);
}

// ── Expenses subcollection ──────────────────────────────────────
// households/{inviteCode}/expenses/{expenseId}
// Both partners see each other's expenses in real time.

export function watchExpenses(inviteCode, callback) {
  if (!firebaseEnabled || !inviteCode) return () => {};
  const ref = collection(db, 'households', inviteCode, 'expenses');
  return onSnapshot(ref, (snap) => {
    const expenses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(expenses.sort((a, b) => new Date(b.date) - new Date(a.date)));
  });
}

export async function addExpenseToHousehold(inviteCode, expense, addedBy) {
  if (!firebaseEnabled) return;
  const ref = collection(db, 'households', inviteCode, 'expenses');
  await addDoc(ref, { ...expense, addedBy, date: new Date().toISOString() });
}

export async function deleteExpenseFromHousehold(inviteCode, expenseId) {
  if (!firebaseEnabled) return;
  await deleteDoc(doc(db, 'households', inviteCode, 'expenses', expenseId));
}

// ── Savings goals subcollection ─────────────────────────────────

export function watchSavingsGoals(inviteCode, callback) {
  if (!firebaseEnabled || !inviteCode) return () => {};
  const ref = collection(db, 'households', inviteCode, 'savingsGoals');
  return onSnapshot(ref, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addSavingsGoal(inviteCode, goal) {
  if (!firebaseEnabled) return;
  const ref = collection(db, 'households', inviteCode, 'savingsGoals');
  await addDoc(ref, goal);
}

export async function updateSavingsGoal(inviteCode, goalId, updates) {
  if (!firebaseEnabled) return;
  await updateDoc(doc(db, 'households', inviteCode, 'savingsGoals', goalId), updates);
}

export async function deleteSavingsGoal(inviteCode, goalId) {
  if (!firebaseEnabled) return;
  await deleteDoc(doc(db, 'households', inviteCode, 'savingsGoals', goalId));
}
