import { Modal, Form, Input, Button, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTheme } from '../../utils/ThemeContext';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Title } = Typography;

const SaveTemplateModal = ({ 
  visible, 
  onCancel, 
  onSave, 
  templateName, 
  setTemplateName 
}) => {
  const { theme, currentTheme } = useTheme();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  const getThemeStyles = () => {
    if (currentTheme === 'default') {
      return {
        headerBg: '#A8E1C5',
        buttonBg: '#A8E1C5',
        buttonText: '#072C1C',
        textColor: '#072C1C',
        borderColor: '#f0f0f0'
      };
    }
    return {
      headerBg: theme.CardHead || theme.sider,
      buttonBg: theme.CardHead || theme.sider,
      buttonText: theme.text,
      textColor: theme.text,
      borderColor: theme.text
    };
  };

  const themeStyles = getThemeStyles();

  const handleSave = () => {
    onSave();
    logUserActivity('Save Template', `Saved template: ${templateName}`);
    logUserNotification('Save Template', `Saved template: ${templateName}`);
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <Title 
            level={4} 
            className="mb-0 font-semibold"
            style={{ color: themeStyles.textColor }}
          >
            Save as Template
          </Title>
          <p 
            className="text-sm mt-1 opacity-75"
            style={{ color: themeStyles.textColor }}
          >
            Save this item configuration for future use
          </p>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button 
          key="cancel" 
          onClick={onCancel} 
          size="small"
          style={{
            background: 'transparent',
            border: `1px solid ${themeStyles.borderColor}`,
            color: themeStyles.textColor,
            borderRadius: '6px',
            padding: '6px',
            height: 'auto',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          Cancel
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          onClick={handleSave}
          icon={<SaveOutlined />}
          size="small"
          style={{
            background: themeStyles.buttonBg,
            border: 'none',
            borderRadius: '6px',
            padding: '6px',
            height: 'auto',
            fontSize: '12px',
            fontWeight: '600',
            color: themeStyles.buttonText
          }}
        >
          Save Template
        </Button>
      ]}
      className="template-modal"
      styles={{
        header: { 
          borderBottom: `1px solid ${themeStyles.borderColor}`,
          padding: '24px 24px 16px 24px',
          background: themeStyles.headerBg,
          borderRadius: '12px 12px 0 0'
        },
        content: { 
          borderRadius: '12px', 
          overflow: 'hidden',
          background: currentTheme === 'default' ? '#fff' : theme.componentBackground
        },
        body: {
          padding: '24px'
        }
      }}
    >
      <div className="p-6">
        <p 
          className="text-gray-600 mb-6"
          style={{ color: themeStyles.textColor }}
        >
          Would you like to save this item as a template for future use?
        </p>
        <Form.Item
          label={
            <span 
              className="font-semibold"
              style={{ color: themeStyles.textColor }}
            >
              Template Name
            </span>
          }
          required
          tooltip="Enter a unique name for this template"
        >
          <Input
            size="large"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
            style={{
              background: currentTheme === 'default' ? '#fff' : theme.componentBackground,
              borderColor: themeStyles.borderColor,
              color: themeStyles.textColor
            }}
          />
        </Form.Item>
      </div>
    </Modal>
  );
};

export default SaveTemplateModal; 