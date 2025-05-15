import { useState } from 'react';
import { Typography, List, Card, Button, Tooltip, Pagination } from 'antd';
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
  const { userData: guestUserData } = useGuestAuthStore();

  const isAuthenticated = adminUserData || userUserData;
  const isGuest = Boolean(guestUserData);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleMarkAsRead = async (id) => {
    if (!isAuthenticated) return;
    await markAsRead(id);
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) return;
    await deleteNotif(id);
  };

  const handleMarkAllAsRead = async () => {
    if (!isAuthenticated) return;
    await markAllasread();
  };

  const handleClearAllNotifications = async () => {
    if (!isAuthenticated) return;
    await clearall();
  };

  const paginatedData = notifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex flex-col w-full p-8">
      <div className="mb-5 flex justify-between items-center">
        <Title level={3}>Notifications</Title>
        <div>
          <Button
            onClick={handleMarkAllAsRead}
            className="mr-4 bg-green-400"
            type="default"
            disabled={!isAuthenticated}
          >
            Mark All as Read
          </Button>
          <Button
            onClick={handleClearAllNotifications}
            type="default"
            className="bg-red-400"
            disabled={!isAuthenticated}
          >
            Empty Notifications
          </Button>
        </div>
      </div>

      <div className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-6">
        {isGuest ? (
          <div className="text-center text-gray-500">No notifications available for guests.</div>
        ) : (
          <>
            <List
              dataSource={paginatedData}
              pagination={false}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <Card
                    title="Notification"
                    extra={item.notification_date ? (
                      <small>{new Date(item.notification_date).toLocaleString()}</small>
                    ) : (
                      <small>Invalid date</small>
                    )}
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
                              disabled={!isAuthenticated}
                            />
                          </Tooltip>
                        )}

                        <Tooltip title="Delete notification">
                          <Button
                            onClick={() => handleDelete(item.id)}
                            type="text"
                            className='bg-red-400'
                            icon={<DeleteOutlined />}
                            disabled={!isAuthenticated}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />

            <div className="flex justify-between items-center mt-4">
              <div>
                {`${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  notifications.length
                )} of ${notifications.length} notifications`}
              </div>

              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={notifications.length}
                showSizeChanger
                pageSizeOptions={['5', '10', '20', '50']}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
