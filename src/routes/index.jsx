import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AdminRoutes from './pageRoutes/AdminRoutes';
import UserRoutes from './pageRoutes/UserRoutes';
import PublicRoutes from './pageRoutes/PublicRoutes'; // Import your new PublicRoutes

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
      path: '/*',
      element: <PublicRoutes />, // Use PublicRoutes for all other paths
    },
  ]);

  return <RouterProvider router={router} />;
};

export default RootRoutes;
