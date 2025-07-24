import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Input, Select, Table, Pagination, Typography, Card, Button, Dropdown, Space } from 'antd';
import { SearchOutlined, DownOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import QrCodeModal from './QrCodeModal';
import { getColumns } from './QrCodeTableColumns';
import debounce from 'lodash/debounce';
import { useMediaQuery } from 'react-responsive';
import { 
  updateTableCache, 
  markTableCacheStale, 
  isTableCacheValid, 
  getTableCacheData, 
  SYNC_INTERVAL 
} from '../../utils/cacheUtils';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { isOffline } from '../../utils/offlineUtils';
import { useTheme } from '../../utils/ThemeContext';

const { Option } = Select;

const QrCodeTableSkeleton = () => {
  const { theme, currentTheme } = useTheme();
  const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
  const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#A8E1C5' : '#A8E1C5';

  return (
    <div className="w-full h-full mx-auto rounded-xl shadow border-none p-8 table-skeleton" style={{ backgroundColor: bgColor }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-8 rounded w-20 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        ))}
      </div>
      <div className="w-auto overflow-x-auto">
        <div className="table-skeleton">
          <div className="table-skeleton-row rounded mb-2 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="table-skeleton-row rounded mb-2 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-4 rounded w-32 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
        <div className="h-8 rounded w-48 animate-pulse" style={{ backgroundColor: skeletonColor }}></div>
      </div>
    </div>
  );
};

const QrCodeTable = ({ inventoryData = [], loading = false, error = null, onRefresh, onItemSelect, lastSyncTime }) => {
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const syncIntervalRef = useRef(null);
  
  const TABLE_NAME = 'qrcode';

  useEffect(() => {
    if (inventoryData.length > 0 && !qrDetails) {
      onItemSelect(inventoryData[0]);
      setQrDetails(inventoryData[0]);
    }
  }, [inventoryData, qrDetails, onItemSelect]);

  const searchableColumns = useMemo(() => [
    { key: 'all', label: 'All Columns' },
    { key: 'id', label: 'ID' },
    { key: 'type', label: 'Type' },
    { key: 'brand', label: 'Brand' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'serialNumber', label: 'Serial Number' },
    { key: 'issuedDate', label: 'Issued Date' },
    { key: 'purchaseDate', label: 'Purchase Date' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'condition', label: 'Condition' },
  ], []);

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      if (value === '') {
        setFilterActive(false);
        return;
      }
      setFilterActive(true);
      const filtered = inventoryData.filter(item => {
        if (!item) return false;
        if (searchColumn === 'all') {
          for (const key in item) {
            const cellValue = item[key];
            if (cellValue && String(cellValue).toLowerCase().includes(value.toLowerCase())) {
              return true;
            }
          }
          return false;
        } else {
          const cellValue = item[searchColumn];
          return cellValue && String(cellValue).toLowerCase().includes(value.toLowerCase());
        }
      });
      setLocalFilteredData(filtered);
    }, 300),
    [inventoryData, searchColumn]
  );

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleColumnChange = useCallback((column) => {
    setSearchColumn(column);
  }, []);

  const handleRefresh = useCallback(async (forceRefresh = false) => {
    try {
      if (await isOffline()) {
        console.warn('Cannot refresh QR code data while offline');
        return;
      }

      setIsRefreshing(true);
      
      if (isTableCacheValid(TABLE_NAME, forceRefresh)) {
        const cachedData = getTableCacheData(TABLE_NAME);
        if (onRefresh) {
          onRefresh(cachedData);
        }
        return;
      }

      const freshData = await getInventoryData();
      
      updateTableCache(TABLE_NAME, freshData);
      
      if (onRefresh) {
        onRefresh(freshData);
      }
      
    } catch (error) {
      console.error('Failed to load QR code data:', error);
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
        
        const freshData = await getInventoryData();
        updateTableCache(TABLE_NAME, freshData);
        
        if (onRefresh) {
          onRefresh(freshData);
        }
        
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

  const handleSortOrderChange = useCallback((value) => {
    setSortOrder(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  }, []);

  const handleTableChange = useCallback((pagination, filters, sorterObj) => {
    setFilteredInfo(filters);
    setCurrentPage(1);
  }, []);

  const handleQrCodeClick = useCallback((item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  }, []);

  const handleRowClick = useCallback((item) => {
    onItemSelect(item);
    setQrDetails(item);
  }, [onItemSelect]);

  const filteredData = useMemo(() => {
    let result = filterActive ? localFilteredData : inventoryData;
    if (filteredInfo.condition && filteredInfo.condition.length > 0) {
      result = result.filter(item => filteredInfo.condition.includes(item.condition));
    }
    if (filteredInfo.status && filteredInfo.status.length > 0) {
      result = result.filter(item => filteredInfo.status.includes(item.status));
    }
    return result;
  }, [filterActive, localFilteredData, inventoryData, filteredInfo]);

  const sortedBySelect = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => Number(a.id) - Number(b.id));
    return sortOrder === 'Newest' ? sorted.reverse() : sorted;
  }, [filteredData, sortOrder]);

  const menuItems = useMemo(() => 
    searchableColumns.map(column => ({
      key: column.key,
      label: column.label,
    })), [searchableColumns]);

  const paginatedData = useMemo(() => 
    sortedBySelect.slice((currentPage - 1) * pageSize, currentPage * pageSize), 
    [sortedBySelect, currentPage, pageSize]
  );

  const tableColumns = useMemo(() => 
    getColumns(handleQrCodeClick, searchText, undefined, filteredInfo), 
    [handleQrCodeClick, searchText, filteredInfo]
  );

  const expandableConfig = useMemo(() => 
    isMobile ? {
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
          <div><b>Location:</b> {record.location}</div>
          <div><b>Status:</b> {record.status}</div>
        </div>
      ),
      rowExpandable: () => true,
    } : undefined, 
    [isMobile]
  );

  if (loading) {
    return <QrCodeTableSkeleton />;
  }

  return (
    <Card title={<span className="text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center">ITEMS</span>}
    className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
          <Dropdown 
            className='theme-aware-dropdown-btn border border-black sm:block hidden'
            menu={{ 
              items: menuItems,
              onClick: ({key}) => handleColumnChange(key),
              selectedKeys: [searchColumn]
            }} trigger={['click']}>
            <Button 
              type="text"
              size='small'
              className='text-xs' 
              icon={<FilterOutlined/>}
            >
              <Space className="text-xs w-auto align-middle">
                {searchableColumns.find(col => col.key === searchColumn)?.label || 'All Columns'}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <Input
            placeholder={`Search in ${searchColumn === 'all' ? 'all columns' : searchableColumns.find(col => col.key === searchColumn)?.label}`}
            prefix={<SearchOutlined />}
            className="border border-black w-auto ml-1 text-xs h-6"
            value={searchText}
            allowClear
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-auto justify-center ">
          <Select
            value={sortOrder}
            className="w-auto text-xs transparent-select"
            size="small"
            onChange={handleSortOrderChange}
          >
            <Option value="Newest"><span className="text-xs">Newest</span></Option>
            <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
          </Select>
          <Button 
            onClick={() => handleRefresh(true)}
            className="custom-button text-xs"
            type="default"
            size="small"
            icon={<ReloadOutlined />}
            loading={isRefreshing}
          >
            <span className="text-xs">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        columns={tableColumns}
        dataSource={paginatedData}
        pagination={false}
        bordered
        sortDirections={['descend', 'ascend']}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        scroll={{ x: 'max-content', y: 600 }}
        responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
        expandable={expandableConfig}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <div className="w-full flex flex-col items-center sm:items-start">
          <Typography.Text style={{ color: '#072C1C' }} className="w-full text-xs text-wrap text-center sm:text-left">
            Showing data of {sortedBySelect.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, sortedBySelect.length)} of {sortedBySelect.length} entries
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
            total={sortedBySelect.length}
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
    </Card>
  );
};

export default QrCodeTable;
