// HistoryTableConfig.js

import React from 'react';
import { Tag } from 'antd';

// Helper function to generate status tag
export const getStatusTag = (status) => {
  const colors = {
    'On Stock': 'green',
    'For Repair': 'volcano',
    Deployed: 'blue',
  };
  return <Tag color={colors[status] || 'gray'}>{status}</Tag>;
};

// Helper function to generate condition tag
export const getConditionTag = (condition) => {
  const colors = {
    'Brand New': 'gold',
    'Good Condition': 'green',
    Defective: 'red',
  };
  return <Tag color={colors[condition] || 'gray'}>{condition}</Tag>;
};

// Column definitions for the table
export const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    align: 'center',
    sorter: true,
    width: 100, // Set width for consistency
    fixed: 'left', // Fixed to the left side of the table
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    align: 'center',
    width: 150, // Set the width of the 'Action' column
  },
  {
    title: 'Action Date',
    dataIndex: 'action_date',
    key: 'action_date',
    align: 'center',
    sorter: true,
    width: 180, // Set width for Action Date column
    render: (text) => new Date(text).toLocaleDateString(),
  },
  {
    title: 'Item ID',
    dataIndex: 'item_id',
    key: 'item_id',
    align: 'center',
    sorter: true,
    width: 120, // Set width for Item ID column
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    width: 120, // Set width for Type column
  },
  {
    title: 'Brand',
    dataIndex: 'brand',
    key: 'brand',
    align: 'center',
    width: 120, // Set width for Brand column
  },
  {
    title: 'Remarks', // New column for Remarks
    dataIndex: 'remarks', // Assuming 'remarks' will be a key in your data
    key: 'remarks',
    align: 'center',
    width: 200, // Set width for Remarks column
  },
  {
    title: 'Serial No.',
    dataIndex: 'serial_number',
    key: 'serial_number',
    align: 'center',
    width: 200, // Set width for Serial Number column
  },
  {
    title: 'Issued Date',
    dataIndex: 'issued_date',
    key: 'issued_date',
    align: 'center',
    sorter: true,
    width: 150, // Set width for Issued Date column
  },
  {
    title: 'Purchased Date',
    dataIndex: 'purchase_date',
    key: 'purchase_date',
    align: 'center',
    sorter: true,
    width: 150, // Set width for Purchased Date column
  },
  {
    title: 'Condition',
    dataIndex: 'condition',
    key: 'condition',
    align: 'center',
    width: 150, // Set width for Condition column
    render: (condition) => getConditionTag(condition),
  },
  {
    title: 'Detachment/Office',
    dataIndex: 'location',
    key: 'location',
    align: 'center',
    width: 150, // Set width for Location column
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 120, // Set width for Status column
    render: (status) => getStatusTag(status),
  },
];
