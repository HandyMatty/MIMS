import { Form, Input, Select, Button, DatePicker, Row, Col, Card, Typography, Modal } from 'antd';
import { EditOutlined, CopyFilled } from '@ant-design/icons';
import { useState } from 'react';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Option } = Select;
const { Title } = Typography;

const StockItemForm = ({ 
  form, 
  onFinish, 
  loading, 
  selectedStockItem, 
  isHeadOffice, 
  setIsHeadOffice, 
  handleSerialChange 
}) => {
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [showQuantityWithSerial, setShowQuantityWithSerial] = useState(false);
  const [lastSerialValue, setLastSerialValue] = useState('');
  const [serialModalShownForCurrentInput, setSerialModalShownForCurrentInput] = useState(false);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  if (!selectedStockItem) return null;

  const onSerialChange = (e) => {
    const value = e.target.value;
    setLastSerialValue(value);
    handleSerialChange && handleSerialChange(e);
    if (value && !showQuantityWithSerial && !serialModalShownForCurrentInput) {
      setShowSerialModal(true);
      setSerialModalShownForCurrentInput(true);
    }
    if (value === '') {
      setShowQuantityWithSerial(false);
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

  const handleFinish = (values) => {
    onFinish(values);
    const action = selectedStockItem?.action === 'redistribute' ? 'Redistribute Item' : 'Edit Item';
    logUserActivity(action, `${action}: ${values.type} (${values.brand}), Qty: ${values.quantity}`);
    logUserNotification(action, `${action}: ${values.type} (${values.brand}), Qty: ${values.quantity}`);
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
        Does the item you want to add have only 1 serial number but has many quantities?
      </Modal>
    <Card className="shadow-lg custom-card">
      <div className="mb-6">
        <Title level={4} className="mb-2">
          {selectedStockItem.action === 'redistribute' ? '🔄 Redistribute Item' : '✏️ Edit Item'}
        </Title>
        <p className="text-gray-600 text-sm">
          {selectedStockItem.action === 'redistribute' 
            ? 'Create a new item from existing stock' 
            : 'Update item details and information'
          }
        </p>
      </div>
      
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={{
          quantity: 1,
        }}
      >
        <Row gutter={[32, 24]}>
          <Col span={12}>
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

                {(!lastSerialValue || showQuantityWithSerial || selectedStockItem?.action === 'redistribute') && (
                <Form.Item
                  label={<span className="font-semibold">
                    {selectedStockItem?.action === 'redistribute' ? "New Quantity to Redistribute" : "Quantity"}
                  </span>}
                  name="quantity"
                  rules={[
                    { required: true, message: 'Please input the quantity!' },
                    {
                      validator: (_, value) => {
                        if (!value || value < 1) {
                          return Promise.reject('Quantity must be at least 1');
                        }
                        if (selectedStockItem?.action === 'redistribute' && selectedStockItem?.quantity && value >= selectedStockItem.quantity) {
                          return Promise.reject(`Quantity must be less than ${selectedStockItem.quantity}`);
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
                    max={selectedStockItem?.action === 'redistribute' && selectedStockItem?.quantity ? selectedStockItem.quantity - 1 : undefined}
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

          <Col span={12}>
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
                    icon={selectedStockItem.action === 'redistribute' ? <CopyFilled /> : <EditOutlined />}
                    loading={loading}
                    size="small"
                    style={{
                      backgroundColor: 'var(--theme-card-head-bg, #a7f3d0)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      height: 'auto',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'black'
                    }}
                  >
                    {selectedStockItem.action === 'redistribute' ? 'Redistribute' : 'Update Item'}
                  </Button>
                </div>
              </Form.Item>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
    </>
  );
};

export default StockItemForm; 