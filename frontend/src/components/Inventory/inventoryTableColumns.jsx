import { Tag, Tooltip, Button } from 'antd';
import { CopyFilled, EditFilled } from '@ant-design/icons';
import HighlightText from '../common/HighlightText';

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
  return (
    <Tag color={color} className="text-wrap text-center">
      <HighlightText text={status} />
    </Tag>
  );
};

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
  return (
    <Tag color={color} className="text-wrap text-center">
      <HighlightText text={condition} />
    </Tag>
  );
};

export const columns = (handleEdit, handleRedistribute, sortOrder, userRole, activeTab) => {
  const baseColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: '120px',
      fixed: 'left',
      className: 'text-xs',
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (text) => <HighlightText text={text} />
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: '100px',
      className: 'text-xs overflow-auto',
      responsive: ['sm'],
      render: (text) => <HighlightText text={text} />,
      filters: [
        { text: 'AVR', value: 'AVR' },
        { text: 'Battery', value: 'Battery' },
        { text: 'Biometrics', value: 'Biometrics' },
        { text: 'Camera', value: 'Camera' },
        { text: 'CCTV', value: 'CCTV' },
        { text: 'Charger', value: 'Charger' },
        { text: 'Guard Tour Chips', value: 'Guard Tour Chips' },
        { text: 'Guard Tour System', value: 'Guard Tour System' },
        { text: 'Headset', value: 'Headset' },
        { text: 'Keyboard', value: 'Keyboard' },
        { text: 'Laptop', value: 'Laptop' },
        { text: 'Megaphone', value: 'Megaphone' },
        { text: 'WIFI-Mesh', value: 'WIFI-Mesh' },
        { text: 'Metal Detector', value: 'Metal Detector' },
        { text: 'Microphone', value: 'Microphone' },
        { text: 'Modem', value: 'Modem' },
        { text: 'Monitor', value: 'Monitor' },
        { text: 'Mouse', value: 'Mouse' },
        { text: 'Others', value: 'Others' },
        { text: 'Pedestal', value: 'Pedestal' },
        { text: 'Podium', value: 'Podium' },
        { text: 'Printer', value: 'Printer' },
        { text: 'Radio', value: 'Radio' },
        { text: 'Router', value: 'Router' },
        { text: 'Search Stick', value: 'Search Stick' },
        { text: 'Searchlight', value: 'Searchlight' },
        { text: 'Smartphone', value: 'Smartphone' },
        { text: 'Speaker', value: 'Speaker' },
        { text: 'Switch', value: 'Switch' },
        { text: 'System Unit', value: 'System Unit' },
        { text: 'Under Chassis', value: 'Under Chassis' },
        { text: 'UPS', value: 'UPS' },
      ],
      onFilter: (value, record) => record.type.includes(value),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      align: 'center',
      width: '100px',
      className: 'text-xs overflow-auto',
      responsive: ['sm'],
      sorter: (a, b) => a.brand.localeCompare(b.brand),
      render: (text) => <HighlightText text={text} />
    },
    {
      title: 'Qty', 
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: '80px',
      className: 'text-xs overflow-auto text-wrap',
      responsive: ['sm'],
      sorter: (a, b) => a.quantity - b.quantity,
      render: (text) => <HighlightText text={text} />
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      align: 'center',
      width: '200px',
      className: 'text-xs overflow-auto text-wrap',
      responsive: ['sm'],
      render: (text) => <HighlightText text={text && text.trim() !== '' ? text : '-'} />
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      align: 'center',
      width: '150px',
      className: 'text-xs overflow-auto text-wrap',
      responsive: ['sm'],
      sorter: (a, b) => a.serialNumber?.localeCompare(b.serialNumber || ''),
      render: (text) => <HighlightText text={text && text.trim() !== '' ? text : '-'} />
    },
    ...(activeTab === 'default'
      ? [
          {
            title: 'Issued Date',
            dataIndex: 'issuedDate',
            key: 'issuedDate',
            align: 'center',
            width: '120px',
            className: 'text-xs overflow-auto',
            responsive: ['sm'],
            sorter: (a, b) => {
              const dateA = new Date(a.issuedDate);
              const dateB = new Date(b.issuedDate);
              return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
            },
            render: (date) => <HighlightText text={(!date || date === '0000-00-00') ? 'NO DATE' : date} />,
          },
          {
            title: 'Purchased Date',
            dataIndex: 'purchaseDate',
            key: 'purchaseDate',
            align: 'center',
            width: '120px',
            className: 'text-xs overflow-auto',
            responsive: ['sm'],
            sorter: (a, b) => {
              const dateA = new Date(a.purchaseDate);
              const dateB = new Date(b.purchaseDate);
              return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
            },
            render: (text) => <HighlightText text={text} />
          },
        ]
      : activeTab === 'issuedDate'
      ? [
          {
            title: 'Issued Date',
            dataIndex: 'issuedDate',
            key: 'issuedDate',
            align: 'center',
            width: '120px',
            className: 'text-xs overflow-auto',
            responsive: ['sm'],
            sorter: (a, b) => {
              const dateA = new Date(a.issuedDate);
              const dateB = new Date(b.issuedDate);
              return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
            },
            render: (date) => <HighlightText text={(!date || date === '0000-00-00') ? 'NO DATE' : date} />,
          },
        ]
      : [
          {
            title: 'Purchased Date',
            dataIndex: 'purchaseDate',
            key: 'purchaseDate',
            align: 'center',
            width: '120px',
            className: 'text-xs overflow-auto',
            responsive: ['sm'],
            sorter: (a, b) => {
              const dateA = new Date(a.purchaseDate);
              const dateB = new Date(b.purchaseDate);
              return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
            },
            render: (text) => <HighlightText text={text} />
          },
        ]),
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      align: 'center',
      width: '120px',
      className: 'text-xs overflow-auto',
      responsive: ['sm'],
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
      width: '150px',
      className: 'text-xs overflow-auto',
      responsive: ['sm'],
      render: (text) => <HighlightText text={text} />
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: '110px',
      className: 'text-xs overflow-auto',
      responsive: ['sm'],
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'On Stock', value: 'On Stock' },
        { text: 'For Repair', value: 'For Repair' },
        { text: 'Deployed', value: 'Deployed' },
      ],
      onFilter: (value, record) => record.status.includes(value),
    },
  ];

  if (userRole !== 'guest') {
    baseColumns.push({
      title: 'Action',
      key: 'action',
      align: 'center',
      width: '80px',
      className: 'text-xs overflow-auto',
      render: (record) => (
        <>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditFilled />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          {record.quantity > 1 && (
            <Tooltip title="Redistribute">
              <Button
                type="text"
                icon={<CopyFilled />}
                onClick={() => handleRedistribute(record)}
                size="small"
              />
            </Tooltip>
          )}
        </>
      ),
    });
  }

  return baseColumns;
};
