import React, { Suspense, useEffect } from 'react';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import LoadingFallback from '../components/common/LoadingFallback.jsx';

const UsersStatisticBoard = React.lazy(() => import('../components/Users/UsersStatisticBoard'));
const UsersList = React.lazy(() => import('../components/Users/UsersList'));
const UsersActivities = React.lazy(() => import('../components/Users/UsersActivities'));

const Users = () => {
  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);
  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="container max-w-full">
        <div className='mt-5'>
          <UsersStatisticBoard />
        </div>
        <div className='mt-5'>
          <UsersList />
        </div>
        <div className='mt-5'>
          <UsersActivities />
        </div>
      </div>
    </Suspense>
  )
}

export default Users;