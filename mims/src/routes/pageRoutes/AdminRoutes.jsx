import { Navigate, Route, Routes } from 'react-router-dom';
import { Auth, UnAuth } from '../ValidAuth'; // Ensure this path is correct
import { useAdminAuthStore } from '../../store/admin/useAuth'; // Ensure this path is correct
import { Calendar, Dashboard, History, Inventory, Login, Notifications, Profile, QRCode, Users } from '../../pages/index.jsx'; // Ensure this path is correct

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/" />} />

      {/* Unauthenticated routes */}
      <Route element={<UnAuth store={useAdminAuthStore} redirect="/dashboard" />}>
        <Route path="/" element={<Login />} />
      </Route>

      {/* Authenticated routes */}
      <Route element={<Auth store={useAdminAuthStore} redirect="/login" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/history" element={<History />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/qrcode" element={<QRCode />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
