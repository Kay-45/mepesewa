import { useState } from 'react';
import { MOMO_FEES, getMoMoFee, formatGHS } from '../utils/finance';

export default function MoMoCalculator() {
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState('mtn');

  const num = parseFloat(amount) || 0;
  const fee = getMoMoFee(selected, num);
  const total = num + fee;

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text1)', marginBottom: 4 }}>MoMo fee calculator</h2>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>Know the real cost before you send</p>

      {/* Network tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {Object.entries(MOMO_FEES).map(([key, net]) => (
          <button key={key} onClick={() => setSelected(key)} style={{
            flex: 1, padding: '12px 8px', borderRadius: 12, fontWeight: 700, fontSize: 13,
            border: `2px solid ${selected === key ? net.color : 'var(--border)'}`,
            background: selected === key ? net.color : 'var(--card)',
            color: selected === key ? net.textColor : 'var(--text2)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{net.name.split(' ')[0]}</button>
        ))}
      </div>

      {/* Amount input */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid var(--border)' }}>
        <label style={lbl}>Amount to send</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 22, fontWeight: 700, color: 'var(--green)', pointerEvents: 'none' }}>₵</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 16, paddingBottom: 16, fontSize: 28, fontWeight: 700, borderRadius: 12, border: '2px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', boxSizing: 'border-box', outline: 'none' }} />
        </div>
      </div>

      {/* Breakdown */}
      {num > 0 && (
        <div style={{ background: num > 10000 ? '#fff3f3' : 'var(--card)', borderRadius: 16, padding: 20, marginBottom: 20, border: `1.5px solid ${num > 10000 ? '#fca5a5' : 'var(--border)'}` }}>
          {num > 10000 ? (
            <p style={{ color: '#ef4444', fontWeight: 600, margin: 0 }}>⚠️ Amount exceeds maximum MoMo transfer limit of ₵10,000</p>
          ) : fee === 0 ? (
            <p style={{ color: '#ef4444', fontWeight: 600, margin: 0 }}>Amount too low — minimum is ₵1</p>
          ) : (
            <>
              <p style={{ margin: '0 0 16px', fontWeight: 600, fontSize: 15, color: 'var(--text1)' }}>{MOMO_FEES[selected].name} transfer breakdown</p>
              {[
                { label: 'You want to send', val: formatGHS(num), color: 'var(--text1)' },
                { label: 'Network fee', val: `+ ${formatGHS(fee)}`, color: '#ef4444' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text2)', fontSize: 14 }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: r.color, fontSize: 14 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0' }}>
                <span style={{ fontWeight: 700, color: 'var(--text1)', fontSize: 16 }}>Total deducted from wallet</span>
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 20 }}>{formatGHS(total)}</span>
              </div>
              <div style={{ background: 'var(--green-soft)', borderRadius: 10, padding: 12, marginTop: 14 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--green)' }}>💡 The fee ({formatGHS(fee)}) is {((fee / num) * 100).toFixed(2)}% of your transfer amount.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Full fee table */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
        <p style={{ margin: '0 0 14px', fontWeight: 600, color: 'var(--text1)', fontSize: 15 }}>{MOMO_FEES[selected].name} — full fee bands</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Amount range', 'Fee', '% rate'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text2)', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOMO_FEES[selected].bands.map((band, i) => {
                const isActive = num >= band.min && num <= band.max;
                return (
                  <tr key={i} style={{ background: isActive ? 'var(--green-soft)' : 'transparent' }}>
                    <td style={{ padding: '10px 10px', color: isActive ? 'var(--green)' : 'var(--text1)', fontWeight: isActive ? 600 : 400, borderBottom: '1px solid var(--border)' }}>
                      {isActive && '▶ '}₵{band.min.toLocaleString()} – ₵{band.max.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 10px', color: isActive ? 'var(--green)' : 'var(--text1)', fontWeight: isActive ? 600 : 400, borderBottom: '1px solid var(--border)' }}>{formatGHS(band.fee)}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{((band.fee / band.min) * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 10, fontWeight: 500 };
