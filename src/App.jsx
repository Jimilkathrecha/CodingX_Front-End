import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './redux/slices/authSlice';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import MentorLayout from './layouts/MentorLayout';
import PublicLayout from './layouts/PublicLayout';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyCertificatePage from './pages/public/VerifyCertificatePage';
import InternshipsListPage from './pages/public/InternshipsListPage';
import InternshipDetailPage from './pages/public/InternshipDetailPage';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentInternship from './pages/student/MyInternship';
import StudentTasks from './pages/student/Tasks';
import TaskDetailPage from './pages/student/TaskDetail';
import StudentSubmissions from './pages/student/Submissions';
import StudentCertificates from './pages/student/Certificates';
import StudentProfile from './pages/student/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminInternships from './pages/admin/Internships';
import AdminSubmissions from './pages/admin/Submissions';
import AdminCertificates from './pages/admin/Certificates';
import AdminAnalytics from './pages/admin/Analytics';

// Mentor pages
import MentorDashboard from './pages/mentor/Dashboard';
import MentorSubmissions from './pages/mentor/Submissions';

// Route guards
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, initializing } = useSelector(s => s.auth);
  
  if (initializing) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading CodingX...</p>
      </div>
    </div>
  );
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'mentor') return <Navigate to="/mentor" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(getMe());
    else dispatch({ type: 'auth/getMe/rejected' });
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e2e',
            color: '#fff',
            border: '1px solid #2a2a3e',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="internships" element={<InternshipsListPage />} />
          <Route path="internships/:id" element={<InternshipDetailPage />} />
          <Route path="verify/:certificateId" element={<VerifyCertificatePage />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

        {/* Student routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="internship/:id" element={<StudentInternship />} />
          <Route path="tasks" element={<StudentTasks />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="submissions" element={<StudentSubmissions />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="internships" element={<AdminInternships />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Mentor routes */}
        <Route path="/mentor" element={
          <ProtectedRoute roles={['mentor']}>
            <MentorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<MentorDashboard />} />
          <Route path="submissions" element={<MentorSubmissions />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
