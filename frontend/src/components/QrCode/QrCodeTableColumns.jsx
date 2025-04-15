// QrCodeTableColumns.js

import React from 'react';
import { QrcodeOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

// Helper function to generate status tag
const getStatusTag = (status) => {
  let color;
  switch (status) {
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
  return <Tag color={color}>{status}</Tag>;
};

// Helper function to generate condition tag
const getConditionTag = (condition) => {
  let color;
  switch (condition) {
    case 'Brand New':
      color = 'gold';
      break;
    case 'Good Condition':
      color = 'green';
      break;
    case 'Defective':
      color = 'red';
      break;
    default:
      color = 'gray';
  }
  return <Tag color={color}>{condition}</Tag>;
};

// Columns definition
const columns = (handleQrCodeClick) => [
  {
    title: 'QR Code',
    dataIndex: 'qrCode',
    key: 'qrCode',
    align: 'center',
    ellipsis: true,
    fixed: 'left',
    width: 80,
    render: (_, item) => (
      <QrcodeOutlined
        style={{ fontSize: '24px', cursor: 'pointer' }}
        onClick={() => handleQrCodeClick(item)}
        title="Generate QR Code"
      />
    ),
  },
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    align: 'center',
    fixed: 'left',
    width: 130,
    sorter: (a, b) => a.id.localeCompare(b.id),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    fixed: 'left',
    width: 120,
    sorter: (a, b) => a.type.localeCompare(b.type),
  },
  {
    title: 'Brand',
    dataIndex: 'brand',
    key: 'brand',
    align: 'center',
    sorter: (a, b) => a.brand.localeCompare(b.brand),
  },
  {
    title: 'Qty', 
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
    width: 100,
    sorter: (a, b) => a.quantity - b.quantity, 
   },
  {
    title: 'Remarks', // New column for Remarks
    dataIndex: 'remarks', // Assuming 'remarks' will be a key in your data
    key: 'remarks',
    align: 'center',
    width: 200, // Set width for Remarks column
    render: (text) => text && text.trim() !== "" ? text : "-"
  },
  {
    title: 'Serial Number',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    align: 'center',
    sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
    render: (text) => text && text.trim() !== "" ? text : "-"
  },
  {
    title: 'Issued Date',
    dataIndex: 'issuedDate',
    key: 'issuedDate',
    align: 'center',
    sorter: (a, b) => a.issuedDate.localeCompare(b.issuedDate),
    render: (date) => (!date || date === "0000-00-00") ? "NO DATE" : date,
  },
  {
    title: 'Purchased Date',
    dataIndex: 'purchaseDate',
    key: 'purchaseDate',
    align: 'center',
    sorter: (a, b) => a.purchaseDate.localeCompare(b.purchaseDate),
  },
  {
    title: 'Condition',
    dataIndex: 'condition',
    key: 'condition',
    align: 'center',
    render: (condition) => getConditionTag(condition),
    filters: [
      { text: 'Brand New', value: 'Brand New' },
      { text: 'Good Condition', value: 'Good Condition' },
      { text: 'Defective', value: 'Defective' },
    ],
    onFilter: (value, record) => record.condition.includes(value),
  },
  {
    title: 'Detachment/Office',
    dataIndex: 'location',
    key: 'location',
    align: 'center',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    render: (status) => getStatusTag(status),
    filters: [
      { text: 'On Stock', value: 'On Stock' },
      { text: 'For Repair', value: 'For Repair' },
      { text: 'Deployed', value: 'Deployed' },
    ],
    onFilter: (value, record) => record.status.includes(value),
  },
];

export default columns;
