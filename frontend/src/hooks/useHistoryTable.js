import { useState, useEffect, useMemo, useCallback } from "react";
import { getHistory } from "../services/api/getHistory";
import debounce from "lodash/debounce";
import { useMediaQuery } from 'react-responsive';


export const useHistoryTable = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

const searchableColumns = {
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
};

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    setSearchTerms({ added: "", updated: "", deleted: "" });
    setCurrentPages({ added: 1, updated: 1, deleted: 1 });
    setPageSizes({ added: 10, updated: 10, deleted: 10 });
    setSorterConfigs({
      added: { field: null, order: null },
      updated: { field: null, order: null },
      deleted: { field: null, order: null },
    });
    setSearchColumns({ added: 'all', updated: 'all', deleted: 'all' });
    setFilterActive({ added: false, updated: false, deleted: false });
    setLocalFilteredData({ added: [], updated: [], deleted: [] });

    try {
      const data = await getHistory();
      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const filterAndSortData = useCallback((data, searchTerm, sorterConfig, searchColumn) => {
    let filteredData = data;
    if (searchTerm) {
      filteredData = data.filter((item) => {
        if (searchColumn === "all") {
          return Object.values(item).some((val) =>
            val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          const cellValue = item[searchColumn];
          return cellValue && String(cellValue).toLowerCase().includes(searchTerm.toLowerCase());
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
      historyData.filter((item) => item.action === "Added"),
      searchTerms.added,
      sorterConfigs.added,
      searchColumns.added
    );
  }, [historyData, searchTerms.added, sorterConfigs.added, searchColumns.added, filterAndSortData]);

  const updatedData = useMemo(() => {
    return filterAndSortData(
      historyData.filter((item) => item.action === "Updated" || item.action === "QRCode Update"),
      searchTerms.updated,
      sorterConfigs.updated,
      searchColumns.updated
    );
  }, [historyData, searchTerms.updated, sorterConfigs.updated, searchColumns.updated, filterAndSortData]);

  const deletedData = useMemo(() => {
    return filterAndSortData(
      historyData.filter((item) => item.action === "Deleted"),
      searchTerms.deleted,
      sorterConfigs.deleted,
      searchColumns.deleted
    );
  }, [historyData, searchTerms.deleted, sorterConfigs.deleted, searchColumns.deleted, filterAndSortData]);

  const debouncedSetLocalFilteredData = useMemo(
    () =>
      debounce((tab, filtered) => {
        setLocalFilteredData((prev) => ({ ...prev, [tab]: filtered }));
      }, 300),
    []
  );

  const handleSearch = (tab, e) => {
    const value = e.target.value.trim().toLowerCase();
    setSearchTerms((prev) => ({ ...prev, [tab]: value }));

    if (value === "") {
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

    const filtered = tabData.filter((item) => {
      if (!item) return false;
      const searchColumn = searchColumns[tab];
      if (searchColumn === "all") {
        for (const key in item) {
          const cellValue = item[key];
          if (cellValue && String(cellValue).toLowerCase().includes(value)) {
            return true;
          }
        }
        return false;
      } else {
        const cellValue = item[searchColumn];
        return cellValue && String(cellValue).toLowerCase().includes(value);
      }
    });

    debouncedSetLocalFilteredData(tab, filtered);
  };

  const handleColumnChange = (tab, column) => {
    setSearchColumns((prev) => ({ ...prev, [tab]: column }));
  };

  const resetTab = (tab) => {
    setSearchTerms((prev) => ({ ...prev, [tab]: "" }));
    setSearchColumns((prev) => ({ ...prev, [tab]: "all" }));
    setFilterActive((prev) => ({ ...prev, [tab]: false }));
    setCurrentPages((prev) => ({ ...prev, [tab]: 1 }));
    setLocalFilteredData((prev) => ({ ...prev, [tab]: [] }));
  };

  const handlePageChange = (tab, page, pageSize) => {
    setCurrentPages((prev) => ({ ...prev, [tab]: page }));
    setPageSizes((prev) => ({ ...prev, [tab]: pageSize }));
  };

  const handleTableChange = (tab, _, __, sorter) => {
    setSorterConfigs((prev) => ({
      ...prev,
      [tab]: { field: sorter.field, order: sorter.order },
    }));
  };

  const showModal = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const resetAllFilters = (tab) => {
    resetTab(tab);
    setSorterConfigs((prev) => ({
      ...prev,
      [tab]: { field: null, order: null },
    }));
  };

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
  };
};