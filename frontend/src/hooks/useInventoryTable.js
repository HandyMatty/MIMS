import { useState, useEffect } from 'react';
import { message } from 'antd';
import { addItemToInventory, getInventoryData, deleteItems, updateItem } from '../services/api/addItemToInventory';
import { useActivity } from '../utils/ActivityContext';
import { useNotification } from '../utils/NotificationContext';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';

export const useInventoryTable = () => {
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

  const handleTableChange = (sorter) => {
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
    const original = editingItem;
    const hasChanges = Object.keys(updatedItem).some((key) => {
      const updatedValue = updatedItem[key];
      const originalValue = original[key];
      if (typeof updatedValue === "string") {
        return updatedValue.trim() !== (originalValue || "").trim();
      }
      return updatedValue !== originalValue;
    });
    if (!hasChanges) {
      message.info("No changes detected.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await updateItem({ ...updatedItem, id: editingItem?.id });
      if (response.message === "Item updated successfully") {
        const updatedData = await getInventoryData();
        setDataSource(updatedData);
        message.success(`Item with ID ${updatedItem.id} updated successfully!`);
        await logUserActivity(username, "Inventory", `Updated item with ID: ${updatedItem.id}`);
        await logUserNotification("Inventory Update", `You edited an item with ID: ${updatedItem.id}`);
        setIsEditModalVisible(false);
      } else {
        message.error(response.message || "Failed to update item.");
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

  const handleReset = () => {
    // Reset search
    setSearchText('');
    
    // Reset sorter
    setSortOrder('newest');
    setSorterConfig({ field: 'id', order: 'descend' });
    
    // Reset pagination
    setCurrentPage(1);
    setPageSize(10);
    
    // Reset selection
    setSelectedRowKeys([]);
    
    // Reset tab
    setActiveTab('default');
  };

  const rowSelection = isAdmin
    ? {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
      }
    : null;

  return {
    searchText,
    setSearchText,
    sortOrder,
    setSortOrder,
    sorterConfig,
    setSorterConfig,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    selectedRowKeys,
    setSelectedRowKeys,
    dataSource,
    setDataSource,
    isModalVisible,
    setIsModalVisible,
    isEditModalVisible,
    setIsEditModalVisible,
    editingItem,
    setEditingItem,
    isLoading,
    setIsLoading,
    activeTab,
    setActiveTab,
    username,
    isAdmin,
    isUser,
    userRole,
    filteredData,
    sortedData,
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
    setFilteredData: (filteredData) => {
      const sortedFiltered = [...filteredData].sort((a, b) => {
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
      
      setSortedData(sortedFiltered);
    },
  };
}; 