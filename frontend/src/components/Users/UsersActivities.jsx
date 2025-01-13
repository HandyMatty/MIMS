import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, Input, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { fetchActivitiesApi } from "../../services/api/fetchactivities";

const { Text } = Typography;

const UsersActivities = () => {
  const [activities, setActivities] = useState([]); // Activities data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchText, setSearchText] = useState(''); // Search text state
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [pageSize, setPageSize] = useState(5); // Page size state

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

  // Handle search input
  const onSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // Filter activities based on search text
  const filteredData = activities.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchText)
    )
  );

  // Paginate filtered data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Define table columns
  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 5,
      sorter: (a, b) => String(a.id).localeCompare(String(b.id)),
      render: (id) => id || 'N/A', // Fallback if id is missing
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
      width: 10,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      width: 10,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      width: 30,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 10,
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: (date) =>
        new Date(date).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        }),
    },
  ];

  return (
    <Card className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-4 border-none">
      {/* Header Section */}
      <div className="mb-5">
        <Text className="text-5xl-6 font-semibold">ACTIVITIES</Text>
      </div>

      {/* Search Input */}
      <div className="flex justify-start items-center mb-4 space-x-2">
        <Input
          placeholder="Search activities..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={onSearch}
          className="w-64 bg-[#a7f3d0] border border-black custom-input-table"
        />
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
