import React, { useState, useEffect, Suspense } from 'react';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import LoadingFallback from '../components/common/LoadingFallback.jsx';
const QrCodeGenerator = React.lazy(() => import('../components/QrCode/QrCodeGenerator'));
const QrCodeTable = React.lazy(() => import('../components/QrCode/QrCodeTable'));

const QrCode = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="container max-w-full">
      <Suspense fallback={<LoadingFallback />}>
        <div className='mt-5'>
          <QrCodeGenerator itemDetails={selectedItem} />
        </div>
        <div className='mt-5'>
          <QrCodeTable onItemSelect={handleItemSelect} />
        </div>
      </Suspense>
    </div>
  );
};

export default QrCode;