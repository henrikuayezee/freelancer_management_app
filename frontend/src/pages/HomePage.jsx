/**
 * Home Page
 * Landing page with options for admin and freelancer login/registration
 */

import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Freelancer Management Platform</h1>
          <p style={styles.subtitle}>Manage your data annotation freelancers efficiently</p>
        </div>

        {/* Login Options */}
        <div style={styles.cardsContainer}>
          {/* Admin Login Card */}
          <div style={styles.card}>
            <div style={styles.cardIcon}>👨‍💼</div>
            <h2 style={styles.cardTitle}>Admin Portal</h2>
            <p style={styles.cardDescription}>
              Manage freelancers, projects, performance tracking, and tiering system
            </p>
            <button onClick={() => navigate('/login?type=admin')} style={styles.primaryButton}>
              Admin Login
            </button>
          </div>

          {/* Freelancer Card */}
          <div style={styles.card}>
            <div style={styles.cardIcon}>👤</div>
            <h2 style={styles.cardTitle}>Freelancer Portal</h2>
            <p style={styles.cardDescription}>
              Access your profile, view projects, apply for opportunities, and track your performance
            </p>
            <div style={styles.buttonGroup}>
              <button onClick={() => navigate('/login?type=freelancer')} style={styles.primaryButton}>
                Freelancer Login
              </button>
              <button onClick={() => navigate('/apply')} style={styles.secondaryButton}>
                Register as Freelancer
              </button>
            </div>
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
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  content: {
    maxWidth: '1000px',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px',
    marginBottom: '48px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  cardIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '24px',
    minHeight: '60px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#2563eb',
    border: '2px solid #2563eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  footer: {
    textAlign: 'center',
  },
  footerText: {
    fontSize: '14px',
    color: '#9ca3af',
  },
};