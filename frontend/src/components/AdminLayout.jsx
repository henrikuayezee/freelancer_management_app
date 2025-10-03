/**
 * Admin Layout Component
 * Provides consistent navigation with dropdown menus across admin pages
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  // Menu structure with dropdowns
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      submenu: [
        { label: 'Overview', path: '/admin' },
      ]
    },
    {
      label: 'Applications',
      submenu: [
        { label: 'All Applications', path: '/admin/applications' },
        { label: 'Pending Applications', path: '/admin/applications?status=PENDING' },
        { label: 'Approved Applications', path: '/admin/applications?status=APPROVED' },
        { label: 'Rejected Applications', path: '/admin/applications?status=REJECTED' },
        { label: 'Form Builder', path: '/admin/form-builder' },
      ]
    },
    {
      label: 'Freelancers',
      submenu: [
        { label: 'All Freelancers', path: '/admin/freelancers' },
        { label: 'Active Freelancers', path: '/admin/freelancers?status=ACTIVE' },
        { label: 'Inactive Freelancers', path: '/admin/freelancers?status=INACTIVE' },
      ]
    },
    {
      label: 'Projects',
      submenu: [
        { label: 'All Projects', path: '/admin/projects' },
        { label: 'Active Projects', path: '/admin/projects?status=ACTIVE' },
        { label: 'Completed Projects', path: '/admin/projects?status=COMPLETED' },
      ]
    },
    {
      label: 'Performance',
      submenu: [
        { label: 'Performance Tracking', path: '/admin/performance' },
        { label: 'Performance Reports', path: '/admin/performance?view=reports' },
      ]
    },
    {
      label: 'Tiering',
      path: '/admin/tiering',
      submenu: [
        { label: 'Tier Management', path: '/admin/tiering' },
      ]
    },
    {
      label: 'Payments',
      submenu: [
        { label: 'All Payments', path: '/admin/payments' },
        { label: 'Pending Payments', path: '/admin/payments?status=PENDING' },
        { label: 'Approved Payments', path: '/admin/payments?status=APPROVED' },
        { label: 'Paid Payments', path: '/admin/payments?status=PAID' },
      ]
    },
    {
      label: 'Users',
      path: '/admin/users',
      submenu: [
        { label: 'User Management', path: '/admin/users' },
      ]
    },
  ];

  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState(null);

  const handleMouseEnter = (index) => {
    setOpenDropdown(index);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setOpenDropdown(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={{ ...styles.title, cursor: 'pointer' }} onClick={() => navigate('/admin')}>
            Freelancer Management Platform
          </h1>
          <p style={styles.subtitle}>Welcome, {user?.email}</p>
        </div>
        <div style={styles.headerRight}>
          <NotificationBell />
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Menu with Dropdowns */}
      <div style={styles.menuBar}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={styles.menuItem}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              style={{
                ...styles.menuButton,
                backgroundColor: hoveredButton === index ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
              onClick={() => item.path && handleMenuClick(item.path)}
              onMouseEnter={() => setHoveredButton(index)}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {item.label}
              {item.submenu && item.submenu.length > 1 && (
                <span style={styles.arrow}>▼</span>
              )}
            </button>

            {/* Dropdown Menu */}
            {item.submenu && openDropdown === index && (
              <div style={styles.dropdown}>
                {item.submenu.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    style={{
                      ...styles.dropdownItem,
                      backgroundColor: hoveredDropdownItem === `${index}-${subIndex}` ? '#f3f4f6' : 'transparent',
                    }}
                    onClick={() => handleMenuClick(subItem.path)}
                    onMouseEnter={() => setHoveredDropdownItem(`${index}-${subIndex}`)}
                    onMouseLeave={() => setHoveredDropdownItem(null)}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.content}>{children}</div>
    </div>
  );
}

const styles = {
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
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
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
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  menuBar: {
    backgroundColor: '#2563eb',
    display: 'flex',
    padding: '0',
    position: 'relative',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  menuItem: {
    position: 'relative',
  },
  menuButton: {
    padding: '16px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  },
  arrow: {
    fontSize: '10px',
    marginLeft: '4px',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'white',
    minWidth: '220px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderRadius: '0 0 4px 4px',
    zIndex: 1000,
    border: '1px solid #e5e7eb',
    borderTop: 'none',
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    transition: 'background-color 0.2s',
    display: 'block',
  },
  content: {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
};
