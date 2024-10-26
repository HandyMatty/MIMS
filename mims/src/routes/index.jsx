import { RouterProvider, createBrowserRouter } from "react-router-dom";
import UserRoutes from "./pageRoutes/UserRoutes"; // Ensure the path is correct
import AdminRoutes from "./pageRoutes/Adminroutes";

const RootRoutes = () => {
  const router = createBrowserRouter([
    { path: "/admin/*", Component: AdminRoutes },
    { path: "/user/*", Component: UserRoutes }, // Adding the user routes
    { path: "/*", Component: AdminRoutes }, // Default route as fallback
  ]);

  return <RouterProvider router={router} />;
};

export default RootRoutes;
