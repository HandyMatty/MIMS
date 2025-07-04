import { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Input, Button, Typography } from 'antd';
import { getInventoryData } from '../../services/api/addItemToInventory';

const { Text } = Typography;

export default function BatchPrintItemModal({ visible, onClose, onConfirm, loading }) {
  const [allItems, setAllItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchItems();
      setSelectedRowKeys([]);
      setSelectedItems([]);
      setSearchText('');
      setCurrentPage(1);
    }
  }, [visible]);

  const fetchItems = async () => {
    setFetching(true);
    try {
      const data = await getInventoryData();
      setAllItems(data);
    } catch (e) {
      setAllItems([]);
    } finally {
      setFetching(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchText) return allItems;
    return allItems.filter(item => {
      return Object.values(item).some(val =>
        val && String(val).toLowerCase().includes(searchText.toLowerCase())
      );
    });
  }, [allItems, searchText]);

  useEffect(() => {
    setSelectedItems(allItems.filter(item => selectedRowKeys.includes(item.id)));
  }, [selectedRowKeys, allItems]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 120 },
    { title: 'Brand', dataIndex: 'brand', key: 'brand', width: 120 },
    { title: 'Serial Number', dataIndex: 'serialNumber', key: 'serialNumber', width: 150 },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: 'Location', dataIndex: 'location', key: 'location', width: 150 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title="Batch Print Items"
      width={1100}
      footer={null}
      centered
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Search items..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="mb-2"
          />
          <Table
            rowKey="id"
            dataSource={filteredItems}
            columns={columns}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredItems.length,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100', '200'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            loading={fetching}
            size="small"
            scroll={{ x: 'max-content', y: 350 }}
          />
        </div>
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-3 min-h-[350px]">
          <Text strong>Preview ({selectedItems.length} selected):</Text>
          <div className="mt-2 max-h-[320px] overflow-auto">
            {selectedItems.length === 0 ? (
              <Text type="secondary">No items selected.</Text>
            ) : (
              <ul className="text-xs space-y-1">
                {selectedItems.map(item => (
                  <li key={item.id} className="border-b pb-1 mb-1">
                    <b>{item.type}</b> - {item.brand} (Qty: {item.quantity})<br />
                    <span>ID: {item.id}</span><br />
                    <span>Serial: {item.serialNumber || 'N/A'}</span><br />
                    <span>Location: {item.location}</span><br />
                    <span>Status: {item.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onClose} disabled={loading}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => onConfirm(selectedItems)}
              loading={loading}
              disabled={selectedItems.length === 0}
            >
              Print Selected
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 