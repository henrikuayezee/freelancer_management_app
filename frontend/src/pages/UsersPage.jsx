/**
 * Users Management Page
 * Manage user accounts, roles, and access levels
 */

import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', isActive: '', search: '' });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Filter out empty string values
      const cleanFilter = {};
      if (filter.role) cleanFilter.role = filter.role;
      if (filter.isActive) cleanFilter.isActive = filter.isActive;
      if (filter.search) cleanFilter.search = filter.search;

      const [usersRes, statsRes] = await Promise.all([
        usersAPI.getAll(cleanFilter),
        usersAPI.getStats(),
      ]);
      console.log('Users response:', usersRes.data);
      console.log('Stats response:', statsRes.data);
      setUsers(usersRes.data.data);
      setStats(statsRes.data.data);
      console.log('Users state after setting:', usersRes.data.data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;

    try {
      await usersAPI.updateRole(userId, { role: newRole });
      alert('Role updated successfully!');
      loadData();
    } catch (error) {
      alert('Failed to update role: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await usersAPI.toggleActive(userId);
      alert('User status updated successfully!');
      loadData();
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await usersAPI.delete(userId);
      alert('User deleted successfully!');
      loadData();
    } catch (error) {
      alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Generate a new password for this user?')) return;

    try {
      const response = await usersAPI.resetPassword(userId, {});
      const { email, temporaryPassword } = response.data.data;
      alert(`Password reset successfully!\n\nEmail: ${email}\nTemporary Password: ${temporaryPassword}\n\nPlease share this with the user securely.`);
    } catch (error) {
      alert('Failed to reset password: ' + (error.response?.data?.message || error.message));
    }
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
        <h1 style={styles.title}>User Management</h1>

        {/* Stats Cards */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <label style={styles.statLabel}>Total Users</label>
              <p style={styles.statValue}>{stats.total}</p>
            </div>
            <div style={styles.statCard}>
              <label style={styles.statLabel}>Active</label>
              <p style={{ ...styles.statValue, color: '#10b981' }}>{stats.active}</p>
            </div>
            <div style={styles.statCard}>
              <label style={styles.statLabel}>Inactive</label>
              <p style={{ ...styles.statValue, color: '#ef4444' }}>{stats.inactive}</p>
            </div>
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
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tableRow}>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    {user.freelancer
                      ? `${user.freelancer.firstName} ${user.freelancer.lastName}`
                      : user.adminProfile
                      ? `${user.adminProfile.firstName} ${user.adminProfile.lastName}`
                      : 'N/A'}
                    {user.freelancer && (
                      <div style={styles.freelancerId}>{user.freelancer.freelancerId}</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
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
                    <span style={user.isActive ? styles.activeBadge : styles.inactiveBadge}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        style={styles.actionButton}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? '🔒' : '🔓'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        style={styles.actionButton}
                        title="Reset Password"
                      >
                        🔑
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={styles.deleteButton}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div style={styles.emptyState}>
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
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
    fontSize: '18px',
    color: '#6b7280',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
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
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '250px',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  select: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
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
  freelancerId: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  roleSelect: {
    padding: '6px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'white',
  },
  activeBadge: {
    padding: '4px 8px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  inactiveBadge: {
    padding: '4px 8px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '6px 10px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  deleteButton: {
    padding: '6px 10px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
  },
};