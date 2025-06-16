import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntApp } from "antd";
import { ActivityProvider } from "./utils/ActivityContext.jsx";  // Import the ActivityProvider
import { NotificationProvider } from "./utils/NotificationContext.jsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#008746",
            colorWarning: "#E2B93B",
            colorSuccess: "#30ca80",
            colorSecondary: "#636363",
            colorError: "#ff6f77",
            colorInfo: "#5bc0de",
            fontFamily: "Poppins, sans-serif",
            colorBgBase: "#fff",
          },
          components: {
            Calendar: {
              monthControlWidth: 5,
              yearControlWidth: 5,
            }
          }
        }}
      >
        <ActivityProvider>
          <NotificationProvider>
            <AntApp>
              <App />
            </AntApp>
          </NotificationProvider>
        </ActivityProvider>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();
