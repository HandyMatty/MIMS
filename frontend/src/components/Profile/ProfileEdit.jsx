import { useEffect, useState, useCallback } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Typography, Upload, message, Image, Card, Descriptions, Modal } from 'antd';
import ImgCrop from 'antd-img-crop';
import Cookies from 'js-cookie';

import { fetchProfileData, updateProfileData } from '../../services/api/getUserDetails';
import { beforeUpload, LazyImage, preloadImages } from '../../utils/imageHelpers.jsx';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Title, Text } = Typography;

const STORAGE_KEYS = ['userAuth', 'adminAuth', 'guestAuth'];

const ProfileEdit = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [fileList, setFileList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState({ username: '', department: '' });

  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  const [authUsername, setAuthUsername] = useState('');

  const getAuthToken = useCallback(() => {
    for (const key of STORAGE_KEYS) {
      const auth = JSON.parse(localStorage.getItem(key)) || JSON.parse(sessionStorage.getItem(key));
      if (auth?.state?.userData?.username) {
        const storedUsername = auth.state.userData.username;
        const token = Cookies.get(`authToken_${storedUsername}`) || auth.state.token;
        if (!token) {
          message.error('Authentication token missing. Please log in again.');
          window.location.href = '/login';
        }
        setAuthUsername(storedUsername); // <- Save it in state
        return { token, username: storedUsername };
      }
    }
    window.location.href = '/login';
    return {};
  }, []);
  

  const updateLocalStorageAndCookies = (newUsername, token) => {
    Cookies.remove(`authToken_${username}`, { path: '/' });
    Cookies.set(`authToken_${newUsername}`, token, {
      expires: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax',
      path: '/',
    });

    STORAGE_KEYS.forEach((key) => {
      const auth = JSON.parse(localStorage.getItem(key)) || JSON.parse(sessionStorage.getItem(key));
      if (auth?.state?.userData?.username === username) {
        const updatedAuth = {
          state: {
            userData: { username: newUsername, role: auth.state.userData.role },
            token,
          },
        };
        const updatedAuthStr = JSON.stringify(updatedAuth);
        localStorage.setItem(key, updatedAuthStr);
        sessionStorage.setItem(key, updatedAuthStr);
      }
    });
  };

  useEffect(() => {
    const { token } = getAuthToken();
    if (token) {
      fetchProfileData(token)
        .then(({ username, department, avatar }) => {
          setUsername(username);
          setNewUsername(username);
          setDepartment(department);
          setOriginalData({ username, department });
          setImageUrl(avatar || '');
          if (avatar) {
            preloadImages([avatar]);
          }
        })
        .catch(() => message.error('Failed to fetch profile data'));
    }
  }, [getAuthToken]);

  const handleEdit = async () => {
    if (!isEditable) return setIsEditable(true);

    Modal.confirm({
      title: 'Save Changes?',
      content: 'Are you sure you want to save these changes?',
      onOk: async () => {
        const { token } = getAuthToken();
        if (!token) return;

        setIsSaving(true);
        try {
          await updateProfileData(token, { username: newUsername, department });
          message.success('Profile updated successfully!');
          updateLocalStorageAndCookies(newUsername, token);

          logUserActivity(newUsername, 'Profile Update', `Updated username to: ${newUsername}`);
          logUserNotification('Profile Update', 'Your profile was updated successfully.');

          window.location.reload();
        } catch (error) {
          console.error(error);
          message.error('Failed to update profile.');
        } finally {
          setIsSaving(false);
        }
      },
    });
  };

  const handleCancel = () => {
    setNewUsername(originalData.username);
    setDepartment(originalData.department);
    setIsEditable(false);
  };

  const handleChange = ({ file, fileList: newFileList }) => {
    setFileList(newFileList);
    if (file.status === 'uploading') return setLoading(true);

    if (file.status === 'done') {
      if (file.response?.avatar) {
        setImageUrl(file.response.avatar);
        message.success('Avatar uploaded successfully!');
        logUserActivity(username, 'Avatar', `User updated their avatar.`);
        logUserNotification('Avatar Updated', 'Your avatar was updated successfully.');
      } else {
        message.error('Avatar upload response missing avatar field!');
      }
    } else if (file.status === 'error') {
      message.error('Avatar upload failed!');
    }

    setLoading(false);
  };

  return (
    <Card className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-3xl shadow p-6 border-none">
      {/* Avatar Section */}
      <div className="flex items-center gap-6 mt-4">
        {imageUrl && (
          <LazyImage
            src={imageUrl}
            alt="avatar"
            width={100}
            height={100}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <div>
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
          headers={{ Authorization: `Bearer ${Cookies.get(`authToken_${authUsername}`)}` }}
        >
          <Button type="primary" icon={loading ? <LoadingOutlined /> : <PlusOutlined />} className="w-full mt-4 bg-lime-200 text-green-950">
            {loading ? 'Uploading...' : 'Change Avatar'}
          </Button>
        </Upload>
      </ImgCrop>

      {/* Profile Info */}
      <div className="flex flex-col gap-5 mt-8">
        {['Username', 'Department'].map((label) => (
          <div key={label} className="flex flex-col gap-1">
            <Text>{label}</Text>
            {isEditable ? (
              <Input
                className="w-full bg-emerald-200"
                value={label === 'Username' ? newUsername : department}
                onChange={(e) => label === 'Username' ? setNewUsername(e.target.value) : setDepartment(e.target.value)}
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
            ) : (
              <Descriptions><Descriptions.Item>{label === 'Username' ? username : department}</Descriptions.Item></Descriptions>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        {isEditable && (
          <Button type="default" className="bg-red-500 text-white w-1/5 mr-4" onClick={handleCancel}>Cancel</Button>
        )}
        <Button type="primary" className="bg-lime-200 text-green-950 w-1/5" onClick={handleEdit} disabled={isSaving}>
          {isEditable ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
        </Button>
      </div>
    </Card>
  );
};

export default ProfileEdit;
