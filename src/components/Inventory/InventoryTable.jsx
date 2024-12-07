import React, { useState, useEffect } from 'react';
import { Table, Select, Input, Button, Typography, Pagination, Tooltip, Tag, Card, message } from 'antd';
import { SearchOutlined, EditFilled, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import AddItemModal from './AddItemModal'; 
import EditItemModal from './EditItemModal';
import { addItemToInventory, getInventoryData, deleteItems, updateItem } from '../../services/api/addItemToInventory'; 


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


  const totalEntries = dataSource.length;

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

  const handleAddItem = async (newItem) => {
    try {
      await addItemToInventory(newItem);
      const updatedData = await getInventoryData();
      setDataSource(updatedData); 
      message.success('Item added successfully!');
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
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
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
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Action',
      key: 'action',
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
