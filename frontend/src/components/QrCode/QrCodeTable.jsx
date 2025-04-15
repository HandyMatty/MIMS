// QrCodeTable.js

import React, { useState, useEffect } from 'react';
import { Input, Select, Table, Pagination, Typography, Card } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from './QrCodeModal';
import columns from './QrCodeTableColumns';  // Import the columns

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

  // Filter and sort the data based on the selected search text and sort order
  const filteredData = Array.isArray(data)
    ? data.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : [];

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.id - a.id;
    } else if (sortOrder === 'oldest') {
      return a.id - b.id;
    }
    return 0;
  });

  const totalEntries = data.length;

  const handleSortOrderChange = (value) => {
    setSortOrder(value.toLowerCase());
    setCurrentPage(1);
  };
  
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQrCodeClick = (item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  };

  const handleRowClick = (item) => {
    onItemSelect(item);
    setQrDetails(item); 
  };

  return (
    <Card title={<span className="text-5xl-6 font-bold flex justify-center">ITEMS</span>} className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
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

      <div style={{ height: '700px' }}>
        <Table
          rowKey="id"
          columns={columns(handleQrCodeClick)}  // Pass handleQrCodeClick to columns
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
