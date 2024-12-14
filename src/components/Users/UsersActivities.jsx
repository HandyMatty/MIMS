import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, Input, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { fetchActivitiesApi } from "../../services/api/fetchactivities";

const { Text } = Typography;

const UsersActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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

  // Handle search
  const onSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredData = activities.filter((item) =>
    Object.values(item).some((value) => String(value).toLowerCase().includes(searchText))
  );

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ellipsis: 'true',
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
      render: (date) => new Date(date).toLocaleString('en-US', {
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
      <div className='mb-5'>
      <Text className="text-5xl-6 font-semibold">ACTIVITIES</Text>
      </div>
      <div className="flex justify-start items-center mb-4 space-x-2">
        <Input
          placeholder="Search activities..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={onSearch}
          className="w-64 bg-[#a7f3d0] border border-black custom-input-table"
        />
      </div>

      <div style={{ height: '350px', overflowY: 'auto' }}>
      <Table
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        bordered
        rowKey="username"
      />
      </div>

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
