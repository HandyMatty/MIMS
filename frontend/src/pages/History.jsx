import React, { Suspense, useEffect } from 'react';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import LoadingFallback from '../components/common/LoadingFallback.jsx';
const HistoryTable = React.lazy(() => import('../components/History/HistoryTable'));

const History = () => {

  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);

  return (
    <div className="container max-w-full">
      <div className='mt-5'>
        <Suspense fallback={<LoadingFallback />}>
          <HistoryTable />
        </Suspense>
      </div>
    </div>
  );
};

export default History;