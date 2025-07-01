import { useEffect, useState, useCallback } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Typography, Upload, message, Image, Card, Descriptions, Modal, Divider, Select } from 'antd';
import ImgCrop from 'antd-img-crop';
import Cookies from 'js-cookie';

import { fetchProfileData, updateProfileData } from '../../services/api/getUserDetails';
import { beforeUpload } from '../../utils/imageHelpers';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useTheme } from '../../utils/ThemeContext';

const { Title, Text } = Typography;

const STORAGE_KEYS = ['userAuth', 'adminAuth', 'guestAuth'];
const DEPARTMENT_OPTIONS = ['GAD','CID', 'SOD', 'HRD', 'AFD', 'EDO', 'BDO'];

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

  const { theme, currentTheme } = useTheme();

  // Button hover state for theme
  const [avatarBtnHover, setAvatarBtnHover] = useState(false);
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [mainBtnHover, setMainBtnHover] = useState(false);

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

    if (newUsername !== originalData.username) {
      logUserActivity(newUsername, 'Profile Update', `Updated username to: ${newUsername}`);
    }
    if (department !== originalData.department) {
      logUserActivity(newUsername, 'Profile Update', `Updated department to: ${department}`);
    }
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
    <Card className="flex flex-col w-auto bg-[#a7f3d0] rounded-3xl shadow p-6 border-none"
      style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}>
      {/* Avatar Section */}
      <div className="flex flex-col justify-center items-center mt-4">
        {imageUrl && (
          <Image src={imageUrl} alt="avatar" width={100} height={100} style={{ borderRadius: '50%', objectFit: 'cover' }} />
        )}
          <Text className={currentTheme === 'default' ? 'text-green-600 mt-2 ' : 'mt-2'} style={currentTheme !== 'default' ? { color: theme.text } : {}}>Active</Text>
          <Divider style={currentTheme !== 'default' ? {borderColor: theme.text} : {borderColor: '#072C1C'}}><Title level={4} 
          className="text-neutral-700" style={currentTheme !== 'default' ? { color: theme.text } : {}}>{username}</Title></Divider>
      </div>
      <div className='flex justify-center'>
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
          <Button
            type="primary"
            icon={loading ? <LoadingOutlined /> : <PlusOutlined />}
            className="w-full bg-lime-200 text-green-950"
            style={currentTheme !== 'default' ? {
              background: avatarBtnHover ? theme.text : theme.textLight,
              color: avatarBtnHover ? theme.componentBackground : theme.text,
              border: 'none',
              transition: 'background 0.2s, color 0.2s'
            } : {}}
            onMouseEnter={currentTheme !== 'default' ? () => setAvatarBtnHover(true) : undefined}
            onMouseLeave={currentTheme !== 'default' ? () => setAvatarBtnHover(false) : undefined}
          >
            {loading ? 'Uploading...' : 'Change Avatar'}
          </Button>
        </Upload>
      </ImgCrop>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col gap-5 mt-8">
        {['Username', 'Department'].map((label) => (
          <div key={label} className="flex flex-col justify-center items-center gap-1"
            style={currentTheme !== 'default' ? { background: theme.componentBackground} : {}}>
            <Text className='font-bold' style={currentTheme !== 'default' ? { color: theme.text } : {}}>{label}:</Text>
            {isEditable ? (
              label === 'Department' ? (
              <Select
                className='w-auto transparent-select'
                value={department}
                onChange={setDepartment}
                options={DEPARTMENT_OPTIONS.map(opt => ({ value: opt, label: opt }))}
                placeholder="Select department"
                style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : { background: '#a7f3d0' }}
                dropdownStyle={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}
                />
                ) : (
              <Input
                className="w-auto flex justify-center items-center border-black"
                value={label === 'Username' ? newUsername : department}
                onChange={(e) => label === 'Username' ? setNewUsername(e.target.value) : setDepartment(e.target.value)}
                placeholder={`Enter your ${label.toLowerCase()}`}
                style={currentTheme !== 'default' ? { background: 'white', color: theme.text } : { background: 'white' }}
              />
                )
            ) : (
              <Descriptions>
                <Descriptions.Item
                  className='flex justify-center items-center'
                  style={currentTheme !== 'default' ? { color: theme.text, background: theme.componentBackground } : {}}>
                  {label === 'Username' ? username : department}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center w-auto wrap mt-8">
        {isEditable && (
          <Button
            type="default"
            className="bg-red-500 text-white mr-4 w-auto"
            onClick={handleCancel}
            style={currentTheme !== 'default' ? {
              background: cancelBtnHover ? theme.textLight : theme.text,
              color: cancelBtnHover ? theme.text : theme.textLight,
              border: 'none',
              transition: 'background 0.2s, color 0.2s'
            } : {}}
            onMouseEnter={currentTheme !== 'default' ? () => setCancelBtnHover(true) : undefined}
            onMouseLeave={currentTheme !== 'default' ? () => setCancelBtnHover(false) : undefined}
          >
            Cancel
          </Button>
        )}
        <Button
          type="primary"
          className="bg-lime-200 text-green-950 w-auto"
          onClick={handleEdit}
          disabled={isSaving}
          style={currentTheme !== 'default' ? {
            background: mainBtnHover ? theme.text : theme.textLight,
            color: mainBtnHover ? theme.textLight : theme.text,
            border: 'none',
            transition: 'background 0.2s, color 0.2s'
          } : {}}
          onMouseEnter={currentTheme !== 'default' ? () => setMainBtnHover(true) : undefined}
          onMouseLeave={currentTheme !== 'default' ? () => setMainBtnHover(false) : undefined}
        >
          {isEditable ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
        </Button>
      </div>
    </Card>
  );
};

export default ProfileEdit;