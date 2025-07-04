import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import AdminRoutes from './pageRoutes/AdminRoutes';
import UserRoutes from './pageRoutes/UserRoutes';
import PublicRoutes from './pageRoutes/PublicRoutes';
import GuestRoutes from './pageRoutes/GuestRoutes';
import ErrorPage from '../pages/Error/ErrorPage';

const RootRoutes = () => {
  const router = createBrowserRouter(
    [
      {
        path: '/admin/*',
        element: <AdminRoutes />,
        errorElement: <ErrorPage />,
      },
      {
        path: '/user/*',
        element: <UserRoutes />,
        errorElement: <ErrorPage />,
      },
      {
        path: '/guest/*',
        element: <GuestRoutes />,
        errorElement: <ErrorPage />,
      },
      {
        path: '/*',
        element: <PublicRoutes />,
        errorElement: <ErrorPage />,
      },
    ],
    {
      basename: process.env.NODE_ENV === 'production' ? '/Sentinel-MIMS' : '/',
    }
  );

  return <RouterProvider router={router} />;
};

export default RootRoutes;
