import "./App.css";
import RootRoutes from "./routes"; // Import your routes
import OfflineBanner from "./components/common/OfflineBanner";

function App() {
  return (
    <>
      <OfflineBanner />
      <RootRoutes />
    </>
  );
}

export default App;
