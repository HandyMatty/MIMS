import PropTypes from 'prop-types';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import HeaderBar from './Header';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <HeaderBar />
        <Content style={{ padding: '20px', margin: '24px 16px 0' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

// PropTypes validation
MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
