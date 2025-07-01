import { useState, useEffect } from 'react';
import { App } from 'antd';
import { addItemToInventory, getInventoryData, deleteItems, updateItem, redistributeItem } from '../services/api/addItemToInventory';
import { useActivity } from '../utils/ActivityContext';
import { useNotification } from '../utils/NotificationContext';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';
import dayjs from 'dayjs';

export const useInventoryTable = () => {
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [sorterConfig, setSorterConfig] = useState({ field: 'id', order: 'descend' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRedistributeModalVisible, setIsRedistributeModalVisible] = useState(false);
  const [redistributeItemData, setRedistributeItemData] = useState(null);
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

  // Extract the initial load logic
  const resetAndReloadTable = async () => {
    setIsLoading(true);
    setSearchText('');
    setSortOrder('newest');
    setSorterConfig({ field: 'id', order: 'descend' });
    setCurrentPage(1);
    setPageSize(10);
    setSelectedRowKeys([]);
    setActiveTab('default');
    try {
      const data = await getInventoryData();
      setDataSource(data);
    } catch (error) {
      message.error('Failed to load inventory data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    resetAndReloadTable();
  }, []);

  const handleRefresh = resetAndReloadTable;

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

  const handleRedistribute = (item) => {
    setRedistributeItemData(item);
    setIsRedistributeModalVisible(true);
  };

  const handleRedistributeItem = async (payload) => {
    setIsLoading(true);
    try {
      const response = await redistributeItem(payload);
      message.success(`Item redistributed successfully! New Item ID: ${response.new_item_id}`);
      const updatedData = await getInventoryData();
      setDataSource(updatedData);
      setIsRedistributeModalVisible(false);
      setRedistributeItemData(null);
      await logUserActivity(username, "Inventory", `Redistributed item with ID: ${payload.id} to new item ID: ${response.new_item_id}`);
      await logUserNotification("Inventory Update", `You redistributed an item with ID: ${payload.id} to new item ID: ${response.new_item_id}`);
    } catch (error) {
      const backendMessage = error?.response?.data?.message || error.message || '';
      if (backendMessage.toLowerCase().includes('quantity') && backendMessage.includes('1')) {
        message.error("You can't redistribute an item with quantity of 1.");
      } else {
        message.error('Failed to redistribute item.');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = async (updatedItem, originalItem = null) => {
    const original = originalItem || editingItem;
    const hasChanges = Object.keys(updatedItem).some((key) => {
      const updatedValue = updatedItem[key];
      const originalValue = original[key];
      
      if (key === 'issuedDate' || key === 'purchaseDate') {
        const originalDate = originalValue ? dayjs(originalValue).format('YYYY-MM-DD') : null;
        return updatedValue !== originalDate;
      }
      
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
      const response = await updateItem({ ...updatedItem, id: updatedItem?.id || editingItem?.id });
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
      if (error.response && error.response.data && error.response.data.message) {
        message.error(`Failed to update item: ${error.response.data.message}`);
      } else {
        message.error("Failed to update item. Please try again.");
      }
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
    // Remove focus from any focused element before switching tabs
    if (document.activeElement) {
      document.activeElement.blur();
    }
    setActiveTab(key);
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
    redistributeItemData,
    setRedistributeItemData,
    isRedistributeModalVisible,
    setIsRedistributeModalVisible,
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
    handleRefresh,
    rowSelection,
  };
};
