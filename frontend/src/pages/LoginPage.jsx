/**
 * Login Page
 * Unified login form with AyaData branding
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import Logo from '../components/ui/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(forgotEmail);
      setForgotSuccess('If an account exists with this email, a password reset link has been sent.');
      setForgotEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.label}>Password</label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={styles.forgotLink}
                onMouseEnter={(e) => e.target.style.color = colors.accent[600]}
                onMouseLeave={(e) => e.target.style.color = colors.accent[500]}
              >
                Forgot password?
              </button>
            </div>
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={styles.modalOverlay} onClick={() => setShowForgotPassword(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Reset Your Password</h2>
              <button
                onClick={() => setShowForgotPassword(false)}
                style={styles.closeButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.neutral[200]}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>
            <p style={styles.modalDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword}>
              {forgotSuccess && <div style={styles.success}>{forgotSuccess}</div>}
              {error && <div style={styles.error}>{error}</div>}
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
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
              <div style={{ display: 'flex', gap: spacing[3], marginTop: spacing[6] }}>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  style={styles.cancelButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.neutral[200]}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.neutral[100]}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.submitButton,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = colors.accent[600];
                      e.target.style.boxShadow = shadows.lg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = colors.accent[500];
                      e.target.style.boxShadow = shadows.md;
                    }
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  forgotLink: {
    background: 'none',
    border: 'none',
    color: colors.accent[500],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: spacing[6],
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[8],
    maxWidth: '480px',
    width: '100%',
    boxShadow: shadows.xl,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: typography.fontSize['2xl'],
    color: colors.text.tertiary,
    cursor: 'pointer',
    padding: spacing[2],
    borderRadius: borderRadius.base,
    transition: 'background-color 0.2s ease',
  },
  modalDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[6],
  },
  success: {
    padding: spacing[4],
    backgroundColor: colors.success[50],
    color: colors.success[700],
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    border: `1px solid ${colors.success[200]}`,
    marginBottom: spacing[4],
  },
  cancelButton: {
    flex: 1,
    padding: `${spacing[3]} ${spacing[4]}`,
    backgroundColor: colors.neutral[100],
    color: colors.text.primary,
    border: 'none',
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  submitButton: {
    flex: 1,
    padding: `${spacing[3]} ${spacing[4]}`,
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
};
