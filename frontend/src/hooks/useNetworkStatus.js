import { useState, useEffect } from 'react';

const isLocalhost = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname === '' ||
         hostname.startsWith('192.168.') ||
         process.env.NODE_ENV === 'development';
};

const checkLocalBackend = async () => {
  try {
    const response = await fetch('/api/inventory.php', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.log('Local backend check failed:', error.message);
    return false;
  }
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [lastOnlineTime, setLastOnlineTime] = useState(Date.now());
  const [connectionType, setConnectionType] = useState('unknown');
  const [isLocalhostEnv] = useState(isLocalhost());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTime(Date.now());
      console.log('Network: Online');
    };

    const handleOffline = () => {
      if (isLocalhostEnv) {
        checkLocalBackend().then(backendReachable => {
          if (!backendReachable) {
            setIsOnline(false);
            console.log('Network: Local backend unreachable');
          } else {
            console.log('Network: Internet lost but local backend still reachable');
          }
        });
      } else {
        setIsOnline(false);
        console.log('Network: Offline');
      }
    };

    const handleConnectionChange = () => {
      if (navigator.connection) {
        setConnectionType(navigator.connection.effectiveType || 'unknown');
        console.log('Connection type:', navigator.connection.effectiveType);
      }
    };

    if (navigator.connection) {
      setConnectionType(navigator.connection.effectiveType || 'unknown');
    }

    if (isLocalhostEnv) {
      checkLocalBackend().then(backendReachable => {
        if (!backendReachable) {
          setIsOnline(false);
          console.log('Network: Initial local backend check failed');
        }
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [isLocalhostEnv]);

  return {
    isOnline,
    lastOnlineTime,
    isOffline: !isOnline,
    connectionType,
    isLocalhost: isLocalhostEnv
  };
}; 