import { Button, Modal, Typography } from 'antd';
import { useState, memo, useCallback } from 'react';

const { Title, Text, Paragraph } = Typography;

const ContactInfo = memo(() => (
  <Paragraph>
    <Text strong>Contact Information:</Text><br />
    <Paragraph>
      📧 Email:{" "}
      <a href="mailto:newdeveloper@sentinelphils.com">
        "If you are the new Developer, you can edit/update the NoticeModal.jsx to place your email link"
      </a>{" "}
      &nbsp;|&nbsp;
      <a
        href="https://mail.google.com/mail/?view=cm&fs=1&to=newdeveloper@sentinelphils.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        "This is a GMAIL reference link for the new Developer"
      </a>
    </Paragraph>
    📱 Phone: <a href="tel:+placeyournewnumberhere">"New Contact Number"</a>
  </Paragraph>
));

ContactInfo.displayName = 'ContactInfo';

const NoticeModal = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleOk = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <Modal
      title="📢 System Notice"
      open={isVisible}
      footer={[
        <Button key="ok" type="primary" onClick={handleOk} style={{background: 'var(--theme-card-head-bg, #006400 )', 
        color: 'var(--theme-component-bg, #a7f3d0 )'}}>
          Got it
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
      centered
      destroyOnHidden
    >
      <Title level={4}>Welcome to the System!</Title>

      <Paragraph>
        Dear users, if you encounter any issues or bugs while using the system, please don't hesitate to reach out. The system is currently undergoing continuous improvements, and your feedback is highly appreciated.
      </Paragraph>

      <ContactInfo />

      <Paragraph>Thank you for your understanding and support!</Paragraph>
    </Modal>
  );
};

export default memo(NoticeModal);
