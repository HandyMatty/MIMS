import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Table, Typography, Pagination, message, Select, Button } from 'antd';
import QrCodeModal from '../../components/QrCode/QrCodeModal';
import { getDashboardTableColumns } from './DashboardTableColumns';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../../utils/ThemeContext';
import { ReloadOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { handlePrint as printUtilsHandlePrint } from '../../utils/printUtils';
import BatchPrintItemModal from '../Inventory/BatchPrintItemModal';
import ExportModal from '../common/ExportModal';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { 
  updateTableCache, 
  markTableCacheStale, 
  isTableCacheValid, 
  getTableCacheData, 
  SYNC_INTERVAL 
} from '../../utils/cacheUtils';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { isOffline } from '../../utils/offlineUtils';

const { Option } = Select;

const DashboardTable = ({ searchText, inventoryData, loading, onRefresh, setParentLoading, lastSyncTime }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const [sortOrder, setSortOrder] = useState('Newest');
  const [sorterConfig, setSorterConfig] = useState({ field: 'id', order: 'descend' });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const { theme, currentTheme } = useTheme();
  const [isBatchPrintModalVisible, setIsBatchPrintModalVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const syncIntervalRef = useRef(null);
  
  const TABLE_NAME = 'dashboard';

  const { filteredData, sortedData, totalEntries } = useMemo(() => {
    const filtered = Array.isArray(inventoryData)
      ? inventoryData.filter(item =>
          Object.values(item)
            .join(' ')
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
      : [];

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

    return {
      filteredData: filtered,
      sortedData: sorted,
      totalEntries: sorted.length
    };
  }, [inventoryData, searchText, sorterConfig]);

  const paginatedData = useMemo(() => {
    return sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleRefresh = useCallback(async (forceRefresh = false) => {
    try {
      if (await isOffline()) {
        message.warning('Cannot refresh data while offline');
        return;
      }

      setIsRefreshing(true);
      if (setParentLoading) setParentLoading(true);
      
      if (isTableCacheValid(TABLE_NAME, forceRefresh)) {
        const cachedData = getTableCacheData(TABLE_NAME);
        if (onRefresh) {
          onRefresh(cachedData);
        }
        if (setParentLoading) setParentLoading(false);
        setIsRefreshing(false);
        return;
      }

      const freshData = await getInventoryData();
      
      updateTableCache(TABLE_NAME, freshData);
      
      if (onRefresh) {
        onRefresh(freshData);
      }
      
    } catch (error) {
      message.error('Failed to load dashboard data.');
    } finally {
      setIsRefreshing(false);
      if (setParentLoading) setParentLoading(false);
    }
  }, [onRefresh, setParentLoading]);

  const startBackgroundSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      try {
        if (await isOffline()) {
          return;
        }
        if (setParentLoading) setParentLoading(true);
        const freshData = await getInventoryData();
        updateTableCache(TABLE_NAME, freshData);
        
        if (onRefresh) {
          onRefresh(freshData);
        }
        if (setParentLoading) setParentLoading(false);
      } catch (error) {
        console.warn('Background sync failed:', error);
        markTableCacheStale(TABLE_NAME);
        if (setParentLoading) setParentLoading(false);
      }
    }, SYNC_INTERVAL);
  }, [onRefresh, setParentLoading]);

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

  const handlePrint = useCallback(() => {
    const selectedItems = inventoryData.filter(item => selectedRowKeys.includes(item.id));
    if (selectedItems.length > 0) {
      printUtilsHandlePrint(selectedItems);
      logUserActivity('Printed items from Dashboard', `Printed ${selectedItems.length} item(s)`);
      logUserNotification('Print Action', `Printed ${selectedItems.length} item(s) from Dashboard`);
      setSelectedRowKeys([]);
    } else {
      message.warning('Please select items to print.');
    }
  }, [selectedRowKeys, inventoryData, logUserActivity, logUserNotification]);

  const handleBatchPrint = useCallback(() => {
    setIsBatchPrintModalVisible(true);
  }, []);

  const handleBatchPrintConfirm = useCallback((items) => {
    printUtilsHandlePrint(items);
    logUserActivity('Batch Print', `Batch printed ${items.length} item(s)`);
    logUserNotification('Batch Print', `Batch printed ${items.length} item(s) from Dashboard`);
    setIsBatchPrintModalVisible(false);
    setSelectedRowKeys([]);
  }, [logUserActivity, logUserNotification]);

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

  const handleQrCodeClick = useCallback((item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  }, []);

  const handleTableChange = useCallback((pagination, filters, sorter) => {
    let sortField = 'id';
    let sortOrder = 'descend';
    if (Array.isArray(sorter)) {
      if (sorter.length > 0 && sorter[0].field) {
        sortField = sorter[0].field;
        sortOrder = sorter[0].order;
      }
    } else if (sorter && sorter.field) {
      sortField = sorter.field;
      sortOrder = sorter.order;
    }
    setSorterConfig({ field: sortField, order: sortOrder });
  }, []);

  const handleExportOpen = useCallback(() => {
    setIsExportModalVisible(true);
    logUserActivity('Export', 'Opened export modal for Dashboard');
    logUserNotification('Export Action', 'Opened export modal for Dashboard');
  }, [logUserActivity, logUserNotification]);

  const dashboardColumns = useMemo(() => 
    getDashboardTableColumns(handleQrCodeClick, searchText), 
    [handleQrCodeClick, searchText]
  );

  const containerStyle = useMemo(() => 
    currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}, 
    [currentTheme, theme]
  );

  const textStyle = useMemo(() => 
    currentTheme !== 'default' ? { color: theme.text } : { color: '#072C1C' }, 
    [currentTheme, theme.text]
  );

  return (
    <div className="w-full h-full mx-auto bg-[#a7f3d0] rounded-xl shadow border-none p-8"
      style={containerStyle}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
        <Select
          value={sortOrder}
          defaultValue="Newest"
          className="w-full sm:w-auto transparent-select"
          onChange={handleSortOrderChange}
          size='small'
        >
          <Option value="Newest">
            <span className="text-xs text-black">Newest</span>
          </Option>
          <Option value="Oldest">
            <span className="text-xs text-black">Oldest</span>
          </Option>
        </Select>
        <Button
          onClick={() => handleRefresh(true)}
          icon={<ReloadOutlined />}
          size='small'
          className="custom-button text-xs"
          loading={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        <Button
          onClick={handlePrint}
          icon={<PrinterOutlined />}
          size='small'
          className="custom-button text-xs"
          disabled={selectedRowKeys.length === 0}
        >
          Print
        </Button>
        <Button
          onClick={handleBatchPrint}
          icon={<PrinterOutlined />}
          size='small'
          className="custom-button text-xs"
        >
          Batch Print
        </Button>
        <Button
          onClick={handleExportOpen}
          icon={<DownloadOutlined />}
          size='small'
          className="custom-button text-xs"
        >
          Export
        </Button>
      </div>

      <div className="w-auto overflow-x-auto">
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            preserveSelectedRowKeys: true,
          }}
          columns={dashboardColumns}
          dataSource={paginatedData}
          pagination={false}
          expandable={
              isMobile
                ? {
                    expandedRowRender: (record) => (
                      <div className="text-xs space-y-1">
                        <div><b>ID:</b> {record.id}</div>
                        <div><b>Type:</b> {record.type}</div>
                        <div><b>Brand:</b> {record.brand}</div>
                        <div><b>Quantity:</b> {record.quantity}</div>
                        <div><b>Remarks:</b> {record.remarks}</div>
                        <div><b>Serial Number:</b> {record.serialNumber}</div>
                        <div><b>Issued Date:</b> {record.issuedDate}</div>
                        <div><b>Purchased Date:</b> {record.purchaseDate}</div>
                        <div><b>Condition:</b> {record.condition}</div>
                        <div><b>Detachment/Office:</b> {record.location}</div>
                        <div><b>Status:</b> {record.status}</div>
                      </div>
                    ),
                    rowExpandable: () => true,
                  }
                : undefined
            }
          bordered
          rowKey="id"
          onChange={handleTableChange}
          sorter={sorterConfig}
          scroll={{ x: 'max-content', y: 500 }}
          loading={loading}
          responsive={{
            xs: true,
            sm: true,
            md: true,
            lg: true,
            xl: true,
            xxl: true,
          }}
        />
      </div>

    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <div className="w-full flex flex-col items-center sm:items-start">
          <Typography.Text style={textStyle} className="w-full text-xs text-wrap text-center sm:text-left">
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

      <QrCodeModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        qrDetails={qrDetails}
      />
      <BatchPrintItemModal
        visible={isBatchPrintModalVisible}
        onClose={() => setIsBatchPrintModalVisible(false)}
        onConfirm={handleBatchPrintConfirm}
        loading={loading}
      />
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
        data={inventoryData}
        filteredData={searchText ? filteredData : null}
        selectedData={selectedRowKeys.length > 0 ? inventoryData.filter(item => selectedRowKeys.includes(item.id)) : null}
        dataType="inventory"
        title="Export Dashboard Data"
        columns={dashboardColumns.filter(col => col.key !== 'qrCode').map(col => ({ key: col.dataIndex || col.key, label: col.title }))}
      />
    </div>
  );
};

export default DashboardTable;
