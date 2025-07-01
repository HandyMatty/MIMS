import React, { Suspense, useEffect } from 'react';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import LoadingFallback from '../components/common/LoadingFallback.jsx';
const InventoryTable = React.lazy(() => import('../components/Inventory/InventoryTable'));

const InventoryPage = () => {
  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);

  return (
    <div className="container max-w-full">
      <div className='mt-5'>
        <Suspense fallback={<LoadingFallback />}>
          <InventoryTable />
        </Suspense>
      </div>
    </div>
  );
};

export default InventoryPage;