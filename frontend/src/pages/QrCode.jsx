import { useState } from 'react';
import QrCodeGenerator from '../components/QrCode/QrCodeGenerator';
import QrCodeTable from '../components/QrCode/QrCodeTable';

const QrCode = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="flex flex-col w-full p-8">
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
