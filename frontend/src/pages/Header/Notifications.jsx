import { useState } from 'react';
import { Typography, List, Card, Button, Tooltip, Pagination, Divider } from 'antd';
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
    <div className="container max-w-full">
  <Divider style={{borderColor: '#072C1C'}}><Title 
  level={3}>Notifications</Title></Divider>
        <div className='flex justify-center sm:justify-end mb-2 w-auto'>
          <Button
            onClick={handleMarkAllAsRead}
            className="mr-4 bg-green-400 w-auto text-xxs sm:text-xs"
            type="default"
            disabled={!isAuthenticated}
          >
            Mark All as Read
          </Button>
          <Button
            onClick={handleClearAllNotifications}
            type="default"
            className="bg-red-400 text-xxs sm:text-xs w-auto"
            disabled={!isAuthenticated}
          >
            Empty Notifications
          </Button>
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
                    className='text-xxs sm:text-xs w-auto'
                    title={
                      <span className="text-xs sm:text-base font-semibold">
                        Notification
                      </span>
                    }
                    extra={item.notification_date ? (
                      <small className='text-xxs sm:text-xs break-words max-w-[60px] sm:max-w-36 block'>{new Date(item.notification_date).toLocaleString()}</small>
                    ) : (
                      <small>Invalid date</small>
                    )}
                    style={{ width: '100%', background: '#eaf4e2', border: 'none' }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <div>
                          <strong className='font-medium text-black text-xxs sm:text-xs'>Message: </strong>
                          <span className="text-black text-xxs sm:text-xs">{item.message}</span>
                        </div>
                        <div>
                          <strong className='font-medium text-black text-xxs sm:text-xs'>Details: </strong>
                          <span className="text-black text-xxs sm:text-xs">{item.details}</span>
                        </div>
                      </div>

                      <div className="ml-4 flex gap-2">
                        {!item.read && (
                          <Tooltip title="Mark as read">
                            <Button
                              onClick={() => handleMarkAsRead(item.id)}
                              type="text"
                              size='small'
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
                            size='small'
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
              <div className="w-full text-xxs sm:text-xs text-wrap text-center sm:text-left">
                {`${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  notifications.length
                )} of ${notifications.length} notifications`}
              </div>
            <div className="w-full flex justify-center sm:justify-end">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={notifications.length}
                showSizeChanger
                pageSizeOptions={['10', '20', '30', '50', '100', '200', '500', '1000', '2000']}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                responsive
                className='text-xxs sm:text-xs'
              />
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
