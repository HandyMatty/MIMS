import React from 'react';
import { Typography, List, Card, Button, Tooltip } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { useGuestAuthStore } from '../../store/guest/useAuth';

const Notifications = () => {
  const { Title } = Typography;
  const { notifications, markAsRead, deleteNotif, markAllasread, clearall } = useNotification();
  const { userData: adminUserData } = useAdminAuthStore();
  const { userData: userUserData } = useUserAuthStore();
  const { userData: guestUserData } = useGuestAuthStore(); // Guest Auth Store

  const isAuthenticated = adminUserData || userUserData;
  const isGuest = Boolean(guestUserData); 

  const handleMarkAsRead = async (id) => {
    if (!isAuthenticated) return;
    const success = await markAsRead(id);
    if (success) {
      console.log(`Notification ${id} marked as read.`);
    } else {
      console.error(`Failed to mark notification ${id} as read.`);
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) return;
    const success = await deleteNotif(id);
    if (success) {
      console.log(`Notification ${id} deleted successfully.`);
    } else {
      console.error(`Failed to delete notification ${id}.`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!isAuthenticated) return;
    const success = await markAllasread();
    if (success) {
      console.log("All notifications marked as read.");
    } else {
      console.error("Failed to mark all notifications as read.");
    }
  };

  const handleClearAllNotifications = async () => {
    if (!isAuthenticated) return;
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
          <Button
            onClick={handleMarkAllAsRead}
            className="mr-4 bg-green-400"
            type="default"
            disabled={!isAuthenticated} // Disabled for guests
          >
            Mark All as Read
          </Button>
          <Button
            onClick={handleClearAllNotifications}
            type="default"
            className="bg-red-400"
            disabled={!isAuthenticated} // Disabled for guests
          >
            Empty Notifications
          </Button>
        </div>
      </div>

      <div className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-6">
        {isGuest ? (
          <div className="text-center text-gray-500">No notifications available for guests.</div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <Card
                  title="Notification"
                  extra={
                    item.notification_date
                      ? <small>{new Date(item.notification_date).toLocaleString()}</small>
                      : <small>Invalid date</small>
                  }
                  style={{ width: '100%', background: '#eaf4e2', border: 'none' }}
                >
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
                      {!item.read && (
                        <Tooltip title="Mark as read">
                          <Button
                            onClick={() => handleMarkAsRead(item.id)}
                            type="text"
                            className='bg-green-400'
                            icon={<CheckOutlined />}
                            disabled={!isAuthenticated} // Disabled for guests
                          />
                        </Tooltip>
                      )}

                      <Tooltip title="Delete notification">
                        <Button
                          onClick={() => handleDelete(item.id)}
                          type="text"
                          className='bg-red-400'
                          icon={<DeleteOutlined />}
                          disabled={!isAuthenticated} // Disabled for guests
                        />
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;
