// UsersList.jsx
import React from 'react';
import {
  Table,
  Tag,
  Button,
  Input,
  Card,
  Pagination,
  Tooltip,
  Typography,
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  SearchOutlined,
  LockOutlined,
  EditOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import ModalForms from '../ModalForms';
import useUsersList from '../../hooks/useUsersList'; // Adjust the path if needed

const { Text } = Typography;

const UsersList = () => {
  const {
    users,
    selectedRowKeys,
    searchText,
    filteredData,
    isAddModalVisible,
    isPasswordModalVisible,
    isSecurityQuestionModalVisible,
    temporaryPassword,
    securityQuestions,
    currentUserSecurityQuestion,
    currentUserId,
    currentPage,
    pageSize,
    loading,
    isRoleModalVisible,
    setIsRoleModalVisible, // Ensure this is included!
    currentUserRole,
    loadingRoleUpdate,
    setSelectedRowKeys,
    setIsAddModalVisible,
    setIsPasswordModalVisible,
    setIsSecurityQuestionModalVisible,
    onSearch,
    handlePageChange,
    handleBatchDelete,
    handleAddUser,
    handleResetPassword,
    handleSecurityQuestion,
    showEditRoleModal,
    handleRoleUpdate,
    handleChangeSecurityQuestion,
  } = useUsersList();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      ellipsis: true,
      sorter: (a, b) => a.department.localeCompare(b.department),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'blue' : role === 'user' ? 'green' : 'orange'}>
          {role}
        </Tag>
      ),
    },
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
            <Button
              icon={<LockOutlined />}
              type="text"
              onClick={() => handleResetPassword(record.id)}
            />
          </Tooltip>
          {record.role !== 'guest' && (
            <Tooltip title="Security Question">
              <Button
                icon={<SecurityScanOutlined />}
                type="text"
                onClick={() => handleSecurityQuestion(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Edit Role">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => showEditRoleModal(record)}
              loading={loadingRoleUpdate}
            />
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
    <Card
      title={<span className="text-5xl-6 font-bold flex justify-center">ALL USERS</span>}
      className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none"
    >
      <div className="flex justify-start items-center mb-4 space-x-2">
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={onSearch}
          className="w-64 bg-[#a7f3d0] border border-black custom-input-table"
        />
        <Tooltip title="Add User">
          <Button
            icon={<UserAddOutlined />}
            type="text"
            onClick={() => setIsAddModalVisible(true)}
          />
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
      <div style={{ height: '380px' }}>
        <Table
          columns={columns}
          dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          pagination={false}
          bordered
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          scroll={{ x: 'max-content', y: 300 }}
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
        isRoleModalVisible={isRoleModalVisible}
        setIsRoleModalVisible={setIsRoleModalVisible} 
        currentUserRole={currentUserRole}
        handleRoleUpdate={handleRoleUpdate}
      />
    </Card>
  );
};

export default UsersList;
