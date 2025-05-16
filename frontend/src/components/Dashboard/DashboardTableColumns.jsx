import { Tag } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import HighlightText from '../common/HighlightText';

// Helper to render the status tag
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

// Helper to render the condition tag
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

// Export a function that returns the columns array.
// We pass in handleQrCodeClick so that the QR Code column can call it.
export const getDashboardTableColumns = (handleQrCodeClick, searchTerm = '') => [
  {
    title: 'QR Code',
    dataIndex: 'qrCode',
    key: 'qrCode',
    align: 'center',
    width: 100,
    fixed: 'left',
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
    width: 120,
    fixed: 'left',
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    sorter: true,
    width: 130,
    fixed: 'left',
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Brand',
    dataIndex: 'brand',
    key: 'brand',
    align: 'center',
    sorter: true,
    width: 150,
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Qty', 
    dataIndex: 'quantity',
    key: 'quantity',
    align: 'center',
    width: 100,
    sorter: (a, b) => a.quantity - b.quantity,
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks',
    key: 'remarks',
    align: 'center',
    width: 200,
    render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
  },
  {
    title: 'Serial Number',
    dataIndex: 'serialNumber',
    key: 'serialNumber',
    align: 'center',
    sorter: true,
    width: 200,
    render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
  },
  {
    title: 'Issued Date',
    dataIndex: 'issuedDate',
    key: 'issuedDate',
    align: 'center',
    sorter: true,
    width: 150,
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
    width: 150,
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
    width: 150,
    render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
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
