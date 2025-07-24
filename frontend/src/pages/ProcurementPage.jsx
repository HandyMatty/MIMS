import { useState, useEffect, useMemo, useCallback } from 'react';
import { getProcurementRequests } from '../services/api/procurement';
import ProcurementTable from '../components/Procurement/ProcurementTable';
import { Button, Tabs, Input, Space, Typography, Card, Modal, App } from 'antd';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import ProcurementRequestModal from '../components/Procurement/ProcurementRequestModal';
import ProcurementApprovalModal from '../components/Procurement/ProcurementApprovalModal';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';
import { useGuestAuthStore } from '../store/guest/useAuth';
import HighlightText from '../components/common/HighlightText';
import debounce from 'lodash/debounce';
import { fetchUsersData } from '../services/api/usersdata';
import { useTheme } from '../utils/ThemeContext';
import AddToInventoryModal from '../components/Procurement/AddToInventoryModal';
import { addApprovedItemToInventory } from '../services/api/procurement';
import Cookies from 'js-cookie';
import { useActivity } from '../utils/ActivityContext';
import { useNotification } from '../utils/NotificationContext';


const ProcurementSkeleton = () => {
    const { theme, currentTheme } = useTheme();
    const skeletonColor = currentTheme !== 'default' ? theme.border || '#d1d5db' : '#d1d5db';
    const bgColor = currentTheme !== 'default' ? theme.componentBackground || '#A8E1C5' : '#A8E1C5';
  return (
    <div className="container max-w-full">
      <div className='mt-5'>
        <div
          className="rounded-xl shadow border-none p-6 skeleton-container"
          style={{ background: bgColor }}
        >
          <div className="h-8 rounded mb-4 animate-pulse" style={{ background: skeletonColor }} />
          <div className="space-y-4">
            <div className="h-10 rounded animate-pulse" style={{ background: skeletonColor }} />
            <div className="h-96 rounded animate-pulse" style={{ background: skeletonColor }} />
            <div className="h-8 rounded animate-pulse" style={{ background: skeletonColor }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProcurementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch] = useState('');
  const [lastSynced, setLastSynced] = useState(null);
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const pageSize = 5;
  const [userMap, setUserMap] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [addToInventoryModal, setAddToInventoryModal] = useState({ visible: false, item: null, request: null });
  const [addToInventoryLoading, setAddToInventoryLoading] = useState(false);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const [deleteModal, setDeleteModal] = useState({ visible: false, request: null });
  const { message } = App.useApp();

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  const guestAuth = useGuestAuthStore();
  const isAdmin = adminAuth.token && adminAuth.userData;
  const isUser = userAuth.token && userAuth.userData;
  const isGuest = guestAuth.token && guestAuth.userData;
  const currentUser = isAdmin ? adminAuth.userData : isUser ? userAuth.userData : isGuest ? guestAuth.userData : null;

  const currentUserId = useMemo(() => {
    let username = null;
    if (isAdmin && adminAuth.userData && adminAuth.userData.username) {
      username = adminAuth.userData.username;
    } else if (isUser && userAuth.userData && userAuth.userData.username) {
      username = userAuth.userData.username;
    } else if (isGuest && guestAuth.userData && guestAuth.userData.username) {
      username = guestAuth.userData.username;
    } else {
      username = Cookies.get('username');
    }
    if (!username) return null;
    const normalizedCurrent = username.trim().toLowerCase();
    const entry = Object.entries(userMap).find(
      ([id, uname]) => typeof uname === 'string' && uname.trim().toLowerCase() === normalizedCurrent
    );
    return entry ? parseInt(entry[0], 10) : null;
  }, [isAdmin, isUser, isGuest, adminAuth, userAuth, guestAuth, userMap]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getProcurementRequests();
      setRequests(res.requests || []);
      setError(null);
      setLastSynced(new Date());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetchUsersData();
        if (res && res.users) {
          const map = {};
          res.users.forEach(u => { map[u.id] = u.username; });
          setUserMap(map);
        }
      } catch {}
    }
    fetchUsers();
  }, []);

  const [rawSearch, setRawSearch] = useState('');
  const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), []);
  const handleSearch = useCallback((e) => {
    setRawSearch(e.target.value);
    debouncedSetSearch(e.target.value);
    setPendingPage(1);
    setApprovedPage(1);
  }, [debouncedSetSearch]);

  const deepMatch = (request, search) => {
    const s = search.toLowerCase();
    if (!s) return true;
    if (
      String(request.request_id).includes(s) ||
      String(request.requester_id).includes(s) ||
      (userMap[request.requester_id] || '').toLowerCase().includes(s) ||
      (request.department || '').toLowerCase().includes(s) ||
      (request.request_date || '').toLowerCase().includes(s) ||
      (request.status || '').toLowerCase().includes(s) ||
      (request.remarks || '').toLowerCase().includes(s)
    ) return true;
    if (request.items && request.items.some(item =>
      Object.values(item).some(val => String(val || '').toLowerCase().includes(s))
    )) return true;
    return false;
  };

  const filteredPending = useMemo(() => {
    return requests.filter(r => r.status === 'Pending' && deepMatch(r, search));
  }, [requests, search, userMap]);

  const filteredApproved = useMemo(() => {
    return requests.filter(r => r.status === 'Approved' && deepMatch(r, search));
  }, [requests, search, userMap]);

  const handleCreateRequest = () => setIsRequestModalVisible(true);
  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setIsApprovalModalVisible(true);
  };

  const handleAddToInventory = (item, request) => {
    setAddToInventoryModal({ visible: true, request });
  };

  const handleAddToInventorySubmit = async (itemsData) => {
    setAddToInventoryLoading(true);
    try {
      for (const itemData of itemsData) {
        const payload = {
          item_id: itemData.item_id,
          type: itemData.type,
          brand: itemData.brand,
          serial_number: itemData.serial_number,
          issued_date: itemData.issued_date,
          purchase_date: itemData.purchase_date,
          condition: itemData.condition,
          location: itemData.location,
          remarks: itemData.remarks,
          quantity: itemData.quantity,
        };
        await addApprovedItemToInventory(payload);
      }
      fetchRequests();
      setAddToInventoryModal({ visible: false, item: null, request: null });
    } catch (e) {
      alert(e.message || 'Failed to add item(s) to inventory');
    } finally {
      setAddToInventoryLoading(false);
    }
  };

  const handleDeleteRequest = (request) => {
    setDeleteModal({ visible: true, request });
  };

  const handleConfirmDelete = async () => {
    const request = deleteModal.request;
    setDeleteModal({ visible: false, request: null });
    try {
      const { deleteProcurementRequest } = await import('../services/api/procurement');
      const res = await deleteProcurementRequest(request.request_id);
      if (res.success) {
        logUserActivity('Procurement Request', `Deleted procurement request #${request.request_id}`);
        logUserNotification('Procurement Request', `Deleted procurement request #${request.request_id}`);
        fetchRequests();
        message.success('Procurement request deleted successfully.');
      } else {
        message.error(res.message || 'Failed to delete request');
      }
    } catch (e) {
      message.error(e.message || 'Failed to delete request');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ visible: false, request: null });
  };

  return (
      <div className="flex flex-col p-4">
        <Card variant='borderless' title={
        <span className="font-bold flex justify-center text-lgi md:text-base lg:text-lgi xl:text-xl">
          Procurement Requests
        </span>
      } >
          <Tabs
            type='card'
            size='small'
            className='custom-tabs'
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[{
              key: 'pending',
              label: <span className='text-xs'>Pending Requests</span>,
              children: (
                <div className="flex flex-col gap-2">

                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search all details..."
                      value={rawSearch}
                      onChange={handleSearch}
                      allowClear
                      size='small'
                      className="w-auto border-black text-xs h-6"
                    />
                      <Button type="primary" onClick={handleCreateRequest} size='small' className="w-24 sm:w-auto custom-button text-xs">New Request</Button>
                    <Space>
                    <Button icon={<SyncOutlined />} onClick={fetchRequests} size="small" className='custom-button'/>
                    </Space>
                  </div>
                  <div className='mt-4'>
                    {loading ? (
                      <ProcurementSkeleton />
                    ) : (
                      <>
                        <ProcurementTable
                          requests={filteredPending.slice((pendingPage-1)*pageSize, pendingPage*pageSize)}
                          loading={loading}
                          error={error}
                          onApprove={handleApproveRequest}
                          isAdmin={isAdmin}
                          isUser={isUser}
                          isGuest={isGuest}
                          pagination={{
                            current: pendingPage,
                            pageSize,
                            total: filteredPending.length,
                            onChange: setPendingPage,
                            showSizeChanger: true,
                            className: 'text-xs',
                            responsive: ['xs', 'sm', 'md', 'lg', 'xl']
                          }}
                          search={search}
                          userMap={userMap}
                          HighlightText={HighlightText}
                          showAction={true}
                          currentUserId={currentUserId}
                          onDelete={handleDeleteRequest}
                        />
                        <Typography.Text type="secondary" className="text-xs block mt-2 text-center">
                          Last synced: {lastSynced ? new Date(lastSynced).toLocaleString() : 'Never'}
                        </Typography.Text>
                      </>
                    )}
                  </div>
                </div>
              )
            }, {
              key: 'approved',
              label: <span className='text-xs'>Approved Requests</span>,
              children: (
                <div className="flex flex-col gap-2">

                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Search all details..."
                      value={rawSearch}
                      onChange={handleSearch}
                      allowClear
                      size='small'
                      className="w-auto border-black text-xs h-6"
                    />
                      <Button type="primary" onClick={handleCreateRequest} size='small' className="w-24 sm:w-auto custom-button text-xs">New Request</Button>
                    <Space>
                    <Button icon={<SyncOutlined />} onClick={fetchRequests} size="small" className='custom-button'/>
                    </Space>
                  </div>
                  <div className='mt-4'>
                    {loading ? (
                      <ProcurementSkeleton />
                    ) : (
                      <>
                        <ProcurementTable
                          requests={filteredApproved.slice((approvedPage-1)*pageSize, approvedPage*pageSize)}
                          loading={loading}
                          error={error}
                          onApprove={handleApproveRequest}
                          isAdmin={isAdmin}
                          isUser={isUser}
                          isGuest={isGuest}
                          pagination={{
                            current: approvedPage,
                            pageSize,
                            total: filteredApproved.length,
                            onChange: setApprovedPage,
                            showSizeChanger: true,
                            className: 'text-xs',
                            responsive: ['xs', 'sm', 'md', 'lg', 'xl']
                          }}
                          search={search}
                          userMap={userMap}
                          HighlightText={HighlightText}
                          showAction={false}
                          onAddToInventory={handleAddToInventory}
                        />
                        <Typography.Text type="secondary" className="text-xs block mt-2 text-center">
                          Last synced: {lastSynced ? new Date(lastSynced).toLocaleString() : 'Never'}
                        </Typography.Text>
                      </>
                    )}
                  </div>
                </div>
              )
            }]}
          />
        </Card>
      {isRequestModalVisible && (
        <ProcurementRequestModal 
          visible={isRequestModalVisible} 
          onClose={() => setIsRequestModalVisible(false)} 
          onSuccess={fetchRequests}
          currentUser={currentUser}
          disabled={isGuest}
        />
      )}
      <ProcurementApprovalModal 
        visible={isApprovalModalVisible} 
        request={selectedRequest}
        onClose={() => setIsApprovalModalVisible(false)} 
        onSuccess={fetchRequests}
        isAdmin={isAdmin}
      />
      <AddToInventoryModal
        visible={addToInventoryModal.visible}
        request={addToInventoryModal.request}
        onClose={() => setAddToInventoryModal({ visible: false, item: null, request: null })}
        onSubmit={handleAddToInventorySubmit}
        confirmLoading={addToInventoryLoading}
      />
      <Modal
        open={deleteModal.visible}
        title="Confirm Delete"
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete/retract this procurement request? This action cannot be undone.</p>
        {deleteModal.request && (
          <div>
            <b>Request ID:</b> {deleteModal.request.request_id}<br />
            <b>Department:</b> {deleteModal.request.department}<br />
            <b>Date:</b> {deleteModal.request.request_date}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcurementPage; 