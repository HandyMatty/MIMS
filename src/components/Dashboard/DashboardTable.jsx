import React, { useState, useEffect } from 'react';
import { Table, Tag, Input, Typography, Pagination, Card, message } from 'antd'; // Import Pagination separately
import { SearchOutlined, QrcodeOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from '../../components/QrCode/QrCodeModal';


const DashboardTable = () => {
  const [dataSource, setDataSource] = useState([]); 
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);


  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData(); 
        setDataSource(data); 
      } catch (error) {
        message.error('Failed to load inventory data.');
      }
    };

    fetchInventoryData();
  }, []);

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

// Modify filtering logic to search across all fields
const filteredData = dataSource.filter(item =>
  Object.values(item)
    .join(' ') // Join all values in the item as a single string
    .toLowerCase() // Convert the string to lowercase for case-insensitive search
    .includes(searchText.toLowerCase()) // Check if searchText is included
);

  const totalEntries = filteredData.length;

  // Handle page change
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleQrCodeClick = (item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'QR Code',
      dataIndex: 'qrCode',
      key: 'qrCode',
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
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'sserialNumber',
      sorter: (a, b) => a.serialNo.localeCompare(b.serialNo),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a.date.localeCompare(b.date),
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

  return (
    <Card className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow p-6 border-none">
      <div className="flex items-center space-x-4 mb-4">
      <Input
        placeholder="Search by type, brand, or serial number"
        prefix={<SearchOutlined />}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-80 bg-[#a7f3d0] border border-black custom-input-table"
      />
      </div>

      <div className="overflow-y-auto" style={{ height: '680px' }}>
        <Table
          columns={columns}
          dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          pagination={false}
          bordered
          rowKey="id"
        />
      </div>

      <div className="flex items-center justify-between">
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
