import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import MyLearningPage from './pages/student/MyLearningPage';
import ManageCoursesPage from './pages/instructor/ManageCoursesPage';
import CourseFormPage from './pages/instructor/CourseFormPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEnrollmentsPage from './pages/admin/AdminEnrollmentsPage';
import ReportsPage from './pages/admin/ReportsPage';
import Layout from './components/layout/Layout';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

        {/* Protected */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Student */}
          <Route path="my-learning" element={<PrivateRoute roles={['student']}><MyLearningPage /></PrivateRoute>} />

          {/* Instructor */}
          <Route path="manage-courses" element={<PrivateRoute roles={['instructor', 'admin']}><ManageCoursesPage /></PrivateRoute>} />
          <Route path="courses/new" element={<PrivateRoute roles={['instructor', 'admin']}><CourseFormPage /></PrivateRoute>} />
          <Route path="courses/:id/edit" element={<PrivateRoute roles={['instructor', 'admin']}><CourseFormPage /></PrivateRoute>} />

          {/* Admin */}
          <Route path="admin/users" element={<PrivateRoute roles={['admin']}><AdminUsersPage /></PrivateRoute>} />
          <Route path="admin/enrollments" element={<PrivateRoute roles={['admin']}><AdminEnrollmentsPage /></PrivateRoute>} />
          <Route path="admin/reports" element={<PrivateRoute roles={['admin']}><ReportsPage /></PrivateRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
