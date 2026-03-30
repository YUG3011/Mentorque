import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Homepage from '../pages/Homepage';
import UserLogin from '../pages/auth/UserLogin';
import MentorLogin from '../pages/auth/MentorLogin';
import AdminLogin from '../pages/auth/AdminLogin';
import UserDashboard from '../pages/user/UserDashboard';
import MentorDashboard from '../pages/mentor/MentorDashboard';
import AdminLayout from '../pages/admin/AdminLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login/user" element={<UserLogin />} />
      <Route path="/login/mentor" element={<MentorLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />

      {/* User dashboard */}
      <Route
        path="/dashboard/user/*"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Mentor dashboard */}
      <Route
        path="/dashboard/mentor"
        element={
          <ProtectedRoute allowedRoles={['MENTOR']}>
            <MentorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin dashboard */}
      <Route
        path="/dashboard/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
