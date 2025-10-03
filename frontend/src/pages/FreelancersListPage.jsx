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
          <div style={styles.grid}>
            {freelancers.map((freelancer) => (
              <div
                key={freelancer.id}
                style={styles.card}
                onClick={() => navigate(`/admin/freelancers/${freelancer.id}`)}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.name}>
                    {freelancer.firstName} {freelancer.lastName}
                  </h3>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: freelancer.status === 'ACTIVE' ? '#10b981' : '#6b7280',
                    }}
                  >
                    {freelancer.status}
                  </span>
                </div>

                <div style={styles.info}>
                  <div style={styles.infoItem}>
                    <strong>ID:</strong> {freelancer.freelancerId}
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Email:</strong> {freelancer.email}
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Location:</strong> {freelancer.city}, {freelancer.country}
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Tier:</strong> {freelancer.currentTier}
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Grade:</strong> {freelancer.currentGrade}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
    border: '1px solid #e5e7eb',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px',
  },
  name: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoItem: {
    fontSize: '14px',
    color: '#374151',
  },
};
