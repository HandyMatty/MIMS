import React, { useState, useEffect } from 'react';
import { Table, Select, Input, Button, Typography, Pagination, Tooltip, Tag, Card, message } from 'antd';
import { SearchOutlined, EditFilled, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import AddItemModal from './AddItemModal'; 
import EditItemModal from './EditItemModal';
import { addItemToInventory, getInventoryData, deleteItems, updateItem } from '../../services/api/addItemToInventory'; 
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth'; 
import { useUserAuthStore } from '../../store/user/useAuth'; 


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
  const { logUserActivity } = useActivity(); 
  const { logUserNotification } = useNotification();
  const { userData: adminUserData } = useAdminAuthStore();
  const { userData: userUserData } = useUserAuthStore();

  const username = adminUserData?.username || userUserData?.username || 'Unknown User';
  const isAdmin = !!adminUserData; 
  
  const { Text } = Typography;


  useEffect(() => {
    const fetchInventoryData = async () => {
      setIsLoading(true); // Start loading
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
        setIsLoading(false); // Stop loading after data is fetched
      }
    };
  
    fetchInventoryData();
  }, []);
  

  // Filter the data based on the search text
  const filteredData = Array.isArray(dataSource)
    ? dataSource.filter(item =>
        Object.values(item)
          .join(' ')
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
    : [];

  // Sorting function based on selected sorterConfig
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

  // Paginate the sorted data
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleSortOrderChange = (value) => {
    // When the dropdown changes, update the global sorterConfig to match the order
    setSortOrder(value.toLowerCase());
    const order = value.toLowerCase() === 'newest' ? 'descend' : 'ascend';
    setSorterConfig({ field: 'id', order });
    setCurrentPage(1); // Reset to the first page when sorting changes
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // Only update sorterConfig if a column sort is triggered
    if (sorter.field) {
      setSorterConfig({ field: sorter.field, order: sorter.order });
    }
  };

  const getStatusTag = (status) => {
    let color;
    switch (status) {
      case 'On Stock':
        color = 'green';
        break;
      case 'For Repair':
        color = 'volcano';
        break;
      case 'Deployed':
        color = 'blue';
        break;
      default:
        color = 'gray';
    }
    return <Tag color={color}>{status}</Tag>;
  };

  const getConditionTag = (condition) => {
    let color;
    switch (condition) {
      case 'Brand New':
        color = 'gold';
        break;
      case 'Good Condition':
        color = 'green';
        break;
      case 'Defective':
        color = 'red';
        break;
    }
    return <Tag color={color}>{condition}</Tag>
  };

  const handleAddItem = async (newItem) => {
    try {
      await addItemToInventory(newItem);
      const updatedData = await getInventoryData();
      setDataSource(updatedData); 
      const newItemWithId = updatedData.find(item => item.serialNumber === newItem.serialNumber);
      if (newItemWithId?.id) {
        message.success('Item added successfully!');
        await logUserActivity(username, 'Inventory', `Added item with ID: ${newItemWithId.id}`);
        await logUserNotification('Inventory Update', `You added an item with ID: ${newItemWithId.id}`);
      } else {
        message.error('Failed to retrieve item ID.');
      }
    } catch (error) {
      message.error('Failed to add item.');
    } finally {
      setIsLoading(false); // Stop loading after data is fetched
    }
  };
  
  const handleEdit = (item) => {
    console.log("Editing item:", item); // Debug log
    setEditingItem(item); 
    setIsEditModalVisible(true);
  };
  

  const handleEditItem = async (updatedItem) => {
    setIsLoading(true);
    try {
      console.log("Sending updated item to API:", updatedItem); // Debug log
      const response = await updateItem(updatedItem); 
      console.log("Update API response:", response); // Debug log
      
      const updatedData = await getInventoryData(); // Refresh inventory
      setDataSource(updatedData);
  
      message.success(`Item with ID ${updatedItem.id} updated successfully!`);
      await logUserActivity(username, 'Inventory', `Updated item with ID: ${updatedItem.id}`);
      await logUserNotification('Inventory Update', `You edited an item with ID: ${updatedItem.id}`);
      setIsEditModalVisible(false); // Close the modal
    } catch (error) {
      console.error("Error updating item:", error);
      message.error('Failed to update item. Please try again.');
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
        const updatedData = await getInventoryData(); // Refresh inventory
        setDataSource(updatedData);
        setSelectedRowKeys([]); // Clear selection
  
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
      setIsLoading(false); // Stop loading after data is fetched
    }
  };
  
  

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align:'center',
      width: 100,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align:'center',
      width: 120,
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      align:'center',
      width: 150,
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      align:'center',
      width: 200,
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
    },
    {
      title: 'Issued Date',
      dataIndex: 'issuedDate',
      key: 'issuedDate',
      align: 'center',
      width: 150,
      sorter: (a, b) => {
        const dateA = new Date(a.issuedDate);
        const dateB = new Date(b.issuedDate);
        if (sortOrder === 'newest') {
          return dateB - dateA; // Newest first
        } else if (sortOrder === 'oldest') {
          return dateA - dateB; // Oldest first
        }
        return 0; // Default fallback
      },
    },
    {
      title: 'Purchased Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      align: 'center',
      width: 150,
      sorter: (a, b) => {
        const dateA = new Date(a.purchaseDate);
        const dateB = new Date(b.purchaseDate);
        if (sortOrder === 'newest') {
          return dateB - dateA; // Newest first
        } else if (sortOrder === 'oldest') {
          return dateA - dateB; // Oldest first
        }
        return 0; // Default fallback
      },
    },    
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      align:'center',
      width: 120,
      render: (condition) => getConditionTag(condition),
    },
    {
      title: 'Detachment/Office',
      dataIndex: 'location',
      key: 'location',
      align:'center',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align:'center',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Action',
      key: 'action',
      align:'center',
      width: 80,
      render: (record) => (
        <>
        <Tooltip title="Edit">
          <Button
             type="text"
            icon={<EditFilled />}
            onClick={() => handleEdit(record)}
          />
          </Tooltip>
        </>
      ),
    },
  ];

  const rowSelection = isAdmin
  ? {
      selectedRowKeys,
      onChange: setSelectedRowKeys,
    }
  : null; // Non-admin users can't see or interact with row selection.


  return (
    <Card title={<span className="text-5xl-6 font-bold flex justify-center">INVENTORY</span>}  className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex justify-start items-center mb-4 space-x-2 w-full">
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

        <div className="flex-grow"></div>

        <div className="flex justify-end">
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

      <div style={{ height: '720px'}}>
        <Table
          rowSelection={rowSelection}
          rowKey="id"
          dataSource={paginatedData}
          columns={columns}
          pagination={false}
          bordered
          onChange={handleTableChange}
          scroll={{ x: 'max-content', y: 660 }}  // This should trigger scrolling
          loading={isLoading} 
        />
      </div>

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

      {/* AddItemModal integration */}
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
