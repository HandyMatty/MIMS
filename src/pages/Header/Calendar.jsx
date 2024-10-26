import React, { useState, useEffect } from 'react';
import { Badge, Calendar as AntdCalendar, Modal, Form, Input, Button, message, Typography, Select, Tooltip, Avatar } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchEvents, addEvent, deleteEvent } from '../../services/api/eventService';

const { Option } = Select;

const Calendar = () => {
  const [events, setEvents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();
  const { Title } = Typography;

  // Fetch events when the component mounts
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    fetchEvents()
      .then(fetchedEvents => {
        const formattedEvents = {};
        fetchedEvents.forEach(event => {
          const dateKey = event.event_date;
          if (!formattedEvents[dateKey]) {
            formattedEvents[dateKey] = [];
          }
          formattedEvents[dateKey].push({
            id: event.id,
            type: event.event_type,
            content: event.content,
            avatar: event.avatar || '', // Ensure avatar is present
          });
        });
        setEvents(formattedEvents);
      })
      .catch(error => {
        console.error('Failed to fetch events:', error);
      });
  };

  // Open the modal for inputting events
  const showModal = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Handle event submission
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
          message.success('Event added successfully!');
          const newEvents = { ...events };
          const dateKey = newEvent.date;

          // Update the local events state with the new event immediately
          if (!newEvents[dateKey]) {
            newEvents[dateKey] = [];
          }
          newEvents[dateKey].push({
            id: res.id, // Get new event id from response
            type: newEvent.event_type,
            content: newEvent.content,
            avatar: res.avatar || '', // Use the current user's avatar
          });

          // Update the events state
          setEvents(newEvents);
          setIsModalOpen(false);
          form.resetFields();
        })
        .catch(error => {
          message.error('Failed to add event.');
          console.error('Failed to add event:', error);
        });
    });
  };

  // Handle event deletion
  const handleDelete = (eventId, dateKey) => {
    deleteEvent(eventId)
      .then(() => {
        message.success('Event deleted successfully!');
        const updatedEvents = { ...events };
        updatedEvents[dateKey] = updatedEvents[dateKey].filter(event => event.id !== eventId);
        setEvents(updatedEvents);
      })
      .catch(error => {
        message.error('Failed to delete event.');
        console.error('Failed to delete event:', error);
      });
  };

  // Custom cell renderer for both date and month cells
  const cellRender = (currentDate, info) => {
    if (info.type === 'date') {
      const dateKey = currentDate.format('YYYY-MM-DD');
      const listData = events[dateKey] || [];
      return (
        <ul className="events">
          {listData.map((item, index) => (
            <li key={index}>
              <Avatar src={item.avatar} /> {/* Display the user's avatar */}
              <Badge status={item.type} text={item.content} />
              <Tooltip title="Delete Event">
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDelete(item.id, dateKey)} 
                  style={{ padding: 0 }}
                />
              </Tooltip>
            </li>
          ))}
          <Tooltip title="Add Event">
            <Button 
              type="link" 
              icon={<PlusOutlined />} 
              onClick={() => showModal(currentDate)} 
              style={{ padding: 0 }}
            />
          </Tooltip>
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col w-full p-8">
      <div className='mb-5'><Title level={2}>Calendar</Title></div>
      <AntdCalendar className='rounded-2xl' cellRender={cellRender} />

      {/* Modal for adding events */}
      <Modal
        title={`Add Event on ${selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
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
    </div>
  );
};

export default Calendar;
