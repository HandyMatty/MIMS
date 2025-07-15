const tableCaches = new Map();

const SYNC_INTERVAL = 5 * 60 * 1000;

export const createTableCache = (tableName) => {
  if (!tableCaches.has(tableName)) {
    tableCaches.set(tableName, {
      data: null,
      lastUpdated: null,
      version: 0,
      isStale: false
    });
  }
  return tableCaches.get(tableName);
};

export const updateTableCache = (tableName, data) => {
  const cache = createTableCache(tableName);
  cache.data = data;
  cache.lastUpdated = Date.now();
  cache.version++;
  cache.isStale = false;
};

export const markTableCacheStale = (tableName) => {
  const cache = createTableCache(tableName);
  cache.isStale = true;
};

export const isTableCacheValid = (tableName, forceRefresh = false) => {
  const cache = createTableCache(tableName);
  const now = Date.now();
  const cacheAge = now - (cache.lastUpdated || 0);
  
  return !forceRefresh && 
    cache.data && 
    cacheAge < SYNC_INTERVAL && 
    !cache.isStale;
};

export const getTableCacheData = (tableName) => {
  const cache = createTableCache(tableName);
  return cache.data;
};

export const getTableCacheLastUpdated = (tableName) => {
  const cache = createTableCache(tableName);
  return cache.lastUpdated;
};

export const clearTableCache = (tableName) => {
  if (tableCaches.has(tableName)) {
    tableCaches.delete(tableName);
  }
};

export const clearAllCaches = () => {
  tableCaches.clear();
};

export { SYNC_INTERVAL }; 