import { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, DatePicker, App, Checkbox, Space, Divider } from 'antd';
import { InputNumber } from 'antd';
import dayjs from 'dayjs';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Option } = Select;

const departmentOptions = [
  'SOD', 'CID', 'GAD', 'HRD', 'AFD', 'EOD', 'BDO'
];

const generateUid = () => `row-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const defaultRow = () => ({
  uid: generateUid(),
  type: '',
  brand: '',
  quantity: 1,
  remarks: '',
  serialNumber: '',
  issuedDate: '',
  purchaseDate: '',
  condition: '',
  locationType: 'Head Office',
  department: 'SOD',
  location: '',
  status: '',
  showQuantityWithSerial: false,
});

const typeOptions = [
  'AVR', 'Battery', 'Biometrics', 'Camera', 'CCTV', 'Charger', 'Guard Tour Chips', 'Guard Tour System', 'Headset', 'Keyboard', 'Laptop', 'Megaphone', 'WIFI-Mesh', 'Metal Detector', 'Microphone', 'Modem', 'Monitor', 'Mouse', 'Others', 'Pedestal', 'Podium', 'Printer', 'Radio', 'Router', 'Search Stick', 'Searchlight', 'Smartphone', 'Speaker', 'Switch', 'System Unit', 'Under Chassis', 'UPS'
];
const conditionOptions = ['Brand New', 'Good Condition', 'Defective'];
const statusOptions = ['On Stock', 'For Repair', 'Deployed'];

export default function BatchAddItemModal({ visible, onClose, onBatchAdd, loading }) {
  const { message } = App.useApp();
  const [rows, setRows] = useState([defaultRow()]);
  const [addRowCount, setAddRowCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [existingSerials, setExistingSerials] = useState([]);
  const [serialModalRowIdx, setSerialModalRowIdx] = useState(null);
  const [batchApplyModalVisible, setBatchApplyModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchApplyValues, setBatchApplyValues] = useState({
    type: '',
    condition: '',
    status: '',
    locationType: 'Head Office',
    department: 'SOD',
    location: '',
    purchaseDate: '',
    issuedDate: '',
  });
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  useEffect(() => {
    if (visible) {
      fetchExistingSerials();
    }
  }, [visible]);

  const fetchExistingSerials = async () => {
    try {
      const inventory = await getInventoryData();
      setExistingSerials(inventory.map(item => item.serialNumber).filter(Boolean));
    } catch (e) {
      setExistingSerials([]);
    }
  };

  const handleFieldChange = (idx, field, value) => {
    setRows(rows => rows.map((row, i) => {
      if (i !== idx) return row;
      if (field === 'serialNumber') {
        if (value && !row.showQuantityWithSerial && row.serialNumber === '') {
          setSerialModalRowIdx(idx);
        }
        if (value === '') {
          return { ...row, serialNumber: '', showQuantityWithSerial: false, quantity: 1 };
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

  const handleAddRow = () => {
    setRows(rows => [
      ...rows,
      ...Array.from({ length: Math.max(1, Math.min(addRowCount, 100)) }, () => defaultRow())
    ]);
    setAddRowCount(1);
  };
  const handleRemoveRow = (idx) => setRows(rows => rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);

  const validateRow = (row) => {
    if (!row.type || !row.brand || row.quantity <= 0 || !row.condition || !row.status || !row.locationType || !row.purchaseDate) return false;
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

  const resetRows = () => setRows([defaultRow()]);

  const handleSubmit = async () => {
    setSubmitting(true);
    let allValid = true;
    const today = dayjs().startOf('day');
    for (const row of rows) {
      if (!validateRow(row)) {
        allValid = false;
        break;
      }
      if (row.purchaseDate && dayjs(row.purchaseDate).isAfter(today, 'day')) {
        message.error('Purchase date cannot be in the future.');
        setSubmitting(false);
        return;
      }
    }
    if (!allValid) {
      message.error('Please fill all required fields for each item.');
      setSubmitting(false);
      return;
    }
    const serialsInBatch = rows.map(r => r.serialNumber).filter(Boolean);
    const serialsSet = new Set();
    for (const serial of serialsInBatch) {
      if (serialsSet.has(serial)) {
        message.error(`Duplicate serial number in batch: ${serial}`);
        setSubmitting(false);
        return;
      }
      serialsSet.add(serial);
      if (existingSerials.includes(serial)) {
        message.error(`Serial number already exists: ${serial}`);
        setSubmitting(false);
        return;
      }
    }
    const itemsToAdd = rows.map(row => {
      let purchaseDate = row.purchaseDate ? dayjs(row.purchaseDate).format('YYYY-MM-DD') : '';
      let issuedDate = row.issuedDate ? dayjs(row.issuedDate).format('YYYY-MM-DD') : '';
      return {
        type: row.type,
        brand: row.brand,
        quantity: row.serialNumber && !row.showQuantityWithSerial ? 1 : Math.max(1, row.quantity || 1),
        serialNumber: row.serialNumber || '',
        issuedDate,
        purchaseDate,
        condition: row.condition,
        location: getFinalLocation(row),
        status: row.status,
        remarks: row.remarks || '',
      };
    });
      try {
      await onBatchAdd(itemsToAdd);
      message.success(`${itemsToAdd.length} item(s) added successfully!`);
      logUserActivity('Batch Add', `Added ${itemsToAdd.length} item(s) to inventory.`);
      logUserNotification('Batch Add', `Added ${itemsToAdd.length} item(s) to inventory.`);
      resetRows();
      setSubmitting(false);
      onClose();
    } catch (e) {
      message.error('Failed to add items.');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetRows();
    onClose();
  };

  const handleBatchApply = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one row to apply batch operations.');
      return;
    }
    setBatchApplyModalVisible(true);
  };

  const handleBatchApplySubmit = () => {
    const updatedRows = rows.map(row => {
      if (selectedRowKeys.includes(row.uid)) {
        const updatedRow = { ...row };
        if (batchApplyValues.type) updatedRow.type = batchApplyValues.type;
        if (batchApplyValues.condition) updatedRow.condition = batchApplyValues.condition;
        if (batchApplyValues.status) updatedRow.status = batchApplyValues.status;
        if (batchApplyValues.locationType) {
          updatedRow.locationType = batchApplyValues.locationType;
          if (batchApplyValues.locationType === 'Head Office' && batchApplyValues.department) {
            updatedRow.department = batchApplyValues.department;
          } else if (batchApplyValues.locationType === 'Other' && batchApplyValues.location) {
            updatedRow.location = batchApplyValues.location;
          }
        }
        if (batchApplyValues.purchaseDate) updatedRow.purchaseDate = batchApplyValues.purchaseDate;
        if (batchApplyValues.issuedDate) updatedRow.issuedDate = batchApplyValues.issuedDate;
        
        return updatedRow;
      }
      return row;
    });
    
    setRows(updatedRows);
    setBatchApplyModalVisible(false);
    setSelectedRowKeys([]);
    message.success(`Applied batch values to ${selectedRowKeys.length} item(s)`);
  };

  const handleSelectAll = () => {
    if (selectedRowKeys.length === rows.length) {
      setSelectedRowKeys([]);
    } else {
      setSelectedRowKeys(rows.map(row => row.uid));
    }
  };

  const handleRemoveSelectedRows = () => {
    setRows(rows => rows.length > 1 ? rows.filter(row => !selectedRowKeys.includes(row.uid)) : rows);
    setSelectedRowKeys([]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
    getCheckboxProps: (record) => ({
      disabled: false,
    }),
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      className: 'text-xs',
      render: (value, _, idx) => (
        <Select
          value={value}
          onChange={val => handleFieldChange(idx, 'type', val)}
          style={{ minWidth: 170 }}
          size="small"
          className='text-xs'
        >
          {typeOptions.map(opt => <Option key={opt} value={opt}><span className='text-xs'>{opt}</span></Option>)}
        </Select>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      className: 'text-xs',
      render: (value, _, idx) => (
        <Input className='text-xs' value={value} onChange={e => handleFieldChange(idx, 'brand', e.target.value)}
         size="small" placeholder="Enter brand name" />
      ),
    },
    {
        title: 'Serial Number',
        dataIndex: 'serialNumber',
        className: 'text-xs',
        render: (value, _, idx) => (
          <Input className='text-xs' value={value} onChange={e => handleFieldChange(idx, 'serialNumber', e.target.value)} size="small" placeholder="Enter serial number" />
        ),
      },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      className: 'text-xs',
      render: (value, row, idx) => (
        <Input
          type="number"
          min={1}
          value={row.quantity}
          onChange={e => handleFieldChange(idx, 'quantity', Number(e.target.value))}
          size="small"
          style={{ width: 60 }}
          disabled={row.serialNumber && !row.showQuantityWithSerial}
          className='text-xs'
        />
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      className: 'text-xs',
      render: (value, _, idx) => (
        <Input.TextArea
          value={value}
          onChange={e => handleFieldChange(idx, 'remarks', e.target.value)}
          size="small"
          rows={3}
          placeholder="Enter any additional remarks"
          className='text-xs'
        />
      ),
    },
    {
      title: 'Issued Date',
      dataIndex: 'issuedDate',
      className: 'text-xs',
      render: (value, _, idx) => (
        <DatePicker
          value={value ? dayjs(value, 'YYYY-MM-DD') : null}
          onChange={date => handleDateChange(idx, 'issuedDate', date)}
          format="YYYY-MM-DD"
          size="small"
          style={{ width: 120 }}
          allowClear
          className='text-xs'
        />
      ),
    },
    {
      title: 'Purchased Date',
      dataIndex: 'purchaseDate',
      className: 'text-xs',
      render: (value, _, idx) => (
        <DatePicker
          value={value ? dayjs(value, 'YYYY-MM-DD') : null}
          onChange={date => handleDateChange(idx, 'purchaseDate', date)}
          format="YYYY-MM-DD"
          size="small"
          style={{ width: 120 }}
          allowClear
          className='text-xs'
        />
      ),
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      className: 'text-xs',
      render: (value, _, idx) => (
        <Select
          value={value}
          onChange={val => handleFieldChange(idx, 'condition', val)}
          style={{ minWidth: 150 }}
          size="small"
          className='text-xs'
        >
          {conditionOptions.map(opt => <Option key={opt} value={opt}><span className='text-xs'
            >{opt}</span></Option>)}
        </Select>
      ),
    },
    {
      title: 'Detachment/Office',
      dataIndex: 'locationType',
      className: 'text-xs',
      render: (value, row, idx) => (
        <div style={{ minWidth: 200 }}>
          <Select
            value={value}
            onChange={val => handleFieldChange(idx, 'locationType', val)}
            size="small"
            placeholder="Select location type"
            style={{ width: 150, marginBottom: 4 }}
            className='text-xs'
          >
            <Option value="Head Office"> <span className='text-xs'>Head Office</span></Option>
            <Option value="Other"><span className='text-xs'>Other (Specify Below)</span></Option>
          </Select>
          {row.locationType === 'Head Office' && (
            <Select
              value={row.department}
              onChange={val => handleFieldChange(idx, 'department', val)}
              size="small"
              placeholder="Select department"
              style={{ width: 150, marginTop: 4 }}
              className='text-xs'
            >
              {departmentOptions.map(opt => <Option key={opt} value={opt}><span className='text-xs'>{opt}</span></Option>)}
            </Select>
          )}
          {row.locationType === 'Other' && (
            <Input
              value={row.location}
              onChange={e => handleFieldChange(idx, 'location', e.target.value)}
              size="small"
              placeholder="Enter specific location"
              style={{ width: 140, marginTop: 4 }}
              className='text-xs'
            />
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      className: 'text-xs',
      render: (value, _, idx) => (
        <Select
          value={value}
          onChange={val => handleFieldChange(idx, 'status', val)}
          style={{ minWidth: 100 }}
          size="small"
          className='text-xs'
        >
          {statusOptions.map(opt => <Option key={opt} value={opt}><span className='text-xs'>{opt}</span></Option>)}
        </Select>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      className: 'text-xs',
      render: (_, __, idx) => (
        <Button danger className='text-xs' size="small" onClick={() => handleRemoveRow(idx)} disabled={rows.length === 1}>Remove</Button>
      ),
    },
  ];

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
        Does the item you want to add have only 1 serial number but has many quantities?
      </Modal>

      {/* Batch Apply Modal */}
      <Modal
        open={batchApplyModalVisible}
        title="Batch Apply Values"
        onCancel={() => setBatchApplyModalVisible(false)}
        onOk={handleBatchApplySubmit}
        okText="Apply to Selected"
        width={600}
      >
        <div className="space-y-4">
          <div className=" text-gray-600 mb-4">
            Apply the following values to {selectedRowKeys.length} selected item(s):
          </div>
          <div>
            <label className="block font-medium mb-1">Type</label>
            <Select
              value={batchApplyValues.type}
              onChange={value => setBatchApplyValues(prev => ({ ...prev, type: value }))}
              placeholder="Select type"
              allowClear
              style={{ width: '100%' }}
            >
              {typeOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block  font-medium mb-1">Condition</label>
              <Select
                value={batchApplyValues.condition}
                onChange={(value) => setBatchApplyValues(prev => ({ ...prev, condition: value }))}
                placeholder="Select condition"
                allowClear
                style={{ width: '100%' }}
              >
                {conditionOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
              </Select>
            </div>
            
            <div>
              <label className="block  font-medium mb-1">Status</label>
              <Select
                value={batchApplyValues.status}
                onChange={(value) => setBatchApplyValues(prev => ({ ...prev, status: value }))}
                placeholder="Select status"
                allowClear
                style={{ width: '100%' }}
              >
                {statusOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
              </Select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Location Type</label>
            <Select
              value={batchApplyValues.locationType}
              onChange={(value) => setBatchApplyValues(prev => ({ ...prev, locationType: value }))}
              placeholder="Select location type"
              style={{ width: '100%' }}
            >
              <Option value="Head Office">Head Office</Option>
              <Option value="Other">Other (Specify Below)</Option>
            </Select>
          </div>

          {batchApplyValues.locationType === 'Head Office' && (
            <div>
              <label className="block  font-medium mb-1">Department</label>
              <Select
                value={batchApplyValues.department}
                onChange={(value) => setBatchApplyValues(prev => ({ ...prev, department: value }))}
                placeholder="Select department"
                style={{ width: '100%' }}
              >
                {departmentOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
              </Select>
            </div>
          )}

          {batchApplyValues.locationType === 'Other' && (
            <div>
              <label className="block  font-medium mb-1">Location</label>
              <Input
                value={batchApplyValues.location}
                onChange={(e) => setBatchApplyValues(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter specific location"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block  font-medium mb-1">Purchase Date</label>
              <DatePicker
                value={batchApplyValues.purchaseDate ? dayjs(batchApplyValues.purchaseDate) : null}
                onChange={(date) => setBatchApplyValues(prev => ({ 
                  ...prev, 
                  purchaseDate: date ? dayjs(date).format('YYYY-MM-DD') : '' 
                }))}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                allowClear
              />
            </div>
            
            <div>
              <label className="block  font-medium mb-1">Issued Date</label>
              <DatePicker
                value={batchApplyValues.issuedDate ? dayjs(batchApplyValues.issuedDate) : null}
                onChange={(date) => setBatchApplyValues(prev => ({ 
                  ...prev, 
                  issuedDate: date ? dayjs(date).format('YYYY-MM-DD') : '' 
                }))}
                format="YYYY-MM-DD"
                style={{ width: '100%' }}
                allowClear
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={visible}
        title="Batch Add Items"
        onCancel={handleClose}
        onOk={handleSubmit}
        okText="Submit All"
        confirmLoading={submitting || loading}
        width={1500}
        footer={[
          <span key="add-row-group" className='flex flex-col justify-end sm:flex-row gap-2'>
            <InputNumber
              min={1}
              max={100}
              value={addRowCount}
              onChange={setAddRowCount}
              size="small"
              style={{ width: 60 }}
              disabled={submitting || loading}
            />
            <Button size='small' onClick={handleAddRow} className='custom-button text-xs' disabled={submitting || loading}>
              Add Row{addRowCount > 1 ? `s (${addRowCount})` : ''}
            </Button>
          <Button size='small' key="remove-selected" danger onClick={handleRemoveSelectedRows} className='text-xs' disabled={submitting || loading || selectedRowKeys.length === 0}>
            Remove Selected ({selectedRowKeys.length})
          </Button>
          <Button size='small' key="batch" onClick={handleBatchApply} className='custom-button text-xs' disabled={submitting || loading || selectedRowKeys.length === 0}>
            Batch Apply ({selectedRowKeys.length})
          </Button>
          <Button size='small' key="cancel" onClick={handleClose} className='custom-button-cancel text-xs'  disabled={submitting || loading}>Cancel</Button>
          <Button size='small' key="submit" type="primary" className='custom-button text-xs'  onClick={handleSubmit} loading={submitting || loading}>Submit All</Button>
        </span>
        ]}
      >
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center justify-between">
            <div className=" text-blue-800">
              <strong>Smart Batch Operations:</strong> Select rows and use "Batch Apply" to set common values for multiple items at once.
            </div>
            <Checkbox 
              checked={selectedRowKeys.length === rows.length && rows.length > 0}
              indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < rows.length}
              onChange={handleSelectAll}
              className="text-xs"
            >
              Select All ({selectedRowKeys.length}/{rows.length})
            </Checkbox>
          </div>
        </div>

        <Table
          bordered
          dataSource={rows}
          columns={columns}
          rowKey={row => row.uid}
          pagination={false}
          size="small"
          scroll={{ x: "max-content", y: 600 }}
          responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
          rowSelection={rowSelection}
          rowClassName={(record) => selectedRowKeys.includes(record.uid) ? 'bg-blue-50' : ''}
        />
        <div className="text-xs text-gray-500 mt-2">* Required fields: Type, Brand, Qty, Purchased Date, Condition, Status, Detachment/Office</div>
      </Modal>
    </>
  );
} 