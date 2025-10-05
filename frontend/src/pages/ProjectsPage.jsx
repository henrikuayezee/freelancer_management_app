/**
 * Projects Page
 * Lists all projects with filtering and search
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: statusFilter,
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, status: statusFilter }));
  }, [statusFilter]);

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      const response = await projectsAPI.getAll(params);
      setProjects(response.data.data.projects);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRow = (projectId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Projects</h1>
          <p style={styles.subtitle}>Manage annotation projects and assignments</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={styles.createButton}>
          + Create Project
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filterPanel}>
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <div style={styles.resultCount}>
          {projects.length} project{projects.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Projects Table */}
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : projects.length === 0 ? (
        <div style={styles.empty}>No projects found</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Project ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Applications</th>
              <th style={styles.th}>Assigned</th>
              <th style={styles.th}>Required</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                isExpanded={expandedRows.has(project.id)}
                onToggle={() => toggleRow(project.id)}
                onView={() => navigate(`/admin/projects/${project.id}`)}
              />
            ))}
          </tbody>
        </table>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadProjects();
          }}
        />
      )}
    </AdminLayout>
  );
}

function ProjectRow({ project, isExpanded, onToggle, onView }) {
  return (
    <>
      <tr style={styles.tableRow} onClick={onToggle}>
        <td style={styles.td}>{project.projectId}</td>
        <td style={styles.td}><strong>{project.name}</strong></td>
        <td style={styles.td}>
          <span style={getStatusBadgeStyle(project.status)}>{project.status}</span>
        </td>
        <td style={styles.td}>{project._count?.applications || 0}</td>
        <td style={styles.td}>{project._count?.assignments || 0}</td>
        <td style={styles.td}>{project.freelancersRequired}</td>
        <td style={styles.td}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            style={styles.viewButton}
          >
            View Details
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr style={styles.expandedRow}>
          <td colSpan="7" style={styles.expandedContent}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Project Information</h4>
                {project.vertical && (
                  <div style={styles.detailItem}>
                    <strong>Vertical:</strong> {project.vertical}
                  </div>
                )}
                {project.annotationRequired && (
                  <div style={styles.detailItem}>
                    <strong>Annotation Required:</strong> {project.annotationRequired}
                  </div>
                )}
                {project.description && (
                  <div style={styles.detailItem}>
                    <strong>Description:</strong> {project.description}
                  </div>
                )}
              </div>
              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Timeline</h4>
                <div style={styles.detailItem}>
                  <strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                </div>
                <div style={styles.detailItem}>
                  <strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Payment</h4>
                <div style={styles.detailItem}>
                  <strong>Payment Model:</strong> {project.paymentModel}
                </div>
                {project.hourlyRateAnnotation && (
                  <div style={styles.detailItem}>
                    <strong>Hourly Rate (Annotation):</strong> ${project.hourlyRateAnnotation}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CreateProjectModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    vertical: '',
    annotationRequired: '',
    description: '',
    freelancersRequired: '',
    startDate: '',
    endDate: '',
    paymentModel: 'HOURLY',
    hourlyRateAnnotation: '',
    hourlyRateReview: '',
    perAssetRateAnnotation: '',
    perAssetRateReview: '',
    expectedTimePerAsset: '',
    perObjectRateAnnotation: '',
    perObjectRateReview: '',
    accuracyPercentage: '90',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await projectsAPI.create(formData);
      alert('Project created successfully!');
      onSuccess();
    } catch (error) {
      alert('Failed to create project: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create New Project</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Vertical</label>
              <input
                type="text"
                value={formData.vertical}
                onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                placeholder="e.g., Computer Vision"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Annotation Type</label>
              <input
                type="text"
                value={formData.annotationRequired}
                onChange={(e) => setFormData({ ...formData, annotationRequired: e.target.value })}
                placeholder="e.g., Bounding Box"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Freelancers Required *</label>
              <input
                type="number"
                value={formData.freelancersRequired}
                onChange={(e) => setFormData({ ...formData, freelancersRequired: e.target.value })}
                required
                min="1"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Model *</label>
            <select
              value={formData.paymentModel}
              onChange={(e) => setFormData({ ...formData, paymentModel: e.target.value })}
              required
              style={styles.select}
            >
              <option value="HOURLY">Hourly</option>
              <option value="PER_ASSET">Per Asset</option>
              <option value="PER_OBJECT">Per Object</option>
            </select>
          </div>

          {/* Hourly Rate Fields */}
          {formData.paymentModel === 'HOURLY' && (
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hourly Rate - Annotation ($)</label>
                <input
                  type="number"
                  value={formData.hourlyRateAnnotation}
                  onChange={(e) => setFormData({ ...formData, hourlyRateAnnotation: e.target.value })}
                  step="0.01"
                  placeholder="e.g., 15.00"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Hourly Rate - Review ($)</label>
                <input
                  type="number"
                  value={formData.hourlyRateReview}
                  onChange={(e) => setFormData({ ...formData, hourlyRateReview: e.target.value })}
                  step="0.01"
                  placeholder="e.g., 12.00"
                  style={styles.input}
                />
              </div>
            </div>
          )}

          {/* Per Asset Rate Fields */}
          {formData.paymentModel === 'PER_ASSET' && (
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rate for Annotation ($)</label>
                <input
                  type="number"
                  value={formData.perAssetRateAnnotation}
                  onChange={(e) => setFormData({ ...formData, perAssetRateAnnotation: e.target.value })}
                  step="0.01"
                  placeholder="e.g., 0.50"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Rate for Review ($)</label>
                <input
                  type="number"
                  value={formData.perAssetRateReview}
                  onChange={(e) => setFormData({ ...formData, perAssetRateReview: e.target.value })}
                  step="0.01"
                  placeholder="e.g., 0.30"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Expected Time per Asset (min)</label>
                <input
                  type="number"
                  value={formData.expectedTimePerAsset}
                  onChange={(e) => setFormData({ ...formData, expectedTimePerAsset: e.target.value })}
                  step="0.1"
                  placeholder="e.g., 5.0"
                  style={styles.input}
                />
              </div>
            </div>
          )}

          {/* Per Object Rate Fields */}
          {formData.paymentModel === 'PER_OBJECT' && (
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rate per Object - Annotation ($)</label>
                <input
                  type="number"
                  value={formData.perObjectRateAnnotation}
                  onChange={(e) => setFormData({ ...formData, perObjectRateAnnotation: e.target.value })}
                  step="0.01"
                  placeholder="e.g., 0.10"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Rate per Object - Review ($)</label>
                <input
                  type="number"
                  value={formData.perObjectRateReview}
                  onChange={(e) => setFormData({ ...formData, perObjectRateReview: e.target.value })}
                  step="0.01"
                  placeholder="e.g., 0.05"
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Accuracy Target (%)</label>
              <input
                type="number"
                value={formData.accuracyPercentage}
                onChange={(e) => setFormData({ ...formData, accuracyPercentage: e.target.value })}
                min="0"
                max="100"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.submitButton}>
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
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
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  filterPanel: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  searchInput: {
    flex: '2',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
  },
  filterSelect: {
    flex: '1',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  resultCount: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 'auto',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
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
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#374151',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  expandedRow: {
    backgroundColor: '#f9fafb',
  },
  expandedContent: {
    padding: '24px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  detailSection: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '6px',
  },
  detailTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e7eb',
  },
  detailItem: {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '8px',
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
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
};