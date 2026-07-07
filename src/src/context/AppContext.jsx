import { createContext, useContext, useState, useEffect } from 'react';
import {
  watchHousehold, saveHousehold,
  watchExpenses, addExpenseToFirestore, deleteExpenseFromFirestore,
  watchGoals,
} from '../utils/firestore';

const AppContext = createContext(null);

export function AppProvider({ children, user }) {
  const uid = user?.uid;

  const [household, setHouseholdState] = useState(null);
  const [householdLoading, setHouseholdLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);

  // Watch household from Firestore
  useEffect(() => {
    if (!uid) { setHouseholdLoading(false); return; }
    const unsub = watchHousehold(uid, (data) => {
      setHouseholdState(data);
      setHouseholdLoading(false);
    });
    return unsub;
  }, [uid]);

  // Watch expenses from Firestore
  useEffect(() => {
    if (!uid) return;
    const unsub = watchExpenses(uid, setExpenses);
    return unsub;
  }, [uid]);

  // Watch goals from Firestore
  useEffect(() => {
    if (!uid) return;
    const unsub = watchGoals(uid, setGoals);
    return unsub;
  }, [uid]);

  const setHousehold = async (data) => {
    setHouseholdState(data);
    if (uid && data) await saveHousehold(uid, data);
  };

  const addExpense = async (expense) => {
    const newExpense = {
      ...expense,
      date: new Date().toISOString(),
    };
    if (uid) {
      await addExpenseToFirestore(uid, newExpense);
    } else {
      setExpenses(prev => [{ ...newExpense, id: Date.now().toString() }, ...prev]);
    }
  };

  const deleteExpense = async (id) => {
    if (uid) {
      await deleteExpenseFromFirestore(uid, id);
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const getCurrentMonthExpenses = () => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  };

  const getTotalIncome = () => {
    if (!household) return 0;
    return (household.income || 0) + (household.mode === 'couple' ? (household.partnerIncome || 0) : 0);
  };

  const getTotalSpentThisMonth = () =>
    getCurrentMonthExpenses().reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <AppContext.Provider value={{
      household, setHousehold, householdLoading,
      expenses, addExpense, deleteExpense,
      goals, setGoals,
      getCurrentMonthExpenses,
      getTotalIncome,
      getTotalSpentThisMonth,
      uid,
      user,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
