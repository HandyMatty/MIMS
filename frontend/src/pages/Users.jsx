import React, { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import { fetchUsersStatistics, fetchUsersData } from '../services/api/usersdata';
import { fetchActivitiesApi } from '../services/api/fetchactivities';
import { useTheme } from '../utils/ThemeContext';

const UsersStatisticBoard = React.lazy(() => import('../components/Users/UsersStatisticBoard'));
const UsersList = React.lazy(() => import('../components/Users/UsersList'));
const UsersActivities = React.lazy(() => import('../components/Users/UsersActivities'));

const UsersStatisticBoardSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#A8E1C5' : '#A8E1C5';
  
  return (
    <div className="status-dashboard skeleton-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="rounded-xl shadow-md border-none p-4 skeleton-optimized" style={{ backgroundColor: bgColor }}>
            <div className="flex items-center justify-center mb-3">
              <div className={`w-6 h-6 rounded mr-2 animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
              <div className={`h-4 rounded w-20 animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
            </div>
            <div className={`h-8 rounded w-16 mx-auto animate-pulse`} style={{ backgroundColor: skeletonColor }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UsersListSkeleton = () => {
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

const UsersActivitiesSkeleton = () => {
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

const UsersSkeleton = () => (
  <div className="container max-w-full">
    <div className='mt-5'>
      <UsersStatisticBoardSkeleton />
    </div>
    <div className='mt-5'>
      <UsersListSkeleton />
    </div>
    <div className='mt-5'>
      <UsersActivitiesSkeleton />
    </div>
  </div>
);

const Users = () => {
  const [statistics, setStatistics] = useState({ totalUsers: 0, activeUsers: 0, activities: 0 });
  const [usersData, setUsersData] = useState({ users: [] });
  const [activitiesData, setActivitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activitiesLastSyncTime, setActivitiesLastSyncTime] = useState(null);
  const [usersLastSyncTime, setUsersLastSyncTime] = useState(null);

  const processedData = useMemo(() => {
    return {
      statistics: { ...statistics },
      users: usersData.users || [],
      activities: activitiesData || []
    };
  }, [statistics, usersData.users, activitiesData]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, usersDataResult, activitiesDataResult] = await Promise.all([
        fetchUsersStatistics(),
        fetchUsersData(),
        fetchActivitiesApi()
      ]);

      setStatistics(statsData);
      setUsersData(usersDataResult);
      setActivitiesData(activitiesDataResult);
      setActivitiesLastSyncTime(Date.now());
      setUsersLastSyncTime(Date.now());
    } catch (err) {
      console.error("Error fetching users data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    preloadImages([SINSSILogo]);
    fetchAllData();
  }, [fetchAllData]);

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return <UsersSkeleton />;
  }

  return (
    <Suspense fallback={<UsersSkeleton />}>
      <div className="container max-w-full">
        <div className='mt-5'>
          <Suspense fallback={<UsersStatisticBoardSkeleton />}>
            <UsersStatisticBoard 
              statistics={processedData.statistics}
              loading={loading}
              error={error}
              onRefresh={refreshData}
            />
          </Suspense>
        </div>
        <div className='mt-5'>
          <Suspense fallback={<UsersListSkeleton />}>
            <UsersList 
              usersData={processedData.users}
              loading={loading}
              error={error}
              onRefresh={refreshData}
              lastSyncTime={usersLastSyncTime}
            />
          </Suspense>
        </div>
        <div className='mt-5'>
          <Suspense fallback={<UsersActivitiesSkeleton />}>
            <UsersActivities 
              activitiesData={processedData.activities}
              loading={loading}
              error={error}
              onRefresh={refreshData}
              lastSyncTime={activitiesLastSyncTime}
            />
          </Suspense>
        </div>
      </div>
    </Suspense>
  );
};

export default Users;