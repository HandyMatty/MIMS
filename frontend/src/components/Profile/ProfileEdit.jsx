import React, { useEffect, useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Typography, Upload, message, Image, Card, Descriptions, Modal } from 'antd';
import ImgCrop from 'antd-img-crop';
import Cookies from 'js-cookie';
import { fetchProfileData, updateProfileData } from '../../services/api/getUserDetails';
import { beforeUpload } from '../../utils/imageHelpers';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Title, Text } = Typography;

const ProfileEdit = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [originalDepartment, setOriginalDepartment] = useState('');
  const [fileList, setFileList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  // Retrieve the correct token based on user type
  const getAuthToken = () => {
    const userAuth = JSON.parse(localStorage.getItem('userAuth'));
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth'));
    const loggedInUsername = userAuth?.state?.userData?.username || adminAuth?.state?.userData?.username;

    if (!loggedInUsername) {
      window.location.href = '/login';
      return null;
    }

    const token = Cookies.get(`authToken_${loggedInUsername}`);
    if (!token) {
      message.error('Authentication token is missing. Please log in again.');
      return null;
    }
    return token;
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchProfileData(token)
        .then((data) => {
          setOriginalUsername(data.username);
          setOriginalDepartment(data.department);
          setDepartment(data.department);
          setImageUrl(data.avatar || '');
          setUsername(data.username);
          setNewUsername(data.username);
        })
        .catch((error) => {
          message.error('Failed to fetch profile data');
          console.error(error);
        });
    }
  }, []);

  const updateLocalStorageAndCookies = (newUsername, token) => {
    Cookies.remove(`authToken_${username}`);
    Cookies.set(`authToken_${newUsername}`, token);
    
    const userAuth = JSON.parse(localStorage.getItem('userAuth'));
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth'));
    
    if (userAuth?.state?.userData?.username === username) {
      localStorage.setItem('userAuth', JSON.stringify({ state: { userData: { username: newUsername }, token } }));
    } else if (adminAuth?.state?.userData?.username === username) {
      localStorage.setItem('adminAuth', JSON.stringify({ state: { userData: { username: newUsername }, token } }));
    }
  };

  const handleEdit = async () => {
    if (isEditable) {
      Modal.confirm({
        title: 'Save Changes?',
        content: 'Are you sure you want to save these changes?',
        onOk: async () => {
          const token = getAuthToken();
          if (!token) return;

          setIsSaving(true);
          try {
            await updateProfileData(token, { username: newUsername, department });
            message.success('Profile updated successfully!');
            updateLocalStorageAndCookies(newUsername, token);
            setUsername(newUsername);
            setOriginalUsername(newUsername);
            setOriginalDepartment(department);
            logUserActivity(newUsername, 'Profile Update', `Updated username to: ${newUsername}`);
            logUserNotification('Profile Update', 'Your profile was updated successfully.');
          } catch (error) {
            console.error(error);
            message.error('Failed to update profile.');
          } finally {
            setIsSaving(false);
          }
        },
      });
    }
    setIsEditable(!isEditable);
  };

  const handleCancel = () => {
    setNewUsername(originalUsername);
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
      if (info.file.response?.avatar) {
        message.success('Avatar uploaded successfully!');
        setImageUrl(info.file.response.avatar);
        logUserActivity(username, 'Avatar', `User updated their avatar.`);
        logUserNotification('Avatar Updated', 'Your avatar was updated successfully.');
      } else {
        message.error('Avatar upload response is missing avatar field!');
      }
    } else if (info.file.status === 'error') {
      message.error('Avatar upload failed!');
    }

    setLoading(false);
  };

  return (
    <Card className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-3xl shadow p-6 border-none">
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
          action="http://localhost/Sentinel-MIMS/backend/api/upload.php"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          fileList={fileList}
          accept="image/*"
          headers={{
            'Authorization': `Bearer ${Cookies.get(`authToken_${username}`)}`,
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
          {isEditable ? (
            <Input
              className="w-full bg-emerald-200"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter your username"
            />
          ) : (
            <Descriptions>
              <Descriptions.Item>{username}</Descriptions.Item>
            </Descriptions>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Text>Department</Text>
          {isEditable ? (
            <Input
              className="w-full bg-emerald-200"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter your department"
            />
          ) : (
            <Descriptions>
              <Descriptions.Item>{department}</Descriptions.Item>
            </Descriptions>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button type="primary" className="bg-lime-200 text-green-950 w-1/5" onClick={handleEdit} disabled={isSaving}>
          {isEditable ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
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