import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { watchAuth, signOut } from './auth';
import AuthPage from './pages/AuthPage';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import MoMoCalculator from './pages/MoMo';
import Reminders from './pages/Reminders';
import History from './pages/History';
import { useApp } from './context/AppContext';
import './index.css';

const NAV = [
  { id: 'dashboard', label: 'Home',    icon: '🏠' },
  { id: 'add',       label: 'Add',     icon: '➕' },
  { id: 'momo',      label: 'MoMo',    icon: '📲' },
  { id: 'history',   label: 'History', icon: '📋' },
  { id: 'more',      label: 'More',    icon: '⋯'  },
];

function Shell({ user }) {
  const { household, householdLoading } = useApp();
  const [page, setPage] = useState('dashboard');
  const [showMore, setShowMore] = useState(false);

  if (householdLoading) {
    return (
      <div style={loadingStyle}>
        <div style={{ fontSize: 40 }}>💚</div>
        <p style={{ color: '#1d9e75', fontWeight: 600, marginTop: 12 }}>Loading your budget...</p>
      </div>
    );
  }

  if (!household) return <Setup />;

  const handleSignOut = async () => {
    if (window.confirm('Log out of MePesewa?')) await signOut();
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />;
      case 'add':       return <AddExpense onSuccess={() => setPage('dashboard')} />;
      case 'momo':      return <MoMoCalculator />;
      case 'history':   return <History />;
      case 'reminders': return <Reminders />;
      default:          return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div style={appWrap}>
      {/* ── Sidebar nav (laptop) ── */}
      <aside style={sidebar}>
        <div style={sidebarTop}>
          <div style={sideLogoRow}>
            <span style={{ fontSize: 26 }}>💚</span>
            <span style={sideLogoText}>MePesewa</span>
          </div>
          <p style={sideUser}>{household?.name || user?.email?.split('@')[0]}</p>
        </div>
        {NAV.filter(n => n.id !== 'more').map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            ...sideNavBtn,
            background: page === item.id ? '#1d9e7518' : 'transparent',
            color: page === item.id ? '#1d9e75' : 'var(--text2)',
            fontWeight: page === item.id ? 700 : 400,
          }}>
            <span style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button onClick={() => setPage('reminders')} style={{ ...sideNavBtn, color: 'var(--text2)' }}>
          <span style={{ fontSize: 20, marginRight: 12 }}>🔔</span> Reminders
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={handleSignOut} style={{ ...sideNavBtn, color: '#ef4444', marginBottom: 16 }}>
          <span style={{ fontSize: 20, marginRight: 12 }}>🚪</span> Log out
        </button>
      </aside>

      {/* ── Main content ── */}
      <main style={mainContent}>
        {/* Mobile top bar */}
        <div style={mobileTopBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>💚</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#1d9e75' }}>MePesewa</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage('reminders')} style={iconBtn}>🔔</button>
            <button onClick={handleSignOut} style={iconBtn}>🚪</button>
          </div>
        </div>

        {/* Page */}
        <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: 80 }}>
          {renderPage()}
        </div>

        {/* Mobile bottom nav */}
        <nav style={bottomNav}>
          {NAV.map(item => {
            const active = item.id === 'more' ? showMore : page === item.id;
            return (
              <button key={item.id} onClick={() => {
                if (item.id === 'more') setShowMore(p => !p);
                else { setPage(item.id); setShowMore(false); }
              }} style={navBtn}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 9, color: active ? '#1d9e75' : 'var(--text2)', fontWeight: active ? 700 : 400 }}>
                  {item.label}
                </span>
                {active && <div style={{ width: 4, height: 4, borderRadius: 2, background: '#1d9e75' }} />}
              </button>
            );
          })}
        </nav>

        {/* More drawer */}
        {showMore && (
          <div style={moreOverlay} onClick={() => setShowMore(false)}>
            <div style={moreDrawer} onClick={e => e.stopPropagation()}>
              {[
                { id: 'reminders', label: 'Reminders', icon: '🔔' },
              ].map(item => (
                <button key={item.id} onClick={() => { setPage(item.id); setShowMore(false); }} style={moreItem}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <button onClick={handleSignOut} style={{ ...moreItem, color: '#ef4444' }}>
                <span style={{ fontSize: 22 }}>🚪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AuthGate() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = watchAuth(u => setUser(u));
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <div style={loadingStyle}>
        <div style={{ fontSize: 40 }}>💚</div>
        <p style={{ color: '#1d9e75', fontWeight: 600, marginTop: 12 }}>MePesewa</p>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <AuthPage onAuthSuccess={() => {}} />;

  return (
    <AppProvider user={user}>
      <Shell user={user} />
    </AppProvider>
  );
}

export default function App() {
  return <AuthGate />;
}

// ── Styles ────────────────────────────────────────────────────────
const loadingStyle = {
  minHeight: '100vh', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', background: '#f4f6f8',
};
const appWrap = {
  display: 'flex', minHeight: '100vh', background: 'var(--bg)',
};
const sidebar = {
  width: 220, flexShrink: 0, background: 'var(--card)',
  borderRight: '1px solid var(--border)', display: 'flex',
  flexDirection: 'column', padding: '16px 12px',
  position: 'sticky', top: 0, height: '100vh',
  // Hide on mobile
  '@media(max-width:640px)': { display: 'none' },
};
// We handle sidebar hiding via a className approach in CSS
const sidebarTop = { marginBottom: 24 };
const sideLogoRow = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 };
const sideLogoText = { fontWeight: 800, fontSize: 18, color: '#1d9e75' };
const sideUser = { fontSize: 12, color: 'var(--text2)', margin: 0 };
const sideNavBtn = {
  width: '100%', display: 'flex', alignItems: 'center', padding: '11px 12px',
  borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14,
  textAlign: 'left', marginBottom: 4, transition: 'all .15s', fontFamily: 'inherit',
};
const mainContent = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', position: 'relative' };
const mobileTopBar = {
  background: 'var(--card)', borderBottom: '1px solid var(--border)',
  padding: '12px 16px', display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
};
const iconBtn = { width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: 16, cursor: 'pointer' };
const bottomNav = {
  position: 'fixed', bottom: 0, left: 0, right: 0,
  background: 'var(--card)', borderTop: '1px solid var(--border)',
  display: 'flex', padding: '8px 0 12px', zIndex: 100,
};
const navBtn = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 0' };
const moreOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200 };
const moreDrawer = { position: 'absolute', bottom: 60, left: 0, right: 0, background: 'var(--card)', borderRadius: '16px 16px 0 0', padding: 16 };
const moreItem = { width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px', borderRadius: 10, border: 'none', background: 'transparent', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text1)' };
