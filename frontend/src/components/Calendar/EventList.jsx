import { Badge, Button, Tooltip, Avatar, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteEvent } from '../../services/api/eventService';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const EventList = ({ currentDate, info, events, showModal, isAdmin, currentUser, setEvents, isGuest  }) => {
  const { logUserActivity } = useActivity(); 
  const { logUserNotification } = useNotification();

  if (info.type === 'date') {
    const dateKey = currentDate.format('YYYY-MM-DD');
    const listData = events[dateKey] || [];

    const handleDeleteEvent = (eventItem) => {
      deleteEvent(eventItem.id)
        .then((response) => {
          if (response.success) {
            setEvents((prevEvents) => {
              const updatedEvents = { ...prevEvents };
              const updatedList = updatedEvents[dateKey].filter((e) => e.id !== eventItem.id);
              updatedEvents[dateKey] = updatedList;
              return updatedEvents;
            });

            message.success('Event deleted successfully!');

            logUserActivity(
              currentUser?.username || 'Unknown User',
              'Event',
              `Deleted an event: "${eventItem.content}"` 
            );
            logUserNotification ( 'Event Deleted',
              `Deleted an event: "${eventItem.content}"`);
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
            <Tooltip title={item.username} className='size-3 sm:size-5'>
              <Avatar src={item.avatar} />
            </Tooltip>
            <Badge color={item.type} text={
                <span style={{ color: item.type }}
                className='text-xxs sm:text-xs'
                >{item.content}</span>} />

            {(isAdmin || item.username === currentUser?.username) && (
              <Tooltip title="Delete Event">
                <Button
                  className='size-1'
                  size='small'
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ padding: 0 }}
                  onClick={() => handleDeleteEvent(item)}
                />
              </Tooltip>
            )}
          </li>
        ))}
        {!isGuest && (
          <Tooltip title="Add Event">
            <Button
              className='size-1'
              size='small'
              type="link"
              icon={<PlusOutlined />}
              onClick={() => showModal(currentDate)}
              style={{ padding: 0 }}
            />
          </Tooltip>
        )}
      </ul>
    );
  }
  return null;
};

export default EventList;
