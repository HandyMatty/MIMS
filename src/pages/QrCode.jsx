import React, { useState } from 'react';
import { Typography } from 'antd';
import QrCodeGenerator from '../components/QrCode/QrCodeGenerator';
import QrCodeTable from '../components/QrCode/QrCodeTable';

const QrCode = () => {
  const { Title } = Typography;
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="flex flex-col w-full p-8">
      <div className='mb-5'>
        <Title level={1}>QR CODE</Title>
      </div>
      <div>
        <QrCodeGenerator itemDetails={selectedItem} />
      </div>
      <div className='mt-5'>
        <QrCodeTable onItemSelect={handleItemSelect} />
      </div>
    </div>
  );
};

export default QrCode;
