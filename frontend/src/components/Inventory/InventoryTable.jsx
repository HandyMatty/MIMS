import { useInventoryTable } from '../../hooks/useInventoryTable';
import { Table, Select, Input, Button, Typography, Pagination, Tooltip, Card, Tabs, Dropdown, Space } from 'antd';
import { SearchOutlined, DeleteOutlined, PlusCircleOutlined, ReloadOutlined, DownOutlined, FilterOutlined } from '@ant-design/icons';
import AddItemModal from './AddItemModal'; 
import EditItemModal from './EditItemModal';
import { columns } from './inventoryTableColumns';
import { useState, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useMediaQuery } from 'react-responsive';

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
    editingItem,
    isLoading,
    activeTab,
    isAdmin,
    userRole,
    paginatedData,
    totalEntries,
    handlePageChange,
    handleSortOrderChange,
    handleTableChange,
    handleAddItem,
    handleEdit,
    handleEditItem,
    handleBatchDelete,
    handleTabChange,
    handleReset,
    rowSelection,
    dataSource,
  } = useInventoryTable();

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

  const resetAll = useCallback(() => {
    handleReset();
    setSearchColumn('all');
    setFilterActive(false);
    setTableKey(prevKey => prevKey + 1);
  }, [handleReset]);

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


const menuItems = useMemo(() => 
  searchableColumnsForTab.map(column => ({
    key: column.key,
    label: column.label,
  })), [searchableColumnsForTab]);


  const getTabContent = (tabKey) => (
    <div className="w-auto overflow-x-auto">
      <Table
        key={`table-${tableKey}-${tabKey}`}
        rowSelection={rowSelection}
        rowKey="id"
        dataSource={filteredData}
        columns={columns(handleEdit, sortOrder, userRole, tabKey, searchText)}
        pagination={false}
        bordered
        onChange={handleTableChange}
        scroll={{ x: "max-content", y: 600 }}
        loading={isLoading}
        responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
        expandable={ isMobile ?{ 
          expandedRowRender: (record) => (
            <div className="text-xs space-y-1">
              <div><b>ID:</b> {record.id}</div>
              <div><b>Type:</b> {record.type}</div>
              <div><b>Brand:</b> {record.brand}</div>
              <div><b>Quantity:</b> {record.quantity}</div>
              <div><b>Remarks:</b> {record.remarks}</div>
              <div><b>Serial Number:</b> {record.serialNumber}</div>
              {(tabKey === 'default' || tabKey === 'issuedDate') && (

              <div><b>Issued Date:</b> {record.issuedDate || 'NO DATE'}</div>
              )}
              {(tabKey === 'default' || tabKey === 'purchaseDate') && (
              <div><b>Purchased Date:</b> {record.purchaseDate || 'NO DATE'}</div>
              )}
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
  );

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
      </div>
      <div className="hidden sm:block">
        <Tabs
          defaultActiveKey="default"
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          tabBarGutter={4}
          moreIcon={null}
          items={tabOptions.map(tab => ({
            key: tab.key,
            label: <span className="text-xs">{tab.label}</span>,
            children: null,
          }))}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-2 mt-2 w-full">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full sm:w-auto">
              <Dropdown
                className='border-black bg-[#a7f3d0] hidden sm:block'
                menu={{
                  items: menuItems.map(item => ({
                    ...item,
                    label: (
                      <span className="break-words whitespace-normal text-xs">
                        {item.label}
                      </span>
                    ),
                  })),
                  onClick: ({ key }) => setSearchColumn(key),
                  selectedKeys: [searchColumn],
                }}
                trigger={['click']}
              >
                <Button
                  type="text"
                  className="border-black w-full sm:w-auto text-xs"
                  icon={<FilterOutlined />}
                >
                  <Space>
                    {searchableColumnsForTab.find(col => col.key === searchColumn)?.label || 'All Columns'}
                    <DownOutlined />
                  </Space>
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
              
              
          </div>
          <div className="flex justify-center gap-2 w-auto">
             <Tooltip
              title={<span className="text-xs">New</span>}
            >
              {(isAdmin || userRole === 'user') && (
                <Button
                  type="text"
                  icon={<PlusCircleOutlined />}
                  onClick={() => setIsModalVisible(true)}
                  className="text-xs"
                />
              )}
            </Tooltip>
            {isAdmin && (
              <Tooltip
                title={<span className="text-xs">Delete</span>}
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                  className="text-xs"
                />
              </Tooltip>
            )}
           <Button 
                onClick={resetAll}
                className="custom-button mt-1"
                type="default"
                size="small"
                icon={<ReloadOutlined  className='text-xs'/>}
              >
                <span className="text-xs">Reset</span>
              </Button>
              <Select
                defaultValue="Newest"
                className="w-auto text-xs transparent-select mt-1"
                onChange={handleSortOrderChange}
                value={sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                size="small"
              >
                <Option value="Newest"><span className="text-xs">Newest</span></Option>
                <Option value="Oldest"><span className="text-xs">Oldest</span></Option>
              </Select>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        {getTabContent(activeTab)}
      </div>
      <div className="sm:hidden">
        {getTabContent(mobileTab)}
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
        loading={isLoading} 
      />
      <EditItemModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onEdit={handleEditItem}
        item={editingItem}
        loading={isLoading}
      />
    </Card>
  );
};

export default InventoryTable;
