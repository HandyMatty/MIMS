import React, { useState, useEffect } from 'react';
import { Table, Input, Typography, Pagination, Tag, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getHistory } from '../../services/api/getHistory';  // Import the API function

const HistoryTable = () => {
  const [historyData, setHistoryData] = useState([]);  // Store the fetched data
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const data = await getHistory();
        setHistoryData(data);
      } catch (error) {
        console.error('Failed to fetch history data', error);
      }
    };
    fetchHistoryData();
  }, []);

  const filteredData = historyData.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalEntries = filteredData.length;

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const getStatusTag = (status) => {
    let color;
    switch (status) {
      case 'Available':
        color = 'green';
        break;
      case 'For Repair':
        color = 'volcano';
        break;
      case 'Deployed':
        color = 'blue';
        break;
      default:
        color = 'gray';
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const columns = [
   {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      sorter: (a, b) => a.action.localeCompare(b.action),
    },
    {
      title: 'Action Date',
      dataIndex: 'action_date',
      key: 'action_date',
      sorter: (a, b) => new Date(a.action_date) - new Date(b.action_date),
    },
    {
      title: 'Item ID',
      dataIndex: 'item_id',
      key: 'item_id',
      sorter: (a, b) => a.item_id - b.item_id,  // Assuming `item_id` is numeric
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Serial No.',
      dataIndex: 'serial_number',
      key: 'serial_number',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
   
  ];

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Card
      className="flex flex-col w-full bg-[#A8E1C5] rounded-xl shadow p-6 overflow-auto border-none"
      style={{ minHeight: '700px' }}
    >
      <div className="flex justify-between items-center mb-4">
        <Typography.Text className="text-green-950 text-13xl font-semibold font-['Poppins']">
          TRANSACTION
        </Typography.Text>
      </div>
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
        className="w-64 bg-[#a7f3d0] border border-black mb-4 custom-input-table"
      />
      <div style={{ height: '650px', overflowY: 'auto' }}>
        <Table
          rowKey="id"
          dataSource={paginatedData}
          columns={columns}
          bordered
          pagination={false}
        />
      </div>
      <div className="flex items-center justify-between">
        <Typography.Text style={{ color: '#072C1C', fontSize: 14 }}>
          Showing data of{' '}
          {totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries}{' '}
          entries
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
    </Card>
  );
};

export default HistoryTable;
