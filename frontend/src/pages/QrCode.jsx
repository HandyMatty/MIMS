import React, { useState, useEffect, Suspense } from 'react';
import { Spin } from 'antd';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage, preloadImages } from '../utils/imageHelpers.jsx';
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
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-honeydew">
          <LazyImage
            className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
            src={SINSSILogo}
            alt="SINSSI Logo"
            width={171}
            height={183}
          />
          <Spin size="large" />
          <p className="mt-4 text-darkslategray-200">Loading...</p>
        </div>
      }>
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