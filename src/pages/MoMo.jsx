import { useState } from 'react';
import { MOMO_NETWORKS, getMoMoFee, formatGHS } from '../utils/finance';

export default function MoMoCalculator() {
  const [amount, setAmount] = useState('');
  const [selectedNet, setSelectedNet] = useState('mtn');

  const num = parseFloat(amount) || 0;
  const fee = getMoMoFee(selectedNet, num);
  const total = num + fee;
  const network = MOMO_NETWORKS[selectedNet];

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <h2 style={hdr}>MoMo fee calculator</h2>
      <p style={sub}>Know the real cost before you send</p>

      {/* Network selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {Object.entries(MOMO_NETWORKS).map(([key, net]) => (
          <button key={key} onClick={() => setSelectedNet(key)} style={{
            flex: 1, padding: '12px 6px', borderRadius: 12, fontWeight: 700, fontSize: 13,
            border: `2px solid ${selectedNet === key ? net.color : 'var(--border)'}`,
            background: selectedNet === key ? net.color + '22' : 'var(--card)',
            color: selectedNet === key ? '#111' : 'var(--text2)',
            cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit',
          }}>
            {net.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div style={card}>
        <label style={lbl}>Amount to send (GHS)</label>
        <div style={{ position: 'relative' }}>
          <span style={cedis}>₵</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            style={{ ...inp, paddingLeft: 30, fontSize: 26, fontWeight: 700 }}
          />
        </div>
      </div>

      {/* Breakdown */}
      {num > 0 && (
        <div style={{ ...card, marginBottom: 16 }}>
          {num > 10000 ? (
            <p style={{ color: '#ef4444', fontWeight: 600 }}>
              ⚠️ Maximum MoMo transfer is ₵10,000
            </p>
          ) : fee === 0 ? (
            <p style={{ color: '#ef4444', fontWeight: 600 }}>
              Minimum amount is ₵1
            </p>
          ) : (
            <>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text1)', marginBottom: 12 }}>
                {network.name} breakdown
              </p>
              <div style={row}>
                <span style={rowLabel}>Amount to send</span>
                <span style={rowVal}>{formatGHS(num)}</span>
              </div>
              <div style={row}>
                <span style={rowLabel}>Network fee</span>
                <span style={{ ...rowVal, color: '#ef4444' }}>+ {formatGHS(fee)}</span>
              </div>
              <div style={{ ...row, borderTop: '1px dashed var(--border)', paddingTop: 10, marginTop: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text1)' }}>Total deducted</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#ef4444' }}>{formatGHS(total)}</span>
              </div>
              <div style={{ background: 'rgba(29,158,117,0.08)', borderRadius: 10, padding: 10, marginTop: 12 }}>
                <p style={{ fontSize: 12, color: '#1d9e75', margin: 0 }}>
                  💡 Fee is {((fee / num) * 100).toFixed(2)}% of your transfer
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Fee bands table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <p style={{ padding: '12px 14px 8px', fontWeight: 700, fontSize: 14, color: 'var(--text1)', margin: 0 }}>
          {network.name} — full fee table
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Amount range', 'Fee', 'Rate'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {network.bands.map((band, i) => {
              const isActive = num >= band.min && num <= band.max;
              return (
                <tr key={i} style={{ background: isActive ? 'rgba(29,158,117,0.08)' : 'transparent' }}>
                  <td style={{ padding: '9px 12px', color: isActive ? '#1d9e75' : 'var(--text1)', fontWeight: isActive ? 700 : 400, borderBottom: '1px solid var(--border)' }}>
                    {isActive && '▶ '}₵{band.min.toLocaleString()}–₵{band.max.toLocaleString()}
                  </td>
                  <td style={{ padding: '9px 12px', color: isActive ? '#1d9e75' : 'var(--text1)', fontWeight: isActive ? 700 : 400, borderBottom: '1px solid var(--border)' }}>
                    {formatGHS(band.fee)}
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>
                    {((band.fee / band.min) * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const hdr = { fontSize: 20, fontWeight: 700, color: 'var(--text1)', margin: '0 0 4px' };
const sub = { fontSize: 12, color: 'var(--text2)', margin: '0 0 16px' };
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 14 };
const lbl = { display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 8, fontWeight: 500 };
const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' };
const cedis = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 700, color: '#1d9e75', pointerEvents: 'none' };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' };
const rowLabel = { fontSize: 13, color: 'var(--text2)' };
const rowVal = { fontSize: 13, fontWeight: 600, color: 'var(--text1)' };
