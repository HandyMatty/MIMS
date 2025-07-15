import React, { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import { getHistory } from '../services/api/getHistory';
import { useTheme } from '../utils/ThemeContext';
const HistoryTable = React.lazy(() => import('../components/History/HistoryTable'));

const HistorySkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#a7f3d0' : '#a7f3d0';
  
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

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyLastSyncTime, setHistoryLastSyncTime] = useState(null);

  const processedData = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return {
        addedData: [],
        updatedData: [],
        deletedData: [],
        inventoryData: []
      };
    }

    const addedData = historyData.filter(item => item.action === "Added");
    const updatedData = historyData.filter(item => item.action === "Updated" || item.action === "QRCode Update");
    const deletedData = historyData.filter(item => item.action === "Deleted");
    
    const inventoryData = addedData.map(item => ({
      type: item.type,
      quantity: item.quantity
    }));

    return {
      addedData,
      updatedData,
      deletedData,
      inventoryData
    };
  }, [historyData]);

  const fetchHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHistory();
      setHistoryData(data);
      setHistoryLastSyncTime(Date.now());
    } catch (err) {
      console.error("Error fetching history data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    preloadImages([SINSSILogo]);
    fetchHistoryData();
  }, [fetchHistoryData]);

  const refreshHistory = useCallback(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  if (loading) {
    return <HistorySkeleton />;
  }

  return (
    <div className="container max-w-full">
      <div className='mt-5'>
        <Suspense fallback={<HistorySkeleton />}>
          <HistoryTable 
            historyData={historyData}
            processedData={processedData}
            loading={loading}
            error={error}
            onRefresh={refreshHistory}
            lastSyncTime={historyLastSyncTime}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default History;