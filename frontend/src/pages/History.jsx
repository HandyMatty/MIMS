import React, { Suspense, useEffect } from 'react';
import { Spin } from 'antd';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage, preloadImages } from '../utils/imageHelpers.jsx';
const HistoryTable = React.lazy(() => import('../components/History/HistoryTable'));

const History = () => {

  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);

  return (
    <div className="container max-w-full">
      <div className='mt-5'>
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
          <HistoryTable />
        </Suspense>
      </div>
    </div>
  );
};

export default History;