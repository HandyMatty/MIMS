import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  QrcodeOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <Sider collapsible>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        onClick={({ key }) => {
          if (key === 'logout') {
            // Handle logout logic
            console.log('Logging out...');
          } else {
            navigate(key);
          }
        }}
        items={[
          { label: 'Dashboard', key: '/dashboard', icon: <DashboardOutlined /> },
          { label: 'Inventory', key: '/inventory', icon: <AppstoreOutlined /> },
          { label: 'History', key: '/history', icon: <HistoryOutlined /> },
          { label: 'QR Code', key: '/qrcode', icon: <QrcodeOutlined /> },
          { label: 'Users', key: '/users', icon: <UserOutlined /> },
          { label: 'Logout', key: 'logout', icon: <LogoutOutlined />, style: { marginTop: 'auto' } }, // Place logout at the bottom
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
