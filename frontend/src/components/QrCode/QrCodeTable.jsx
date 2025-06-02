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
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 639 });

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const fetchedData = await getInventoryData();
        if (Array.isArray(fetchedData)) {
          const sortedFetchedData = [...fetchedData].sort((a, b) => b.id - a.id);
          setData(sortedFetchedData);

          if (sortedFetchedData.length > 0 && !qrDetails) {
            onItemSelect(sortedFetchedData[0]);
            setQrDetails(sortedFetchedData[0]);
          }
        } else {
          console.error('Received invalid data:', fetchedData);
        }
      } catch (error) {
        console.error('Failed to load inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [onItemSelect, qrDetails]);

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

  // Memoize filtered data
  const filteredData = useMemo(() => {
    if (!filterActive) return data;
    return localFilteredData;
  }, [filterActive, localFilteredData, data]);

  // Memoize sorted data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.id - a.id;
      } else if (sortOrder === 'oldest') {
        return a.id - b.id;
      }
      return 0;
    });
  }, [filteredData, sortOrder]);

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

  const resetAll = useCallback(() => {
    setSearchText('');
    setSortOrder('newest');
    setCurrentPage(1);
    setSearchColumn('all');
    setFilterActive(false);
  }, []);

  const handleSortOrderChange = useCallback((value) => {
    setSortOrder(value.toLowerCase());
    setCurrentPage(1);
  }, []);
  
  const handlePageChange = useCallback((page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  }, []);

  const handleQrCodeClick = useCallback((item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  }, []);

  const handleRowClick = useCallback((item) => {
    onItemSelect(item);
    setQrDetails(item);
  }, [onItemSelect]);

  const totalEntries = filteredData.length;

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
            className='bg-[#a7f3d0] border border-black sm:block hidden'
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
                <DownOutlined size='small' />
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
            defaultValue="Newest"
            suffixIcon={<DownOutlined />}
            className="w-auto text-xs transparent-select mt-1"
            size="small"
            onChange={handleSortOrderChange}
          >
            <Option value="newest"><span className="text-xs">Newest</span></Option>
            <Option value="oldest"><span className="text-xs">Oldest</span></Option>
          </Select>
        <Button 
          onClick={resetAll}
          className="custom-button mt-1"
          type="default"
          size="small"
          icon={<ReloadOutlined />}
        >
          <span className="text-xs">Reset</span>
        </Button>
        </div>
      </div>

      <div className="w-auto overflow-x-auto">
        <Table
          rowKey="id"
          columns={getColumns(handleQrCodeClick, searchText)}
          dataSource={sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          pagination={false}
          bordered
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
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <Typography.Text style={{ color: '#072C1C' }} className="w-full text-xs text-wrap text-center sm:text-left">
          Showing data of {totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
        </Typography.Text>
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
    </Card>
  );
};

export default QrCodeTable;
