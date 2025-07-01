import { Suspense, useEffect, useState } from 'react';
import { Typography, List, Card, Button, Tooltip, Pagination, Divider, Spin } from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { useGuestAuthStore } from '../../store/guest/useAuth';
import SINSSILogo from "../../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage, preloadImages } from '../../utils/imageHelpers.jsx';
import { useTheme } from '../../utils/ThemeContext';

const Notifications = () => {
  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);

  const { Title } = Typography;
  const { notifications, markAsRead, deleteNotif, markAllasread, clearall } = useNotification();
  const { userData: adminUserData } = useAdminAuthStore();
  const { userData: userUserData } = useUserAuthStore();
  const { userData: guestUserData } = useGuestAuthStore();
  const { theme, currentTheme } = useTheme();

  const isAuthenticated = adminUserData || userUserData;
  const isGuest = Boolean(guestUserData);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Button hover states
  const [markAllHover, setMarkAllHover] = useState(false);
  const [emptyHover, setEmptyHover] = useState(false);
  const [markBtnHover, setMarkBtnHover] = useState({});
  const [deleteBtnHover, setDeleteBtnHover] = useState({});

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

  // Theme-based styles
  const pageStyle = currentTheme !== 'default' ? { background: theme.background, minHeight: '100vh' } : {};
  const cardStyle = currentTheme !== 'default' ? { width: '100%', background: theme.componentBackground, border: 'none', color: theme.text } : { width: '100%', background: '#eaf4e2', border: 'none' };
  const textStyle = currentTheme !== 'default' ? { color: theme.text } : {};

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-honeydew">
        <LazyImage
          className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
          src={SINSSILogo}
          alt="SINSSI Logo"
          width={171}
          height={183}
        />
        <Spin size="large" />
        <p className="mt-4 text-darkslategray-200">Loading...</p>
      </div>
    }>
      <div className="container max-w-full" style={pageStyle}>
        <Divider style={currentTheme !== 'default' ? { borderColor: theme.text } : { borderColor: '#072C1C' }}>
          <Title level={3} style={textStyle}>Notifications</Title>
        </Divider>
        <div className='flex justify-center sm:justify-end mb-2 w-auto'>
          <Button
            onClick={handleMarkAllAsRead}
            className="mr-4 bg-green-400 w-auto text-xxs sm:text-xs"
            type="default"
            disabled={!isAuthenticated}
            style={currentTheme !== 'default' ? {
              background: markAllHover ? theme.text : theme.CardHead,
              color: markAllHover ? theme.textLight : theme.text,
              border: 'none',
              transition: 'background 0.2s, color 0.2s'
            } : {}}
            onMouseEnter={currentTheme !== 'default' ? () => setMarkAllHover(true) : undefined}
            onMouseLeave={currentTheme !== 'default' ? () => setMarkAllHover(false) : undefined}
          >
            Mark All as Read
          </Button>
          <Button
            onClick={handleClearAllNotifications}
            type="default"
            className="bg-red-400 text-xxs sm:text-xs w-auto"
            disabled={!isAuthenticated}
            style={currentTheme !== 'default' ? {
              background: emptyHover ? theme.CardHead : theme.text,
              color: emptyHover ? theme.text : theme.textLight,
              border: 'none',
              transition: 'background 0.2s, color 0.2s'
            } : {}}
            onMouseEnter={currentTheme !== 'default' ? () => setEmptyHover(true) : undefined}
            onMouseLeave={currentTheme !== 'default' ? () => setEmptyHover(false) : undefined}
          >
            Empty Notifications
          </Button>
        </div>

        <div className="flex flex-col w-full h-full bg-[#a7f3d0] rounded-xl shadow p-6"
          style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}>
          {isGuest ? (
            <div className="text-center text-gray-500">No notifications available for guests.</div>
          ) : (
            <>
              <List
                dataSource={paginatedData}
                pagination={false}
                renderItem={(item) => (
                  <List.Item key={item.id} style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}>
                    <Card
                      className="text-xxs sm:text-xs w-auto my-notification-card h"
                      title={
                        <span className="text-xs sm:text-base font-semibold" style={textStyle}>
                          Notification
                        </span>
                      }
                      extra={item.notification_date ? (
                        <small className='text-xxs sm:text-xs break-words max-w-[60px] sm:max-w-36 block' style={textStyle}>
                          {new Date(item.notification_date).toLocaleString()}
                        </small>
                      ) : (
                        <small>Invalid date</small>
                      )}
                      style={cardStyle}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div>
                            <strong className='font-medium text-black text-xxs sm:text-xs' style={textStyle}>Message: </strong>
                            <span className="text-black text-xxs sm:text-xs" style={textStyle}>{item.message}</span>
                          </div>
                          <div>
                            <strong className='font-medium text-black text-xxs sm:text-xs' style={textStyle}>Details: </strong>
                            <span className="text-black text-xxs sm:text-xs" style={textStyle}>{item.details}</span>
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
                                style={currentTheme !== 'default' ? {
                                  background: markBtnHover[item.id] ? theme.text : theme.CardHead,
                                  color: markBtnHover[item.id] ? theme.textLight : theme.text,
                                  border: 'none',
                                  transition: 'background 0.2s, color 0.2s'
                                } : {}}
                                onMouseEnter={currentTheme !== 'default' ? () => setMarkBtnHover(h => ({ ...h, [item.id]: true })) : undefined}
                                onMouseLeave={currentTheme !== 'default' ? () => setMarkBtnHover(h => ({ ...h, [item.id]: false })) : undefined}
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
                              style={currentTheme !== 'default' ? {
                                background: deleteBtnHover[item.id] ? theme.CardHead : theme.text,
                                color: deleteBtnHover[item.id] ? theme.text : theme.textLight,
                                border: 'none',
                                transition: 'background 0.2s, color 0.2s'
                              } : {}}
                              onMouseEnter={currentTheme !== 'default' ? () => setDeleteBtnHover(h => ({ ...h, [item.id]: true })) : undefined}
                              onMouseLeave={currentTheme !== 'default' ? () => setDeleteBtnHover(h => ({ ...h, [item.id]: false })) : undefined}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
                <div className="w-full text-xxs sm:text-xs text-wrap text-center sm:text-left" style={textStyle}>
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
                    style={textStyle}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default Notifications;