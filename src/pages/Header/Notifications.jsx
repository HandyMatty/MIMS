import React from 'react';
import { Typography, List, Card, Button, Tooltip } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNotification } from '../../utils/NotificationContext';

const Notifications = () => {
  const { Title } = Typography;
  const { notifications, markAsRead, deleteNotif, markAllasread, clearall } = useNotification(); // Fetch notifications and markAsRead from the context

  const handleMarkAsRead = async (id) => {
    console.log(`Marking notification ${id} as read`);
    const success = await markAsRead(id);
    if (success) {
      console.log(`Notification ${id} marked as read.`);
    } else {
      console.error(`Failed to mark notification ${id} as read.`);
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteNotif(id);
    if (success) {
      console.log(`Notification ${id} deleted successfully.`);
    } else {
      console.error(`Failed to delete notification ${id}.`);
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllasread();
    if (success) {
      console.log("All notifications marked as read.");
    } else {
      console.error("Failed to mark all notifications as read.");
    }
  };

  const handleClearAllNotifications = async () => {
    const success = await clearall();
    if (success) {
      console.log("All notifications cleared.");
    } else {
      console.error("Failed to clear all notifications.");
    }
  };

  return (
    <div className="flex flex-col w-full p-8">

      <div className="mb-5 flex justify-between items-center">
        <Title level={3}>Notifications</Title>
        <div>
          <Button onClick={handleMarkAllAsRead} className="mr-4 bg-green-400" type="default" >
            Mark All as Read
          </Button>
          <Button onClick={handleClearAllNotifications} type="default" className='bg-red-400'>
            Empty Notifications
          </Button>
        </div>
      </div>

      <div className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-6">
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item key={item.id}> {/* Use item.id as the key */}
              <Card
                title="Notification"
                extra={
                  item.notification_date
                    ? <small>{new Date(item.notification_date).toLocaleString()}</small>
                    : <small>Invalid date</small>
                }
                style={{ width: '100%', background: '#eaf4e2', border: 'none' }}
              >
                {/* Display the message, details and button in the same row with two columns */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <div>
                      <strong className='font-medium text-black'>Message: </strong>
                      <span className="text-black text-lg">{item.message}</span>
                    </div>
                    <div>
                      <strong className='font-medium text-black'>Details: </strong>
                      <span className="text-black text-sm">{item.details}</span>
                    </div>
                  </div>

                  <div className="ml-4 flex gap-2">
                    {/* Tooltip and Mark as Read button */}
                    {!item.read && (
                      <Tooltip title="Mark as read">
                        <Button
                          onClick={() => handleMarkAsRead(item.id)}
                          type="text"
                          className='bg-green-400'
                          icon={<CheckOutlined />}
                        />
                      </Tooltip>
                    )}

                    {/* Tooltip and Delete button */}
                    <Tooltip title="Delete notification">
                      <Button
                        onClick={() => handleDelete(item.id)}
                        type="text"
                        className='bg-red-400'
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default Notifications;
