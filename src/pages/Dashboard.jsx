import { useApp } from '../context/AppContext';
import { formatGHS, getDaysLeftInMonth, getDaysInMonth, EXPENSE_CATEGORIES } from '../utils/finance';

export default function Dashboard() {
  const { household, getTotalIncome, getFixedBillsTotal, getSavingsTarget, getPocketMoney, getVariableSpent, getCurrentMonthExpenses } = useApp();
  const income = getTotalIncome();
  const bills = getFixedBillsTotal();
  const savings = getSavingsTarget();
  const pocket = getPocketMoney();
  const variableSpent = getVariableSpent();
  const pocketLeft = Math.max(0, pocket - variableSpent);
  const daysLeft = getDaysLeftInMonth();
  const daysTotal = getDaysInMonth();
  const dailyBudget = pocket / daysTotal;
  const dailyActual = variableSpent / (daysTotal - daysLeft || 1);
  const overBudget = dailyActual > dailyBudget;
  const monthExpenses = getCurrentMonthExpenses();

  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: monthExpenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const pocketPct = pocket > 0 ? Math.min(100, (pocketLeft / pocket) * 100) : 0;
  const billsPct = income > 0 ? (bills / income) * 100 : 0;
  const savingsPct = income > 0 ? (savings / income) * 100 : 0;
  const spentPct = income > 0 ? (variableSpent / income) * 100 : 0;

  const now = new Date();
  const monthName = now.toLocaleDateString('en-GH', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: 'var(--text2)', margin: 0, fontSize: 13 }}>{monthName}</p>
        <h2 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700, color: 'var(--text1)' }}>
          Ei, {household?.name || 'Boss'} 👋
          {household?.mode === 'couple' && <span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 400 }}> & {household.partnerName}</span>}
        </h2>
      </div>

      {/* Income waterfall card */}
      <div style={{ background: 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)', borderRadius: 20, padding: 20, marginBottom: 16, color: '#fff' }}>
        <p style={{ margin: '0 0 4px', opacity: 0.8, fontSize: 13 }}>Total household income</p>
        <p style={{ margin: '0 0 16px', fontSize: 30, fontWeight: 700 }}>{formatGHS(income)}</p>
        {[
          { label: 'Fixed bills', val: bills, color: '#fca5a5', icon: '🏠' },
          { label: 'Savings target', val: savings, color: '#93c5fd', icon: '🏦' },
          { label: 'Pocket money', val: pocket, color: '#6ee7b7', icon: '💰', bold: true },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ opacity: 0.9, fontSize: 14 }}>{row.icon} {row.label}</span>
            <span style={{ color: row.color, fontWeight: row.bold ? 700 : 500, fontSize: row.bold ? 18 : 14 }}>{formatGHS(row.val)}</span>
          </div>
        ))}
      </div>

      {/* Pocket money remaining */}
      <div style={{ background: overBudget ? '#fff3f3' : 'var(--card)', border: `1.5px solid ${overBudget ? '#fca5a5' : 'var(--border)'}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text2)' }}>Pocket money left</p>
            <p style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 700, color: overBudget ? '#ef4444' : 'var(--green)' }}>{formatGHS(pocketLeft)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text2)' }}>{daysLeft} days left</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: overBudget ? '#ef4444' : 'var(--text1)' }}>
              {formatGHS(pocketLeft > 0 ? pocketLeft / (daysLeft || 1) : 0)}/day
            </p>
          </div>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{ width: `${pocketPct}%`, height: '100%', background: overBudget ? '#ef4444' : 'var(--green)', borderRadius: 99, transition: 'width 0.4s' }} />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text2)' }}>
          {formatGHS(variableSpent)} spent · Budget: {formatGHS(pocket)} · Daily avg: {formatGHS(dailyActual.toFixed(2))} {overBudget ? '⚠️ Above daily budget' : '✓ On track'}
        </p>
      </div>

      {/* Income allocation bar */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
        <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--text1)', fontSize: 15 }}>Income allocation</p>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 20, marginBottom: 12 }}>
          <div style={{ width: `${billsPct}%`, background: '#f87171', transition: 'width 0.4s' }} title="Bills" />
          <div style={{ width: `${savingsPct}%`, background: '#60a5fa', transition: 'width 0.4s' }} title="Savings" />
          <div style={{ width: `${spentPct}%`, background: '#fb923c', transition: 'width 0.4s' }} title="Spent" />
          <div style={{ flex: 1, background: 'var(--green)', opacity: 0.4 }} title="Remaining" />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[
            { label: 'Bills', color: '#f87171', val: bills },
            { label: 'Savings', color: '#60a5fa', val: savings },
            { label: 'Spent', color: '#fb923c', val: variableSpent },
            { label: 'Left', color: 'var(--green)', val: pocketLeft },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{item.label}: <strong style={{ color: 'var(--text1)' }}>{formatGHS(item.val)}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Spending by category */}
      {byCategory.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
          <p style={{ margin: '0 0 14px', fontWeight: 600, color: 'var(--text1)', fontSize: 15 }}>Top spending this month</p>
          {byCategory.slice(0, 5).map(cat => {
            const pct = pocket > 0 ? Math.min(100, (cat.total / pocket) * 100) : 0;
            return (
              <div key={cat.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text1)' }}>{cat.icon} {cat.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{formatGHS(cat.total)}</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: cat.color, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coach tip */}
      <div style={{ background: 'var(--green-soft)', border: '1px solid var(--green)', borderRadius: 16, padding: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>💡 Coach tip</p>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text1)', lineHeight: 1.6 }}>
          {overBudget
            ? `You're spending ₵${(dailyActual - dailyBudget).toFixed(2)} more per day than planned. Cut down on variable expenses this week.`
            : daysLeft < 7
            ? `Only ${daysLeft} days left! You have ${formatGHS(pocketLeft)} — pace yourself at ${formatGHS(pocketLeft / (daysLeft || 1))}/day.`
            : `Great pace! You're on track. Consider moving ${formatGHS(Math.max(0, (pocketLeft - (dailyBudget * daysLeft)) * 0.5))} to savings early.`}
        </p>
      </div>
    </div>
  );
}
