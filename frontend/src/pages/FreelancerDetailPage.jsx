/**
 * Freelancer Detail Page
 * Full profile view with edit capability
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { freelancersAPI, tieringAPI } from '../services/api';

export default function FreelancerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadFreelancer();
  }, [id]);

  const loadFreelancer = async () => {
    setLoading(true);
    try {
      const response = await freelancersAPI.getById(id);
      const data = response.data.data;
      setFreelancer(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        city: data.city,
        country: data.country,
        status: data.status,
        currentTier: data.currentTier,
        currentGrade: data.currentGrade,
        onboardingStatus: data.onboardingStatus,
        availabilityType: data.availabilityType,
        hoursPerWeek: data.hoursPerWeek,
      });
    } catch (error) {
      alert('Failed to load freelancer');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await freelancersAPI.update(id, formData);
      alert('Freelancer updated successfully!');
      setEditing(false);
      loadFreelancer();
    } catch (error) {
      alert('Failed to update freelancer');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCalculateTier = async (period = 'all') => {
    setCalculating(true);
    try {
      const response = await tieringAPI.calculate(id, { period });
      setCalculation(response.data.data);
    } catch (error) {
      alert('Failed to calculate tier/grade: ' + (error.response?.data?.message || error.message));
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyTier = async () => {
    if (!calculation || !calculation.recommended) {
      alert('No calculation available to apply');
      return;
    }

    const confirmed = window.confirm(
      `Apply tier/grade change from ${calculation.current.tier}-${calculation.current.grade} to ${calculation.recommended.tier}-${calculation.recommended.grade}?`
    );

    if (!confirmed) return;

    setApplying(true);
    try {
      await tieringAPI.apply(id, {
        tier: calculation.recommended.tier,
        grade: calculation.recommended.grade,
        reason: 'Performance-based automatic calculation',
      });
      alert('Tier and grade updated successfully!');
      setCalculation(null);
      loadFreelancer();
    } catch (error) {
      alert('Failed to apply tier/grade: ' + (error.response?.data?.message || error.message));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!freelancer) {
    return <div style={styles.loading}>Freelancer not found</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/admin')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
        {!editing && (
          <button onClick={() => setEditing(true)} style={styles.editButton}>
            Edit Profile
          </button>
        )}
      </div>

      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.profileHeader}>
          <div>
            <h1 style={styles.name}>
              {freelancer.firstName} {freelancer.lastName}
            </h1>
            <p style={styles.id}>{freelancer.freelancerId}</p>
          </div>
          <div style={styles.badges}>
            <span style={getStatusBadge(freelancer.status)}>{freelancer.status}</span>
            <span style={getTierBadge(freelancer.currentTier)}>{freelancer.currentTier}</span>
            <span style={getGradeBadge(freelancer.currentGrade)}>Grade {freelancer.currentGrade}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <div style={{ ...styles.tab, ...styles.activeTab }}>Overview</div>
        </div>

        {editing ? (
          /* Edit Form */
          <div style={styles.editForm}>
            <h3 style={styles.sectionTitle}>Edit Information</h3>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ENGAGED">ENGAGED</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DEACTIVATED">DEACTIVATED</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tier</label>
                <select name="currentTier" value={formData.currentTier} onChange={handleChange} style={styles.input}>
                  <option value="BRONZE">BRONZE</option>
                  <option value="SILVER">SILVER</option>
                  <option value="GOLD">GOLD</option>
                  <option value="PLATINUM">PLATINUM</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Grade</label>
                <select name="currentGrade" value={formData.currentGrade} onChange={handleChange} style={styles.input}>
                  <option value="C">C</option>
                  <option value="B">B</option>
                  <option value="A">A</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Onboarding Status</label>
                <select
                  name="onboardingStatus"
                  value={formData.onboardingStatus}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Hours Per Week</label>
                <input
                  name="hoursPerWeek"
                  type="number"
                  value={formData.hoursPerWeek || ''}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button onClick={handleSave} style={styles.saveButton}>
                Save Changes
              </button>
              <button onClick={() => setEditing(false)} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div style={styles.content}>
            {/* Contact Information */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Contact Information</h3>
              <div style={styles.grid}>
                <InfoItem label="Email" value={freelancer.email} />
                <InfoItem label="Phone" value={freelancer.phone} />
                <InfoItem label="City" value={freelancer.city} />
                <InfoItem label="Country" value={freelancer.country} />
                {freelancer.timezone && <InfoItem label="Timezone" value={freelancer.timezone} />}
                {freelancer.gender && <InfoItem label="Gender" value={freelancer.gender} />}
                {freelancer.age && <InfoItem label="Age" value={freelancer.age} />}
              </div>
            </div>

            {/* Status & Classification */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Status & Classification</h3>
              <div style={styles.grid}>
                <InfoItem label="Status" value={freelancer.status} />
                <InfoItem label="Tier" value={freelancer.currentTier} />
                <InfoItem label="Grade" value={freelancer.currentGrade} />
                <InfoItem label="Onboarding" value={freelancer.onboardingStatus} />
              </div>
            </div>

            {/* Availability */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Availability</h3>
              <div style={styles.grid}>
                {freelancer.availabilityType && <InfoItem label="Type" value={freelancer.availabilityType} />}
                {freelancer.hoursPerWeek && <InfoItem label="Hours/Week" value={freelancer.hoursPerWeek} />}
                {freelancer.preferredStartTime && <InfoItem label="Start Time" value={freelancer.preferredStartTime} />}
                {freelancer.preferredEndTime && <InfoItem label="End Time" value={freelancer.preferredEndTime} />}
              </div>
            </div>

            {/* Skills & Expertise */}
            {freelancer.annotationTypes && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Skills & Expertise</h3>
                <div style={styles.skillsGrid}>
                  {tryParseJSON(freelancer.annotationTypes)?.map((skill, i) => (
                    <span key={i} style={styles.skillChip}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application Details */}
            {freelancer.application && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Application Details</h3>
                <div style={styles.grid}>
                  {freelancer.application.yearsOfExperience && (
                    <InfoItem label="Years of Experience" value={freelancer.application.yearsOfExperience} />
                  )}
                  {freelancer.application.previousCompanies && (
                    <InfoItem label="Previous Companies" value={freelancer.application.previousCompanies} />
                  )}
                  {freelancer.application.submittedAt && (
                    <InfoItem
                      label="Applied On"
                      value={new Date(freelancer.application.submittedAt).toLocaleDateString()}
                    />
                  )}
                </div>
                {freelancer.application.relevantExperience && (
                  <div style={{ marginTop: '16px' }}>
                    <strong style={styles.label}>Relevant Experience:</strong>
                    <p style={styles.text}>{freelancer.application.relevantExperience}</p>
                  </div>
                )}
              </div>
            )}

            {/* Account Information */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Account Information</h3>
              <div style={styles.grid}>
                <InfoItem label="Account Active" value={freelancer.user?.isActive ? 'Yes' : 'No'} />
                <InfoItem label="Approved On" value={new Date(freelancer.approvedAt).toLocaleDateString()} />
                <InfoItem label="Created On" value={new Date(freelancer.createdAt).toLocaleDateString()} />
              </div>
            </div>

            {/* Tier & Grade Management */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Tier & Grade Management</h3>
              <p style={styles.tierDescription}>
                Calculate tier and grade based on performance records. Tier is determined by average performance score,
                and grade is determined by consistency.
              </p>

              <div style={styles.tierActions}>
                <button
                  onClick={() => handleCalculateTier('all')}
                  disabled={calculating}
                  style={styles.calculateButton}
                >
                  {calculating ? 'Calculating...' : 'Calculate Tier/Grade (All Time)'}
                </button>
                <button
                  onClick={() => handleCalculateTier('last_quarter')}
                  disabled={calculating}
                  style={styles.calculateButton}
                >
                  {calculating ? 'Calculating...' : 'Calculate (Last Quarter)'}
                </button>
                <button
                  onClick={() => handleCalculateTier('last_month')}
                  disabled={calculating}
                  style={styles.calculateButton}
                >
                  {calculating ? 'Calculating...' : 'Calculate (Last Month)'}
                </button>
              </div>

              {calculation && (
                <div style={styles.calculationResults}>
                  <h4 style={styles.resultsTitle}>Calculation Results</h4>

                  <div style={styles.resultsGrid}>
                    <div style={styles.resultCard}>
                      <label style={styles.label}>Period Analyzed</label>
                      <p style={styles.resultValue}>{calculation.calculation.period}</p>
                    </div>
                    <div style={styles.resultCard}>
                      <label style={styles.label}>Records Analyzed</label>
                      <p style={styles.resultValue}>{calculation.calculation.recordsAnalyzed}</p>
                    </div>
                    <div style={styles.resultCard}>
                      <label style={styles.label}>Average Score</label>
                      <p style={styles.resultValue}>{calculation.calculation.avgScore}</p>
                    </div>
                    <div style={styles.resultCard}>
                      <label style={styles.label}>Consistency</label>
                      <p style={styles.resultValue}>{calculation.calculation.consistency}</p>
                    </div>
                  </div>

                  <div style={styles.comparisonRow}>
                    <div style={styles.comparisonCard}>
                      <label style={styles.label}>Current Tier/Grade</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <span style={getTierBadge(calculation.current.tier)}>{calculation.current.tier}</span>
                        <span style={getGradeBadge(calculation.current.grade)}>Grade {calculation.current.grade}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '24px', color: '#9ca3af', alignSelf: 'center' }}>→</div>

                    <div style={styles.comparisonCard}>
                      <label style={styles.label}>Recommended Tier/Grade</label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <span style={getTierBadge(calculation.recommended.tier)}>{calculation.recommended.tier}</span>
                        <span style={getGradeBadge(calculation.recommended.grade)}>
                          Grade {calculation.recommended.grade}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.changeMessage}>
                    <strong>{calculation.message}</strong>
                  </div>

                  {calculation.changed && (
                    <button onClick={handleApplyTier} disabled={applying} style={styles.applyButton}>
                      {applying ? 'Applying...' : 'Apply Changes'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <p style={styles.value}>{value || 'N/A'}</p>
    </div>
  );
}

function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

function getStatusBadge(status) {
  const base = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  };
  switch (status) {
    case 'ACTIVE':
      return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
    case 'ENGAGED':
      return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'INACTIVE':
      return { ...base, backgroundColor: '#e5e7eb', color: '#374151' };
    case 'DEACTIVATED':
      return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      return base;
  }
}

function getTierBadge(tier) {
  const base = {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  };
  switch (tier) {
    case 'PLATINUM':
      return { ...base, backgroundColor: '#e0e7ff', color: '#3730a3' };
    case 'GOLD':
      return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
    case 'SILVER':
      return { ...base, backgroundColor: '#f3f4f6', color: '#1f2937' };
    case 'BRONZE':
      return { ...base, backgroundColor: '#fed7aa', color: '#7c2d12' };
    default:
      return base;
  }
}

function getGradeBadge(grade) {
  return {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#f0fdf4',
    color: '#166534',
  };
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
    minHeight: '100vh',
    fontSize: '18px',
    color: '#6b7280',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    maxWidth: '1200px',
    margin: '0 auto 24px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
    overflow: 'hidden',
  },
  profileHeader: {
    padding: '32px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#111827',
  },
  id: {
    fontSize: '14px',
    color: '#6b7280',
  },
  badges: {
    display: 'flex',
    gap: '8px',
  },
  tabs: {
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    padding: '0 32px',
  },
  tab: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  content: {
    padding: '32px',
  },
  section: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f3f4f6',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#111827',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    display: 'block',
  },
  value: {
    fontSize: '15px',
    color: '#111827',
  },
  text: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    marginTop: '8px',
  },
  skillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  skillChip: {
    padding: '6px 12px',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500',
  },
  editForm: {
    padding: '32px',
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
  },
  input: {
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  tierDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  tierActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  calculateButton: {
    padding: '10px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  calculationResults: {
    backgroundColor: '#f9fafb',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  resultsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#111827',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  resultCard: {
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  resultValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginTop: '4px',
  },
  comparisonRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  comparisonCard: {
    flex: 1,
    textAlign: 'center',
  },
  changeMessage: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  applyButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};