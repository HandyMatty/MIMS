import { Table, Input, Button, Tag, Space, Tooltip, Card } from 'antd';
import { SearchOutlined, ReloadOutlined, CopyFilled, EditFilled } from '@ant-design/icons';

const StockItemsTable = ({ 
  onStockItems, 
  searchText, 
  setSearchText, 
  fetchOnStockItems, 
  loading, 
  handleStockItemSelect 
}) => {
  const filteredStockItems = onStockItems.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const stockColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
      render: (text) => <span className="font-medium text-xs">{text}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '20%',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      width: '20%',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      render: (text) => (
        <Tag color={text > 5 ? 'green' : text > 1 ? 'orange' : 'red'}>
          {text}
        </Tag>
      )
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: '20%',
      render: (text) => (
        <Tooltip title={text}>
          <span className="truncate block max-w-[200px]">{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditFilled />}
              onClick={() => handleStockItemSelect(record)}
              size="small"
              style={{backgroundColor: 'var(--theme-card-head-bg, #5fe7a7)', color: 'black'}}
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
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-lg border-0 mb-2">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search items..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            size="small"
          />
        </div>
        <Button
        type='primary'
          icon={<ReloadOutlined />}
          onClick={fetchOnStockItems}
          size="small"
          style={{backgroundColor: 'var(--theme-card-head-bg, #a7f3d0)', color: 'black'}}
        >
          Refresh
        </Button>
      </div>
      <Table
        dataSource={filteredStockItems}
        columns={stockColumns}
        rowKey="id"
        size="middle"
        pagination={{ 
          pageSize: 5,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`
        }}
        scroll={{ y: 400 }}
        loading={loading}
      />
    </Card>
  );
};

export default StockItemsTable; 