/**
 * Freelancer Dashboard
 * Main dashboard for freelancers to view their profile, projects, and performance
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { freelancerPortalAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function FreelancerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await freelancerPortalAPI.getDashboard();
      setDashboard(response.data.data);
    } catch (error) {
      alert('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!dashboard) {
    return <div style={styles.loading}>Dashboard not available</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Freelancer Portal</h1>
          <p style={styles.subtitle}>Welcome, {dashboard.profile.firstName} {dashboard.profile.lastName}</p>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/freelancer/projects')} style={styles.navButton}>
            Browse Projects
          </button>
          <button onClick={() => navigate('/freelancer/my-projects')} style={styles.navButton}>
            My Projects
          </button>
          <button onClick={() => navigate('/freelancer/performance')} style={styles.navButton}>
            Performance
          </button>
          <button onClick={() => navigate('/freelancer/payments')} style={styles.navButton}>
            Payments
          </button>
          <button onClick={() => navigate('/freelancer/profile')} style={styles.navButton}>
            Profile
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Profile Summary Card */}
      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div>
            <h2 style={styles.profileName}>
              {dashboard.profile.firstName} {dashboard.profile.lastName}
            </h2>
            <p style={styles.profileId}>{dashboard.profile.freelancerId}</p>
            <p style={styles.profileEmail}>{dashboard.profile.email}</p>
          </div>
          <div style={styles.badges}>
            <span style={getStatusBadge(dashboard.profile.status)}>{dashboard.profile.status}</span>
            <span style={getTierBadge(dashboard.profile.currentTier)}>{dashboard.profile.currentTier}</span>
            <span style={getGradeBadge(dashboard.profile.currentGrade)}>Grade {dashboard.profile.currentGrade}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <label style={styles.statLabel}>Active Projects</label>
          <p style={styles.statValue}>{dashboard.stats.activeProjects}</p>
        </div>
        <div style={styles.statCard}>
          <label style={styles.statLabel}>Total Projects</label>
          <p style={styles.statValue}>{dashboard.stats.totalProjects}</p>
        </div>
        <div style={styles.statCard}>
          <label style={styles.statLabel}>Average Performance</label>
          <p style={styles.statValue}>{dashboard.stats.avgPerformance}</p>
        </div>
        <div style={styles.statCard}>
          <label style={styles.statLabel}>Performance Records</label>
          <p style={styles.statValue}>{dashboard.stats.totalPerformanceRecords}</p>
        </div>
      </div>

      {/* Active Projects */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Active Projects</h2>
        {dashboard.activeProjects.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No active projects</p>
            <button onClick={() => navigate('/freelancer/projects')} style={styles.browseButton}>
              Browse Available Projects
            </button>
          </div>
        ) : (
          <div style={styles.projectsGrid}>
            {dashboard.activeProjects.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <h3 style={styles.projectName}>{project.name}</h3>
                <div style={styles.projectDetails}>
                  <InfoItem label="Role" value={project.role} />
                  <InfoItem label="Status" value={project.status} />
                  <InfoItem label="Start Date" value={new Date(project.startDate).toLocaleDateString()} />
                  {project.endDate && (
                    <InfoItem label="End Date" value={new Date(project.endDate).toLocaleDateString()} />
                  )}
                </div>
                <p style={styles.assignedDate}>
                  Assigned: {new Date(project.assignedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Performance */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Performance Records</h2>
        {dashboard.recentPerformance.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No performance records yet</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>COM Score</th>
                <th style={styles.th}>QUAL Score</th>
                <th style={styles.th}>Overall</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentPerformance.map((record) => (
                <tr key={record.id} style={styles.tableRow}>
                  <td style={styles.td}>{new Date(record.recordDate).toLocaleDateString()}</td>
                  <td style={styles.td}>{record.projectId || 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.comTotal)}>{record.comTotal?.toFixed(2) || 'N/A'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.qualTotal)}>{record.qualTotal?.toFixed(2) || 'N/A'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.overallScore)}>
                      {record.overallScore?.toFixed(2) || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={() => navigate('/freelancer/performance')} style={styles.viewAllButton}>
          View All Performance Records
        </button>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <label style={styles.infoLabel}>{label}</label>
      <p style={styles.infoValue}>{value || 'N/A'}</p>
    </div>
  );
}

function getStatusBadge(status) {
  const base = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  };
  switch (status) {
    case 'ACTIVE':
      return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
    case 'ENGAGED':
      return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'INACTIVE':
      return { ...base, backgroundColor: '#e5e7eb', color: '#374151' };
    case 'DEACTIVATED':
      return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      return base;
  }
}

function getTierBadge(tier) {
  const base = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  };
  switch (tier) {
    case 'PLATINUM':
      return { ...base, backgroundColor: '#e0e7ff', color: '#3730a3' };
    case 'GOLD':
      return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
    case 'SILVER':
      return { ...base, backgroundColor: '#f3f4f6', color: '#1f2937' };
    case 'BRONZE':
      return { ...base, backgroundColor: '#fed7aa', color: '#7c2d12' };
    default:
      return base;
  }
}

function getGradeBadge(grade) {
  return {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#f0fdf4',
    color: '#166534',
  };
}

function getScoreBadge(score) {
  const base = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
  };

  if (score === null || score === undefined) {
    return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }

  if (score >= 4) {
    return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
  } else if (score >= 3) {
    return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
  } else {
    return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {},
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  profileName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  profileId: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 4px 0',
  },
  profileEmail: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  section: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
  },
  browseButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  projectCard: {
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
  },
  projectName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
  },
  projectDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '8px',
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    display: 'block',
  },
  infoValue: {
    fontSize: '14px',
    color: '#111827',
    margin: '2px 0 0 0',
  },
  assignedDate: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#111827',
  },
  viewAllButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};