import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { App } from 'antd';
import { addItemToInventory, getInventoryData, deleteItems, updateItem, redistributeItem } from '../services/api/addItemToInventory';
import { useActivity } from '../utils/ActivityContext';
import { useNotification } from '../utils/NotificationContext';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';
import dayjs from 'dayjs';
import { isOffline } from '../utils/offlineUtils';

const inventoryCache = {
  data: null,
  lastUpdated: null,
  version: 0,
  isStale: false
};

const SYNC_INTERVAL = 5 * 60 * 1000;

const optimizedSearch = (items, searchText, searchColumn = 'all') => {
  if (!searchText || searchText.trim() === '') {
    return items;
  }

  const searchLower = searchText.toLowerCase().trim();
  const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);

  return items.filter(item => {
    if (!item) return false;

    if (searchColumn === 'all') {
      const itemText = Object.values(item)
        .filter(val => val != null && val !== undefined)
        .map(val => String(val).toLowerCase())
        .join(' ');

      return searchWords.every(word => itemText.includes(word));
    } else {
      const cellValue = item[searchColumn];
      if (!cellValue) return false;
      
      const cellText = String(cellValue).toLowerCase();
      return searchWords.every(word => cellText.includes(word));
    }
  });
};

const isProduction =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  window.location.hostname !== '' &&
  !window.location.hostname.startsWith('192.168.') &&
  process.env.NODE_ENV === 'production';

export const useInventoryTable = (inventoryData = [], loading = false, setInventoryData, localSetInventoryData) => {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [sorterConfig, setSorterConfig] = useState({ field: 'id', order: 'descend' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRedistributeModalVisible, setIsRedistributeModalVisible] = useState(false);
  const [redistributeItemData, setRedistributeItemData] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('default');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => (Array.isArray(inventoryData) && inventoryData.length > 0 ? Date.now() : null));
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { userData: adminUserData } = useAdminAuthStore();
  const { userData: userUserData } = useUserAuthStore();
  const syncIntervalRef = useRef(null);

  const username = adminUserData?.username || userUserData?.username || 'Unknown User';
  const isAdmin = !!adminUserData;
  const isUser = !!userUserData;
  const userRole = isAdmin ? 'admin' : isUser ? 'user' : 'guest';

  const dataSource = useMemo(() => inventoryData || [], [inventoryData]);


  const { totalEntries, paginatedData } = useMemo(() => {
    const filtered = optimizedSearch(dataSource, searchText);

    const sorted = [...filtered].sort((a, b) => {
      if (sorterConfig.field && sorterConfig.order) {
        const { field, order } = sorterConfig;
        if (order === 'ascend') {
          return a[field] > b[field] ? 1 : -1;
        } else if (order === 'descend') {
          return a[field] < b[field] ? 1 : -1;
        }
      }
      return 0;
    });

    const total = sorted.length;
    const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return {
      filteredData: filtered,
      sortedData: sorted,
      totalEntries: total,
      paginatedData: paginated
    };
  }, [dataSource, searchText, sorterConfig, currentPage, pageSize]);

  const handleRefresh = useCallback(async (forceRefresh = false) => {
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot refresh data while offline');
        return;
      }

      setIsRefreshing(true);
      
      const now = Date.now();
      const cacheAge = now - (inventoryCache.lastUpdated || 0);
      const isCacheValid = !forceRefresh && 
        inventoryCache.data && 
        cacheAge < SYNC_INTERVAL && 
        !inventoryCache.isStale;

      if (isCacheValid) {
        const updateFunction = setInventoryData || localSetInventoryData;
        if (typeof updateFunction === 'function') {
          updateFunction(inventoryCache.data);
        }
        setLastSyncTime(inventoryCache.lastUpdated);
        return;
      }

      const freshData = await getInventoryData();
      
      inventoryCache.data = freshData;
      inventoryCache.lastUpdated = now;
      inventoryCache.version++;
      inventoryCache.isStale = false;
      
      const updateFunction = setInventoryData || localSetInventoryData;
      if (typeof updateFunction === 'function') {
        updateFunction(freshData);
      }
      setLastSyncTime(now);
      
    } catch (error) {
      if (isProduction && (error.isOffline || error.message?.includes('Offline'))) {
        message.warning('Cannot refresh data while offline');
      } else {
        message.error('Failed to load inventory data.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [message, setInventoryData, localSetInventoryData]);

  const startBackgroundSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      try {
        if (isProduction && (await isOffline())) {
          return;
        }
        
        const freshData = await getInventoryData();
        inventoryCache.data = freshData;
        inventoryCache.lastUpdated = Date.now();
        inventoryCache.version++;
        
        const updateFunction = setInventoryData || localSetInventoryData;
        if (typeof updateFunction === 'function') {
          updateFunction(freshData);
        }
        setLastSyncTime(Date.now());
        
      } catch (error) {
        console.warn('Background sync failed:', error);
        inventoryCache.isStale = true;
      }
    }, SYNC_INTERVAL);
  }, [setInventoryData, localSetInventoryData]);

  const stopBackgroundSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startBackgroundSync();
    return () => stopBackgroundSync();
  }, [startBackgroundSync, stopBackgroundSync]);

  const markCacheStale = useCallback(() => {
    inventoryCache.isStale = true;
  }, []);

  const handlePageChange = useCallback((page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  }, []);

  const handleSortOrderChange = useCallback((value) => {
    const normalizedValue = value === 'Oldest' ? 'Oldest' : 'Newest';
    setSortOrder(normalizedValue);
    const order = normalizedValue === 'Newest' ? 'descend' : 'ascend';
    setSorterConfig({ field: 'id', order });
    setCurrentPage(1);
  }, []);

  const handleTableChange = useCallback((sorter) => {
    if (sorter.field) {
      setSorterConfig({ field: sorter.field, order: sorter.order });
    }
  }, []);

  const handleAddItem = useCallback(async (newItem) => {
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot add item while offline');
        return;
      }
      const response = await addItemToInventory(newItem);
      if (response && response.id) {
        const updateFunction = setInventoryData || localSetInventoryData;
        if (typeof updateFunction === 'function') {
          const itemToAdd = {
            ...newItem,
            id: response.id,
            issuedDate: newItem.issuedDate || null,
            purchaseDate: newItem.purchaseDate || null
          };
          updateFunction(prev => [...prev, itemToAdd]);
          
          if (inventoryCache.data) {
            inventoryCache.data = [...inventoryCache.data, itemToAdd];
            inventoryCache.lastUpdated = Date.now();
            inventoryCache.version++;
          }
        }
        message.success(`Item added successfully! ID: ${response.id}`);
        await logUserActivity(username, 'Inventory', `Added item with ID: ${response.id}`);
        await logUserNotification('Inventory Update', `You added an item with ID: ${response.id}`);
        if (typeof updateFunction !== 'function') {
          handleRefresh();
        }
      } else {
        message.error('Failed to retrieve item ID.');
      }
    } catch (error) {
      if (isProduction && (error.isOffline || error.message?.includes('Offline'))) {
        message.warning('Cannot add item while offline');
      } else {
        console.error('Error adding item:', error);
        message.error('Failed to add item.');
      }
    }
  }, [message, logUserActivity, logUserNotification, username, handleRefresh, setInventoryData, localSetInventoryData]);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setIsEditModalVisible(true);
  }, []);

  const handleRedistribute = useCallback((item) => {
    setRedistributeItemData(item);
    setIsRedistributeModalVisible(true);
  }, []);

  const handleRedistributeItem = useCallback(async (payload) => {
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot redistribute item while offline');
        return;
      }
      const response = await redistributeItem(payload);
      
      const updateFunction = setInventoryData || localSetInventoryData;
      if (typeof updateFunction === 'function') {
        updateFunction(prev => prev.map(item => {
          if (item.id === payload.id) {
            return { ...item, quantity: item.quantity - payload.newQuantity };
          }
          return item;
        }));
        
        if (response.new_item_id) {
          const originalItem = dataSource.find(item => item.id === payload.id);
          if (originalItem) {
            const newItem = {
              id: response.new_item_id,
              type: originalItem.type,
              brand: originalItem.brand,
              quantity: payload.newQuantity,
              serialNumber: originalItem.serialNumber,
              issuedDate: payload.issuedDate,
              purchaseDate: originalItem.purchaseDate,
              condition: payload.condition,
              location: payload.newLocation,
              status: payload.status,
              remarks: payload.remarks
            };
            updateFunction(prev => [...prev, newItem]);
          }
        }
      }
      
      message.success(`Item redistributed successfully! New Item ID: ${response.new_item_id}`);
      setIsRedistributeModalVisible(false);
      setRedistributeItemData(null);
      await logUserActivity(username, "Inventory", `Redistributed item with ID: ${payload.id} to new item ID: ${response.new_item_id}`);
      await logUserNotification("Inventory Update", `You redistributed an item with ID: ${payload.id} to new item ID: ${response.new_item_id}`);
      
      if (typeof updateFunction !== 'function') {
        handleRefresh();
      }
    } catch (error) {
      if (isProduction && (error.isOffline || error.message?.includes('Offline'))) {
        message.warning('Cannot redistribute item while offline');
      } else {
        const backendMessage = error?.response?.data?.message || error.message || '';
        if (backendMessage.toLowerCase().includes('quantity') && backendMessage.includes('1')) {
          message.error("You can't redistribute an item with quantity of 1.");
        } else {
          message.error('Failed to redistribute item.');
        }
        console.error(error);
      }
    }
  }, [message, logUserActivity, logUserNotification, username, handleRefresh, setInventoryData, localSetInventoryData, dataSource]);

  const handleEditItem = useCallback(async (updatedItem, originalItem = null) => {
    const original = originalItem || editingItem;
    const hasChanges = Object.keys(updatedItem).some((key) => {
      const updatedValue = updatedItem[key];
      const originalValue = original[key];
      
      if (key === 'issuedDate' || key === 'purchaseDate') {
        const originalDate = originalValue ? dayjs(originalValue).format('YYYY-MM-DD') : null;
        return updatedValue !== originalDate;
      }
      if (key === 'quantity') {
        const updatedQty = Number(updatedValue);
        const originalQty = Number(originalValue);
        return updatedQty !== originalQty;
      }
      if (typeof updatedValue === "string") {
        return updatedValue.trim() !== (originalValue || "").trim();
      }
      return updatedValue !== originalValue;
    });
    if (!hasChanges) {
      message.error("No changes detected.");
      return;
    }
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot edit item while offline');
        return;
      }
      const response = await updateItem({ ...updatedItem, id: updatedItem?.id || editingItem?.id });
      if (response.message === "Item updated successfully") {
        const updateFunction = setInventoryData || localSetInventoryData;
        if (typeof updateFunction === 'function') {
          updateFunction(prev => prev.map(item => 
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          ));
          
          if (inventoryCache.data) {
            inventoryCache.data = inventoryCache.data.map(item => 
              item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            );
            inventoryCache.lastUpdated = Date.now();
            inventoryCache.version++;
          }
        }
        message.success(`Item with ID ${updatedItem.id} updated successfully!`);
        await logUserActivity(username, "Inventory", `Updated item with ID: ${updatedItem.id}`);
        await logUserNotification("Inventory Update", `You edited an item with ID: ${updatedItem.id}`);
        setIsEditModalVisible(false);
        if (typeof updateFunction !== 'function') {
          handleRefresh();
        }
      } else {
        message.error(response.message || "Failed to update item.");
      }
    } catch (error) {
      if (isProduction && (error.isOffline || error.message?.includes('Offline'))) {
        message.warning('Cannot edit item while offline');
      } else {
        console.error("Error updating item:", error);
        if (error.response && error.response.data && error.response.data.message) {
          message.error(`Failed to update item: ${error.response.data.message}`);
        } else {
          message.error("Failed to update item. Please try again.");
        }
      }
    }
  }, [editingItem, message, logUserActivity, logUserNotification, username, handleRefresh, setInventoryData, localSetInventoryData]);

  const handleBatchDelete = useCallback(async () => {
    if (!isAdmin) {
      message.error("You do not have permission to delete items.");
      return;
    }
    if (selectedRowKeys.length === 0) {
      message.warning("Please select items to delete.");
      return;
    }
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot delete items while offline');
        return;
      }
      const response = await deleteItems(selectedRowKeys);
      if (response.message === "Items deleted successfully") {
        await getInventoryData();
        handleRefresh();
        setSelectedRowKeys([]);
        message.success("Items deleted successfully!");
        await logUserActivity(username, "Inventory", `Deleted item(s) with ID(s): ${selectedRowKeys.join(", ")}`);
        await logUserNotification("Inventory Update", `You deleted item(s) with ID(s): ${selectedRowKeys.join(", ")}`);
      } else {
        message.error("Error deleting items.");
      }
    } catch (error) {
      if (isProduction && (error.isOffline || error.message?.includes('Offline'))) {
        message.warning('Cannot delete items while offline');
      } else {
        console.error("Error deleting items:", error);
        message.error("Failed to delete items. Please try again.");
      }
    }
  }, [isAdmin, selectedRowKeys, message, handleRefresh, logUserActivity, logUserNotification, username]);

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
  }, []);

  const rowSelection = useMemo(() => ({
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    preserveSelectedRowKeys: true,
  }), [selectedRowKeys]);

  const handleDeleteItems = useCallback(async () => {
    if (!isAdmin) {
      message.error("You do not have permission to delete items.");
      return;
    }
    if (selectedRowKeys.length === 0) {
      message.warning("Please select items to delete.");
      return;
    }
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot delete items while offline');
        return;
      }
      console.log('Deleting IDs:', selectedRowKeys);
      const response = await deleteItems(selectedRowKeys);
      console.log('Delete response:', response);
      if (response.message === "Items deleted successfully") {
        const updateFunction = setInventoryData || localSetInventoryData;
        if (typeof updateFunction === 'function') {
          updateFunction(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
          
          if (inventoryCache.data) {
            inventoryCache.data = inventoryCache.data.filter(item => !selectedRowKeys.includes(item.id));
            inventoryCache.lastUpdated = Date.now();
            inventoryCache.version++;
          }
        }
        setSelectedRowKeys([]);
        message.success("Items deleted successfully!");
        await logUserActivity(username, "Inventory", `Deleted item(s) with ID(s): ${selectedRowKeys.join(", ")}`);
        await logUserNotification("Inventory Update", `You deleted item(s) with ID(s): ${selectedRowKeys.join(", ")}`);
      } else {
        message.error(response.message || "Error deleting items.");
      }
    } catch (error) {
      if (isProduction && (error.isOffline || error.message?.includes('Offline'))) {
        message.warning('Cannot delete items while offline');
      } else {
        if (error?.response?.data?.message) {
          message.error(`Failed to delete items: ${error.response.data.message}`);
        } else if (error?.message) {
          message.error(`Failed to delete items: ${error.message}`);
        } else {
          message.error("Failed to delete items. Please try again.");
        }
        console.error("Error deleting items:", error);
      }
    }
  }, [isAdmin, selectedRowKeys, message, logUserActivity, logUserNotification, username, setInventoryData, localSetInventoryData]);

  return {
    searchText,
    setSearchText,
    sortOrder,
    currentPage,
    pageSize,
    isModalVisible,
    setIsModalVisible,
    isEditModalVisible,
    setIsEditModalVisible,
    redistributeItemData,
    setRedistributeItemData,
    isRedistributeModalVisible,
    setIsRedistributeModalVisible,
    editingItem,
    isLoading: loading,
    isRefreshing,
    lastSyncTime,
    activeTab,
    isAdmin,
    userRole,
    paginatedData,
    totalEntries,
    handleRedistribute,
    handleRedistributeItem,
    handlePageChange,
    handleSortOrderChange,
    handleTableChange,
    handleAddItem,
    handleEdit,
    handleEditItem,
    handleBatchDelete,
    handleDeleteItems,
    handleTabChange,
    rowSelection,
    dataSource,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRefresh,
    markCacheStale,
  };
};
