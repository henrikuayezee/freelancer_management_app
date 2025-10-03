/**
 * Main App Component
 * Handles routing and authentication
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ApplyPage from './pages/ApplyPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardOverview from './pages/AdminDashboardOverview';
import FreelancersListPage from './pages/FreelancersListPage';
import FreelancerDetailPage from './pages/FreelancerDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PerformancePage from './pages/PerformancePage';
import TieringPage from './pages/TieringPage';
import FreelancerDashboard from './pages/FreelancerDashboard';
import FreelancerProjectsPage from './pages/FreelancerProjectsPage';
import FreelancerMyProjectsPage from './pages/FreelancerMyProjectsPage';
import FreelancerProfilePage from './pages/FreelancerProfilePage';
import FreelancerPerformancePage from './pages/FreelancerPerformancePage';
import FreelancerPayments from './pages/FreelancerPayments';
import UsersPage from './pages/UsersPage';
import AdminPayments from './pages/AdminPayments';
import FormBuilderPage from './pages/FormBuilderPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/freelancers"
            element={
              <ProtectedRoute>
                <FreelancersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/freelancers/:id"
            element={
              <ProtectedRoute>
                <FreelancerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/performance"
            element={
              <ProtectedRoute>
                <PerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tiering"
            element={
              <ProtectedRoute>
                <TieringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/form-builder"
            element={
              <ProtectedRoute>
                <FormBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer"
            element={
              <ProtectedRoute role="FREELANCER">
                <FreelancerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/projects"
            element={
              <ProtectedRoute role="FREELANCER">
                <FreelancerProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/my-projects"
            element={
              <ProtectedRoute role="FREELANCER">
                <FreelancerMyProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/profile"
            element={
              <ProtectedRoute role="FREELANCER">
                <FreelancerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/performance"
            element={
              <ProtectedRoute role="FREELANCER">
                <FreelancerPerformancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancer/payments"
            element={
              <ProtectedRoute role="FREELANCER">
                <FreelancerPayments />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
            <a href="/">Go Home</a>
          </div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Role-based redirect
  if (role && user?.role !== role) {
    // If user is trying to access freelancer routes but is admin, redirect to admin
    if (role === 'FREELANCER' && user?.role === 'ADMIN') {
      return <Navigate to="/admin" />;
    }
    // If user is trying to access admin routes but is freelancer, redirect to freelancer
    if (!role && user?.role === 'FREELANCER') {
      return <Navigate to="/freelancer" />;
    }
  }

  return children;
}

export default App;