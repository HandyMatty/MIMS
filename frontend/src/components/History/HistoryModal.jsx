import { Modal } from "antd";

const HistoryModal = ({ visible, onClose, record }) => {
  if (!record) return null;

  return (
    <Modal title="Changed Details" open={visible} onCancel={onClose} footer={null}>
      <div>
        <p><strong>Item ID:</strong> {record.item_id}</p>
        <p><strong>Action Date:</strong> {new Date(record.action_date).toLocaleString()}</p>
        
        {Array.isArray(record.field_changed) && record.field_changed.length > 0 ? (
          record.field_changed.map((field, index) => (
            <div key={index}>
              <p><strong>{field}:</strong></p>
              <p style={{ color: "red", textDecoration: "line-through" }}>
                Old: {record.old_value[index] ?? "N/A"}
              </p>
              <p style={{ color: "green" }}>
                New: {record.new_value[index] ?? "N/A"}
              </p>
              <hr />
            </div>
          ))
        ) : (
          <p>No changes recorded.</p>
        )}
      </div>
    </Modal>
  );
};

export default HistoryModal;
