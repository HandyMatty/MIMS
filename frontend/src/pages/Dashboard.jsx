import React, { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { Input, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import { getInventoryData } from '../services/api/addItemToInventory';
import { fetchEvents } from '../services/api/eventService';
import { useTheme } from '../utils/ThemeContext';

const Graph = React.lazy(() => import('../components/Dashboard/Graph'));
const StatisticsBoard = React.lazy(() => import('../components/Dashboard/StatisticsBoard'));
const AntCalendar = React.lazy(() => import('../components/Dashboard/Calendar'));
const DashboardTable = React.lazy(() => import('../components/Dashboard/DashboardTable'));
const HistoryBarGraph = React.lazy(() => import('../components/History/HistoryBarGraph'));

const StatisticsBoardSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#A8E1C5' : '#A8E1C5';
  
  return (
    <div className="status-dashboard skeleton-container">
      <Row gutter={[12, 24]} justify="space-around" className="mb-5">
        {[...Array(4)].map((_, index) => (
          <Col xs={12} sm={8} md={6} key={index}>
            <div className="rounded-xl shadow-md border-none p-4 skeleton-optimized" style={{ backgroundColor: bgColor }}>
              <div className="flex items-center justify-center mb-3">
                <div className="w-6 h-6 rounded mr-2 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
                <div className="h-4 rounded w-20 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
              </div>
              <div className="h-8 rounded w-16 mx-auto animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
            </div>
          </Col>
        ))}
      </Row>
      <Row gutter={[12, 24]} justify="space-around">
        {[...Array(3)].map((_, index) => (
          <Col xs={12} sm={8} md={8} key={index}>
            <div className="rounded-xl shadow-md border-none p-4 skeleton-optimized" style={{ backgroundColor: bgColor }}>
              <div className="flex items-center justify-center mb-3">
                <div className="w-6 h-6 rounded mr-2 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
                <div className="h-4 rounded w-20 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
              </div>
              <div className="h-8 rounded w-16 mx-auto animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

const GraphSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#a7f3d0' : '#a7f3d0';
  
  return (
    <div className="w-auto h-full rounded-xl shadow-md flex justify-center items-center chart-skeleton skeleton-container" style={{ height: '420px', backgroundColor: bgColor }}>
      <div className="w-full h-full p-4">
        <div className="h-6 rounded w-32 mb-4 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        <div className="h-64 rounded w-full animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        <div className="flex justify-center mt-4 space-x-4">
          <div className="h-4 rounded w-16 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
          <div className="h-4 rounded w-16 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        </div>
      </div>
    </div>
  );
};

const CalendarSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#a7f3d0' : '#a7f3d0';
  
  return (
    <div className="w-full h-full rounded-xl shadow-md p-4 skeleton-container" style={{ height: '420px', backgroundColor: bgColor }}>
      <div className="h-6 rounded w-24 mb-4 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
      <div className="calendar-skeleton mb-2">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="h-6 rounded animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        ))}
      </div>
      <div className="calendar-skeleton">
        {[...Array(35)].map((_, index) => (
          <div key={index} className="calendar-skeleton-cell rounded animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        ))}
      </div>
    </div>
  );
};

const DashboardTableSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#a7f3d0' : '#a7f3d0';
  
  return (
    <div className="w-full h-full mx-auto rounded-xl shadow border-none p-8 table-skeleton" style={{ backgroundColor: bgColor }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-8 rounded w-20 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        ))}
      </div>
      <div className="w-auto overflow-x-auto">
        <div className="table-skeleton">
          <div className="table-skeleton-row rounded mb-2" style={{ backgroundColor: skeletonColor }}></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="table-skeleton-row rounded mb-2" style={{ backgroundColor: skeletonColor }}></div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-4 rounded w-32 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        <div className="h-8 rounded w-48 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
      </div>
    </div>
  );
};

const HistoryBarGraphSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#a7f3d0' : '#a7f3d0';
  
  return (
    <div className="history-bar-graph-container rounded-xl shadow-md p-4 chart-skeleton skeleton-container" style={{ height: '420px', backgroundColor: bgColor }}>
      <div className="h-6 rounded w-32 mb-4 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
      <div className="h-64 rounded w-full animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
      <div className="flex justify-center mt-4 space-x-2">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-3 rounded w-8 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [searchText, setSearchText] = useState('');
  const [inventoryData, setInventoryData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        preloadImages([SINSSILogo]);
        
        const [inventory, events] = await Promise.all([
          getInventoryData(),
          fetchEvents()
        ]);
        
        setInventoryData(inventory);
        setEventsData(events);
        setLastSyncTime(Date.now());
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const filteredInventoryData = useMemo(() => {
    if (!searchText.trim()) return inventoryData;
    return inventoryData.filter((item) =>
      Object.values(item).join(' ').toLowerCase().includes(searchText.toLowerCase())
    );
  }, [inventoryData, searchText]);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
  }, []);

  return (
    <div>
      <div className="flex justify-center sm:justify-end mb-4 mt-2">
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          onChange={handleSearchChange}
          className="w-auto border border-black"
          allowClear
        />
      </div>

      {loading ? (
        <>
          <StatisticsBoardSkeleton />
          <div className="mt-5">
            <HistoryBarGraphSkeleton />
          </div>
          <div className="mt-5">
            <DashboardTableSkeleton />
          </div>
          <Row gutter={[16, 16]} className="mt-5">
            <Col xs={24} md={16}>
              <GraphSkeleton />
            </Col>
            <Col xs={24} md={8}>
              <CalendarSkeleton />
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Suspense fallback={<StatisticsBoardSkeleton />}>
            <StatisticsBoard 
              searchText={searchText} 
              inventoryData={filteredInventoryData}
              loading={loading}
            />
          </Suspense>
          <div className="mt-5">
            <Suspense fallback={<HistoryBarGraphSkeleton />}>
              <HistoryBarGraph 
                searchText={searchText} 
                inventoryData={filteredInventoryData}
                loading={loading}
              />
            </Suspense>
          </div>
          <div className="mt-5">
            <Suspense fallback={<DashboardTableSkeleton />}>
              <DashboardTable 
                searchText={searchText} 
                inventoryData={filteredInventoryData}
                loading={loading}
                setParentLoading={setLoading}
                lastSyncTime={lastSyncTime}
                onRefresh={(data) => {
                  setInventoryData(data);
                  setLastSyncTime(Date.now());
                }}
              />
            </Suspense>
          </div>
          <Row gutter={[16, 16]} className="mt-5">
            <Col xs={24} md={16}>
              <Suspense fallback={<GraphSkeleton />}>
                <Graph 
                  inventoryData={filteredInventoryData}
                  loading={loading}
                />
              </Suspense>
            </Col>
            <Col xs={24} md={8}>
              <Suspense fallback={<CalendarSkeleton />}>
                <AntCalendar 
                  eventsData={eventsData}
                  loading={loading}
                />
              </Suspense>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;