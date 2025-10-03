/**
 * Freelancer Payments Page
 * Shows payment history for the logged-in freelancer
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function FreelancerPayments() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, totalPayments: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ year: '', status: '' });
  const [expandedPayment, setExpandedPayment] = useState(null);

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentsAPI.getMyPayments(filter);
      setPayments(response.data.data.payments);
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('Failed to load payments:', error);
      alert('Failed to load payments: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
    };

    switch (status) {
      case 'PAID':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'APPROVED':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'PENDING':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'REJECTED':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const formatCurrency = (amount) => {
    return `GHC ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const toggleExpand = (paymentId) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Freelancer Portal</h1>
          <p style={styles.subtitle}>Payment History</p>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/freelancer/projects')} style={styles.navButton}>
            Browse Projects
          </button>
          <button onClick={() => navigate('/freelancer/my-projects')} style={styles.navButton}>
            My Projects
          </button>
          <button onClick={() => navigate('/freelancer/performance')} style={styles.navButton}>
            Performance
          </button>
          <button onClick={() => navigate('/freelancer/payments')} style={styles.navButton}>
            Payments
          </button>
          <button onClick={() => navigate('/freelancer/profile')} style={styles.navButton}>
            Profile
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Payment History</h2>
        <p style={styles.pageSubtitle}>View your payment records and earnings</p>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💰</div>
          <div>
            <div style={styles.summaryLabel}>Total Paid</div>
            <div style={styles.summaryValue}>{formatCurrency(summary.totalPaid)}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>⏳</div>
          <div>
            <div style={styles.summaryLabel}>Total Pending</div>
            <div style={styles.summaryValue}>{formatCurrency(summary.totalPending)}</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📊</div>
          <div>
            <div style={styles.summaryLabel}>Total Payments</div>
            <div style={styles.summaryValue}>{summary.totalPayments}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={filter.year}
          onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          style={styles.select}
        >
          <option value="">All Years</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          style={styles.select}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {/* Payments List */}
      {loading ? (
        <div style={styles.loading}>Loading payments...</div>
      ) : payments.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>No Payments Yet</h3>
          <p>Your payment history will appear here once payments are processed.</p>
        </div>
      ) : (
        <div style={styles.paymentsList}>
          {payments.map((payment) => (
            <div key={payment.id} style={styles.paymentCard}>
              {/* Payment Header */}
              <div
                style={styles.paymentHeader}
                onClick={() => toggleExpand(payment.id)}
              >
                <div style={styles.paymentInfo}>
                  <h3 style={styles.paymentPeriod}>
                    {getMonthName(payment.month)} {payment.year}
                  </h3>
                  <p style={styles.paymentDates}>
                    {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                  </p>
                </div>

                <div style={styles.paymentRight}>
                  <div style={styles.paymentAmount}>{formatCurrency(payment.totalAmount)}</div>
                  <div style={getStatusBadgeStyle(payment.status)}>{payment.status}</div>
                  <button style={styles.expandButton}>
                    {expandedPayment === payment.id ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* Payment Details (Expanded) */}
              {expandedPayment === payment.id && (
                <div style={styles.paymentDetails}>
                  {/* Work Summary */}
                  <div style={styles.detailsSection}>
                    <h4 style={styles.detailsTitle}>Work Summary</h4>
                    <div style={styles.workSummary}>
                      {payment.hoursWorked && (
                        <div style={styles.workItem}>
                          <span style={styles.workLabel}>Hours Worked:</span>
                          <span style={styles.workValue}>{payment.hoursWorked}</span>
                        </div>
                      )}
                      {payment.assetsCompleted && (
                        <div style={styles.workItem}>
                          <span style={styles.workLabel}>Assets Completed:</span>
                          <span style={styles.workValue}>{payment.assetsCompleted}</span>
                        </div>
                      )}
                      {payment.objectsAnnotated && (
                        <div style={styles.workItem}>
                          <span style={styles.workLabel}>Objects Annotated:</span>
                          <span style={styles.workValue}>{payment.objectsAnnotated}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Line Items */}
                  {payment.lineItems && payment.lineItems.length > 0 && (
                    <div style={styles.detailsSection}>
                      <h4 style={styles.detailsTitle}>Payment Breakdown</h4>
                      <div style={styles.lineItemsTable}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Date</th>
                              <th style={styles.th}>Project</th>
                              <th style={styles.th}>Description</th>
                              <th style={styles.th}>Quantity</th>
                              <th style={styles.th}>Rate</th>
                              <th style={styles.th}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payment.lineItems.map((item) => (
                              <tr key={item.id}>
                                <td style={styles.td}>{formatDate(item.workDate)}</td>
                                <td style={styles.td}>
                                  {item.project?.name || 'N/A'}
                                </td>
                                <td style={styles.td}>{item.description}</td>
                                <td style={styles.td}>
                                  {item.hoursWorked || item.assetsCompleted || item.objectsAnnotated || '-'}
                                </td>
                                <td style={styles.td}>{formatCurrency(item.rate)}</td>
                                <td style={styles.td}>{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Payment Info */}
                  {payment.status === 'PAID' && (
                    <div style={styles.detailsSection}>
                      <h4 style={styles.detailsTitle}>Payment Information</h4>
                      <div style={styles.paymentInfo}>
                        {payment.paidAt && (
                          <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Paid On:</span>
                            <span style={styles.infoValue}>{formatDate(payment.paidAt)}</span>
                          </div>
                        )}
                        {payment.paymentMethod && (
                          <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Payment Method:</span>
                            <span style={styles.infoValue}>{payment.paymentMethod}</span>
                          </div>
                        )}
                        {payment.referenceNumber && (
                          <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Reference:</span>
                            <span style={styles.infoValue}>{payment.referenceNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {payment.notes && (
                    <div style={styles.detailsSection}>
                      <h4 style={styles.detailsTitle}>Notes</h4>
                      <p style={styles.notes}>{payment.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
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
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
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
  container: {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  pageHeader: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
    cursor: 'pointer',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  summaryIcon: {
    fontSize: '36px',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
  },
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280',
    fontSize: '16px',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  paymentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  paymentHeader: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentPeriod: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  paymentDates: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  paymentRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  paymentAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
  },
  expandButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280',
  },
  paymentDetails: {
    padding: '0 24px 24px 24px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  detailsSection: {
    marginTop: '20px',
  },
  detailsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px',
  },
  workSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  workItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  workLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  workValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  lineItemsTable: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    marginBottom: '8px',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  notes: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#374151',
    margin: 0,
  },
};
