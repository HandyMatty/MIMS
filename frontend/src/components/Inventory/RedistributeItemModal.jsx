import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message, DatePicker, Row, Col, Card, Typography } from 'antd';
import { CopyFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import Cookies from 'js-cookie';

const { Option } = Select;
const { Title } = Typography;

const RedistributeItemModal = ({ visible, onClose, item, onEdit, isLoading }) => {
  const [form] = Form.useForm();
  const [isHeadOffice, setIsHeadOffice] = useState(false);
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
      const isHeadOfficeLocation = item.location?.includes('Head Office');
      setIsHeadOffice(isHeadOfficeLocation);

      let locationType = 'Other';
      let department = undefined;
      let specificLocation = undefined;

      if (isHeadOfficeLocation) {
        locationType = 'Head Office';
        const parts = item.location.split(' - ');
        if (parts.length > 1) {
          department = parts[1];
        }
      } else {
        specificLocation = item.location;
      }

      form.setFieldsValue({
        type: item.type,
        brand: item.brand,
        originalQuantity: item.quantity,
        quantity: 1,
        condition: item.condition,
        status: item.status,
        remarks: item.remarks,
        locationType: locationType,
        department: department,
        location: specificLocation,
        issuedDate: item.issuedDate ? dayjs(item.issuedDate) : undefined
      });
    }
  }, [visible, item, form]);

  const handleSubmit = async (values) => {
    try {
      if (!item) return;

      const currentInventory = await getInventoryData();
      const currentItem = currentInventory.find(invItem => invItem.id === item.id);

      if (!currentItem) {
        message.error('Item not found in inventory.');
        return;
      }

      if (currentItem.quantity === 1) {
        message.warning('Cannot redistribute item with quantity of 1.');
        return;
      }

      if (!values.quantity || values.quantity <= 0 || values.quantity >= currentItem.quantity) {
        message.error('New quantity must be greater than 0 and less than existing quantity.');
        return;
      }

      const formattedLocation = values.locationType === 'Head Office'
        ? `Head Office - ${values.department}`
        : values.location;

      const formattedIssuedDate = values.issuedDate
        ? dayjs(values.issuedDate).format("YYYY-MM-DD")
        : null;

      const payload = {
        id: currentItem.id,
        newQuantity: values.quantity,
        newLocation: formattedLocation,
        issuedDate: formattedIssuedDate,
        condition: values.condition,
        status: values.status,
        remarks: values.remarks?.trim() || null,
      };

      await onEdit(payload);

      const currentUser = getCurrentUser();
      if (currentUser) {
        await logUserActivity(
          currentUser.username,
          'Item Redistributed',
          `Item "${currentItem.type}" has been redistributed to ${formattedLocation} with quantity ${values.quantity}.`
        );

        await logUserNotification(
          'Item Redistributed',
          `Item "${currentItem.type}" has been redistributed to ${formattedLocation} with quantity ${values.quantity}.`
        );
      }

      form.resetFields();
      onClose();
    } catch (error) {
      console.error(error);
      message.error('Failed to redistribute item.');
    }
  };

  const handleClose = () => {
    form.resetFields();
    setIsHeadOffice(false);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={3} className="mb-0 font-semibold">
            Redistribute Item
          </Title>
          <p className="text-sm mt-1 opacity-75">Create a new item from existing stock</p>
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
          >
            <Row gutter={[32, 24]}>
              <Col xs={24} md={12}>
                <div className="space-y-6">
                  <Form.Item 
                    label={<span className="font-semibold">Type</span>}
                    name="type"
                    rules={[{ required: true, message: 'Type is required' }]}
                  >
                    <Input disabled size="medium" />
                  </Form.Item>

                  <Form.Item 
                    label={<span className="font-semibold">Brand</span>}
                    name="brand"
                    rules={[{ required: true, message: 'Brand is required' }]}
                  >
                    <Input disabled size="medium" />
                  </Form.Item>

                  <Form.Item 
                    label={<span className="font-semibold">Original Quantity</span>}
                    name="originalQuantity"
                    rules={[{ required: true, message: 'Original quantity is required' }]}
                  >
                    <Input disabled size="medium" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-semibold">New Quantity to Redistribute</span>}
                    name="quantity"
                    rules={[
                      { required: true, message: 'Please input the quantity to redistribute' },
                      { 
                        validator: (_, value) => {
                          if (!value || value < 1) {
                            return Promise.reject('Quantity must be at least 1');
                          }
                          if (value >= item?.quantity) {
                            return Promise.reject(`Quantity must be less than ${item?.quantity}`);
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
                      max={item?.quantity ? item.quantity - 1 : 1}
                      placeholder="Enter quantity"
                    />
                  </Form.Item>

                  <Form.Item 
                    label={<span className="font-semibold">Remarks</span>}
                    name="remarks"
                  >
                    <Input.TextArea 
                      size="medium"
                      rows={3} 
                      placeholder="Enter remarks (optional)"
                    />
                  </Form.Item>

                  <Form.Item 
                    label={<span className="font-semibold">Issued Date</span>}
                    name="issuedDate"
                  >
                    <DatePicker 
                      size="medium"
                      format="YYYY-MM-DD" 
                      className="w-full"
                      placeholder="Select date"
                    />
                  </Form.Item>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="space-y-6">
                  <Form.Item
                    label={<span className="font-semibold">Condition</span>}
                    name="condition"
                    rules={[{ required: true, message: 'Please select the condition' }]}
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
                    label={<span className="font-semibold">Status</span>}
                    name="status"
                    rules={[{ required: true, message: 'Please select the status' }]}
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

                  <Form.Item
                    label={<span className="font-semibold">Location Type</span>}
                    name="locationType"
                    rules={[{ required: true, message: 'Please select a location type' }]}
                  >
                    <Select 
                      size="medium"
                      placeholder="Select location type"
                      onChange={(val) => setIsHeadOffice(val === 'Head Office')}
                    >
                      <Option value="Head Office">Head Office</Option>
                      <Option value="Other">Other (Specify)</Option>
                    </Select>
                  </Form.Item>

                  {isHeadOffice ? (
                    <Form.Item
                      label={<span className="font-semibold">Department (Head Office)</span>}
                      name="department"
                      rules={[{ required: true, message: 'Please select a department' }]}
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
                  ) : (
                    <Form.Item
                      label={<span className="font-semibold">Specific Location</span>}
                      name="location"
                      rules={[{ required: true, message: 'Please input a specific location' }]}
                    >
                      <Input 
                        size="medium"
                        placeholder="Enter location" 
                      />
                    </Form.Item>
                  )}

                  <Form.Item className="mb-0">
                    <div className="flex justify-center pt-4">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<CopyFilled />}
                        loading={isLoading}
                        disabled={isLoading}
                        size="small"
                        style={{
                          background: 'var(--theme-card-head-bg, #5fe7a7)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px',
                          height: 'auto',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'black'
                        }}
                      >
                        Redistribute
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
  );
};

export default RedistributeItemModal;
