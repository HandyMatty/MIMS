import React from 'react';
import { Modal, Form, Input, message, Select } from 'antd';
import { addEvent } from '../../services/api/eventService';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';  // Import the Notification context


const { Option } = Select;

const EventModal = ({ isOpen, onClose, selectedDate, loadEvents }) => {
  const [form] = Form.useForm();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newEvent = {
        date: selectedDate.format('YYYY-MM-DD'),
        content: values.event,
        event_type: values.color,
      };

      // Add the event using the API
      addEvent(newEvent)
        .then((res) => {
          if (res.success) {
            message.success('Event added successfully!');
            form.resetFields();
            loadEvents(); // Reload events
            onClose();

            // Log user activity after successfully adding an event
            logUserActivity(
              res.username, // Use the username from the response or context
              'Event',
              `Added an event: "${values.event}"`
            );
            logUserNotification('New event scheduled!', `Your upcoming event "${values.event}" is scheduled for ${selectedDate.format('YYYY-MM-DD')}.`);
          } else {
            message.error(res.message || 'Failed to add event.');
          }
        })
        .catch((error) => {
          message.error('Failed to add event.');
          console.error('Failed to add event:', error);
        });
    });
  };

  return (
    <Modal
      title={`Add Event on ${selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}`}
      open={isOpen}
      onOk={handleOk}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="event"
          label="Event Description"
          rules={[{ required: true, message: 'Please input the event description!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="color"
          label="Event Color"
          rules={[{ required: true, message: 'Please select a color for the event!' }]}
        >
          <Select placeholder="Select a color" allowClear>
            <Option value="success">Green</Option>
            <Option value="error">Red</Option>
            <Option value="warning">Yellow</Option>
            <Option value="default">Blue</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventModal;
