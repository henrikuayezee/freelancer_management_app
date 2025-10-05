/**
 * Reset Password Page
 * Allow users to reset their password with a token
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import Logo from '../components/ui/Logo';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setError('Invalid or missing reset token');
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, newPassword);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The reset link may have expired.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logoContainer}>
            <Logo size="large" />
          </div>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.title}>Password Reset Successfully!</h1>
            <p style={styles.subtitle}>
              Your password has been reset. You can now log in with your new password.
            </p>
            <p style={styles.redirectText}>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Back Button */}
        <div style={styles.headerContainer}>
          <button
            onClick={() => navigate('/login')}
            style={styles.backButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.neutral[200]}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ← Back to Login
          </button>
        </div>

        {/* Logo */}
        <div style={styles.logoContainer}>
          <Logo size="large" />
        </div>

        {/* Header */}
        <h1 style={styles.title}>Reset Your Password</h1>
        <p style={styles.subtitle}>Enter your new password below</p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter new password"
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent[500];
                e.target.style.boxShadow = `0 0 0 3px ${colors.accent[100]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border.default;
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={styles.hint}>Must be at least 8 characters long</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Confirm new password"
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
            disabled={loading || !token}
            style={{
              ...styles.button,
              opacity: (loading || !token) ? 0.7 : 1,
              cursor: (loading || !token) ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading && token) {
                e.target.style.backgroundColor = colors.accent[600];
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = shadows.lg;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && token) {
                e.target.style.backgroundColor = colors.accent[500];
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = shadows.md;
              }
            }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
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
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
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
  successContainer: {
    textAlign: 'center',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto',
    marginBottom: spacing[6],
    backgroundColor: colors.success[100],
    color: colors.success[600],
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
  },
  redirectText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing[6],
  },
};
