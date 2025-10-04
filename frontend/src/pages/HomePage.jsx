/**
 * Home Page
 * Landing page with AyaData branding
 */

import { useNavigate } from 'react-router-dom';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import Logo from '../components/ui/Logo';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <Logo size="xlarge" />
          </div>
          <h1 style={styles.title}>Freelancer Management Platform</h1>
          <p style={styles.subtitle}>Streamline your data annotation team with powerful management tools</p>
        </div>

        {/* Main Actions */}
        <div style={styles.cardsContainer}>
          {/* Login Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.iconWrapper}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.accent[500]} strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>
            <h2 style={styles.cardTitle}>Sign In to Your Account</h2>
            <p style={styles.cardDescription}>
              Access your dashboard. Unified login for admins and freelancers.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={styles.primaryButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.accent[600];
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.accent[500];
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = shadows.md;
              }}
            >
              Sign In
            </button>
          </div>

          {/* Apply Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.iconWrapper}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.primary[500]} strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
            </div>
            <h2 style={styles.cardTitle}>Join as a Freelancer</h2>
            <p style={styles.cardDescription}>
              Apply to join our platform and start working on data annotation projects.
            </p>
            <button
              onClick={() => navigate('/apply')}
              style={styles.secondaryButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primary[500];
                e.target.style.color = colors.text.inverse;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.neutral[0];
                e.target.style.color = colors.primary[500];
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = shadows.md;
              }}
            >
              Apply Now
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div style={styles.featuresSection}>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.accent[500]} strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Performance Tracking</h3>
            <p style={styles.featureText}>Monitor quality, speed, and productivity metrics in real-time</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.accent[500]} strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 12h6"/>
                <path d="M12 9v6"/>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Project Management</h3>
            <p style={styles.featureText}>Assign tasks and manage workflows efficiently</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.accent[500]} strokeWidth="2">
                <path d="M12 2v20M2 12h20"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Payment Processing</h3>
            <p style={styles.featureText}>Automated payment calculations and tracking</p>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.background.secondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  content: {
    maxWidth: '1200px',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: spacing[16],
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  title: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
    lineHeight: typography.lineHeight.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
    maxWidth: '700px',
    margin: '0 auto',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: spacing[8],
    marginBottom: spacing[20],
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[10],
    border: `1px solid ${colors.border.default}`,
    boxShadow: shadows.md,
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    marginBottom: spacing[6],
  },
  iconWrapper: {
    width: '72px',
    height: '72px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  cardDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing[8],
    minHeight: '60px',
  },
  primaryButton: {
    width: '100%',
    padding: `${spacing[4]} ${spacing[6]}`,
    backgroundColor: colors.accent[500],
    color: colors.text.inverse,
    border: 'none',
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadows.md,
  },
  secondaryButton: {
    width: '100%',
    padding: `${spacing[4]} ${spacing[6]}`,
    backgroundColor: colors.neutral[0],
    color: colors.primary[500],
    border: `2px solid ${colors.primary[500]}`,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadows.md,
  },
  featuresSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: spacing[6],
    marginBottom: spacing[12],
  },
  featureCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[8],
    border: `1px solid ${colors.border.light}`,
    textAlign: 'center',
  },
  featureIconWrapper: {
    width: '56px',
    height: '56px',
    margin: '0 auto',
    marginBottom: spacing[5],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent[50],
    borderRadius: borderRadius.base,
  },
  featureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
  },
  footer: {
    textAlign: 'center',
    paddingTop: spacing[8],
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
};
