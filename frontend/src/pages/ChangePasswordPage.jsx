/**
 * Change Password Page
 * For first-time login password change (mustChangePassword)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import Logo from '../components/ui/Logo';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(currentPassword, newPassword);

      // Update user context to clear mustChangePassword flag
      if (updateUser) {
        updateUser({ ...user, mustChangePassword: false });
      }

      // Redirect based on role
      if (user?.role === 'FREELANCER') {
        navigate('/freelancer');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <Logo size="large" />
        </div>

        {/* Header */}
        <div style={styles.alertBox}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.warning[600]} strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <h3 style={styles.alertTitle}>Password Change Required</h3>
            <p style={styles.alertText}>
              For security reasons, you must change your password before continuing.
            </p>
          </div>
        </div>

        <h1 style={styles.title}>Change Your Password</h1>
        <p style={styles.subtitle}>Create a new secure password for your account</p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your current password"
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
            {loading ? 'Changing Password...' : 'Change Password'}
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
    maxWidth: '540px',
    width: '100%',
    border: `1px solid ${colors.border.light}`,
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  alertBox: {
    display: 'flex',
    gap: spacing[4],
    padding: spacing[5],
    backgroundColor: colors.warning[50],
    border: `1px solid ${colors.warning[200]}`,
    borderRadius: borderRadius.base,
    marginBottom: spacing[8],
  },
  alertTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning[800],
    margin: 0,
    marginBottom: spacing[1],
  },
  alertText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning[700],
    margin: 0,
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
};
