import React, { Suspense, useEffect, useState, useMemo } from 'react';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import { getInventoryData } from '../services/api/addItemToInventory';
import { useTheme } from '../utils/ThemeContext';
import { isOffline } from '../utils/offlineUtils';

const isProduction =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  window.location.hostname !== '' &&
  !window.location.hostname.startsWith('192.168.') &&
  process.env.NODE_ENV === 'production';

const InventoryTable = React.lazy(() => import('../components/Inventory/InventoryTable'));

const InventorySkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#A8E1C5' : '#A8E1C5';
  
  return (
    <div className="container max-w-full">
      <div className='mt-5'>
        <div className="rounded-xl shadow border-none p-6 skeleton-container" style={{ backgroundColor: bgColor }}>
          <div className={`h-8 rounded mb-4 animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
          <div className="space-y-4">
            <div className={`h-10 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
            <div className={`h-96 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
            <div className={`h-8 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeInventory = async () => {
      try {
        if (isProduction && (await isOffline())) {
          console.log('Inventory initialization cancelled - offline');
          setError(new Error('Offline - cannot load inventory data'));
          setLoading(false);
          return;
        }

        await Promise.all([
          preloadImages([SINSSILogo]),
          getInventoryData()
        ]).then(([, data]) => {
          setInventoryData(data);
          setError(null);
        });
      } catch (error) {
        console.error('Error initializing inventory:', error);
        
        if (isProduction && (error.isOffline || error.message?.includes('Offline'))) {
          setError(new Error('You are currently offline. Please check your internet connection.'));
        } else {
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeInventory();
  }, []);

  const memoizedInventoryData = useMemo(() => inventoryData, [inventoryData]);
  const memoizedLoading = useMemo(() => loading, [loading]);
  const memoizedError = useMemo(() => error, [error]);

  if (memoizedLoading) {
    return <InventorySkeleton />;
  }

  return (
    <div className="container max-w-full">
      <div className='mt-5'>
        <Suspense fallback={<InventorySkeleton />}>
          <InventoryTable 
            inventoryData={memoizedInventoryData}
            loading={memoizedLoading}
            error={memoizedError}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default InventoryPage;