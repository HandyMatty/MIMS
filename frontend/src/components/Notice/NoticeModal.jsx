import { Button, Modal, Typography } from 'antd';
import { useState, useEffect, memo, useCallback } from 'react';

const { Title, Text, Paragraph } = Typography;

// Memoize the contact information section
const ContactInfo = memo(() => (
  <Paragraph>
    <Text strong>Contact Information:</Text><br />
    <Paragraph>
      📧 Email:{" "}
      <a href="mailto:matthewlondonio@sentinelphils.com">
        matthewlondonio@sentinelphils.com
      </a>{" "}
      &nbsp;|&nbsp;
      <a
        href="https://mail.google.com/mail/?view=cm&fs=1&to=matthewlondonio@sentinelphils.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open in Gmail
      </a>
    </Paragraph>
    📱 Phone: <a href="tel:+639951088710">+63 995 108 8710</a>
  </Paragraph>
));

ContactInfo.displayName = 'ContactInfo';

const NoticeModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay showing the modal to improve initial page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOk = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <Modal
      title="📢 System Notice"
      open={isVisible}
      footer={[
        <Button key="ok" type="primary" onClick={handleOk}>
          Got it
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
      centered
      destroyOnClose
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
