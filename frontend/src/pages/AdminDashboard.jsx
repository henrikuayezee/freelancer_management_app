/**
 * Admin Dashboard
 * Main admin interface for managing applications and freelancers
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationsAPI, freelancersAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await applicationsAPI.getAll(params);
      setApplications(response.data.data.applications);
    } catch (error) {
      console.error('Failed to load applications', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFreelancers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.tier) params.tier = filters.tier;
      if (filters.grade) params.grade = filters.grade;
      if (filters.country) params.country = filters.country;

      const response = await freelancersAPI.getAll(params);
      setFreelancers(response.data.data.freelancers);
      setFilterOptions(response.data.data.filterOptions || {});
    } catch (error) {
      console.error('Failed to load freelancers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      tier: '',
      grade: '',
      country: '',
    });
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        alert('CSV file is empty or has no data rows');
        setImporting(false);
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
      const csvData = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        csvData.push(row);
      }

      // Send to backend
      const response = await freelancersAPI.importCSV(csvData);
      setImportResults(response.data.data);
      loadFreelancers(); // Reload list

      if (response.data.data.failed > 0) {
        alert(
          `Import completed:\n${response.data.data.success} succeeded\n${response.data.data.failed} failed\n\nCheck the results below for details.`
        );
      } else {
        alert(`Import successful! ${response.data.data.success} freelancers imported.`);
      }
    } catch (error) {
      alert('Import failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve this application?')) return;

    try {
      const response = await applicationsAPI.approve(id);
      const { email, temporaryPassword, freelancerId } = response.data.data;
      alert(`Application approved successfully!\n\nFreelancer ID: ${freelancerId}\nEmail: ${email}\nTemporary Password: ${temporaryPassword}\n\nThe freelancer can now login using the Freelancer Login tab.\n\nPlease share these credentials with the freelancer securely.`);
      loadApplications();
      setSelectedApplication(null);
    } catch (error) {
      alert('Failed to approve application: ' + error.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await applicationsAPI.reject(id, reason);
      alert('Application rejected');
      loadApplications();
      setSelectedApplication(null);
    } catch (error) {
      alert('Failed to reject application');
    }
  };

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter((app) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();

      // Search in basic fields
      if (
        app.firstName?.toLowerCase().includes(term) ||
        app.lastName?.toLowerCase().includes(term) ||
        app.email?.toLowerCase().includes(term) ||
        app.city?.toLowerCase().includes(term) ||
        app.country?.toLowerCase().includes(term)
      ) {
        return true;
      }

      // Search in custom form data
      if (app.formDataParsed) {
        return Object.values(app.formDataParsed).some((value) =>
          String(value).toLowerCase().includes(term)
        );
      }

      return false;
    })
    .sort((a, b) => {
      let aVal, bVal;

      // Check if sorting by custom field
      if (sortField.startsWith('custom.')) {
        const fieldName = sortField.replace('custom.', '');
        aVal = a.formDataParsed?.[fieldName];
        bVal = b.formDataParsed?.[fieldName];
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (bVal === null || bVal === undefined) return sortOrder === 'asc' ? -1 : 1;

      // Compare values
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

  // Get all unique custom field names from applications
  const customFieldNames = [...new Set(
    applications
      .filter(app => app.formDataParsed)
      .flatMap(app => Object.keys(app.formDataParsed))
  )];

  return (
    <AdminLayout>
      <div>
        <h2 style={styles.pageTitle}>
          {statusFilter ? `${statusFilter} Applications` : 'All Applications'}
        </h2>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <ApplicationsTab
            applications={filteredAndSortedApplications}
            allApplications={applications}
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            onApprove={handleApprove}
            onReject={handleReject}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            customFieldNames={customFieldNames}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function ApplicationsTab({
  applications,
  allApplications,
  selectedApplication,
  setSelectedApplication,
  onApprove,
  onReject,
  searchTerm,
  setSearchTerm,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  customFieldNames
}) {
  if (selectedApplication) {
    const app = allApplications.find((a) => a.id === selectedApplication);
    return (
      <div>
        <button onClick={() => setSelectedApplication(null)} style={styles.backButton}>
          ← Back to list
        </button>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Application Details</h2>

          <div style={styles.detailSection}>
            <h3 style={styles.detailTitle}>Personal Information</h3>
            <div style={styles.detailGrid}>
              <DetailItem label="Name" value={`${app.firstName} ${app.lastName}`} />
              <DetailItem label="Email" value={app.email} />
              <DetailItem label="Phone" value={app.phone} />
              <DetailItem label="Location" value={`${app.city}, ${app.country}`} />
              {app.age && <DetailItem label="Age" value={app.age} />}
              {app.gender && <DetailItem label="Gender" value={app.gender} />}
            </div>
          </div>

          <div style={styles.detailSection}>
            <h3 style={styles.detailTitle}>Experience</h3>
            <div style={styles.detailGrid}>
              {app.yearsOfExperience && (
                <DetailItem label="Years of Experience" value={app.yearsOfExperience} />
              )}
              {app.previousCompanies && (
                <DetailItem label="Previous Companies" value={app.previousCompanies} />
              )}
            </div>
            {app.relevantExperience && (
              <div style={styles.detailFull}>
                <strong>Relevant Experience:</strong>
                <p style={styles.detailText}>{app.relevantExperience}</p>
              </div>
            )}
          </div>

          <div style={styles.detailSection}>
            <h3 style={styles.detailTitle}>Equipment & Setup</h3>
            <div style={styles.detailGrid}>
              <DetailItem label="Has Laptop" value={app.hasLaptop ? 'Yes' : 'No'} />
              <DetailItem label="Reliable Internet" value={app.hasReliableInternet ? 'Yes' : 'No'} />
              <DetailItem label="Remote Work" value={app.remoteWorkAvailable ? 'Yes' : 'No'} />
            </div>
          </div>

          {app.formDataParsed && Object.keys(app.formDataParsed).length > 0 && (
            <div style={styles.detailSection}>
              <h3 style={styles.detailTitle}>Additional Information</h3>
              <div style={styles.detailGrid}>
                {Object.entries(app.formDataParsed).map(([key, value]) => (
                  <DetailItem key={key} label={formatFieldLabel(key)} value={formatFieldValue(value)} />
                ))}
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button onClick={() => onApprove(app.id)} style={styles.approveButton}>
              ✓ Approve Application
            </button>
            <button onClick={() => onReject(app.id)} style={styles.rejectButton}>
              ✗ Reject Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      {/* Filter Panel */}
      <div style={styles.filterPanel}>
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search by name, email, location, or custom fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="submittedAt">Sort by Date</option>
            <option value="firstName">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="yearsOfExperience">Sort by Experience</option>
            {customFieldNames.map((fieldName) => (
              <option key={fieldName} value={`custom.${fieldName}`}>
                Sort by {formatFieldLabel(fieldName)}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={styles.sortButton}
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>

          {(searchTerm || sortField !== 'submittedAt') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSortField('submittedAt');
                setSortOrder('desc');
              }}
              style={styles.clearButton}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div style={styles.resultCount}>
          {applications.length} application{applications.length !== 1 ? 's' : ''} found
          {allApplications.length !== applications.length && ` (${allApplications.length} total)`}
        </div>
      </div>

      {/* Table */}
      {applications.length === 0 ? (
        <div style={styles.empty}>No applications match your filters</div>
      ) : (
        <div style={styles.table}>
          <table style={styles.tableElement}>
            <thead>
              <tr>
                <th style={styles.th} onClick={() => toggleSort('firstName')}>
                  Name {sortField === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={() => toggleSort('email')}>
                  Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th}>Location</th>
                <th style={styles.th} onClick={() => toggleSort('yearsOfExperience')}>
                  Experience {sortField === 'yearsOfExperience' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th} onClick={() => toggleSort('submittedAt')}>
                  Date {sortField === 'submittedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={styles.tr}>
                  <td style={styles.td}>
                    {app.firstName} {app.lastName}
                  </td>
                  <td style={styles.td}>{app.email}</td>
                  <td style={styles.td}>
                    {app.city}, {app.country}
                  </td>
                  <td style={styles.td}>{app.yearsOfExperience || 'N/A'} years</td>
                  <td style={styles.td}>{new Date(app.submittedAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => setSelectedApplication(app.id)} style={styles.viewButton}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FreelancersTab({
  freelancers,
  navigate,
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  onImportCSV,
  importing,
  importResults,
}) {
  const hasActiveFilters = filters.search || filters.status || filters.tier || filters.grade || filters.country;

  const handleExportCSV = () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.tier) params.tier = filters.tier;
    if (filters.grade) params.grade = filters.grade;
    if (filters.country) params.country = filters.country;

    const url = freelancersAPI.exportCSV(params);
    window.open(url, '_blank');
  };

  return (
    <div>
      {/* Import Section */}
      <div style={styles.importPanel}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label htmlFor="csv-upload" style={styles.importButton}>
            {importing ? '⏳ Importing...' : '📤 Import from CSV'}
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={onImportCSV}
            disabled={importing}
            style={{ display: 'none' }}
          />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            Upload CSV file to bulk import freelancers
          </span>
        </div>

        {importResults && (
          <div style={styles.importResults}>
            <div style={styles.importSummary}>
              <strong>Import Summary:</strong> {importResults.total} total, {importResults.success}{' '}
              succeeded, {importResults.failed} failed
            </div>

            {importResults.errors.length > 0 && (
              <div style={styles.importErrors}>
                <strong>Errors:</strong>
                <div style={styles.errorList}>
                  {importResults.errors.slice(0, 10).map((err, idx) => (
                    <div key={idx} style={styles.errorItem}>
                      Row {err.row} ({err.email}): {err.error}
                    </div>
                  ))}
                  {importResults.errors.length > 10 && (
                    <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
                      ... and {importResults.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <div style={styles.filterPanel}>
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            style={styles.searchInput}
          />

          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            {filterOptions.statuses?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filters.tier}
            onChange={(e) => onFilterChange('tier', e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Tiers</option>
            {filterOptions.tiers?.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={filters.grade}
            onChange={(e) => onFilterChange('grade', e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Grades</option>
            {filterOptions.grades?.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={filters.country}
            onChange={(e) => onFilterChange('country', e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Countries</option>
            {filterOptions.countries?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button onClick={onClearFilters} style={styles.clearButton}>
              Clear Filters
            </button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={styles.resultCount}>
            {freelancers.length} freelancer{freelancers.length !== 1 ? 's' : ''} found
          </div>
          <button onClick={handleExportCSV} style={styles.exportButton}>
            📥 Export to CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {freelancers.length === 0 ? (
        <div style={styles.empty}>
          {hasActiveFilters ? 'No freelancers match your filters' : 'No freelancers yet'}
        </div>
      ) : (
        <div style={styles.table}>
      <table style={styles.tableElement}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Tier</th>
            <th style={styles.th}>Grade</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {freelancers.map((fl) => (
            <tr key={fl.id} style={styles.tr}>
              <td style={styles.td}>{fl.freelancerId}</td>
              <td style={styles.td}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/admin/freelancers/${fl.id}`);
                  }}
                  style={styles.linkStyle}
                >
                  {fl.firstName} {fl.lastName}
                </a>
              </td>
              <td style={styles.td}>{fl.email}</td>
              <td style={styles.td}>
                {fl.city}, {fl.country}
              </td>
              <td style={styles.td}>
                <span style={getStatusBadgeStyle(fl.status)}>{fl.status}</span>
              </td>
              <td style={styles.td}>{fl.currentTier}</td>
              <td style={styles.td}>{fl.currentGrade}</td>
              <td style={styles.td}>
                <button
                  onClick={() => navigate(`/admin/freelancers/${fl.id}`)}
                  style={styles.viewButton}
                >
                  View Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <strong style={styles.detailLabel}>{label}:</strong>
      <span style={styles.detailValue}> {value}</span>
    </div>
  );
}

function formatFieldLabel(fieldName) {
  // Convert camelCase or snake_case to Title Case
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatFieldValue(value) {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function getStatusBadgeStyle(status) {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  };

  switch (status) {
    case 'ACTIVE':
      return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
    case 'ENGAGED':
      return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'INACTIVE':
      return { ...baseStyle, backgroundColor: '#e5e7eb', color: '#374151' };
    case 'DEACTIVATED':
      return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      return baseStyle;
  }
}

const styles = {
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '30px',
  },
  container: {
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
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0',
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
  tabs: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    padding: '0 40px',
  },
  tab: {
    padding: '16px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  content: {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#9ca3af',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tableElement: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#111827',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#111827',
  },
  detailSection: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#374151',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  detailFull: {
    marginTop: '16px',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: '14px',
    color: '#111827',
  },
  detailText: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
  },
  approveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  rejectButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  linkStyle: {
    color: '#2563eb',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  },
  filterPanel: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  searchInput: {
    flex: '2',
    minWidth: '200px',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
  },
  filterSelect: {
    flex: '1',
    minWidth: '140px',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
  },
  sortButton: {
    padding: '8px 16px',
    backgroundColor: '#f9fafb',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
  },
  resultCount: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  importPanel: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  importButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  importResults: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
  },
  importSummary: {
    fontSize: '14px',
    color: '#374151',
    marginBottom: '12px',
  },
  importErrors: {
    marginTop: '12px',
  },
  errorList: {
    marginTop: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  errorItem: {
    fontSize: '13px',
    color: '#ef4444',
    padding: '4px 0',
    borderBottom: '1px solid #fee2e2',
  },
};