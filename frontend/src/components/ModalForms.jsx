import { useState } from 'react';
import { Modal, Form, Input, Select, Button, Typography } from 'antd';

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

const ModalForms = ({
  isAddModalVisible,
  setIsAddModalVisible,
  handleAddUser,
  temporaryPassword,
  isPasswordModalVisible,
  setIsPasswordModalVisible,
  isSecurityQuestionModalVisible,
  setIsSecurityQuestionModalVisible,
  securityQuestions,
  handleChangeSecurityQuestion,
  currentUserSecurityQuestion,
  isRoleModalVisible,
  setIsRoleModalVisible,
  currentUserRole,
  handleRoleUpdate,
}) => {
  const [isEditingSecurityQuestion, setIsEditingSecurityQuestion] = useState(false);

  // Form instances
  const [addUserForm] = Form.useForm();
  const [securityQuestionForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <>
      {/* Security Question Modal */}
      <Modal
  title="Security Question"
  open={isSecurityQuestionModalVisible}
  centered
  onCancel={() => {
    setIsSecurityQuestionModalVisible(false); // Close the modal
    setIsEditingSecurityQuestion(false); // Reset to the first view
    securityQuestionForm.resetFields(); // Clear the form fields
  }}
  footer={null}
>
  {!isEditingSecurityQuestion ? (
    <>
      {currentUserSecurityQuestion ? (
        <>
          <Text>
            Current Security Question: <strong>{currentUserSecurityQuestion}</strong>
          </Text>
          <Button
            type="primary"
            onClick={() => setIsEditingSecurityQuestion(true)}
            className='w-auto flex justify-self-end mt-5'
          >
            Change Security Question
          </Button>
        </>
      ) : (
        <>
          <Text>No security question set for this user.</Text>
          <Button
            type="primary"
            onClick={() => setIsEditingSecurityQuestion(true)}
            className='w-auto flex justify-self-end mt-5'
          >
            Add Security Question
          </Button>
        </>
      )}
    </>
  ) : (
    <Form
      form={securityQuestionForm}
      onFinish={(values) => {
        handleChangeSecurityQuestion(values);
        setIsEditingSecurityQuestion(false);
        setIsSecurityQuestionModalVisible(false); // Close the modal on successful save
        securityQuestionForm.resetFields(); // Reset the form after submission
      }}
    >
      <Form.Item
        name="security_question"
        label="Security Question"
        rules={[{ required: true, message: 'Please select a security question!' }]}
      >
        <Select placeholder="Select a security question">
              {securityQuestions.map((question, index) => (
            <Select.Option key={index} value={question}>
              {question}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="security_answer"
        label="Security Answer"
        rules={[{ required: true, message: 'Please provide an answer!' }]}
      >
        <Input.Password placeholder="Enter your answer" />
      </Form.Item>
      <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
        Save
      </Button>
      <Button
        onClick={() => {
          securityQuestionForm.resetFields(); // Reset fields without closing
          setIsEditingSecurityQuestion(false); // Exit editing mode
        }}
      >
        Cancel
      </Button>
    </Form>
  )}
</Modal>


      {/* Add User Modal */}
      <Modal
        title="Add User"
        open={isAddModalVisible}
        centered
        onCancel={() => {
          setIsAddModalVisible(false);
          addUserForm.resetFields(); 
          setSelectedRole(null); 
        }}
        footer={null}
      >
        <Form
          form={addUserForm}
          onFinish={(values) => {
            handleAddUser(values);
            addUserForm.resetFields(); 
            setSelectedRole(null); 
            setIsAddModalVisible(false); 
          }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
              <Input placeholder="Enter the username" />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select a department!' }]}
          >
            <Select placeholder="Select Department">
              {DEPARTMENT_OPTIONS.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role!' }]}
            >
              <Select
                placeholder="Select a role"
                onChange={(value) => setSelectedRole(value)} // Update state when role changes
              >
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="guest">Guest</Select.Option>
              </Select>
            </Form.Item>

            {/* Show security question only if role is NOT 'Guest' */}
            {selectedRole !== 'guest' && (
              <>
                <Form.Item
                  name="security_question"
                  label="Security Question"
                  rules={[{ required: true, message: 'Please select a security question!' }]}
                >
                  <Select placeholder="Select a security question">
                    {securityQuestions.map((question, index) => (
                      <Select.Option key={index} value={question}>
                        {question}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="security_answer"
                  label="Security Answer"
                  rules={[{ required: true, message: 'Please provide an answer!' }]}
                >
                  <Input.Password placeholder="Enter your answer" />
                </Form.Item>
              </>
            )}
          <Button type="primary" htmlType="submit">
            Add User
          </Button>
        </Form>
      </Modal>

      {/* Temporary Password Modal */}
      <Modal
        title="Temporary Password"
        open={isPasswordModalVisible}
        centered
        onCancel={() => setIsPasswordModalVisible(false)}
        footer={null}
      >
        <p>Your temporary password is: {temporaryPassword}</p>
      </Modal>

          {/* Edit Role Modal */}
        <Modal
          title="Edit Role"
          open={isRoleModalVisible}
          centered
          onCancel={() => {
            setIsRoleModalVisible(false);
            roleForm.resetFields(); // Reset form fields when modal closes
          }}
          footer={null}
          afterOpenChange={(visible) => {
            if (visible) {
              roleForm.setFieldsValue({ role: currentUserRole }); // Ensure the current role is pre-filled
            }
          }}
        >
          <Form
            form={roleForm}
            onFinish={(values) => {
              handleRoleUpdate(values);
              roleForm.resetFields(); // Reset form fields after submission
              setIsRoleModalVisible(false); // Close modal after updating role
            }}
          >
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role!' }]}
            >
              <Select>
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="guest">Guest</Select.Option>
              </Select>
            </Form.Item>
            <Button type="primary" htmlType="submit" className='flex justify-self-end'>
              Update Role
            </Button>
          </Form>
        </Modal>
    </>
  );
};

export default ModalForms;
