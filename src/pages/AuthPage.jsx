import { useState } from 'react';
import { signIn, signUp } from '../auth.js';

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const clearForm = () => {
    setName(''); setEmail(''); setPassword('');
    setConfirmPassword(''); setError('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    clearForm();
  };

  const handleSubmit = async () => {
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup') {
      if (!name) { setError('Please enter your name.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onAuthSuccess(name);
    } catch (err) {
      // Show friendly error messages
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError('Something went wrong. Please check your internet and try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Top green header */}
      <div style={styles.header}>
        <div style={styles.logoCircle}>
          <span style={{ fontSize: 28 }}>💚</span>
        </div>
        <h1 style={styles.appName}>MePesewa</h1>
        <p style={styles.tagline}>Your money, your pace</p>
      </div>

      {/* Card */}
      <div style={styles.card}>

        {/* Tab switcher */}
        <div style={styles.tabRow}>
          <button
            onClick={() => switchMode('login')}
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}>
            Log in
          </button>
          <button
            onClick={() => switchMode('signup')}
            style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}>
            Sign up
          </button>
        </div>

        <h2 style={styles.title}>
          {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
        </h2>
        <p style={styles.subtitle}>
          {mode === 'login'
            ? 'Log in to access your household budget'
            : 'Start tracking your pesewas today'}
        </p>

        {/* Name field (signup only) */}
        {mode === 'signup' && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Your name</label>
            <input
              style={styles.input}
              placeholder="e.g. Kwame"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Email */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="youremail@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...styles.input, paddingRight: 48 }}
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={() => setShowPassword(p => !p)}
              style={styles.eyeBtn}
              tabIndex={-1}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Confirm password (signup only) */}
        {mode === 'signup' && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={styles.errorBox}>
            <span style={{ marginRight: 6 }}>⚠️</span>{error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
          {loading
            ? (mode === 'login' ? 'Logging in...' : 'Creating account...')
            : (mode === 'login' ? 'Log in' : 'Create account')}
        </button>

        {/* Switch mode link */}
        <p style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            style={styles.switchLink}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </p>

      </div>

      <p style={styles.footer}>
        🇬🇭 Built for Ghana · Your data is secure
      </p>
    </div>
  );
}

const GREEN = '#1d9e75';
const GREEN_SOFT = 'rgba(29,158,117,0.1)';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f6f8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    background: `linear-gradient(135deg, ${GREEN} 0%, #0f6e56 100%)`,
    padding: '40px 20px 60px',
    textAlign: 'center',
    color: '#fff',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  appName: {
    fontSize: 28,
    fontWeight: 700,
    margin: '0 0 4px',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
  },
  tagline: {
    fontSize: 14,
    margin: 0,
    opacity: 0.85,
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '28px 24px',
    width: '100%',
    maxWidth: 400,
    marginTop: -30,
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    fontFamily: 'Inter, sans-serif',
  },
  tabRow: {
    display: 'flex',
    background: '#f4f6f8',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: '10px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#6b7280',
    fontWeight: 500,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#fff',
    color: '#111827',
    fontWeight: 700,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    margin: '0 0 20px',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #e5e7eb',
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
  },
  errorBox: {
    background: '#fff3f3',
    border: '1px solid #fca5a5',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#b91c1c',
    marginBottom: 16,
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    background: GREEN,
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 16,
    transition: 'opacity 0.2s',
  },
  switchText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    margin: 0,
  },
  switchLink: {
    color: GREEN,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
};
