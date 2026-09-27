import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppLayout from './layouts/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminInterviews from './pages/admin/AdminInterviews';
import AdminPlacements from './pages/admin/AdminPlacements';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentOpportunities from './pages/student/StudentOpportunities';
import StudentApplications from './pages/student/StudentApplications';
import StudentInterviews from './pages/student/StudentInterviews';
import StudentPlacement from './pages/student/StudentPlacement';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';
import RecruiterInterviews from './pages/recruiter/RecruiterInterviews';

// ─── Route Guard ────────────────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return <AppLayout>{children}</AppLayout>;
};

// ─── Root Redirect ───────────────────────────────────────────────────────────
const RootRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/recruiter/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStudents /></ProtectedRoute>} />
      <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCompanies /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}><AdminJobs /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}><AdminApplications /></ProtectedRoute>} />
      <Route path="/admin/interviews" element={<ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}><AdminInterviews /></ProtectedRoute>} />
      <Route path="/admin/placements" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPlacements /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/opportunities" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentOpportunities /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentApplications /></ProtectedRoute>} />
      <Route path="/student/interviews" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentInterviews /></ProtectedRoute>} />
      <Route path="/student/placement" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentPlacement /></ProtectedRoute>} />

      {/* Recruiter Routes */}
      <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterJobs /></ProtectedRoute>} />
      <Route path="/recruiter/applications" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterApplications /></ProtectedRoute>} />
      <Route path="/recruiter/interviews" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterInterviews /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
