import { Route, Routes, Navigate } from 'react-router-dom';
import { ForgotPassword, Login } from '../../pages/index';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { useGuestAuthStore } from '../../store/guest/useAuth';

const PublicRoutes = () => {
  const isAdminAuthenticated = useAdminAuthStore(state => state.isAuthenticated);
  const isUserAuthenticated = useUserAuthStore(state => state.isAuthenticated);
  const isGuestAuthenticated = useGuestAuthStore(state => state.isAuthenticated); // Check guest auth

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAdminAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : isUserAuthenticated ? (
            <Navigate to="/user/dashboard" replace />
          ) : isGuestAuthenticated ? (
            <Navigate to="/guest/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/forgotpassword"
        element={
          isAdminAuthenticated || isUserAuthenticated || isGuestAuthenticated ? (
            <Navigate to={isAdminAuthenticated ? "/admin/dashboard" : isUserAuthenticated ? "/user/dashboard" : "/guest/dashboard"} replace />
          ) : (
            <ForgotPassword />
          )
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default PublicRoutes;
