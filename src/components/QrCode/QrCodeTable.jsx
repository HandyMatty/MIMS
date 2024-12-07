import React, { useState, useEffect } from 'react';
import { Input, Select, Table, Pagination, Typography, Tag, Card } from 'antd';
import { SearchOutlined, QrcodeOutlined, DownOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from './QrCodeModal';

const { Option } = Select;

const QrCodeTable = ({ onItemSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const { Text } = Typography;

  const totalEntries = data.length;
  

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.error('Received invalid data:', data);
        }
      } catch (error) {
        console.error('Failed to load inventory data:', error);
      }
    };

    fetchInventoryData();
  }, []);

  const filteredData = Array.isArray(data)
    ? data.filter((item) =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : [];

  const sortedData = sortOrder === 'newest' ? filteredData : [...filteredData].reverse();
  

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
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

  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQrCodeClick = (item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  };

  const handleRowClick = (item) => {
    onItemSelect(item); // Trigger the onItemSelect function when a row is clicked
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
      key: 'serialNumber',
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
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
    <Card className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-6 border-none">
      <Text className="text-[#072C1C] text-13xl font-semibold mb-5">ITEMS</Text>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          className="w-[268px] h-[33.63px] bg-[#a7f3d0] border-black custom-input-table"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex items-center text-[#072C1C] text-sm font-medium">
          Sort by:
          <Select
            defaultValue="Newest"
            suffixIcon={<DownOutlined />}
            className="ml-2 w-[132.94px] transparent-select"
            onChange={(value) => setSortOrder(value)}
          >
            <Option value="newest">Newest</Option>
            <Option value="oldest">Oldest</Option>
          </Select>
        </div>
      </div>
      <div className="overflow-y-auto" style={{ height: '680px' }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={paginatedData.map((item) => ({ ...item, key: item.id }))}
          pagination={false}
          bordered
          onRow={(record) => ({
            onClick: () => handleRowClick(record), // Handle row click
          })}
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

      {/* QR Code Modal */}
      <QrCodeModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        qrDetails={qrDetails}
      />
    </Card>
  );
};

export default QrCodeTable;
