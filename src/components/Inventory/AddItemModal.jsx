import React from 'react';
import { Modal, Form, Input, Select, Button, DatePicker } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const AddItemModal = ({ visible, onClose, onAdd }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const itemData = {
        type: values.type,
        brand: values.brand,
        serialNumber: values.serialNumber,
        date: values.date.format('YYYY-MM-DD'),
        condition: values.condition,
        location: values.location,
        status: values.status,
      };

      onAdd(itemData); 
      form.resetFields();
      onClose(); 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      title="Add New Item"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{
          type: 'Radio',
          condition: 'Good',
          status: 'Available',
        }}
      >
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
          </Select>
        </Form.Item>

        <Form.Item
          label="Brand"
          name="brand"
          rules={[{ required: true, message: 'Please input the brand!' }]} >
          <Input />
        </Form.Item>

        <Form.Item
          label="Serial Number"
          name="serialNumber"
          rules={[{ required: true, message: 'Please input the serial number!' }]} >
          <Input />
        </Form.Item>

        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select the date!' }]} >
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Condition"
          name="condition"
          rules={[{ required: true, message: 'Please select the condition!' }]} >
          <Select>
            <Option value="Good">Good</Option>
            <Option value="Defective">Defective</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please input the location!' }]} >
          <Input />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select the status!' }]} >
          <Select>
            <Option value="Available">Available</Option>
            <Option value="Deployed">Deployed</Option>
            <Option value="For Repair">For Repair</Option>
          </Select>
        </Form.Item>

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
