import "./App.css";
import RootRoutes from "./routes"; // Import your routes
import { useEffect, useState } from "react";
import OfflineBanner from "./components/common/OfflineBanner";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Robust connectivity check
    let intervalId;
    const checkInternet = async () => {
      try {
        const response = await fetch("https://sentinelphils.com/Sentinel-MIMS/backend/api/getInventoryData.php", { method: "GET", cache: "no-store" });
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    // Check every 5 seconds
    intervalId = setInterval(checkInternet, 5000);
    // Initial check
    checkInternet();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      {!isOnline && <OfflineBanner />}
      <RootRoutes />
    </>
  );
}

export default App;
