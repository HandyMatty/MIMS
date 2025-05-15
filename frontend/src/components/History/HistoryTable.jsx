import { useState, useEffect, useMemo } from "react";
import { Table, Input, Typography, Pagination, Card, Tabs } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getHistory } from "../../services/api/getHistory";
import { getColumns } from "./HistoryTableConfig";
import HistoryModal from "./HistoryModal";

const { TabPane } = Tabs;

const HistoryTable = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Independent states for each tab
  const [searchTerms, setSearchTerms] = useState({ added: "", updated: "", deleted: "" });
  const [currentPages, setCurrentPages] = useState({ added: 1, updated: 1, deleted: 1 });
  const [pageSizes, setPageSizes] = useState({ added: 10, updated: 10, deleted: 10 });
  const [sorterConfigs, setSorterConfigs] = useState({
    added: { field: null, order: null },
    updated: { field: null, order: null },
    deleted: { field: null, order: null },
  });

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const data = await getHistory();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching history data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryData();
  }, []);

  const filterAndSortData = (data, searchTerm, sorterConfig) => {
    // Apply search filter
    const filteredData = data.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Apply sorting
    if (sorterConfig.field && sorterConfig.order) {
      return [...filteredData].sort((a, b) => {
        const valueA = a[sorterConfig.field];
        const valueB = b[sorterConfig.field];

        if (sorterConfig.field === "id") {
          return sorterConfig.order === "ascend" ? valueA - valueB : valueB - valueA;
        }

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sorterConfig.order === "ascend"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return sorterConfig.order === "ascend"
          ? valueA > valueB ? 1 : -1
          : valueA < valueB ? 1 : -1;
      });
    }
    return filteredData;
  };

  // Categorized and processed data
  const addedData = useMemo(() => {
    return filterAndSortData(
      historyData.filter((item) => item.action === "Added"),
      searchTerms.added,
      sorterConfigs.added
    );
  }, [historyData, searchTerms.added, sorterConfigs.added]);

  const updatedData = useMemo(() => {
    return filterAndSortData(
      historyData.filter((item) => item.action === "Updated" || item.action === "QRCode Update"),
      searchTerms.updated,
      sorterConfigs.updated
    );
  }, [historyData, searchTerms.updated, sorterConfigs.updated]);

  const deletedData = useMemo(() => {
    return filterAndSortData(
      historyData.filter((item) => item.action === "Deleted"),
      searchTerms.deleted,
      sorterConfigs.deleted
    );
  }, [historyData, searchTerms.deleted, sorterConfigs.deleted]);

  // Function to handle pagination change for each tab
  const handlePageChange = (tab, page, pageSize) => {
    setCurrentPages((prev) => ({ ...prev, [tab]: page }));
    setPageSizes((prev) => ({ ...prev, [tab]: pageSize }));
  };

  // Function to handle sorting changes for each tab
  const handleTableChange = (tab, _, __, sorter) => {
    setSorterConfigs((prev) => ({
      ...prev,
      [tab]: { field: sorter.field, order: sorter.order },
    }));
  };

  // Function to open modal
  const showModal = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  return (
    <Card
      title={<span className="text-5xl-6 font-bold flex justify-center">HISTORY</span>}
      className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none"
    >
      <Tabs 
  defaultActiveKey="1" 
  type="card"
  items={[
    {
      key: "1",
      label: "Added",
      children: (
        <>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerms((prev) => ({ ...prev, added: e.target.value }))}
              value={searchTerms.added}
              className="w-64 bg-[#a7f3d0] border border-black custom-input-table"
            />
          </div>
          <div style={{ height: '680px' }}>
            <Table
              rowKey="id"
              dataSource={addedData.slice(
                (currentPages.added - 1) * pageSizes.added,
                currentPages.added * pageSizes.added
              )}
              columns={getColumns(showModal, "Added")}
              bordered
              pagination={false}
              onChange={(pagination, filters, sorter) => handleTableChange("added", pagination, filters, sorter)}
              scroll={{ x: "max-content", y: 620 }}
              loading={loading}
            />
          </div>
          <div className="flex items-center justify-between mt-5">
            <Typography.Text style={{ color: "#072C1C" }}>
              Showing {addedData.length > 0 ? (currentPages.added - 1) * pageSizes.added + 1 : 0} to{" "}
              {Math.min(currentPages.added * pageSizes.added, addedData.length)} of {addedData.length} entries
            </Typography.Text>
            <Pagination
              current={currentPages.added}
              pageSize={pageSizes.added}
              total={addedData.length}
              showSizeChanger
              pageSizeOptions={["10", "20", "30"]}
              onChange={(page, pageSize) => handlePageChange("added", page, pageSize)}
            />
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: "Updated / QRCode Update",
      children: (
        <>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerms((prev) => ({ ...prev, updated: e.target.value }))}
              value={searchTerms.updated}
              className="w-64 bg-[#a7f3d0] border border-black custom-input-table"
            />
          </div>
          <div style={{ height: '680px' }}>
            <Table
              rowKey="id"
              dataSource={updatedData.slice(
                (currentPages.updated - 1) * pageSizes.updated,
                currentPages.updated * pageSizes.updated
              )}
              columns={getColumns(showModal, "Updated")}
              bordered
              pagination={false}
              onChange={(pagination, filters, sorter) => handleTableChange("updated", pagination, filters, sorter)}
              scroll={{ x: "max-content", y: 620 }}
              loading={loading}
            />
          </div>
          <div className="flex items-center justify-between mt-5">
            <Typography.Text style={{ color: "#072C1C" }}>
              Showing {updatedData.length > 0 ? (currentPages.updated - 1) * pageSizes.updated + 1 : 0} to{" "}
              {Math.min(currentPages.updated * pageSizes.updated, updatedData.length)} of {updatedData.length} entries
            </Typography.Text>
            <Pagination
              current={currentPages.updated}
              pageSize={pageSizes.updated}
              total={updatedData.length}
              showSizeChanger
              pageSizeOptions={["10", "20", "30"]}
              onChange={(page, pageSize) => handlePageChange("updated", page, pageSize)}
            />
          </div>
        </>
      ),
    },
    {
      key: "3",
      label: "Deleted",
      children: (
        <>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerms((prev) => ({ ...prev, deleted: e.target.value }))}
              value={searchTerms.deleted}
              className="w-64 bg-[#a7f3d0] border border-black custom-input-table"
            />
          </div>
          <div style={{ height: '680px' }}>
            <Table
              rowKey="id"
              dataSource={deletedData.slice(
                (currentPages.deleted - 1) * pageSizes.deleted,
                currentPages.deleted * pageSizes.deleted
              )}
              columns={getColumns(showModal, "Deleted")}
              bordered
              pagination={false}
              onChange={(pagination, filters, sorter) => handleTableChange("deleted", pagination, filters, sorter)}
              scroll={{ x: "max-content", y: 620 }}
              loading={loading}
            />
          </div>
          <div className="flex items-center justify-between mt-5">
            <Typography.Text style={{ color: "#072C1C" }}>
              Showing {deletedData.length > 0 ? (currentPages.deleted - 1) * pageSizes.deleted + 1 : 0} to{" "}
              {Math.min(currentPages.deleted * pageSizes.deleted, deletedData.length)} of {deletedData.length} entries
            </Typography.Text>
            <Pagination
              current={currentPages.deleted}
              pageSize={pageSizes.deleted}
              total={deletedData.length}
              showSizeChanger
              pageSizeOptions={["10", "20", "30"]}
              onChange={(page, pageSize) => handlePageChange("deleted", page, pageSize)}
            />
          </div>
        </>
      ),
    },
  ]}
/>


      <HistoryModal visible={modalVisible} onClose={() => setModalVisible(false)} record={selectedRecord} />
    </Card>
  );
};

export default HistoryTable;
