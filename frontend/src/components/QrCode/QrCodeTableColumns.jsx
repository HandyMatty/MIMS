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
    sorter: (a, b) => a.id.localeCompare(b.id),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
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
    title: 'Remarks', // New column for Remarks
    dataIndex: 'remarks', // Assuming 'remarks' will be a key in your data
    key: 'remarks',
    align: 'center',
    width: 200, // Set width for Remarks column
  },
  {
    title: 'Serial Number',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    align: 'center',
    sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
  },
  {
    title: 'Issued Date',
    dataIndex: 'issuedDate',
    key: 'issuedDate',
    align: 'center',
    sorter: (a, b) => a.issuedDate.localeCompare(b.issuedDate),
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
  },
];

export default columns;
