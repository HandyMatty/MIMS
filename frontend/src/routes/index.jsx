import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AdminRoutes from './pageRoutes/AdminRoutes';
import UserRoutes from './pageRoutes/UserRoutes';
import PublicRoutes from './pageRoutes/PublicRoutes'; // Import PublicRoutes
import GuestRoutes from './pageRoutes/GuestRoutes'; // Import GuestRoutes

const RootRoutes = () => {
  const router = createBrowserRouter([
    {
      path: '/admin/*',
      element: <AdminRoutes />,
    },
    {
      path: '/user/*',
      element: <UserRoutes />,
    },
    {
      path: '/guest/*', // Define routes for guests
      element: <GuestRoutes />,
    },
    {
      path: '/*',
      element: <PublicRoutes />, // Use PublicRoutes for all other paths
    },
  ], { basename: process.env.NODE_ENV === 'production' ? '/Sentinel-MIMS' : '/' });  // Apply basename only in production

  return <RouterProvider router={router} />;
};

export default RootRoutes;
