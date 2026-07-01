import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatGHS } from '../utils/finance';

const REMINDER_TYPES = [
  { id: 'bill', label: 'Bill payment', icon: '💡', color: '#f59e0b' },
  { id: 'savings', label: 'Transfer to savings', icon: '🏦', color: '#6366f1' },
  { id: 'budget', label: 'Budget check-in', icon: '📊', color: '#10b981' },
  { id: 'custom', label: 'Custom reminder', icon: '🔔', color: '#8b5cf6' },
];

export default function Reminders() {
  const { reminders, setReminders, household } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', type: 'bill', dueDay: '1', repeat: 'monthly', note: '' });

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addReminder = () => {
    if (!form.title) return;
    setReminders(prev => [...prev, { ...form, id: Date.now(), done: false, amount: parseFloat(form.amount) || 0 }]);
    setForm({ title: '', amount: '', type: 'bill', dueDay: '1', repeat: 'monthly', note: '' });
    setShowForm(false);
  };

  const toggleDone = (id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  const deleteReminder = (id) => setReminders(prev => prev.filter(r => r.id !== id));

  const today = new Date().getDate();
  const upcoming = reminders.filter(r => !r.done && parseInt(r.dueDay) >= today).sort((a, b) => a.dueDay - b.dueDay);
  const overdue = reminders.filter(r => !r.done && parseInt(r.dueDay) < today);
  const done = reminders.filter(r => r.done);

  // Auto-suggested reminders based on household setup
  const suggestions = [];
  if (household?.bills?.rent > 0) suggestions.push({ title: 'Pay rent', amount: household.bills.rent, type: 'bill', icon: '🏠' });
  if (household?.bills?.electricity > 0) suggestions.push({ title: 'Pay ECG bill', amount: household.bills.electricity, type: 'bill', icon: '💡' });
  if (household?.bills?.water > 0) suggestions.push({ title: 'Pay GWCL water bill', amount: household.bills.water, type: 'bill', icon: '🚿' });
  if (household?.savingsTarget > 0) suggestions.push({ title: 'Transfer to savings/bank', amount: household.savingsTarget, type: 'savings', icon: '🏦' });

  const quickAdd = (s) => {
    setReminders(prev => [...prev, { ...s, id: Date.now(), done: false, dueDay: '1', repeat: 'monthly', note: '' }]);
  };

  const ReminderCard = ({ r }) => {
    const type = REMINDER_TYPES.find(t => t.id === r.type) || REMINDER_TYPES[3];
    const daysUntil = parseInt(r.dueDay) - today;
    const isOverdue = daysUntil < 0;
    return (
      <div style={{ background: 'var(--card)', border: `1px solid ${r.done ? 'var(--border)' : isOverdue ? '#fca5a5' : 'var(--border)'}`, borderRadius: 14, padding: 16, marginBottom: 10, opacity: r.done ? 0.6 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: r.done ? 'var(--border)' : type.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {REMINDER_TYPES.find(t => t.id === r.type)?.icon || '🔔'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text1)', fontSize: 15, textDecoration: r.done ? 'line-through' : 'none' }}>{r.title}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: isOverdue && !r.done ? '#ef4444' : 'var(--text2)' }}>
              {r.amount > 0 ? formatGHS(r.amount) + ' · ' : ''}
              Day {r.dueDay} of month · {r.repeat}
              {!r.done && (isOverdue ? ` · ⚠️ Overdue` : daysUntil === 0 ? ' · Due today!' : ` · ${daysUntil} days`)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => toggleDone(r.id)} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${r.done ? 'var(--green)' : 'var(--border)'}`, background: r.done ? 'var(--green)' : 'transparent', color: r.done ? '#fff' : 'var(--text2)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</button>
            <button onClick={() => deleteReminder(r.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text1)', margin: 0 }}>Reminders</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0' }}>Bills, savings, and check-ins</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--green)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          + Add
        </button>
      </div>

      {/* Quick suggestions from setup */}
      {suggestions.filter(s => !reminders.some(r => r.title === s.title)).length > 0 && (
        <div style={{ background: 'var(--green-soft)', border: '1px solid var(--green)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: '0 0 10px', fontWeight: 600, color: 'var(--green)', fontSize: 14 }}>💡 Suggested from your setup</p>
          {suggestions.filter(s => !reminders.some(r => r.title === s.title)).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: 'var(--text1)', fontSize: 14 }}>{s.icon} {s.title} · {formatGHS(s.amount)}</span>
              <button onClick={() => quickAdd(s)} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--green)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Add</button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, marginBottom: 20, border: '1px solid var(--border)' }}>
          <p style={{ margin: '0 0 16px', fontWeight: 600, color: 'var(--text1)', fontSize: 16 }}>New reminder</p>
          {[
            { label: 'Title', key: 'title', placeholder: 'e.g. Pay ECG bill', type: 'text' },
            { label: 'Amount (optional, GHS)', key: 'amount', placeholder: '0.00', type: 'number' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={lbl}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => upd(f.key, e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={e => upd('type', e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 14 }}>
                {REMINDER_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Due day of month</label>
              <select value={form.dueDay} onChange={e => upd('dueDay', e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 14 }}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>Day {d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text2)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={addReminder} disabled={!form.title} style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'var(--green)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: form.title ? 1 : 0.4 }}>Save reminder</button>
          </div>
        </div>
      )}

      {overdue.length > 0 && (
        <>
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>⚠️ Overdue ({overdue.length})</p>
          {overdue.map(r => <ReminderCard key={r.id} r={r} />)}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <p style={{ color: 'var(--text2)', fontWeight: 600, fontSize: 14, marginBottom: 8, marginTop: overdue.length ? 12 : 0 }}>Upcoming this month</p>
          {upcoming.map(r => <ReminderCard key={r.id} r={r} />)}
        </>
      )}

      {done.length > 0 && (
        <>
          <p style={{ color: 'var(--text2)', fontWeight: 600, fontSize: 14, marginBottom: 8, marginTop: 16 }}>✅ Done</p>
          {done.map(r => <ReminderCard key={r.id} r={r} />)}
        </>
      )}

      {reminders.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>No reminders yet. Add your bills and savings dates.</p>
        </div>
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 };
