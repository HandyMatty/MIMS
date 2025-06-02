import { Row, Col, Typography, Divider } from 'antd';
import ProfileEdit from '../../components/Profile/ProfileEdit';
import ChangePasswordForm from '../../components/Profile/ChangePasswordForm';
import SecurityQuestion from '../../components/Profile/SecurityQuestion';

const { Title } = Typography;

const Profile = () => {
  return (
    <div className="container max-w-full">
      <div className='mt-5 flex justify-center sm:justify-start'>
        <Divider style={{borderColor: '#072C1C'}}><Title level={3}>PROFILE</Title></Divider>
      </div>
      <Row gutter={[16,16]} justify="center"
        align="middle"
        className='mt-5'>
        <Col xs={24} md={10}  >
          <ProfileEdit />
        </Col>
        <Col xs={24} md={10}>
          <ChangePasswordForm />
        </Col>
      </Row>
      <Row
        justify="center"
        align="middle"
        className='mt-5'     >
        <Col xs={24} md={8}>
          <SecurityQuestion />
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
