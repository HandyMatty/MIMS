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

export const isOffline = async () => {
  if (isLocalhost()) {
    return !(await checkLocalBackend());
  }
  
  return !navigator.onLine || 
         navigator.connection?.effectiveType === 'none' ||
         navigator.connection?.downlink === 0;
};

export const createOfflineError = (originalError) => {
  const offlineError = new Error('Network request cancelled - offline');
  offlineError.isOffline = true;
  offlineError.originalError = originalError;
  offlineError.code = 'OFFLINE_ERROR';
  return offlineError;
};

export const handleOfflineRequest = async (apiCall, fallbackData = null) => {
  return new Promise(async (resolve, reject) => {
    if (await isOffline()) {
      console.log('Request cancelled - offline');
      reject(createOfflineError(new Error('Offline')));
      return;
    }

    apiCall()
      .then(resolve)
      .catch(async (error) => {
        if (error.code === 'ERR_NETWORK' || 
            error.message === 'Network Error' || 
            error.message.includes('ERR_INTERNET_DISCONNECTED') ||
            error.message.includes('Failed to fetch') ||
            await isOffline()) {
          console.log('Network error - offline detected');
          reject(createOfflineError(error));
        } else {
          reject(error);
        }
      });
  });
};

export const retryOnReconnect = (apiCall, maxRetries = 3) => {
  let retryCount = 0;
  
  const attempt = async () => {
    return apiCall().catch(async (error) => {
      if (error.isOffline && retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying request (${retryCount}/${maxRetries}) after reconnection...`);
        
        return new Promise(async (resolve) => {
          const checkOnline = async () => {
            if (!(await isOffline())) {
              resolve(attempt());
            } else {
              setTimeout(checkOnline, 1000);
            }
          };
          checkOnline();
        });
      }
      throw error;
    });
  };
  
  return attempt();
}; 