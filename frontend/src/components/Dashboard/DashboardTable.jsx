import React, { useState, useEffect } from 'react';
import { Table, Tag, Input, Typography, Pagination, Card, message, Select } from 'antd';
import { SearchOutlined, QrcodeOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from '../../components/QrCode/QrCodeModal';

const { Option } = Select;

const DashboardTable = () => {
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [sorterConfig, setSorterConfig] = useState({ field: 'id', order: 'descend' });
  const [loading, setLoading] = useState(true); // Loading state


  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();
        setDataSource(data);
      } catch (error) {
        message.error('Failed to load inventory data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const getStatusTag = (status) => {
    let color;
    switch (status) {
      case 'On Stock':
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

  const getConditionTag = (condition) => {
    let color;
    switch (condition) {
      case 'Brand New':
        color = 'gold';
        break;
      case 'Good Condition':
        color = 'green';
        break;
      case 'Defective':
        color = 'red';
        break;
      default:
        color = 'gray';
    }
    return <Tag color={color}>{condition}</Tag>;
  };

  // Filter the data based on the search text
  const filteredData = Array.isArray(dataSource)
    ? dataSource.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : [];

  // Sorting function based on selected sorterConfig
  const sortedData = [...filteredData].sort((a, b) => {
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

  const totalEntries = sortedData.length;

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleSortOrderChange = (value) => {
    // When the dropdown changes, update the global sorterConfig to match the order
    setSortOrder(value.toLowerCase());
    const order = value.toLowerCase() === 'newest' ? 'descend' : 'ascend';
    setSorterConfig({ field: 'id', order });
    setCurrentPage(1); // Reset to the first page when sorting changes
  };

  const handleQrCodeClick = (item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // Only update sorterConfig if a column sort is triggered
    if (sorter.field) {
      setSorterConfig({ field: sorter.field, order: sorter.order });
    }
  };

  const columns = [
    {
      title: 'QR Code',
      dataIndex: 'qrCode',
      key: 'qrCode',
      align: 'center',
      width: 100,
      render: (_, item) => (
        <QrcodeOutlined
          style={{ fontSize: '24px', cursor: 'pointer' }}
          onClick={() => handleQrCodeClick(item)}
          title="Generate QR Code"
        />
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      sorter: true,
      width: 100,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      sorter: true,
      width: 120,
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      align: 'center',
      sorter: true,
      width: 150,
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      align: 'center',
      sorter: true,
      width: 200,
    },
    {
      title: 'Issued Date',
      dataIndex: 'issuedDate',
      key: 'issuedDate',
      align: 'center',
      sorter: true,
      width: 150,
    },
    {
      title: 'Purchased Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      align: 'center',
      sorter: true,
      width: 150,
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      align: 'center',
      width: 120,
      render: (condition) => getConditionTag(condition),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      align: 'center',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status) => getStatusTag(status),
    },
  ];

  return (
    <Card className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow p-6 border-none">
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Search by type, brand, or serial number"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-80 bg-[#a7f3d0] border border-black custom-input-table"
        />

        <div className="flex justify-end">
          <Select
            defaultValue="Newest"
            className="w-32 transparent-select"
            onChange={handleSortOrderChange}
          >
            <Option value="Newest">Newest</Option>
            <Option value="Oldest">Oldest</Option>
          </Select>
        </div>
      </div>

      <div style={{ height: '680px' }}>
        <Table
          columns={columns}
          dataSource={sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          pagination={false}
          bordered
          rowKey="id"
          onChange={handleTableChange}
          scroll={{ x: 'max-content', y: 600 }}  
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

export default DashboardTable;
