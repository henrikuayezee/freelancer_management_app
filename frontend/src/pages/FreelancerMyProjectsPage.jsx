/**
 * Freelancer My Projects Page
 * View assigned and applied projects
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { freelancerPortalAPI } from '../services/api';

export default function FreelancerMyProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await freelancerPortalAPI.getMyProjects();
      setProjects(response.data.data);
    } catch (error) {
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/freelancer')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>My Projects</h1>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <p>You haven't been assigned to any projects yet</p>
          <button onClick={() => navigate('/freelancer/projects')} style={styles.browseButton}>
            Browse Available Projects
          </button>
        </div>
      ) : (
        <div style={styles.projectsGrid}>
          {projects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <div style={styles.projectHeader}>
                <div>
                  <h2 style={styles.projectName}>{project.name}</h2>
                  <p style={styles.projectRole}>Role: {project.role}</p>
                </div>
                <span style={getStatusBadge(project.status)}>{project.status}</span>
              </div>

              {project.description && <p style={styles.projectDescription}>{project.description}</p>}

              <div style={styles.projectDetails}>
                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>Start Date</label>
                  <p style={styles.detailValue}>{new Date(project.startDate).toLocaleDateString()}</p>
                </div>

                {project.endDate && (
                  <div style={styles.detailRow}>
                    <label style={styles.detailLabel}>End Date</label>
                    <p style={styles.detailValue}>{new Date(project.endDate).toLocaleDateString()}</p>
                  </div>
                )}

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>Payment Model</label>
                  <p style={styles.detailValue}>{project.paymentModel}</p>
                </div>

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>Assigned On</label>
                  <p style={styles.detailValue}>{new Date(project.assignedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {project.role === 'PENDING' && (
                <div style={styles.pendingNotice}>
                  <p>⏳ Your application is pending review by the admin.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status) {
  const base = {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  };

  switch (status) {
    case 'ACTIVE':
      return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
    case 'COMPLETED':
      return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'ON_HOLD':
      return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
    case 'CANCELLED':
      return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
    case 'DRAFT':
      return { ...base, backgroundColor: '#e5e7eb', color: '#374151' };
    default:
      return base;
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
    minHeight: '400px',
    fontSize: '18px',
    color: '#6b7280',
  },
  header: {
    marginBottom: '24px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '60px 40px',
    borderRadius: '12px',
    textAlign: 'center',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px',
  },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  projectName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  projectRole: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  projectDescription: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  projectDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  detailRow: {},
  detailLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '2px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#111827',
    margin: 0,
  },
  pendingNotice: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#92400e',
  },
};