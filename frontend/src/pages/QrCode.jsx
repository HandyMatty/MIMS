import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import { getInventoryData } from '../services/api/addItemToInventory';
import { Tabs } from 'antd';
import { useTheme } from '../utils/ThemeContext';
const QrCodeGenerator = React.lazy(() => import('../components/QrCode/QrCodeGenerator'));
const QrCodeTable = React.lazy(() => import('../components/QrCode/QrCodeTable'));
const QrCodeList = React.lazy(() => import('../components/QrCode/QrCodeList'));

const QrCodeGeneratorSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#a7f3d0' : '#a7f3d0';
  
  return (
    <div className="rounded-xl shadow border-none p-6 skeleton-container" style={{ backgroundColor: bgColor }}>
      <div className={`h-8 rounded mb-4 animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
      <div className="space-y-4">
        <div className={`h-10 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
        <div className={`h-64 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
        <div className={`h-8 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
      </div>
    </div>
  );
};

const QrCodeListSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#a7f3d0' : '#a7f3d0';
  
  return (
    <div className="rounded-xl shadow border-none p-6 skeleton-container" style={{ backgroundColor: bgColor }}>
      <div className={`h-8 rounded mb-4 animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
      <div className="space-y-4">
        <div className={`h-10 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
        <div className={`h-96 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
        <div className={`h-8 rounded animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
      </div>
    </div>
  );
};



const QrCode = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('table');
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);


  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryData();
      if (Array.isArray(data)) {
        setInventoryData(data);
        if (data.length > 0 && !selectedItem) {
          setSelectedItem(data[0]);
        }
        setLastSyncTime(Date.now());
      } else {
        console.error('Received invalid data:', data);
        setError('Invalid data received');
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    preloadImages([SINSSILogo]);
    fetchInventoryData();
  }, [fetchInventoryData]);

  const refreshData = useCallback(() => {
    fetchInventoryData();
    setLastSyncTime(Date.now());
  }, [fetchInventoryData]);

  const handleItemSelect = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    if (key === 'list') {
      fetchInventoryData();
    }
  }, [fetchInventoryData]);

  const tableTabChildren = useMemo(() => (
    <QrCodeTable 
      inventoryData={inventoryData}
      loading={loading}
      error={error}
      onRefresh={refreshData}
      onItemSelect={handleItemSelect}
      lastSyncTime={lastSyncTime}
    />
  ), [inventoryData, loading, error, refreshData, handleItemSelect, lastSyncTime]);

  const listTabChildren = useMemo(() => (
    loading && activeTab === 'list'
      ? <QrCodeListSkeleton />
      : <QrCodeList 
          inventoryData={inventoryData}
          error={error}
          onRefresh={refreshData}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
        />
  ), [inventoryData, error, refreshData, loading, activeTab, selectedIds, setSelectedIds]);

  const tabItems = useMemo(() => [
    {
      key: 'table',
      label: <span className="text-xs">Table View</span>,
      children: tableTabChildren,
    },
    {
      key: 'list',
      label: <span className="text-xs">QR Code List</span>,
      children: listTabChildren,
    },
  ], [tableTabChildren, listTabChildren]);

  return (
    <div className="container max-w-full">
      <div className='mt-5'>
        {loading
          ? <QrCodeGeneratorSkeleton />
          : (
              <Suspense fallback={<QrCodeGeneratorSkeleton />}>
                {activeTab === 'list'
                  ? <QrCodeGenerator previewItems={inventoryData.filter(item => selectedIds.includes(item.id))} />
                  : <QrCodeGenerator itemDetails={selectedItem} />
                }
              </Suspense>
            )
        }
      </div>
      <div className='mt-5'>
        <Tabs
          className='custom-tabs'
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          items={tabItems}
        />
      </div>
    </div>
  );
};

export default QrCode;