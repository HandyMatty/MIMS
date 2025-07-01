import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input, Select, Table, Pagination, Typography, Card, Button, Dropdown, Space } from 'antd';
import { SearchOutlined, DownOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from './QrCodeModal';
import { getColumns } from './QrCodeTableColumns';
import debounce from 'lodash/debounce';
import { useMediaQuery } from 'react-responsive';

const { Option } = Select;

const QrCodeTable = ({ onItemSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const isMobile = useMediaQuery({ maxWidth: 639 });

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedData = await getInventoryData();
      if (Array.isArray(fetchedData)) {
        setData(fetchedData);
        if (fetchedData.length > 0 && !qrDetails) {
          onItemSelect(fetchedData[0]);
          setQrDetails(fetchedData[0]);
        }
      } else {
        console.error('Received invalid data:', fetchedData);
      }
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    } finally {
      setLoading(false);
    }
  }, [onItemSelect, qrDetails]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

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

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value === '') {
        setFilterActive(false);
        return;
      }
      setFilterActive(true);
      const filtered = data.filter(item => {
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
    [data, searchColumn]
  );

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleColumnChange = useCallback((column) => {
    setSearchColumn(column);
  }, []);

  const handleRefresh = () => {
    setSearchText('');
    setSortOrder('Newest');
    setCurrentPage(1);
    setPageSize(10);
    setSearchColumn('all');
    setFilterActive(false);
    setLocalFilteredData([]);
    setFilteredInfo({});
    fetchInventoryData();
  };

  const handleSortOrderChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleTableChange = (pagination, filters, sorterObj) => {
    setFilteredInfo(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleQrCodeClick = useCallback((item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  }, []);

  const handleRowClick = useCallback((item) => {
    onItemSelect(item);
    setQrDetails(item);
  }, [onItemSelect]);

  // Filtering logic for Condition and Status
  const filteredData = useMemo(() => {
    let result = filterActive ? localFilteredData : data;
    if (filteredInfo.condition && filteredInfo.condition.length > 0) {
      result = result.filter(item => filteredInfo.condition.includes(item.condition));
    }
    if (filteredInfo.status && filteredInfo.status.length > 0) {
      result = result.filter(item => filteredInfo.status.includes(item.status));
    }
    return result;
  }, [filterActive, localFilteredData, data, filteredInfo]);

  // Apply Newest/Oldest select sort in-memory before paginating
  const sortedBySelect = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => Number(a.id) - Number(b.id));
    return sortOrder === 'Newest' ? sorted.reverse() : sorted;
  }, [filteredData, sortOrder]);

  // Memoize menu items
  const menuItems = useMemo(() => 
    searchableColumns.map(column => ({
      key: column.key,
      label: column.label,
    })), [searchableColumns]);

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
              icon={<FilterOutlined className='text-xs' />}
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
            className="border border-black w-auto ml-1 text-xs"
            value={searchText}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2 w-auto justify-center">
          <Select
            value={sortOrder}
            className="w-auto text-xs transparent-select mt-1"
            size="small"
            onChange={handleSortOrderChange}
          >
            <Option value="Newest"><span className="text-xs">Newest</span></Option>
            <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
          </Select>
          <Button 
            onClick={handleRefresh}
            className="custom-button mt-1 text-xs"
            type="default"
            size="small"
            icon={<ReloadOutlined />}
          >
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        columns={getColumns(handleQrCodeClick, searchText, undefined, filteredInfo)}
        dataSource={sortedBySelect.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        pagination={false}
        bordered
        sortDirections={['descend', 'ascend']}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        scroll={{ x: 'max-content', y: 600 }}
        loading={loading}
        responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
        expandable={ isMobile ? {
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
        } : undefined}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <Typography.Text style={{ color: '#072C1C' }} className="w-full text-xs text-wrap text-center sm:text-left">
          Showing data of {sortedBySelect.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedBySelect.length)} of {sortedBySelect.length} entries
        </Typography.Text>
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
