import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useInventoryTable } from '../../hooks/useInventoryTable';
import { Table, Select, Input, Button, Typography, Pagination, Tooltip, Card, Tabs, Dropdown, Space, App, Alert } from 'antd';
import { SearchOutlined, ReloadOutlined, DownOutlined, FilterOutlined, ControlOutlined, DeleteOutlined, PrinterOutlined, ToolOutlined, DownloadOutlined, WifiOutlined } from '@ant-design/icons';
import AddItemModal from './AddItemModal'; 
import EditItemModal from './EditItemModal';
import RedistributeItemModal from './RedistributeItemModal';
import BatchAddItemModal from './BatchAddItemModal';
import BatchEditItemModal from './BatchEditItemModal';
import BatchItemPickerModal from './BatchItemPickerModal';
import BatchDeleteItemModal from './BatchDeleteItemModal';
import BatchPrintItemModal from './BatchPrintItemModal';
import ExportModal from '../common/ExportModal';
import { columns } from './inventoryTableColumns';
import debounce from 'lodash/debounce';
import { useMediaQuery } from 'react-responsive';
import { handlePrint as printUtilsHandlePrint } from '../../utils/printUtils';
import batchEditItems from '../../services/api/batchEditItems';
import batchAddItems from '../../services/api/batchAddItems';
import batchDeleteItems from '../../services/api/batchDeleteItems';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { isOffline } from '../../utils/offlineUtils';
import { SearchContext } from '../../utils/SearchContext';

const isProduction =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  window.location.hostname !== '' &&
  !window.location.hostname.startsWith('192.168.') &&
  process.env.NODE_ENV === 'production';

const { Option } = Select;

const TableContent = React.memo(({
  isMobile,
  searchColumn,
  isAdmin,
  userRole,
  setIsModalVisible,
  batchMenuItems,
  handleBatchMenuClick,
  commonButtonProps,
  selectedRowKeys,
  handleDeleteItems,
  sortOrder,
  handleSortOrderChange,
  handleFullRefresh,
  handlePrint,
  handleExportOpen,
  searchableColumnsForTab,
  getColumnMenu,
  tableKey,
  rowSelection,
  filteredData,
  tableColumns,
  handleTableChange,
  loading,
  isRefreshing,
  mobileExpandableConfig,
  searchInputProps
}) => (
  <>
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
      <div className={isMobile ? "flex flex-row flex-wrap gap-1 mb-2" : "flex items-center gap-2"}>
        <Dropdown menu={getColumnMenu} trigger={['click']} className={isMobile ? "border-black text-xs block theme-aware-dropdown-btn" : "border-black text-xs sm:block hidden theme-aware-dropdown-btn"}>
          <Button 
            type="text"
            className={isMobile ? "flex items-center p-1 h-7 text-xs w-full" : "flex items-center"}
            size="small"
          >
            <FilterOutlined className="text-xs" />
            <Space>
              {searchableColumnsForTab.find(col => col.key === searchColumn)?.label || 'All Columns'}
            </Space>
            <DownOutlined className='align-middle ml-1' />
          </Button>
        </Dropdown>
        <Input
          {...searchInputProps}
          prefix={<SearchOutlined />}
        />
        <Tooltip title="Actions">
          {(isAdmin || userRole === 'user') && (
            <Button
              type="text"
              icon={<ControlOutlined />}
              onClick={() => setIsModalVisible(true)}
              {...commonButtonProps}
            />
          )}
        </Tooltip>
        <Dropdown
          menu={{
            items: batchMenuItems,
            onClick: handleBatchMenuClick,
          }}
          trigger={["click"]}
        >
           {(isAdmin || userRole === 'user') && (
          <Tooltip title="Batch Actions">
            <Button
              type="text"
              icon={<ToolOutlined />}
              {...commonButtonProps}
            >
            </Button>
          </Tooltip>
          )}
        </Dropdown>
        {isAdmin && (
          <Tooltip title="Delete">
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
              disabled={selectedRowKeys.length === 0}
              onClick={handleDeleteItems}
              {...commonButtonProps}
            />
          </Tooltip>
        )}
        <Select
          value={sortOrder}
          className={isMobile ? "w-auto text-xs transparent-select h-7" : "w-auto text-xs transparent-select"}
          onChange={handleSortOrderChange}
          size="small"
        >
          <Option value="Newest"><span className="text-xs">Newest</span></Option>
          <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
        </Select>
        <Button 
          onClick={handleFullRefresh} 
          className={isMobile ? "w-auto custom-button text-xs" : "custom-button w-auto text-xs"}
          type="default"
          size="small"
          icon={<ReloadOutlined />}
          loading={isRefreshing}
        >
          <span className="text-xs">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </span>
        </Button>
        <Button
          onClick={handlePrint}
          icon={<PrinterOutlined />}
          size='small'
          className={isMobile ? "custom-button w-auto text-xs" : "custom-button w-auto text-xs"}
          disabled={!selectedRowKeys || selectedRowKeys.length === 0}
        >
          <span className="text-xs">Print</span>
        </Button>
        <Button
          onClick={handleExportOpen}
          icon={<DownloadOutlined />}
          size='small'
          className={isMobile ? "custom-button w-auto text-xs" : "custom-button w-auto text-xs"}
        >
          <span className="text-xs">Export</span>
        </Button>
      </div>
    </div>
    <div className="w-auto overflow-x-auto">
      <Table
        key={`table-${tableKey}`}
        rowSelection={rowSelection}
        rowKey="id"
        dataSource={filteredData}
        columns={tableColumns}
        pagination={false}
        bordered
        onChange={handleTableChange}
        scroll={{ x: "max-content", y: 600 }}
        loading={loading}
        responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
        expandable={mobileExpandableConfig}
        className="text-xs"
      />
    </div>
  </>
));

const InventoryTable = ({ inventoryData: propInventoryData, setInventoryData, loading }) => {
  const { message } = App.useApp();
  const { isOffline: isNetworkOffline } = useNetworkStatus();
  const [tableKey, setTableKey] = useState(0);
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const [mobileTab] = useState('default');
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const [isBatchAddModalVisible, setIsBatchAddModalVisible] = useState(false);
  const [isBatchEditModalVisible, setIsBatchEditModalVisible] = useState(false);
  const [batchEditLoading, setBatchEditLoading] = useState(false);
  const [isBatchItemPickerVisible, setIsBatchItemPickerVisible] = useState(false);
  const [batchEditSelectedItems, setBatchEditSelectedItems] = useState([]);
  const [isBatchDeleteModalVisible, setIsBatchDeleteModalVisible] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [isBatchPrintModalVisible, setIsBatchPrintModalVisible] = useState(false);
  const [batchPrintLoading, setBatchPrintLoading] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  const [localInventoryData, setLocalInventoryData] = useState(propInventoryData || []);

  const searchCache = useRef(new Map());
  const searchIndex = useRef(new Map());

  useEffect(() => {
    setLocalInventoryData(propInventoryData || []);
  }, [propInventoryData]);

  const effectiveSetInventoryData = setInventoryData || setLocalInventoryData;
  const effectiveInventoryData = setInventoryData ? propInventoryData : localInventoryData;

  const {
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
    isRefreshing,
    lastSyncTime,
    activeTab,
    isAdmin,
    userRole,
    totalEntries,
    handleRedistribute,
    handleRedistributeItem,
    handlePageChange,
    handleSortOrderChange,
    handleTableChange,
    handleAddItem,
    handleEdit,
    handleEditItem,
    handleTabChange,
    rowSelection,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRefresh,
  } = useInventoryTable(effectiveInventoryData, loading, setInventoryData, setLocalInventoryData);

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
      const { deleteItems } = await import('../../services/api/addItemToInventory');
      const response = await deleteItems(selectedRowKeys);
      if (response.message === "Items deleted successfully") {
        effectiveSetInventoryData(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
        setSelectedRowKeys([]);
        message.success("Items deleted successfully!");
        logUserActivity('Inventory', `Deleted item(s) with ID(s): ${selectedRowKeys.join(", ")}`);
        logUserNotification('Inventory Update', `You deleted item(s) with ID(s): ${selectedRowKeys.join(", ")}`);
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
  }, [isAdmin, selectedRowKeys, message, effectiveSetInventoryData, setSelectedRowKeys, logUserActivity, logUserNotification]);

  const dataSource = useMemo(() => effectiveInventoryData || [], [effectiveInventoryData]);
  
  useEffect(() => {
    if (!dataSource || dataSource.length === 0) {
      searchIndex.current.clear();
      return;
    }
    
    const buildIndex = () => {
      const index = new Map();
      
      const itemsToIndex = dataSource.slice(0, 2000);
      
      itemsToIndex.forEach((item, idx) => {
        if (!item) return;
        
        const searchableText = Object.values(item)
          .filter(val => val != null && val !== undefined)
          .map(val => String(val).toLowerCase())
          .join(' ');
        
        const words = searchableText.split(/\s+/).filter(word => word.length > 0).slice(0, 10);
        words.forEach(word => {
          if (!index.has(word)) {
            index.set(word, new Set());
          }
          index.get(word).add(idx);
        });
      });
      
      searchIndex.current = index;
    };
    
    setTimeout(buildIndex, 0);
  }, [dataSource]);

  const paginatedData = useMemo(() => {
    if (!dataSource || dataSource.length === 0) return [];
    
    let filtered = dataSource;
    if (searchText && !filterActive) {
      const limitedData = dataSource.slice(0, 1000);
      filtered = limitedData.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      const field = 'id';
      const order = sortOrder === 'Newest' ? 'descend' : 'ascend';
      if (order === 'ascend') {
        return a[field] > b[field] ? 1 : -1;
      } else if (order === 'descend') {
        return a[field] < b[field] ? 1 : -1;
      }
      return 0;
    });

    return sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [dataSource, searchText, sortOrder, currentPage, pageSize, filterActive]);

  useEffect(() => {
    if (!isBatchEditModalVisible) {
      setSelectedRowKeys([]);
    }
  }, [isBatchEditModalVisible, setSelectedRowKeys]);

  useEffect(() => {
    searchCache.current.clear();
    searchIndex.current.clear();
  }, [dataSource]);

  const handlePrint = useCallback(() => {
    const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.id));
    if (selectedItems.length > 0) {
      printUtilsHandlePrint(selectedItems);
      logUserActivity('Printed inventory items', `Printed ${selectedItems.length} item(s)`);
      logUserNotification('Print Action', `Printed ${selectedItems.length} inventory item(s)`);
      setSelectedRowKeys([]);
    } else {
      message.info('Please select items to print.');
    }
  }, [selectedRowKeys, dataSource, logUserActivity, logUserNotification, setSelectedRowKeys, message]);

  const filteredData = useMemo(() => {
    if (!filterActive) return paginatedData;
    return localFilteredData;
  }, [filterActive, localFilteredData, paginatedData]);

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      if (value === '') {
        setFilterActive(false);
        return;
      }
      setFilterActive(true);
      
      const cacheKey = `${value}-${searchColumn}`;
      if (searchCache.current.has(cacheKey)) {
        setLocalFilteredData(searchCache.current.get(cacheKey));
        return;
      }
      
      const searchLower = value.toLowerCase().trim();
      
      let filtered;
      
      if (searchColumn === 'all' && searchIndex.current.size > 0) {
        const wordIndices = searchIndex.current.get(searchLower);
        if (wordIndices) {
          filtered = Array.from(wordIndices).map(idx => dataSource[idx]);
        } else {
          filtered = dataSource.filter(item => {
            if (!item) return false;
            const itemText = Object.values(item)
              .filter(val => val != null && val !== undefined)
              .map(val => String(val).toLowerCase())
              .join(' ');
            return itemText.includes(searchLower);
          });
        }
      } else {
        filtered = dataSource.filter(item => {
          if (!item) return false;
          
          if (searchColumn === 'all') {
            const itemText = Object.values(item)
              .filter(val => val != null && val !== undefined)
              .map(val => String(val).toLowerCase())
              .join(' ');
            return itemText.includes(searchLower);
          } else {
            const cellValue = item[searchColumn];
            return cellValue && String(cellValue).toLowerCase().includes(searchLower);
          }
        });
      }
      
      const limitedResults = filtered.slice(0, 1000);
      
      searchCache.current.set(cacheKey, limitedResults);
      
      if (searchCache.current.size > 50) {
        const firstKey = searchCache.current.keys().next().value;
        searchCache.current.delete(firstKey);
      }
      
      setLocalFilteredData(limitedResults);
    }, 250),
    [dataSource, searchColumn]
  );

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value === '') {
      setFilterActive(false);
      setLocalFilteredData([]);
      searchCache.current.clear();
      return;
    }

    debouncedSearch(value);
  }, [debouncedSearch, setSearchText]);

  const searchableColumnsForTab = useMemo(() => {
    const baseColumns = [
      { key: 'all', label: 'All Columns' },
      { key: 'id', label: 'ID' },
      { key: 'type', label: 'Type' },
      { key: 'brand', label: 'Brand' },
      { key: 'serialNumber', label: 'Serial Number' },
      { key: 'remarks', label: 'Remarks' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
      { key: 'condition', label: 'Condition' },
      { key: 'issuedDate', label: 'Issued Date' },
      { key: 'purchaseDate', label: 'Purchased Date' },
    ];

    const currentTab = isMobile ? mobileTab : activeTab;

    return baseColumns.filter(col => {
      if (currentTab === 'issuedDate') return col.key !== 'purchaseDate';
      if (currentTab === 'purchaseDate') return col.key !== 'issuedDate';
      return true;
    });
  }, [activeTab, mobileTab, isMobile]);

  const getColumnMenu = useMemo(() => ({
    items: searchableColumnsForTab.map(column => ({
      key: column.key,
      label: (
        <span className="break-words whitespace-normal text-xs">
          {column.label}
        </span>
      ),
    })),
    onClick: ({ key }) => setSearchColumn(key),
    selectedKeys: [searchColumn]
  }), [searchableColumnsForTab, searchColumn]);

  const handleFullRefresh = useCallback(() => {
    setSearchColumn('all');
    setFilterActive(false);
    setLocalFilteredData([]);
    searchCache.current.clear();
    setTableKey(prev => prev + 1);
    handleSortOrderChange('Newest');
    handleRefresh(true);
  }, [handleSortOrderChange, handleRefresh]);

  const handleBatchEdit = useCallback(async (items) => {
    setBatchEditLoading(true);
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot perform batch edit while offline');
        return;
      }
      await batchEditItems(items);
      setIsBatchEditModalVisible(false);
      setBatchEditSelectedItems([]);
      handleFullRefresh();
    } catch (e) {
      if (isProduction && (e.isOffline || e.message?.includes('Offline'))) {
        message.warning('Cannot perform batch edit while offline');
      } else {
        message.error('Batch edit failed');
      }
    } finally {
      setBatchEditLoading(false);
    }
  }, [handleFullRefresh, message]);

  const handleBatchAdd = useCallback(async (items) => {
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot perform batch add while offline');
        return;
      }
      const response = await batchAddItems(items);
      if (response && response.results) {
        const successCount = response.results.filter(r => r.success).length;
        if (successCount > 0) {
          message.success('Batch add completed successfully!');
        } else {
          message.error('Batch add failed.');
        }
      } else {
        message.error('Batch add failed.');
      }
      setIsBatchAddModalVisible(false);
      handleFullRefresh();
    } catch (e) {
      if (isProduction && (e.isOffline || e.message?.includes('Offline'))) {
        message.warning('Cannot perform batch add while offline');
      } else {
        message.error('Batch add failed.');
      }
    }
  }, [handleFullRefresh, message]);

  const handleBatchDelete = useCallback(async (items) => {
    setBatchDeleteLoading(true);
    try {
      if (isProduction && (await isOffline())) {
        message.warning('Cannot perform batch delete while offline');
        return;
      }
      const ids = items.map(item => item.id);
      const response = await batchDeleteItems(ids);
      if (response && response.results) {
        const successCount = response.results.filter(r => r.success).length;
        if (successCount > 0) {
          message.success(`${successCount} item(s) deleted successfully!`);
        } else {
          message.error('Batch delete failed.');
        }
      } else {
        message.error('Batch delete failed.');
      }
      setIsBatchDeleteModalVisible(false);
      handleFullRefresh();
    } catch (e) {
      if (isProduction && (e.isOffline || e.message?.includes('Offline'))) {
        message.warning('Cannot perform batch delete while offline');
      } else {
        message.error('Batch delete failed.');
      }
    } finally {
      setBatchDeleteLoading(false);
    }
  }, [handleFullRefresh, message]);

  const handleBatchPrint = useCallback(async (items) => {
    setBatchPrintLoading(true);
    try {
      printUtilsHandlePrint(items);
      logUserActivity('Batch Print', `Batch printed ${items.length} inventory item(s)`);
      logUserNotification('Batch Print', `Batch printed ${items.length} inventory item(s)`);
      setIsBatchPrintModalVisible(false);
      setSelectedRowKeys([]);
    } catch (e) {
      message.error('Batch print failed.');
    } finally {
      setBatchPrintLoading(false);
    }
  }, [logUserActivity, logUserNotification, setSelectedRowKeys, message]);

  const handleBatchMenuClick = useCallback(({ key }) => {
    if (key === 'batchAdd') {
      setIsBatchAddModalVisible(true);
    } else if (key === 'batchEdit') {
      setIsBatchItemPickerVisible(true);
    } else if (key === 'batchDelete') {
      setIsBatchDeleteModalVisible(true);
    } else if (key === 'batchPrint') {
      setIsBatchPrintModalVisible(true);
    }
  }, []);

const batchMenuItems = useMemo(() => {
  const items = [
    { key: 'batchAdd', label: 'Batch Add' },
    { key: 'batchEdit', label: <span style={{color: 'blue'}}>Batch Edit</span> },
    ...(isAdmin ? [
      { key: 'batchDelete', label: <span style={{ color: 'red' }}>Batch Delete</span>, danger: true }
    ] : []),
    { key: 'batchPrint', label: <span style={{ color: 'green' }}>Batch Print</span> },
  ];
  return items;
}, [isAdmin]);

  const handleExportOpen = useCallback(() => {
    setIsExportModalVisible(true);
    logUserActivity('Export', 'Opened export modal for Inventory');
    logUserNotification('Export Action', 'Opened export modal for Inventory');
  }, [logUserActivity, logUserNotification]);

  const commonButtonProps = useMemo(() => ({
    size: 'small',
    className: isMobile ? "text-xs p-1 h-7" : "text-xs"
  }), [isMobile]);

  const mobileExpandableConfig = useMemo(() => isMobile ? {
    expandedRowRender: (record) => (
      <div className="text-xs space-y-1">
        <div><b>ID:</b> {record.id}</div>
        <div><b>Type:</b> {record.type}</div>
        <div><b>Brand:</b> {record.brand}</div>
        <div><b>Quantity:</b> {record.quantity}</div>
        <div><b>Remarks:</b> {record.remarks}</div>
        <div><b>Serial Number:</b> {record.serialNumber}</div>
        <div><b>Issued Date:</b> {record.issuedDate || 'NO DATE'}</div>
        <div><b>Purchased Date:</b> {record.purchaseDate || 'NO DATE'}</div>
        <div><b>Condition:</b> {record.condition}</div>
        <div><b>Detachment/Office:</b> {record.location}</div>
        <div><b>Status:</b> {record.status}</div>
      </div>
    ),
    rowExpandable: () => true,
  } : undefined, [isMobile]);

  const tableColumns = useMemo(() => 
    columns(handleEdit, handleRedistribute, sortOrder, userRole, activeTab),
    [handleEdit, handleRedistribute, sortOrder, userRole, activeTab]
  );

  const memoizedTableData = useMemo(() => {
    return {
      filteredData,
      tableColumns,
      loading,
      rowSelection,
      selectedRowKeys,
      handleTableChange,
      mobileExpandableConfig
    };
  }, [filteredData, tableColumns, loading, rowSelection, selectedRowKeys, handleTableChange, mobileExpandableConfig]);

  const searchInputProps = useMemo(() => ({
    placeholder: `Search in ${searchColumn === 'all' ? 'all columns' : searchableColumnsForTab.find(col => col.key === searchColumn)?.label}`,
    value: searchText,
    onChange: handleSearch,
    className: isMobile ? "w-auto border-black text-xs h-7" : "ml-1 w-auto sm:w-auto border-black text-xs h-6",
    size: "small",
    allowClear: true,
    maxLength: 100,
    showCount: false,
    autoComplete: "off",
    spellCheck: false,
    autoCorrect: "off",
    autoCapitalize: "off",
    onCompositionStart: () => {},
    onCompositionEnd: () => {}
  }), [searchColumn, searchableColumnsForTab, searchText, handleSearch, isMobile]);

  return (
    <Card
      title={
        <span className="font-bold flex justify-center text-lgi md:text-base lg:text-lgi xl:text-xl">
          INVENTORY
        </span>
      }
      className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none"
    >
      {isProduction && isNetworkOffline && (
        <Alert
          message="You are currently offline"
          description="Some features may be limited. Please check your internet connection."
          type="warning"
          showIcon
          icon={<WifiOutlined />}
          style={{ marginBottom: '16px' }}
        />
      )}
      
      <div className="overflow-auto">
        <Tabs
          className='custom-tabs'
          defaultActiveKey="default"
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          tabBarGutter={1}
          items={[
            {
              key: "default",
              label: <span className="text-xs">Default</span>,
            },
            {
              key: "issuedDate",
              label: <span className="text-xs">Issued Date</span>,
            },
            {
              key: "purchaseDate",
              label: <span className="text-xs">Purchased Date</span>,
            },
          ]}
        />
        <SearchContext.Provider value={searchText}>
          <TableContent
            isMobile={isMobile}
            searchColumn={searchColumn}
            searchText={searchText}
            setSearchText={setSearchText}
            handleSearch={handleSearch}
            setFilterActive={setFilterActive}
            isAdmin={isAdmin}
            userRole={userRole}
            setIsModalVisible={setIsModalVisible}
            batchMenuItems={batchMenuItems}
            handleBatchMenuClick={handleBatchMenuClick}
            commonButtonProps={commonButtonProps}
            selectedRowKeys={memoizedTableData.selectedRowKeys}
            handleBatchDelete={handleBatchDelete}
            handleDeleteItems={handleDeleteItems}
            sortOrder={sortOrder}
            handleSortOrderChange={handleSortOrderChange}
            handleFullRefresh={handleFullRefresh}
            handlePrint={handlePrint}
            handleExportOpen={handleExportOpen}
            searchableColumnsForTab={searchableColumnsForTab}
            getColumnMenu={getColumnMenu}
            tableKey={tableKey}
            rowSelection={memoizedTableData.rowSelection}
            filteredData={memoizedTableData.filteredData}
            tableColumns={memoizedTableData.tableColumns}
            handleTableChange={memoizedTableData.handleTableChange}
            loading={memoizedTableData.loading}
            isRefreshing={isRefreshing}
            mobileExpandableConfig={memoizedTableData.mobileExpandableConfig}
            searchInputProps={searchInputProps}
          />
        </SearchContext.Provider>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <div className="w-full flex flex-col items-center sm:items-start">
          <Typography.Text className="w-full text-xs text-nowrap text-center sm:text-left overflow-auto"
            style={{ color: '#072C1C' }}>
            Showing data of {totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
          </Typography.Text>
          {lastSyncTime && (
            <div className="text-xs text-gray-500 mt-1 text-center sm:text-left">
              Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="w-full flex justify-center sm:justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalEntries}
            showSizeChanger
            pageSizeOptions={['10', '20', '30', '50', '100', '200', '500', '1000', '2000']}
            onChange={handlePageChange}
            className="text-xs"
            responsive
          />
        </div>
      </div>

      <AddItemModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)} 
        onAdd={handleAddItem}
        onRedistribute={handleRedistributeItem}
        handleEditItem={handleEditItem}
        loading={loading} 
      />
      <EditItemModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onEdit={handleEditItem}
        item={editingItem}
        loading={loading}
      />
      <RedistributeItemModal
        visible={isRedistributeModalVisible}
        onClose={() => {
          setIsRedistributeModalVisible(false);
          setRedistributeItemData(null);
        }}
        onEdit={handleRedistributeItem}
        item={redistributeItemData}
        loading={loading}
      />
      <BatchAddItemModal
        visible={isBatchAddModalVisible}
        onClose={() => setIsBatchAddModalVisible(false)}
        onBatchAdd={handleBatchAdd}
        loading={loading}
      />
      <BatchItemPickerModal
        visible={isBatchItemPickerVisible}
        onClose={() => setIsBatchItemPickerVisible(false)}
        onConfirm={(items) => {
          setBatchEditSelectedItems(items);
          setIsBatchItemPickerVisible(false);
          setIsBatchEditModalVisible(true);
        }}
        loading={batchEditLoading}
      />
      <BatchEditItemModal
        visible={isBatchEditModalVisible}
        onClose={() => {
          setIsBatchEditModalVisible(false);
          setBatchEditSelectedItems([]);
        }}
        onBatchEdit={handleBatchEdit}
        loading={batchEditLoading}
        selectedItems={batchEditSelectedItems}
      />
      {isAdmin && (
      <BatchDeleteItemModal
        visible={isBatchDeleteModalVisible}
        onClose={() => setIsBatchDeleteModalVisible(false)}
        onConfirm={handleBatchDelete}
        loading={batchDeleteLoading}
      />
      )}
      <BatchPrintItemModal
        visible={isBatchPrintModalVisible}
        onClose={() => setIsBatchPrintModalVisible(false)}
        onConfirm={handleBatchPrint}
        loading={batchPrintLoading}
      />
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
        data={dataSource}
        filteredData={filterActive ? localFilteredData : null}
        selectedData={selectedRowKeys.length > 0 ? dataSource.filter(item => selectedRowKeys.includes(item.id)) : null}
        dataType="inventory"
        title="Export Inventory Data"
        columns={tableColumns.map(col => ({ key: col.dataIndex || col.key, label: col.title }))}
      />
    </Card>
  );
};

export default InventoryTable;