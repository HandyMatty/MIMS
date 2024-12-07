import React, { useEffect, useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Typography, Upload, message, Image, Card } from 'antd';
import ImgCrop from 'antd-img-crop';
import Cookies from 'js-cookie';
import { fetchProfileData, updateProfileData } from '../../services/api/getUserDetails';
import { beforeUpload } from '../../utils/imageHelpers';
import { useActivity } from '../../utils/ActivityContext';

const { Title, Text } = Typography;

const ProfileEdit = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [originalDepartment, setOriginalDepartment] = useState('');
  const [fileList, setFileList] = useState([]);

  const { logUserActivity } = useActivity();

  useEffect(() => {
    // Retrieve username from session data
    const userAuth = JSON.parse(sessionStorage.getItem('userAuth'))?.state?.userData?.username;
    const adminAuth = JSON.parse(sessionStorage.getItem('adminAuth'))?.state?.userData?.username;

    const loggedInUsername = userAuth || adminAuth;

    if (loggedInUsername) {
      setUsername(loggedInUsername);

      // Get the unique token for the logged-in user
      const token = Cookies.get(`authToken_${loggedInUsername}`);
      if (token) {
        fetchProfileData(token)
          .then((data) => {
            setOriginalUsername(data.username);
            setOriginalDepartment(data.department);
            setDepartment(data.department);
            setImageUrl(data.avatar || '');
          })
          .catch((error) => {
            message.error('Failed to fetch profile data');
            console.error(error);
          });
      }
    }
  }, []);

  const handleEdit = () => {
    const token = Cookies.get(`authToken_${username}`);
    if (isEditable) {
      updateProfileData(token, { username, department })
        .then(() => {
          message.success('Profile updated successfully!');
          logUserActivity(username, 'Profile Updated', `Updated username: ${username}, department: ${department}`);
        })
        .catch((error) => {
          message.error('Failed to update profile');
          console.error(error);
        });
    }
    setIsEditable(!isEditable);
  };

  const handleCancel = () => {
    setUsername(originalUsername);
    setDepartment(originalDepartment);
    setIsEditable(false);
  };

  const handleChange = (info) => {
    setFileList(info.fileList);

    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      message.success('Avatar uploaded successfully!');
      setImageUrl(info.file.response.avatar);
      logUserActivity(username, 'Avatar', `This User Changed Avatar`);
    } else if (info.file.status === 'error') {
      message.error('Avatar upload failed!');
    }

    setLoading(false);
  };

  return (
    <Card className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-3xl shadow p-6 border-none">
      <Title level={3} className="text-black text-start">Edit Profile</Title>

      <div className="flex items-center gap-6 mt-4">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="avatar"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        )}
        <div className="flex flex-col justify-center">
          <Text className="text-green-600">Active</Text>
          <Title level={4} className="text-neutral-700 mb-0">{username}</Title>
        </div>
      </div>

      <ImgCrop rotationSlider>
        <Upload
          name="avatar"
          action="http://localhost/MIMS/backend/api/upload.php"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          fileList={fileList}
          accept="image/*"
          headers={{
            'Authorization': `Bearer ${Cookies.get(`authToken_${username}`)}`, // Use dynamic token
          }}
        >
          <Button type="primary" icon={loading ? <LoadingOutlined /> : <PlusOutlined />} className="w-full mt-4 bg-lime-200 text-green-950" title="Change Avatar">
            {loading ? 'Uploading...' : 'Change Avatar'}
          </Button>
        </Upload>
      </ImgCrop>

      <div className="flex flex-col gap-5 mt-8">
        <div className="flex flex-col gap-1">
          <Text>Username</Text>
          <Input
            className={`w-full bg-emerald-200 ${!isEditable ? 'cursor-default' : 'bg-white'}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            readOnly={!isEditable}
            placeholder="Enter your username"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Text>Department</Text>
          <Input
            className={`w-full bg-emerald-200 ${!isEditable ? 'cursor-default' : 'bg-white'}`}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            readOnly={!isEditable}
            placeholder="Enter your department"
          />
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button type="primary" className="bg-lime-200 text-green-950 w-1/5" onClick={handleEdit}>
          {isEditable ? 'Save' : 'Edit'}
        </Button>
        {isEditable && (
          <Button type="default" className="bg-red-500 text-white w-1/5 ml-4" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProfileEdit;
