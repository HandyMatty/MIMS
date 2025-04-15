// InventoryTable.js
import React, { useState, useEffect } from 'react';
import { Table, Select, Input, Button, Typography, Pagination, Tooltip, Card, message, Tabs } from 'antd';
import { SearchOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import AddItemModal from './AddItemModal'; 
import EditItemModal from './EditItemModal';
import { addItemToInventory, getInventoryData, deleteItems, updateItem } from '../../services/api/addItemToInventory'; 
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth'; 
import { useUserAuthStore } from '../../store/user/useAuth'; 
import { columns } from './inventoryTableColumns'; // Import the columns here

const { Option } = Select;


const InventoryTable = () => {
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [sorterConfig, setSorterConfig] = useState({ field: 'id', order: 'descend' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [activeTab, setActiveTab] = useState('default');
  const { logUserActivity } = useActivity(); 
  const { logUserNotification } = useNotification();
  const { userData: adminUserData } = useAdminAuthStore();
  const { userData: userUserData } = useUserAuthStore();

  const username = adminUserData?.username || userUserData?.username || 'Unknown User';
  const isAdmin = !!adminUserData;
  const isUser = !!userUserData;
  const userRole = isAdmin ? 'admin' : isUser ? 'user' : 'guest'; 
  const { Text } = Typography;

  useEffect(() => {
    const fetchInventoryData = async () => {
      setIsLoading(true); 
      try {
        const data = await getInventoryData();
        if (Array.isArray(data)) {
          setDataSource(data); 
        } else {
          console.error("Received invalid data:", data);
          message.error('Failed to load inventory data.');
        }
      } catch (error) {
        message.error('Failed to load inventory data.');
      } finally {
        setIsLoading(false); 
      }
    };
  
    fetchInventoryData();
  }, []);

  const filteredData = Array.isArray(dataSource)
    ? dataSource.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : [];

  const sortedData = [...filteredData].sort((a, b) => {
    if (sorterConfig.field && sorterConfig.order) {
      const { field, order } = sorterConfig;
      if (order === 'ascend') {
        return a[field] > b[field] ? 1 : -1;
      } else if (order === 'descend') {
        return a[field] < b[field] ? 1 : -1;
      }
    }
    return 0;
  });

  const totalEntries = sortedData.length;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleSortOrderChange = (value) => {
    setSortOrder(value.toLowerCase());
    const order = value.toLowerCase() === 'newest' ? 'descend' : 'ascend';
    setSorterConfig({ field: 'id', order });
    setCurrentPage(1);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      setSorterConfig({ field: sorter.field, order: sorter.order });
    }
  };

  const handleAddItem = async (newItem) => {
    try {
      setIsLoading(true);
      const response = await addItemToInventory(newItem); 
  
      if (response && response.id) {
        message.success(`Item added successfully! ID: ${response.id}`);
        await logUserActivity(username, 'Inventory', `Added item with ID: ${response.id}`);
        await logUserNotification('Inventory Update', `You added an item with ID: ${response.id}`);
  
        const updatedData = await getInventoryData(); 
        setDataSource(updatedData); 
      } else {
        message.error('Failed to retrieve item ID.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      message.error('Failed to add item.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleEdit = (item) => {
    setEditingItem(item); 
    setIsEditModalVisible(true);
  };

  const handleEditItem = async (updatedItem) => {
    setIsLoading(true);
    try {
      const response = await updateItem({ ...updatedItem, id: editingItem?.id }); // Ensure ID is included
      if (response.message === "Item updated successfully") {
        const updatedData = await getInventoryData();
        setDataSource(updatedData);
        message.success(`Item with ID ${updatedItem.id} updated successfully!`);
        await logUserActivity(username, "Inventory", `Updated item with ID: ${updatedItem.id}`);
        await logUserNotification("Inventory Update", `You edited an item with ID: ${updatedItem.id}`);
        setIsEditModalVisible(false);
      } else {
        message.error("Failed to update item.");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      message.error("Failed to update item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleBatchDelete = async () => {
    if (!isAdmin) {
      message.error("You do not have permission to delete items.");
      return;
    }
    if (selectedRowKeys.length === 0) {
      message.warning("Please select items to delete.");
      return;
    }
    try {
      const response = await deleteItems(selectedRowKeys);
      if (response.message === "Items deleted successfully") {
        const updatedData = await getInventoryData(); 
        setDataSource(updatedData);
        setSelectedRowKeys([]);
        message.success("Items deleted successfully!");
        await logUserActivity(username, "Inventory", `Deleted item(s) with ID(s): ${selectedRowKeys.join(", ")}`);
        await logUserNotification("Inventory Update", `You deleted item(s) with ID(s): ${selectedRowKeys.join(", ")}`);
      } else {
        message.error("Error deleting items.");
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      message.error("Failed to delete items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };


  const rowSelection = isAdmin
    ? {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
      }
    : null;

  return (
    <Card title={<span className="text-5xl-6 font-bold flex justify-center">INVENTORY</span>}  className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex justify-between items-center mb-4 space-x-2 w-full">
  {/* Search Input and Add/Delete Buttons */}
  <div className="flex items-center space-x-2">
    <Input
      placeholder="Search"
      prefix={<SearchOutlined />}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      className="w-80 bg-[#a7f3d0] border border-black custom-search"
    />
    <Tooltip title="Add Item">
      {(isAdmin || userUserData) && (
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

  {/* Sorting Dropdown at the Right End */}
  <div className="ml-auto">
    <Select
      defaultValue="Newest"
      className="w-32 transparent-select"
      onChange={handleSortOrderChange}
    >
      <Option value="Newest">Newest</Option>
      <Option value="Oldest">Oldest</Option>
    </Select>
  </div>
</div>

<Tabs
  defaultActiveKey="default"
  onChange={handleTabChange}
  type="card"
  items={[
    {
      key: 'default',
      label: 'Default',
      children: (
        <div style={{ height: '680px' }}>
        <Table
          rowSelection={rowSelection}
          rowKey="id"
          dataSource={paginatedData}
          columns={columns(handleEdit, sortOrder, userRole, activeTab)}
          pagination={false}
          bordered
          onChange={handleTableChange}
          scroll={{ x: 'max-content', y: 620 }}
          loading={isLoading}
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
          rowSelection={rowSelection}
          rowKey="id"
          dataSource={paginatedData}
          columns={columns(handleEdit, sortOrder, userRole, activeTab)}
          pagination={false}
          bordered
          onChange={handleTableChange}
          scroll={{ x: 'max-content', y: 620 }}
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
          rowSelection={rowSelection}
          rowKey="id"
          dataSource={paginatedData}
          columns={columns(handleEdit, sortOrder, userRole, activeTab)}
          pagination={false}
          bordered
          onChange={handleTableChange}
          scroll={{ x: 'max-content', y: 620 }}
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
