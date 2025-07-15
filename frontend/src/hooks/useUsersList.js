import { useState, useEffect, useRef, useCallback } from 'react';
import { App, Modal } from 'antd';
import {
  fetchUsersData,
  deleteUsers,
  addUser,
  updateSecurityQuestion,
  getSecurityQuestion,
  updateRole,
  updateDepartment,
} from '../services/api/usersdata';
import { resetPasswordApi } from '../services/api/resetpassword';
import { generateTempPassword } from '../utils/password';
import { useActivity } from '../utils/ActivityContext';
import { useNotification } from '../utils/NotificationContext';
import { 
  updateTableCache, 
  markTableCacheStale, 
  isTableCacheValid, 
  getTableCacheData, 
  getTableCacheLastUpdated,
  SYNC_INTERVAL 
} from '../utils/cacheUtils';
import { isOffline } from '../utils/offlineUtils';

const useUsersList = () => {
  const [users, setUsers] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isSecurityQuestionModalVisible, setIsSecurityQuestionModalVisible] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [currentUserSecurityQuestion, setCurrentUserSecurityQuestion] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserIdForRole, setCurrentUserIdForRole] = useState(null);
  const [loadingRoleUpdate, setLoadingRoleUpdate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { message, modal } = App.useApp();
  const syncIntervalRef = useRef(null);
  
  const TABLE_NAME = 'users';


  const handleRoleUpdate = async (values) => {
    setLoadingRoleUpdate(true);
    try {
      const response = await updateRole(currentUserIdForRole, values.role);
      if (response.success) {
        message.success(response.message || 'Role updated successfully');
        setIsRoleModalVisible(false);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === currentUserIdForRole ? { ...user, role: values.role } : user
          )
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.map((user) =>
            user.id === currentUserIdForRole ? { ...user, role: values.role } : user
          )
        );
        logUserActivity(
          'Admin',
          'User Management',
          `Updated the role of user with ID: "${currentUserIdForRole}" to "${values.role}"`
        );
        logUserNotification(
          'User Management',
          `You have updated the role of user with ID: "${currentUserIdForRole}" to "${values.role}"`
        );
      } else {
        message.error(response.message || 'Failed to update role');
      }
    } catch (error) {
      message.error('An error occurred while updating the role');
    } finally {
      setLoadingRoleUpdate(false);
    }
  };

  const handleDepartmentUpdate = async (userId, newDepartment) => {
    try {
      const response = await updateDepartment(userId, newDepartment);
      if (response.success) {
        message.success('Department updated successfully');
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, department: newDepartment } : user
          )
        );
        setFilteredData((prevFilteredData) =>
          prevFilteredData.map((user) =>
            user.id === userId ? { ...user, department: newDepartment } : user
          )
        );
        logUserActivity(
          'Admin',
          'User Management',
          `Updated the department of user with ID: "${userId}" to "${newDepartment}"`
        );
        logUserNotification(
          'User Management',
          `You have updated the department of user with ID: "${userId}" to "${newDepartment}"`
        );
      } else {
        message.error(response.message || 'Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      message.error('Failed to update department');
    }
  };

  const showEditRoleModal = (record) => {
    setCurrentUserRole(record.role);
    setCurrentUserIdForRole(record.id);
    setIsRoleModalVisible(true);
  };

  useEffect(() => {
    setSecurityQuestions([
      "What is your mother's maiden name?",
      'What was the name of your first pet?',
      'What is your favorite color?',
      'In what city were you born?',
      'What is the name of your first school?',
      'What is your favorite movie?',
      'Who is your favorite author?',
      'What is the name of your best friend?',
      'What is your dream job?',
      'Where did you go on your last vacation?',
    ]);
  }, []);

  const refreshUsers = useCallback(async (forceRefresh = false) => {
    try {
      if (await isOffline()) {
        console.warn('Cannot refresh users while offline');
        return;
      }

      setIsRefreshing(true);
      
      if (isTableCacheValid(TABLE_NAME, forceRefresh)) {
        const cachedData = getTableCacheData(TABLE_NAME);
        setUsers(cachedData.users);
        setFilteredData(cachedData.users);
        setLastSyncTime(getTableCacheLastUpdated(TABLE_NAME));
        return;
      }

      const freshData = await fetchUsersData();
      
      updateTableCache(TABLE_NAME, freshData);
      
      setUsers(freshData.users);
      setFilteredData(freshData.users);
      setLastSyncTime(Date.now());
      
    } catch (error) {
      console.error('Failed to load users data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const startBackgroundSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(async () => {
      try {
        if (await isOffline()) {
          return;
        }
        
        const freshData = await fetchUsersData();
        updateTableCache(TABLE_NAME, freshData);
        
        setUsers(freshData.users);
        setFilteredData(freshData.users);
        setLastSyncTime(Date.now());
        
      } catch (error) {
        console.warn('Background sync failed:', error);
        markTableCacheStale(TABLE_NAME);
      }
    }, SYNC_INTERVAL);
  }, []);

  const stopBackgroundSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    refreshUsers();
    startBackgroundSync();
    return () => stopBackgroundSync();
  }, [refreshUsers, startBackgroundSync, stopBackgroundSync]);

  const onSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = users.filter((item) =>
      Object.values(item).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: `Are you sure you want to delete ${selectedRowKeys.length} user(s)? This action cannot be undone.`,
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          const response = await deleteUsers(selectedRowKeys);
          if (response.success) {
            message.success(response.message || 'Users deleted successfully');
            const updatedUsers = users.filter((user) => !selectedRowKeys.includes(user.id));
            setUsers(updatedUsers);
            setFilteredData(updatedUsers);
            setSelectedRowKeys([]);
            logUserActivity('Admin', 'User Management', `Deleted ${selectedRowKeys.length} user(s)`);
            logUserNotification('User Management', `You have deleted ${selectedRowKeys.length} user(s)`);
          } else {
            message.error(response.message || 'Failed to delete users');
          }
        } catch (error) {
          console.error('Error deleting users:', error);
          message.error('Failed to delete users');
        }
      },
    });
  };

  const handleAddUser = async (values) => {
    const usernameExists = users.some(
      (user) => user.username.toLowerCase() === values.username.toLowerCase()
    );
    if (usernameExists) {
      message.error('Username already exists. Please choose a different username.');
      return;
    }
  
    const tempPassword = generateTempPassword();
    try {
      await addUser({ ...values, password: tempPassword });
      message.success('User added successfully');
      setTemporaryPassword(tempPassword);
      setIsAddModalVisible(false);
      setIsPasswordModalVisible(true);
      const data = await fetchUsersData();
      setUsers(data.users);
      setFilteredData(data.users);
      logUserActivity('Admin', 'User Management', `Added a new user with username: "${values.username}"`);
      logUserNotification('User Management', `You have added a new user with username: "${values.username}"`);
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Failed to add user');
    }
  };
  

  const handleResetPassword = (userId) => {
    modal.confirm({
      title: 'Are you sure you want to reset the password?',
      content: "This action will reset the user's password to a temporary one.",
      okText: 'Yes',
      cancelText: 'No',
      centered: true,
      okButtonProps: { className: 'custom-button' },
      cancelButtonProps: { className: 'custom-button-cancel' },
      onOk: async () => {
        const tempPassword = generateTempPassword();
        try {
          await resetPasswordApi(userId, tempPassword);
          message.success('Password reset successfully');
          setTemporaryPassword(tempPassword);
          setIsPasswordModalVisible(true);
          logUserActivity('Admin', 'User Management', `Reset the password for user with ID: "${userId}"`);
          logUserNotification('User Management', `You have reset the password for user with ID: "${userId}"`);
        } catch (error) {
          console.error('Error resetting password:', error);
          message.error('Failed to reset password');
        }
      },
    });
  };

  const handleSecurityQuestion = async (userId) => {
    try {
      const response = await getSecurityQuestion(userId);
      if (response.success) {
        setCurrentUserSecurityQuestion(response.security_question);
        setCurrentUserId(userId);
        setIsSecurityQuestionModalVisible(true);
      } else {
        message.error('Failed to fetch security question');
      }
    } catch (error) {
      console.error('Error fetching security question:', error);
      message.error('Failed to fetch security question');
    }
  };

  const handleChangeSecurityQuestion = async (values) => {
    try {
      const response = await updateSecurityQuestion(
        currentUserId,
        values.security_question,
        values.security_answer
      );
      if (response.success) {
        message.success('Security question updated successfully.');
        setIsSecurityQuestionModalVisible(false);
        logUserActivity(
          'Admin',
          'User Management',
          `Updated the security question for user with ID: "${currentUserId}"`
        );
        logUserNotification(
          'User Management',
          `You have updated the security question for user with ID: "${currentUserId}"`
        );
      } else {
        message.error(response.message || 'Failed to update security question.');
      }
    } catch (error) {
      console.error('Error updating security question:', error);
      message.error('Failed to update security question.');
    }
  };

  return {
    users,
    setUsers,
    selectedRowKeys,
    setSelectedRowKeys,
    searchText,
    setSearchText,
    filteredData,
    setFilteredData,
    isAddModalVisible,
    setIsAddModalVisible,
    isPasswordModalVisible,
    setIsPasswordModalVisible,
    isSecurityQuestionModalVisible,
    setIsSecurityQuestionModalVisible,
    temporaryPassword,
    securityQuestions,
    currentUserSecurityQuestion,
    currentUserId,
    currentPage,
    pageSize,
    loading,
    isRoleModalVisible,
    setIsRoleModalVisible,
    currentUserRole,
    setCurrentUserRole,
    currentUserIdForRole,
    setCurrentUserIdForRole,
    loadingRoleUpdate,
    handleRoleUpdate,
    showEditRoleModal,
    onSearch,
    handlePageChange,
    handleBatchDelete,
    handleAddUser,
    handleResetPassword,
    handleSecurityQuestion,
    handleChangeSecurityQuestion,
    handleDepartmentUpdate,
    refreshUsers,
    isRefreshing,
    lastSyncTime,
  };
};

export default useUsersList;
