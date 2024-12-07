import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const EditItemModal = ({ visible, onClose, onEdit, item, isLoading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        type: item.type,
        brand: item.brand,
        serialNumber: item.serialNumber,
        date: item.date ? moment(item.date, 'YYYY-MM-DD') : null,
        condition: item.condition,
        location: item.location,
        status: item.status,
      });
    }
  }, [item, form]);

  const handleSubmit = async (values) => {
    try {
      const updatedItem = {
        id: item.id,
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };
      await onEdit(updatedItem);
      onClose(); 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      title="Edit Item"
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
        <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please select the item type!' }]}>
          <Select>
            <Option value="Radio">Radio</Option>
            <Option value="Charger">Charger</Option>
            <Option value="Battery">Battery</Option>
            <Option value="Megaphone">Megaphone</Option>
            <Option value="Searchlight">Searchlight</Option>
            <Option value="Metal Detector">Metal Detector</Option>
            <Option value="Search Stick">Search Stick</Option>
            <Option value="Biometrics">Biometrics</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Please input the brand!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Serial Number" name="serialNumber" rules={[{ required: true, message: 'Please input the serial number!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Please select the date!' }]}>
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Condition" name="condition" rules={[{ required: true, message: 'Please select the condition!' }]}>
          <Select>
            <Option value="Good">Good</Option>
            <Option value="Defective">Defective</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Please input the location!' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select the status!' }]}>
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
            loading={isLoading}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditItemModal;
