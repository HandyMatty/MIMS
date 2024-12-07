import React from 'react';
import { Row, Col, Typography } from 'antd';
import ProfileEdit from '../../components/Profile/ProfileEdit';
import ChangePasswordForm from '../../components/Profile/ChangePasswordForm';


const { Title } = Typography;

const Profile = () => {
  return (
    <div className="flex flex-col w-full p-8">
      <div className='mb-5'><Title level={2}>Profile</Title></div>
      <Row gutter={16}>
        <Col span={12}>
          <ProfileEdit />
        </Col>
        <Col span={12}>
          <ChangePasswordForm />
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
