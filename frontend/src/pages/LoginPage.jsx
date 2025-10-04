/**
 * Login Page
 * Unified login form with AyaData branding
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import Logo from '../components/ui/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Get user role and redirect accordingly
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userRole = storedUser?.role;

      // Redirect based on user role
      if (userRole === 'FREELANCER') {
        navigate('/freelancer');
      } else {
        // All other roles (ADMIN, PROJECT_MANAGER, etc.) go to admin dashboard
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
        {/* Back Button */}
        <div style={styles.headerContainer}>
          <button
            onClick={() => navigate('/')}
            style={styles.backButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.neutral[200]}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ← Back to Home
          </button>
        </div>

        {/* Logo */}
        <div style={styles.logoContainer}>
          <Logo size="large" />
        </div>

        {/* Header */}
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your account to continue</p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="your.email@example.com"
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent[500];
                e.target.style.boxShadow = `0 0 0 3px ${colors.accent[100]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.default;
                e.target.style.boxShadow = 'none';
              }}
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
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent[500];
                e.target.style.boxShadow = `0 0 0 3px ${colors.accent[100]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.default;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = colors.accent[600];
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = shadows.lg;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = colors.accent[500];
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = shadows.md;
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Links */}
        <div style={styles.footer}>
          <div style={styles.linkSection}>
            <p style={styles.footerText}>New freelancer?</p>
            <a href="/apply" style={styles.link}>Apply to join our platform →</a>
          </div>
        </div>
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
    backgroundColor: colors.background.secondary,
    padding: spacing[6],
  },
  card: {
    backgroundColor: colors.background.primary,
    padding: spacing[10],
    borderRadius: borderRadius.xl,
    boxShadow: shadows.xl,
    maxWidth: '480px',
    width: '100%',
    border: `1px solid ${colors.border.light}`,
  },
  headerContainer: {
    marginBottom: spacing[6],
  },
  backButton: {
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.base,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    transition: 'all 0.2s ease',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing[2],
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[10],
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[5],
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  input: {
    padding: `${spacing[3]} ${spacing[4]}`,
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.base,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  button: {
    marginTop: spacing[3],
    padding: `${spacing[4]} ${spacing[6]}`,
    backgroundColor: colors.accent[500],
    color: colors.text.inverse,
    border: 'none',
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadows.md,
  },
  error: {
    padding: spacing[4],
    backgroundColor: colors.error[50],
    color: colors.error[700],
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    border: `1px solid ${colors.error[200]}`,
  },
  footer: {
    marginTop: spacing[10],
  },
  linkSection: {
    textAlign: 'center',
    paddingTop: spacing[8],
    borderTop: `1px solid ${colors.border.light}`,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  link: {
    color: colors.accent[500],
    textDecoration: 'none',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    transition: 'color 0.2s ease',
  },
};
