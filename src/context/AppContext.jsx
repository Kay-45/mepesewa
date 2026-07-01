import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [household, setHousehold] = useState(() => {
    const saved = localStorage.getItem('mepesewa_household');
    return saved ? JSON.parse(saved) : null;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('mepesewa_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('mepesewa_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem('mepesewa_savings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (household) localStorage.setItem('mepesewa_household', JSON.stringify(household));
  }, [household]);

  useEffect(() => {
    localStorage.setItem('mepesewa_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mepesewa_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('mepesewa_savings', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const addExpense = (expense) => {
    setExpenses(prev => [{ ...expense, id: Date.now(), date: new Date().toISOString() }, ...prev]);
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const getCurrentMonthExpenses = () => {
    const now = new Date();
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  };

  const getTotalSpent = () => getCurrentMonthExpenses().reduce((s, e) => s + e.amount, 0);

  const getFixedBillsTotal = () => {
    if (!household) return 0;
    const { rent = 0, water = 0, electricity = 0, groceries = 0, otherFixed = 0 } = household.bills || {};
    return rent + water + electricity + groceries + otherFixed;
  };

  const getTotalIncome = () => {
    if (!household) return 0;
    const primary = household.income || 0;
    const partner = household.mode === 'couple' ? (household.partnerIncome || 0) : 0;
    return primary + partner;
  };

  const getSavingsTarget = () => {
    if (!household) return 0;
    return household.savingsTarget || 0;
  };

  const getPocketMoney = () => {
    const income = getTotalIncome();
    const bills = getFixedBillsTotal();
    const savings = getSavingsTarget();
    return Math.max(0, income - bills - savings);
  };

  const getVariableSpent = () => {
    return getCurrentMonthExpenses().filter(e => !e.isFixed).reduce((s, e) => s + e.amount, 0);
  };

  return (
    <AppContext.Provider value={{
      household, setHousehold,
      expenses, addExpense, deleteExpense,
      reminders, setReminders,
      savingsGoals, setSavingsGoals,
      getCurrentMonthExpenses,
      getTotalSpent,
      getFixedBillsTotal,
      getTotalIncome,
      getSavingsTarget,
      getPocketMoney,
      getVariableSpent,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
