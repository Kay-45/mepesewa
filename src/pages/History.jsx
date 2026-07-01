import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES, formatGHS } from '../utils/finance';

export default function History() {
  const { expenses, deleteExpense, savingsGoals, setSavingsGoals, household, getSavingsTarget } = useApp();
  const [tab, setTab] = useState('expenses');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', saved: '', icon: '🎯' });
  const [filter, setFilter] = useState('all');

  const months = [...new Set(expenses.map(e => {
    const d = new Date(e.date);
    return `${d.getFullYear()}-${d.getMonth()}`;
  }))].slice(0, 6);

  const [selectedMonth, setSelectedMonth] = useState(months[0] || '');

  const filtered = expenses.filter(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const matchMonth = !selectedMonth || key === selectedMonth;
    const matchCat = filter === 'all' || e.category === filter;
    return matchMonth && matchCat;
  });

  const monthTotal = filtered.reduce((s, e) => s + e.amount, 0);

  const monthLabel = (key) => {
    if (!key) return 'All';
    const [y, m] = key.split('-');
    return new Date(y, m, 1).toLocaleDateString('en-GH', { month: 'short', year: 'numeric' });
  };

  const addGoal = () => {
    if (!goalForm.name || !goalForm.target) return;
    setSavingsGoals(prev => [...prev, { ...goalForm, id: Date.now(), target: parseFloat(goalForm.target), saved: parseFloat(goalForm.saved) || 0 }]);
    setGoalForm({ name: '', target: '', saved: '', icon: '🎯' });
    setShowGoalForm(false);
  };

  const addToGoal = (id, amount) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g));
  };

  const deleteGoal = (id) => setSavingsGoals(prev => prev.filter(g => g.id !== id));

  const ICONS = ['🎯', '📱', '🚗', '✈️', '🏠', '💍', '💻', '👟', '🎓', '🏥', '🌍', '💪'];

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text1)', marginBottom: 20 }}>History & savings</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'var(--border)', borderRadius: 12, padding: 3 }}>
        {[['expenses', '📋 Expenses'], ['savings', '🏦 Savings goals']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none',
            background: tab === id ? 'var(--card)' : 'transparent',
            color: tab === id ? 'var(--text1)' : 'var(--text2)',
            fontWeight: tab === id ? 600 : 400, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'expenses' && (
        <>
          {/* Month filter */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
            {months.map(m => (
              <button key={m} onClick={() => setSelectedMonth(m)} style={{
                whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 99, fontSize: 13,
                border: `1.5px solid ${selectedMonth === m ? 'var(--green)' : 'var(--border)'}`,
                background: selectedMonth === m ? 'var(--green-soft)' : 'var(--card)',
                color: selectedMonth === m ? 'var(--green)' : 'var(--text2)', fontWeight: selectedMonth === m ? 600 : 400, cursor: 'pointer',
              }}>{monthLabel(m)}</button>
            ))}
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
            <button onClick={() => setFilter('all')} style={filterBtn(filter === 'all')}>All</button>
            {EXPENSE_CATEGORIES.filter(c => filtered.some(e => e.category === c.id)).map(c => (
              <button key={c.id} onClick={() => setFilter(c.id)} style={filterBtn(filter === c.id)}>{c.icon} {c.label}</button>
            ))}
          </div>

          {/* Summary */}
          {filtered.length > 0 && (
            <div style={{ background: 'var(--card)', borderRadius: 12, padding: 14, marginBottom: 16, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text2)', fontSize: 14 }}>{filtered.length} expenses</span>
              <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 18 }}>− {formatGHS(monthTotal)}</span>
            </div>
          )}

          {/* List */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
              <p style={{ color: 'var(--text2)' }}>No expenses yet. Start tracking!</p>
            </div>
          ) : (
            filtered.map(exp => {
              const cat = EXPENSE_CATEGORIES.find(c => c.id === exp.category) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
              const d = new Date(exp.date);
              return (
                <div key={exp.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: cat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text1)', fontSize: 14 }}>{exp.note || cat.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text2)' }}>
                      {d.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })} · {d.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                      {exp.momoFee > 0 && <span style={{ color: '#f59e0b' }}> · MoMo fee: {formatGHS(exp.momoFee)}</span>}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#ef4444', fontSize: 16 }}>−{formatGHS(exp.amount)}</p>
                    <button onClick={() => deleteExpense(exp.id)} style={{ border: 'none', background: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', padding: '2px 0' }}>remove</button>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {tab === 'savings' && (
        <>
          <div style={{ background: 'var(--green-soft)', border: '1px solid var(--green)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--green)' }}>🏦 Monthly savings target from budget: <strong>{formatGHS(getSavingsTarget())}</strong></p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text2)' }}>This is deducted before pocket money. Track goals below.</p>
          </div>

          <button onClick={() => setShowGoalForm(!showGoalForm)} style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--green)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 16 }}>
            + New savings goal
          </button>

          {showGoalForm && (
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 16px', fontWeight: 600, fontSize: 16, color: 'var(--text1)' }}>New goal</p>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setGoalForm(p => ({ ...p, icon: ic }))} style={{ width: 40, height: 40, borderRadius: 10, fontSize: 20, border: `2px solid ${goalForm.icon === ic ? 'var(--green)' : 'var(--border)'}`, background: goalForm.icon === ic ? 'var(--green-soft)' : 'var(--bg)', cursor: 'pointer' }}>{ic}</button>
                  ))}
                </div>
              </div>
              {[
                { k: 'name', label: 'Goal name', placeholder: 'e.g. New iPhone', type: 'text' },
                { k: 'target', label: 'Target amount (GHS)', placeholder: '0.00', type: 'number' },
                { k: 'saved', label: 'Already saved (GHS)', placeholder: '0.00', type: 'number' },
              ].map(f => (
                <div key={f.k} style={{ marginBottom: 12 }}>
                  <label style={lbl}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={goalForm[f.k]} onChange={e => setGoalForm(p => ({ ...p, [f.k]: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowGoalForm(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text2)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={addGoal} style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'var(--green)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Save goal</button>
              </div>
            </div>
          )}

          {savingsGoals.map(goal => {
            const pct = Math.min(100, (goal.saved / goal.target) * 100);
            const remaining = goal.target - goal.saved;
            const done = pct >= 100;
            return (
              <div key={goal.id} style={{ background: 'var(--card)', border: `1.5px solid ${done ? 'var(--green)' : 'var(--border)'}`, borderRadius: 16, padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{goal.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text1)', fontSize: 16 }}>{goal.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, color: done ? 'var(--green)' : 'var(--text2)' }}>
                        {done ? '🎉 Goal reached!' : `${formatGHS(remaining)} to go`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} style={{ border: 'none', background: 'none', color: '#aaa', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: done ? 'var(--green)' : '#6366f1', borderRadius: 99, transition: 'width 0.4s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: done ? 0 : 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{formatGHS(goal.saved)} saved</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{pct.toFixed(0)}% · {formatGHS(goal.target)}</span>
                </div>
                {!done && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[50, 100, 200].map(amt => (
                      <button key={amt} onClick={() => addToGoal(goal.id, amt)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid var(--green)', background: 'var(--green-soft)', color: 'var(--green)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        +₵{amt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {savingsGoals.length === 0 && !showGoalForm && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
              <p style={{ color: 'var(--text2)' }}>Set your first savings goal — phone, car, travel, anything!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 };
const filterBtn = (active) => ({
  whiteSpace: 'nowrap', padding: '7px 12px', borderRadius: 99, fontSize: 12, fontWeight: active ? 600 : 400,
  border: `1.5px solid ${active ? 'var(--green)' : 'var(--border)'}`,
  background: active ? 'var(--green-soft)' : 'var(--card)',
  color: active ? 'var(--green)' : 'var(--text2)', cursor: 'pointer', flexShrink: 0,
});
