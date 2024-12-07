import React from 'react';
import { Badge, Button, Tooltip, Avatar, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteEvent } from '../../services/api/eventService'; // Import the deleteEvent API function
import { useActivity } from '../../utils/ActivityContext';

const EventList = ({ currentDate, info, events, showModal, isAdmin, currentUser, setEvents }) => {
  const { logUserActivity } = useActivity(); // Import and destructure logUserActivity

  if (info.type === 'date') {
    const dateKey = currentDate.format('YYYY-MM-DD');
    const listData = events[dateKey] || [];

    // Handle event deletion
    const handleDeleteEvent = (eventItem) => {
      deleteEvent(eventItem.id)
        .then((response) => {
          if (response.success) {
            // Remove the deleted event from the state directly
            setEvents((prevEvents) => {
              const updatedEvents = { ...prevEvents };
              const updatedList = updatedEvents[dateKey].filter((e) => e.id !== eventItem.id);
              updatedEvents[dateKey] = updatedList;
              return updatedEvents;
            });

            message.success('Event deleted successfully!');

            // Log user activity with event details
            logUserActivity(
              currentUser?.username || 'Unknown User', // Use the current user's username
              'Event',
              `Deleted an event: "${eventItem.content}"` // Log the event description
            );
          } else {
            message.error(response.message || 'Failed to delete event');
          }
        })
        .catch((error) => {
          console.error('Failed to delete event:', error);
          message.error('Error deleting event. Please try again.');
        });
    };

    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.id}>
            <Tooltip title={item.username}>
              <Avatar src={item.avatar} />
            </Tooltip>
            <Badge status={item.type} text={item.content} />

            {/* Show delete button only if admin or if it's the user's event */}
            {(isAdmin || item.username === currentUser?.username) && (
              <Tooltip title="Delete Event">
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ padding: 0 }}
                  onClick={() => handleDeleteEvent(item)} // Pass the event item to the handler
                />
              </Tooltip>
            )}
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

export default EventList;
