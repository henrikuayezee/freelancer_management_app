/**
 * Users Management Page
 * Manage user accounts, roles, and access levels
 */

import { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ConfirmationModal from '../components/ConfirmationModal';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', isActive: '', search: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: null,
    requireInput: false,
    inputLabel: '',
    inputPlaceholder: '',
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const cleanFilter = {};
      if (filter.role) cleanFilter.role = filter.role;
      if (filter.isActive) cleanFilter.isActive = filter.isActive;
      if (filter.search) cleanFilter.search = filter.search;

      const [usersRes, statsRes] = await Promise.all([
        usersAPI.getAll(cleanFilter),
        usersAPI.getStats(),
      ]);
      setUsers(usersRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      await authAPI.registerAdmin(createFormData);
      alert('Admin account created successfully!');
      setShowCreateModal(false);
      setCreateFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        department: '',
      });
      loadData();
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Failed to create admin account');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRoleChange = (userId, newRole, userName, currentRole) => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Change User Role',
      message: `Are you sure you want to change ${userName}'s role from ${currentRole} to ${newRole}? This will affect their access permissions.`,
      onConfirm: async () => {
        try {
          await usersAPI.updateRole(userId, { role: newRole });
          alert('Role updated successfully!');
          loadData();
        } catch (error) {
          alert('Failed to update role: ' + (error.response?.data?.message || error.message));
        }
      },
      requireInput: false,
    });
  };

  const handleToggleActive = (userId, userName, isActive) => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: isActive ? 'Deactivate User' : 'Activate User',
      message: isActive
        ? `Are you sure you want to deactivate ${userName}? They will no longer be able to access the system.`
        : `Are you sure you want to activate ${userName}? They will be able to access the system again.`,
      onConfirm: async () => {
        try {
          await usersAPI.toggleActive(userId);
          alert('User status updated successfully!');
          loadData();
        } catch (error) {
          alert('Failed to update status: ' + (error.response?.data?.message || error.message));
        }
      },
      requireInput: false,
    });
  };

  const handleDelete = (userId, userName, userEmail) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${userName} (${userEmail})? This will remove all their data and cannot be undone.`,
      onConfirm: async () => {
        try {
          await usersAPI.delete(userId);
          alert('User deleted successfully!');
          loadData();
        } catch (error) {
          alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
        }
      },
      requireInput: false,
    });
  };

  const handleResetPassword = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Reset Password',
      message: `Are you sure you want to generate a new password for ${userName}? Their current password will no longer work.`,
      onConfirm: async () => {
        try {
          const response = await usersAPI.resetPassword(userId, {});
          const { email, temporaryPassword } = response.data.data;
          alert(`Password reset successfully!\n\nEmail: ${email}\nTemporary Password: ${temporaryPassword}\n\nPlease share this with the user securely.`);
        } catch (error) {
          alert('Failed to reset password: ' + (error.response?.data?.message || error.message));
        }
      },
      requireInput: false,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={styles.loading}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>User Management</h1>
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            + Create Admin Account
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={styles.statsGrid}>
            <Card padding="medium">
              <label style={styles.statLabel}>Total Users</label>
              <p style={styles.statValue}>{stats.total}</p>
            </Card>
            <Card padding="medium">
              <label style={styles.statLabel}>Active</label>
              <p style={{ ...styles.statValue, color: colors.success[600] }}>{stats.active}</p>
            </Card>
            <Card padding="medium">
              <label style={styles.statLabel}>Inactive</label>
              <p style={{ ...styles.statValue, color: colors.error[600] }}>{stats.inactive}</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Search by email..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            style={styles.searchInput}
          />
          <select
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            style={styles.select}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="FREELANCER">Freelancer</option>
            <option value="TRAINING_LEAD">Training Lead</option>
            <option value="QA">QA</option>
            <option value="FINANCE">Finance</option>
          </select>
          <select
            value={filter.isActive}
            onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
            style={styles.select}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Users Table */}
        <Card padding="small">
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userName = user.freelancer
                    ? `${user.freelancer.firstName}${user.freelancer.middleName ? ' ' + user.freelancer.middleName : ''} ${user.freelancer.lastName}`
                    : user.adminProfile
                    ? `${user.adminProfile.firstName} ${user.adminProfile.lastName}`
                    : 'N/A';

                  return (
                  <tr key={user.id} style={styles.tableRow}>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      {userName}
                      {user.freelancer && (
                        <div style={styles.freelancerId}>{user.freelancer.freelancerId}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <select
                        value={user.role}
                        onChange={(e) => {
                          if (e.target.value !== user.role) {
                            handleRoleChange(user.id, e.target.value, userName, user.role);
                          }
                        }}
                        style={styles.roleSelect}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="PROJECT_MANAGER">Project Manager</option>
                        <option value="FREELANCER">Freelancer</option>
                        <option value="TRAINING_LEAD">Training Lead</option>
                        <option value="QA">QA</option>
                        <option value="FINANCE">Finance</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <Badge variant={user.isActive ? 'success' : 'error'} size="small">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleToggleActive(user.id, userName, user.isActive)}
                          style={styles.actionButton}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? '🔒' : '🔓'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id, userName)}
                          style={styles.actionButton}
                          title="Reset Password"
                        >
                          🔑
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, userName, user.email)}
                          style={styles.deleteButton}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <div style={styles.emptyState}>
                <p>No users found</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create Admin Account</h2>
              <button onClick={() => setShowCreateModal(false)} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} style={styles.form}>
              {createError && <div style={styles.error}>{createError}</div>}

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name *</label>
                  <input
                    type="text"
                    value={createFormData.firstName}
                    onChange={(e) => setCreateFormData({ ...createFormData, firstName: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name *</label>
                  <input
                    type="text"
                    value={createFormData.lastName}
                    onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="admin@ayadata.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password *</label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  style={styles.input}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input
                  type="text"
                  value={createFormData.department}
                  onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Operations, HR, Finance"
                />
              </div>

              <div style={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.type === 'danger' ? 'Delete' : confirmModal.type === 'warning' ? 'Confirm' : 'Reset'}
        type={confirmModal.type}
        requireInput={confirmModal.requireInput}
        inputLabel={confirmModal.inputLabel}
        inputPlaceholder={confirmModal.inputPlaceholder}
      />
    </AdminLayout>
  );
}

const styles = {
  container: {
    padding: '0',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: spacing[4],
    marginBottom: spacing[6],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: spacing[2],
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  filters: {
    display: 'flex',
    gap: spacing[3],
    marginBottom: spacing[6],
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '250px',
    padding: spacing[3],
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  select: {
    padding: spacing[3],
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    backgroundColor: colors.background.primary,
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: typography.fontFamily.base,
  },
  th: {
    padding: spacing[3],
    textAlign: 'left',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    borderBottom: `2px solid ${colors.border.default}`,
    backgroundColor: colors.background.secondary,
  },
  tableRow: {
    borderBottom: `1px solid ${colors.border.light}`,
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: spacing[3],
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  freelancerId: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  roleSelect: {
    padding: spacing[2],
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.sm,
    backgroundColor: colors.background.primary,
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: spacing[2],
  },
  actionButton: {
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: colors.accent[50],
    border: `1px solid ${colors.accent[200]}`,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    fontSize: typography.fontSize.base,
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: colors.error[50],
    border: `1px solid ${colors.error[200]}`,
    borderRadius: borderRadius.sm,
    cursor: 'pointer',
    fontSize: typography.fontSize.base,
    transition: 'all 0.2s ease',
  },
  emptyState: {
    padding: spacing[10],
    textAlign: 'center',
    color: colors.text.secondary,
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: spacing[4],
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[6],
    borderBottom: `1px solid ${colors.border.default}`,
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: typography.fontSize['2xl'],
    cursor: 'pointer',
    color: colors.text.secondary,
    padding: spacing[2],
    lineHeight: 1,
  },
  form: {
    padding: spacing[6],
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing[4],
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
    padding: spacing[3],
    border: `1px solid ${colors.border.default}`,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.base,
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  error: {
    padding: spacing[3],
    backgroundColor: colors.error[50],
    color: colors.error[700],
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    border: `1px solid ${colors.error[200]}`,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing[3],
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTop: `1px solid ${colors.border.default}`,
  },
};
