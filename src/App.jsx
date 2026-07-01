import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import MoMoCalculator from './pages/MoMo';
import AICoach from './pages/AICoach';
import Reminders from './pages/Reminders';
import History from './pages/History';
import './index.css';

const NAV = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'add', label: 'Add', icon: '➕' },
  { id: 'momo', label: 'MoMo', icon: '📲' },
  { id: 'coach', label: 'Coach', icon: '🤖' },
  { id: 'more', label: 'More', icon: '⋯' },
];

function AppShell() {
  const { household } = useApp();
  const [page, setPage] = useState('dashboard');
  const [showMore, setShowMore] = useState(false);

  if (!household) return <Setup />;

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'add': return <AddExpense onSuccess={() => setPage('dashboard')} />;
      case 'momo': return <MoMoCalculator />;
      case 'coach': return <AICoach />;
      case 'reminders': return <Reminders />;
      case 'history': return <History />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>💚</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>MePesewa</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setPage('reminders'); setShowMore(false); }} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</button>
          <button onClick={() => { setShowMore(false); setPage('dashboard'); setPage(p => p === 'settings' ? 'dashboard' : 'settings'); }} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</button>
        </div>
      </div>

      {/* More menu overlay */}
      {showMore && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={() => setShowMore(false)}>
          <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', background: 'var(--card)', borderRadius: 20, padding: 16, width: 280, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--text2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>More</p>
            {[
              { id: 'history', label: 'Expense history & savings', icon: '📋' },
              { id: 'reminders', label: 'Reminders', icon: '🔔' },
            ].map(item => (
              <button key={item.id} onClick={() => { setPage(item.id); setShowMore(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px',
                borderRadius: 12, border: 'none', background: page === item.id ? 'var(--green-soft)' : 'transparent',
                color: 'var(--text1)', fontWeight: 500, fontSize: 15, cursor: 'pointer', textAlign: 'left', marginBottom: 4,
              }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page content */}
      <div style={{ paddingBottom: 20 }}>
        {renderPage()}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'var(--card)', borderTop: '1px solid var(--border)', display: 'flex', padding: '8px 0 16px', zIndex: 100 }}>
        {NAV.map(item => {
          const active = item.id === 'more' ? showMore : page === item.id;
          return (
            <button key={item.id} onClick={() => { if (item.id === 'more') { setShowMore(p => !p); } else { setPage(item.id); setShowMore(false); } }} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px 0',
            }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? 'var(--green)' : 'var(--text2)' }}>{item.label}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--green)', marginTop: 2 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
