import { Tag, Button } from "antd";
import HighlightText from "../common/HighlightText";

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

export const getColumns = (showModal, tabType) => {
  let columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      sorter: true,
      width: '80px',
      fixed: 'left',
      className: "text-xs text-wrap",
      render: (text) => <HighlightText text={text} />
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center",
      width: '90px',
      className: "text-xs overflow-auto text-wrap",
      render: (text) => <HighlightText text={text} />
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
          return <HighlightText text="NO DATE" />;
        }
        const date = new Date(text);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        return <HighlightText text={formattedDate} />;
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
      render: (text) => <HighlightText text={text} />
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
        render: (text) => <HighlightText text={text} />
      },
      {
        title: "Brand",
        dataIndex: "brand",
        key: "brand",
        align: "center",
        width: '100px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text} />
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
        render: (text) => <HighlightText text={text} />
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        align: "center",
        width: '180px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} />
      },
      {
        title: "Serial No.",
        dataIndex: "serial_number",
        key: "serial_number",
        align: "center",
        width: '150px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} />
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
        render: (date) => <HighlightText text={(!date || date === "0000-00-00") ? "NO DATE" : date} />,
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
        render: (text) => <HighlightText text={text} />
      },
      {
        title: "Condition",
        dataIndex: "condition",
        key: "condition",
        align: "center",
        width: '120px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (condition) => getConditionTag(condition),
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
        render: (text) => <HighlightText text={text} />
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: '100px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (status) => getStatusTag(status),
        filters: [
          { text: "On Stock", value: "On Stock" },
          { text: "Deployed", value: "Deployed" },
          { text: "For Repair", value: "For Repair" },
        ],
        onFilter: (value, record) => record.status.includes(value),
      },
    );
  } else if (tabType === "Updated") {
    columns.push(
      {
        title: "Field Changed",
        dataIndex: "field_changed",
        key: "field_changed",
        align: "center",
        width: '200px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (field_changed) => {
          if (Array.isArray(field_changed)) {
            return <HighlightText text={field_changed.join(', ')} />;
          } else if (typeof field_changed === 'string') {
            const fields = field_changed.split(/[,|;]/).map(s => s.trim()).filter(Boolean);
            return <HighlightText text={fields.join(', ')} />;
          }
          return <HighlightText text={field_changed || '-'} />;
        },
      },
      {
        title: "Old Value",
        dataIndex: "old_value",
        key: "old_value",
        align: "center",
        width: '150px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (old_value) => {
          if (Array.isArray(old_value)) {
            return <HighlightText text={old_value.join(', ')} />;
          } else if (typeof old_value === 'string') {
            const values = old_value.split(/[,|;]/).map(s => s.trim()).filter(Boolean);
            return <HighlightText text={values.join(', ')} />;
          }
          return <HighlightText text={old_value || '-'} />;
        },
      },
      {
        title: "New Value",
        dataIndex: "new_value",
        key: "new_value",
        align: "center",
        width: '150px',
        responsive: ['sm'],
        className: "text-xs overflow-auto text-wrap",
        render: (new_value) => {
          if (Array.isArray(new_value)) {
            return <HighlightText text={new_value.join(', ')} />;
          } else if (typeof new_value === 'string') {
            const values = new_value.split(/[,|;]/).map(s => s.trim()).filter(Boolean);
            return <HighlightText text={values.join(', ')} />;
          }
          return <HighlightText text={new_value || '-'} />;
        },
      },
    );
      columns.push({
    title: "Actions",
    key: "actions",
    align: "center",
    width: '100px',
    className: "text-xs",
    render: (_, record) => (
      <Button
        type="link"
        size="small"
        onClick={() => showModal(record)}
        className="text-xs p-0"
      >
        View Details
      </Button>
    ),
  });
  }

  return columns;
};

