/**
 * Admin Payments Management Page
 * Allows admins to view, create, approve, and manage all payment records
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentsAPI, freelancersAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminPayments() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [payments, setPayments] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [stats, setStats] = useState({ totalPayments: 0, totalAmount: 0, totalPaid: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ freelancerId: '', status: statusFilter, year: '', month: '' });
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [expandedPayment, setExpandedPayment] = useState(null);

  useEffect(() => {
    setFilter(prev => ({ ...prev, status: statusFilter }));
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, statsRes, freelancersRes] = await Promise.all([
        paymentsAPI.getAll(filter),
        paymentsAPI.getStats(filter),
        freelancersAPI.getAll({ status: 'ACTIVE', limit: 1000 }),
      ]);
      setPayments(paymentsRes.data.data.payments);
      setStats(statsRes.data.data);
      setFreelancers(freelancersRes.data.data.freelancers);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load payments: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    if (!confirm('Are you sure you want to approve this payment?')) return;

    try {
      await paymentsAPI.update(paymentId, { status: 'APPROVED' });
      alert('Payment approved successfully');
      loadData();
    } catch (error) {
      console.error('Failed to approve payment:', error);
      alert('Failed to approve payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleMarkPaid = async (payment) => {
    setSelectedPayment(payment);
    const method = prompt('Enter payment method (BANK_TRANSFER, MOBILE_MONEY, PAYPAL):');
    if (!method) return;

    const reference = prompt('Enter reference number:');
    if (!reference) return;

    try {
      await paymentsAPI.update(payment.id, {
        status: 'PAID',
        paymentMethod: method,
        referenceNumber: reference,
        paidAt: new Date().toISOString(),
      });
      alert('Payment marked as paid successfully');
      loadData();
    } catch (error) {
      console.error('Failed to mark payment as paid:', error);
      alert('Failed to update payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (paymentId) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      await paymentsAPI.delete(paymentId);
      alert('Payment deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment: ' + (error.response?.data?.message || error.message));
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
    <AdminLayout>
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Payment Management</h1>
          <p style={styles.subtitle}>Manage all freelancer payments</p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => {
              const url = paymentsAPI.exportCSV(filter);
              window.open(url, '_blank');
            }}
            style={styles.secondaryButton}
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => {
              const url = paymentsAPI.exportLineItemsCSV(filter);
              window.open(url, '_blank');
            }}
            style={styles.secondaryButton}
          >
            📊 Export Line Items
          </button>
          <button
            onClick={() => setShowCalculateModal(true)}
            style={styles.secondaryButton}
          >
            💰 Calculate Payment
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={styles.primaryButton}
          >
            ➕ Create Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <div style={styles.statLabel}>Total Amount</div>
            <div style={styles.statValue}>{formatCurrency(stats.totalAmount)}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <div style={styles.statLabel}>Total Paid</div>
            <div style={styles.statValue}>{formatCurrency(stats.totalPaid)}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div>
            <div style={styles.statLabel}>Pending</div>
            <div style={styles.statValue}>{formatCurrency(stats.totalPending)}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <div style={styles.statLabel}>Total Records</div>
            <div style={styles.statValue}>{stats.totalPayments}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={filter.freelancerId}
          onChange={(e) => setFilter({ ...filter, freelancerId: e.target.value })}
          style={styles.select}
        >
          <option value="">All Freelancers</option>
          {freelancers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.firstName} {f.lastName}
            </option>
          ))}
        </select>

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
          value={filter.month}
          onChange={(e) => setFilter({ ...filter, month: e.target.value })}
          style={styles.select}
        >
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {getMonthName(i + 1)}
            </option>
          ))}
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
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Payments List */}
      {loading ? (
        <div style={styles.loading}>Loading payments...</div>
      ) : payments.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📭</div>
          <h3>No Payments Found</h3>
          <p>No payment records match your current filters.</p>
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
                    {payment.freelancer.firstName} {payment.freelancer.middleName ? payment.freelancer.middleName + ' ' : ''}{payment.freelancer.lastName} - {getMonthName(payment.month)} {payment.year}
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
                      <div style={styles.paymentInfoGrid}>
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

                  {/* Actions */}
                  <div style={styles.actionsSection}>
                    {payment.status === 'PENDING' && (
                      <button
                        onClick={() => handleApprove(payment.id)}
                        style={styles.approveButton}
                      >
                        ✓ Approve
                      </button>
                    )}
                    {payment.status === 'APPROVED' && (
                      <button
                        onClick={() => handleMarkPaid(payment)}
                        style={styles.paidButton}
                      >
                        💰 Mark as Paid
                      </button>
                    )}
                    {payment.status !== 'PAID' && (
                      <button
                        onClick={() => handleDelete(payment.id)}
                        style={styles.deleteButton}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Calculate Payment Modal */}
      {showCalculateModal && (
        <CalculatePaymentModal
          freelancers={freelancers}
          onClose={() => setShowCalculateModal(false)}
          onSuccess={loadData}
        />
      )}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <CreatePaymentModal
          freelancers={freelancers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
    </AdminLayout>
  );
}

// Calculate Payment Modal Component
function CalculatePaymentModal({ freelancers, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    freelancerId: '',
    periodStart: '',
    periodEnd: '',
  });
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!formData.freelancerId || !formData.periodStart || !formData.periodEnd) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentsAPI.calculate(formData);
      setCalculation(response.data.data);
    } catch (error) {
      console.error('Failed to calculate payment:', error);
      alert('Failed to calculate payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromCalculation = async () => {
    if (!calculation) return;

    setLoading(true);
    try {
      await paymentsAPI.create({
        freelancerId: calculation.freelancerId,
        month: calculation.month,
        year: calculation.year,
        periodStart: calculation.periodStart,
        periodEnd: calculation.periodEnd,
        lineItems: calculation.lineItems,
      });
      alert('Payment record created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('Failed to create payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Calculate Payment</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Freelancer</label>
            <select
              value={formData.freelancerId}
              onChange={(e) => setFormData({ ...formData, freelancerId: e.target.value })}
              style={styles.input}
            >
              <option value="">Select freelancer...</option>
              {freelancers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.firstName} {f.lastName}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Period Start</label>
            <input
              type="date"
              value={formData.periodStart}
              onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Period End</label>
            <input
              type="date"
              value={formData.periodEnd}
              onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
              style={styles.input}
            />
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            style={styles.calculateButton}
          >
            {loading ? 'Calculating...' : '📊 Calculate'}
          </button>

          {calculation && (
            <div style={styles.calculationResult}>
              <h3>Calculation Result</h3>
              <p>Total Amount: GHC {calculation.totalAmount.toFixed(2)}</p>
              <p>Line Items: {calculation.lineItems.length}</p>
              <button
                onClick={handleCreateFromCalculation}
                disabled={loading}
                style={styles.createButton}
              >
                {loading ? 'Creating...' : '✓ Create Payment Record'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Payment Modal Component
function CreatePaymentModal({ freelancers, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    freelancerId: '',
    month: '',
    year: new Date().getFullYear(),
    periodStart: '',
    periodEnd: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.freelancerId || !formData.month || !formData.year || !formData.periodStart || !formData.periodEnd) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await paymentsAPI.create({
        ...formData,
        lineItems: [], // Empty for manual creation
      });
      alert('Payment record created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('Failed to create payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create Payment Record</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Freelancer *</label>
            <select
              value={formData.freelancerId}
              onChange={(e) => setFormData({ ...formData, freelancerId: e.target.value })}
              style={styles.input}
            >
              <option value="">Select freelancer...</option>
              {freelancers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.firstName} {f.lastName}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Month *</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                style={styles.input}
              >
                <option value="">Select month...</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Year *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Period Start *</label>
            <input
              type="date"
              value={formData.periodStart}
              onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Period End *</label>
            <input
              type="date"
              value={formData.periodEnd}
              onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={styles.textarea}
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? 'Creating...' : '✓ Create Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '36px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
  },
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
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
  paymentInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '8px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
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
  actionsSection: {
    marginTop: '20px',
    display: 'flex',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },
  approveButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  paidButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
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
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  closeButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
  },
  modalBody: {
    padding: '24px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  calculateButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  calculationResult: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
  },
  createButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px',
  },
  submitButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
