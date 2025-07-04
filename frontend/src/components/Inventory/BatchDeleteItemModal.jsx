import { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Input, Button, Tag, Typography } from 'antd';
import { getInventoryData } from '../../services/api/addItemToInventory';

const { Text } = Typography;

export default function BatchDeleteItemModal({ visible, onClose, onConfirm, loading }) {
  const [allItems, setAllItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (visible) {
      setFetching(true);
      getInventoryData().then(data => {
        setAllItems(data);
        setFetching(false);
      });
      setSearchText('');
      setSelectedRowKeys([]);
      setSelectedItems([]);
      setCurrentPage(1);
    }
  }, [visible]);

  const filteredItems = useMemo(() => {
    if (!searchText) return allItems;
    return allItems.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [allItems, searchText]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  useEffect(() => {
    setSelectedItems(
      allItems.filter(item => selectedRowKeys.includes(item.id))
    );
  }, [selectedRowKeys, allItems]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, className: 'text-xs' },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 120, className: 'text-xs' },
    { title: 'Brand', dataIndex: 'brand', key: 'brand', width: 120, className: 'text-xs' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 70, className: 'text-xs' },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber', width: 150, className: 'text-xs' },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', width: 150, className: 'text-xs' },
    { title: 'Location', dataIndex: 'location', key: 'location', width: 150, className: 'text-xs' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, className: 'text-xs', render: (text) => {
      let color;
      switch (text) {
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
      return <Tag color={color}>{text}</Tag>;
    } },
  ];

  const previewColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, className: 'text-xs' },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 120, className: 'text-xs' },
    { title: 'Brand', dataIndex: 'brand', key: 'brand', width: 120, className: 'text-xs' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 70, className: 'text-xs' },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber', width: 150, className: 'text-xs' },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', width: 150, className: 'text-xs' },
    { title: 'Location', dataIndex: 'location', key: 'location', width: 150, className: 'text-xs' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, className: 'text-xs', render: (text) => {
      let color;
      switch (text) {
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
      return <Tag color={color}>{text}</Tag>;
    } },
    { title: 'Remove', key: 'remove', width: 80, className: 'text-xs', render: (_, record) => (
      <Button size="small" danger onClick={() => handleRemoveSelected(record.id)} className='text-xs'>Remove</Button>
    ) },
  ];

  const handleRemoveSelected = (id) => {
    setSelectedRowKeys(keys => keys.filter(key => key !== id));
  };

  const handleConfirm = () => {
    if (selectedItems.length >= 1) {
      onConfirm(selectedItems);
    }
  };

  return (
    <Modal
      open={visible}
      title="Batch Delete Items"
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="cancel" className='custom-button-cancel' onClick={onClose} disabled={loading || fetching}>Cancel</Button>,
        <Button key="confirm" className='custom-button' type="primary" onClick={handleConfirm} disabled={selectedItems.length < 1 || loading || fetching} loading={loading} danger>
          Delete Selected ({selectedItems.length})
        </Button>,
      ]}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Input.Search
              placeholder="Search items..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: 300 }}
              size="small"
            />
            <Text type="secondary" className="text-xs">Select at least 1 item to delete.</Text>
          </div>
          <Table
            bordered
            dataSource={paginatedItems}
            columns={columns}
            rowKey="id"
            size="small"
            loading={fetching}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredItems.length,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '50', '100'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              className: 'text-xs',
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              preserveSelectedRowKeys: true,
            }}
            scroll={{ x: 'max-content', y: 400 }}
            className="text-xs"
          />
        </div>
        <div className="w-full md:w-1/3 bg-gray-50 border border-gray-200 rounded p-3 overflow-auto" style={{ maxHeight: 500 }}>
          <div className="mb-2 font-semibold text-base">Selected Items Preview ({selectedItems.length})</div>
          <Table
            bordered
            dataSource={selectedItems}
            columns={previewColumns}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ y: 350 }}
            className="text-xs"
            locale={{ emptyText: 'No items selected.' }}
          />
        </div>
      </div>
    </Modal>
  );
} 