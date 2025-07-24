import React from 'react';
import { Modal, Button, Table, Typography, App, Grid, Alert } from 'antd';
import { approveProcurementRequest } from '../../services/api/procurement';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const itemColumns = [
  { title: 'Type', dataIndex: 'type', key: 'type', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Brand', dataIndex: 'brand', key: 'brand', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Serial Number', dataIndex: 'serial_number', key: 'serial_number', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Issued Date', dataIndex: 'issued_date', key: 'issued_date', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Purchase Date', dataIndex: 'purchase_date', key: 'purchase_date', rresponsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Condition', dataIndex: 'condition', key: 'condition', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Location', dataIndex: 'location', key: 'location', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Status', dataIndex: 'status', key: 'status', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
];

const ProcurementApprovalModal = ({ visible, request, onClose, onSuccess, isAdmin }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const screens = useBreakpoint();
  const { message } = App.useApp();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await approveProcurementRequest(request.request_id, 1);
      if (res.success) {
        logUserActivity('Procurement Approval', `Approved procurement request #${request.request_id} with ${request.items?.length || 0} item(s) for department ${request.department}`);
        logUserNotification('Procurement Approval', `Approved procurement request #${request.request_id} with ${request.items?.length || 0} item(s) for department ${request.department}`);
        
        message.success('Request approved and items added to inventory.');
        onClose();
        onSuccess && onSuccess();
      } else {
        setError(res.message || 'Failed to approve request');
      }
    } catch (e) {
      setError(e.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  return (
    <Modal
      open={visible}
      title={<span className={screens.xs ? 'text-base' : 'text-lg'}>{`Approve Procurement Request #${request.request_id}`}</span>}
      onCancel={onClose}
      footer={isAdmin ? [
        <Button key="cancel" onClick={onClose} className="text-xs px-2 py-1">Cancel</Button>,
        <Button key="approve" type="primary" loading={loading} onClick={handleApprove} disabled={request.status !== 'Pending'} className="text-xs px-2 py-1">
          Approve
        </Button>,
      ] : [<Button key="close" onClick={onClose} className="text-xs px-2 py-1">Close</Button>]}
      width={screens.xs ? '100vw' : 800}
      style={screens.xs ? { top: 8, padding: 0 } : {}}
      className={screens.xs ? 'p-0 m-0 w-full max-w-full' : ''}
    >
      {!isAdmin && <Alert type="info" message="Only admins can approve procurement requests." showIcon style={{ marginBottom: 16 }} />}
      {error && <Text type="danger">{error}</Text>}
      <div className={screens.xs ? 'mb-2 text-xs p-2' : 'mb-4'}>
        <Text strong>Requester ID:</Text> {request.requester_id} <br />
        <Text strong>Department:</Text> {request.department} <br />
        <Text strong>Request Date:</Text> {request.request_date} <br />
        <Text strong>Status:</Text> <Text type={request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'danger'}>{request.status}</Text> <br />
        <Text strong>Remarks:</Text> {request.remarks}
      </div>
      <div className={screens.xs ? 'overflow-x-auto -mx-2 p-2' : ''}>
        <Table
          dataSource={request.items}
          columns={itemColumns}
          rowKey="item_id"
          pagination={false}
          size={screens.xs ? 'small' : 'middle'}
          bordered
          className={screens.xs ? 'min-w-[700px]' : ''}
        />
      </div>
    </Modal>
  );
};

export default ProcurementApprovalModal; 