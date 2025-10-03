/**
 * Freelancer Profile Page
 * View and edit freelancer profile
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { freelancerPortalAPI } from '../services/api';

export default function FreelancerProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await freelancerPortalAPI.getProfile();
      const data = response.data.data;
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        city: data.city || '',
        country: data.country || '',
        timezone: data.timezone || '',
        availabilityType: data.availabilityType || '',
        hoursPerWeek: data.hoursPerWeek || '',
      });
    } catch (error) {
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await freelancerPortalAPI.updateProfile(formData);
      alert('Profile updated successfully!');
      setEditing(false);
      await loadProfile();
    } catch (error) {
      alert('Failed to update profile');
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
        {!editing && (
          <button onClick={() => setEditing(true)} style={styles.editButton}>
            Edit Profile
          </button>
        )}
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>My Profile</h1>

        {editing ? (
          /* Edit Form */
          <div style={styles.editForm}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Country</label>
                <input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Timezone</label>
                <input
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., EST, PST, GMT+5"
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Availability Type</label>
                <select
                  value={formData.availabilityType}
                  onChange={(e) => setFormData({ ...formData, availabilityType: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select...</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hours Per Week</label>
                <input
                  type="number"
                  value={formData.hoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
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
            {/* Personal Information */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Personal Information</h2>
              <div style={styles.grid}>
                <InfoItem label="First Name" value={profile.firstName} />
                <InfoItem label="Last Name" value={profile.lastName} />
                <InfoItem label="Email" value={profile.email} />
                <InfoItem label="Phone" value={profile.phone} />
                <InfoItem label="City" value={profile.city} />
                <InfoItem label="Country" value={profile.country} />
                {profile.timezone && <InfoItem label="Timezone" value={profile.timezone} />}
                {profile.gender && <InfoItem label="Gender" value={profile.gender} />}
                {profile.age && <InfoItem label="Age" value={profile.age} />}
              </div>
            </div>

            {/* Status */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Status & Performance</h2>
              <div style={styles.grid}>
                <InfoItem label="Status" value={profile.status} />
                <InfoItem label="Tier" value={profile.currentTier} />
                <InfoItem label="Grade" value={profile.currentGrade} />
                <InfoItem label="Onboarding" value={profile.onboardingStatus} />
                <InfoItem label="Freelancer ID" value={profile.freelancerId} />
              </div>
            </div>

            {/* Availability */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Availability</h2>
              <div style={styles.grid}>
                {profile.availabilityType && <InfoItem label="Type" value={profile.availabilityType} />}
                {profile.hoursPerWeek && <InfoItem label="Hours/Week" value={profile.hoursPerWeek} />}
                {profile.preferredStartTime && <InfoItem label="Start Time" value={profile.preferredStartTime} />}
                {profile.preferredEndTime && <InfoItem label="End Time" value={profile.preferredEndTime} />}
              </div>
            </div>

            {/* Skills */}
            {profile.annotationTypes && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Skills & Expertise</h2>
                <div style={styles.skillsGrid}>
                  {tryParseJSON(profile.annotationTypes)?.map((skill, i) => (
                    <span key={i} style={styles.skillChip}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application Details */}
            {profile.application && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Application Information</h2>
                <div style={styles.grid}>
                  {profile.application.yearsOfExperience && (
                    <InfoItem label="Years of Experience" value={profile.application.yearsOfExperience} />
                  )}
                  {profile.application.previousCompanies && (
                    <InfoItem label="Previous Companies" value={profile.application.previousCompanies} />
                  )}
                </div>
                {profile.application.relevantExperience && (
                  <div style={{ marginTop: '16px' }}>
                    <strong style={styles.label}>Relevant Experience:</strong>
                    <p style={styles.text}>{profile.application.relevantExperience}</p>
                  </div>
                )}
              </div>
            )}
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
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
  },
  content: {},
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
  editForm: {},
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
};