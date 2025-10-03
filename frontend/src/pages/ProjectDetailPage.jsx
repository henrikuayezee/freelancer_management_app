/**
 * Project Detail Page
 * Shows project details with freelancer assignments
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, freelancersAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const response = await projectsAPI.getById(id);
      const projectData = response.data.data;
      setProject(projectData);
      setEditFormData({
        status: projectData.status || 'DRAFT',
        openForApplications: projectData.openForApplications || false,
      });
    } catch (error) {
      console.error('Failed to load project', error);
      alert('Failed to load project');
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFreelancer = async (freelancerId) => {
    if (!confirm('Are you sure you want to remove this freelancer from the project?')) return;

    try {
      await projectsAPI.removeFreelancer(id, freelancerId);
      alert('Freelancer removed successfully');
      loadProject();
    } catch (error) {
      alert('Failed to remove freelancer');
    }
  };

  const handleUpdateProject = async () => {
    try {
      await projectsAPI.update(id, editFormData);
      alert('Project updated successfully!');
      setEditing(false);
      loadProject();
    } catch (error) {
      alert('Failed to update project: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!project) {
    return <div style={styles.loading}>Project not found</div>;
  }

  return (
    <AdminLayout>
      {/* Header */}
      <button onClick={() => navigate('/admin/projects')} style={styles.backButton}>
        ← Back to Projects
      </button>

      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={styles.title}>{project.name}</h1>
            <span style={getStatusBadgeStyle(project.status)}>{project.status}</span>
            {project.openForApplications && (
              <span style={styles.openBadge}>Open for Applications</span>
            )}
          </div>
          <p style={styles.projectId}>{project.projectId}</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} style={styles.editButton}>
            Edit Status
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleUpdateProject} style={styles.saveButton}>
              Save Changes
            </button>
            <button onClick={() => setEditing(false)} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Edit Form */}
      {editing && (
        <div style={styles.editSection}>
          <h3 style={styles.editTitle}>Update Project Status</h3>
          <div style={styles.editForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                style={styles.select}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_HOLD">ON_HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editFormData.openForApplications}
                  onChange={(e) => setEditFormData({ ...editFormData, openForApplications: e.target.checked })}
                  style={styles.checkbox}
                />
                <span>Open for Freelancer Applications</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Project Details */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Project Details</h2>
        <div style={styles.detailsGrid}>
          {project.vertical && (
            <div style={styles.detailItem}>
              <strong>Vertical:</strong> {project.vertical}
            </div>
          )}
          {project.annotationRequired && (
            <div style={styles.detailItem}>
              <strong>Annotation Type:</strong> {project.annotationRequired}
            </div>
          )}
          <div style={styles.detailItem}>
            <strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}
          </div>
          {project.endDate && (
            <div style={styles.detailItem}>
              <strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}
            </div>
          )}
          <div style={styles.detailItem}>
            <strong>Freelancers Required:</strong> {project.freelancersRequired}
          </div>
          <div style={styles.detailItem}>
            <strong>Currently Assigned:</strong> {project.assignments.length}
          </div>
          <div style={styles.detailItem}>
            <strong>Accuracy Target:</strong> {project.accuracyPercentage}%
          </div>
          <div style={styles.detailItem}>
            <strong>Payment Model:</strong> {project.paymentModel}
          </div>
          {project.hourlyRateAnnotation && (
            <div style={styles.detailItem}>
              <strong>Hourly Rate (Annotation):</strong> ${project.hourlyRateAnnotation}/hr
            </div>
          )}
          {project.hourlyRateReview && (
            <div style={styles.detailItem}>
              <strong>Hourly Rate (Review):</strong> ${project.hourlyRateReview}/hr
            </div>
          )}
          {project.perAssetRateAnnotation && (
            <div style={styles.detailItem}>
              <strong>Per Asset (Annotation):</strong> ${project.perAssetRateAnnotation}/asset
            </div>
          )}
          {project.perAssetRateReview && (
            <div style={styles.detailItem}>
              <strong>Per Asset (Review):</strong> ${project.perAssetRateReview}/asset
            </div>
          )}
          {project.expectedTimePerAsset && (
            <div style={styles.detailItem}>
              <strong>Expected Time per Asset:</strong> {project.expectedTimePerAsset} min
            </div>
          )}
          {project.perObjectRateAnnotation && (
            <div style={styles.detailItem}>
              <strong>Per Object (Annotation):</strong> ${project.perObjectRateAnnotation}/object
            </div>
          )}
          {project.perObjectRateReview && (
            <div style={styles.detailItem}>
              <strong>Per Object (Review):</strong> ${project.perObjectRateReview}/object
            </div>
          )}
        </div>

        {project.description && (
          <div style={styles.descriptionSection}>
            <strong>Description:</strong>
            <p style={styles.description}>{project.description}</p>
          </div>
        )}
      </div>

      {/* Assignments */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Assigned Freelancers ({project.assignments.length})</h2>
          <button onClick={() => setShowAssignModal(true)} style={styles.assignButton}>
            + Assign Freelancer
          </button>
        </div>

        {project.assignments.length === 0 ? (
          <div style={styles.empty}>No freelancers assigned yet</div>
        ) : (
          <div style={styles.table}>
            <table style={styles.tableElement}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Tier</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Start Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.assignments.map((assignment) => (
                  <tr key={assignment.id} style={styles.tr}>
                    <td style={styles.td}>{assignment.freelancer.freelancerId}</td>
                    <td style={styles.td}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/admin/freelancers/${assignment.freelancer.id}`);
                        }}
                        style={styles.link}
                      >
                        {assignment.freelancer.firstName} {assignment.freelancer.lastName}
                      </a>
                    </td>
                    <td style={styles.td}>{assignment.freelancer.email}</td>
                    <td style={styles.td}>{assignment.freelancer.currentTier}</td>
                    <td style={styles.td}>{assignment.freelancer.currentGrade}</td>
                    <td style={styles.td}>{new Date(assignment.startDate).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <span style={getStatusBadgeStyle(assignment.status)}>{assignment.status}</span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleRemoveFreelancer(assignment.freelancer.id)}
                        style={styles.removeButton}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignFreelancerModal
          projectId={id}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            loadProject();
          }}
        />
      )}
    </AdminLayout>
  );
}

function AssignFreelancerModal({ projectId, onClose, onSuccess }) {
  const [freelancers, setFreelancers] = useState([]);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    try {
      const response = await freelancersAPI.getAll({ status: 'ACTIVE' });
      setFreelancers(response.data.data.freelancers);
    } catch (error) {
      console.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await projectsAPI.assignFreelancer(projectId, {
        freelancerId: selectedFreelancerId,
        startDate,
      });
      alert('Freelancer assigned successfully!');
      onSuccess();
    } catch (error) {
      alert('Failed to assign freelancer: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Assign Freelancer</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {loading ? (
            <div style={styles.loading}>Loading freelancers...</div>
          ) : (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Freelancer *</label>
                <select
                  value={selectedFreelancerId}
                  onChange={(e) => setSelectedFreelancerId(e.target.value)}
                  required
                  style={styles.select}
                >
                  <option value="">Select a freelancer</option>
                  {freelancers.map((fl) => (
                    <option key={fl.id} value={fl.id}>
                      {fl.freelancerId} - {fl.firstName} {fl.lastName} ({fl.currentTier} - {fl.currentGrade})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={onClose} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={styles.submitButton}>
                  {saving ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
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
    case 'DRAFT':
      return { ...baseStyle, backgroundColor: '#e5e7eb', color: '#374151' };
    case 'COMPLETED':
      return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'ON_HOLD':
      return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
    case 'CANCELLED':
      return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      return baseStyle;
  }
}

const styles = {
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  projectId: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 20px 0',
    color: '#111827',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  detailItem: {
    fontSize: '14px',
    color: '#374151',
  },
  descriptionSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },
  description: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
  },
  assignButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#9ca3af',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
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
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
  removeButton: {
    padding: '6px 12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#6b7280',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
  },
  form: {
    padding: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  submitButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  openBadge: {
    padding: '4px 12px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  editSection: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '2px solid #2563eb',
  },
  editTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  editForm: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-end',
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
};