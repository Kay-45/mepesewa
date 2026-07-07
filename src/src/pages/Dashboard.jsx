import { useApp } from '../context/AppContext';
import { formatGHS, getCategoryById, generateSuggestions, getDaysLeftInMonth, getCurrentMonthName } from '../utils/finance';

export default function Dashboard({ setPage }) {
  const { household, getTotalIncome, getTotalSpentThisMonth, getCurrentMonthExpenses } = useApp();

  const income = getTotalIncome();
  const totalSpent = getTotalSpentThisMonth();
  const remaining = Math.max(0, income - totalSpent);
  const spentPct = income > 0 ? Math.min(100, (totalSpent / income) * 100) : 0;
  const monthExpenses = getCurrentMonthExpenses();
  const suggestions = generateSuggestions(monthExpenses, income);
  const daysLeft = getDaysLeftInMonth();

  // Group by category for top spending
  const byCategory = {};
  monthExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const recentExpenses = monthExpenses.slice(0, 5);

  return (
    <div style={s.page}>
      {/* Greeting */}
      <div style={s.greeting}>
        <p style={s.monthLabel}>{getCurrentMonthName()}</p>
        <h2 style={s.name}>
          Ei, {household?.name || 'Boss'} 👋
          {household?.mode === 'couple' && (
            <span style={s.partnerName}> & {household.partnerName}</span>
          )}
        </h2>
      </div>

      {/* Main income vs spent card */}
      <div style={s.mainCard}>
        <div style={s.mainCardTop}>
          <div>
            <p style={s.cardLabel}>Total income</p>
            <p style={s.cardAmount}>{formatGHS(income)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={s.cardLabel}>{daysLeft} days left</p>
            <p style={{ ...s.cardAmount, fontSize: 16, color: remaining < income * 0.2 ? '#fca5a5' : '#6ee7b7' }}>
              {formatGHS(remaining)} left
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${spentPct}%`, background: spentPct > 80 ? '#ef4444' : spentPct > 60 ? '#f59e0b' : '#6ee7b7' }} />
        </div>
        <div style={s.progressLabels}>
          <span>Spent: {formatGHS(totalSpent)} ({spentPct.toFixed(0)}%)</span>
          <span>Budget: {formatGHS(income)}</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <p style={s.statIcon}>📊</p>
          <p style={s.statLabel}>This month</p>
          <p style={{ ...s.statValue, color: '#ef4444' }}>{formatGHS(totalSpent)}</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statIcon}>💰</p>
          <p style={s.statLabel}>Remaining</p>
          <p style={{ ...s.statValue, color: '#1d9e75' }}>{formatGHS(remaining)}</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statIcon}>🧾</p>
          <p style={s.statLabel}>Transactions</p>
          <p style={{ ...s.statValue, color: '#6366f1' }}>{monthExpenses.length}</p>
        </div>
      </div>

      {/* Smart suggestions */}
      {suggestions.length > 0 && (
        <div style={s.section}>
          <p style={s.sectionTitle}>💡 Smart tips</p>
          {suggestions.map((tip, i) => (
            <div key={i} style={{ ...s.tipCard, borderLeftColor: tip.type === 'danger' ? '#ef4444' : tip.type === 'warning' ? '#f59e0b' : tip.type === 'success' ? '#1d9e75' : '#6366f1' }}>
              <p style={s.tipTitle}>{tip.icon} {tip.title}</p>
              <p style={s.tipMsg}>{tip.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top spending categories */}
      {topCategories.length > 0 && (
        <div style={s.section}>
          <p style={s.sectionTitle}>Top spending</p>
          {topCategories.map(([catId, amount]) => {
            const cat = getCategoryById(catId);
            const pct = income > 0 ? Math.min(100, (amount / income) * 100) : 0;
            return (
              <div key={catId} style={s.catRow}>
                <span style={s.catIcon}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={s.catHeader}>
                    <span style={s.catName}>{cat.label}</span>
                    <span style={s.catAmount}>{formatGHS(amount)}</span>
                  </div>
                  <div style={s.catTrack}>
                    <div style={{ ...s.catFill, width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <p style={s.sectionTitle}>Recent expenses</p>
            <button onClick={() => setPage('history')} style={s.seeAll}>See all</button>
          </div>
          {recentExpenses.map(exp => {
            const cat = getCategoryById(exp.category);
            const d = new Date(exp.date);
            return (
              <div key={exp.id} style={s.expRow}>
                <div style={{ ...s.expIcon, background: cat.color + '22' }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={s.expName}>{exp.note || cat.label}</p>
                  <p style={s.expDate}>
                    {d.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })} · {d.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' })}
                    {exp.momoFee > 0 && <span style={s.momoTag}> +{formatGHS(exp.momoFee)} fee</span>}
                  </p>
                </div>
                <p style={s.expAmount}>−{formatGHS(exp.amount)}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {monthExpenses.length === 0 && (
        <div style={s.empty}>
          <p style={{ fontSize: 48 }}>📝</p>
          <p style={s.emptyText}>No expenses yet this month</p>
          <button onClick={() => setPage('add')} style={s.addBtn}>+ Add your first expense</button>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: '16px 16px 100px' },
  greeting: { marginBottom: 16 },
  monthLabel: { fontSize: 12, color: 'var(--text2)', margin: 0 },
  name: { fontSize: 22, fontWeight: 700, color: 'var(--text1)', margin: '2px 0 0' },
  partnerName: { fontSize: 14, color: 'var(--text2)', fontWeight: 400 },
  mainCard: { background: 'linear-gradient(135deg,#1d9e75,#0f6e56)', borderRadius: 18, padding: 20, marginBottom: 14, color: '#fff' },
  mainCardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 16 },
  cardLabel: { margin: 0, fontSize: 12, opacity: 0.8 },
  cardAmount: { margin: '4px 0 0', fontSize: 24, fontWeight: 700 },
  progressTrack: { background: 'rgba(255,255,255,0.25)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 99, transition: 'width .4s' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.85 },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 },
  statCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 8px', textAlign: 'center' },
  statIcon: { fontSize: 20, margin: '0 0 4px' },
  statLabel: { fontSize: 10, color: 'var(--text2)', margin: '0 0 2px' },
  statValue: { fontSize: 14, fontWeight: 700, margin: 0 },
  section: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: 'var(--text1)', margin: '0 0 12px' },
  seeAll: { background: 'none', border: 'none', color: '#1d9e75', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  tipCard: { borderLeft: '3px solid', paddingLeft: 12, marginBottom: 12, borderRadius: '0 8px 8px 0', background: 'var(--bg)', padding: '10px 12px' },
  tipTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text1)', margin: '0 0 3px' },
  tipMsg: { fontSize: 12, color: 'var(--text2)', margin: 0, lineHeight: 1.5 },
  catRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  catIcon: { fontSize: 20, width: 32, textAlign: 'center' },
  catHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 12, color: 'var(--text1)', fontWeight: 500 },
  catAmount: { fontSize: 12, fontWeight: 700, color: 'var(--text1)' },
  catTrack: { background: 'var(--border)', borderRadius: 99, height: 4, overflow: 'hidden' },
  catFill: { height: '100%', borderRadius: 99, transition: 'width .4s' },
  expRow: { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border)' },
  expIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  expName: { fontSize: 13, fontWeight: 600, color: 'var(--text1)', margin: 0 },
  expDate: { fontSize: 11, color: 'var(--text2)', margin: '2px 0 0' },
  momoTag: { color: '#f59e0b', fontWeight: 600 },
  expAmount: { fontSize: 14, fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap' },
  empty: { textAlign: 'center', padding: '40px 20px' },
  emptyText: { color: 'var(--text2)', marginBottom: 16 },
  addBtn: { background: '#1d9e75', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
};
