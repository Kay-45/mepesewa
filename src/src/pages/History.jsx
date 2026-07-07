import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCategoryById, formatGHS } from '../utils/finance';
import {
  addGoalToFirestore, updateGoalInFirestore, deleteGoalFromFirestore,
} from '../utils/firestore';

export default function History() {
  const { expenses, deleteExpense, goals, uid } = useApp();
  const [tab, setTab] = useState('expenses');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', saved: '', icon: '🎯' });
  const ICONS = ['🎯', '📱', '🚗', '✈️', '🏠', '💍', '💻', '👟', '🎓', '🏥', '🌍', '💪'];

  // Group expenses by month
  const grouped = {};
  expenses.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GH', { month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = { label, items: [], total: 0 };
    grouped[key].items.push(e);
    grouped[key].total += e.amount;
  });
  const months = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));

  const addGoal = async () => {
    if (!goalForm.name || !goalForm.target) return;
    const goal = {
      name: goalForm.name,
      icon: goalForm.icon,
      target: parseFloat(goalForm.target),
      saved: parseFloat(goalForm.saved) || 0,
    };
    if (uid) await addGoalToFirestore(uid, goal);
    setGoalForm({ name: '', target: '', saved: '', icon: '🎯' });
    setShowGoalForm(false);
  };

  const addToGoal = async (goal, amount) => {
    const newSaved = Math.min(goal.target, goal.saved + amount);
    if (uid) await updateGoalInFirestore(uid, goal.id, { ...goal, saved: newSaved });
  };

  const deleteGoal = async (id) => {
    if (uid) await deleteGoalFromFirestore(uid, id);
  };

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <h2 style={hdr}>History & savings</h2>

      {/* Tab row */}
      <div style={tabRow}>
        {[['expenses', '📋 Expenses'], ['savings', '🏦 Savings goals']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ ...tabBtn, ...(tab === id ? tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {/* EXPENSES TAB */}
      {tab === 'expenses' && (
        <>
          {expenses.length === 0 && (
            <div style={empty}>
              <p style={{ fontSize: 48 }}>🧾</p>
              <p style={{ color: 'var(--text2)', marginTop: 8 }}>No expenses yet. Start adding!</p>
            </div>
          )}
          {months.map(([key, group]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>{group.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>−{formatGHS(group.total)}</span>
              </div>
              <div style={card}>
                {group.items.map((exp, i) => {
                  const cat = getCategoryById(exp.category);
                  const d = new Date(exp.date);
                  return (
                    <div key={exp.id} style={{ ...expRow, borderBottom: i < group.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ ...expIcon, background: cat.color + '22' }}>{cat.icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={expName}>{exp.note || cat.label}</p>
                        <p style={expMeta}>
                          {d.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })} · {d.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                          {exp.momoFee > 0 && <span style={{ color: '#f59e0b' }}> · fee {formatGHS(exp.momoFee)}</span>}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>−{formatGHS(exp.amount)}</p>
                        <button onClick={() => deleteExpense(exp.id)} style={delBtn}>remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* SAVINGS TAB */}
      {tab === 'savings' && (
        <>
          <button onClick={() => setShowGoalForm(!showGoalForm)} style={addGoalBtn}>
            + New savings goal
          </button>

          {showGoalForm && (
            <div style={{ ...card, marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text1)', marginBottom: 14 }}>New goal</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setGoalForm(p => ({ ...p, icon: ic }))} style={{
                    width: 38, height: 38, borderRadius: 9, fontSize: 18, cursor: 'pointer',
                    border: `2px solid ${goalForm.icon === ic ? '#1d9e75' : 'var(--border)'}`,
                    background: goalForm.icon === ic ? 'rgba(29,158,117,0.1)' : 'var(--bg)',
                  }}>{ic}</button>
                ))}
              </div>
              {[
                { k: 'name', label: 'Goal name', placeholder: 'e.g. New iPhone', type: 'text' },
                { k: 'target', label: 'Target amount (GHS)', placeholder: '0.00', type: 'number' },
                { k: 'saved', label: 'Already saved (GHS)', placeholder: '0.00', type: 'number' },
              ].map(f => (
                <div key={f.k} style={{ marginBottom: 12 }}>
                  <label style={lbl}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={goalForm[f.k]}
                    onChange={e => setGoalForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowGoalForm(false)} style={cancelBtn}>Cancel</button>
                <button onClick={addGoal} style={saveBtn}>Save goal</button>
              </div>
            </div>
          )}

          {goals.length === 0 && !showGoalForm && (
            <div style={empty}>
              <p style={{ fontSize: 48 }}>🎯</p>
              <p style={{ color: 'var(--text2)', marginTop: 8 }}>Set your first savings goal!</p>
            </div>
          )}

          {goals.map(goal => {
            const pct = Math.min(100, (goal.saved / goal.target) * 100);
            const done = pct >= 100;
            return (
              <div key={goal.id} style={{ ...card, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 28 }}>{goal.icon}</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text1)', margin: 0 }}>{goal.name}</p>
                      <p style={{ fontSize: 11, color: done ? '#1d9e75' : 'var(--text2)', margin: '2px 0 0' }}>
                        {done ? '🎉 Goal reached!' : `${formatGHS(goal.target - goal.saved)} to go`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: done ? '#1d9e75' : '#6366f1', borderRadius: 99, transition: 'width .4s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: done ? 0 : 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{formatGHS(goal.saved)} saved</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text1)' }}>{pct.toFixed(0)}% of {formatGHS(goal.target)}</span>
                </div>
                {!done && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[50, 100, 200].map(amt => (
                      <button key={amt} onClick={() => addToGoal(goal, amt)} style={quickAddBtn}>+₵{amt}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

const hdr = { fontSize: 20, fontWeight: 700, color: 'var(--text1)', margin: '0 0 16px' };
const tabRow = { display: 'flex', gap: 0, background: 'var(--border)', borderRadius: 12, padding: 3, marginBottom: 16 };
const tabBtn = { flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' };
const tabActive = { background: 'var(--card)', color: 'var(--text1)', fontWeight: 700 };
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 };
const expRow = { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, marginBottom: 10 };
const expIcon = { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 };
const expName = { fontSize: 13, fontWeight: 600, color: 'var(--text1)', margin: 0 };
const expMeta = { fontSize: 11, color: 'var(--text2)', margin: '2px 0 0' };
const delBtn = { background: 'none', border: 'none', color: '#aaa', fontSize: 11, cursor: 'pointer', padding: 0 };
const empty = { textAlign: 'center', padding: '60px 20px' };
const addGoalBtn = { width: '100%', padding: 14, borderRadius: 12, background: '#1d9e75', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 14 };
const lbl = { display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 };
const inp = { width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text1)', outline: 'none', boxSizing: 'border-box', background: 'var(--bg)' };
const cancelBtn = { flex: 1, padding: 11, borderRadius: 9, background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text2)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
const saveBtn = { flex: 2, padding: 11, borderRadius: 9, background: '#1d9e75', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
const quickAddBtn = { flex: 1, padding: '7px', borderRadius: 7, border: '1.5px solid #1d9e75', background: 'rgba(29,158,117,0.08)', color: '#1d9e75', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
