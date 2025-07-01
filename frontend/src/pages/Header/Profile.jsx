import { Suspense, useEffect } from 'react';
import { Row, Col, Typography, Divider, Spin } from 'antd';
import SINSSILogo from "../../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage, preloadImages } from '../../utils/imageHelpers.jsx';
import ProfileEdit from '../../components/Profile/ProfileEdit';
import ChangePasswordForm from '../../components/Profile/ChangePasswordForm';
import SecurityQuestion from '../../components/Profile/SecurityQuestion';


const { Title } = Typography;

const Profile = () => {
  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen w-full bg-honeydew">
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
      <div className="container max-w-full">
        <div className='mt-5 flex justify-center sm:justify-start'>
          <Divider style={{ borderColor: '#072C1C' }}>
            <Title level={3}>PROFILE</Title>
          </Divider>
        </div>
        <Row gutter={[16, 16]} justify="center" align="middle" className='mt-5'>
          <Col xs={24} md={10}>
            <ProfileEdit />
          </Col>
          <Col xs={24} md={10}>
            <ChangePasswordForm />
          </Col>
        </Row>
        <Row justify="center" align="middle" className='mt-5'>
          <Col xs={24} md={8}>
            <SecurityQuestion />
          </Col>
        </Row>
      </div>
    </Suspense>
  );
};

export default Profile;