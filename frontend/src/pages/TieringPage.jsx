/**
 * Tiering Page
 * Bulk tier/grade calculations and statistics
 */

import { useState, useEffect } from 'react';
import { tieringAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function TieringPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [period, setPeriod] = useState('all');
  const [autoApply, setAutoApply] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await tieringAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      alert('Failed to load tier statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCalculate = async () => {
    const confirmed = window.confirm(
      `Calculate tier/grade for all active freelancers based on ${period} performance?${
        autoApply ? '\n\nChanges will be AUTOMATICALLY APPLIED.' : '\n\nChanges will only be calculated (not applied).'
      }`
    );

    if (!confirmed) return;

    setCalculating(true);
    setResults(null);

    try {
      const response = await tieringAPI.calculateAll({ period, autoApply });
      setResults(response.data.data);
      if (autoApply) {
        await loadStats(); // Reload stats if changes were applied
      }
      alert(response.data.message || 'Bulk calculation completed!');
    } catch (error) {
      alert('Failed to calculate tiers: ' + (error.response?.data?.message || error.message));
    } finally {
      setCalculating(false);
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
        <div style={styles.header}>
          <h1 style={styles.title}>Tier & Grade Management</h1>
          <p style={styles.subtitle}>
            Automatic tier and grade calculation based on freelancer performance metrics
          </p>
        </div>

        {/* Tier Distribution Stats */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Current Distribution</h2>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <label style={styles.statLabel}>Total Active Freelancers</label>
              <p style={styles.statValue}>{stats.total}</p>
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statsColumn}>
              <h3 style={styles.columnTitle}>By Tier</h3>
              <div style={styles.tierStatsGrid}>
                <StatItem label="PLATINUM" value={stats.byTier.PLATINUM} color="#e0e7ff" />
                <StatItem label="GOLD" value={stats.byTier.GOLD} color="#fef3c7" />
                <StatItem label="SILVER" value={stats.byTier.SILVER} color="#f3f4f6" />
                <StatItem label="BRONZE" value={stats.byTier.BRONZE} color="#fed7aa" />
              </div>
            </div>

            <div style={styles.statsColumn}>
              <h3 style={styles.columnTitle}>By Grade</h3>
              <div style={styles.gradeStatsGrid}>
                <StatItem label="Grade A" value={stats.byGrade.A} color="#d1fae5" />
                <StatItem label="Grade B" value={stats.byGrade.B} color="#fef3c7" />
                <StatItem label="Grade C" value={stats.byGrade.C} color="#fee2e2" />
              </div>
            </div>
          </div>

          <div style={styles.detailSection}>
            <h3 style={styles.columnTitle}>Tier-Grade Breakdown</h3>
            <div style={styles.tierGradeGrid}>
              {Object.entries(stats.byTierGrade)
                .sort((a, b) => b[1] - a[1])
                .map(([key, count]) => (
                  <div key={key} style={styles.tierGradeItem}>
                    <span style={styles.tierGradeLabel}>{key}</span>
                    <span style={styles.tierGradeCount}>{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Bulk Calculation */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Bulk Tier/Grade Calculation</h2>
          <p style={styles.cardDescription}>
            Calculate tiers and grades for all active freelancers based on their performance records. Tier is based on
            average performance score, and grade is based on consistency.
          </p>

          <div style={styles.calculationForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Period</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} style={styles.select}>
                <option value="all">All Time</option>
                <option value="last_quarter">Last Quarter</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoApply}
                  onChange={(e) => setAutoApply(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>Automatically apply changes (without confirmation)</span>
              </label>
            </div>

            <button onClick={handleBulkCalculate} disabled={calculating} style={styles.calculateButton}>
              {calculating ? 'Calculating...' : 'Run Bulk Calculation'}
            </button>
          </div>

          {results && (
            <div style={styles.results}>
              <h3 style={styles.resultsTitle}>Results Summary</h3>

              <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                  <label style={styles.summaryLabel}>Total Processed</label>
                  <p style={styles.summaryValue}>{results.summary.total}</p>
                </div>
                <div style={styles.summaryCard}>
                  <label style={styles.summaryLabel}>Updated</label>
                  <p style={{ ...styles.summaryValue, color: '#10b981' }}>{results.summary.updated}</p>
                </div>
                <div style={styles.summaryCard}>
                  <label style={styles.summaryLabel}>Changes Detected</label>
                  <p style={{ ...styles.summaryValue, color: '#f59e0b' }}>{results.summary.changesDetected}</p>
                </div>
                <div style={styles.summaryCard}>
                  <label style={styles.summaryLabel}>No Change</label>
                  <p style={styles.summaryValue}>{results.summary.noChange}</p>
                </div>
                <div style={styles.summaryCard}>
                  <label style={styles.summaryLabel}>Skipped</label>
                  <p style={styles.summaryValue}>{results.summary.skipped}</p>
                </div>
                <div style={styles.summaryCard}>
                  <label style={styles.summaryLabel}>Errors</label>
                  <p style={{ ...styles.summaryValue, color: '#ef4444' }}>{results.summary.errors}</p>
                </div>
              </div>

              <div style={styles.resultsTable}>
                <h4 style={styles.tableTitle}>Detailed Results</h4>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Freelancer</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>From</th>
                      <th style={styles.th}>To</th>
                      <th style={styles.th}>Avg Score</th>
                      <th style={styles.th}>Consistency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((result, index) => (
                      <tr key={index} style={styles.tableRow}>
                        <td style={styles.td}>{result.name}</td>
                        <td style={styles.td}>
                          <span style={getStatusBadge(result.status)}>{result.status.replace('_', ' ')}</span>
                        </td>
                        <td style={styles.td}>{result.from || '-'}</td>
                        <td style={styles.td}>{result.to || '-'}</td>
                        <td style={styles.td}>{result.avgScore || '-'}</td>
                        <td style={styles.td}>{result.consistency || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatItem({ label, value, color }) {
  return (
    <div style={{ ...styles.statItem, backgroundColor: color }}>
      <label style={styles.statItemLabel}>{label}</label>
      <p style={styles.statItemValue}>{value}</p>
    </div>
  );
}

function getStatusBadge(status) {
  const base = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  };

  switch (status) {
    case 'updated':
      return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
    case 'change_detected':
      return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
    case 'no_change':
      return { ...base, backgroundColor: '#f3f4f6', color: '#374151' };
    case 'skipped':
      return { ...base, backgroundColor: '#e5e7eb', color: '#6b7280' };
    case 'error':
      return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      return base;
  }
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    fontSize: '16px',
    color: '#6b7280',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    marginTop: '8px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  statsColumn: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  columnTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
  },
  tierStatsGrid: {
    display: 'grid',
    gap: '8px',
  },
  gradeStatsGrid: {
    display: 'grid',
    gap: '8px',
  },
  statItem: {
    padding: '12px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: '14px',
    fontWeight: '600',
  },
  statItemValue: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  detailSection: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  tierGradeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '8px',
  },
  tierGradeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
  },
  tierGradeLabel: {
    fontSize: '13px',
    fontWeight: '500',
  },
  tierGradeCount: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2563eb',
  },
  calculationForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  select: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    maxWidth: '300px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
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
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  calculateButton: {
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  results: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb',
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  summaryCard: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginTop: '4px',
  },
  resultsTable: {
    marginTop: '24px',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '12px',
    color: '#111827',
  },
};