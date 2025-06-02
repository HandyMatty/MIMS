import { useState, useEffect } from 'react';
import { Table, Typography, Pagination, Card, message, Select } from 'antd';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from '../../components/QrCode/QrCodeModal';
import { getDashboardTableColumns } from './DashboardTableColumns';
import { useMediaQuery } from 'react-responsive';

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
  const isMobile = useMediaQuery({ maxWidth: 639 });

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

  const handleTableChange = (sorter) => {
    if (sorter.field) {
      setSorterConfig({ field: sorter.field, order: sorter.order });
    }
  };

  return (
    <Card className="w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
        <Select
          defaultValue="Newest"
          className="w-full sm:w-auto transparent-select"
          onChange={handleSortOrderChange}
          size='small'
        >
          <Option value="Newest">
            <span className="text-xs sm:text-sm text-black">Newest</span>
          </Option>
          <Option value="Oldest">
            <span className="text-xs sm:text-sm text-black">Oldest</span>
          </Option>
        </Select>
      </div>

      <div className="w-auto" style={{ maxHeight: '600px' }}>
        <Table
          columns={getDashboardTableColumns(handleQrCodeClick, searchText)}
          dataSource={sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          pagination={false}
          expandable={
              isMobile
                ? {
                    expandedRowRender: (record) => (
                      <div className="text-xs space-y-1">
                        <div><b>ID:</b> {record.id}</div>
                        <div><b>Type:</b> {record.type}</div>
                        <div><b>Brand:</b> {record.brand}</div>
                        <div><b>Quantity:</b> {record.quantity}</div>
                        <div><b>Remarks:</b> {record.remarks}</div>
                        <div><b>Serial Number:</b> {record.serialNumber}</div>
                        <div><b>Issued Date:</b> {record.issuedDate}</div>
                        <div><b>Purchased Date:</b> {record.purchaseDate}</div>
                        <div><b>Condition:</b> {record.condition}</div>
                        <div><b>Detachment/Office:</b> {record.location}</div>
                        <div><b>Status:</b> {record.status}</div>
                      </div>
                    ),
                    rowExpandable: () => true,
                  }
                : undefined
            }
          bordered
          rowKey="id"
          onChange={handleTableChange}
          scroll={{ x: 'max-content', y: 500 }}
          loading={loading}
          responsive={{
            xs: true,
            sm: true,
            md: true,
            lg: true,
            xl: true,
            xxl: true,
          }}
        />
      </div>

    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center sm:justify-between mt-7 sm:mt-10 space-y-2 sm:space-y-0">
        <Typography.Text className="w-full text-xs text-nowrap text-center sm:text-left overflow-auto"
          style={{ color: '#072C1C' }}>
          Showing data of {totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
        </Typography.Text>
    <div className="w-full flex justify-center sm:justify-end">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalEntries}
          showSizeChanger={!isMobile}
          pageSizeOptions={['10', '20', '30', '50', '100', '200', '500', '1000', '2000']}
          onChange={handlePageChange}
          className="text-xs"
          responsive
        />
    </div>
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
