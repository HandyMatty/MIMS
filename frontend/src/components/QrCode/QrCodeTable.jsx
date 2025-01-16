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
  const [loading, setLoading] = useState(true); // Loading state

  

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const fetchedData = await getInventoryData();
        if (Array.isArray(fetchedData)) {
          // Sort fetched data by newest (highest id)
          const sortedFetchedData = [...fetchedData].sort((a, b) => b.id - a.id);
          setData(sortedFetchedData);

          // If no item is selected, select the latest item
          if (sortedFetchedData.length > 0 && !qrDetails) {
            onItemSelect(sortedFetchedData[0]);
            setQrDetails(sortedFetchedData[0]); // Set the first item as the selected item
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

  // Filter the data based on the search text
  const filteredData = Array.isArray(data)
    ? data.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : [];

  // Sort the data based on the selected sort order
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.id - a.id; // Newest items have the highest IDs
    } else if (sortOrder === 'oldest') {
      return a.id - b.id; // Oldest items have the lowest IDs
    }
    return 0; // Default fallback (no sorting)
  });


  const totalEntries = data.length;
  
  const handleSortOrderChange = (value) => {
    setSortOrder(value.toLowerCase());
    setCurrentPage(1); // Reset to the first page when sorting changes
  };
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

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
    }
    return <Tag color={color}>{condition}</Tag>
  }

  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQrCodeClick = (item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  };

  const handleRowClick = (item) => {
    onItemSelect(item); 
    setQrDetails(item); 
  };

  const columns = [
    {
      title: 'QR Code',
      dataIndex: 'qrCode',
      key: 'qrCode',
      align:'center',
      ellipsis: 'true',
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
      align:'center',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align:'center',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      align:'center',
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      align:'center',
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
    },
    {
      title: 'Issued Date',
      dataIndex: 'issuedDate',
      key: 'issuedDate',
      align: 'center',
      sorter: (a, b) => a.issuedDate.localeCompare(b.issuedDate),
    },
    {
      title: 'Purchased Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      align: 'center',
      sorter: (a, b) => a.purchaseDate.localeCompare(b.purchaseDate),
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      align:'center',
      render: (condition) => getConditionTag(condition),
    },
    {
      title: 'Detachment/Office',
      dataIndex: 'location',
      key: 'location',
      align:'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align:'center',
      render: (status) => getStatusTag(status),
    },
  ];

  return (
    <Card title={<span className="text-5xl-6 font-bold flex justify-center">ITEMS</span>}  className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
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
            onChange={handleSortOrderChange}
          >
            <Option value="newest">Newest</Option>
            <Option value="oldest">Oldest</Option>
          </Select>
        </div>
      </div>

      <div style={{ height: '680px' }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={paginatedData.map((item) => ({ ...item, key: item.id }))}
          pagination={false}
          bordered
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
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
