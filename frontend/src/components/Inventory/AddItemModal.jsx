import { useState, useRef, useEffect } from 'react';
import { Modal, Form, Tabs, Typography, App } from 'antd';
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import dayjs from 'dayjs';
import { saveTemplate } from '../../services/api/saveTemplate';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import Cookies from 'js-cookie';
import NewItemForm from './NewItemForm';
import StockItemsTable from './StockItemsTable';
import StockItemForm from './StockItemForm';
import SaveTemplateModal from './SaveTemplateModal';

const { Title } = Typography;

const AddItemModal = ({ visible, onClose, onAdd, onRedistribute, handleEditItem, loading }) => {
  const [form] = Form.useForm();
  const [isHeadOffice, setIsHeadOffice] = useState(false);
  const [hasSerialNumber, setHasSerialNumber] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [onStockItems, setOnStockItems] = useState([]);
  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const [searchText, setSearchText] = useState('');
  const templateRef = useRef(null);
  const { message: messageApi } = App.useApp();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  
  const getCurrentUser = () => {
    const isAdmin = adminAuth.token && adminAuth.userData;
    const isUser = userAuth.token && userAuth.userData;

    if (isAdmin) return adminAuth.userData;
    if (isUser) return userAuth.userData;

    const username = Cookies.get('username');
    const userId = Cookies.get('user_id');
    if (username && userId) {
      return { username, id: userId };
    }

    return null;
  };

  useEffect(() => {
    if (visible) {
      fetchOnStockItems();
    }
  }, [visible]);

  const fetchOnStockItems = async () => {
    try {
      const inventory = await getInventoryData();
      const onStock = inventory.filter(item => item.status === 'On Stock');
      setOnStockItems(onStock);
    } catch (error) {
      console.error('Error fetching on stock items:', error);
    }
  };

  const handleStockItemSelect = (item) => {
    if (activeTab !== 'stock') {
      setActiveTab('stock');
    }
    
    setSelectedStockItem(item);
    
    if (item.action === 'redistribute') {
      form.setFieldsValue({
        type: item.type,
        brand: item.brand,
        originalQuantity: item.quantity,
        quantity: 1,
        condition: item.condition,
        status: item.status,
        remarks: item.remarks,
        locationType: item.location.includes('Head Office') ? 'Head Office' : 'Other',
        department: item.location.includes('Head Office') ? item.location.split(' - ')[1] : undefined,
        location: item.location.includes('Head Office') ? undefined : item.location,
        issuedDate: item.issuedDate ? dayjs(item.issuedDate) : undefined,
        purchaseDate: item.purchaseDate ? dayjs(item.purchaseDate) : undefined,
        serialNumber: item.serialNumber
      });
    } else {
      form.setFieldsValue({
        type: item.type,
        brand: item.brand,
        quantity: item.quantity,
        condition: item.condition,
        status: item.status,
        remarks: item.remarks,
        locationType: item.location.includes('Head Office') ? 'Head Office' : 'Other',
        department: item.location.includes('Head Office') ? item.location.split(' - ')[1] : undefined,
        location: item.location.includes('Head Office') ? undefined : item.location,
        issuedDate: item.issuedDate ? dayjs(item.issuedDate) : undefined,
        purchaseDate: item.purchaseDate ? dayjs(item.purchaseDate) : undefined,
        serialNumber: item.serialNumber
      });
    }
    
    setIsHeadOffice(item.location.includes('Head Office'));
    setHasSerialNumber(!!item.serialNumber);
  };

  const handleTemplateSelect = (template) => {
    if (template) {
      form.setFieldsValue({
        ...template,
        locationType: template.locationType || (template.location.includes('Head Office') ? 'Head Office' : 'Other'),
        department: template.department || (template.location.includes('Head Office') ? template.location.split(' - ')[1] : null),
        location: template.location,
        purchaseDate: template.purchaseDate ? dayjs(template.purchaseDate) : undefined,
        issuedDate: template.issuedDate ? dayjs(template.issuedDate) : undefined
      });

      setIsHeadOffice(template.locationType === 'Head Office' || template.location.includes('Head Office'));
    } else {
      form.resetFields();
      setIsHeadOffice(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (values.purchaseDate && values.purchaseDate.isAfter(dayjs())) {
        messageApi.error("Purchase date cannot be in the future.");
        return;
      }
      
      const existingInventory = await getInventoryData();
    
      if (values.serialNumber && (!selectedStockItem || values.serialNumber !== selectedStockItem.serialNumber)) {
        const serialExists = existingInventory.some(item => item.serialNumber === values.serialNumber);
        if (serialExists) {
          messageApi.error("Serial number already exists. Please use a unique serial number.");
          return;
        }
      }
      
      const formattedLocation = isHeadOffice
        ? `Head Office - ${values.department}`
        : values.location;

      if (selectedStockItem) {
        if (selectedStockItem.action === 'redistribute') {
          const currentItem = existingInventory.find(invItem => invItem.id === selectedStockItem.id);
          
          if (!currentItem) {
            messageApi.error('Item not found in inventory.');
            return;
          }

          if (currentItem.quantity === 1) {
            messageApi.warning('Cannot redistribute item with quantity of 1.');
            return;
          }

          if (!values.quantity || values.quantity <= 0 || values.quantity >= currentItem.quantity) {
            messageApi.error('New quantity must be greater than 0 and less than existing quantity.');
            return;
          }

          const payload = {
            id: currentItem.id,
            newQuantity: values.quantity,
            newLocation: formattedLocation,
            issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null,
            condition: values.condition,
            status: values.status,
            remarks: values.remarks?.trim() || null,
          };

          await onRedistribute(payload);
          
          await fetchOnStockItems();
          setSelectedStockItem(null);
          form.resetFields();
        } else {
          const itemData = {
            id: selectedStockItem.id,
            type: values.type,
            brand: values.brand,
            quantity: values.quantity,
            serialNumber: values.serialNumber || '',
            issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null, 
            purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null, 
            condition: values.condition,
            location: formattedLocation,
            status: values.status,
            remarks: values.remarks || '',
          };

          await handleEditItem(itemData, selectedStockItem);
          
          await fetchOnStockItems();
          setSelectedStockItem(null);
          form.resetFields();
        }
      } else {
        const itemData = {
          type: values.type,
          brand: values.brand,
          quantity: values.quantity,
          serialNumber: values.serialNumber,
          issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null, 
          purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null, 
          condition: values.condition,
          location: formattedLocation,
          status: values.status,
          remarks: values.remarks || null,
        };

        await onAdd(itemData);
        setLastAddedItem(values);
        const result = templateRef.current?.handleTypeChange?.(values.type);
        if (result && !result.isUserTemplate) {
          setShowSaveTemplateModal(true);
        }
        form.resetFields();
        onClose(); 
      }
    } catch (error) {
      console.error(error);
      messageApi.error('Failed to save item');
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      messageApi.error("Please enter a template name");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      messageApi.error("User not authenticated");
      return;
    }

    const values = lastAddedItem;
    const template = {
      template_name: templateName,
      type: values.type,
      brand: values.brand,
      condition: values.condition,
      status: values.status,
      quantity: values.quantity || 1,
      location: isHeadOffice ? `Head Office - ${values.department}` : values.location,
      remarks: values.remarks || '',
      serialNumber: values.serialNumber || null,
      purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null,
      issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null
    };

    try {
      const response = await saveTemplate(template);
      if (response.success) {
        messageApi.success("Template saved successfully!");
        setShowSaveTemplateModal(false);
        setTemplateName('');
        
        if (templateRef.current) {
          templateRef.current.setRefreshTrigger(prev => prev + 1);
        }

        await logUserActivity(
          currentUser.username,
          'Template Created',
          `Template "${templateName}" has been created successfully.`
        );

        await logUserNotification(
          'Template Created',
          `Template "${templateName}" has been created successfully.`
        );
      } else {
        messageApi.error(response.message || "Failed to save template");
      }
    } catch (error) {
      console.error('Error saving template:', error);
      messageApi.error("Error saving template");
    }
  };

  const handleClose = () => {
    form.resetFields(); 
    setHasSerialNumber(false); 
    setSelectedStockItem(null);
    setSearchText('');
    setActiveTab('new');
    onClose();
  };

  const handleSerialChange = (e) => {
    const value = e.target.value.trim();
    setHasSerialNumber(value !== '');
  
    if (value === '') {
      form.setFieldsValue({ quantity: 1 });
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'new') {
      form.resetFields();
      setSelectedStockItem(null);
      setHasSerialNumber(false);
      setIsHeadOffice(false);
    }
  };

  return (
    <>
      <Modal
        className='overflow-hidden'
        title={
          <div className="text-center">
            <Title level={3} className="mb-0 font-semibold">
              Inventory Management
            </Title>
            <p className="text-sm mt-1 opacity-75">Add, edit, and manage your inventory items</p>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={1400}
        styles={{
          body: { padding: 0 },
          header: { 
            borderBottom: '1px solid #f0f0f0',
            padding: '24px 24px 16px 24px',
            background: 'var(--theme-card-head-bg, #5fe7a7)',
            borderRadius: '12px 12px 0 0'
          },
          content: { borderRadius: '12px', overflow: 'hidden' }
        }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          tabBarGutter={1}
          items={[
            {
              key: 'new',
              label: (
                <div className="flex items-center">
                  <PlusCircleOutlined />
                  <span className="font-medium text-xs">New Item</span>
                </div>
              ),
              children: (
                <NewItemForm
                  form={form}
                  onFinish={handleSubmit}
                  loading={loading}
                  templateRef={templateRef}
                  onTemplateSelect={handleTemplateSelect}
                  isHeadOffice={isHeadOffice}
                  setIsHeadOffice={setIsHeadOffice}
                  hasSerialNumber={hasSerialNumber}
                  handleSerialChange={handleSerialChange}
                  selectedStockItem={selectedStockItem}
                />
              )
            },
            {
              key: 'stock',
              label: (
                <div className="flex items-center">
                  <SearchOutlined />
                  <span className="font-medium text-xs">On Stock Items</span>
                </div>
              ),
              children: (
                <>
                  <StockItemsTable
                    onStockItems={onStockItems}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    fetchOnStockItems={fetchOnStockItems}
                    loading={loading}
                    handleStockItemSelect={handleStockItemSelect}
                  />
                  
                  {selectedStockItem && (
                    <StockItemForm
                      form={form}
                      onFinish={handleSubmit}
                      loading={loading}
                      selectedStockItem={selectedStockItem}
                      isHeadOffice={isHeadOffice}
                      setIsHeadOffice={setIsHeadOffice}
                      hasSerialNumber={hasSerialNumber}
                      handleSerialChange={handleSerialChange}
                    />
                  )}
                </>
              )
            }
          ]}
        />
      </Modal>

      <SaveTemplateModal
        visible={showSaveTemplateModal}
        onCancel={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveTemplate}
        templateName={templateName}
        setTemplateName={setTemplateName}
      />
    </>
  );
};

export default AddItemModal;
