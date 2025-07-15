import { Alert } from 'antd';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const isProduction =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  window.location.hostname !== '' &&
  !window.location.hostname.startsWith('192.168.') &&
  process.env.NODE_ENV === 'production';

const OfflineBanner = () => {
  const { isOnline, lastOnlineTime, connectionType } = useNetworkStatus();

  if (!isProduction) return null;

  if (isOnline) {
    return null;
  }

  const formatLastOnline = () => {
    const now = Date.now();
    const diff = now - lastOnlineTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  const getConnectionInfo = () => {
    if (connectionType && connectionType !== 'unknown') {
      return ` (${connectionType})`;
    }
    return '';
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      zIndex: 9999,
      padding: "8px 16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
    }}>
      <Alert
        message={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              ⚠️ You are currently offline{getConnectionInfo()}. Some features may be limited. Last online: {formatLastOnline()}
            </span>
          </div>
        }
        description={
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Network requests will be queued and retried when connection is restored.
          </div>
        }
        type="warning"
        showIcon
        closable={false}
        style={{
          borderRadius: 0,
          border: 'none'
        }}
      />
    </div>
  );
};

export default OfflineBanner; 