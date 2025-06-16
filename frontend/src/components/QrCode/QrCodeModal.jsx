import { Modal, QRCode } from 'antd';
import SINSSILogo from "../../../assets/SINSSI_LOGO-removebg-preview.png";


const QrCodeModal = ({ isVisible, onClose, qrDetails }) => {
  return (
    <Modal
      title="QR Code Details"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      centered
    >
      {qrDetails && (
        <QRCode
          icon={SINSSILogo}
          value={JSON.stringify(qrDetails)}
          size={256}
          color="#000000"
          style={{ margin: '0 auto' }}
        />
      )}
    </Modal>
  );
};

export default QrCodeModal;
