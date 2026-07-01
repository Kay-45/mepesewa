import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatGHS } from '../utils/finance';

export default function Setup() {
  const { setHousehold } = useApp();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState('single');
  const [data, setData] = useState({
    name: '', partnerName: '',
    income: '', partnerIncome: '',
    bills: { rent: '', water: '', electricity: '', groceries: '', otherFixed: '' },
    savingsTarget: '',
  });

  const upd = (key, val) => setData(p => ({ ...p, [key]: val }));
  const updBill = (key, val) => setData(p => ({ ...p, bills: { ...p.bills, [key]: val } }));

  const totalIncome = (parseFloat(data.income) || 0) + (mode === 'couple' ? (parseFloat(data.partnerIncome) || 0) : 0);
  const totalBills = Object.values(data.bills).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const savings = parseFloat(data.savingsTarget) || 0;
  const pocket = Math.max(0, totalIncome - totalBills - savings);

  const finish = () => {
    setHousehold({
      mode,
      name: data.name,
      partnerName: data.partnerName,
      income: parseFloat(data.income) || 0,
      partnerIncome: parseFloat(data.partnerIncome) || 0,
      bills: {
        rent: parseFloat(data.bills.rent) || 0,
        water: parseFloat(data.bills.water) || 0,
        electricity: parseFloat(data.bills.electricity) || 0,
        groceries: parseFloat(data.bills.groceries) || 0,
        otherFixed: parseFloat(data.bills.otherFixed) || 0,
      },
      savingsTarget: parseFloat(data.savingsTarget) || 0,
      setupDate: new Date().toISOString(),
    });
  };

  const steps = [
    {
      title: 'Welcome to MePesewa',
      subtitle: 'Your household financial coach',
      content: (
        <div>
          <p style={{ color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>
            Let's set up your household budget in 4 quick steps. We'll track every pesewa and make sure you save before you spend.
          </p>
          <p style={{ fontWeight: 600, marginBottom: 12, color: 'var(--text1)' }}>Who is managing this household?</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {['single', 'couple'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '16px 12px', borderRadius: 12,
                border: `2px solid ${mode === m ? 'var(--green)' : 'var(--border)'}`,
                background: mode === m ? 'var(--green-soft)' : 'var(--card)',
                color: mode === m ? 'var(--green)' : 'var(--text2)',
                fontWeight: 600, cursor: 'pointer', fontSize: 15,
              }}>
                {m === 'single' ? '🧑 Just me' : '👫 Me & partner'}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Your name</label>
            <input style={inputStyle} placeholder="e.g. Kwame" value={data.name} onChange={e => upd('name', e.target.value)} />
          </div>
          {mode === 'couple' && (
            <div>
              <label style={labelStyle}>Partner's name</label>
              <input style={inputStyle} placeholder="e.g. Akosua" value={data.partnerName} onChange={e => upd('partnerName', e.target.value)} />
            </div>
          )}
        </div>
      ),
      canNext: !!data.name,
    },
    {
      title: 'Monthly income',
      subtitle: 'How much comes in each month?',
      content: (
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>{data.name || 'Your'}'s monthly income (GHS)</label>
            <div style={cedisWrap}>
              <span style={cedisSign}>₵</span>
              <input style={{ ...inputStyle, paddingLeft: 32 }} type="number" placeholder="0.00" value={data.income} onChange={e => upd('income', e.target.value)} />
            </div>
          </div>
          {mode === 'couple' && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>{data.partnerName || 'Partner'}'s monthly income (GHS)</label>
              <div style={cedisWrap}>
                <span style={cedisSign}>₵</span>
                <input style={{ ...inputStyle, paddingLeft: 32 }} type="number" placeholder="0.00" value={data.partnerIncome} onChange={e => upd('partnerIncome', e.target.value)} />
              </div>
            </div>
          )}
          {totalIncome > 0 && (
            <div style={{ background: 'var(--green-soft)', borderRadius: 12, padding: 16, marginTop: 8 }}>
              <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: 18, margin: 0 }}>
                Total household income: {formatGHS(totalIncome)}
              </p>
            </div>
          )}
        </div>
      ),
      canNext: !!data.income,
    },
    {
      title: 'Fixed monthly bills',
      subtitle: 'What goes out every month before pocket money?',
      content: (
        <div>
          {[
            { key: 'rent', label: 'Rent / accommodation', icon: '🏠' },
            { key: 'water', label: 'Water bill (GWCL)', icon: '🚿' },
            { key: 'electricity', label: 'Light bill (ECG)', icon: '💡' },
            { key: 'groceries', label: 'Groceries (monthly)', icon: '🛒' },
            { key: 'otherFixed', label: 'Other fixed bills', icon: '📋' },
          ].map(({ key, label, icon }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{icon} {label}</label>
              <div style={cedisWrap}>
                <span style={cedisSign}>₵</span>
                <input style={{ ...inputStyle, paddingLeft: 32 }} type="number" placeholder="0.00"
                  value={data.bills[key]} onChange={e => updBill(key, e.target.value)} />
              </div>
            </div>
          ))}
          {totalBills > 0 && (
            <div style={{ background: '#fff3f3', border: '1px solid #fca5a5', borderRadius: 12, padding: 14, marginTop: 8 }}>
              <p style={{ color: '#b91c1c', fontWeight: 600, margin: 0 }}>Total fixed bills: {formatGHS(totalBills)}</p>
              {totalIncome > 0 && <p style={{ color: '#b91c1c', margin: '4px 0 0', fontSize: 13 }}>Remaining after bills: {formatGHS(Math.max(0, totalIncome - totalBills))}</p>}
            </div>
          )}
        </div>
      ),
      canNext: true,
    },
    {
      title: 'Set your savings target',
      subtitle: 'Pay yourself first — always.',
      content: (
        <div>
          <p style={{ color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>
            Before pocket money, how much do you want to save or send to your bank each month? Even ₵100 a month adds up fast.
          </p>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Monthly savings target (GHS)</label>
            <div style={cedisWrap}>
              <span style={cedisSign}>₵</span>
              <input style={{ ...inputStyle, paddingLeft: 32 }} type="number" placeholder="0.00" value={data.savingsTarget} onChange={e => upd('savingsTarget', e.target.value)} />
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            <p style={{ color: 'var(--text2)', fontSize: 13, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your monthly breakdown</p>
            {[
              { label: 'Total income', val: totalIncome, color: 'var(--green)' },
              { label: 'Fixed bills', val: -totalBills, color: '#ef4444' },
              { label: 'Savings', val: -savings, color: '#6366f1' },
              { label: '💰 Pocket money left', val: pocket, color: 'var(--green)', bold: true, big: true },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: row.bold ? 'none' : '1px solid var(--border)', marginTop: row.bold ? 8 : 0 }}>
                <span style={{ color: row.bold ? 'var(--text1)' : 'var(--text2)', fontWeight: row.bold ? 700 : 400, fontSize: row.big ? 16 : 14 }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: 700, fontSize: row.big ? 20 : 14 }}>{formatGHS(Math.abs(row.val))}</span>
              </div>
            ))}
          </div>
          {pocket < 0 && (
            <div style={{ background: '#fff3f3', border: '1px solid #fca5a5', borderRadius: 10, padding: 12, marginTop: 12 }}>
              <p style={{ color: '#b91c1c', margin: 0, fontSize: 13 }}>⚠️ Your bills + savings exceed your income. Please adjust your numbers.</p>
            </div>
          )}
        </div>
      ),
      canNext: pocket >= 0 && totalIncome > 0,
    },
  ];

  const current = steps[step];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💚</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text1)', margin: 0 }}>MePesewa</h1>
          <p style={{ color: 'var(--text2)', margin: '4px 0 0', fontSize: 14 }}>Your money, your pace</p>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? 'var(--green)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text1)', margin: '0 0 4px' }}>{current.title}</h2>
          <p style={{ color: 'var(--text2)', margin: '0 0 24px', fontSize: 14 }}>{current.subtitle}</p>
          {current.content}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, ...secondaryBtn }}>← Back</button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!current.canNext} style={{ flex: 1, ...primaryBtn, opacity: current.canNext ? 1 : 0.4 }}>
              Continue →
            </button>
          ) : (
            <button onClick={finish} disabled={!current.canNext} style={{ flex: 1, ...primaryBtn, opacity: current.canNext ? 1 : 0.4 }}>
              🎉 Start tracking!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 15, boxSizing: 'border-box', outline: 'none' };
const cedisWrap = { position: 'relative' };
const cedisSign = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', fontWeight: 600, pointerEvents: 'none', zIndex: 1 };
const primaryBtn = { padding: '14px 20px', borderRadius: 12, background: 'var(--green)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' };
const secondaryBtn = { padding: '14px 20px', borderRadius: 12, background: 'transparent', color: 'var(--text2)', border: '1.5px solid var(--border)', fontWeight: 600, fontSize: 15, cursor: 'pointer' };
