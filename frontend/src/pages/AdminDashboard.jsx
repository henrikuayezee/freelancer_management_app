/**
 * Admin Dashboard
 * Main admin interface for managing applications and freelancers
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { applicationsAPI, freelancersAPI } from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    } else {
      loadFreelancers();
    }
  }, [activeTab]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsAPI.getAll({ status: 'PENDING' });
      setApplications(response.data.data.applications);
    } catch (error) {
      console.error('Failed to load applications', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFreelancers = async () => {
    setLoading(true);
    try {
      const response = await freelancersAPI.getAll();
      setFreelancers(response.data.data.freelancers);
    } catch (error) {
      console.error('Failed to load freelancers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve this application?')) return;

    try {
      const response = await applicationsAPI.approve(id);
      alert(`Application approved! Temporary password: ${response.data.data.temporaryPassword}`);
      loadApplications();
      setSelectedApplication(null);
    } catch (error) {
      alert('Failed to approve application: ' + error.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await applicationsAPI.reject(id, reason);
      alert('Application rejected');
      loadApplications();
      setSelectedApplication(null);
    } catch (error) {
      alert('Failed to reject application');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Freelancer Management Platform</h1>
          <p style={styles.subtitle}>Welcome, {user?.email}</p>
        </div>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('applications')}
          style={{
            ...styles.tab,
            ...(activeTab === 'applications' ? styles.activeTab : {}),
          }}
        >
          Pending Applications
        </button>
        <button
          onClick={() => setActiveTab('freelancers')}
          style={{
            ...styles.tab,
            ...(activeTab === 'freelancers' ? styles.activeTab : {}),
          }}
        >
          All Freelancers
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : activeTab === 'applications' ? (
          <ApplicationsTab
            applications={applications}
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <FreelancersTab freelancers={freelancers} />
        )}
      </div>
    </div>
  );
}

function ApplicationsTab({ applications, selectedApplication, setSelectedApplication, onApprove, onReject }) {
  if (applications.length === 0) {
    return <div style={styles.empty}>No pending applications</div>;
  }

  if (selectedApplication) {
    const app = applications.find((a) => a.id === selectedApplication);
    return (
      <div>
        <button onClick={() => setSelectedApplication(null)} style={styles.backButton}>
          ← Back to list
        </button>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Application Details</h2>

          <div style={styles.detailSection}>
            <h3 style={styles.detailTitle}>Personal Information</h3>
            <div style={styles.detailGrid}>
              <DetailItem label="Name" value={`${app.firstName} ${app.lastName}`} />
              <DetailItem label="Email" value={app.email} />
              <DetailItem label="Phone" value={app.phone} />
              <DetailItem label="Location" value={`${app.city}, ${app.country}`} />
              {app.age && <DetailItem label="Age" value={app.age} />}
              {app.gender && <DetailItem label="Gender" value={app.gender} />}
            </div>
          </div>

          <div style={styles.detailSection}>
            <h3 style={styles.detailTitle}>Experience</h3>
            <div style={styles.detailGrid}>
              {app.yearsOfExperience && (
                <DetailItem label="Years of Experience" value={app.yearsOfExperience} />
              )}
              {app.previousCompanies && (
                <DetailItem label="Previous Companies" value={app.previousCompanies} />
              )}
            </div>
            {app.relevantExperience && (
              <div style={styles.detailFull}>
                <strong>Relevant Experience:</strong>
                <p style={styles.detailText}>{app.relevantExperience}</p>
              </div>
            )}
          </div>

          <div style={styles.detailSection}>
            <h3 style={styles.detailTitle}>Equipment & Setup</h3>
            <div style={styles.detailGrid}>
              <DetailItem label="Has Laptop" value={app.hasLaptop ? 'Yes' : 'No'} />
              <DetailItem label="Reliable Internet" value={app.hasReliableInternet ? 'Yes' : 'No'} />
              <DetailItem label="Remote Work" value={app.remoteWorkAvailable ? 'Yes' : 'No'} />
            </div>
          </div>

          <div style={styles.actions}>
            <button onClick={() => onApprove(app.id)} style={styles.approveButton}>
              ✓ Approve Application
            </button>
            <button onClick={() => onReject(app.id)} style={styles.rejectButton}>
              ✗ Reject Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.table}>
      <table style={styles.tableElement}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Experience</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} style={styles.tr}>
              <td style={styles.td}>
                {app.firstName} {app.lastName}
              </td>
              <td style={styles.td}>{app.email}</td>
              <td style={styles.td}>
                {app.city}, {app.country}
              </td>
              <td style={styles.td}>{app.yearsOfExperience || 'N/A'} years</td>
              <td style={styles.td}>{new Date(app.submittedAt).toLocaleDateString()}</td>
              <td style={styles.td}>
                <button onClick={() => setSelectedApplication(app.id)} style={styles.viewButton}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FreelancersTab({ freelancers }) {
  if (freelancers.length === 0) {
    return <div style={styles.empty}>No freelancers yet</div>;
  }

  return (
    <div style={styles.table}>
      <table style={styles.tableElement}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Tier</th>
            <th style={styles.th}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {freelancers.map((fl) => (
            <tr key={fl.id} style={styles.tr}>
              <td style={styles.td}>{fl.freelancerId}</td>
              <td style={styles.td}>
                {fl.firstName} {fl.lastName}
              </td>
              <td style={styles.td}>{fl.email}</td>
              <td style={styles.td}>
                {fl.city}, {fl.country}
              </td>
              <td style={styles.td}>
                <span style={getStatusBadgeStyle(fl.status)}>{fl.status}</span>
              </td>
              <td style={styles.td}>{fl.currentTier}</td>
              <td style={styles.td}>{fl.currentGrade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <strong style={styles.detailLabel}>{label}:</strong>
      <span style={styles.detailValue}> {value}</span>
    </div>
  );
}

function getStatusBadgeStyle(status) {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  };

  switch (status) {
    case 'ACTIVE':
      return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
    case 'ENGAGED':
      return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'INACTIVE':
      return { ...baseStyle, backgroundColor: '#e5e7eb', color: '#374151' };
    case 'DEACTIVATED':
      return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      return baseStyle;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 40px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tabs: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    padding: '0 40px',
  },
  tab: {
    padding: '16px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  content: {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#9ca3af',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tableElement: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#111827',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#111827',
  },
  detailSection: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#374151',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  detailFull: {
    marginTop: '16px',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: '14px',
    color: '#111827',
  },
  detailText: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
  },
  approveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  rejectButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};