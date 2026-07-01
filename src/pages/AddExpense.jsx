import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES, getMoMoFee, MOMO_FEES, formatGHS } from '../utils/finance';

export default function AddExpense({ onSuccess }) {
  const { addExpense, getPocketMoney, getVariableSpent } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [momoNetwork, setMomoNetwork] = useState('mtn');
  const [submitted, setSubmitted] = useState(false);

  const isMomo = category === 'momo';
  const momoFee = isMomo && amount ? getMoMoFee(momoNetwork, parseFloat(amount)) : 0;
  const totalWithFee = isMomo ? (parseFloat(amount) || 0) + momoFee : (parseFloat(amount) || 0);

  const pocket = getPocketMoney();
  const spent = getVariableSpent();
  const left = Math.max(0, pocket - spent);
  const overBudget = totalWithFee > left;

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    addExpense({
      amount: totalWithFee,
      baseAmount: parseFloat(amount),
      momoFee,
      category,
      note: note || EXPENSE_CATEGORIES.find(c => c.id === category)?.label,
      momoNetwork: isMomo ? momoNetwork : null,
      isFixed: false,
    });
    setSubmitted(true);
    setTimeout(() => {
      setAmount(''); setNote(''); setSubmitted(false);
      if (onSuccess) onSuccess();
    }, 1500);
  };

  if (submitted) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <h3 style={{ color: 'var(--green)', fontWeight: 700, fontSize: 22 }}>Expense added!</h3>
        <p style={{ color: 'var(--text2)' }}>Pocket money left: <strong style={{ color: 'var(--text1)' }}>{formatGHS(Math.max(0, left - totalWithFee))}</strong></p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text1)', marginBottom: 4 }}>Add expense</h2>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>Pocket money left: <strong style={{ color: left < 100 ? '#ef4444' : 'var(--green)' }}>{formatGHS(left)}</strong></p>

      {/* Amount */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid var(--border)' }}>
        <label style={lbl}>Amount (GHS)</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, fontSize: 22, color: 'var(--green)', pointerEvents: 'none' }}>₵</span>
          <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 16, paddingBottom: 16, fontSize: 24, fontWeight: 700, borderRadius: 12, border: '2px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', boxSizing: 'border-box', outline: 'none' }} />
        </div>
        {overBudget && amount && (
          <p style={{ margin: '8px 0 0', color: '#ef4444', fontSize: 13 }}>⚠️ This exceeds your remaining pocket money by {formatGHS(totalWithFee - left)}</p>
        )}
      </div>

      {/* Category */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid var(--border)' }}>
        <label style={lbl}>Category</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {EXPENSE_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
              padding: '10px 6px', borderRadius: 10, textAlign: 'center',
              border: `2px solid ${category === cat.id ? cat.color : 'transparent'}`,
              background: category === cat.id ? cat.color + '22' : 'var(--bg)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 20 }}>{cat.icon}</div>
              <div style={{ fontSize: 10, color: category === cat.id ? cat.color : 'var(--text2)', marginTop: 3, fontWeight: category === cat.id ? 600 : 400, lineHeight: 1.2 }}>{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* MoMo specific */}
      {isMomo && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fbbf24', borderRadius: 16, padding: 20, marginBottom: 14 }}>
          <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#92400e', fontSize: 15 }}>📲 MoMo transfer details</p>
          <label style={{ ...lbl, color: '#92400e' }}>Network</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {Object.entries(MOMO_FEES).map(([key, net]) => (
              <button key={key} onClick={() => setMomoNetwork(key)} style={{
                flex: 1, padding: '10px 6px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: `2px solid ${momoNetwork === key ? net.color : '#e5e7eb'}`,
                background: momoNetwork === key ? net.color : '#fff',
                color: momoNetwork === key ? net.textColor : '#6b7280',
                cursor: 'pointer',
              }}>{net.name.split(' ')[0]}</button>
            ))}
          </div>
          {amount && parseFloat(amount) > 0 && (
            <div style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #fbbf24' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>Amount to send</span>
                <span style={{ fontWeight: 600, color: '#111' }}>{formatGHS(amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>{MOMO_FEES[momoNetwork].name} fee</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>+ {formatGHS(momoFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #fbbf24', paddingTop: 8, marginTop: 8 }}>
                <span style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>Total charged</span>
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 16 }}>{formatGHS(totalWithFee)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, marginBottom: 20, border: '1px solid var(--border)' }}>
        <label style={lbl}>Note (optional)</label>
        <input type="text" placeholder="e.g. Lunch at chop bar, trotro to Osu..." value={note} onChange={e => setNote(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
      </div>

      <button onClick={handleSubmit} disabled={!amount || parseFloat(amount) <= 0} style={{
        width: '100%', padding: '16px', borderRadius: 14, background: 'var(--green)', color: '#fff',
        border: 'none', fontWeight: 700, fontSize: 17, cursor: 'pointer',
        opacity: !amount || parseFloat(amount) <= 0 ? 0.4 : 1,
      }}>
        Add {isMomo ? `MoMo transfer (${formatGHS(totalWithFee)})` : `expense (${amount ? formatGHS(totalWithFee) : '₵ 0'})`}
      </button>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 10, fontWeight: 500 };
