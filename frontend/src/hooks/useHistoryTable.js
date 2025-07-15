import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import debounce from "lodash/debounce";
import { useMediaQuery } from 'react-responsive';
import { 
  updateTableCache, 
  markTableCacheStale, 
  isTableCacheValid, 
  getTableCacheData, 
  getTableCacheLastUpdated,
  SYNC_INTERVAL 
} from '../utils/cacheUtils';
import { getHistory } from '../services/api/getHistory';
import { isOffline } from '../utils/offlineUtils';

export const useHistoryTable = (historyData = [], processedData = {}, loading = false, onRefresh) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState({ added: [], updated: [], deleted: [] });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [searchTerms, setSearchTerms] = useState({ added: "", updated: "", deleted: "" });
  const [currentPages, setCurrentPages] = useState({ added: 1, updated: 1, deleted: 1 });
  const [pageSizes, setPageSizes] = useState({ added: 10, updated: 10, deleted: 10 });
  const [sorterConfigs, setSorterConfigs] = useState({
    added: { field: null, order: null },
    updated: { field: null, order: null },
    deleted: { field: null, order: null },
  });
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const [searchColumns, setSearchColumns] = useState({ added: 'all', updated: 'all', deleted: 'all' });
  const [localFilteredData, setLocalFilteredData] = useState({ added: [], updated: [], deleted: [] });
  const [filterActive, setFilterActive] = useState({ added: false, updated: false, deleted: false });
  const syncIntervalRef = useRef(null);
  
  const TABLE_NAME = 'history';

  const searchableColumns = useMemo(() => ({
    added: [
      { key: 'all', label: 'All Columns' },
      { key: 'id', label: 'ID' },
      { key: 'action', label: 'Action' },
      { key: 'action_date', label: 'Action Date' },
      { key: 'item_id', label: 'Item ID' },
      { key: 'type', label: 'Type' },
      { key: 'brand', label: 'Brand' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'remarks', label: 'Remarks' },
      { key: 'serial_number', label: 'Serial Number' },
      { key: 'issued_date', label: 'Issued Date' },
      { key: 'purchase_date', label: 'Purchased Date' },
      { key: 'condition', label: 'Condition' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
    ],
    updated: [
      { key: 'all', label: 'All Columns' },
      { key: 'id', label: 'ID' },
      { key: 'action', label: 'Action' },
      { key: 'action_date', label: 'Action Date' },
      { key: 'item_id', label: 'Item ID' },
      { key: 'field_changed', label: 'Field Changed'},

    ],
    deleted: [
      { key: 'all', label: 'All Columns' },
      { key: 'id', label: 'ID' },
      { key: 'action', label: 'Action' },
      { key: 'action_date', label: 'Action Date' },
      { key: 'item_id', label: 'Item ID' },
      { key: 'type', label: 'Type' },
      { key: 'brand', label: 'Brand' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'remarks', label: 'Remarks' },
      { key: 'serial_number', label: 'Serial Number' },
      { key: 'issued_date', label: 'Issued Date' },
      { key: 'purchase_date', label: 'Purchased Date' },
      { key: 'condition', label: 'Condition' },
      { key: 'location', label: 'Detachment/Office' },
      { key: 'status', label: 'Status' },
    ],
  }), []);

  const refreshHistory = useCallback(async (forceRefresh = false) => {
    try {
      if (await isOffline()) {
        console.warn('Cannot refresh history while offline');
        return;
      }

      setIsRefreshing(true);
      
      if (isTableCacheValid(TABLE_NAME, forceRefresh)) {
        const cachedData = getTableCacheData(TABLE_NAME);
        if (onRefresh) {
          onRefresh(cachedData);
        }
        setLastSyncTime(getTableCacheLastUpdated(TABLE_NAME));
        return;
      }

      const freshData = await getHistory();
      
      updateTableCache(TABLE_NAME, freshData);
      
      if (onRefresh) {
        onRefresh(freshData);
      }
      setLastSyncTime(Date.now());
      
    } catch (error) {
      console.error('Failed to load history data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const startBackgroundSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      try {
        if (await isOffline()) {
          return;
        }
        
        const freshData = await getHistory();
        updateTableCache(TABLE_NAME, freshData);
        
        if (onRefresh) {
          onRefresh(freshData);
        }
        setLastSyncTime(Date.now());
        
      } catch (error) {
        console.warn('Background sync failed:', error);
        markTableCacheStale(TABLE_NAME);
      }
    }, SYNC_INTERVAL);
  }, [onRefresh]);

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

  const handleRowSelectionChange = useCallback((tab, keys) => {
    setSelectedRowKeys(prev => ({ ...prev, [tab]: keys }));
  }, []);

  const getRowSelection = useCallback((tab) => ({
    selectedRowKeys: selectedRowKeys[tab],
    onChange: (keys) => handleRowSelectionChange(tab, keys),
    preserveSelectedRowKeys: true,
  }), [selectedRowKeys, handleRowSelectionChange]);

  const filterAndSortData = useCallback((data, searchTerm, sorterConfig, searchColumn) => {
    let filteredData = data;
    
    if (searchTerm && searchTerm.trim()) {
      const searchValue = searchTerm.trim().toLowerCase();
      
      const searchIndex = new Map();
      
      filteredData = data.filter((item) => {
        if (searchColumn === "all") {
          return Object.entries(item).some(([key, val]) => {
            if (val == null) return false;
            const cellValue = String(val).toLowerCase();
            return cellValue.includes(searchValue);
          });
        } else {
          const cellValue = item[searchColumn];
          if (cellValue == null) return false;
          return String(cellValue).toLowerCase().includes(searchValue);
        }
      });
    }

    if (sorterConfig.field && sorterConfig.order) {
      return [...filteredData].sort((a, b) => {
        const valueA = a[sorterConfig.field];
        const valueB = b[sorterConfig.field];

        if (sorterConfig.field === "id") {
          return sorterConfig.order === "ascend" ? valueA - valueB : valueB - valueA;
        }

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sorterConfig.order === "ascend"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return sorterConfig.order === "ascend"
          ? valueA > valueB ? 1 : -1
          : valueA < valueB ? 1 : -1;
      });
    }
    return filteredData;
  }, []);

  const addedData = useMemo(() => {
    return filterAndSortData(
      processedData.addedData || [],
      searchTerms.added,
      sorterConfigs.added,
      searchColumns.added
    );
  }, [processedData.addedData, searchTerms.added, sorterConfigs.added, searchColumns.added, filterAndSortData]);

  const updatedData = useMemo(() => {
    return filterAndSortData(
      processedData.updatedData || [],
      searchTerms.updated,
      sorterConfigs.updated,
      searchColumns.updated
    );
  }, [processedData.updatedData, searchTerms.updated, sorterConfigs.updated, searchColumns.updated, filterAndSortData]);

  const deletedData = useMemo(() => {
    return filterAndSortData(
      processedData.deletedData || [],
      searchTerms.deleted,
      sorterConfigs.deleted,
      searchColumns.deleted
    );
  }, [processedData.deletedData, searchTerms.deleted, sorterConfigs.deleted, searchColumns.deleted, filterAndSortData]);

  const debouncedSetLocalFilteredData = useMemo(
    () =>
      debounce((tab, filtered) => {
        setLocalFilteredData((prev) => ({ ...prev, [tab]: filtered }));
      }, 150),
    []
  );

  const handleSearch = useCallback((tab, e) => {
    const value = e.target.value;
    setSearchTerms((prev) => ({ ...prev, [tab]: value }));

    if (!value || value.trim() === "") {
      setFilterActive((prev) => ({ ...prev, [tab]: false }));
      setLocalFilteredData((prev) => ({ ...prev, [tab]: [] }));
      return;
    }

    setFilterActive((prev) => ({ ...prev, [tab]: true }));

    const tabData = historyData.filter((item) => {
      if (tab === "added") return item.action === "Added";
      if (tab === "updated") return item.action === "Updated" || item.action === "QRCode Update";
      if (tab === "deleted") return item.action === "Deleted";
      return false;
    });

    const searchValue = value.trim().toLowerCase();
    
    const filtered = tabData.filter((item) => {
      if (!item) return false;
      const searchColumn = searchColumns[tab];
      
      if (searchColumn === "all") {
        return Object.entries(item).some(([key, val]) => {
          if (val == null) return false;
          const cellValue = String(val).toLowerCase();
          return cellValue.includes(searchValue);
        });
      } else {
        const cellValue = item[searchColumn];
        if (cellValue == null) return false;
        return String(cellValue).toLowerCase().includes(searchValue);
      }
    });

    debouncedSetLocalFilteredData(tab, filtered);
  }, [historyData, searchColumns, debouncedSetLocalFilteredData]);

  const handleColumnChange = useCallback((tab, column) => {
    setSearchColumns((prev) => ({ ...prev, [tab]: column }));
  }, []);

  const resetTab = useCallback((tab) => {
    setSearchTerms((prev) => ({ ...prev, [tab]: "" }));
    setSearchColumns((prev) => ({ ...prev, [tab]: "all" }));
    setFilterActive((prev) => ({ ...prev, [tab]: false }));
    setCurrentPages((prev) => ({ ...prev, [tab]: 1 }));
    setLocalFilteredData((prev) => ({ ...prev, [tab]: [] }));
  }, []);

  const handlePageChange = useCallback((tab, page, pageSize) => {
    setCurrentPages((prev) => ({ ...prev, [tab]: page }));
    setPageSizes((prev) => ({ ...prev, [tab]: pageSize }));
  }, []);

  const handleTableChange = useCallback((tab, _, __, sorter) => {
    setSorterConfigs((prev) => ({
      ...prev,
      [tab]: { field: sorter.field, order: sorter.order },
    }));
  }, []);

  const showModal = useCallback((record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  }, []);

  const resetAllFilters = useCallback((tab) => {
    resetTab(tab);
    setSorterConfigs((prev) => ({
      ...prev,
      [tab]: { field: null, order: null },
    }));
  }, [resetTab]);

  return {
    isMobile,
    historyData,
    loading,
    modalVisible,
    setModalVisible,
    selectedRecord,
    searchTerms,
    currentPages,
    pageSizes,
    sorterConfigs,
    searchColumns,
    localFilteredData,
    filterActive,
    searchableColumns,
    addedData,
    updatedData,
    deletedData,
    handleSearch,
    handleColumnChange,
    resetTab,
    handlePageChange,
    handleTableChange,
    showModal,
    resetAllFilters,
    refreshHistory,
    selectedRowKeys,
    handleRowSelectionChange,
    getRowSelection,
    isRefreshing,
    lastSyncTime,
  };
};