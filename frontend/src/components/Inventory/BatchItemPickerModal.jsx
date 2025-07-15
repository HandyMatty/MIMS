import { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Input, Button, Tag, Typography } from 'antd';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Text } = Typography;

export default function BatchItemPickerModal({ visible, onClose, onConfirm, loading, status }) {
  const [allItems, setAllItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fetching, setFetching] = useState(false);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

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
    { title: 'Type', dataIndex: 'type', key: 'type', className: 'text-xs', width: 120 },
    { title: 'Brand', dataIndex: 'brand', key: 'brand', className: 'text-xs', width: 120 },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', className: 'text-xs', width: 70 },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber', className: 'text-xs', width: 150 },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', className: 'text-xs', width: 150 },
    { title: 'Location', dataIndex: 'location', key: 'location', className: 'text-xs', width: 150 },
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
    { title: 'ID', dataIndex: 'id', key: 'id', className: 'text-xs', width: 80 },
    { title: 'Type', dataIndex: 'type', key: 'type', className: 'text-xs', width: 120 },
    { title: 'Brand', dataIndex: 'brand', key: 'brand', className: 'text-xs', width: 120 },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', className: 'text-xs', width: 70 },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', className: 'text-xs', width: 150 },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber', className: 'text-xs', width: 150 },
    { title: 'Location', dataIndex: 'location', key: 'location', className: 'text-xs', width: 150 },
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
      <Button size="small" danger onClick={() => handleRemoveSelected(record.id)} className="text-xs">Remove</Button>
    ) },
  ];

  const handleRemoveSelected = (id) => {
    setSelectedRowKeys(keys => keys.filter(key => key !== id));
  };

  const handleConfirm = () => {
    if (selectedItems.length >= 2) {
      onConfirm(selectedItems);
      logUserActivity('Batch Item Pick', `Picked ${selectedItems.length} item(s) for batch edit.`);
      logUserNotification('Batch Item Pick', `Picked ${selectedItems.length} item(s) for batch edit.`);
    }
  };

  return (
    <Modal
      open={visible}
      title="Advanced Batch Item Selection"
      onCancel={onClose}
      width={1200}
      footer={[
        <Button size='small' key="cancel" className='custom-button-cancel text-xs' onClick={onClose} disabled={loading || fetching}>Cancel</Button>,
        <Button size='small' key="confirm" className='custom-button text-xs' type="primary" onClick={handleConfirm} disabled={selectedItems.length < 2 || loading || fetching} loading={loading}>
          Proceed to Batch Edit ({selectedItems.length})
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
            <Text type="secondary" className="text-xs">Select at least 2 items for batch edit.</Text>
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