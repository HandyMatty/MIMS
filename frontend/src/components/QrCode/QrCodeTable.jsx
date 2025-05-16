import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input, Select, Table, Pagination, Typography, Card, Button, Dropdown, Space } from 'antd';
import { SearchOutlined, DownOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from './QrCodeModal';
import { getColumns } from './QrCodeTableColumns';
import debounce from 'lodash/debounce';

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
    <Card title={<span className="text-5xl-6 font-bold flex justify-center">ITEMS</span>}
    className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex bg-[#a7f3d0] border border-black rounded">
          <Dropdown menu={{ 
            items: menuItems,
            onClick: ({key}) => handleColumnChange(key),
            selectedKeys: [searchColumn]
          }} trigger={['click']}>
            <Button 
              type="text" 
              className="border-black"
              icon={<FilterOutlined />}
            >
              <Space>
                {searchableColumns.find(col => col.key === searchColumn)?.label || 'All Columns'}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <Input
            placeholder={`Search in ${searchColumn === 'all' ? 'all columns' : searchableColumns.find(col => col.key === searchColumn)?.label}`}
            prefix={<SearchOutlined />}
            className="w-[268px] h-[33.63px] bg-transparent border-r-black border-b-black border-t-black custom-input-table"
            value={searchText}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center text-[#072C1C] text-sm font-medium">
          Sort by:
          <Select
            defaultValue="Newest"
            suffixIcon={<DownOutlined />}
            className="ml-2 w-[132.94px] transparent-select"
            onChange={handleSortOrderChange}
          >
            <Option value="newest">Newest</Option>
            <Option value="oldest">Oldest</Option>
          </Select>
        </div>
        <Button 
          onClick={resetAll}
          className="custom-button"
          type="default"
          size="small"
          icon={<ReloadOutlined />}
        >
          Reset
        </Button>
      </div>

      <div style={{ height: '700px' }}>
        <Table
          rowKey="id"
          columns={getColumns(handleQrCodeClick, searchText)}
          dataSource={sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          pagination={false}
          bordered
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          scroll={{ x: 1500, y: 600 }} 
          loading={loading}
        />
      </div>
      <div className="flex items-center justify-between mt-5">
        <Typography.Text style={{ color: '#072C1C', fontSize: 14 }}>
          Showing data of {totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
        </Typography.Text>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalEntries}
          showSizeChanger
          pageSizeOptions={['10', '20', '30']}
          onChange={handlePageChange}
        />
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
