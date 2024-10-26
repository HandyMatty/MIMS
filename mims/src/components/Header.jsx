import { Layout, Menu, Dropdown, Avatar } from 'antd';
import {
  CalendarOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header } = Layout;

const HeaderBar = () => {
  const profileMenu = (
    <Menu>
      <Menu.Item key="1">View Profile</Menu.Item>
      <Menu.Item key="2">Settings</Menu.Item>
      <Menu.Item key="3">Logout</Menu.Item>
    </Menu>
  );

  return (
    <Header
      className="site-layout-background"
      style={{ padding: 0, background: '#fff' }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '20px' }}>
        <Menu mode="horizontal" selectable={false}>
          <Menu.Item key="calendar" icon={<CalendarOutlined />} />
          <Menu.Item key="notifications" icon={<BellOutlined />} />
          <Menu.Item key="profile">
            <Dropdown overlay={profileMenu} placement="bottomRight">
              <Avatar icon={<UserOutlined />} />
            </Dropdown>
          </Menu.Item>
        </Menu>
      </div>
    </Header>
  );
};

export default HeaderBar;
