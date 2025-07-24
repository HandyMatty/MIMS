import { axiosAuth } from '../axios';
import Cookies from 'js-cookie';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';

function getAuthToken() {
  try {
    const adminToken = useAdminAuthStore.getState().token;
    if (adminToken) return adminToken;
    const userToken = useUserAuthStore.getState().token;
    if (userToken) return userToken;
  } catch (e) {}
  return Cookies.get('token') || localStorage.getItem('token') || '';
}

export const createProcurementRequest = async (payload) => {
  const token = getAuthToken();
  const { data } = await axiosAuth.post('/create_procurement_request.php', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getProcurementRequests = async () => {
  const token = getAuthToken();
  const { data } = await axiosAuth.get('/get_procurement_requests.php', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const approveProcurementRequest = async (request_id, approver_id) => {
  const token = getAuthToken();
  const { data } = await axiosAuth.post('/approve_procurement_request.php', { request_id, approver_id }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const addApprovedItemToInventory = async (itemData) => {
  const token = getAuthToken();
  const { data } = await axiosAuth.post('/add_approved_item_to_inventory.php', itemData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}; 

export const deleteProcurementRequest = async (request_id) => {
  const token = getAuthToken();
  const { data } = await axiosAuth.post('/delete_procurement_request.php', { request_id }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}; 