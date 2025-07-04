import { useInventoryTable } from '../../hooks/useInventoryTable';
import { Table, Select, Input, Button, Typography, Pagination, Tooltip, Card, Tabs, Dropdown, Space, App } from 'antd';
import { SearchOutlined, ReloadOutlined, DownOutlined, FilterOutlined, ControlOutlined, DeleteOutlined, PrinterOutlined, ToolOutlined } from '@ant-design/icons';
import AddItemModal from './AddItemModal'; 
import EditItemModal from './EditItemModal';
import RedistributeItemModal from './RedistributeItemModal';
import BatchAddItemModal from './BatchAddItemModal';
import BatchEditItemModal from './BatchEditItemModal';
import BatchItemPickerModal from './BatchItemPickerModal';
import BatchDeleteItemModal from './BatchDeleteItemModal';
import BatchPrintItemModal from './BatchPrintItemModal';
import { columns } from './inventoryTableColumns';
import { useState, useCallback, useMemo, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useMediaQuery } from 'react-responsive';
import { handlePrint as printUtilsHandlePrint } from '../../utils/printUtils';
import batchEditItems from '../../services/api/batchEditItems';
import batchAddItems from '../../services/api/batchAddItems';
import batchDeleteItems from '../../services/api/batchDeleteItems';

const { Option } = Select;


const InventoryTable = () => {
  const { message } = App.useApp();
  const [tableKey, setTableKey] = useState(0);
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const [mobileTab] = useState('default');
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const [isBatchAddModalVisible, setIsBatchAddModalVisible] = useState(false);
  const [isBatchEditModalVisible, setIsBatchEditModalVisible] = useState(false);
  const [batchEditLoading, setBatchEditLoading] = useState(false);
  const [isBatchItemPickerVisible, setIsBatchItemPickerVisible] = useState(false);
  const [batchEditSelectedItems, setBatchEditSelectedItems] = useState([]);
  const [isBatchDeleteModalVisible, setIsBatchDeleteModalVisible] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [isBatchPrintModalVisible, setIsBatchPrintModalVisible] = useState(false);
  const [batchPrintLoading, setBatchPrintLoading] = useState(false);

  const {
    searchText,
    setSearchText,
    sortOrder,
    currentPage,
    pageSize,
    isModalVisible,
    setIsModalVisible,
    isEditModalVisible,
    setIsEditModalVisible,
    redistributeItemData,
    setRedistributeItemData,
    isRedistributeModalVisible,
    setIsRedistributeModalVisible,
    editingItem,
    isLoading,
    activeTab,
    isAdmin,
    userRole,
    paginatedData,
    totalEntries,
    handleRedistribute,
    handleRedistributeItem,
    handlePageChange,
    handleSortOrderChange,
    handleTableChange,
    handleAddItem,
    handleEdit,
    handleEditItem,
    handleTabChange,
    rowSelection,
    dataSource,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRefresh,
  } = useInventoryTable();

  useEffect(() => {
    if (!isBatchEditModalVisible) {
      setSelectedRowKeys([]);
    }
  }, [isBatchEditModalVisible, setSelectedRowKeys]);

  const handlePrint = () => {
    const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.id));
    if (selectedItems.length > 0) {
      printUtilsHandlePrint(selectedItems);
      setSelectedRowKeys([]);
    }
  };

  const filteredData = useMemo(() => {
    if (!filterActive) return paginatedData;
    return localFilteredData;
  }, [filterActive, localFilteredData, paginatedData]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value === '') {
        setFilterActive(false);
        return;
      }
      setFilterActive(true);
      const filtered = dataSource.filter(item => {
        if (!item) return false;
        if (searchColumn === 'all') {
          for (const key in item) {
            const cellValue = item[key];
            if (cellValue && String(cellValue).toLowerCase().includes(value.toLowerCase())) {
              return true;
            }
          }
          return false;
        } else {
          const cellValue = item[searchColumn];
          return cellValue && String(cellValue).toLowerCase().includes(value.toLowerCase());
        }
      });
      setLocalFilteredData(filtered);
    }, 300),
    [dataSource, searchColumn]
  );

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch, setSearchText]);

  const searchableColumnsForTab = useMemo(() => {
    const baseColumns = [
      { key: 'all', label: 'All Columns' },
      { key: 'id', label: 'ID' },
      { key: 'type', label: 'Type' },
      { key: 'brand', label: 'Brand' },
      { key: 'serialNumber', label: 'Serial Number' },
      { key: 'remarks', label: 'Remarks' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
      { key: 'condition', label: 'Condition' },
      { key: 'issuedDate', label: 'Issued Date' },
      { key: 'purchaseDate', label: 'Purchased Date' },
    ];

    const currentTab = isMobile ? mobileTab : activeTab;

    return baseColumns.filter(col => {
      if (currentTab === 'issuedDate') return col.key !== 'purchaseDate';
      if (currentTab === 'purchaseDate') return col.key !== 'issuedDate';
      return true;
    });
  }, [activeTab, mobileTab, isMobile]);

  const getColumnMenu = () => ({
    items: searchableColumnsForTab.map(column => ({
      key: column.key,
      label: (
        <span className="break-words whitespace-normal text-xs">
          {column.label}
        </span>
      ),
    })),
    onClick: ({ key }) => setSearchColumn(key),
    selectedKeys: [searchColumn]
  });

  const handleFullRefresh = () => {
    setSearchColumn('all');
    setFilterActive(false);
    setLocalFilteredData([]);
    setTableKey(prev => prev + 1);
    handleSortOrderChange('Newest');
    handleRefresh();
  };

  const handleBatchEdit = async (items) => {
    setBatchEditLoading(true);
    try {
      await batchEditItems(items);
      setIsBatchEditModalVisible(false);
      setBatchEditSelectedItems([]);
      handleFullRefresh();
    } catch (e) {
    } finally {
      setBatchEditLoading(false);
    }
  };

  const handleBatchAdd = async (items) => {
    try {

      const response = await batchAddItems(items);
      if (response && response.results) {
        const successCount = response.results.filter(r => r.success).length;
        if (successCount > 0) {
          message.success('Batch add completed successfully!');
        } else {
          message.error('Batch add failed.');
        }
      } else {
        message.error('Batch add failed.');
      }
      setIsBatchAddModalVisible(false);
      handleFullRefresh();
    } catch (e) {
      message.error('Batch add failed.');
    } finally {
    }
  };

  const handleBatchDelete = async (items) => {
    setBatchDeleteLoading(true);
    try {
      const ids = items.map(item => item.id);
      const response = await batchDeleteItems(ids);
      if (response && response.results) {
        const successCount = response.results.filter(r => r.success).length;
        if (successCount > 0) {
          message.success(`${successCount} item(s) deleted successfully!`);
        } else {
          message.error('Batch delete failed.');
        }
      } else {
        message.error('Batch delete failed.');
      }
      setIsBatchDeleteModalVisible(false);
      handleFullRefresh();
    } catch (e) {
      message.error('Batch delete failed.');
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  const handleBatchPrint = async (items) => {
    setBatchPrintLoading(true);
    try {
      printUtilsHandlePrint(items);
      setIsBatchPrintModalVisible(false);
    } catch (e) {
      message.error('Batch print failed.');
    } finally {
      setBatchPrintLoading(false);
    }
  };

  const handleBatchMenuClick = ({ key }) => {
    if (key === 'batchAdd') {
      setIsBatchAddModalVisible(true);
    } else if (key === 'batchEdit') {
      setIsBatchItemPickerVisible(true);
    } else if (key === 'batchDelete') {
      setIsBatchDeleteModalVisible(true);
    } else if (key === 'batchPrint') {
      setIsBatchPrintModalVisible(true);
    }
  };

  const batchMenuItems = [
    { key: 'batchAdd', label: 'Batch Add' },
    { key: 'batchEdit', label: <span style={{color: 'blue'}}>Batch Edit</span> },
    { key: 'batchDelete', label: <span style={{ color: 'red' }}>Batch Delete</span>, danger: true },
    { key: 'batchPrint', label: <span style={{ color: 'green' }}>Batch Print</span> },
  ];

  return (
    <Card
      title={
        <span className="font-bold flex justify-center text-lgi md:text-base lg:text-lgi xl:text-xl">
          INVENTORY
        </span>
      }
      className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none"
    >
      <div className="overflow-auto">
        <Tabs
          defaultActiveKey="default"
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          tabBarGutter={1}
          moreIcon={null}
          items={[
            {
              key: "default",
              label: <span className="text-xs">Default</span>,
              children: (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <div className={isMobile ? "flex flex-row flex-wrap gap-1 mb-2" : "flex items-center gap-2"}>
                      <Dropdown menu={getColumnMenu('default')} trigger={['click']} className={isMobile ? "border-black text-xs block theme-aware-dropdown-btn" : "border-black text-xs sm:block hidden theme-aware-dropdown-btn"}>
                        <Button 
                          type="text"
                          className={isMobile ? "flex items-center p-1 h-7 text-xs" : "flex items-center"}
                          size="small"
                        >
                          <FilterOutlined className="text-xs" />
                          <Space>
                            {searchableColumnsForTab.find(col => col.key === searchColumn)?.label || 'All Columns'}
                          </Space>
                          <DownOutlined className='align-middle ml-1' />
                        </Button>
                      </Dropdown>
                      <Input
                        placeholder={`Search in ${searchColumn === 'all' ? 'all columns' : searchableColumnsForTab.find(col => col.key === searchColumn)?.label}`}
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearch}
                        className={isMobile ? "ml-1 w-24 border-black text-xs h-7" : "ml-1 w-auto sm:w-auto border-black text-xs"}
                        size="small"
                        suffix={
                          searchText ? (
                            <Button
                              type="text"
                              size="small"
                              onClick={() => {
                                setSearchText('');
                                setFilterActive(false);
                              }}
                              className="text-xs p-0"
                            >
                              ×
                            </Button>
                          ) : null
                        }
                      />
                      <Tooltip title="Actions">
                        {(isAdmin || userRole === 'user') && (
                          <Button
                            type="text"
                            icon={<ControlOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                          />
                        )}
                      </Tooltip>
                    <Dropdown
                      menu={{
                        items: batchMenuItems,
                        onClick: handleBatchMenuClick,
                      }}
                      trigger={["click"]}
                    >
                    <Tooltip title="Batch Actions">
                          <Button
                            type="text"
                        icon={<ToolOutlined />}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                      >
                      </Button>
                        </Tooltip>
                    </Dropdown>
                      {isAdmin && (
                        <Tooltip title="Delete">
                          <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            danger
                            disabled={selectedRowKeys.length === 0}
                            onClick={handleBatchDelete}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                          />
                        </Tooltip>
                      )}
                      <Select
                        value={sortOrder}
                        className={isMobile ? "w-20 text-xs transparent-select h-7" : "w-auto text-xs transparent-select"}
                        onChange={handleSortOrderChange}
                        size="small"
                      >
                        <Option value="Newest"><span className="text-xs">Newest</span></Option>
                        <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
                      </Select>
                      <Button 
                        onClick={handleFullRefresh} 
                        className={isMobile ? "custom-button w-16 text-xs p-1 h-7" : "custom-button w-auto text-xs"}
                        type="default"
                        size="small"
                        icon={<ReloadOutlined />}
                      >
                        <span className="text-xs">Refresh</span>
                      </Button>
                      <Button
                        onClick={handlePrint}
                        icon={<PrinterOutlined />}
                        size='small'
                        className={isMobile ? "custom-button w-16 text-xs p-1 h-7" : "custom-button w-auto text-xs"}
                        disabled={!selectedRowKeys || selectedRowKeys.length === 0}
                      >
                        <span className="text-xs">Print</span>
                      </Button>
                    </div>
                  </div>
                  <div className="w-auto overflow-x-auto">
                    <Table
                      key={tableKey}
                      rowSelection={rowSelection}
                      rowKey="id"
                      dataSource={filteredData}
                      columns={columns(handleEdit, handleRedistribute, sortOrder, userRole, 'default', searchText)}
                      pagination={false}
                      bordered
                      onChange={handleTableChange}
                      scroll={{ x: "max-content", y: 600 }}
                      loading={isLoading}
                      responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
                      expandable={isMobile ? {
                        expandedRowRender: (record) => (
                          <div className="text-xs space-y-1">
                            <div><b>ID:</b> {record.id}</div>
                            <div><b>Type:</b> {record.type}</div>
                            <div><b>Brand:</b> {record.brand}</div>
                            <div><b>Quantity:</b> {record.quantity}</div>
                            <div><b>Remarks:</b> {record.remarks}</div>
                            <div><b>Serial Number:</b> {record.serialNumber}</div>
                            <div><b>Issued Date:</b> {record.issuedDate || 'NO DATE'}</div>
                            <div><b>Purchased Date:</b> {record.purchaseDate || 'NO DATE'}</div>
                            <div><b>Condition:</b> {record.condition}</div>
                            <div><b>Detachment/Office:</b> {record.location}</div>
                            <div><b>Status:</b> {record.status}</div>
                          </div>
                        ),
                        rowExpandable: () => true,
                      } : undefined}
                      className="text-xs"
                    />
                  </div>
                </>
              ),
            },
            {
              key: "issuedDate",
              label: <span className="text-xs">Issued Date</span>,
              children: (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <div className={isMobile ? "flex flex-row flex-wrap gap-1 mb-2" : "flex items-center gap-2"}>
                      <Dropdown menu={getColumnMenu('issueddate')} trigger={['click']} className={isMobile ? "border-black text-xs block theme-aware-dropdown-btn" : "border-black text-xs sm:block hidden theme-aware-dropdown-btn"}>
                        <Button 
                          type="text"
                          className={isMobile ? "flex items-center p-1 h-7 text-xs" : "flex items-center"}
                          size="small"
                        >
                          <FilterOutlined className="text-xs" />
                          <Space>
                            {searchableColumnsForTab.find(col => col.key === searchColumn)?.label || 'All Columns'}
                          </Space>
                          <DownOutlined className='align-middle ml-1' />
                        </Button>
                      </Dropdown>
                      <Input
                        placeholder={`Search in ${searchColumn === 'all' ? 'all columns' : searchableColumnsForTab.find(col => col.key === searchColumn)?.label}`}
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearch}
                        className={isMobile ? "ml-1 w-24 border-black text-xs h-7" : "ml-1 w-auto sm:w-auto border-black text-xs"}
                        size="small"
                        suffix={
                          searchText ? (
                            <Button
                              type="text"
                              size="small"
                              onClick={() => {
                                setSearchText('');
                                setFilterActive(false);
                              }}
                              className="text-xs p-0"
                            >
                              ×
                            </Button>
                          ) : null
                        }
                      />
                      <Tooltip title="Actions">
                        {(isAdmin || userRole === 'user') && (
                          <Button
                            type="text"
                            icon={<ControlOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                          />
                        )}
                      </Tooltip>
                    <Dropdown
                      menu={{
                        items: batchMenuItems,
                        onClick: handleBatchMenuClick,
                      }}
                      trigger={["click"]}
                    >
                    <Tooltip title="Batch Actions">
                          <Button
                            type="text"
                        icon={<ToolOutlined />}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                      >
                      </Button>
                        </Tooltip>
                    </Dropdown>
                      {isAdmin && (
                        <Tooltip title="Delete">
                          <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            danger
                            disabled={selectedRowKeys.length === 0}
                            onClick={handleBatchDelete}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                          />
                        </Tooltip>
                      )}
                      <Select
                        defaultValue="Newest"
                        className={isMobile ? "w-20 text-xs transparent-select h-7" : "w-auto text-xs transparent-select"}
                        onChange={handleSortOrderChange}
                        size="small"
                      >
                        <Option value="Newest"><span className="text-xs">Newest</span></Option>
                        <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
                      </Select>
                      <Button 
                        onClick={handleFullRefresh} 
                        className={isMobile ? "custom-button w-16 text-xs p-1 h-7" : "custom-button w-auto text-xs"}
                        type="default"
                        size="small"
                        icon={<ReloadOutlined />}
                      >
                        <span className="text-xs">Refresh</span>
                      </Button>
                      <Button
                        onClick={handlePrint}
                        icon={<PrinterOutlined />}
                        size='small'
                        className={isMobile ? "custom-button w-16 text-xs p-1 h-7" : "custom-button w-auto text-xs"}
                        disabled={!selectedRowKeys || selectedRowKeys.length === 0}
                      >
                        <span className="text-xs">Print</span>
                      </Button>
                    </div>
                  </div>
                  <div className="w-auto overflow-x-auto">
                    <Table
                      key={tableKey}
                      rowSelection={rowSelection}
                      rowKey="id"
                      dataSource={filteredData}
                      columns={columns(handleEdit, handleRedistribute, sortOrder, userRole, 'issuedDate', searchText)}
                      pagination={false}
                      bordered
                      onChange={handleTableChange}
                      scroll={{ x: "max-content", y: 600 }}
                      loading={isLoading}
                      responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
                      expandable={isMobile ? {
                        expandedRowRender: (record) => (
                          <div className="text-xs space-y-1">
                            <div><b>ID:</b> {record.id}</div>
                            <div><b>Type:</b> {record.type}</div>
                            <div><b>Brand:</b> {record.brand}</div>
                            <div><b>Quantity:</b> {record.quantity}</div>
                            <div><b>Remarks:</b> {record.remarks}</div>
                            <div><b>Serial Number:</b> {record.serialNumber}</div>
                            <div><b>Issued Date:</b> {record.issuedDate || 'NO DATE'}</div>
                            <div><b>Condition:</b> {record.condition}</div>
                            <div><b>Detachment/Office:</b> {record.location}</div>
                            <div><b>Status:</b> {record.status}</div>
                          </div>
                        ),
                        rowExpandable: () => true,
                      } : undefined}
                      className="text-xs"
                    />
                  </div>
                </>
              ),
            },
            {
              key: "purchaseDate",
              label: <span className="text-xs">Purchased Date</span>,
              children: (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <div className={isMobile ? "flex flex-row flex-wrap gap-1 mb-2" : "flex items-center gap-2"}>
                      <Dropdown menu={getColumnMenu('purchaseDate')} trigger={['click']} className={isMobile ? "border-black text-xs block theme-aware-dropdown-btn" : "border-black text-xs sm:block hidden theme-aware-dropdown-btn"}>
                        <Button 
                          type="text"
                          className={isMobile ? "flex items-center p-1 h-7 text-xs" : "flex items-center"}
                          size="small"
                        >
                          <FilterOutlined className="text-xs" />
                          <Space>
                            {searchableColumnsForTab.find(col => col.key === searchColumn)?.label || 'All Columns'}
                          </Space>
                          <DownOutlined className='align-middle ml-1' />
                        </Button>
                      </Dropdown>
                      <Input
                        placeholder={`Search in ${searchColumn === 'all' ? 'all columns' : searchableColumnsForTab.find(col => col.key === searchColumn)?.label}`}
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearch}
                        className={isMobile ? "ml-1 w-24 border-black text-xs h-7" : "ml-1 w-auto sm:w-auto border-black text-xs"}
                        size="small"
                        suffix={
                          searchText ? (
                            <Button
                              type="text"
                              size="small"
                              onClick={() => {
                                setSearchText('');
                                setFilterActive(false);
                              }}
                              className="text-xs p-0"
                            >
                              ×
                            </Button>
                          ) : null
                        }
                      />
                      <Tooltip title="Actions">
                        {(isAdmin || userRole === 'user') && (
                          <Button
                            type="text"
                            icon={<ControlOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                          />
                        )}
                      </Tooltip>
                    <Dropdown
                      menu={{
                        items: batchMenuItems,
                        onClick: handleBatchMenuClick,
                      }}
                      trigger={["click"]}
                    >
                    <Tooltip title="Batch Actions">
                          <Button
                            type="text"
                        icon={<ToolOutlined />}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                      >
                      </Button>
                        </Tooltip>
                    </Dropdown>
                      {isAdmin && (
                        <Tooltip title="Delete">
                          <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            danger
                            disabled={selectedRowKeys.length === 0}
                            onClick={handleBatchDelete}
                            className={isMobile ? "text-xs p-1 h-7" : "text-xs"}
                            size="small"
                          />
                        </Tooltip>
                      )}
                      <Select
                        defaultValue="Newest"
                        className={isMobile ? "w-20 text-xs transparent-select h-7" : "w-auto text-xs transparent-select"}
                        onChange={handleSortOrderChange}
                        size="small"
                      >
                        <Option value="Newest"><span className="text-xs">Newest</span></Option>
                        <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
                      </Select>
                      <Button 
                        onClick={handleFullRefresh} 
                        className={isMobile ? "custom-button w-16 text-xs p-1 h-7" : "custom-button w-auto text-xs"}
                        type="default"
                        size="small"
                        icon={<ReloadOutlined />}
                      >
                        <span className="text-xs">Refresh</span>
                      </Button>
                      <Button
                        onClick={handlePrint}
                        icon={<PrinterOutlined />}
                        size='small'
                        className={isMobile ? "custom-button w-16 text-xs p-1 h-7" : "custom-button w-auto text-xs"}
                        disabled={!selectedRowKeys || selectedRowKeys.length === 0}
                      >
                        <span className="text-xs">Print</span>
                      </Button>
                    </div>
                  </div>
                  <div className="w-auto overflow-x-auto">
                    <Table
                      key={tableKey}
                      rowSelection={rowSelection}
                      rowKey="id"
                      dataSource={filteredData}
                      columns={columns(handleEdit, handleRedistribute, sortOrder, userRole, 'purchaseDate', searchText)}
                      pagination={false}
                      bordered
                      onChange={handleTableChange}
                      scroll={{ x: "max-content", y: 600 }}
                      loading={isLoading}
                      responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
                      expandable={isMobile ? {
                        expandedRowRender: (record) => (
                          <div className="text-xs space-y-1">
                            <div><b>ID:</b> {record.id}</div>
                            <div><b>Type:</b> {record.type}</div>
                            <div><b>Brand:</b> {record.brand}</div>
                            <div><b>Quantity:</b> {record.quantity}</div>
                            <div><b>Remarks:</b> {record.remarks}</div>
                            <div><b>Serial Number:</b> {record.serialNumber}</div>
                            <div><b>Purchased Date:</b> {record.purchaseDate || 'NO DATE'}</div>
                            <div><b>Condition:</b> {record.condition}</div>
                            <div><b>Detachment/Office:</b> {record.location}</div>
                            <div><b>Status:</b> {record.status}</div>
                          </div>
                        ),
                        rowExpandable: () => true,
                      } : undefined}
                      className="text-xs"
                    />
                  </div>
                </>
              ),
            },
          ]}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <Typography.Text className="w-full text-xs text-nowrap text-center sm:text-left overflow-auto"
          style={{ color: '#072C1C' }}>
          Showing data of {totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
        </Typography.Text>
        <div className="w-full flex justify-center sm:justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalEntries}
            showSizeChanger
            pageSizeOptions={['10', '20', '30', '50', '100', '200', '500', '1000', '2000']}
            onChange={handlePageChange}
            className="text-xs"
            responsive
          />
        </div>
      </div>

      <AddItemModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)} 
        onAdd={handleAddItem}
        onRedistribute={handleRedistributeItem}
        handleEditItem={handleEditItem}
        loading={isLoading} 
      />
      <EditItemModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onEdit={handleEditItem}
        item={editingItem}
        loading={isLoading}
      />
      <RedistributeItemModal
        visible={isRedistributeModalVisible}
        onClose={() => {
          setIsRedistributeModalVisible(false);
          setRedistributeItemData(null);
        }}
        onEdit={handleRedistributeItem}
        item={redistributeItemData}
        loading={isLoading}
      />
      <BatchAddItemModal
        visible={isBatchAddModalVisible}
        onClose={() => setIsBatchAddModalVisible(false)}
        onBatchAdd={handleBatchAdd}
        loading={isLoading}
      />
      <BatchItemPickerModal
        visible={isBatchItemPickerVisible}
        onClose={() => setIsBatchItemPickerVisible(false)}
        onConfirm={(items) => {
          setBatchEditSelectedItems(items);
          setIsBatchItemPickerVisible(false);
          setIsBatchEditModalVisible(true);
        }}
        loading={batchEditLoading}
      />
      <BatchEditItemModal
        visible={isBatchEditModalVisible}
        onClose={() => {
          setIsBatchEditModalVisible(false);
          setBatchEditSelectedItems([]);
        }}
        onBatchEdit={handleBatchEdit}
        loading={batchEditLoading}
        selectedItems={batchEditSelectedItems}
      />
      <BatchDeleteItemModal
        visible={isBatchDeleteModalVisible}
        onClose={() => setIsBatchDeleteModalVisible(false)}
        onConfirm={handleBatchDelete}
        loading={batchDeleteLoading}
      />
      <BatchPrintItemModal
        visible={isBatchPrintModalVisible}
        onClose={() => setIsBatchPrintModalVisible(false)}
        onConfirm={handleBatchPrint}
        loading={batchPrintLoading}
      />
    </Card>
  );
};

export default InventoryTable;