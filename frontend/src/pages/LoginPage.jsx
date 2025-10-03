/**
 * Login Page
 * Admin and Freelancer login form with tabs
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [loginType, setLoginType] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'freelancer') {
      setLoginType('freelancer');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Check if user role matches the selected login type
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userRole = storedUser?.role;

      if (loginType === 'freelancer' && userRole !== 'FREELANCER') {
        setError('Invalid credentials. This login is for freelancers only. Please use the Admin Login tab.');
        // Logout the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      if (loginType === 'admin' && userRole === 'FREELANCER') {
        setError('Invalid credentials. This login is for administrators only. Please use the Freelancer Login tab.');
        // Logout the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      // Redirect based on user role
      if (userRole === 'FREELANCER') {
        navigate('/freelancer');
      } else {
        navigate('/admin');
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerContainer}>
          <button onClick={() => navigate('/')} style={styles.backButton}>
            ← Back to Home
          </button>
        </div>

        <h1 style={styles.title}>Freelancer Management Platform</h1>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setLoginType('admin')}
            style={{
              ...styles.tab,
              ...(loginType === 'admin' && styles.activeTab),
            }}
          >
            Admin Login
          </button>
          <button
            onClick={() => setLoginType('freelancer')}
            style={{
              ...styles.tab,
              ...(loginType === 'freelancer' && styles.activeTab),
            }}
          >
            Freelancer Login
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="admin@ayadata.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {loginType === 'freelancer' && (
          <div style={styles.footer}>
            <p style={styles.footerText}>Don't have an account?</p>
            <a href="/apply" style={styles.link}>
              Register as Freelancer →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  headerContainer: {
    marginBottom: '20px',
  },
  backButton: {
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#333',
    textAlign: 'center',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
  },
  tab: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '4px',
    fontSize: '14px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
};