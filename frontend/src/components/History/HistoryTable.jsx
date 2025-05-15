import { useState, useEffect, useMemo } from "react";
import { Table, Input, Typography, Pagination, Card, Tabs, Button, Dropdown, Space } from "antd";
import { SearchOutlined, FilterOutlined, DownOutlined, ReloadOutlined } from "@ant-design/icons";
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
  
  // New states for column-specific search
  const [searchColumns, setSearchColumns] = useState({ added: 'all', updated: 'all', deleted: 'all' });
  const [localFilteredData, setLocalFilteredData] = useState({ added: [], updated: [], deleted: [] });
  const [filterActive, setFilterActive] = useState({ added: false, updated: false, deleted: false });

  // Searchable columns for the dropdown
  const searchableColumns = [
    { key: 'all', label: 'All Columns' },
    { key: 'id', label: 'ID' },
    { key: 'action', label: 'Action' },
    { key: 'action_date', label: 'Action Date' },
    { key: 'item_id', label: 'Item ID' },
    { key: 'type', label: 'Type' },
    { key: 'brand', label: 'Brand' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'field_changed', label: 'Field Changed' },
    { key: 'serial_number', label: 'Serial Number' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'condition', label: 'Condition' },
  ];

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

  // Handle search with column filtering
  const handleSearch = (tab, e) => {
    const value = e.target.value.trim().toLowerCase();
    
    // Update search term
    setSearchTerms(prev => ({ ...prev, [tab]: value }));
    
    if (value === '') {
      // Reset filtering for this tab
      setFilterActive(prev => ({ ...prev, [tab]: false }));
      return;
    }
    
    // Set filtering as active for this tab
    setFilterActive(prev => ({ ...prev, [tab]: true }));
    
    // Get the correct data based on tab
    const tabData = historyData.filter(item => {
      if (tab === 'added') return item.action === 'Added';
      if (tab === 'updated') return item.action === 'Updated' || item.action === 'QRCode Update';
      if (tab === 'deleted') return item.action === 'Deleted';
      return false;
    });
    
    // Filter data based on selected column
    const filtered = tabData.filter(item => {
      if (!item) return false;
      
      const searchColumn = searchColumns[tab];
      
      if (searchColumn === 'all') {
        // Search all columns
        for (const key in item) {
          const cellValue = item[key];
          if (cellValue && String(cellValue).toLowerCase().includes(value)) {
            return true;
          }
        }
        return false;
      } else {
        // Search specific column
        const cellValue = item[searchColumn];
        return cellValue && String(cellValue).toLowerCase().includes(value);
      }
    });
    
    // Update filtered data for this tab
    setLocalFilteredData(prev => ({ ...prev, [tab]: filtered }));
  };

  // Handle column selection change
  const handleColumnChange = (tab, column) => {
    setSearchColumns(prev => ({ ...prev, [tab]: column }));
  };

  // Reset all filters for a tab
  const resetTab = (tab) => {
    setSearchTerms(prev => ({ ...prev, [tab]: '' }));
    setSearchColumns(prev => ({ ...prev, [tab]: 'all' }));
    setFilterActive(prev => ({ ...prev, [tab]: false }));
    setCurrentPages(prev => ({ ...prev, [tab]: 1 }));
  };

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

  // Create dropdown menu for each tab
  const getColumnMenu = (tab) => {
    return {
      items: searchableColumns.map(column => ({
        key: column.key,
        label: column.label,
      })),
      onClick: ({ key }) => handleColumnChange(tab, key),
      selectedKeys: [searchColumns[tab]]
    };
  };

  const resetAllFilters = (tab) => {
    resetTab(tab);
    setSorterConfigs(prev => ({
      ...prev,
      [tab]: { field: null, order: null },
    }));
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
                  <div className="flex bg-[#a7f3d0] border border-black rounded">
                    <Dropdown menu={getColumnMenu('added')} trigger={['click']}>
                      <Button 
                        type="text" 
                        className="border-black"
                        icon={<FilterOutlined />}
                      >
                        <Space>
                          {searchableColumns.find(col => col.key === searchColumns.added)?.label || 'All Columns'}
                          <DownOutlined />
                        </Space>
                      </Button>
                    </Dropdown>
                    <Input
                      placeholder={`Search in ${searchColumns.added === 'all' ? 'all columns' : searchableColumns.find(col => col.key === searchColumns.added)?.label}`}
                      prefix={<SearchOutlined />}
                      value={searchTerms.added}
                      onChange={(e) => handleSearch('added', e)}
                      className="bg-transparent custom-input-table w-64 border-r-black border-b-black border-t-black"
                      suffix={
                        searchTerms.added ? (
                          <Button 
                            type="text" 
                            size="small" 
                            onClick={() => resetTab('added')}
                          >
                            ×
                          </Button>
                        ) : null
                      }
                    />
                  </div>
                  <Button 
                    onClick={() => resetAllFilters('added')}
                    className="custom-button"
                    type="default"
                    size="small"
                    icon={<ReloadOutlined />}
                  >
                    Reset
                  </Button>
                </div>
                <div style={{ height: '680px' }}>
                  <Table
                    rowKey="id"
                    dataSource={filterActive.added ? localFilteredData.added : 
                      addedData.slice(
                        (currentPages.added - 1) * pageSizes.added,
                        currentPages.added * pageSizes.added
                      )
                    }
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
                    Showing {(filterActive.added ? localFilteredData.added : addedData).length > 0 ? 
                      (currentPages.added - 1) * pageSizes.added + 1 : 0} to{" "}
                    {Math.min(currentPages.added * pageSizes.added, 
                      (filterActive.added ? localFilteredData.added : addedData).length)} 
                    of {(filterActive.added ? localFilteredData.added : addedData).length} entries
                  </Typography.Text>
                  <Pagination
                    current={currentPages.added}
                    pageSize={pageSizes.added}
                    total={(filterActive.added ? localFilteredData.added : addedData).length}
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
                  <div className="flex bg-[#a7f3d0] border border-black rounded">
                    <Dropdown menu={getColumnMenu('updated')} trigger={['click']}>
                      <Button 
                        type="text" 
                        className="border-black"
                        icon={<FilterOutlined />}
                      >
                        <Space>
                          {searchableColumns.find(col => col.key === searchColumns.updated)?.label || 'All Columns'}
                          <DownOutlined />
                        </Space>
                      </Button>
                    </Dropdown>
                    <Input
                      placeholder={`Search in ${searchColumns.updated === 'all' ? 'all columns' : searchableColumns.find(col => col.key === searchColumns.updated)?.label}`}
                      prefix={<SearchOutlined />}
                      value={searchTerms.updated}
                      onChange={(e) => handleSearch('updated', e)}
                      className="bg-transparent custom-input-table w-64 border-r-black border-b-black border-t-black"
                      suffix={
                        searchTerms.updated ? (
                          <Button 
                            type="text" 
                            size="small" 
                            onClick={() => resetTab('updated')}
                          >
                            ×
                          </Button>
                        ) : null
                      }
                    />
                  </div>
                  <Button 
                    onClick={() => resetAllFilters('updated')}
                    className="custom-button"
                    type="default"
                    size="small"
                    icon={<ReloadOutlined />}
                  >
                    Reset
                  </Button>
                </div>
                <div style={{ height: '680px' }}>
                  <Table
                    rowKey="id"
                    dataSource={filterActive.updated ? localFilteredData.updated : 
                      updatedData.slice(
                        (currentPages.updated - 1) * pageSizes.updated,
                        currentPages.updated * pageSizes.updated
                      )
                    }
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
                    Showing {(filterActive.updated ? localFilteredData.updated : updatedData).length > 0 ? 
                      (currentPages.updated - 1) * pageSizes.updated + 1 : 0} to{" "}
                    {Math.min(currentPages.updated * pageSizes.updated, 
                      (filterActive.updated ? localFilteredData.updated : updatedData).length)} 
                    of {(filterActive.updated ? localFilteredData.updated : updatedData).length} entries
                  </Typography.Text>
                  <Pagination
                    current={currentPages.updated}
                    pageSize={pageSizes.updated}
                    total={(filterActive.updated ? localFilteredData.updated : updatedData).length}
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
                  <div className="flex bg-[#a7f3d0] border border-black rounded">
                    <Dropdown menu={getColumnMenu('deleted')} trigger={['click']}>
                      <Button 
                        type="text" 
                        className="border-black"
                        icon={<FilterOutlined />}
                      >
                        <Space>
                          {searchableColumns.find(col => col.key === searchColumns.deleted)?.label || 'All Columns'}
                          <DownOutlined />
                        </Space>
                      </Button>
                    </Dropdown>
                    <Input
                      placeholder={`Search in ${searchColumns.deleted === 'all' ? 'all columns' : searchableColumns.find(col => col.key === searchColumns.deleted)?.label}`}
                      prefix={<SearchOutlined />}
                      value={searchTerms.deleted}
                      onChange={(e) => handleSearch('deleted', e)}
                      className="bg-transparent custom-input-table w-64 border-r-black border-b-black border-t-black"
                      suffix={
                        searchTerms.deleted ? (
                          <Button 
                            type="text" 
                            size="small" 
                            onClick={() => resetTab('deleted')}
                          >
                            ×
                          </Button>
                        ) : null
                      }
                    />
                  </div>
                  <Button 
                    onClick={() => resetAllFilters('deleted')}
                    className="custom-button"
                    type="default"
                    size="small"
                    icon={<ReloadOutlined />}
                  >
                    Reset
                  </Button>
                </div>
                <div style={{ height: '680px' }}>
                  <Table
                    rowKey="id"
                    dataSource={filterActive.deleted ? localFilteredData.deleted : 
                      deletedData.slice(
                        (currentPages.deleted - 1) * pageSizes.deleted,
                        currentPages.deleted * pageSizes.deleted
                      )
                    }
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
                    Showing {(filterActive.deleted ? localFilteredData.deleted : deletedData).length > 0 ? 
                      (currentPages.deleted - 1) * pageSizes.deleted + 1 : 0} to{" "}
                    {Math.min(currentPages.deleted * pageSizes.deleted, 
                      (filterActive.deleted ? localFilteredData.deleted : deletedData).length)} 
                    of {(filterActive.deleted ? localFilteredData.deleted : deletedData).length} entries
                  </Typography.Text>
                  <Pagination
                    current={currentPages.deleted}
                    pageSize={pageSizes.deleted}
                    total={(filterActive.deleted ? localFilteredData.deleted : deletedData).length}
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
