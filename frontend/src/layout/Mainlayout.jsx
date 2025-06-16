import React, { useState, useEffect, Suspense } from 'react';
import { Layout, Menu, Spin, Modal, message, Drawer } from 'antd';
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
const HeaderBar = React.lazy(() => import('../components/Header.jsx'));
const NoticeModal = React.lazy(() => import('../components/Notice/NoticeModal'));
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';
import { useGuestAuthStore } from '../store/guest/useAuth';
import { logoutUser } from '../services/api/logout';
import { useActivity } from '../utils/ActivityContext';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage, preloadImages } from '../utils/imageHelpers.jsx';

const { Sider } = Layout;

const MainLayout = () => {
  const initialCollapsedState = JSON.parse(localStorage.getItem('sidebarCollapsed')) || false;

  const [collapsed, setCollapsed] = useState(initialCollapsedState);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState('/dashboard');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  const guestAuth = useGuestAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { logUserActivity } = useActivity();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isAdmin = adminAuth.token && adminAuth.userData;
  const isUser = userAuth.token && userAuth.userData;
  const isGuest = guestAuth.token && guestAuth.userData;

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

  const guestItems = [
    { label: 'Dashboard', key: '/guest/dashboard', icon: <DashboardOutlined style={{ fontSize: '20px' }} /> },
    { label: 'Inventory', key: '/guest/inventory', icon: <AppstoreOutlined style={{ fontSize: '20px' }} /> },
    { label: 'History', key: '/guest/history', icon: <HistoryOutlined style={{ fontSize: '20px' }} /> },
    { label: 'QR Code', key: '/guest/qrcode', icon: <QrcodeOutlined style={{ fontSize: '20px' }} /> },
  ];

  const items = isAdmin ? adminItems : isUser ? userItems : isGuest ? guestItems : [];

  const handleLogout = async () => {
    try {
      let role, username;
      if (isAdmin) {
        role = "admin";
        username = adminAuth.userData.username;
      } else if (isUser) {
        role = "user";
        username = userAuth.userData.username;
      } else if (isGuest) {
        role = "guest";
        username = guestAuth.userData.username;
      }
  
      if (!role || !username) {
        console.error("No user role detected for logout.");
        return;
      }
  
      const { success } = await logoutUser(role);
  
      if (success) {
        logUserActivity(username, "Logout", `User ${username} just logged out`);
  
        // Reset the correct auth store
        if (role === "admin") adminAuth.reset();
        if (role === "user") userAuth.reset();
        if (role === "guest") guestAuth.reset();
  
        // Clear all storages and cookies
        sessionStorage.clear();
        localStorage.clear();
        Cookies.remove("authToken", { path: '/' });
        
        localStorage.setItem("logout", JSON.stringify({ token: adminAuth.token || userAuth.token || guestAuth.token, time: Date.now() }));
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error during logout:", error);
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
    setLoading(true)
    setTimeout (() => {
      handleLogout();}, 1000);

  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const checkCookiePresence = async () => {
      const username =
        adminAuth?.userData?.username ||
        userAuth?.userData?.username ||
        guestAuth?.userData?.username;
    
      if (!username) return;
    
      const tokenCookie = Cookies.get(`authToken_${username}`);
      
      if (!tokenCookie) {
        message.warning("Your session has expired or was removed. You have been logged out.", 3);
    
        setLoading(true); // ✅ Trigger your loading screen
    
        setTimeout(async () => {
          logUserActivity(username, "Logout", `User ${username} was automatically logged out due to missing auth cookie.`);
    
          const role = adminAuth.token ? "admin" : userAuth.token ? "user" : guestAuth.token ? "guest" : null;
          if (role) await logoutUser(role);
    
          adminAuth.reset();
          userAuth.reset();
          guestAuth.reset();
          sessionStorage.clear();
          localStorage.clear();
          Cookies.remove("authToken", { path: '/' });
    
          navigate("/login", { replace: true }); // ✅ Delayed so loading screen is seen
        }, 1000); // short delay to allow spinner to render
      }
    };
  
    checkCookiePresence(); // Run once on load
  
    const interval = setInterval(checkCookiePresence, 15000); // Then every 15 seconds
  
    return () => clearInterval(interval);
  }, [adminAuth, userAuth, guestAuth, navigate, logUserActivity]);  
  
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
        try {
          const logoutData = JSON.parse(event.newValue);
          if (!logoutData || !logoutData.token) return;
  
          if ((isAdmin && adminAuth.token === logoutData.token) || (isUser && userAuth.token === logoutData.token)) {
            adminAuth.reset();
            userAuth.reset();
            guestAuth.reset();
            sessionStorage.clear();
            localStorage.clear();
            Cookies.remove("authToken", { path: '/' });
            navigate("/login", { replace: true });
          }
        } catch (error) {
          console.error("Error handling logout event:", error);
        }
      }
  
      if (event.key === "usernameChange") {
        try {
          const updatedUserData = JSON.parse(event.newValue);
          if (!updatedUserData || !updatedUserData.username) return;
  
          // Check which auth store should be updated
          if (isAdmin) {
            adminAuth.setUserData(updatedUserData);
          } else if (isUser) {
            userAuth.setUserData(updatedUserData);
          } else if (isGuest) {
            guestAuth.setUserData(updatedUserData);
          }
  
          message.success("Username updated successfully!");
        } catch (error) {
          console.error("Error updating username from storage event:", error);
        }
      }
    };
  
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [adminAuth, userAuth, guestAuth, isAdmin, isUser, isGuest, navigate]);  
  
  useEffect(() => {
    // Preload critical images
    preloadImages([SINSSILogo]);
  }, []);

  if (loading) {
    return (
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
    );
  }

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
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <NoticeModal />
        <Drawer
          placement="top"
          open={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          style={{
            backgroundColor: '#0C9B4B',
            width: 'auto',
            height: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LazyImage
                  style={{ height: '23px', objectFit: 'cover', filter: 'brightness(50%)' }}
                  src={SINSSILogo}
                  alt="SINSSI Logo"
                  width={20}
                  height={23}
                />
                {!collapsed && (
                  <span
                    style={{
                      color: '#072C1C',
                      fontSize: '22px',
                      fontWeight: '600',
                      marginLeft: '8px',
                      fontFamily: 'Rubik, sans-serif',
                    }}
                  >
                    MIMS
                  </span>
                )}
              </div>
          <Menu
            className='bg-inherit w-auto text-black justify-self-center'
            mode="vertical"
            style={{border: 'none'}}
            selectedKeys={[current]}
            onClick={(e) => {
              setShowMobileMenu(false);
              onClick(e);
            }}
            items={[
              ...items,
              {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined style={{ fontSize: '20px', paddingTop: 15 }} />,
              },
            ]}
          />
        </Drawer>

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
          className='hidden sm:block'
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <LazyImage
                  style={{ height: '43px', objectFit: 'cover', filter: 'brightness(50%)' }}
                  src={SINSSILogo}
                  alt="SINSSI Logo"
                  width={40}
                  height={43}
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
          <HeaderBar onMobileMenuClick={() => setShowMobileMenu(true)} />
          <Layout.Content
            style={{
              padding: '10px',
              overflowY: 'auto',
              overflowX: 'auto',
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
          centered
        >
          <p>Are you sure you want to log out?</p>
        </Modal>
      </Layout>
    </Suspense>
  );
};

export default MainLayout;