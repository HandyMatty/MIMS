import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import {
  fetchUsersData,
  deleteUsers,
  addUser,
  updateSecurityQuestion,
  getSecurityQuestion,
  updateRole,
} from '../services/api/usersdata';
import { resetPasswordApi } from '../services/api/resetpassword';
import { generateTempPassword } from '../utils/password';
import { useActivity } from '../utils/ActivityContext';
import { useNotification } from '../utils/NotificationContext';

const useUsersList = () => {
  // States
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

  // Context hooks
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  // FUNCTIONS

  // Update user role
  const handleRoleUpdate = async (values) => {
    setLoadingRoleUpdate(true);
    try {
      const response = await updateRole(currentUserIdForRole, values.role);
      if (response.success) {
        message.success(response.message || 'Role updated successfully');
        setIsRoleModalVisible(false);
        // Update user in state immediately to reflect change in UI
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

  // Open the Edit Role modal
  const showEditRoleModal = (record) => {
    setCurrentUserRole(record.role);
    setCurrentUserIdForRole(record.id);
    setIsRoleModalVisible(true);
  };

  // Populate security questions on mount
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

  // Fetch users data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUsersData();
        setUsers(data.users);
        setFilteredData(data.users);
      } catch (error) {
        console.error('Error fetching users data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search function
  const onSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = users.filter((item) =>
      Object.values(item).some((field) => String(field).toLowerCase().includes(value))
    );
    setFilteredData(filtered);
  };

  // Pagination handler
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // Batch delete users
  const handleBatchDelete = () => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: `Are you sure you want to delete ${selectedRowKeys.length} user(s)? This action cannot be undone.`,
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await deleteUsers(selectedRowKeys);
          if (response.success) {
            message.success(response.message || 'Users deleted successfully');
            const updatedUsers = users.filter((user) => !selectedRowKeys.includes(user.id));
            setUsers(updatedUsers);
            setFilteredData(updatedUsers);
            setSelectedRowKeys([]); // Clear selection
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

  // Add a new user
  const handleAddUser = async (values) => {
    // Check if the username already exists (case-insensitive)
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
  

  // Reset a user's password
  const handleResetPassword = (userId) => {
    Modal.confirm({
      title: 'Are you sure you want to reset the password?',
      content: "This action will reset the user's password to a temporary one.",
      okText: 'Yes',
      cancelText: 'No',
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

  // Fetch security question for a user and open the modal
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

  // Change/update the security question
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

  // Return all states and functions needed by the component
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
  };
};

export default useUsersList;
