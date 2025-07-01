import { useInventoryTable } from '../../hooks/useInventoryTable';
import { Table, Select, Input, Button, Typography, Pagination, Tooltip, Card, Tabs, Dropdown, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, DownOutlined, FilterOutlined, ControlOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import AddItemModal from './AddItemModal'; 
import EditItemModal from './EditItemModal';
import RedistributeItemModal from './RedistributeItemModal';
import { columns } from './inventoryTableColumns';
import { useState, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useMediaQuery } from 'react-responsive';
import { handlePrint as printUtilsHandlePrint } from '../../utils/printUtils';

const { Option } = Select;

const tabOptions = [
  { key: 'default', label: 'Default' },
  { key: 'issuedDate', label: 'Issued Date' },
  { key: 'purchaseDate', label: 'Purchased Date' },
];

const InventoryTable = () => {
  const [tableKey, setTableKey] = useState(0);
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  const [mobileTab, setMobileTab] = useState('default');
  const isMobile = useMediaQuery({ maxWidth: 639 });

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
    handleBatchDelete,
    handleTabChange,
    rowSelection,
    dataSource,
    selectedRowKeys,
    handleRefresh,
  } = useInventoryTable();

  const handlePrint = () => {
    const selectedItems = dataSource.filter(item => selectedRowKeys.includes(item.id));
    if (selectedItems.length > 0) {
      printUtilsHandlePrint(selectedItems);
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

  const getColumnMenu = (tab) => ({
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
    handleRefresh();
  };

  return (
    <Card
      title={
        <span className="font-bold flex justify-center text-lgi md:text-base lg:text-lgi xl:text-xl">
          INVENTORY
        </span>
      }
      className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none"
    >
      <div className="block sm:hidden mb-4">
        <Select
          value={mobileTab}
          onChange={setMobileTab}
          className="w-full transparent-select"
          size="small"
        >
          {tabOptions.map(tab => (
            <Option key={tab.key} value={tab.key}>
              <span className='text-xs'>{tab.label}</span>
            </Option>
          ))}
        </Select>
        <div className="w-auto overflow-x-auto mt-4">
          <Table
            key={tableKey}
            rowSelection={rowSelection}
            rowKey="id"
            dataSource={filteredData}
            columns={columns(handleEdit, handleRedistribute, sortOrder, userRole, mobileTab, searchText)}
            pagination={false}
            bordered
            onChange={handleTableChange}
            scroll={{ x: "max-content", y: 600 }}
            loading={isLoading}
            responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
            expandable={{
              expandedRowRender: (record) => (
                <div className="text-xs space-y-1">
                  <div><b>ID:</b> {record.id}</div>
                  <div><b>Type:</b> {record.type}</div>
                  <div><b>Brand:</b> {record.brand}</div>
                  <div><b>Quantity:</b> {record.quantity}</div>
                  <div><b>Remarks:</b> {record.remarks}</div>
                  <div><b>Serial Number:</b> {record.serialNumber}</div>
                  {mobileTab === 'issuedDate' && <div><b>Issued Date:</b> {record.issuedDate || 'NO DATE'}</div>}
                  {mobileTab === 'purchaseDate' && <div><b>Purchased Date:</b> {record.purchaseDate || 'NO DATE'}</div>}
                  {mobileTab === 'default' && (
                    <>
                      <div><b>Issued Date:</b> {record.issuedDate || 'NO DATE'}</div>
                      <div><b>Purchased Date:</b> {record.purchaseDate || 'NO DATE'}</div>
                    </>
                  )}
                  <div><b>Condition:</b> {record.condition}</div>
                  <div><b>Detachment/Office:</b> {record.location}</div>
                  <div><b>Status:</b> {record.status}</div>
                </div>
              ),
              rowExpandable: () => true,
            }}
            className="text-xs"
          />
        </div>
      </div>
      <div className="hidden sm:block">
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
                    <Dropdown menu={getColumnMenu('default')} trigger={['click']} className="border-black text-xs sm:block hidden theme-aware-dropdown-btn">
                    <Button 
                    type="text"
                        className="flex items-center"
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
                      className="ml-1 w-auto sm:w-auto border-black text-xs"
                      suffix={
                        searchText ? (
                          <Button
                            type="text"
                            size="small"
                            onClick={() => {
                              setSearchText('');
                              setFilterActive(false);
                            }}
                            className="text-xs"
                          >
                            ×
                          </Button>
                        ) : null
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Tooltip title="Actions">
                        {(isAdmin || userRole === 'user') && (
                          <Button
                            type="text"
                            icon={<ControlOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className="text-xs"
                          />
                        )}
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Delete">
                          <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            danger
                            disabled={selectedRowKeys.length === 0}
                            onClick={handleBatchDelete}
                            className="text-xs"
                          />
                        </Tooltip>
                      )}
                      <Select
                        defaultValue="Newest"
                        className="w-auto text-xs transparent-select"
                        onChange={handleSortOrderChange}
                        size="small"
                      >
                        <Option value="Newest"><span className="text-xs">Newest</span></Option>
                        <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
                      </Select>
                      <Button 
                        onClick={handleFullRefresh} 
                        className="custom-button w-auto text-xs"
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
                        className="custom-button w-auto text-xs"
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
                    <Dropdown menu={getColumnMenu('issueddate')} trigger={['click']} className="border-black text-xs sm:block hidden theme-aware-dropdown-btn">
                    <Button 
                    type="text"
                    className="flex items-center"
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
                      className="ml-1 w-auto sm:w-auto border-black text-xs"
                      suffix={
                        searchText ? (
                          <Button
                            type="text"
                            size="small"
                            onClick={() => {
                              setSearchText('');
                              setFilterActive(false);
                            }}
                            className="text-xs"
                          >
                            ×
                          </Button>
                        ) : null
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Tooltip title="Actions">
                        {(isAdmin || userRole === 'user') && (
                          <Button
                            type="text"
                            icon={<ControlOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className="text-xs"
                          />
                        )}
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Delete">
                          <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            danger
                            disabled={selectedRowKeys.length === 0}
                            onClick={handleBatchDelete}
                            className="text-xs"
                          />
                        </Tooltip>
                      )}
                      <Select
                        defaultValue="Newest"
                        className="w-auto text-xs transparent-select"
                        onChange={handleSortOrderChange}
                        size="small"
                      >
                        <Option value="Newest"><span className="text-xs">Newest</span></Option>
                        <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
                      </Select>
                      <Button 
                        onClick={handleFullRefresh} 
                        className="custom-button w-auto text-xs"
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
                        className="custom-button w-auto text-xs"
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
                    <Dropdown menu={getColumnMenu('purchaseDate')} trigger={['click']} className="border-black text-xs sm:block hidden theme-aware-dropdown-btn">
                    <Button 
                    type="text"
                    className="flex items-center"
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
                      className="ml-1 w-auto sm:w-auto border-black text-xs"
                      suffix={
                        searchText ? (
                          <Button
                            type="text"
                            size="small"
                            onClick={() => {
                              setSearchText('');
                              setFilterActive(false);
                            }}
                            className="text-xs"
                          >
                            ×
                          </Button>
                        ) : null
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Tooltip title="Actions">
                        {(isAdmin || userRole === 'user') && (
                          <Button
                            type="text"
                            icon={<ControlOutlined />}
                            onClick={() => setIsModalVisible(true)}
                            className="text-xs"
                          />
                        )}
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Delete">
                          <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            danger
                            disabled={selectedRowKeys.length === 0}
                            onClick={handleBatchDelete}
                            className="text-xs"
                          />
                        </Tooltip>
                      )}
                      <Select
                        defaultValue="Newest"
                        className="w-auto text-xs transparent-select"
                        onChange={handleSortOrderChange}
                        size="small"
                      >
                        <Option value="Newest"><span className="text-xs">Newest</span></Option>
                        <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
                      </Select>
                      <Button 
                        onClick={handleFullRefresh} 
                        className="custom-button w-auto text-xs"
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
                        className="custom-button w-auto text-xs"
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
    </Card>
  );
};

export default InventoryTable;