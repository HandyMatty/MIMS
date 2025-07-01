import { Modal, Form, Input, Button, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;

const SaveTemplateModal = ({ 
  visible, 
  onCancel, 
  onSave, 
  templateName, 
  setTemplateName 
}) => {
  return (
    <Modal
      title={
        <div className="text-center">
          <Title level={4} className="mb-0 font-semibold">
            Save as Template
          </Title>
          <p className="text-sm mt-1 opacity-75">Save this item configuration for future use</p>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} size="large">
          Cancel
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          onClick={onSave}
          icon={<SaveOutlined />}
          size="large"
          style={{
            background: '#A8E1C5',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 24px',
            height: 'auto',
            fontSize: '14px',
            fontWeight: '600',
            color: '#072C1C'
          }}
        >
          Save Template
        </Button>
      ]}
      className="template-modal"
      styles={{
        header: { 
          borderBottom: '1px solid #f0f0f0',
          padding: '24px 24px 16px 24px',
          background: '#A8E1C5',
          borderRadius: '12px 12px 0 0'
        },
        content: { borderRadius: '12px', overflow: 'hidden' }
      }}
    >
      <div className="p-6">
        <p className="text-gray-600 mb-6">Would you like to save this item as a template for future use?</p>
        <Form.Item
          label={<span className="font-semibold">Template Name</span>}
          required
          tooltip="Enter a unique name for this template"
        >
          <Input
            size="large"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
        </Form.Item>
      </div>
    </Modal>
  );
};

export default SaveTemplateModal; 