import {lazy, Suspense} from 'react';
import { Route, Routes, Navigate } from 'react-router-dom'; 
import { Auth } from '../ValidAuth';
import MainLayout from '../../layout/Mainlayout';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { Spin } from 'antd';
import SINSSILogo from "../../../assets/SINSSI_LOGO-removebg-preview.png";

const Dashboard = lazy (() => import('../../pages/Dashboard'));
const InventoryPage = lazy (() => import('../../pages/InventoryPage'));
const History = lazy (() => import('../../pages/History'));
const QrCode = lazy (() => import('../../pages/QrCode'));
const Users = lazy (() => import('../../pages/Users'));
const Profile = lazy (() => import('../../pages/Header/Profile'));
const Calendar = lazy (() => import('../../pages/Header/Calendar'));
const Notifications = lazy (() => import('../../pages/Header/Notifications'));

const AdminRoutes = () => {
  const isAdminAuthenticated = useAdminAuthStore(state => state.isAuthenticated);

  return (
  <Suspense fallback={<div className="flex flex-col items-center justify-center h-screen bg-honeydew">
    <img
      className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
      src={SINSSILogo} alt="SINSSI Logo"
    />
    <Spin size="large" />
    <p className="mt-4 text-darkslategray-200">Loading...</p>
  </div>}>
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
  </Suspense>
  );
};

export default AdminRoutes;
