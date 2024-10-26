import React, { useState, useEffect } from 'react';
import { LoadingOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Input, Typography, Upload, message, Image } from 'antd';
import ImgCrop from 'antd-img-crop';
import { beforeUpload } from '../../utils/imageHelpers';
import { fetchProfileData, updateProfileData } from '../../services/api/getUserDetails'; 
import Cookies from 'js-cookie';
import ChangePasswordForm from '../../components/ChangePasswordForm'; 
import { uploadAvatar } from '../../services/api/uploadAvatar';

const { Title, Text } = Typography;

const Profile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [originalDepartment, setOriginalDepartment] = useState('');
  const [fileList, setFileList] = useState([]); // To keep track of uploaded files

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      fetchProfileData(token)
        .then(data => {
          setUsername(data.username);
          setOriginalUsername(data.username);
          setDepartment(data.department);
          setOriginalDepartment(data.department);
          setImageUrl(data.avatar || ''); // Update to use the avatar URL
        })
        .catch(error => {
          message.error('Failed to fetch profile data');
          console.error(error);
        });
    }
  }, []);
  
  const handleEdit = () => {
    const token = Cookies.get('authToken');
    if (isEditable) {
      updateProfileData(token, { username, department })
        .then(() => {
          message.success('Profile updated successfully!');
        })
        .catch(error => {
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

  const handleChange = async (info) => {
    setFileList(info.fileList); // Update the file list

    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      try {
        setLoading(false);
        
        // Upload the file
        const token = Cookies.get('authToken');
        const formData = new FormData();
        formData.append('avatar', info.file.originFileObj);
        formData.append('token', token); // Append token for authorization

        const response = await uploadAvatar(formData);
        if (response.success) {
          message.success('Avatar uploaded successfully!');
          setImageUrl(URL.createObjectURL(info.file.originFileObj)); // Update imageUrl for preview
        } else {
          message.error(response.message || 'Failed to upload avatar');
        }
      } catch (error) {
        setLoading(false);
        message.error('Failed to convert image to base64');
      }
    }
  };

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
  };

  return (
    <div className="flex flex-col w-full p-8">
      <div className='mb-5'><Title level={2}>Profile</Title></div>
      <div className="flex flex-row gap-12 w-full ml-11">

        <div className="flex flex-col w-2/5 h-full bg-emerald-200 rounded-2xl shadow p-6">
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
              action="http://localhost/mims/api/upload.php"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              fileList={fileList}
              accept="image/*" // Limit to image files
            >
              <Button type="primary" icon={loading ? <LoadingOutlined /> : <PlusOutlined />} className="w-full mt-4 bg-lime-200 text-green-950 ">
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
                variant={isEditable ? 'outlined' : 'filled'}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Text>Department</Text>
              <Input
                className={`w-full bg-emerald-200 ${!isEditable ? 'cursor-default' : 'bg-white'}`}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                readOnly={!isEditable}
                variant={isEditable ? 'outlined' : 'filled'}
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
        </div>

        <div className="flex flex-col items-center w-5/12 bg-emerald-200 rounded-2xl shadow p-6">
          <div className="flex flex-col items-center justify-center w-full h-full mt-8">
            <div className="bg-lime-200 p-3 rounded-full">
              <LockOutlined style={{ fontSize: '70px', color: '#072C1C' }} />
            </div>
            
            <Title level={2} className='mt-5'> Change Password</Title>
            {showPasswordForm && (
              <>
                <ChangePasswordForm onClose={togglePasswordForm} />
                <Button type="default" className="bg-red-500 text-white text-center" onClick={togglePasswordForm}>
                  Cancel
                </Button>
              </>
            )}
            {!showPasswordForm && (
              <Button type='primary' className="bg-lime-200 text-green-950 " onClick={togglePasswordForm}>
                Edit Password
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
