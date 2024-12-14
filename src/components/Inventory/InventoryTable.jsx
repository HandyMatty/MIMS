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

  const totalEntries = dataSource.length;
  const { Text } = Typography;


  useEffect(() => {
    const fetchInventoryData = async () => {
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

  

  const sortedData = sortOrder === 'newest' ? filteredData : [...filteredData].reverse();

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusTag = (status) => {
    let color;
    switch (status) {
      case 'Available':
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
      case 'Good':
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
    }
  };
  
   

  const handleEdit = (item) => {
    setEditingItem(item); 
    setIsEditModalVisible(true);
  };

  const handleEditItem = async (updatedItem) => {
    setIsLoading(true);
    try {
      await updateItem(updatedItem); 
      const updatedData = await getInventoryData();
      setDataSource(updatedData); 
      message.success('Item updated successfully!');
      await logUserActivity(username, 'Inventory', `Updated item with ID: ${updatedItem.id}`);
      await logUserNotification('Inventory Update', `You edited an item with ID: ${updatedItem.id}`);
    } catch (error) {
      message.error('Failed to update item.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleBatchDelete = async () => {
    const idsToDelete = selectedRowKeys.length > 0 ? selectedRowKeys : [selectedRowKeys[0]]; 
    try {
      const response = await deleteItems(idsToDelete);
      if (response.message === "Items deleted successfully") {
        const updatedData = await getInventoryData();
        setDataSource(updatedData);
        setSelectedRowKeys([]); 
        message.success('Items deleted successfully!');
        await logUserActivity(username, 'Inventory', `Deleted item(s) with ID(s): ${idsToDelete.join(', ')}`);
        await logUserNotification ( 'Inventory Update', `You deleted item(s) with ID(s): ${idsToDelete.join(', ')}`);
      } else {
        message.error('Error deleting items.');
      }
    } catch (error) {
      message.error('Failed to delete items.');
    }
  };
  

  

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align:'center',
      ellipsis: 'true',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align:'center',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      align:'center',
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      align:'center',
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      align:'center',
      sorter: (a, b) => {
        const dateA = new Date(a.date); // Convert to Date object
        const dateB = new Date(b.date);
  
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
      render: (condition) => getConditionTag(condition),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      align:'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align:'center',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Action',
      key: 'action',
      align:'center',
      render: (record) => (
        <>
        <Tooltip title="Edit">
          <Button
             type="text"
            icon={<EditFilled />}
            className="inventory-table-action-button"
            onClick={() => handleEdit(record)}
          />
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Card className="inventory-table-container w-full mx-auto bg-[#A8E1C5] rounded-xl shadow p-6 overflow-auto border-none">
      <div className='mb-5'>
        <Text className='text-5xl-6 font-semibold'>INVENTORY</Text>
      </ div>
      <div className="flex justify-start items-center mb-4 space-x-2 w-full">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-80 bg-[#a7f3d0] border border-black custom-search"
        />
        <Tooltip title="Add Item">
          <Button
            type="text"
            icon={<PlusCircleOutlined />}
            onClick={() => setIsModalVisible(true)} // Show the modal when clicked
            style={{ width: '32px', height: '32px', border: 'none', cursor: 'pointer' }}
          />
        </Tooltip>

        <Tooltip title="Delete">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchDelete}
          />
        </Tooltip>

        <div className="flex-grow"></div>

        <div className="flex justify-end">
        <Select
          defaultValue="Newest"
          className="w-32 transparent-select"
          onChange={(value) => setSortOrder(value.toLowerCase())} // Lowercase for comparison
        >
          <Option value="Newest">Newest</Option>
          <Option value="Oldest">Oldest</Option>
        </Select>

        </div>
      </div>

      <div style={{ height: '720px', overflowY: 'auto' }}>
        <Table
          rowSelection={rowSelection}
          rowKey="id"
          dataSource={paginatedData}
          columns={columns}
          pagination={false}
          bordered
        />
      </div>
      <div className="flex items-center justify-between mt-4">
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
          className="custom-pagination"
        />
      </div>

      {/* AddItemModal integration */}
      <AddItemModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)} 
        onAdd={handleAddItem} 
      />
      <EditItemModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onEdit={handleEditItem}
        item={editingItem}
        isLoading={isLoading} 
      />
    </Card>
  );
};

export default InventoryTable;
