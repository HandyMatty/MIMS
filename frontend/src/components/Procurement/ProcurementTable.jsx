import React from 'react';
import { Table, Button, Typography, Empty, Pagination, Tag, Grid, Tooltip } from 'antd';
import { ArrowRightOutlined, CheckCircleTwoTone } from '@ant-design/icons';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const itemColumns = [
  { title: 'Type', dataIndex: 'type', key: 'type' },
  { title: 'Brand', dataIndex: 'brand', key: 'brand' },
  { title: 'Serial Number', dataIndex: 'serial_number', key: 'serial_number' },
  { title: 'Issued Date', dataIndex: 'issued_date', key: 'issued_date' },
  { title: 'Purchase Date', dataIndex: 'purchase_date', key: 'purchase_date' },
  { title: 'Condition', dataIndex: 'condition', key: 'condition' },
  { title: 'Location', dataIndex: 'location', key: 'location' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
];

const ProcurementTable = ({ requests, error, onApprove, isAdmin, pagination, search = '', userMap = {}, HighlightText, showAction = false, onAddToInventory, currentUserId, onDelete }) => {
  const highlight = (text) => HighlightText ? <HighlightText text={text} highlight={search} /> : text;
  const screens = useBreakpoint();
  const tableScroll = screens.xs ? { x: 1200 } : { x: 'max-content', y: 600 };
  const tableSize = screens.xs ? 'small' : 'middle';
  const tableClass = screens.xs ? 'px-0' : '';
  const baseColumns = [
    { title: 'ID', className: 'w-auto text-xs', dataIndex: 'request_id', key: 'request_id', render: (val) => highlight(String(val)) },
    { title: 'Requester', className: 'w-auto text-xs', dataIndex: 'requester_id', key: 'requester_id',
      render: (id) => {
        const username = userMap[id];
        return (
          <span>{highlight(username ? `ID: ${id} - ${username}` : `ID: ${id}`)}</span>
        );
      }
    },
    { title: 'Department', dataIndex: 'department', className: 'w-auto text-xs', key: 'department', render: (val) => highlight(String(val)) },
    { title: 'Request Date', dataIndex: 'request_date', className: 'w-auto text-xs', key: 'request_date', render: (val) => highlight(String(val)) },
    { title: 'Status', dataIndex: 'status', className: 'w-auto text-xs', key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Pending') color = 'error';
        else if (status === 'Approved') color = 'success';
        else color = 'error';
        return <Tag color={color} className='font-semibold'>{highlight(String(status))}</Tag>;
      }
    },
    { title: 'Remarks', dataIndex: 'remarks', className: 'w-auto text-xs', key: 'remarks', render: (val) => highlight(String(val)) },
  ];
  const columns = [
    ...baseColumns,
    showAction ? {
      title: 'Action',
      key: 'action',
      className: 'w-auto text-xs',
      render: (_, record) => {
        const canApprove = record.status === 'Pending' && isAdmin && onApprove;
        const canDelete = record.status === 'Pending' && currentUserId && String(record.requester_id) === String(currentUserId) && onDelete;
        if (canApprove && canDelete) {
          return (
            <div style={{ display: 'flex', gap: 4 }}>
              <Tooltip title="Approve Request">
                <Button
                  type="primary"
                  size="small"
                  className="custom-button text-xs"
                  onClick={() => onApprove(record)}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Delete Request">
                <Button
                  danger
                  size="small"
                  className="text-xs"
                  onClick={() => onDelete(record)}
                >
                  Delete
                </Button>
              </Tooltip>
            </div>
          );
        }
        if (canApprove) {
          return (
            <Tooltip title="Approve Request">
              <Button
                type="primary"
                size="small"
                className="custom-button text-xs"
                onClick={() => onApprove(record)}
              >
                Approve
              </Button>
            </Tooltip>
          );
        }
        if (canDelete) {
          return (
            <Tooltip title="Delete Request">
              <Button
                danger
                size="small"
                className="text-xs"
                onClick={() => onDelete(record)}
              >
                Delete
              </Button>
            </Tooltip>
          );
        }
        return null;
      }
    } : {
      title: 'Action',
      key: 'action',
      className: 'w-auto text-xs',
      render: (_, record) => {
        if (record.status === 'Approved' && isAdmin) {
          const eligibleItem = record.items && record.items.find(i => i.status === 'Approved');
          if (eligibleItem) {
            return (
              <Tooltip title="Add to Inventory">
                <Button
                  icon={<ArrowRightOutlined />}
                  size="small"
                  className="custom-button text-xs"
                  onClick={() => onAddToInventory && onAddToInventory(eligibleItem, record)}
                />
              </Tooltip>
            );
          } else {
            return <Tooltip title="All items added"><CheckCircleTwoTone twoToneColor="#52c41a" /></Tooltip>;
          }
        }
        return null;
      }
    }
  ].filter(Boolean);
  return (
    <div className={tableClass} style={screens.xs ? { overflowX: 'auto' } : {}}>
      {error && <Text type="danger">{error.message || 'Failed to load procurement requests.'}</Text>}
      <Table
        bordered
        dataSource={requests}
        rowKey="request_id"
        pagination={false}
        expandable={{
          expandedRowRender: (record) => (
            record.items && record.items.length > 0 ? (
              <div style={{ margin: 0, padding: 0 }}>
                <Table
                  bordered
                  dataSource={record.items}
                  columns={itemColumns.map(col => ({
                    ...col,
                    render: (val) => highlight(String(val ?? ''))
                  }))}
                  rowKey="item_id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 1200 }}
                  style={{ margin: 0, padding: 0, background: 'inherit' }}
                />
              </div>
            ) : (
              <Empty description="No items for this request" />
            )
          ),
          rowExpandable: (record) => record.items && record.items.length > 0,
        }}
        scroll={tableScroll}
        size={tableSize}
        columns={columns}
      />
      {pagination && (
        <div className="w-full flex justify-center sm:justify-end mt-3">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};

export default ProcurementTable; 