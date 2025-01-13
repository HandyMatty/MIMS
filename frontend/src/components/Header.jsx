import React, { useEffect, useState } from 'react';
import { Layout, Menu, Badge } from 'antd';
import { BellOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';
import Cookies from 'js-cookie';
import { useNotification } from '../utils/NotificationContext';

const { Header } = Layout;

const HeaderBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  
  const [username, setUsername] = useState(null);
  const { notifications } = useNotification(); // Fetch notifications from context

  // Dynamically calculate unread notifications count
  const unreadNotifications = notifications.filter((notif) => !notif.read).length;

  const isAdmin = !!(adminAuth.token && adminAuth.userData);
  const isUser = !!(userAuth.token && userAuth.userData);

  // Fetch username from cookies if not available in the store
  useEffect(() => {
    if (isAdmin) {
      setUsername(adminAuth.userData?.username || Cookies.get('username'));
    } else if (isUser) {
      setUsername(userAuth.userData?.username || Cookies.get('username'));
    }
  }, [adminAuth, userAuth, isAdmin, isUser]);

  const onClick = (e) => {
    if (e.key === '/profile') {
      if (isAdmin) {
        navigate('/admin/profile', { replace: true });
      } else if (isUser) {
        navigate('/user/profile', { replace: true });
      }
    } else if (e.key === '/calendar') {
      if (isAdmin) {
        navigate('/admin/calendar', { replace: true });
      } else if (isUser) {
        navigate('/user/calendar', { replace: true });
      }
    } else if (e.key === '/notifications') {
      if (isAdmin) {
        navigate('/admin/notifications', { replace: true });
      } else if (isUser) {
        navigate('/user/notifications', { replace: true });
      }
    }
  };

  const items = [
    {
      key: '/profile',
      icon: (
        <div
          className={`custom-avatar-icon ${
            location.pathname === '/admin/profile' || location.pathname === '/user/profile' ? 'active' : ''
          }`}
        >
          <UserOutlined />
        </div>
      ),
    },
    {
      key: '/calendar',
      icon: (
        <div
          className={`custom-avatar-icon ${
            location.pathname === '/admin/calendar' || location.pathname === '/user/calendar' ? 'active' : ''
          }`}
        >
          <CalendarOutlined />
        </div>
      ),
    },
    {
      key: '/notifications',
      icon: (
        <Badge count={unreadNotifications} offset={[-11, 12]} size="small" showZero={false}>
          <div
            className={`custom-avatar-icon ${
              location.pathname === '/admin/notifications' || location.pathname === '/user/notifications' ? 'active' : ''
            }`}
          >
            <BellOutlined />
          </div>
        </Badge>
      ),
    },
  ];

  return (
    <Header
      className="site-layout-background"
      style={{
        padding: 0,
        background: '#072C1C',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '20px' }}>
        <Menu
          onClick={onClick}
          selectedKeys={[location.pathname]}
          mode="horizontal"
          items={[items[0]]}
          style={{ margin: 0, padding: 0, background: '#072C1C' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', paddingRight: '20px' }}>
        <Menu
          onClick={onClick}
          selectedKeys={[location.pathname]}
          mode="horizontal"
          items={[items[1], items[2]]}
          style={{ margin: 0, padding: 0, background: '#072C1C' }}
        />
      </div>
    </Header>
  );
};

export default HeaderBar;
