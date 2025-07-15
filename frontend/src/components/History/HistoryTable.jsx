import React, { useState, useMemo, useCallback } from "react";
import { Table, Input, Typography, Pagination, Card, Tabs, Button, Dropdown } from "antd";
import { SearchOutlined, FilterOutlined, DownOutlined, ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import { getColumns } from "./HistoryTableConfig";
import HistoryModal from "./HistoryModal";
import ExportModal from "../common/ExportModal";
import { useHistoryTable } from "../../hooks/useHistoryTable";
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { SearchContext } from '../../utils/SearchContext';

const TableContent = React.memo(({
  tabType,
  searchColumn,
  searchableColumns,
  searchTerm,
  handleSearch,
  refreshHistory,
  handleExportOpen,
  getRowSelection,
  filterActive,
  localFilteredData,
  currentPage,
  pageSize,
  data,
  columns,
  handleTableChange,
  loading,
  isMobile,
  handlePageChange,
  handleColumnChange,
  lastSyncTime
}) => {
  const getColumnMenu = useMemo(() => ({
    items: (searchableColumns || []).map(column => ({
      key: column.key,
      label: column.label,
    })),
    onClick: ({ key }) => handleColumnChange(tabType, key),
    selectedKeys: [searchColumn]
  }), [searchableColumns, searchColumn, handleColumnChange]);

  const mobileExpandableConfig = useMemo(() => isMobile ? {
    expandedRowRender: (record) => (
      <div className="text-xs space-y-1">
        <div><b>ID:</b> {record.id}</div>
        <div><b>Action:</b> {record.action}</div>
        <div><b>Action Date:</b> {record.action_date}</div>
        <div><b>Item ID:</b> {record.item_id}</div>
        {tabType === 'added' || tabType === 'deleted' ? (
          <>
            <div><b>Type:</b> {record.type}</div>
            <div><b>Brand:</b> {record.brand}</div>
            <div><b>Quantity:</b> {record.quantity}</div>
            <div><b>Remarks:</b> {record.remarks}</div>
            <div><b>Serial Number:</b> {record.serial_number}</div>
            <div><b>Issued Date:</b> {record.issued_date}</div>
            <div><b>Purchased Date:</b> {record.purchase_date}</div>
            <div><b>Condition:</b> {record.condition}</div>
            <div><b>Location:</b> {record.location}</div>
            <div><b>Status:</b> {record.status}</div>
          </>
        ) : (
          <div>
            <b>Field Changed:</b>{" "}
            {Array.isArray(record.field_changed)
              ? record.field_changed.join(', ')
              : typeof record.field_changed === 'string'
                ? record.field_changed.split(/[,|;]/).map(s => s.trim()).filter(Boolean).join(', ')
                : ''}
          </div>
        )}
      </div>
    ),
    rowExpandable: () => true,
  } : undefined, [isMobile, tabType]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <Dropdown menu={getColumnMenu} trigger={['click']} className="border-black theme-aware-dropdown-btn text-xs sm:block hidden">
          <Button
            type="text"
            size="small"
            className="flex items-center"
          >
            <FilterOutlined className="text-xs" />
            <span>
              {searchableColumns.find(col => col.key === searchColumn)?.label || 'All Columns'}
            </span>
            <DownOutlined className="align-middle ml-1" />
          </Button>
        </Dropdown>
        <Input
          placeholder={`Search in ${searchColumn === 'all' ? 'all columns' : searchableColumns.find(col => col.key === searchColumn)?.label}`}
          prefix={<SearchOutlined style={{ color: "black" }} />}
          value={searchTerm}
          onChange={(e) => handleSearch(tabType, e)}
          className="border border-black w-auto ml-1 text-xs h-6"
          maxLength={1000}
          showCount={false}
          allowClear
        />
        <div className="flex justify-center gap-2">
          <Button
            onClick={refreshHistory}
            className="custom-button w-auto text-xs"
            type="default"
            size="small"
            icon={<ReloadOutlined />}
          >
            <span className="text-xs">Refresh</span>
          </Button>
          <Button
            onClick={() => handleExportOpen(tabType)}
            className="custom-button w-auto text-xs"
            type="default"
            size="small"
            icon={<DownloadOutlined />}
          >
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </div>
      <div className="w-auto overflow-x-auto">
        <Table
          rowSelection={getRowSelection(tabType)}
          rowKey="id"
          dataSource={filterActive ? localFilteredData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          ) : data.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          columns={columns}
          bordered
          pagination={false}
          onChange={(pagination, filters, sorter) => handleTableChange(tabType, pagination, filters, sorter)}
          scroll={{ x: "max-content", y: 620 }}
          loading={loading}
          responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
          expandable={mobileExpandableConfig}
          className="text-xs"
        />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <div className="w-full flex flex-col items-center sm:items-start">
          <Typography.Text className="w-full text-xs text-nowrap text-center sm:text-left overflow-auto"
            style={{ color: '#072C1C' }}>
            Showing {(filterActive ? localFilteredData : data).length > 0
              ? (currentPage - 1) * pageSize + 1
              : 0} to{" "}
            {Math.min(
              currentPage * pageSize,
              (filterActive ? localFilteredData : data).length
            )}{" "}
            of {(filterActive ? localFilteredData : data).length} entries
          </Typography.Text>
          {lastSyncTime && (
            <div className="text-xs text-gray-500 mt-1 text-center sm:text-left">
              Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="w-full flex justify-center sm:justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={(filterActive ? localFilteredData : data).length}
            showSizeChanger
            pageSizeOptions={['10', '20', '30', '50', '100', '200', '500', '1000', '2000']}
            onChange={(page, pageSize) => handlePageChange(tabType, page, pageSize)}
            responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
            className="text-xs"
          />
        </div>
      </div>
    </>
  );
});

const HistoryTable = ({ historyData, processedData, loading, error, onRefresh, lastSyncTime }) => {
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportDataType, setExportDataType] = useState('added');
  const [activeTab, setActiveTab] = useState('1');
  
  const {
    isMobile,
    modalVisible,
    setModalVisible,
    selectedRecord,
    searchTerms,
    currentPages,
    pageSizes,
    searchColumns,
    localFilteredData,
    filterActive,
    searchableColumns,
    addedData,
    updatedData,
    deletedData,
    handleSearch,
    handleColumnChange,
    resetTab,
    handlePageChange,
    handleTableChange,
    showModal,
    refreshHistory,
    selectedRowKeys,
    getRowSelection,
  } = useHistoryTable(historyData, processedData, loading, onRefresh);

  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  const handleExportOpen = useCallback((type) => {
    setExportDataType(type);
    setIsExportModalVisible(true);
    logUserActivity(`Exported ${type} history`, `Opened export modal for ${type} history`);
    logUserNotification('Export Action', `Opened export modal for ${type} history`);
  }, [logUserActivity, logUserNotification]);

  const stableShowModal = useCallback((record) => {
    showModal(record);
  }, [showModal]);

  const addedColumns = useMemo(() => 
    getColumns(stableShowModal, "Added"), 
    [stableShowModal]
  );

  const updatedColumns = useMemo(() => 
    getColumns(stableShowModal, "Updated"), 
    [stableShowModal]
  );

  const deletedColumns = useMemo(() => 
    getColumns(stableShowModal, "Deleted"), 
    [stableShowModal]
  );

  const getCurrentTabData = useCallback(() => {
    switch (activeTab) {
      case '1':
        return {
          tabType: 'added',
          searchColumn: searchColumns.added,
          searchableColumns: searchableColumns.added,
          searchTerm: searchTerms.added,
          filterActive: filterActive.added,
          localFilteredData: localFilteredData.added,
          currentPage: currentPages.added,
          pageSize: pageSizes.added,
          data: addedData,
          columns: addedColumns,
          totalEntries: addedData.length
        };
      case '2':
        return {
          tabType: 'updated',
          searchColumn: searchColumns.updated,
          searchableColumns: searchableColumns.updated,
          searchTerm: searchTerms.updated,
          filterActive: filterActive.updated,
          localFilteredData: localFilteredData.updated,
          currentPage: currentPages.updated,
          pageSize: pageSizes.updated,
          data: updatedData,
          columns: updatedColumns,
          totalEntries: updatedData.length
        };
      case '3':
        return {
          tabType: 'deleted',
          searchColumn: searchColumns.deleted,
          searchableColumns: searchableColumns.deleted,
          searchTerm: searchTerms.deleted,
          filterActive: filterActive.deleted,
          localFilteredData: localFilteredData.deleted,
          currentPage: currentPages.deleted,
          pageSize: pageSizes.deleted,
          data: deletedData,
          columns: deletedColumns,
          totalEntries: deletedData.length
        };
      default:
        return {
          tabType: 'added',
          searchColumn: searchColumns.added,
          searchableColumns: searchableColumns.added,
          searchTerm: searchTerms.added,
          filterActive: filterActive.added,
          localFilteredData: localFilteredData.added,
          currentPage: currentPages.added,
          pageSize: pageSizes.added,
          data: addedData,
          columns: addedColumns,
          totalEntries: addedData.length
        };
    }
  }, [
    activeTab, searchColumns, searchableColumns, searchTerms, filterActive, 
    localFilteredData, currentPages, pageSizes, addedData, updatedData, 
    deletedData, addedColumns, updatedColumns, deletedColumns
  ]);

  const currentTabData = getCurrentTabData();

  const tabItems = useMemo(() => [
    {
      key: "1",
      label: <span className="text-xs">Added</span>,
    },
    {
      key: "2",
      label: <span className="text-xs">Updated / QRCode Update</span>,
    },
    {
      key: "3",
      label: <span className="text-xs">Deleted</span>,
    },
  ], []);

  const exportModalProps = useMemo(() => ({
    visible: isExportModalVisible,
    onClose: () => setIsExportModalVisible(false),
    data:
      exportDataType === 'added' ? addedData :
      exportDataType === 'updated' ? updatedData :
      deletedData,
    filteredData:
      exportDataType === 'added' ? (filterActive.added ? localFilteredData.added : null) :
      exportDataType === 'updated' ? (filterActive.updated ? localFilteredData.updated : null) :
      (filterActive.deleted ? localFilteredData.deleted : null),
    selectedData:
      exportDataType === 'added' ? (selectedRowKeys.added.length > 0 ? addedData.filter(item => selectedRowKeys.added.includes(item.id)) : null) :
      exportDataType === 'updated' ? (selectedRowKeys.updated.length > 0 ? updatedData.filter(item => selectedRowKeys.updated.includes(item.id)) : null) :
      (selectedRowKeys.deleted.length > 0 ? deletedData.filter(item => selectedRowKeys.deleted.includes(item.id)) : null),
    dataType: 'history',
    title: `Export ${exportDataType.charAt(0).toUpperCase() + exportDataType.slice(1)} History`,
    columns: getColumns(() => {}, exportDataType.charAt(0).toUpperCase() + exportDataType.slice(1), '').map(col => ({ key: col.dataIndex || col.key, label: col.title }))
  }), [isExportModalVisible, exportDataType, addedData, updatedData, deletedData, filterActive, localFilteredData, selectedRowKeys, getColumns]);

  return (
    <Card
      title={<span className="text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center">HISTORY</span>}
      className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none"
    >
      <Tabs
        className="custom-tabs"
        defaultActiveKey="1"
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={tabItems}
      />
      
      <SearchContext.Provider value={currentTabData.searchTerm}>
        <TableContent
          tabType={currentTabData.tabType}
          searchColumn={currentTabData.searchColumn}
          searchableColumns={currentTabData.searchableColumns}
          searchTerm={currentTabData.searchTerm}
          handleSearch={handleSearch}
          resetTab={resetTab}
          refreshHistory={refreshHistory}
          handleExportOpen={handleExportOpen}
          getRowSelection={getRowSelection}
          filterActive={currentTabData.filterActive}
          localFilteredData={currentTabData.localFilteredData}
          currentPage={currentTabData.currentPage}
          pageSize={currentTabData.pageSize}
          data={currentTabData.data}
          columns={currentTabData.columns}
          showModal={showModal}
          handleTableChange={handleTableChange}
          loading={loading}
          isMobile={isMobile}
          handlePageChange={handlePageChange}
          totalEntries={currentTabData.totalEntries}
          handleColumnChange={handleColumnChange}
          lastSyncTime={lastSyncTime}
        />
      </SearchContext.Provider>

      <HistoryModal visible={modalVisible} onClose={() => setModalVisible(false)} record={selectedRecord} />
      <ExportModal {...exportModalProps} />
    </Card>
  );
};

export default HistoryTable;
