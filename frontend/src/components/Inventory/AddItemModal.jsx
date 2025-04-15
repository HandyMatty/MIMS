import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import dayjs from 'dayjs';

const { Option } = Select;

const AddItemModal = ({ visible, onClose, onAdd }) => {
  const [form] = Form.useForm();
  const [isHeadOffice, setIsHeadOffice] = useState(false);
  const [hasSerialNumber, setHasSerialNumber] = useState(false);

  const handleSubmit = async (values) => {
    try {
      if (values.purchaseDate && values.purchaseDate.isAfter(dayjs())) {
        message.error("Purchase date cannot be in the future.");
        return;
      }
      
      const existingInventory = await getInventoryData();
    
      // Check if serial number already exists
      if (values.serialNumber) {
        const serialExists = existingInventory.some(item => item.serialNumber === values.serialNumber);
        if (serialExists) {
          message.error("Serial number already exists. Please use a unique serial number.");
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
        issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : "NO DATE", 
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD'), 
        condition: values.condition,
        location: formattedLocation,
        status: values.status,
        remarks: values.remarks || null,
      };

      onAdd(itemData); 
      form.resetFields();
      onClose(); 
    } catch (error) {
      console.error(error);
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
          type: 'Radio',
          condition: 'Brand New',
          status: 'On Stock',
          quantity: 1,
        }}
      >
      <div style={{ display: 'flex', gap: '20px' }}>
          {/* LEFT COLUMN */}
      <div style={{ flex: 1 }}>
        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: 'Please select the item type!' }]} >
          <Select>
            <Option value="Radio">Radio</Option>
            <Option value="Charger">Charger</Option>
            <Option value="Battery">Battery</Option>
            <Option value="Megaphone">Megaphone</Option>
            <Option value="Searchlight">Searchlight</Option>
            <Option value="Metal Detector">Metal Detector</Option>
            <Option value="Search Stick">Search Stick</Option>
            <Option value="Biometrics">Biometrics</Option>
            <Option value="Smartphone">Smartphone</Option>
            <Option value="Laptop">Laptop</Option>
            <Option value="Monitor">Monitor</Option>
            <Option value="System Unit">System Unit</Option>
            <Option value="Keyboard">Keyboard</Option>
            <Option value="Mouse">Mouse</Option>
            <Option value="AVR">AVR</Option>
            <Option value="UPS">UPS</Option>
            <Option value="Printer">Printer</Option>
            <Option value="Headset">Headset</Option>
            <Option value="Speaker">Speaker</Option>
            <Option value="Router">Router</Option>
            <Option value="Switch">Switch</Option>
            <Option value="Modem">Modem</Option>
            <Option value="Mesh">WIFI-Mesh</Option>
            <Option value="Camera">Camera</Option>
            <Option value="Microphone">Microphone</Option>
            <Option value="CCTV">CCTV</Option>
            <Option value="Podium">Podium</Option>
            <Option value="Chassis">Under Chassis</Option>
            <Option value="Pedestal">Mobile Pedestal</Option>
            <Option value="Others">Others</Option>
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

            <Form.Item label="Issued Date" name="issuedDate">
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
        </div>

        <div style={{ flex: 1 }}>
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
            onChange={(value) => setIsHeadOffice(value === 'Head Office')} // Track if Head Office is selected
          >
            <Option value="Head Office">Head Office</Option>
            <Option value="Other">Other (Specify Below)</Option>
          </Select>
        </Form.Item>

        {/* Show department selection only if "Head Office" is selected */}
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
            </Select>
          </Form.Item>
        )}

        {/* Show manual input field only if "Other" is selected */}
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
        </div>
      </div>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusCircleOutlined />}
            style={{ width: '100%' }}
          >
            Add Item
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddItemModal;
