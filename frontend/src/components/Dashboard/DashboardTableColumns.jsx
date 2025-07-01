import { Tag } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import HighlightText from '../common/HighlightText';

export const getStatusTag = (status, searchTerm = '') => {
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
      <HighlightText text={status} searchTerm={searchTerm} />
    </Tag>
  );
};

export const getConditionTag = (condition, searchTerm = '') => {
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
      <HighlightText text={condition} searchTerm={searchTerm} />
    </Tag>
  );
};

export const getDashboardTableColumns = (handleQrCodeClick, searchTerm = '') => [
  {
    title: 'QR Code',
    dataIndex: 'qrCode',
    key: 'qrCode',
    align: 'center',
    width: '80px',
    className: 'text-xs overflow-auto',
    responsive: ['sm'],
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
    sorter: true,
    width: '130px',
    className: 'text-xs overflow-auto',
    responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    sorter: true,
    width: '120px',
    className: 'text-xs overflow-auto',
    responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />

  },
  {
    title: 'Brand',
    dataIndex: 'brand',
    key: 'brand',
    align: 'center',
    sorter: true,
    width: '120px',
    className: 'text-xs overflow-auto',
    responsive: ['md', 'lg', 'xl', 'xxl'],
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Qty',
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
    width: '70px',
    className: 'text-xs overflow-auto text-wrap',
    sorter: (a, b) => a.quantity - b.quantity,
    responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks',
    key: 'remarks',
    align: 'center',
    width: '200px',
    className: 'text-xs overflow-auto text-wrap',
    responsive: ['lg', 'xl', 'xxl'],
    render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
  },
  {
    title: 'Serial Number',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    align: 'center',
    sorter: true,
    width: '170px',
    className: 'text-xs overflow-auto text-wrap',
    responsive: ['lg', 'xl', 'xxl'],
    render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
  },
  {
    title: 'Issued Date',
    dataIndex: 'issuedDate',
    key: 'issuedDate',
    align: 'center',
    sorter: true,
    width: '120px',
    className: 'text-xs overflow-auto',
    responsive: ['md', 'lg', 'xl', 'xxl'],
    render: (date) => {
      if (!date || date === "0000-00-00" || date === "") {
        return <HighlightText text="NO DATE" searchTerm={searchTerm} />;
      }
      return <HighlightText text={date} searchTerm={searchTerm} />;
    }
  },
  {
    title: 'Purchased Date',
    dataIndex: 'purchaseDate',
    key: 'purchaseDate',
    align: 'center',
    sorter: true,
    width: '120px',
    className: 'text-xs overflow-auto',
    responsive: ['md', 'lg', 'xl', 'xxl'],
    render: (date) => {
      if (!date || date === "0000-00-00" || date === "") {
        return <HighlightText text="NO DATE" searchTerm={searchTerm} />;
      }
      return <HighlightText text={date} searchTerm={searchTerm} />;
    }
  },
  {
    title: 'Condition',
    dataIndex: 'condition',
    key: 'condition',
    align: 'center',
    width: '120px',
    className: 'text-xs overflow-auto',
    responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
    render: (condition) => getConditionTag(condition, searchTerm),
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
    responsive: ['md', 'lg', 'xl', 'xxl'],
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: '120px',
    className: 'text-xs overflow-auto',
    responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
    render: (status) => getStatusTag(status, searchTerm),
    filters: [
      { text: 'On Stock', value: 'On Stock' },
      { text: 'For Repair', value: 'For Repair' },
      { text: 'Deployed', value: 'Deployed' },
    ],
    onFilter: (value, record) => record.status.includes(value),
  },
];
