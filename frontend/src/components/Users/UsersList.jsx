import {
  Table,
  Tag,
  Button,
  Input,
  Card,
  Pagination,
  Tooltip,
  Typography,
  Select,
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  SearchOutlined,
  LockOutlined,
  EditOutlined,
  SecurityScanOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import ModalForms from '../ModalForms';
import useUsersList from '../../hooks/useUsersList'; // Adjust the path if needed
import { useMediaQuery } from 'react-responsive';

const { Text } = Typography;
const { Option } = Select;

const DEPARTMENT_OPTIONS = [
  'SOD',
  'CID',
  'GAD',
  'HRD',
  'AFD',
  'EOD',
  'BDO'
];

const UsersList = () => {
  const isMobile = useMediaQuery({ maxWidth: 639 });

  const {
    selectedRowKeys,
    searchText,
    filteredData,
    isAddModalVisible,
    isPasswordModalVisible,
    isSecurityQuestionModalVisible,
    temporaryPassword,
    securityQuestions,
    currentUserSecurityQuestion,
    currentPage,
    pageSize,
    loading,
    isRoleModalVisible,
    setIsRoleModalVisible,
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
    handleDepartmentUpdate,
    refreshUsers,
  } = useUsersList();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '100px',
      responsive: ['sm'],
      sorter: (a, b) => a.id - b.id,
      className: 'text-xs overflow-auto',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: '120px',
      className: 'text-xs overflow-auto',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: '140px',
      className: 'text-xs overflow-auto text-wrap',
      sorter: (a, b) => a.department.localeCompare(b.department),
      render: (department, record) => (
        <Select
          value={department}
          style={{ width: 'auto' }}
          size={isMobile ? 'small':'middle'}
          onChange={(value) => handleDepartmentUpdate(record.id, value)}
          disabled={record.role === 'guest'}
          className='transparent-select'
        >
          {DEPARTMENT_OPTIONS.map(dept => (
            <Option key={dept} value={dept}>{dept}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      className: 'text-xs overflow-auto',
      responsive: ['sm'],
      width: '120px',
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
      responsive: ['sm'],
      width: '120px',
      className: 'text-xs overflow-auto',
      render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'text-xs overflow-auto',
      width: '120px',
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
      title={<span className="text-lgi sm:text-sm md:text-md lg:text-lgi xl:text-xl font-bold flex justify-center">ALL USERS</span>}
      className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none"
    >
      <div className="flex justify-start items-center mb-4 space-x-2">
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={onSearch}
          className="w-auto text-xs border border-black"
          suffix={
            searchText ? (
              <Button
                type="text"
                onClick={() => {
                  onSearch({ target: { value: '' } });
                }}
                className="text-xs"
                size="small"
                tabIndex={-1}
                style={{ padding: 0, height: 'auto', lineHeight: 1 }}
              >
                ×
              </Button>
            ) : null
          }
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
            type="link"
            icon={<DeleteOutlined />}
            danger
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchDelete}
          />
        </Tooltip>
        <Tooltip title="Refresh">
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={refreshUsers}
            className="w-auto text-xs"
            size='small'
          />
        </Tooltip>
      </div>
      <div className="w-auto overflow-x-auto" >
        <Table
          columns={columns}
          dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          pagination={false}
          bordered
          rowKey="id"
          rowSelection={rowSelection}
          className='w-auto'
          loading={loading}
          responsive= {['xs', 'sm', 'md', 'lg', 'xl']}
          scroll={{ x: 'max-content', y: 300 }}
          expandable={
            isMobile
              ? {
                  expandedRowRender: (record) => (
                    <div className="text-xs space-y-1">
                      <div><b>ID:</b> {record.id}</div>
                      <div><b>Username:</b> {record.username}</div>
                      <div><b>Department:</b> {record.department}</div>
                      <div><b>Role:</b> {record.role}</div>
                      <div><b>Status:</b> {record.status}</div>
                    </div>
                  ),
                  rowExpandable: () => true,
                }
              : undefined
          }
        />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 space-y-2 sm:space-y-0">
        <Text style={{ color: '#072C1C' }} className="w-full text-xs text-wrap text-center sm:text-left">
          Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </Text>
        <div className="w-full flex justify-center sm:justify-end">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          showSizeChanger
          pageSizeOptions={['5', '10', '15']}
          onChange={handlePageChange}
          className="text-xs"
          responsive
        />
        </div>
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
