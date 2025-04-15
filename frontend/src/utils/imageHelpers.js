import { message } from 'antd';

export const beforeUpload = (file) => {
  return new Promise((resolve, reject) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return reject(); // prevent upload
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return reject(); // prevent upload
    }

    return resolve(); // allow upload
  });
};
