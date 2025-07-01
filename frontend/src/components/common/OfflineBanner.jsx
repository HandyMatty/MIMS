const OfflineBanner = () => (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    zIndex: 9999,
    background: "#ff4d4f",
    color: "#fff",
    textAlign: "center",
    padding: "10px 0",
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
  }}>
    ⚠️ You are offline. Please check your internet connection.
  </div>
);

export default OfflineBanner; 