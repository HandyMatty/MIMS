import { Routes, Route, Navigate } from 'react-router-dom';
import { Auth, UnAuth } from '../ValidAuth'; // Ensure this path is correct
import { useUserAuthStore } from '../../store/user/useAuth'; // Ensure this path is correct
import { Calendar, Dashboard, History, Inventory, Login, Notifications, QRCode } from '../../pages/index.jsx'; // Ensure this path is correct

const UserRoutes = () => (
  <Routes>
    <Route path="*" element={<Navigate to="/login" />} />

    {/* Unauthenticated routes */}
    <Route element={<UnAuth store={useUserAuthStore} redirect="/dashboard" />}>
      <Route path="/login" element={<Login />} />
    </Route>

    {/* Authenticated routes */}
    <Route element={<Auth store={useUserAuthStore} redirect="/login" />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/history" element={<History />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/qrcode" element={<QRCode />} />
      {/* Users page is not included for UserRoutes */}
    </Route>
  </Routes>
);

export default UserRoutes;
