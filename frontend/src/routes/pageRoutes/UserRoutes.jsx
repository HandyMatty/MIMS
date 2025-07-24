import {lazy, Suspense, useEffect} from 'react';
import { Route, Routes, Navigate } from 'react-router-dom'; 
import { Auth } from '../ValidAuth';
import MainLayout from '../../layout/Mainlayout';
import { useUserAuthStore } from '../../store/user/useAuth';
import { Spin } from 'antd';
import SINSSILogo from "../../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage, preloadImages } from '../../utils/imageHelpers.jsx';
import Profile from '../../pages/Header/Profile';
import ProcurementPage from '../../pages/ProcurementPage';

const Dashboard = lazy (() => import('../../pages/Dashboard'));
const InventoryPage = lazy (() => import('../../pages/InventoryPage'));
const History = lazy (() => import('../../pages/History'));
const QrCode = lazy (() => import('../../pages/QrCode'));
const Calendar = lazy (() => import('../../pages/Header/Calendar'));
const Notifications = lazy (() => import('../../pages/Header/Notifications'));

const UserRoutes = () => {
  const isUserAuthenticated = useUserAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-honeydew">
        <LazyImage
          className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
          src={SINSSILogo}
          alt="SINSSI Logo"
          width={171}
          height={183}
        />
        <Spin size="large" />
        <p className="mt-4 text-darkslategray-200">Loading...</p>
      </div>
    }>
      <Routes>
        <Route element={<Auth store={useUserAuthStore} redirect="/login" />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/procurement" element={<ProcurementPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/qrcode" element={<QrCode />} />
            <Route path="/profile" element={<Profile />} /> 
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate to={isUserAuthenticated ? "/user/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
