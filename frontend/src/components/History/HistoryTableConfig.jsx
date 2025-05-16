import { Tag, Button } from "antd";
import HighlightText from "../common/HighlightText";

// Helper function to generate status tag
export const getStatusTag = (status) => {
  const colors = {
    "On Stock": "green",
    "For Repair": "volcano",
    Deployed: "blue",
  };
  return <Tag color={colors[status] || "gray"}>{status}</Tag>;
};

// Helper function to generate condition tag
export const getConditionTag = (condition) => {
  const colors = {
    "Brand New": "gold",
    "Good Condition": "green",
    Defective: "red",
  };
  return <Tag color={colors[condition] || "gray"}>{condition}</Tag>;
};

export const getColumns = (showModal, tabType, searchTerm = '') => {
  let columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      sorter: true,
      width: 100,
      fixed: "left",
      render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center",
      width: 150,
      fixed: "left",
      render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
    },
    {
      title: "Action Date",
      dataIndex: "action_date",
      key: "action_date",
      align: "center",
      sorter: true,
      width: 180,
      render: (text) => {
        if (!text || text === "0000-00-00" || text === "") {
          return <HighlightText text="NO DATE" searchTerm={searchTerm} />;
        }
        const date = new Date(text);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        return <HighlightText text={formattedDate} searchTerm={searchTerm} />;
      },
      fixed: "left",
    },
    {
      title: "Item ID",
      dataIndex: "item_id",
      key: "item_id",
      align: "center",
      sorter: true,
      width: 120,
      fixed: "left",
      render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
    },
  ];

  // Add specific columns for "Added" and "Deleted" tabs
  if (tabType === "Added" || tabType === "Deleted") {
    columns.push(
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        align: "center",
        width: 120,
        render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
      },
      {
        title: "Brand",
        dataIndex: "brand",
        key: "brand",
        align: "center",
        width: 120,
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
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        align: "center",
        width: 200,
        render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
      },
      {
        title: "Serial No.",
        dataIndex: "serial_number",
        key: "serial_number",
        align: "center",
        width: 200,
        render: (text) => <HighlightText text={text && text.trim() !== "" ? text : "-"} searchTerm={searchTerm} />
      },
      {
        title: "Issued Date",
        dataIndex: "issued_date",
        key: "issued_date",
        align: "center",
        sorter: true,
        width: 150,
        render: (date) => <HighlightText text={(!date || date === "0000-00-00") ? "NO DATE" : date} searchTerm={searchTerm} />,
      },
      {
        title: "Purchased Date",
        dataIndex: "purchase_date",
        key: "purchase_date",
        align: "center",
        sorter: true,
        width: 150,
        render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
      },
      {
        title: "Condition",
        dataIndex: "condition",
        key: "condition",
        align: "center",
        width: 150,
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
        width: 150,
        render: (text) => <HighlightText text={text} searchTerm={searchTerm} />
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 120,
        render: (status) => getStatusTag(status),
        filters: [
          { text: "On Stock", value: "On Stock" },
          { text: "For Repair", value: "For Repair" },
          { text: "Deployed", value: "Deployed" },
        ],
        onFilter: (value, record) => record.status.includes(value),
      }
    );
  }

  // Add "Field Changed" and "Changed Details" only for "Updated / QRCode Update" tab
  if (tabType === "Updated") {
    columns.push(
      {
        title: "Field Changed",
        dataIndex: "field_changed",
        key: "field_changed",
        align: "center",
        width: 200,
        render: (fields) => <HighlightText text={fields ? fields.join(", ") : "N/A"} searchTerm={searchTerm} />,
      },
      {
        title: "Changed Details",
        key: "changed_details",
        align: "center",
        width: 250,
        render: (_, record) => (
          <Button type="link" onClick={() => showModal(record)}>View Changes</Button>
        ),
      }
    );
  }

  return columns;
};

