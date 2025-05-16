import { useInventoryTable } from '../../hooks/useInventoryTable';
import { Table, Select, Input, Button, Typography, Pagination, Tooltip, Card, Tabs, Dropdown, Menu, Space } from 'antd';
import { SearchOutlined, DeleteOutlined, PlusCircleOutlined, ReloadOutlined, DownOutlined, FilterOutlined } from '@ant-design/icons';
import AddItemModal from './AddItemModal'; 
import EditItemModal from './EditItemModal';
import { columns } from './inventoryTableColumns';
import { useState, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';

const { Option } = Select;

const InventoryTable = () => {
  const [tableKey, setTableKey] = useState(0);
  const [searchColumn, setSearchColumn] = useState('all');
  const [localFilteredData, setLocalFilteredData] = useState([]);
  const [filterActive, setFilterActive] = useState(false);
  
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
    setFilteredData,
    dataSource,
  } = useInventoryTable();

  // Memoize filtered data
  const filteredData = useMemo(() => {
    if (!filterActive) return paginatedData;
    return localFilteredData;
  }, [filterActive, localFilteredData, paginatedData]);

  // Debounced search handler
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
  
  // Handle search with debouncing
  const handleSearch = useCallback((e) => {
    const value = e.target.value;  // Remove trim() to allow spaces
    setSearchText(value);
    debouncedSearch(value);
  }, [debouncedSearch, setSearchText]);

  const resetAll = useCallback(() => {
    handleReset();
    setSearchColumn('all');
    setFilterActive(false);
    setTableKey(prevKey => prevKey + 1);
  }, [handleReset]);
  
  const searchableColumns = useMemo(() => [
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
    { key: 'purchaseDate', label: 'Purchase Date' },
  ], []);

  // Memoize the menu items
  const menuItems = useMemo(() => 
    searchableColumns.map(column => ({
      key: column.key,
      label: column.label,
    })), [searchableColumns]);

  return (
    <Card title={<span className="text-5xl-6 font-bold flex justify-center">INVENTORY</span>}  className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex justify-between items-center mb-4 space-x-2 w-full">
        <div className="flex items-center space-x-2">
          <div className="flex bg-[#a7f3d0] border border-black rounded">
            <Dropdown menu={{ 
              items: menuItems,
              onClick: ({key}) => setSearchColumn(key), 
              selectedKeys: [searchColumn] 
            }} trigger={['click']}>
              <Button 
                type="text" 
                className="border-black"
                icon={<FilterOutlined />}
              >
                <Space>
                  {searchableColumns.find(col => col.key === searchColumn)?.label || 'All Columns'}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Input
              placeholder={`Search in ${searchColumn === 'all' ? 'all columns' : searchableColumns.find(col => col.key === searchColumn)?.label}`}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              className="bg-transparent custom-input-table w-64 border-r-black border-b-black border-t-black"
              suffix={
                searchText ? (
                  <Button 
                    type="text" 
                    size="small" 
                    onClick={() => {
                      setSearchText('');
                      setFilterActive(false);
                    }}
                  >
                    ×
                  </Button>
                ) : null
              }
            />
          </div>
          <Tooltip title="Add Item">
            {(isAdmin || userRole === 'user') && (
              <Button
                type="text"
                icon={<PlusCircleOutlined />}
                onClick={() => setIsModalVisible(true)}
                style={{ width: '32px', height: '32px', border: 'none', cursor: 'pointer' }}
              />
            )}
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              />
            </Tooltip>
          )}
        </div>
      </div>

      <Tabs
        defaultActiveKey="default"
        onChange={handleTabChange}
        type="card"
        tabBarExtraContent={
          <div className="flex items-center space-x-2">
            <Button 
              onClick={resetAll}
              className="custom-button"
              type="default"
              size="small"
              icon={<ReloadOutlined />}
            >
              Reset All
            </Button>
            <Select
              defaultValue="Newest"
              className="w-32 transparent-select"
              onChange={handleSortOrderChange}
              value={sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            >
              <Option value="Newest">Newest</Option>
              <Option value="Oldest">Oldest</Option>
            </Select>
          </div>
        }
        items={[
          {
            key: 'default',
            label: 'Default',
            children: (
              <div style={{ height: '680px' }}>
              <Table
                key={`table-${tableKey}-default`}
                rowSelection={rowSelection}
                rowKey="id"
                dataSource={filteredData}
                columns={columns(handleEdit, sortOrder, userRole, activeTab, searchText)}
                pagination={false}
                bordered
                onChange={handleTableChange}
                scroll={{ x: 1500, y: 620 }}
                loading={isLoading}
                size="middle"
                sticky
              />
              </div>
            ),
          },
          {
            key: 'issuedDate',
            label: 'Issued Date',
            children: (
              <div style={{ height: '680px' }}>
              <Table
                key={`table-${tableKey}-issued`}
                rowSelection={rowSelection}
                rowKey="id"
                dataSource={filteredData}
                columns={columns(handleEdit, sortOrder, userRole, activeTab, searchText)}
                pagination={false}
                bordered
                onChange={handleTableChange}
                scroll={{ x: 1500, y: 620 }}
                loading={isLoading}
              />
              </div>
            ),
          },
          {
            key: 'purchaseDate',
            label: 'Purchased Date',
            children: (
              <div style={{ height: '680px' }}>
              <Table
                key={`table-${tableKey}-purchased`}
                rowSelection={rowSelection}
                rowKey="id"
                dataSource={filteredData}
                columns={columns(handleEdit, sortOrder, userRole, activeTab, searchText)}
                pagination={false}
                bordered
                onChange={handleTableChange}
                scroll={{ x: 1500, y: 620 }}
                loading={isLoading}
              />
              </div>
            ),
          }, 
        ]}
      />
      <div className="flex items-center justify-between mt-10">
          <Typography.Text style={{ color: '#072C1C' }}>
            Showing data of {totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
          </Typography.Text>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalEntries}
            showSizeChanger
            pageSizeOptions={['10', '20', '30']}
            onChange={handlePageChange}
          />
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
