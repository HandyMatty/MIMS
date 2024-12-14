import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom'; 
import { Auth } from '../ValidAuth';
import { Dashboard, InventoryPage, History, QrCode, Profile, Calendar, Notifications } from '../../pages/index';
import MainLayout from '../../layout/Mainlayout';
import { useUserAuthStore } from '../../store/user/useAuth';

const UserRoutes = () => {
  const isUserAuthenticated = useUserAuthStore(state => state.isAuthenticated);

  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<Auth store={useUserAuthStore} redirect="/login" />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/qrcode" element={<QrCode />} />
          <Route path="/profile" element={<Profile />} /> 
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Fallback redirect if route is invalid */}
      <Route
        path="*"
        element={
          <Navigate to={isUserAuthenticated ? "/user/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
};

export default UserRoutes;
