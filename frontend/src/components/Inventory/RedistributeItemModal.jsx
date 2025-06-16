import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message, DatePicker, Row, Col } from 'antd';
import { CopyFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import Cookies from 'js-cookie';

const { Option } = Select;

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

    // If no auth store has user data, try cookies
    const username = Cookies.get('username');
    const userId = Cookies.get('user_id');
    if (username && userId) {
      return { username, id: userId };
    }

    return null;
  };

  // Initialize form values when item changes
  useEffect(() => {
    if (visible && item) {
      // Determine if the location is Head Office
      const isHeadOfficeLocation = item.location?.includes('Head Office');
      setIsHeadOffice(isHeadOfficeLocation);

      // Parse location data
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

      // Fetch latest inventory data
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
      title="Redistribute Item"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
    >
      <Form 
        form={form} 
        onFinish={handleSubmit} 
        layout="vertical"
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Form.Item 
              label="Type" 
              name="type"
              rules={[{ required: true, message: 'Type is required' }]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item 
              label="Brand" 
              name="brand"
              rules={[{ required: true, message: 'Brand is required' }]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item 
              label="Original Quantity" 
              name="originalQuantity"
              rules={[{ required: true, message: 'Original quantity is required' }]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="New Quantity to Redistribute"
              name="quantity"
              rules={[
                { required: true, message: 'Please input the quantity to redistribute' },
                { type: 'number', min: 1, max: item?.quantity ? item.quantity - 1 : 1, message: 'Invalid quantity' }
              ]}
            >
              <Input 
                type="number" 
                min={1} 
                max={item?.quantity ? item.quantity - 1 : 1}
                placeholder="Enter quantity"
              />
            </Form.Item>

            <Form.Item 
              label="Remarks" 
              name="remarks"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Enter remarks (optional)"
              />
            </Form.Item>

            <Form.Item 
              label="Issued Date" 
              name="issuedDate"
            >
              <DatePicker 
                format="YYYY-MM-DD" 
                style={{ width: '100%' }}
                placeholder="Select date"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Condition"
              name="condition"
              rules={[{ required: true, message: 'Please select the condition' }]}
            >
              <Select placeholder="Select condition">
                <Option value="Brand New">Brand New</Option>
                <Option value="Good Condition">Good Condition</Option>
                <Option value="Defective">Defective</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select the status' }]}
            >
              <Select placeholder="Select status">
                <Option value="On Stock">On Stock</Option>
                <Option value="Deployed">Deployed</Option>
                <Option value="For Repair">For Repair</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Location Type"
              name="locationType"
              rules={[{ required: true, message: 'Please select a location type' }]}
            >
              <Select 
                placeholder="Select location type"
                onChange={(val) => setIsHeadOffice(val === 'Head Office')}
              >
                <Option value="Head Office">Head Office</Option>
                <Option value="Other">Other (Specify)</Option>
              </Select>
            </Form.Item>

            {isHeadOffice ? (
              <Form.Item
                label="Department (Head Office)"
                name="department"
                rules={[{ required: true, message: 'Please select a department' }]}
              >
                <Select placeholder="Select department">
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
                label="Specific Location"
                name="location"
                rules={[{ required: true, message: 'Please input a specific location' }]}
              >
                <Input placeholder="Enter location" />
              </Form.Item>
            )}

            <Form.Item>
              <div className="flex justify-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CopyFilled />}
                  loading={isLoading}
                  disabled={isLoading}
                  size="large"
                  className="min-w-[120px]"
                >
                  Redistribute
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default RedistributeItemModal;
