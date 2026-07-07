import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getMoMoFee, MOMO_NETWORKS, formatGHS } from '../utils/finance';

export default function AddExpense({ onSuccess }) {
  const { addExpense, getTotalSpentThisMonth, getTotalIncome } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [momoNetwork, setMomoNetwork] = useState('mtn');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isMomo = category === 'momo';
  const num = parseFloat(amount) || 0;
  const momoFee = isMomo ? getMoMoFee(momoNetwork, num) : 0;
  const total = num + momoFee;

  const income = getTotalIncome();
  const spent = getTotalSpentThisMonth();
  const remaining = Math.max(0, income - spent);

  const handleSubmit = async () => {
    if (!amount || num <= 0) return;
    setLoading(true);
    const cat = CATEGORIES.find(c => c.id === category);
    await addExpense({
      amount: total,
      baseAmount: num,
      momoFee,
      category,
      note: note || cat?.label || 'Expense',
      momoNetwork: isMomo ? momoNetwork : null,
    });
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setAmount('');
      setNote('');
      setLoading(false);
      if (onSuccess) onSuccess();
    }, 1500);
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: 56 }}>✅</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#1d9e75', marginTop: 12 }}>Expense added!</p>
        <p style={{ color: 'var(--text2)', marginTop: 6 }}>Remaining: <strong>{formatGHS(Math.max(0, remaining - total))}</strong></p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text1)', margin: '0 0 4px' }}>Add expense</h2>
      {income > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>
          Remaining this month: <strong style={{ color: remaining < 100 ? '#ef4444' : '#1d9e75' }}>{formatGHS(remaining)}</strong>
        </p>
      )}

      {/* Amount */}
      <div style={card}>
        <label style={lbl}>Amount (GHS)</label>
        <div style={{ position: 'relative' }}>
          <span style={cedisSign}>₵</span>
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ ...input, paddingLeft: 34, fontSize: 26, fontWeight: 700 }} />
        </div>
        {num > remaining && remaining > 0 && (
          <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>
            ⚠️ This exceeds your remaining budget by {formatGHS(num - remaining)}
          </p>
        )}
      </div>

      {/* Category */}
      <div style={card}>
        <label style={lbl}>Category</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
              padding: '10px 4px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
              border: `2px solid ${category === cat.id ? cat.color : 'transparent'}`,
              background: category === cat.id ? cat.color + '22' : 'var(--bg)',
              transition: 'all .15s',
            }}>
              <div style={{ fontSize: 18 }}>{cat.icon}</div>
              <div style={{ fontSize: 9, color: category === cat.id ? cat.color : 'var(--text2)', marginTop: 3, fontWeight: category === cat.id ? 700 : 400, lineHeight: 1.2 }}>
                {cat.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MoMo section */}
      {isMomo && (
        <div style={{ ...card, background: '#fffbeb', border: '1.5px solid #fbbf24' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>📲 MoMo transfer</p>
          <label style={{ ...lbl, color: '#92400e' }}>Network</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {Object.entries(MOMO_NETWORKS).map(([key, net]) => (
              <button key={key} onClick={() => setMomoNetwork(key)} style={{
                flex: 1, padding: '9px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                border: `2px solid ${momoNetwork === key ? net.color : '#e5e7eb'}`,
                background: momoNetwork === key ? net.color + '33' : '#fff',
                color: momoNetwork === key ? net.textColor : '#6b7280',
                cursor: 'pointer',
              }}>{net.name.split(' ')[0]}</button>
            ))}
          </div>
          {num > 0 && (
            <div style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #fbbf24' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Amount to send</span>
                <span style={{ fontWeight: 600 }}>{formatGHS(num)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{MOMO_NETWORKS[momoNetwork].name} fee</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>+ {formatGHS(momoFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #fbbf24', paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total charged</span>
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 16 }}>{formatGHS(total)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div style={card}>
        <label style={lbl}>Note (optional)</label>
        <input type="text" placeholder="e.g. Lunch at chop bar, trotro to Osu..."
          value={note} onChange={e => setNote(e.target.value)} style={input} />
      </div>

      <button onClick={handleSubmit} disabled={!amount || num <= 0 || loading} style={{
        width: '100%', padding: 16, borderRadius: 14, background: '#1d9e75', color: '#fff',
        border: 'none', fontWeight: 700, fontSize: 17, cursor: 'pointer',
        opacity: !amount || num <= 0 ? 0.4 : 1,
      }}>
        {loading ? 'Saving...' : `Add ${isMomo ? `MoMo transfer (${formatGHS(total)})` : `expense (${num ? formatGHS(total) : '₵ 0.00'})`}`}
      </button>
    </div>
  );
}

const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 };
const lbl = { display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 8, fontWeight: 500 };
const input = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' };
const cedisSign = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 700, color: '#1d9e75', pointerEvents: 'none' };
