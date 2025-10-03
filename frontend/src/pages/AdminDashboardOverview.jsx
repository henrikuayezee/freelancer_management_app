/**
 * Admin Dashboard Overview
 * Analytics dashboard with statistics and charts
 */

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { dashboardAPI } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Failed to load dashboard statistics</p>
          <button onClick={loadStats} style={buttonStyle}>Retry</button>
        </div>
      </AdminLayout>
    );
  }

  // Prepare chart data
  const countryData = stats.countryBreakdown.map(item => ({
    name: item.country,
    value: item.count
  }));

  const genderData = stats.genderBreakdown.map(item => ({
    name: item.gender === 'M' ? 'Male' : item.gender === 'F' ? 'Female' : item.gender,
    value: item.count
  }));

  const annotationTypeData = stats.annotationExpertise.byType.map(item => ({
    name: item.type,
    value: item.count
  }));

  const annotationMethodData = stats.annotationExpertise.byMethod.map(item => ({
    name: item.method,
    value: item.count
  }));

  return (
    <AdminLayout>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            FREELANCER DASHBOARD - OVERVIEW
          </h1>
        </div>

        {/* Top Statistics Row */}
        <div style={statsRowStyle}>
          {/* Total Freelancers */}
          <div style={statCardStyle}>
            <h3 style={statTitleStyle}>Total Freelancers</h3>
            <p style={statValueStyle}>{stats.overview.totalFreelancers}</p>
          </div>

          {/* Active Freelancers */}
          <div style={statCardStyle}>
            <h3 style={statTitleStyle}>Active Freelancers</h3>
            <p style={statValueStyle}>{stats.overview.activeFreelancers}</p>
          </div>

          {/* Workforce Levels */}
          <div style={{ ...statCardStyle, flex: 2 }}>
            <h3 style={statTitleStyle}>Workforce Levels</h3>
            <div style={tierRowStyle}>
              <div style={tierItemStyle}>
                <span style={tierLabelStyle}>Platinum</span>
                <span style={tierValueStyle}>{stats.workforceLevels.PLATINUM}</span>
              </div>
              <div style={tierItemStyle}>
                <span style={tierLabelStyle}>Gold</span>
                <span style={tierValueStyle}>{stats.workforceLevels.GOLD}</span>
              </div>
              <div style={tierItemStyle}>
                <span style={tierLabelStyle}>Silver</span>
                <span style={tierValueStyle}>{stats.workforceLevels.SILVER}</span>
              </div>
              <div style={tierItemStyle}>
                <span style={tierLabelStyle}>Bronze</span>
                <span style={tierValueStyle}>{stats.workforceLevels.BRONZE}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={chartsRowStyle}>
          {/* Country Breakdown */}
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>Country Breakdown</h3>
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', padding: '40px' }}>No data available</p>
            )}
          </div>

          {/* Gender Breakdown */}
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>Gender Breakdown</h3>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', padding: '40px' }}>No data available</p>
            )}
          </div>
        </div>

        {/* Annotation Expertise Row */}
        <div style={chartsRowStyle}>
          {/* Annotation Expertise by Type */}
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>Annotation Expertise by Type</h3>
            {annotationTypeData.length > 0 ? (
              <div style={listStyle}>
                {annotationTypeData.map((item, index) => (
                  <div key={index} style={listItemStyle}>
                    <span style={listLabelStyle}>{item.name}</span>
                    <span style={listValueStyle}>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '40px' }}>No data available</p>
            )}
          </div>

          {/* Annotation Experience by Method */}
          <div style={chartCardStyle}>
            <h3 style={chartTitleStyle}>Annotation Experience by Method</h3>
            {annotationMethodData.length > 0 ? (
              <div style={listStyle}>
                {annotationMethodData.map((item, index) => (
                  <div key={index} style={listItemStyle}>
                    <span style={listLabelStyle}>{item.name}</span>
                    <span style={listValueStyle}>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '40px' }}>No data available</p>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div style={statsRowStyle}>
          <div style={statCardStyle}>
            <h3 style={statTitleStyle}>Projects</h3>
            <p style={statNoteStyle}>How many are ongoing</p>
            <p style={statValueStyle}>{stats.overview.ongoingProjects}</p>
          </div>

          <div style={statCardStyle}>
            <h3 style={statTitleStyle}>Total Projects</h3>
            <p style={statValueStyle}>{stats.overview.totalProjects}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Styles
const containerStyle = {
  padding: '30px',
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
};

const headerStyle = {
  backgroundColor: '#b8d4f1',
  padding: '20px',
  marginBottom: '30px',
  border: '2px solid #333',
  borderRadius: '8px',
  textAlign: 'center',
};

const statsRowStyle = {
  display: 'flex',
  gap: '20px',
  marginBottom: '30px',
};

const statCardStyle = {
  backgroundColor: '#d6e9f8',
  padding: '30px',
  borderRadius: '8px',
  border: '1px solid #999',
  flex: 1,
  textAlign: 'center',
};

const statTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '15px',
  color: '#333',
};

const statValueStyle = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#333',
  margin: '10px 0',
};

const statNoteStyle = {
  fontSize: '12px',
  color: '#666',
  marginBottom: '10px',
};

const tierRowStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: '20px',
};

const tierItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const tierLabelStyle = {
  fontSize: '14px',
  fontWeight: 'normal',
  marginBottom: '8px',
};

const tierValueStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
};

const chartsRowStyle = {
  display: 'flex',
  gap: '20px',
  marginBottom: '30px',
};

const chartCardStyle = {
  backgroundColor: '#d6e9f8',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #999',
  flex: 1,
};

const chartTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '15px',
  textAlign: 'center',
  color: '#333',
};

const listStyle = {
  padding: '10px',
};

const listItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 20px',
  borderBottom: '1px solid #ccc',
};

const listLabelStyle = {
  fontSize: '14px',
  fontWeight: 'normal',
};

const listValueStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
};
