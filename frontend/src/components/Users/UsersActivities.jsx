import { useState, useEffect, useCallback } from 'react';
import { Table, Typography, Card, Input, Pagination, Button, Dropdown, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons';
import { fetchActivitiesApi } from "../../services/api/fetchactivities";
import HighlightText from '../common/HighlightText';
import { debounce } from 'lodash';

const { Text } = Typography;

const UsersActivities = () => {
  const [activities, setActivities] = useState([]); // Activities data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchText, setSearchText] = useState(''); // Search text state
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [pageSize, setPageSize] = useState(5); // Page size state
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);

  // Fetch activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await fetchActivitiesApi();
        setActivities(data); // Set fetched activities
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Failed to load activities.");
      } finally {
        setLoading(false); // Disable loading state
      }
    };
    fetchActivities();
  }, []);

  const searchableColumns = [
    { key: 'all', label: 'All Columns' },
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'activity', label: 'Activity' },
    { key: 'details', label: 'Details' },
    { key: 'date', label: 'Date' },
  ];

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value === '') {
        setFilterActive(false);
        return;
      }
      
      setFilterActive(true);
      const filtered = activities.filter(item => {
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
    [activities, searchColumn]
  );

  const handleSearch = useCallback((e) => {
    const value = e.target.value;  // Remove trim() to allow spaces
    setSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleColumnChange = (column) => {
    setSearchColumn(column);
  };

  // Reset all filters and pagination
  const resetAll = () => {
    setSearchText('');
    setCurrentPage(1);
    setSearchColumn('all');
    setFilterActive(false);
  };

  const filteredData = filterActive ? localFilteredData : activities;

  // Paginate filtered data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Define table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 5,
      sorter: (a, b) => String(a.id).localeCompare(String(b.id)),
      render: (id) => <HighlightText text={id || 'N/A'} searchTerm={searchText} />
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
      width: 10,
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (text) => <HighlightText text={text} searchTerm={searchText} />
    },
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      width: 10,
      render: (text) => <HighlightText text={text} searchTerm={searchText} />
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      width: 30,
      render: (text) => <HighlightText text={text} searchTerm={searchText} />
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 10,
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => {
        const formattedDate = new Date(date).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        });
        return <HighlightText text={formattedDate} searchTerm={searchText} />
      }
    },
  ];

  return (
    <Card title={<span className="text-3xl font-bold flex justify-center">ACTIVITIES</span>}  className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">

      {/* Search Input */}
      <div className="flex justify-start items-center mb-4 space-x-2">
        <div className="flex bg-[#a7f3d0] border border-black rounded">
          <Dropdown menu={{ 
            items: searchableColumns.map(column => ({
              key: column.key,
              label: column.label,
            })), 
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
            value={searchText}
            onChange={handleSearch}
            className="w-64 bg-transparent border-r-black border-b-black border-t-black custom-input-table"
          />
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

      {/* Activities Table */}
      <div style={{ height: '350px' }}>
        <Table
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          bordered
          rowKey="id" 
          loading={loading} 
          scroll={{ x: 'max-content', y: 280 }} 
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Text style={{ color: '#072C1C' }}>
          Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </Text>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          showSizeChanger
          pageSizeOptions={['5', '10', '15']}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </div>
    </Card>
  );
};

export default UsersActivities;
