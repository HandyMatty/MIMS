import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker, App, Row, Col, Card, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import dayjs from 'dayjs';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import Cookies from 'js-cookie';

const { Option } = Select;
const { Title } = Typography;

const EditItemModal = ({ visible, onClose, onEdit, item }) => {
  const [form] = Form.useForm();
  const [isHeadOffice, setIsHeadOffice] = useState(false);
  const [hasSerialNumber, setHasSerialNumber] = useState(false);
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [showQuantityWithSerial, setShowQuantityWithSerial] = useState(false);
  const [lastSerialValue, setLastSerialValue] = useState('');
  const [lastSerialModalValue, setLastSerialModalValue] = useState('');
  const [serialModalShownForCurrentInput, setSerialModalShownForCurrentInput] = useState(false);
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
    if (visible && item) {
      const isHeadOffice = item.location.includes('Head Office');
      const department = isHeadOffice ? item.location.split(' - ')[1] : null;
      
      form.setFieldsValue({
        ...item,
        locationType: isHeadOffice ? 'Head Office' : 'Other',
        department: department,
        location: isHeadOffice ? null : item.location,
        purchaseDate: item.purchaseDate && item.purchaseDate !== '0000-00-00' && item.purchaseDate !== '' ? dayjs(item.purchaseDate) : undefined,
        issuedDate: item.issuedDate && item.issuedDate !== '0000-00-00' && item.issuedDate !== '' ? dayjs(item.issuedDate) : undefined
      });
      setIsHeadOffice(isHeadOffice);
      setHasSerialNumber(!!item.serialNumber);
      setLastSerialValue(item.serialNumber || '');
      if (item.serialNumber) {
        setShowQuantityWithSerial(true);
      }
    }
  }, [visible, item, form]);

  const handleSubmit = async (values) => {
    try {
      if (values.purchaseDate && values.purchaseDate.isAfter(dayjs())) {
        messageApi.error("Purchase date cannot be in the future.");
        return;
      }
      
      const existingInventory = await getInventoryData();
    
      if (values.serialNumber && values.serialNumber !== item.serialNumber) {
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
        ...item,
        type: values.type,
        brand: values.brand,
        quantity: Math.max(1, values.quantity || 1),
        serialNumber: values.serialNumber,
        issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null, 
        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null, 
        condition: values.condition,
        location: formattedLocation,
        status: values.status,
        remarks: values.remarks || null,
      };

      onEdit(itemData);
      
      const currentUser = getCurrentUser();
      if (currentUser) {
        await logUserActivity(
          currentUser.username,
          'Item Updated',
          `Item "${itemData.type}" has been updated.`
        );

        await logUserNotification(
          'Item Updated',
          `Item "${itemData.type}" has been updated.`
        );
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setHasSerialNumber(false);
    setShowSerialModal(false);
    setShowQuantityWithSerial(false);
    setLastSerialValue('');
    setLastSerialModalValue('');
    setSerialModalShownForCurrentInput(false);
    onClose();
  };

  const onSerialChange = (e) => {
    const value = e.target.value;
    setLastSerialValue(value);
    setHasSerialNumber(value !== '');
    if (value && !showQuantityWithSerial && !serialModalShownForCurrentInput) {
      setShowSerialModal(true);
      setLastSerialModalValue(value);
      setSerialModalShownForCurrentInput(true);
    }
    if (value === '') {
      setShowQuantityWithSerial(false);
      setLastSerialModalValue('');
      setSerialModalShownForCurrentInput(false);
      form.setFieldsValue({ quantity: 1 });
    }
  };

  const handleSerialModalOk = () => {
    setShowQuantityWithSerial(true);
    setShowSerialModal(false);
  };

  const handleSerialModalCancel = () => {
    setShowQuantityWithSerial(false);
    setShowSerialModal(false);
    form.setFieldsValue({ quantity: 1 });
  };

  return (
    <>
      <Modal
        open={showSerialModal}
        onOk={handleSerialModalOk}
        onCancel={handleSerialModalCancel}
        title="Serial Number Quantity"
        okText="Yes"
        cancelText="No"
        centered
      >
        Does the item you want to edit have only 1 serial number but has many quantities?
      </Modal>
      
    <Modal
      title={
        <div className="text-center">
          <Title level={3} className="mb-0 font-semibold">
            Edit Item
          </Title>
          <p className="text-sm mt-1 opacity-75">Update item details and information</p>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={1000}
      className="custom-card"
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
      <div className="p-8 bg-gray-50">
        <Card className="shadow-lg border-0">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{
              quantity: 1,
            }}
          >
            <Row gutter={[32, 24]}>
              <Col xs={24} md={12}>
                <div className="space-y-6">
                  <Form.Item
                    label={<span className="font-semibold">Type</span>}
                    name="type"
                    rules={[{ required: true, message: 'Please select the item type!' }]}
                  >
                    <Select 
                      size="medium"
                      placeholder="Select item type"
                    >
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
                    label={<span className="font-semibold">Brand</span>}
                    name="brand"
                    rules={[{ required: true, message: 'Please input the brand!' }]}
                  >
                    <Input 
                      size="medium"
                      placeholder="Enter brand name"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold">Remarks</span>}
                    name="remarks"
                    tooltip="Optional - Leave empty if there no remarks"
                  >
                    <Input.TextArea 
                      size="medium"
                      rows={3}
                      placeholder="Enter any additional remarks"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold">Serial Number</span>}
                    name="serialNumber"
                    tooltip="Optional - Leave empty if item has no serial number"
                  >
                    <Input 
                      size="medium"
                        onChange={onSerialChange}
                      placeholder="Enter serial number (optional)"
                    />
                  </Form.Item>

                    {(!lastSerialValue || showQuantityWithSerial) && (
                    <Form.Item
                      label={<span className="font-semibold">Quantity</span>}
                      name="quantity"
                        rules={[
                          { required: true, message: 'Please input the quantity!' },
                          { 
                            validator: (_, value) => {
                              if (!value || value < 1) {
                                return Promise.reject('Quantity must be at least 1');
                              }
                              return Promise.resolve();
                            }
                          }
                        ]}
                    >
                      <Input 
                        size="medium"
                        type="number" 
                        min={1}
                        placeholder="Enter quantity"
                      />
                    </Form.Item>
                  )}

                  <Form.Item 
                    label={<span className="font-semibold">Issued Date</span>}
                    name="issuedDate"
                    tooltip="Optional - Leave empty if not issued yet"
                  >
                    <DatePicker 
                      size="medium"
                      className="w-full"
                      format="YYYY-MM-DD"
                      placeholder="Select issued date"
                    />
                  </Form.Item>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="space-y-6">
                  <Form.Item
                    label={<span className="font-semibold">Purchased Date</span>}
                    name="purchaseDate"
                    rules={[{ required: true, message: 'Please select the purchase date!' }]}
                  >
                    <DatePicker 
                      size="medium"
                      className="w-full"
                      format="YYYY-MM-DD"
                      placeholder="Select purchase date"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold">Condition</span>}
                    name="condition"
                    rules={[{ required: true, message: 'Please select the condition!' }]}
                  >
                    <Select 
                      size="medium"
                      placeholder="Select condition"
                    >
                      <Option value="Brand New">Brand New</Option>
                      <Option value="Good Condition">Good Condition</Option>
                      <Option value="Defective">Defective</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold">Detachment/Office</span>}
                    name="locationType"
                    rules={[{ required: true, message: 'Please select a location!' }]}
                  >
                    <Select
                      size="medium"
                      onChange={(value) => setIsHeadOffice(value === 'Head Office')}
                      placeholder="Select location type"
                    >
                      <Option value="Head Office">Head Office</Option>
                      <Option value="Other">Other (Specify Below)</Option>
                    </Select>
                  </Form.Item>

                  {isHeadOffice && (
                    <Form.Item
                      label={<span className="font-semibold">Department (Head Office)</span>}
                      name="department"
                      rules={[{ required: true, message: 'Please select a department!' }]}
                    >
                      <Select 
                        size="medium"
                        placeholder="Select department"
                      >
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
                      label={<span className="font-semibold">Specific Location</span>}
                      name="location"
                      rules={[{ required: true, message: 'Please input a location!' }]}
                    >
                      <Input 
                        size="medium"
                        placeholder="Enter specific location"
                      />
                    </Form.Item>
                  )}

                  <Form.Item
                    label={<span className="font-semibold">Status</span>}
                    name="status"
                    rules={[{ required: true, message: 'Please select the status!' }]}
                  >
                    <Select 
                      size="medium"
                      placeholder="Select status"
                    >
                      <Option value="On Stock">On Stock</Option>
                      <Option value="Deployed">Deployed</Option>
                      <Option value="For Repair">For Repair</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item className="mb-0">
                    <div className="flex justify-center pt-4">
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        icon={<EditOutlined />}
                        size="small"
                        style={{
                          background: 'var(--theme-card-head-bg, #5fe7a7)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px',
                          height: 'auto',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'black'
                        }}
                      >
                        Update Item
                      </Button>
                    </div>
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </Modal>
    </>
  );
};

export default EditItemModal;
