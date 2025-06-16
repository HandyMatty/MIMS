import { useState, useRef } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker, App, Row, Col } from 'antd';
import { PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import dayjs from 'dayjs';
import AddItemTypeTemplate from './AddItemTypeTemplate';
import { saveTemplate } from '../../services/api/saveTemplate';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import Cookies from 'js-cookie';

const { Option } = Select;

const AddItemModal = ({ visible, onClose, onAdd }) => {
  const [form] = Form.useForm();
  const [isHeadOffice, setIsHeadOffice] = useState(false);
  const [hasSerialNumber, setHasSerialNumber] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const { message: messageApi } = App.useApp();
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const templateRef = useRef(null);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  
  const getCurrentUser = () => {
    const isAdmin = adminAuth.token && adminAuth.userData;
    const isUser = userAuth.token && userAuth.userData;

    if (isAdmin) return adminAuth.userData;
    if (isUser) return userAuth.userData;

    // If no auth store has user data, try cookies
    const username = Cookies.get('username');
    const userId = Cookies.get('user_id');
    if (username && userId) {
      return { username, id: userId };
    }

    return null;
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
    
      if (values.serialNumber) {
        const serialExists = existingInventory.some(item => item.serialNumber === values.serialNumber);
        if (serialExists) {
          messageApi.error("Serial number already exists. Please use a unique serial number.");
          return;
        }
      }
      
      const formattedLocation = isHeadOffice
        ? `Head Office - ${values.department}`
        : values.location;

      const itemData = {
        type: values.type,
        brand: values.brand,
        quantity: hasSerialNumber ? 1 : Math.max(1, values.quantity || 1),
        serialNumber: values.serialNumber,
        issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null, 
        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null, 
        condition: values.condition,
        location: formattedLocation,
        status: values.status,
        remarks: values.remarks || null,
      };

      onAdd(itemData);
      setLastAddedItem(values);
      
      // Check if the template is from user templates
      const result = templateRef.current?.handleTypeChange?.(values.type);
      if (result && !result.isUserTemplate) {
        setShowSaveTemplateModal(true);
      }
      
      form.resetFields();
      onClose();
    } catch (error) {
      console.error(error);
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
      created_by: currentUser.username,
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
    onClose();
  };

  const handleSerialChange = (e) => {
    const value = e.target.value.trim();
    setHasSerialNumber(value !== '');
  
    if (value !== '') {
      form.setFieldsValue({ quantity: 1 });
    } else {
      form.setFieldsValue({ quantity: 1 });
    }
  };

  return (
    <>
      <Modal
        title="Add New Item"
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            quantity: 1,
          }}
        >
          <AddItemTypeTemplate 
            ref={templateRef}
            onTemplateSelect={handleTemplateSelect} 
          />

          <Row gutter={16}>
            {/* LEFT COLUMN */}
            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: 'Please select the item type!' }]} >
                <Select>
                  <Option value="AVR">AVR</Option>
                  <Option value="Battery">Battery</Option>
                  <Option value="Biometrics">Biometrics</Option>
                  <Option value="Camera">Camera</Option>
                  <Option value="CCTV">CCTV</Option>
                  <Option value="Charger">Charger</Option>
                  <Option value="Guard Tour Chips">Guard Tour Chips</Option>
                  <Option value="Guard Tour System">Guard Tour System</Option>
                  <Option value="Headset">Headset</Option>
                  <Option value="Keyboard">Keyboard</Option>
                  <Option value="Laptop">Laptop</Option>
                  <Option value="Megaphone">Megaphone</Option>
                  <Option value="WIFI-Mesh">WIFI-Mesh</Option>
                  <Option value="Metal Detector">Metal Detector</Option>
                  <Option value="Microphone">Microphone</Option>
                  <Option value="Modem">Modem</Option>
                  <Option value="Monitor">Monitor</Option>
                  <Option value="Mouse">Mouse</Option>
                  <Option value="Others">Others</Option>
                  <Option value="Pedestal">Pedestal</Option>
                  <Option value="Podium">Podium</Option>
                  <Option value="Printer">Printer</Option>
                  <Option value="Radio">Radio</Option>
                  <Option value="Router">Router</Option>
                  <Option value="Search Stick">Search Stick</Option>
                  <Option value="Searchlight">Searchlight</Option>
                  <Option value="Smartphone">Smartphone</Option>
                  <Option value="Speaker">Speaker</Option>
                  <Option value="Switch">Switch</Option>
                  <Option value="System Unit">System Unit</Option>
                  <Option value="Under Chassis">Under Chassis</Option>
                  <Option value="UPS">UPS</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Brand"
                name="brand"
                rules={[{ required: true, message: 'Please input the brand!' }]} >
                <Input />
              </Form.Item>

              <Form.Item
                label="Remarks"
                name="remarks" >
                <Input.TextArea />
              </Form.Item>

              <Form.Item
                label="Serial Number"
                name="serialNumber" >
                <Input onChange={handleSerialChange} />
              </Form.Item>

              {!hasSerialNumber && (
                <Form.Item
                  label="Quantity"
                  name="quantity"
                  rules={[{ required: true, message: 'Please input the quantity!' }]}
                >
                  <Input type="number" min={1} />
                </Form.Item>
              )}

              <Form.Item 
                label="Issued Date" 
                name="issuedDate"
                tooltip="Optional - Leave empty if not issued yet"
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            {/* RIGHT COLUMN */}
            <Col span={12}>
              <Form.Item
                label="Purchased Date"
                name="purchaseDate"
                rules={[{ required: true, message: 'Please select the purchase date!' }]} >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                label="Condition"
                name="condition"
                rules={[{ required: true, message: 'Please select the condition!' }]} >
                <Select>
                  <Option value="Brand New">Brand New</Option>
                  <Option value="Good Condition">Good Condition</Option>
                  <Option value="Defective">Defective</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Detachment/Office"
                name="locationType"
                rules={[{ required: true, message: 'Please select a location!' }]}
              >
                <Select
                  onChange={(value) => setIsHeadOffice(value === 'Head Office')}
                >
                  <Option value="Head Office">Head Office</Option>
                  <Option value="Other">Other (Specify Below)</Option>
                </Select>
              </Form.Item>

              {isHeadOffice && (
                <Form.Item
                  label="Department (Head Office)"
                  name="department"
                  rules={[{ required: true, message: 'Please select a department!' }]}
                >
                  <Select>
                    <Option value="SOD">SOD</Option>
                    <Option value="CID">CID</Option>
                    <Option value="GAD">GAD</Option>
                    <Option value="HRD">HRD</Option>
                    <Option value="AFD">AFD</Option>
                    <Option value="EOD">EOD</Option>
                    <Option value="BDO">BDO</Option>
                  </Select>
                </Form.Item>
              )}

              {!isHeadOffice && (
                <Form.Item
                  label="Specific Location"
                  name="location"
                  rules={[{ required: true, message: 'Please input a location!' }]}
                >
                  <Input />
                </Form.Item>
              )}

              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select the status!' }]} >
                <Select>
                  <Option value="On Stock">On Stock</Option>
                  <Option value="Deployed">Deployed</Option>
                  <Option value="For Repair">For Repair</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Row justify="center">
                  <Col>
                    <Button type="primary" htmlType="submit" icon={<PlusCircleOutlined />}>
                      Add Item
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Save as Template"
        open={showSaveTemplateModal}
        onCancel={() => setShowSaveTemplateModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowSaveTemplateModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={handleSaveTemplate}
            icon={<SaveOutlined />}
          >
            Save Template
          </Button>
        ]}
      >
        <p>Would you like to save this item as a template for future use?</p>
        <Form.Item
          label="Template Name"
          required
          tooltip="Enter a unique name for this template"
        >
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
        </Form.Item>
      </Modal>
    </>
  );
};

export default AddItemModal;
