// inventoryTableColumns.js
import React from 'react';
import { Tag, Tooltip, Button } from 'antd';
import { EditFilled} from '@ant-design/icons';


export const getConditionTag = (condition) => {
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

export const getStatusTag = (status) => {
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

export const columns = (handleEdit, sortOrder) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    align: 'center',
    width: 100,
    sorter: (a, b) => a.id.localeCompare(b.id),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    width: 120,
    sorter: (a, b) => a.type.localeCompare(b.type),
  },
  {
    title: 'Brand',
    dataIndex: 'brand',
    key: 'brand',
    align: 'center',
    width: 150,
    sorter: (a, b) => a.brand.localeCompare(b.brand),
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks', // Make sure the backend returns this key
    key: 'remarks',
    align: 'center',
    width: 200,
  },
  {
    title: 'Serial Number',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    align: 'center',
    width: 200,
    sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
  },
  {
    title: 'Issued Date',
    dataIndex: 'issuedDate',
    key: 'issuedDate',
    align: 'center',
    width: 150,
    sorter: (a, b) => {
      const dateA = new Date(a.issuedDate);
      const dateB = new Date(b.issuedDate);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    },
  },
  {
    title: 'Purchased Date',
    dataIndex: 'purchaseDate',
    key: 'purchaseDate',
    align: 'center',
    width: 150,
    sorter: (a, b) => {
      const dateA = new Date(a.purchaseDate);
      const dateB = new Date(b.purchaseDate);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    },
  },
  {
    title: 'Condition',
    dataIndex: 'condition',
    key: 'condition',
    align: 'center',
    width: 120,
    render: (condition) => getConditionTag(condition),
  },
  {
    title: 'Detachment/Office',
    dataIndex: 'location',
    key: 'location',
    align: 'center',
    width: 120,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 120,
    render: (status) => getStatusTag(status),
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    width: 80,
    render: (record) => (
      <>
        <Tooltip title="Edit">
          <Button type="text" icon={<EditFilled />} onClick={() => handleEdit(record)} />
        </Tooltip>
      </>
    ),
  },
];
