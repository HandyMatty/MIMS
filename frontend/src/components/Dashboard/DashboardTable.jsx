import React, { useState, useEffect } from 'react';
import { Table, Typography, Pagination, Card, message, Select } from 'antd';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from '../../components/QrCode/QrCodeModal';
import { getDashboardTableColumns } from './DashboardTableColumns'; // Adjust the path as needed

const { Option } = Select;

const DashboardTable = ({ searchText }) => {
  const [dataSource, setDataSource] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [sorterConfig, setSorterConfig] = useState({ field: 'id', order: 'descend' });
  const [loading, setLoading] = useState(true);

  // Fetch inventory data
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
    setSortOrder(value.toLowerCase());
    const order = value.toLowerCase() === 'newest' ? 'descend' : 'ascend';
    setSorterConfig({ field: 'id', order });
    setCurrentPage(1);
  };

  const handleQrCodeClick = (item) => {
    setQrDetails(item);
    setIsModalVisible(true);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      setSorterConfig({ field: sorter.field, order: sorter.order });
    }
  };

  // Get columns from the separate file and pass in the QR code click handler
  const columns = getDashboardTableColumns(handleQrCodeClick);

  return (
    <Card className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow p-6 border-none">
      <div className="flex items-center space-x-4 mb-4">
          <Select
            defaultValue="Newest"
            className="w-32 transparent-select"
            onChange={handleSortOrderChange}
          >
            <Option value="Newest">Newest</Option>
            <Option value="Oldest">Oldest</Option>
          </Select>
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
