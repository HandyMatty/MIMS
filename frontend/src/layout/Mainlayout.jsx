import React, { useState, useEffect } from 'react';
import { Layout, Menu, Spin, Modal } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  QrcodeOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
import { HeaderBar } from '../components/index';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';
import { logoutUser } from '../services/api/logout';
import { useActivity } from '../utils/ActivityContext';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";


const { Sider } = Layout;

const MainLayout = () => {
  const initialCollapsedState = JSON.parse(localStorage.getItem('sidebarCollapsed')) || false;

  const [collapsed, setCollapsed] = useState(initialCollapsedState);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState('/dashboard');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { logUserActivity } = useActivity();


  const isAdmin = adminAuth.token && adminAuth.userData;
  const isUser = userAuth.token && userAuth.userData;

  const adminItems = [
    { label: 'Dashboard', key: '/admin/dashboard', icon: <DashboardOutlined style={{ fontSize: '20px' }} /> },
    { label: 'Inventory', key: '/admin/inventory', icon: <AppstoreOutlined style={{ fontSize: '20px' }} /> },
    { label: 'History', key: '/admin/history', icon: <HistoryOutlined style={{ fontSize: '20px' }} /> },
    { label: 'QR Code', key: '/admin/qrcode', icon: <QrcodeOutlined style={{ fontSize: '20px' }} /> },
    { label: 'Users', key: '/admin/users', icon: <UserOutlined style={{ fontSize: '20px' }} /> },
  ];

  const userItems = [
    { label: 'Dashboard', key: '/user/dashboard', icon: <DashboardOutlined style={{ fontSize: '20px' }} /> },
    { label: 'Inventory', key: '/user/inventory', icon: <AppstoreOutlined style={{ fontSize: '20px' }} /> },
    { label: 'History', key: '/user/history', icon: <HistoryOutlined style={{ fontSize: '20px' }} /> },
    { label: 'QR Code', key: '/user/qrcode', icon: <QrcodeOutlined style={{ fontSize: '20px' }} /> },
  ];

  const items = isAdmin ? adminItems : isUser ? userItems : [];

  const handleLogout = async () => {
    try {
      const { success, message } = await logoutUser();
  
      if (success) {
        // Retrieve the username from the auth store
        const username = isAdmin ? adminAuth.userData.username : userAuth.userData.username;
  
        // Log the user activity
        logUserActivity(username, 'Logout', `This user just logged-out`);
    
        // Reset authentication state for the correct role
        if (isAdmin) {
          adminAuth.reset();
        } else if (isUser) {
          userAuth.reset();
        }
  
        // Clear sessionStorage and localStorage for the logged-in user/admin
        if (isAdmin) {
          sessionStorage.removeItem("adminAuth");
          localStorage.removeItem("adminAuth");
        } else if (isUser) {
          sessionStorage.removeItem("userAuth");
          localStorage.removeItem("userAuth");
        }
  
        // Remove unique cookie using username
        if (username) {
          Cookies.remove(`authToken_${username}`);
        }
  
        // Navigate to login screen
        navigate("/login", { replace: true });
      } else {
        console.error(message); // Log the error message if logout was unsuccessful
      }
    } catch (error) {
      console.error("Error during logout:", error); // Log any unexpected errors
    }
  };
  
  
  const onClick = (e) => {
    if (e.key === 'logout') {
      setIsModalVisible(true);
    } else {
      navigate(e.key, { replace: true });
      setCurrent(e.key);
    }
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    handleLogout(); // Call logout if confirmed
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [adminAuth.token, userAuth.token]);

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "logout") {
        const logoutData = JSON.parse(event.newValue);
        if (logoutData && logoutData.token) {
          // Only reset auth if the logged-out token matches the current session's token
          if (isAdmin && adminAuth.token === logoutData.token) {
            adminAuth.reset();
            sessionStorage.clear();
            localStorage.clear();
            Cookies.remove("authToken");
            navigate("/login", { replace: true });
          }
          if (isUser && userAuth.token === logoutData.token) {
            userAuth.reset();
            sessionStorage.clear();
            localStorage.clear();
            Cookies.remove("authToken");
            navigate("/login", { replace: true });
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [adminAuth, userAuth, isAdmin, isUser, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-honeydew">
        <img
          className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
          src={SINSSILogo} alt="SINSSI Logo"
        />
        <Spin size="large" />
        <p className="mt-4 text-darkslategray-200">Loading...</p>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          backgroundColor: '#0C9B4B',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '100vh',
        }}
        trigger={null}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                style={{ height: '40px', objectFit: 'cover', filter: 'brightness(50%)' }}
                src={SINSSILogo} alt="SINSSI Logo"
              />
              {!collapsed && (
                <span
                  style={{
                    color: '#072C1C',
                    fontSize: '32px',
                    fontWeight: '600',
                    marginLeft: '8px',
                    fontFamily: 'Rubik, sans-serif',
                  }}
                >
                  MIMS
                </span>
              )}
            </div>
            <div style={{ marginTop: '36px' }}>
              <MenuOutlined
                style={{ color: '#072C1C', fontSize: '20px', cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            </div>
          </div>

          <Menu
            theme="light"
            mode="inline"
            className="custom-menu"
            style={{ backgroundColor: '#0C9B4B', marginTop: '22px', color: '#072C1C' }}
            selectedKeys={[current]}
            onClick={onClick}
            items={[
              ...items,
              {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined style={{ fontSize: '20px' }} />,
                style: { position: 'absolute', bottom: 50 },
              },
            ]}
          />
        </div>
      </Sider>

      <Layout>
        <HeaderBar />
        <Layout.Content
          style={{
            padding: '10px',
            overflowY: 'auto',
            height: 'calc(100vh - 64px)',
            backgroundColor: '#EAF4E2',
          }}
        >
          <Outlet />
        </Layout.Content>
      </Layout>

      <Modal
        title="Confirm Logout"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Yes, Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
    </Layout>
  );
};

export default MainLayout;
