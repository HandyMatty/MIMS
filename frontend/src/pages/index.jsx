import React from 'react';

import Login from "./Login/Login";
import ForgotPassword from "./Login/ForgotPassword";
const Dashboard = React.lazy(() => import("./Dashboard"));
const InventoryPage = React.lazy(() => import("./InventoryPage"));
const History = React.lazy(() => import("./History"));
const QrCode = React.lazy(() => import("./QrCode"));
const Users = React.lazy(() => import("./Users"));
const Notifications = React.lazy(() => import("./Header/Notifications"));

export {Login, ForgotPassword, Dashboard, InventoryPage, History, QrCode, Users, Notifications};