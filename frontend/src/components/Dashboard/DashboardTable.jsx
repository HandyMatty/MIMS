import { useState, useEffect, useCallback } from 'react';
import { Table, Typography, Pagination, message, Select, Button } from 'antd';
import { getInventoryData } from '../../services/api/addItemToInventory';
import QrCodeModal from '../../components/QrCode/QrCodeModal';
import { getDashboardTableColumns } from './DashboardTableColumns';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '../../utils/ThemeContext';
import { ReloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { handlePrint as printUtilsHandlePrint } from '../../utils/printUtils';

const { Option } = Select;

const DashboardTable = ({ searchText }) => {
  const [dataSource, setDataSource] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [qrDetails, setQrDetails] = useState(null);
  const [sortOrder, setSortOrder] = useState('Newest');
  const [sorterConfig, setSorterConfig] = useState({ field: 'id', order: 'descend' });
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const { theme, currentTheme } = useTheme();

  // Fetch inventory data
  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInventoryData();
      setDataSource(data);
    } catch (error) {
      message.error('Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const handleRefresh = () => {
    setCurrentPage(1);
    setSortOrder('Newest');
    setSorterConfig({ field: 'id', order: 'descend' });
    handleSortOrderChange('Newest');
    setSelectedRowKeys([]);
    fetchInventoryData();
  };

  const handlePrint = () => {
    const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.id));
    if (selectedItems.length > 0) {
      printUtilsHandlePrint(selectedItems);
    } else {
      message.warning('Please select items to print.');
    }
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
    const normalizedValue = value === 'Oldest' ? 'Oldest' : 'Newest';
    setSortOrder(normalizedValue);
    const order = normalizedValue === 'Newest' ? 'descend' : 'ascend';
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
    <div className="w-full h-full mx-auto bg-[#a7f3d0] rounded-xl shadow border-none p-8"
      style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
        <Select
          value={sortOrder}
          defaultValue="Newest"
          className="w-full sm:w-auto transparent-select"
          onChange={handleSortOrderChange}
          size='small'
        >
          <Option value="Newest">
            <span className="text-xs text-black">Newest</span>
          </Option>
          <Option value="Oldest">
            <span className="text-xs text-black">Oldest</span>
          </Option>
        </Select>
        <Button
          onClick={handleRefresh}
          icon={<ReloadOutlined />}
          size='small'
          className="custom-button text-xs"
        >
          Refresh
        </Button>
        <Button
          onClick={handlePrint}
          icon={<PrinterOutlined />}
          size='small'
          className="custom-button text-xs"
          disabled={selectedRowKeys.length === 0}
        >
          Print
        </Button>
      </div>

      <div className="w-auto overflow-x-auto">
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
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
          style={currentTheme !== 'default' ? { color: theme.text } : { color: '#072C1C' }}>
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
    </div>
  );
};

export default DashboardTable;
