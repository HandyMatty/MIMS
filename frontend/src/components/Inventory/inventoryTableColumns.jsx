import React from 'react';
import { Tag, Tooltip, Button } from 'antd';
import { EditFilled } from '@ant-design/icons';

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

export const columns = (handleEdit, sortOrder, userRole, activeTab) => {
  const baseColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      align: 'center',
      width: 120,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      fixed: 'left',
      key: 'type',
      align: 'center',
      width: 120,
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      fixed: 'left',
      key: 'brand',
      align: 'center',
      width: 150,
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
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
    ...(activeTab === 'default'
      ? [
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
            render: (date) => (!date || date === "0000-00-00") ? "NO DATE" : date,
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
        ]
      : activeTab === 'issuedDate'
      ? [
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
            render: (date) => (!date || date === "0000-00-00") ? "NO DATE" : date,
          },
        ]
      : [
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
        ]),
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      align: 'center',
      width: 120,
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
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'On Stock', value: 'On Stock' },
        { text: 'For Repair', value: 'For Repair' },
        { text: 'Deployed', value: 'Deployed' },
      ],
      onFilter: (value, record) => record.status.includes(value),
    },
  ];

  // Only add the "Action" column if the user is **not a guest**
  if (userRole !== 'guest') {
    baseColumns.push({
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 80,
      render: (record) => (
        <Tooltip title="Edit">
          <Button type="text" icon={<EditFilled />} onClick={() => handleEdit(record)} />
        </Tooltip>
      ),
    });
  }

  return baseColumns;
};
