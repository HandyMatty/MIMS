import { Tag, Button } from "antd";
import HighlightText from "../common/HighlightText";

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

export const getColumns = (showModal, tabType, searchTerm = '') => {
  let columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      sorter: true,
      width: '80px',
      className: "text-xs overflow-auto text-wrap",
      render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center",
      width: '90px',
      className: "text-xs overflow-auto text-wrap",
      render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
    },
    {
      title: "Action Date",
      dataIndex: "action_date",
      key: "action_date",
      align: "center",
      sorter: true,
      width: '100px',
      responsive: ['sm'],
      className: "text-xs overflow-auto text-wrap",
      render: (text) => {
        if (!text || text === "0000-00-00" || text === "") {
          return <HighlightText text="NO DATE" searchTerm={searchTerm} />;
        }
        const date = new Date(text);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        return <HighlightText text={formattedDate} searchTerm={searchTerm} />;
      },
    },
    {
      title: "Item ID",
      dataIndex: "item_id",
      key: "item_id",
      align: "center",
      sorter: true,
      width: '130px',
      responsive: ['sm'],
      className: "text-xs overflow-auto text-wrap",
      render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
    },
  ];
  if (tabType === "Added" || tabType === "Deleted") {
    columns.push(
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        align: "center",
        width: '100px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
      },
      {
        title: "Brand",
        dataIndex: "brand",
        key: "brand",
        align: "center",
        width: '100px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
      },
      {
        title: 'Qty',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
        width: '80px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        sorter: (a, b) => a.quantity - b.quantity,
        render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        align: "center",
        width: '180px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
      },
      {
        title: "Serial No.",
        dataIndex: "serial_number",
        key: "serial_number",
        align: "center",
        width: '150px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
      },
      {
        title: "Issued Date",
        dataIndex: "issued_date",
        key: "issued_date",
        align: "center",
        sorter: true,
        width: '110px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (date) => <HighlightText text={(!date || date === "0000-00-00") ? "NO DATE" : date} searchTerm={searchTerm} />,
      },
      {
        title: "Purchased Date",
        dataIndex: "purchase_date",
        key: "purchase_date",
        align: "center",
        sorter: true,
        width: '120px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
      },
      {
        title: "Condition",
        dataIndex: "condition",
        key: "condition",
        align: "center",
        width: '120px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (condition) => getConditionTag(condition, searchTerm),
        filters: [
          { text: "Brand New", value: "Brand New" },
          { text: "Good Condition", value: "Good Condition" },
          { text: "Defective", value: "Defective" },
        ],
        onFilter: (value, record) => record.condition.includes(value),
      },
      {
        title: "Detachment/Office",
        dataIndex: "location",
        key: "location",
        align: "center",
        width: '155px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: '100px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (status) => getStatusTag(status, searchTerm),
        filters: [
          { text: "On Stock", value: "On Stock" },
          { text: "For Repair", value: "For Repair" },
          { text: "Deployed", value: "Deployed" },
        ],
        onFilter: (value, record) => record.status.includes(value),
      }
    );
  }

  if (tabType === "Updated") {
    columns.push(
      {
        title: "Field Changed",
        dataIndex: "field_changed",
        key: "field_changed",
        align: "center",
        width: '200px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (fields) => <HighlightText text={fields ? fields.join(", ") : "N/A"} searchTerm={searchTerm} />,
      },
      {
        title: "Changed Details",
        key: "changed_details",
        align: "center",
        width: '150px',
        className: "text-xs overflow-auto text-wrap",
        render: (_, record) => (
          <Button type="link" onClick={() => showModal(record)} className="text-xs">View Changes</Button>
        ),
      }
    );
  }

  return columns;
};

