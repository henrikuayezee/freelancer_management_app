/**
 * Freelancer Performance Page
 * View performance records and stats
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { freelancerPortalAPI } from '../services/api';

export default function FreelancerPerformancePage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    setLoading(true);
    try {
      const response = await freelancerPortalAPI.getPerformance();
      setData(response.data.data);
    } catch (error) {
      alert('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/freelancer')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>My Performance</h1>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <label style={styles.summaryLabel}>Total Records</label>
          <p style={styles.summaryValue}>{data.summary.total}</p>
        </div>
        <div style={styles.summaryCard}>
          <label style={styles.summaryLabel}>Average Overall Score</label>
          <p style={{ ...styles.summaryValue, ...getScoreColor(data.summary.avgOverall) }}>
            {data.summary.avgOverall}
          </p>
        </div>
        <div style={styles.summaryCard}>
          <label style={styles.summaryLabel}>Average COM Score</label>
          <p style={{ ...styles.summaryValue, ...getScoreColor(data.summary.avgCOM) }}>
            {data.summary.avgCOM}
          </p>
        </div>
        <div style={styles.summaryCard}>
          <label style={styles.summaryLabel}>Average QUAL Score</label>
          <p style={{ ...styles.summaryValue, ...getScoreColor(data.summary.avgQUAL) }}>
            {data.summary.avgQUAL}
          </p>
        </div>
      </div>

      {/* Records Table */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Performance History</h2>
        {data.records.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No performance records yet</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>COM Total</th>
                <th style={styles.th}>QUAL Total</th>
                <th style={styles.th}>Overall Score</th>
                <th style={styles.th}>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((record) => (
                <tr key={record.id} style={styles.tableRow}>
                  <td style={styles.td}>{new Date(record.recordDate).toLocaleDateString()}</td>
                  <td style={styles.td}>{record.project?.name || 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.comTotal)}>{record.comTotal?.toFixed(2) || 'N/A'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.qualTotal)}>{record.qualTotal?.toFixed(2) || 'N/A'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={getScoreBadge(record.overallScore)}>
                      {record.overallScore?.toFixed(2) || 'N/A'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => alert(`Performance Details:\n\nCOM Scores:\n- Responsibility: ${record.comResponsibility}\n- Commitment: ${record.comCommitment}\n- Initiative: ${record.comInitiative}\n- Willingness: ${record.comWillingness}\n- Communication: ${record.comCommunication}\n\nQUAL Scores:\n- Speed: ${record.qualSpeed}\n- Delib. Omission: ${record.qualDelibOmission}\n- Accuracy: ${record.qualAccuracy}\n- Attention: ${record.qualAttention}\n- Unannotated: ${record.qualUnannotated}\n- Understanding: ${record.qualUnderstanding}\n\nComments: ${record.comments || 'None'}`)}
                      style={styles.detailsButton}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getScoreColor(score) {
  const numScore = parseFloat(score);
  if (numScore >= 4) {
    return { color: '#065f46' };
  } else if (numScore >= 3) {
    return { color: '#92400e' };
  } else {
    return { color: '#991b1b' };
  }
}

function getScoreBadge(score) {
  const base = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
  };

  if (score === null || score === undefined) {
    return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }

  if (score >= 4) {
    return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
  } else if (score >= 3) {
    return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
  } else {
    return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    fontSize: '18px',
    color: '#6b7280',
  },
  header: {
    marginBottom: '24px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '8px',
  },
  summaryValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
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
  detailsButton: {
    padding: '6px 12px',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
};