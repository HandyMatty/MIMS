import { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, DatePicker, App, Tag } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const departmentOptions = [
  'SOD', 'CID', 'GAD', 'HRD', 'AFD', 'EOD', 'BDO'
];

const typeOptions = [
  'AVR', 'Battery', 'Biometrics', 'Camera', 'CCTV', 'Charger', 'Guard Tour Chips', 'Guard Tour System', 'Headset', 'Keyboard', 'Laptop', 'Megaphone', 'WIFI-Mesh', 'Metal Detector', 'Microphone', 'Modem', 'Monitor', 'Mouse', 'Others', 'Pedestal', 'Podium', 'Printer', 'Radio', 'Router', 'Search Stick', 'Searchlight', 'Smartphone', 'Speaker', 'Switch', 'System Unit', 'Under Chassis', 'UPS'
];
const conditionOptions = ['Brand New', 'Good Condition', 'Defective'];
const statusOptions = ['On Stock', 'For Repair', 'Deployed'];

export default function BatchEditItemModal({ visible, onClose, onBatchEdit, loading, selectedItems }) {
  const { message } = App.useApp();
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [serialModalRowIdx, setSerialModalRowIdx] = useState(null);

  useEffect(() => {
    if (visible) {
      const processedRows = selectedItems.map(item => {
        let locationType = '';
        let department = '';
        let location = '';
        if (item.location && item.location.startsWith('Head Office - ')) {
          locationType = 'Head Office';
          department = item.location.replace('Head Office - ', '');
          location = '';
        } else {
          locationType = 'Other';
          department = '';
          location = item.location || '';
        }
        return {
          ...item,
          locationType,
          department,
          location,
          showQuantityWithSerial: !!item.serialNumber,
          lastSerialModalValue: '',
          serialModalShownForCurrentInput: false,
        };
      });
      
      setRows(processedRows);
      setOriginalRows(JSON.parse(JSON.stringify(processedRows)));
    }
  }, [visible, selectedItems]);

  const hasChanges = (currentRow, originalRow) => {
    const fieldsToCompare = [
      'type', 'brand', 'serialNumber', 'quantity', 'remarks', 
      'issuedDate', 'purchaseDate', 'condition', 'status', 
      'locationType', 'department', 'location'
    ];
    
    for (const field of fieldsToCompare) {
      const currentValue = currentRow[field];
      const originalValue = originalRow[field];
      
      if (field === 'issuedDate' || field === 'purchaseDate') {
        const currentDate = currentValue && currentValue !== '0000-00-00' ? currentValue : '';
        const originalDate = originalValue && originalValue !== '0000-00-00' ? originalValue : '';
        if (currentDate !== originalDate) return true;
      } else {
        if (currentValue !== originalValue) return true;
      }
    }
    
    return false;
  };

  const getChangedItems = () => {
    return rows.filter((row, index) => hasChanges(row, originalRows[index]));
  };

  const handleFieldChange = (idx, field, value) => {
    setRows(rows => rows.map((row, i) => {
      if (i !== idx) return row;
      
      if (field === 'serialNumber') {
        if (value && !row.showQuantityWithSerial && !row.serialModalShownForCurrentInput) {
          setSerialModalRowIdx(idx);
          return { ...row, serialNumber: value, lastSerialModalValue: value, serialModalShownForCurrentInput: true };
        }
        if (value === '') {
          return { ...row, serialNumber: '', showQuantityWithSerial: false, quantity: 1, lastSerialModalValue: '', serialModalShownForCurrentInput: false };
        }
        return { ...row, serialNumber: value };
      }
      
      return { ...row, [field]: value };
    }));
  };

  const handleSerialModalOk = () => {
    if (serialModalRowIdx !== null) {
      setRows(rows => rows.map((row, i) => i === serialModalRowIdx ? { ...row, showQuantityWithSerial: true } : row));
      setSerialModalRowIdx(null);
    }
  };

  const handleSerialModalCancel = () => {
    if (serialModalRowIdx !== null) {
      setRows(rows => rows.map((row, i) => i === serialModalRowIdx ? { ...row, showQuantityWithSerial: false, quantity: 1 } : row));
      setSerialModalRowIdx(null);
    }
  };

  const handleDateChange = (idx, field, date) => {
    setRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: date ? dayjs(date).format('YYYY-MM-DD') : '' } : row));
  };

  const validateRow = (row) => {
    if (!row.type || !row.brand || row.quantity <= 0 || !row.condition || !row.status || !row.locationType) return false;
    if (row.locationType === 'Head Office' && !row.department) return false;
    if (row.locationType === 'Other' && !row.location) return false;
    return true;
  };

  const getFinalLocation = (row) => {
    if (row.locationType === 'Head Office') {
      return `Head Office - ${row.department}`;
    } else if (row.locationType === 'Other') {
      return row.location;
    }
    return '';
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    const changedItems = getChangedItems();
    const unchangedCount = rows.length - changedItems.length;
    
    if (changedItems.length === 0) {
      message.warning('No changes detected. All items remain unchanged.');
      setSubmitting(false);
      return;
    }
    if (unchangedCount > 0) {
      message.info(`${unchangedCount} item(s) had no changes and were not updated.`);
    }
    let allValid = true;
    for (const row of changedItems) {
      if (!validateRow(row)) {
        allValid = false;
        break;
      }
    }
    
    if (!allValid) {
      message.error('Please fill all required fields for each changed item.');
      setSubmitting(false);
      return;
    }
    
    const itemsToEdit = changedItems.map(row => {
      const itemToEdit = {
        ...row,
        location: getFinalLocation(row),
        quantity: row.serialNumber && !row.showQuantityWithSerial ? 1 : Math.max(1, row.quantity || 1),
      };
      delete itemToEdit.locationType;
      delete itemToEdit.department;
      delete itemToEdit.showQuantityWithSerial;
      return itemToEdit;
    });
    
    try {
      await onBatchEdit(itemsToEdit);
      message.success(`${itemsToEdit.length} item(s) updated successfully!`);
      onClose();
    } catch (e) {
      message.error('Failed to update some items.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 120,
      render: (value, row, idx) => (
        <div>
          <div>{value}</div>
          {hasChanges(row, originalRows[idx]) && (
            <Tag color="blue" size="small">Modified</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value, _, idx) => (
        <Select
          value={value}
          onChange={val => handleFieldChange(idx, 'type', val)}
          style={{ minWidth: 170 }}
          size="small"
        >
          {typeOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
        </Select>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      render: (value, _, idx) => (
        <Input value={value} onChange={e => handleFieldChange(idx, 'brand', e.target.value)}
         size="small" placeholder="Enter brand name" />
      ),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      render: (value, _, idx) => (
        <Input value={value} onChange={e => handleFieldChange(idx, 'serialNumber', e.target.value)} size="small" placeholder="Enter serial number" />
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      render: (value, row, idx) => (
        <Input 
          type="number" 
          min={1} 
          value={row.quantity}
          onChange={e => handleFieldChange(idx, 'quantity', Number(e.target.value))} 
          size="small" 
          style={{ width: 60 }}
          disabled={row.serialNumber && !row.showQuantityWithSerial}
        />
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      render: (value, _, idx) => (
        <Input.TextArea
          value={value}
          onChange={e => handleFieldChange(idx, 'remarks', e.target.value)}
          size="small"
          rows={3}
          placeholder="Enter any additional remarks"
        />
      ),
    },
    {
      title: 'Issued Date',
      dataIndex: 'issuedDate',
      render: (value, _, idx) => (
        <DatePicker
          value={value && value !== '0000-00-00' && value !== '' ? dayjs(value, 'YYYY-MM-DD') : null}
          onChange={date => handleDateChange(idx, 'issuedDate', date)}
          format="YYYY-MM-DD"
          size="small"
          style={{ width: 120 }}
          allowClear
        />
      ),
    },
    {
      title: 'Purchased Date',
      dataIndex: 'purchaseDate',
      render: (value, _, idx) => (
        <DatePicker
          value={value && value !== '0000-00-00' && value !== '' ? dayjs(value, 'YYYY-MM-DD') : null}
          onChange={date => handleDateChange(idx, 'purchaseDate', date)}
          format="YYYY-MM-DD"
          size="small"
          style={{ width: 120 }}
          allowClear
        />
      ),
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      render: (value, _, idx) => (
        <Select
          value={value}
          onChange={val => handleFieldChange(idx, 'condition', val)}
          style={{ minWidth: 150 }}
          size="small"
        >
          {conditionOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
        </Select>
      ),
    },
    {
      title: 'Detachment/Office',
      dataIndex: 'locationType',
      render: (value, row, idx) => (
        <div style={{ minWidth: 200 }}>
          <Select
            value={value}
            onChange={val => handleFieldChange(idx, 'locationType', val)}
            size="small"
            placeholder="Select location type"
            style={{ width: 150, marginBottom: 4 }}
          >
            <Option value="Head Office">Head Office</Option>
            <Option value="Other">Other (Specify Below)</Option>
          </Select>
          {row.locationType === 'Head Office' && (
            <Select
              value={row.department}
              onChange={val => handleFieldChange(idx, 'department', val)}
              size="small"
              placeholder="Select department"
              style={{ width: 150, marginTop: 4 }}
            >
              {departmentOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
            </Select>
          )}
          {row.locationType === 'Other' && (
            <Input
              value={row.location}
              onChange={e => handleFieldChange(idx, 'location', e.target.value)}
              size="small"
              placeholder="Enter specific location"
              style={{ width: 140, marginTop: 4 }}
            />
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value, _, idx) => (
        <Select
          value={value}
          onChange={val => handleFieldChange(idx, 'status', val)}
          style={{ minWidth: 100 }}
          size="small"
        >
          {statusOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
        </Select>
      ),
    },
  ];

  const changedItemsCount = getChangedItems().length;
  const totalItemsCount = rows.length;

  return (
    <>
      <Modal
        open={serialModalRowIdx !== null}
        onOk={handleSerialModalOk}
        onCancel={handleSerialModalCancel}
        title="Serial Number Quantity"
        okText="Yes"
        cancelText="No"
        centered
      >
        Does the item you want to edit have only 1 serial number but has many quantities?
      </Modal>
      
      <Modal
        open={visible}
        title="Batch Edit Items"
        onCancel={onClose}
        onOk={handleSubmit}
        okText="Submit All"
        confirmLoading={submitting || loading}
        width={1500}
        footer={[
          <Button key="cancel" onClick={onClose} className='custom-button-cancel' disabled={submitting || loading}>Cancel</Button>,
          <Button key="submit" type="primary" className='custom-button' onClick={handleSubmit} loading={submitting || loading}>
            Submit {changedItemsCount > 0 ? `(${changedItemsCount}/${totalItemsCount})` : ''}
          </Button>,
        ]}
      >
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="text-sm text-blue-800">
            <strong>Change Detection:</strong> {changedItemsCount} of {totalItemsCount} items have changes.
            {changedItemsCount === 0 && ' No changes detected - only modified items will be submitted.'}
          </div>
        </div>
        
        <Table
          bordered
          dataSource={rows}
          columns={columns}
          rowKey={record => record.id}
          pagination={false}
          size="small"
          scroll={{ x: "max-content", y: 600 }}
          responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
          rowClassName={(record, index) => {
            return hasChanges(record, originalRows[index]) ? 'bg-blue-50' : '';
          }}
        />
        <div className="text-xs text-gray-500 mt-2">* Required fields: Type, Brand, Qty, Purchased Date, Condition, Status, Detachment/Office</div>
      </Modal>
    </>
  );
} 