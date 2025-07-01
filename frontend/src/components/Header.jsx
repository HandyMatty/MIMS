import { Suspense } from 'react';
import { Layout, Badge, Modal, Spin, Tooltip } from 'antd';
import { BellOutlined, UserOutlined, CalendarOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';
import { useGuestAuthStore } from '../store/guest/useAuth';
import { useNotification } from '../utils/NotificationContext';
import { useTheme } from '../utils/ThemeContext';
import ThemeToggle from './common/ThemeToggle';
import { Menu } from 'antd';

const { Header } = Layout;

const HeaderBar = ({ onMobileMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  const guestAuth = useGuestAuthStore();

  const { notifications } = useNotification();

  const isAdmin = !!(adminAuth.token && adminAuth.userData);
  const isUser = !!(userAuth.token && userAuth.userData);
  const isGuest = !!(guestAuth.token && guestAuth.userData);

  const guestFallback = !isAdmin && !isUser;
  const unreadNotifications = guestFallback ? 0 : notifications.filter((notif) => !notif.read).length;

  const onClick = (e) => {
    if (e.key === '/profile') {
      if (guestFallback) {
        Modal.info({
          title: "Guests Don't Have Profile",
          content: 'You are currently logged in as a guest and cannot access a profile.',
          onOk() {},
        });
      } else if (isAdmin) {
        navigate('/admin/profile', { replace: true });
      } else if (isUser) {
        navigate('/user/profile', { replace: true });
      }
    } else if (e.key === '/calendar') {
      if (isAdmin) {
        navigate('/admin/calendar', { replace: true });
      } else if (isUser) {
        navigate('/user/calendar', { replace: true });
      } else {
        navigate('/guest/calendar', { replace: true });
      }
    } else if (e.key === '/notifications') {
      if (isAdmin) {
        navigate('/admin/notifications', { replace: true });
      } else if (isUser) {
        navigate('/user/notifications', { replace: true });
      } else {
        navigate('/guest/notifications', { replace: true });
      }
    }
  };

  const items = [
    {
      key: '/profile',
      icon: (
      <Tooltip title="Profile" >
        <div
          className={`custom-avatar-icon ${
            location.pathname === '/admin/profile' || location.pathname === '/user/profile' ? 'active' : ''
          }`}
        >
          <UserOutlined />
        </div>
      </Tooltip>
      ),
    },
    {
      key: '/calendar',
      icon: (
      <Tooltip title="Calendar">
        <div
          className={`custom-avatar-icon ${
            location.pathname === '/admin/calendar' || location.pathname === '/user/calendar' ? 'active' : ''
          }`}
        >
          <CalendarOutlined />
        </div>
      </Tooltip>
      ),
    },
    {
      key: '/notifications',
      icon: (
      <Tooltip title="Notifications">
        <Badge count={unreadNotifications} offset={[-11, 12]} size="small" showZero={false}>
          <div
            className={`custom-avatar-icon ${
              location.pathname === '/admin/notifications' || location.pathname === '/user/notifications' ? 'active' : ''
            }`}
          >
            <BellOutlined />
          </div>
        </Badge>
      </Tooltip>
      ),
    },
  ];

  return (
    <Header
      className="site-layout-background flex justify-between items-center"
      style={{
        padding: 0,
        background: theme.header,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Mobile menu button */}
      <div className="flex items-center pl-4">
        <MenuOutlined
          className="block sm:hidden"
          style={{ fontSize: 20, color: theme.textLight, cursor: 'pointer' }}
          onClick={onMobileMenuClick}
        />
        {/* Profile icon (desktop & mobile) */}
        <Suspense fallback={<Spin size="small" />}>
          <Menu
            onClick={onClick}
            selectedKeys={[location.pathname]}
            mode="horizontal"
            items={[items[0]]}
            style={{ margin: 0, padding: 0, background: theme.header }}
            className='gap-2'
          />
        </Suspense>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px', gap: '8px' }}>
        <ThemeToggle />
        <Suspense fallback={<Spin size="small" />}>
          <Menu
            onClick={onClick}
            selectedKeys={[location.pathname]}
            mode="horizontal"
            items={[items[1], items[2]]}
            style={{ margin: 0, padding: 0, background: theme.header }}
          />
        </Suspense>
      </div>
    </Header>
  );
};

export default HeaderBar;