/**
 * Performance Page
 * Track and view performance records
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { performanceAPI, freelancersAPI, projectsAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function PerformancePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewMode = searchParams.get('view') || 'tracking';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await performanceAPI.getAll();
      setRecords(response.data.data.records);
    } catch (error) {
      console.error('Failed to load performance records', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {viewMode === 'reports' ? 'Performance Reports' : 'Performance Tracking'}
          </h1>
          <p style={styles.subtitle}>
            {viewMode === 'reports'
              ? 'View performance analytics and reports'
              : 'Track freelancer performance and evaluations'}
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={styles.createButton}>
          + Add Performance Record
        </button>
      </div>

      {/* Records Table */}
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : records.length === 0 ? (
        <div style={styles.empty}>No performance records yet</div>
      ) : (
        <div style={styles.table}>
          <table style={styles.tableElement}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Freelancer</th>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>COM Score</th>
                <th style={styles.th}>QUAL Score</th>
                <th style={styles.th}>Overall</th>
                <th style={styles.th}>Hours</th>
                <th style={styles.th}>Assets</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} style={styles.tr}>
                  <td style={styles.td}>{new Date(record.recordDate).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/admin/freelancers/${record.freelancer.id}`);
                      }}
                      style={styles.link}
                    >
                      {record.freelancer.firstName} {record.freelancer.middleName ? record.freelancer.middleName + ' ' : ''}{record.freelancer.lastName}
                    </a>
                  </td>
                  <td style={styles.td}>{record.project ? record.project.name : 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{record.recordType}</span>
                  </td>
                  <td style={styles.td}>{record.comTotal ? record.comTotal.toFixed(2) : 'N/A'}</td>
                  <td style={styles.td}>{record.qualTotal ? record.qualTotal.toFixed(2) : 'N/A'}</td>
                  <td style={styles.td}>
                    <strong style={getScoreColor(record.overallScore)}>
                      {record.overallScore ? record.overallScore.toFixed(2) : 'N/A'}
                    </strong>
                  </td>
                  <td style={styles.td}>{record.hoursWorked || 'N/A'}</td>
                  <td style={styles.td}>{record.assetsCompleted || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePerformanceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadRecords();
          }}
        />
      )}
    </AdminLayout>
  );
}

function CreatePerformanceModal({ onClose, onSuccess }) {
  const [freelancers, setFreelancers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    freelancerId: '',
    projectId: '',
    recordType: 'WEEKLY',
    recordDate: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    assetsCompleted: '',
    tasksCompleted: '',
    comResponsibility: '',
    comCommitment: '',
    comInitiative: '',
    comWillingness: '',
    comCommunication: '',
    qualSpeed: '',
    qualAccuracy: '',
    qualAttention: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [freelancersRes, projectsRes] = await Promise.all([
        freelancersAPI.getAll({ status: 'ACTIVE' }),
        projectsAPI.getAll({ status: 'ACTIVE' }),
      ]);
      setFreelancers(freelancersRes.data.data.freelancers);
      setProjects(projectsRes.data.data.projects);
    } catch (error) {
      console.error('Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await performanceAPI.create(formData);
      alert('Performance record created successfully!');
      onSuccess();
    } catch (error) {
      alert('Failed to create record: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Add Performance Record</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Freelancer *</label>
              <select
                value={formData.freelancerId}
                onChange={(e) => setFormData({ ...formData, freelancerId: e.target.value })}
                required
                style={styles.select}
              >
                <option value="">Select freelancer</option>
                {freelancers.map((fl) => (
                  <option key={fl.id} value={fl.id}>
                    {fl.freelancerId} - {fl.firstName} {fl.middleName ? fl.middleName + ' ' : ''}{fl.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                style={styles.select}
              >
                <option value="">Select project (optional)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectId} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Record Type *</label>
              <select
                value={formData.recordType}
                onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                required
                style={styles.select}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date *</label>
              <input
                type="date"
                value={formData.recordDate}
                onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                required
                style={styles.input}
              />
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Productivity Metrics</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Hours Worked</label>
              <input
                type="number"
                value={formData.hoursWorked}
                onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                step="0.1"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assets Completed</label>
              <input
                type="number"
                value={formData.assetsCompleted}
                onChange={(e) => setFormData({ ...formData, assetsCompleted: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tasks Completed</label>
              <input
                type="number"
                value={formData.tasksCompleted}
                onChange={(e) => setFormData({ ...formData, tasksCompleted: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          <h3 style={styles.sectionTitle}>COM Scores (Soft Skills) - 0 to 5</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Responsibility</label>
              <input
                type="number"
                value={formData.comResponsibility}
                onChange={(e) => setFormData({ ...formData, comResponsibility: e.target.value })}
                step="0.1"
                min="0"
                max="5"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Commitment</label>
              <input
                type="number"
                value={formData.comCommitment}
                onChange={(e) => setFormData({ ...formData, comCommitment: e.target.value })}
                step="0.1"
                min="0"
                max="5"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Initiative</label>
              <input
                type="number"
                value={formData.comInitiative}
                onChange={(e) => setFormData({ ...formData, comInitiative: e.target.value })}
                step="0.1"
                min="0"
                max="5"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Willingness</label>
              <input
                type="number"
                value={formData.comWillingness}
                onChange={(e) => setFormData({ ...formData, comWillingness: e.target.value })}
                step="0.1"
                min="0"
                max="5"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Communication</label>
              <input
                type="number"
                value={formData.comCommunication}
                onChange={(e) => setFormData({ ...formData, comCommunication: e.target.value })}
                step="0.1"
                min="0"
                max="5"
                style={styles.input}
              />
            </div>
          </div>

          <h3 style={styles.sectionTitle}>QUAL Scores (Quality) - 0 to 5</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Speed</label>
              <input
                type="number"
                value={formData.qualSpeed}
                onChange={(e) => setFormData({ ...formData, qualSpeed: e.target.value })}
                step="0.1"
                min="0"
                max="5"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Accuracy</label>
              <input
                type="number"
                value={formData.qualAccuracy}
                onChange={(e) => setFormData({ ...formData, qualAccuracy: e.target.value })}
                step="0.1"
                min="0"
                max="5"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Attention to Detail</label>
              <input
                type="number"
                value={formData.qualAttention}
                onChange={(e) => setFormData({ ...formData, qualAttention: e.target.value })}
                step="0.1"
                min="0"
                max="5"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.submitButton}>
              {saving ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getScoreColor(score) {
  if (!score) return {};
  if (score >= 4) return { color: '#10b981' };
  if (score >= 3) return { color: '#f59e0b' };
  return { color: '#ef4444' };
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
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
  badge: {
    padding: '4px 8px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
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
    maxWidth: '900px',
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
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '24px',
    marginBottom: '16px',
    color: '#374151',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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