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
    currency: 'GHS',
  });

  const upd = (k, v) => setData(p => ({ ...p, [k]: v }));

  const totalIncome = (parseFloat(data.income) || 0) +
    (mode === 'couple' ? (parseFloat(data.partnerIncome) || 0) : 0);

  const finish = () => {
    setHousehold({
      mode,
      name: data.name,
      partnerName: data.partnerName,
      income: parseFloat(data.income) || 0,
      partnerIncome: parseFloat(data.partnerIncome) || 0,
      setupDate: new Date().toISOString(),
    });
  };

  const steps = [
    {
      title: 'Welcome to MePesewa 💚',
      subtitle: 'Your household money coach — let\'s get you set up in 2 quick steps.',
      content: (
        <div>
          <p style={bodyText}>Who is managing this household?</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { key: 'single', label: '🧑 Just me' },
              { key: 'couple', label: '👫 Me & partner' },
            ].map(m => (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                flex: 1, padding: '16px 10px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${mode === m.key ? '#1d9e75' : '#e5e7eb'}`,
                background: mode === m.key ? 'rgba(29,158,117,0.08)' : '#fff',
                color: mode === m.key ? '#1d9e75' : '#6b7280',
                fontWeight: 600, fontSize: 15,
              }}>{m.label}</button>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Your name</label>
            <input style={inp} placeholder="e.g. Kwame" value={data.name} onChange={e => upd('name', e.target.value)} />
          </div>
          {mode === 'couple' && (
            <div>
              <label style={lbl}>Partner's name</label>
              <input style={inp} placeholder="e.g. Akosua" value={data.partnerName} onChange={e => upd('partnerName', e.target.value)} />
            </div>
          )}
        </div>
      ),
      canNext: !!data.name,
    },
    {
      title: '💰 Monthly income',
      subtitle: 'How much do you earn each month? This helps us track how much you\'ve spent vs earned.',
      content: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>{data.name || 'Your'}'s monthly income (GHS)</label>
            <div style={{ position: 'relative' }}>
              <span style={cedis}>₵</span>
              <input style={{ ...inp, paddingLeft: 30 }} type="number" placeholder="0.00"
                value={data.income} onChange={e => upd('income', e.target.value)} />
            </div>
          </div>
          {mode === 'couple' && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>{data.partnerName || 'Partner'}'s monthly income (GHS)</label>
              <div style={{ position: 'relative' }}>
                <span style={cedis}>₵</span>
                <input style={{ ...inp, paddingLeft: 30 }} type="number" placeholder="0.00"
                  value={data.partnerIncome} onChange={e => upd('partnerIncome', e.target.value)} />
              </div>
            </div>
          )}
          {totalIncome > 0 && (
            <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid #1d9e75', borderRadius: 12, padding: 16, marginTop: 8 }}>
              <p style={{ color: '#1d9e75', fontWeight: 700, fontSize: 18, margin: 0 }}>
                Total income: {formatGHS(totalIncome)}
              </p>
              <p style={{ color: '#0f6e56', fontSize: 12, margin: '4px 0 0' }}>
                MePesewa will track your spending against this amount each month.
              </p>
            </div>
          )}
        </div>
      ),
      canNext: !!data.income,
    },
  ];

  const current = steps[step];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 40 }}>💚</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '6px 0 0' }}>MePesewa</h1>
          <p style={{ color: '#6b7280', fontSize: 13 }}>Your money, your pace</p>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 99, background: i <= step ? '#1d9e75' : '#e5e7eb', transition: 'all .3s' }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>{current.title}</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>{current.subtitle}</p>
          {current.content}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={backBtn}>← Back</button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!current.canNext} style={{ ...nextBtn, opacity: current.canNext ? 1 : 0.4 }}>
              Continue →
            </button>
          ) : (
            <button onClick={finish} disabled={!current.canNext} style={{ ...nextBtn, opacity: current.canNext ? 1 : 0.4 }}>
              🎉 Start tracking!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 500 };
const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' };
const cedis = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#1d9e75', fontWeight: 700, pointerEvents: 'none' };
const bodyText = { fontSize: 14, color: '#374151', marginBottom: 12, fontWeight: 500 };
const nextBtn = { flex: 1, padding: '14px', borderRadius: 12, background: '#1d9e75', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' };
const backBtn = { flex: 1, padding: '14px', borderRadius: 12, background: 'transparent', color: '#6b7280', border: '1.5px solid #e5e7eb', fontWeight: 600, fontSize: 15, cursor: 'pointer' };
