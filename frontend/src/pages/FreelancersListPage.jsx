/**
 * Freelancers List Page
 * View and manage all freelancers with filtering
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { freelancersAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function FreelancersListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    loadFreelancers();
  }, [statusFilter]);

  const loadFreelancers = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await freelancersAPI.getAll(params);
      setFreelancers(response.data.data.freelancers);
    } catch (error) {
      console.error('Failed to load freelancers', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (freelancerId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(freelancerId)) {
      newExpanded.delete(freelancerId);
    } else {
      newExpanded.add(freelancerId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <AdminLayout>
      <div>
        <h2 style={styles.pageTitle}>
          {statusFilter ? `${statusFilter} Freelancers` : 'All Freelancers'}
        </h2>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : freelancers.length === 0 ? (
          <div style={styles.empty}>No freelancers found</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Tier</th>
                <th style={styles.th}>Grade</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {freelancers.map((freelancer) => (
                <FreelancerRow
                  key={freelancer.id}
                  freelancer={freelancer}
                  isExpanded={expandedRows.has(freelancer.id)}
                  onToggle={() => toggleRow(freelancer.id)}
                  onView={() => navigate(`/admin/freelancers/${freelancer.id}`)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

function FreelancerRow({ freelancer, isExpanded, onToggle, onView }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'INACTIVE': return '#6b7280';
      case 'DEACTIVATED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'PLATINUM': return '#8b5cf6';
      case 'GOLD': return '#f59e0b';
      case 'SILVER': return '#6b7280';
      case 'BRONZE': return '#a16207';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <tr style={styles.tableRow} onClick={onToggle}>
        <td style={styles.td}>{freelancer.freelancerId}</td>
        <td style={styles.td}>
          <strong>
            {freelancer.firstName} {freelancer.middleName ? freelancer.middleName + ' ' : ''}{freelancer.lastName}
          </strong>
        </td>
        <td style={styles.td}>{freelancer.email}</td>
        <td style={styles.td}>{freelancer.city}, {freelancer.country}</td>
        <td style={styles.td}>
          <span style={{ ...styles.badge, backgroundColor: getTierColor(freelancer.currentTier) }}>
            {freelancer.currentTier}
          </span>
        </td>
        <td style={styles.td}>{freelancer.currentGrade}</td>
        <td style={styles.td}>
          <span style={{ ...styles.badge, backgroundColor: getStatusColor(freelancer.status) }}>
            {freelancer.status}
          </span>
        </td>
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
          <td colSpan="8" style={styles.expandedContent}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Contact Information</h4>
                <div style={styles.detailItem}>
                  <strong>Phone:</strong> {freelancer.phone || 'N/A'}
                </div>
                <div style={styles.detailItem}>
                  <strong>Timezone:</strong> {freelancer.timezone || 'N/A'}
                </div>
              </div>
              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Work Details</h4>
                <div style={styles.detailItem}>
                  <strong>Availability:</strong> {freelancer.availabilityType || 'N/A'}
                </div>
                <div style={styles.detailItem}>
                  <strong>Hours/Week:</strong> {freelancer.hoursPerWeek || 'N/A'}
                </div>
              </div>
              <div style={styles.detailSection}>
                <h4 style={styles.detailTitle}>Status</h4>
                <div style={styles.detailItem}>
                  <strong>Onboarding:</strong> {freelancer.onboardingStatus}
                </div>
                <div style={styles.detailItem}>
                  <strong>Available Now:</strong> {freelancer.isAvailableNow ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const styles = {
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '30px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#6b7280',
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
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    display: 'inline-block',
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
};
