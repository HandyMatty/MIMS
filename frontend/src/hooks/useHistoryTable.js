import { useState, useEffect, useMemo } from "react";
import { getHistory } from "../services/api/getHistory";

export const useHistoryTable = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Independent states for each tab
  const [searchTerms, setSearchTerms] = useState({ added: "", updated: "", deleted: "" });
  const [currentPages, setCurrentPages] = useState({ added: 1, updated: 1, deleted: 1 });
  const [pageSizes, setPageSizes] = useState({ added: 10, updated: 10, deleted: 10 });
  const [sorterConfigs, setSorterConfigs] = useState({
    added: { field: null, order: null },
    updated: { field: null, order: null },
    deleted: { field: null, order: null },
  });
  
  // States for column-specific search
  const [searchColumns, setSearchColumns] = useState({ added: 'all', updated: 'all', deleted: 'all' });
  const [localFilteredData, setLocalFilteredData] = useState({ added: [], updated: [], deleted: [] });
  const [filterActive, setFilterActive] = useState({ added: false, updated: false, deleted: false });

  // Searchable columns for the dropdown
  const searchableColumns = [
    { key: 'all', label: 'All Columns' },
    { key: 'id', label: 'ID' },
    { key: 'action', label: 'Action' },
    { key: 'action_date', label: 'Action Date' },
    { key: 'item_id', label: 'Item ID' },
    { key: 'type', label: 'Type' },
    { key: 'brand', label: 'Brand' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'field_changed', label: 'Field Changed' },
    { key: 'serial_number', label: 'Serial Number' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'condition', label: 'Condition' },
  ];

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const data = await getHistory();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching history data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryData();
  }, []);

  const filterAndSortData = (data, searchTerm, sorterConfig) => {
    // Apply search filter
    const filteredData = data.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Apply sorting
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
  };

  // Categorized and processed data
  const addedData = useMemo(() => {
    return filterAndSortData(
      historyData.filter((item) => item.action === "Added"),
      searchTerms.added,
      sorterConfigs.added
    );
  }, [historyData, searchTerms.added, sorterConfigs.added]);

  const updatedData = useMemo(() => {
    return filterAndSortData(
      historyData.filter((item) => item.action === "Updated" || item.action === "QRCode Update"),
      searchTerms.updated,
      sorterConfigs.updated
    );
  }, [historyData, searchTerms.updated, sorterConfigs.updated]);

  const deletedData = useMemo(() => {
    return filterAndSortData(
      historyData.filter((item) => item.action === "Deleted"),
      searchTerms.deleted,
      sorterConfigs.deleted
    );
  }, [historyData, searchTerms.deleted, sorterConfigs.deleted]);

  // Handle search with column filtering
  const handleSearch = (tab, e) => {
    const value = e.target.value.trim().toLowerCase();
    
    // Update search term
    setSearchTerms(prev => ({ ...prev, [tab]: value }));
    
    if (value === '') {
      // Reset filtering for this tab
      setFilterActive(prev => ({ ...prev, [tab]: false }));
      return;
    }
    
    // Set filtering as active for this tab
    setFilterActive(prev => ({ ...prev, [tab]: true }));
    
    // Get the correct data based on tab
    const tabData = historyData.filter(item => {
      if (tab === 'added') return item.action === 'Added';
      if (tab === 'updated') return item.action === 'Updated' || item.action === 'QRCode Update';
      if (tab === 'deleted') return item.action === 'Deleted';
      return false;
    });
    
    // Filter data based on selected column
    const filtered = tabData.filter(item => {
      if (!item) return false;
      
      const searchColumn = searchColumns[tab];
      
      if (searchColumn === 'all') {
        // Search all columns
        for (const key in item) {
          const cellValue = item[key];
          if (cellValue && String(cellValue).toLowerCase().includes(value)) {
            return true;
          }
        }
        return false;
      } else {
        // Search specific column
        const cellValue = item[searchColumn];
        return cellValue && String(cellValue).toLowerCase().includes(value);
      }
    });
    
    // Update filtered data for this tab
    setLocalFilteredData(prev => ({ ...prev, [tab]: filtered }));
  };

  // Handle column selection change
  const handleColumnChange = (tab, column) => {
    setSearchColumns(prev => ({ ...prev, [tab]: column }));
  };

  // Reset all filters for a tab
  const resetTab = (tab) => {
    setSearchTerms(prev => ({ ...prev, [tab]: '' }));
    setSearchColumns(prev => ({ ...prev, [tab]: 'all' }));
    setFilterActive(prev => ({ ...prev, [tab]: false }));
    setCurrentPages(prev => ({ ...prev, [tab]: 1 }));
  };

  // Function to handle pagination change for each tab
  const handlePageChange = (tab, page, pageSize) => {
    setCurrentPages((prev) => ({ ...prev, [tab]: page }));
    setPageSizes((prev) => ({ ...prev, [tab]: pageSize }));
  };

  // Function to handle sorting changes for each tab
  const handleTableChange = (tab, _, __, sorter) => {
    setSorterConfigs((prev) => ({
      ...prev,
      [tab]: { field: sorter.field, order: sorter.order },
    }));
  };

  // Function to open modal
  const showModal = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // Reset all filters and sorters for a tab
  const resetAllFilters = (tab) => {
    resetTab(tab);
    setSorterConfigs(prev => ({
      ...prev,
      [tab]: { field: null, order: null },
    }));
  };

  return {
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
    resetAllFilters
  };
}; 