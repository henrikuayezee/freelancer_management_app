/**
 * Freelancer Projects Page
 * Browse and apply to available projects
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { freelancerPortalAPI } from '../services/api';

export default function FreelancerProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [canApply, setCanApply] = useState(false);
  const [hasActiveProject, setHasActiveProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await freelancerPortalAPI.getAvailableProjects();
      const data = response.data.data;
      setProjects(data.projects);
      setCanApply(data.canApply);
      setHasActiveProject(data.hasActiveProject);
    } catch (error) {
      alert('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (projectId) => {
    const message = prompt('Optional: Add a message with your application');

    setApplying(projectId);
    try {
      await freelancerPortalAPI.applyToProject(projectId, { message: message || '' });
      alert('Application submitted successfully!');
      await loadProjects(); // Reload to update list
    } catch (error) {
      alert('Failed to apply: ' + (error.response?.data?.message || error.message));
    } finally {
      setApplying(null);
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
        <h1 style={styles.title}>Available Projects</h1>
      </div>


      {/* Projects List */}
      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No projects available at this time</p>
          <p style={styles.emptySubtext}>Check back later for new opportunities</p>
        </div>
      ) : (
        <div style={styles.projectsGrid}>
          {projects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <div style={styles.projectHeader}>
                <h2 style={styles.projectName}>{project.name}</h2>
                <span style={styles.projectId}>{project.projectId}</span>
              </div>

              {project.description && <p style={styles.projectDescription}>{project.description}</p>}

              <div style={styles.projectDetails}>
                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>Vertical</label>
                  <p style={styles.detailValue}>{project.vertical || 'N/A'}</p>
                </div>

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>Annotation Required</label>
                  <p style={styles.detailValue}>{project.annotationRequired || 'N/A'}</p>
                </div>

                <div style={styles.detailRow}>
                  <label style={styles.detailLabel}>Freelancers Required</label>
                  <p style={styles.detailValue}>{project.freelancersRequired}</p>
                </div>

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
              </div>

              {/* Payment Rates */}
              <div style={styles.paymentSection}>
                <h3 style={styles.paymentTitle}>Payment Rates</h3>
                <div style={styles.paymentGrid}>
                  {project.paymentModel === 'HOURLY' && (
                    <>
                      {project.hourlyRateAnnotation && (
                        <div style={styles.rateItem}>
                          <label style={styles.rateLabel}>Hourly (Annotation)</label>
                          <p style={styles.rateValue}>${project.hourlyRateAnnotation}/hr</p>
                        </div>
                      )}
                      {project.hourlyRateReview && (
                        <div style={styles.rateItem}>
                          <label style={styles.rateLabel}>Hourly (Review)</label>
                          <p style={styles.rateValue}>${project.hourlyRateReview}/hr</p>
                        </div>
                      )}
                    </>
                  )}

                  {project.paymentModel === 'PER_ASSET' && (
                    <>
                      {project.perAssetRateAnnotation && (
                        <div style={styles.rateItem}>
                          <label style={styles.rateLabel}>Per Asset (Annotation)</label>
                          <p style={styles.rateValue}>${project.perAssetRateAnnotation}/asset</p>
                        </div>
                      )}
                      {project.perAssetRateReview && (
                        <div style={styles.rateItem}>
                          <label style={styles.rateLabel}>Per Asset (Review)</label>
                          <p style={styles.rateValue}>${project.perAssetRateReview}/asset</p>
                        </div>
                      )}
                      {project.expectedTimePerAsset && (
                        <div style={styles.rateItem}>
                          <label style={styles.rateLabel}>Expected Time</label>
                          <p style={styles.rateValue}>{project.expectedTimePerAsset} min/asset</p>
                        </div>
                      )}
                    </>
                  )}

                  {project.paymentModel === 'PER_OBJECT' && (
                    <>
                      {project.perObjectRateAnnotation && (
                        <div style={styles.rateItem}>
                          <label style={styles.rateLabel}>Per Object (Annotation)</label>
                          <p style={styles.rateValue}>${project.perObjectRateAnnotation}/object</p>
                        </div>
                      )}
                      {project.perObjectRateReview && (
                        <div style={styles.rateItem}>
                          <label style={styles.rateLabel}>Per Object (Review)</label>
                          <p style={styles.rateValue}>${project.perObjectRateReview}/object</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Performance Expectations */}
              <div style={styles.expectationsSection}>
                <h3 style={styles.expectationsTitle}>Performance Expectations</h3>
                <div style={styles.expectationsGrid}>
                  {project.accuracyPercentage && (
                    <div style={styles.expectationItem}>
                      <label style={styles.expectationLabel}>Accuracy</label>
                      <p style={styles.expectationValue}>{project.accuracyPercentage}%</p>
                    </div>
                  )}
                  {project.assetsPerDay && (
                    <div style={styles.expectationItem}>
                      <label style={styles.expectationLabel}>Assets/Day</label>
                      <p style={styles.expectationValue}>{project.assetsPerDay}</p>
                    </div>
                  )}
                  {project.hoursPerDay && (
                    <div style={styles.expectationItem}>
                      <label style={styles.expectationLabel}>Hours/Day</label>
                      <p style={styles.expectationValue}>{project.hoursPerDay}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => handleApply(project.id)}
                disabled={applying === project.id}
                style={{
                  ...styles.applyButton,
                  ...(applying === project.id && styles.applyButtonDisabled),
                }}
              >
                {applying === project.id ? 'Applying...' : 'Apply to Project'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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
  warning: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '60px 40px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: '14px',
    marginTop: '8px',
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
    marginBottom: '16px',
  },
  projectName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  projectId: {
    fontSize: '12px',
    color: '#6b7280',
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
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
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
  paymentSection: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  paymentTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  paymentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '8px',
  },
  rateItem: {
    backgroundColor: '#f9fafb',
    padding: '8px',
    borderRadius: '6px',
  },
  rateLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    display: 'block',
  },
  rateValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: '2px 0 0 0',
  },
  expectationsSection: {
    marginBottom: '20px',
  },
  expectationsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  expectationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  expectationItem: {
    backgroundColor: '#f9fafb',
    padding: '8px',
    borderRadius: '6px',
    textAlign: 'center',
  },
  expectationLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    display: 'block',
  },
  expectationValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '2px 0 0 0',
  },
  applyButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  applyButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
};