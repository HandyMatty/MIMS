import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ForgotPassword, Login } from '../../pages/index';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';

const PublicRoutes = () => {
  const isAdminAuthenticated = useAdminAuthStore(state => state.isAuthenticated);
  const isUserAuthenticated = useUserAuthStore(state => state.isAuthenticated);
  
  return (
    <Routes>
      {/* Redirect authenticated users away from the login page */}
      <Route
        path="/login"
        element={
          isAdminAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : isUserAuthenticated ? (
            <Navigate to="/user/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/forgotpassword"
        element={
          isAdminAuthenticated || isUserAuthenticated ? (
            <Navigate to={isAdminAuthenticated ? "/admin/dashboard" : "/user/dashboard"} replace />
          ) : (
            <ForgotPassword />
          )
        }
      />    
      {/* Redirect all other routes to /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default PublicRoutes;
