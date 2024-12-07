import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Input, Card, Pagination, Tooltip, Modal, message, Typography } from 'antd';
import { UserAddOutlined, DeleteOutlined, SearchOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';
import { fetchUsersData, deleteUsers, addUser, updateSecurityQuestion, getSecurityQuestion } from '../../services/api/usersdata';
import { resetPasswordApi } from '../../services/api/resetpassword';
import { generateTempPassword } from '../../utils/password';
import ModalForms from '../ModalForms';
import { useActivity } from '../../utils/ActivityContext';


const { Text } = Typography;

const UsersList = () => {
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
  const { logUserActivity } = useActivity();


  // Populate security questions on mount
  useEffect(() => {
    setSecurityQuestions([
      'What is your mother\'s maiden name?',
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

  // Fetch user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUsersData();
        setUsers(data.users);
        setFilteredData(data.users);
      } catch (error) {
        console.error('Error fetching users data:', error);
      }
    };

    fetchData();
  }, []); 

  const onSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = users.filter((item) =>
      Object.values(item).some((field) => String(field).toLowerCase().includes(value))
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
    } catch (error) {
      console.error('Error adding user:', error);
      message.error('Failed to add user');
    }
  };

  const handleResetPassword = (userId) => {
    Modal.confirm({
      title: 'Are you sure you want to reset the password?',
      content: 'This action will reset the user\'s password to a temporary one.',
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
        logUserActivity('Admin', 'User Management',  `Updated the security question for user with ID: "${currentUserId}"`);
      } else {
        message.error(response.message || 'Failed to update security question.');
      }
    } catch (error) {
      console.error('Error updating security question:', error);
      message.error('Failed to update security question.');
    }
  };
  
  

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username', sorter: (a, b) => a.username.localeCompare(b.username) },
    { title: 'Department', dataIndex: 'department', key: 'department', sorter: (a, b) => a.department.localeCompare(b.department) },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Tooltip title="Reset Password">
            <Button icon={<LockOutlined />} type="text" onClick={() => handleResetPassword(record.id)} />
          </Tooltip>
          <Tooltip title="Security Question">
            <Button icon={<EditOutlined />} type="text" onClick={() => handleSecurityQuestion(record.id)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  };

  return (
    <Card className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-4 border-none">
       <div className='mb-5'>
      <Text className="text-green-950 text-xl font-semibold mb-4">All Users</Text>
      </div>
      <div className="flex justify-start items-center mb-4 space-x-2">
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={onSearch}
          className="w-64 bg-[#a7f3d0] border border-black custom-input-table"
        />
        <Tooltip title="Add User">
          <Button icon={<UserAddOutlined />} type="text" onClick={() => setIsAddModalVisible(true)} />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            icon={<DeleteOutlined />}
            type="text"
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchDelete}
          />
        </Tooltip>
      </div>
      <div style={{ height: '400px', overflowY: 'auto' }}>
        <Table
          columns={columns}
          dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          pagination={false}
          bordered
          rowKey="id"
          rowSelection={rowSelection}
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Text style={{ color: '#072C1C' }}>
          Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </Text>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          showSizeChanger
          pageSizeOptions={['5', '10', '15']}
          onChange={handlePageChange}
          className="text-green-950"
        />
      </div>

      <ModalForms
        isAddModalVisible={isAddModalVisible}
        setIsAddModalVisible={setIsAddModalVisible}
        handleAddUser={handleAddUser}
        temporaryPassword={temporaryPassword}
        isPasswordModalVisible={isPasswordModalVisible}
        setIsPasswordModalVisible={setIsPasswordModalVisible}
        isSecurityQuestionModalVisible={isSecurityQuestionModalVisible}
        setIsSecurityQuestionModalVisible={setIsSecurityQuestionModalVisible}
        securityQuestions={securityQuestions}
        handleChangeSecurityQuestion={handleChangeSecurityQuestion}
        currentUserSecurityQuestion={currentUserSecurityQuestion}
      />
    </Card>
  );
};

export default UsersList;
