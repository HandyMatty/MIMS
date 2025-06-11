import { Table, Input, Typography, Pagination, Card, Tabs, Button, Dropdown, Space } from "antd";
import { SearchOutlined, FilterOutlined, DownOutlined, ReloadOutlined } from "@ant-design/icons";
import { getColumns } from "./HistoryTableConfig";
import HistoryModal from "./HistoryModal";
import { useHistoryTable } from "../../hooks/useHistoryTable";


const HistoryTable = () => {
  const {
    loading,
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
    resetAllFilters,
  } = useHistoryTable();

const getColumnMenu = (tab) => ({
  items: (searchableColumns[tab] || []).map(column => ({
    key: column.key,
    label: column.label,
  })),
  onClick: ({ key }) => handleColumnChange(tab, key),
  selectedKeys: [searchColumns[tab]]
});
  

  return (
    <Card
      title={<span className="text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center">HISTORY</span>}
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <Dropdown menu={getColumnMenu('added')} trigger={['click']}>
                    <Button 
                      type="text" 
                      className="border-black bg-[#a7f3d0] text-xs sm:block hidden"
                      icon={<FilterOutlined />}
                    >
                      <Space>
                        {searchableColumns.added.find(col => col.key === searchColumns.added)?.label || 'All Columns'}
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                  <Input
                    placeholder={`Search in ${searchColumns.added === 'all' ? 'all columns' : searchableColumns.added.find(col => col.key === searchColumns.added)?.label}`}
                    prefix={<SearchOutlined style={{color: "black"}} />}
                    value={searchTerms.added}
                    onChange={(e) => handleSearch('added', e)}
                    className="border border-black w-auto ml-1 text-xs"
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
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => resetAllFilters('added')}
                      className="custom-button w-auto text-xs"
                      type="default"
                      size="small"
                      icon={<ReloadOutlined />}
                    >
                      <span className="text-xs">Reset</span>
                    </Button>
                  </div>
                </div>
                <div className="w-auto overflow-x-auto">
                  <Table
                    rowKey="id"
                    dataSource={filterActive.added ? localFilteredData.added.slice(
                      (currentPages.added - 1) * pageSizes.added,
                      currentPages.added * pageSizes.added
                    ) : addedData.slice(
                      (currentPages.added - 1) * pageSizes.added,
                      currentPages.added * pageSizes.added
                    )}
                    columns={getColumns(showModal, "Added", searchTerms.added)}
                    bordered
                    pagination={false}
                    onChange={(pagination, filters, sorter) => handleTableChange("added", pagination, filters, sorter)}
                    scroll={{ x: "max-content", y: 620 }}
                    loading={loading}
                    responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
                    expandable={ isMobile ? {
                      expandedRowRender: (record) => (
                        <div className="text-xs space-y-1">
                          <div><b>ID:</b> {record.id}</div>
                          <div><b>Action:</b> {record.action}</div>
                          <div><b>Action Date:</b> {record.action_date}</div>
                          <div><b>Item ID:</b> {record.item_id}</div>
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
                        </div>
                      ),
                      rowExpandable: () => true,
                    } : undefined}
                  />
                </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
                <Typography.Text className="w-full text-xs text-nowrap text-center sm:text-left overflow-auto"
                  style={{ color: '#072C1C' }}>
                  Showing {(filterActive.added ? localFilteredData.added : addedData).length > 0
                    ? (currentPages.added - 1) * pageSizes.added + 1
                    : 0} to{" "}
                  {Math.min(
                    currentPages.added * pageSizes.added,
                    (filterActive.added ? localFilteredData.added : addedData).length
                  )}{" "}
                  of {(filterActive.added ? localFilteredData.added : addedData).length} entries
                </Typography.Text>
                 <div className="w-full flex justify-center sm:justify-end">
                  <Pagination
                    current={currentPages.added}
                    pageSize={pageSizes.added}
                    total={(filterActive.added ? localFilteredData.added : addedData).length}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '30', '50', '100', '200', '500', '1000', '2000']}
                    onChange={(page, pageSize) => handlePageChange("added", page, pageSize)}
                    responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
                    className="text-xs"
                  />
                  </div>
                </div>
              </>
            ),
          },
          {
            key: "2",
            label: "Updated / QRCode Update",
            children: (
              <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <Dropdown menu={getColumnMenu('updated')} trigger={['click']}>
                    <Button 
                      type="text" 
                      className="border-black bg-[#a7f3d0] text-xs w-auto sm:block hidden"
                      icon={<FilterOutlined />}
                    >
                      <Space>
                        {searchableColumns.updated.find(col => col.key === searchColumns.updated)?.label || 'All Columns'}
                        <DownOutlined className="text-xs"/>
                      </Space>
                    </Button>
                  </Dropdown>
                  <Input
                    placeholder={`Search in ${searchColumns.updated === 'all' ? 'all columns' : searchableColumns.updated.find(col => col.key === searchColumns.updated)?.label}`}
                    prefix={<SearchOutlined style={{color: "black"}} />}
                    value={searchTerms.updated}
                    onChange={(e) => handleSearch('updated', e)}
                    className="border border-black w-auto ml-1 text-xs"
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
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => resetAllFilters('updated')}
                      className="custom-button w-auto text-xs "
                      type="default"
                      size="small"
                      icon={<ReloadOutlined />}
                    >
                      <span className="text-xs">Reset</span>
                    </Button>
                  </div>
                </div>
                <div className="w-auto overflow-x-auto">
                  <Table
                    rowKey="id"
                    dataSource={filterActive.updated ? localFilteredData.updated.slice(
                      (currentPages.updated - 1) * pageSizes.updated,
                      currentPages.updated * pageSizes.updated
                    ) : updatedData.slice(
                      (currentPages.updated - 1) * pageSizes.updated,
                      currentPages.updated * pageSizes.updated
                    )}
                    columns={getColumns(showModal, "Updated", searchTerms.updated)}
                    bordered
                    pagination={false}
                    onChange={(pagination, filters, sorter) => handleTableChange("updated", pagination, filters, sorter)}
                    scroll={{ x: "max-content", y: 620 }}
                    loading={loading}
                                        expandable={ isMobile ?{
                      expandedRowRender: (record) => (
                        <div>
                          <div><b>ID:</b> {record.id}</div>
                          <div><b>Action:</b> {record.action}</div>
                          <div><b>Action Date:</b> {record.action_date}</div>
                          <div><b>Item ID:</b> {record.item_id}</div>
                          <div>
                            <b>Field Changed:</b>{" "}
                            {Array.isArray(record.field_changed)
                              ? record.field_changed.join(', ')
                              : typeof record.field_changed === 'string'
                                ? record.field_changed.split(/[,|;]/).map(s => s.trim()).filter(Boolean).join(', ')
                                : ''}
                          </div>
                        </div>
                      ),
                      rowExpandable: () => true,
                    } : undefined}
                  />
                </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center sm:justify-between mt-5 space-y-2 sm:space-y-0">
                  <Typography.Text className="w-full text-xs text-nowrap text-center sm:text-left"
                    style={{ color: '#072C1C' }}>
                    Showing {(filterActive.updated ? localFilteredData.updated : updatedData).length > 0 ? 
                      (currentPages.updated - 1) * pageSizes.updated + 1 : 0} to{" "}
                    {Math.min(currentPages.updated * pageSizes.updated, 
                      (filterActive.updated ? localFilteredData.updated : updatedData).length)} 
                   {" "} of {(filterActive.updated ? localFilteredData.updated : updatedData).length} entries
                  </Typography.Text>
              <div className="w-full flex justify-center sm:justify-end">
                  <Pagination
                    current={currentPages.updated}
                    pageSize={pageSizes.updated}
                    total={(filterActive.updated ? localFilteredData.updated : updatedData).length}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '30', '50', '100', '200', '500', '1000', '2000']}
                    onChange={(page, pageSize) => handlePageChange("updated", page, pageSize)}
                    className="text-xs"
                    responsive
                  />
              </div>
                </div>
              </>
            ),
          },
          {
            key: "3",
            label: "Deleted",
            children: (
              <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <Dropdown menu={getColumnMenu('deleted')} trigger={['click']}>
                    <Button 
                      type="text" 
                      className="bg-[#a7f3d0] border-black w-auto text-xs sm:block hidden"
                      icon={<FilterOutlined />}
                    >
                      <Space>
                        {searchableColumns.deleted.find(col => col.key === searchColumns.deleted)?.label || 'All Columns'}
                        <DownOutlined />
                      </Space>
                    </Button>
                  </Dropdown>
                  <Input
                    placeholder={`Search in ${searchColumns.deleted === 'all' ? 'all columns' : searchableColumns.deleted.find(col => col.key === searchColumns.deleted)?.label}`}
                    prefix={<SearchOutlined style={{color: "black"}} />}
                    value={searchTerms.deleted}
                    onChange={(e) => handleSearch('deleted', e)}
                    className="border border-black w-auto ml-1 text-xs overflow-auto"
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
                  <div className="flex justify-center">                  
                    <Button 
                      onClick={() => resetAllFilters('deleted')}
                      className="custom-button w-auto text-xs"
                      type="default"
                      size="small"
                      icon={<ReloadOutlined />}
                    >
                      <span className="text-xs">Reset</span>
                    </Button>
                  </div>
                </div>
                <div className="w-auto overflow-x-auto">
                  <Table
                    rowKey="id"
                    dataSource={filterActive.deleted ? localFilteredData.deleted.slice(
                      (currentPages.deleted - 1) * pageSizes.deleted,
                      currentPages.deleted * pageSizes.deleted
                    ) : deletedData.slice(
                      (currentPages.deleted - 1) * pageSizes.deleted,
                      currentPages.deleted * pageSizes.deleted
                    )}
                    columns={getColumns(showModal, "Deleted", searchTerms.deleted)}
                    bordered
                    pagination={false}
                    onChange={(pagination, filters, sorter) => handleTableChange("deleted", pagination, filters, sorter)}
                    scroll={{ x: "max-content", y: 620 }}
                    loading={loading}
                    className="text-xs overflow-auto"
                    expandable={ isMobile ?{
                      expandedRowRender: (record) => (
                        <div>
                          <div><b>ID:</b> {record.id}</div> 
                          <div><b>Action:</b> {record.action}</div>
                          <div><b>Action Date:</b> {record.action_date}</div>
                          <div><b>Item ID:</b> {record.item_id}</div>
                          <div><b>Type:</b> {record.type}</div>
                          <div><b>Brand:</b> {record.brand}</div>
                          <div><b>Qty:</b> {record.quantity}</div>
                          <div><b>Remarks:</b> {record.remarks}</div>
                          <div><b>Serial Number:</b> {record.serial_number}</div>
                          <div><b>Issued Date:</b> {record.issued_date}</div>
                          <div><b>Purchased Date:</b> {record.purchase_date}</div>
                          <div><b>Condition:</b> {record.condition}</div>
                          <div><b>Detachment/Office:</b> {record.location}</div>
                          <div><b>Status:</b> {record.status}</div>
                        </div> )
                    } :undefined}
                  />
                </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center sm:justify-between mt-5 space-y-2 sm:space-y-0">
                  <Typography.Text className="w-full text-xs text-nowrap text-center sm:text-left overflow-auto"
                    style={{ color: '#072C1C' }}>
                    Showing {(filterActive.deleted ? localFilteredData.deleted : deletedData).length > 0 ? 
                      (currentPages.deleted - 1) * pageSizes.deleted + 1 : 0} to{" "}
                    {Math.min(currentPages.deleted * pageSizes.deleted, 
                      (filterActive.deleted ? localFilteredData.deleted : deletedData).length)} 
                    {" "} of {(filterActive.deleted ? localFilteredData.deleted : deletedData).length} entries
                  </Typography.Text>
                  <div className="w-full flex justify-center sm:justify-end overflow-auto">
                  <Pagination
                    current={currentPages.deleted}
                    pageSize={pageSizes.deleted}
                    total={(filterActive.deleted ? localFilteredData.deleted : deletedData).length}
                    showSizeChanger
                    pageSizeOptions={['10', '20', '30', '50', '100', '200', '500', '1000', '2000']}
                    onChange={(page, pageSize) => handlePageChange("deleted", page, pageSize)}
                    className="text-xs"
                    responsive
                  />
                  </div>
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
