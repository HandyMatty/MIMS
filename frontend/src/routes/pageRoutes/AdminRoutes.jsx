import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom'; 
import { Auth } from '../ValidAuth';
import { Dashboard, InventoryPage, History, QrCode, Users, Profile, Calendar, Notifications } from '../../pages/index';
import MainLayout from '../../layout/Mainlayout';
import { useAdminAuthStore } from '../../store/admin/useAuth';

const AdminRoutes = () => {
  const isAdminAuthenticated = useAdminAuthStore(state => state.isAuthenticated);

  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<Auth store={useAdminAuthStore} redirect="/login" />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/qrcode" element={<QrCode />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<Calendar/>} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Fallback redirect if route is invalid */}
      <Route
        path="*"
        element={
          <Navigate to={isAdminAuthenticated ? "/admin/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
