import { QrcodeOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
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

export const getColumns = (handleQrCodeClick, searchTerm = '', sorter = {}, filteredInfo = {}) => [
  {
    title: 'QR Code',
    dataIndex: 'qrCode',
    key: 'qrCode',
    align: 'center',
    width: '70px',
    className: 'text-xs overflow-auto',
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
    className: 'text-xs',
    width: '120px',
    sorter: (a, b) => Number(a.id) - Number(b.id),
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    className: 'text-xs overflow-auto',
    responsive: ['sm'],
    width: '120px',
    sorter: (a, b) => a.type.localeCompare(b.type),
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Brand',
    dataIndex: 'brand',
    key: 'brand',
    align: 'center',
    className: 'text-xs overflow-auto',
    width: '120px',
    responsive: ['sm'],
    sorter: (a, b) => a.brand.localeCompare(b.brand),
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Qty', 
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
    className: 'text-xs overflow-auto text-wrap',
    responsive: ['sm'],
    width: '80px',
    sorter: (a, b) => a.quantity - b.quantity,
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks',
    key: 'remarks',
    align: 'center',
    className: 'text-xs overflow-auto text-wrap',
    responsive: ['sm'],
    width: '200px',
    render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
  },
  {
    title: 'Serial Number',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    align: 'center',
    width: '170px',
    className: 'text-xs overflow-auto text-wrap',
    responsive: ['sm'],
    sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
    render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
  },
  {
    title: 'Issued Date',
    dataIndex: 'issuedDate',
    key: 'issuedDate',
    align: 'center',
    className: 'text-xs overflow-auto',
    width: '110px',
    responsive: ['sm'],
    sorter: (a, b) => a.issuedDate.localeCompare(b.issuedDate),
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
    width: '110px',
    className: 'text-xs overflow-auto',
    responsive: ['sm'],
    sorter: (a, b) => a.purchaseDate.localeCompare(b.purchaseDate),
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
    responsive: ['sm'],
    render: (condition) => getConditionTag(condition, searchTerm),
    filters: [
      { text: 'Brand New', value: 'Brand New' },
      { text: 'Good Condition', value: 'Good Condition' },
      { text: 'Defective', value: 'Defective' },
    ],
    filteredValue: filteredInfo.condition || null,
    onFilter: (value, record) => record.condition === value,
  },
  {
    title: 'Detachment/Office',
    dataIndex: 'location',
    key: 'location',
    align: 'center',
    width: '150px',
    className: 'text-xs overflow-auto',
    responsive: ['sm'],
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: '120px',
    className: 'text-xs overflow-auto',
    responsive: ['sm'],
    render: (status) => getStatusTag(status, searchTerm),
    filters: [
      { text: 'On Stock', value: 'On Stock' },
      { text: 'For Repair', value: 'For Repair' },
      { text: 'Deployed', value: 'Deployed' },
    ],
    filteredValue: filteredInfo.status || null,
    onFilter: (value, record) => record.status === value,
  },
];
