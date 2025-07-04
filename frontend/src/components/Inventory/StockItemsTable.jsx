import { Table, Input, Button, Tag, Space, Tooltip, Card, Typography, Pagination } from 'antd';
import { SearchOutlined, ReloadOutlined, CopyFilled, EditFilled } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { useState } from 'react';

const { Text } = Typography;

const StockItemsTable = ({ 
  onStockItems, 
  searchText, 
  setSearchText, 
  fetchOnStockItems, 
  loading, 
  handleStockItemSelect 
}) => {
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredStockItems = onStockItems.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const paginatedData = filteredStockItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stockColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
      className: 'text-xs',
      render: (text) => <span className="font-medium text-xs">{text}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '20%',
      className: 'text-xs',
      render: (text) => <span className="font-medium text-xs">{text}</span>
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      width: '20%',
      className: 'text-xs',
      render: (text) => <span className="font-medium text-xs">{text}</span>
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: '15%',
      className: 'text-xs',
      render: (text) => <span className="font-medium text-xs">{text}</span>
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      className: 'text-xs',
      render: (text) => (
        <Tag color={text > 5 ? 'green' : text > 1 ? 'orange' : 'red'} className="text-xs">
          {text}
        </Tag>
      )
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: '20%',
      className: 'text-xs',
      render: (text) => (
        <Tooltip title={text}>
          <span className="max-w-[200px] text-xs">{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '20%',
      className: 'text-xs',
      render: (text) =>
      <Tag color='green'> 
      <span className="font-medium text-xs">{text}</span>
      </Tag>
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      className: 'text-xs',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditFilled />}
              onClick={() => handleStockItemSelect(record)}
              size="small"
              style={{backgroundColor: 'var(--theme-card-head-bg, #5fe7a7)', color: 'black'}}
              className='text-xs'
            />
          </Tooltip>
          {record.quantity > 1 && (
            <Tooltip title="Redistribute">
              <Button
                type="primary"
                icon={<CopyFilled />}
                onClick={() => handleStockItemSelect({ ...record, action: 'redistribute' })}
                size="small"
                style={{backgroundColor: 'var(--theme-text-light-custom, #EAF4E2)', color: 'black'}}
                className='text-xs'
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-lg border-0 mb-2">
      <div className={isMobile ? "flex flex-col gap-2 mb-4" : "flex justify-between items-center mb-4"}>
        <div className={isMobile ? "w-full" : "flex items-center gap-4"}>
          <Input
            placeholder="Search items..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={isMobile ? { width: '100%' } : { width: 300 }}
            allowClear
            size="small"
            className="text-xs"
          />
        </div>
        <Button
          type='primary'
          icon={<ReloadOutlined />}
          onClick={fetchOnStockItems}
          size="small"
          style={isMobile ? { width: '100%', marginTop: 0, backgroundColor: 'var(--theme-card-head-bg, #a7f3d0)', color: 'black' } : { backgroundColor: 'var(--theme-card-head-bg, #a7f3d0)', color: 'black' }}
          className="text-xs custom-button"
        >
          Refresh
        </Button>
      </div>
      <Table
        bordered
        dataSource={paginatedData}
        columns={stockColumns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={isMobile ? { x: 'max-content', y: 400 } : { y: 400 }}
        loading={loading}
        className="text-xs"
        expandable={isMobile ? {
          expandedRowRender: (record) => (
            <div className="text-xs space-y-1">
              <div><b>ID:</b> {record.id}</div>
              <div><b>Type:</b> {record.type}</div>
              <div><b>Brand:</b> {record.brand}</div>
              <div><b>Quantity:</b> {record.quantity}</div>
              <div><b>Location:</b> {record.location}</div>
              <div><b>Remarks:</b> {record.remarks}</div>
              <div><b>Serial Number:</b> {record.serialNumber}</div>
              <div><b>Issued Date:</b> {record.issuedDate || 'NO DATE'}</div>
              <div><b>Purchased Date:</b> {record.purchaseDate || 'NO DATE'}</div>
              <div><b>Condition:</b> {record.condition}</div>
              <div><b>Status:</b> {record.status}</div>
            </div>
          ),
          rowExpandable: () => true,
        } : undefined}
      />
      <div className="flex flex-col items-center mt-4 space-y-2">
        <Text className="w-full text-xs text-center" style={{ color: '#072C1C' }}>
          Showing {filteredStockItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredStockItems.length)} of {filteredStockItems.length} entries
        </Text>
        <div className="w-full flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredStockItems.length}
            showSizeChanger
            size="small"
            responsive
            pageSizeOptions={['5', '10', '15','30','50']}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            className="text-xs"
          />
        </div>
      </div>
    </Card>
  );
};

export default StockItemsTable; 