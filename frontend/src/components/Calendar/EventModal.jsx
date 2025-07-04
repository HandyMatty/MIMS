import { Modal, Form, Input, message, Select } from 'antd';
import { addEvent } from '../../services/api/eventService';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

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

      addEvent(newEvent)
        .then((res) => {
          if (res.success) {
            message.success('Event added successfully!');
            form.resetFields();
            loadEvents(); 
            onClose();

            logUserActivity(
              res.username,
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
      okButtonProps= {{ className: 'custom-button' }}
      cancelButtonProps= {{ className: 'custom-button-cancel' }}
      centered
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
          <Select placeholder="Select a category" allowClear>
            <Option value="#4169E1">Important (Royal Blue)</Option>
            <Option value="#FFD700">Celebration (Gold)</Option>
            <Option value="#228B22">Task (Forest Green)</Option>
            <Option value="#4682B4">Meeting (Steel Blue)</Option>
            <Option value="#FFC0CB">Personal (Soft Pink)</Option>
            <Option value="#B22222">Deadline (Firebrick Red)</Option>
            <Option value="#FFFFE0">Idea (Pale Yellow)</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventModal;
