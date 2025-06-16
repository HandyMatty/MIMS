import { useState, useEffect, useCallback } from 'react';
import { Table, Typography, Card, Input, Pagination, Button, Dropdown, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons';
import { fetchActivitiesApi } from "../../services/api/fetchactivities";
import HighlightText from '../common/HighlightText';
import { debounce } from 'lodash';
import { useMediaQuery } from 'react-responsive';

const { Text } = Typography;

const UsersActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 639 });


  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await fetchActivitiesApi();
        setActivities(data);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Failed to load activities.");
      } finally {
        setLoading(false);
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
          let cellValue = item[key];
          // If searching date, use formatted date string
          if (key === 'date' && cellValue) {
            const formattedDate = new Date(cellValue).toLocaleString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true,
            });
            if (formattedDate.toLowerCase().includes(value.toLowerCase())) {
              return true;
            }
          }
          if (cellValue && String(cellValue).toLowerCase().includes(value.toLowerCase())) {
            return true;
          }
        }
        return false;
      } else if (searchColumn === 'date') {
        // Search formatted date string
        const formattedDate = new Date(item.date).toLocaleString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        });
        return formattedDate.toLowerCase().includes(value.toLowerCase());
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
    const value = e.target.value;  
    setSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleColumnChange = (column) => {
    setSearchColumn(column);
  };

  const resetAll = () => {
    setSearchText('');
    setCurrentPage(1);
    setSearchColumn('all');
    setFilterActive(false);
  };

  const filteredData = filterActive ? localFilteredData : activities;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 'auto',
      className: 'text-xs overflow-auto',
      sorter: (a, b) => String(a.id).localeCompare(String(b.id)),
      render: (id) => <HighlightText text={id || 'N/A'} searchTerm={searchText} />
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 'auto',
      className: 'text-xs overflow-auto',
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (text) => <HighlightText text={text} searchTerm={searchText} />
    },
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      width: 'auto',
      className: 'text-xs overflow-auto',
      responsive: ['sm'],
      render: (text) => <HighlightText text={text} searchTerm={searchText} />
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      width: '500px',
      className: 'text-xs whitespace-normal break-words',
      responsive: ['sm'],
      render: (text) => <HighlightText text={text} searchTerm={searchText} />
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 'auto',
      className: 'text-xs overflow-auto',
      responsive: ['sm'],
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) => {
        const formattedDate = new Date(date).toLocaleString('en-PH', {
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
    <Card title={<span className="text-lgi sm:text-sm md:text-md lg:text-lgi xl:text-xl font-bold flex justify-center">ACTIVITIES</span>}  
        className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
          <Dropdown 
          className='w-auto hidden sm:block'
          menu={{ 
            items: searchableColumns.map(column => ({
              key: column.key,
              label: column.label,
            })), 
            onClick: ({key}) => handleColumnChange(key),
            selectedKeys: [searchColumn]
          }} trigger={['click']}>
            <Button 
              type="text" 
              className="border-black bg-[#a7f3d0] text-xs"
              icon={<FilterOutlined  className='text-xs'/>}
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
            className="w-auto text-xs border-black ml-2"
          />
        </div>
       <div className="flex gap-2 w-auto justify-center">
        <Button 
          onClick={resetAll}
          className="custom-button w-auto text-xs"
          type="default"
          size="small"
          icon={<ReloadOutlined />}
        >
          Reset
        </Button>
        </div>
      </div>

      <div className='w-auto overflow-x-auto'>
        <Table
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          bordered
          rowKey="id" 
          loading={loading} 
          scroll={{ x: 'max-content', y: 280 }}
          className='w-auto text-xs overflow-auto'
          responsive={['xs', 'sm', 'md', 'lg', 'xl']}
          expandable={
            isMobile
              ? {
                  expandedRowRender: (record) => (
                    <div className="text-xs space-y-1 text-wrap">
                      <div><b>ID:</b> {record.id}</div>
                      <div><b>Username:</b> {record.username}</div>
                      <div><b>Activity:</b> {record.activity}</div>
                      <div><b>Details:</b> {record.details}</div>
                      <div><b>Date:</b> {new Date(record.date).toLocaleString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true,
                      })}</div>
                    </div>
                  ),
                  rowExpandable: () => true,
                }
              : undefined } 
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <Text style={{ color: '#072C1C' }} className="w-full text-xs text-wrap text-center sm:text-left">
          Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </Text>
        <div className="w-full flex justify-center sm:justify-end">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          showSizeChanger
          className='text-xs'
          responsive
          pageSizeOptions={['5', '10', '15']}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
        </div>
      </div>
    </Card>
  );
};

export default UsersActivities;
