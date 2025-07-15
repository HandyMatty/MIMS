import { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, DatePicker, App, Tag, Checkbox } from 'antd';
import dayjs from 'dayjs';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

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
  const [batchApplyModalVisible, setBatchApplyModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchApplyValues, setBatchApplyValues] = useState({
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
        quantity: row.serialNumber && !row.showQuantityWithSerial ? 1 : row.quantity,
      };
      delete itemToEdit.locationType;
      delete itemToEdit.department;
      delete itemToEdit.showQuantityWithSerial;
      return itemToEdit;
    });
    
    try {
      await onBatchEdit(itemsToEdit);
      message.success(`${itemsToEdit.length} item(s) updated successfully!`);
      logUserActivity('Batch Edit', `Edited ${itemsToEdit.length} item(s) in inventory.`);
      logUserNotification('Batch Edit', `Edited ${itemsToEdit.length} item(s) in inventory.`);
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
      className: 'text-xs',
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
        <Input value={value} className='text-xs' onChange={e => handleFieldChange(idx, 'brand', e.target.value)}
         size="small" placeholder="Enter brand name" />
      ),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      className: 'text-xs',
      render: (value, _, idx) => (
        <Input value={value} className='text-xs' onChange={e => handleFieldChange(idx, 'serialNumber', e.target.value)} size="small" placeholder="Enter serial number" />
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
          className='text-xs'
          disabled={row.serialNumber && !row.showQuantityWithSerial}
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
          className='text-xs'
          placeholder="Enter any additional remarks"
        />
      ),
    },
    {
      title: 'Issued Date',
      dataIndex: 'issuedDate',
      className: 'text-xs',
      render: (value, _, idx) => (
        <DatePicker
          value={value && value !== '0000-00-00' && value !== '' ? dayjs(value, 'YYYY-MM-DD') : null}
          onChange={date => handleDateChange(idx, 'issuedDate', date)}
          format="YYYY-MM-DD"
          size="small"
          className='text-xs'
          style={{ width: 120 }}
          allowClear
        />
      ),
    },
    {
      title: 'Purchased Date',
      dataIndex: 'purchaseDate',
      className: 'text-xs',
      render: (value, _, idx) => (
        <DatePicker
          value={value && value !== '0000-00-00' && value !== '' ? dayjs(value, 'YYYY-MM-DD') : null}
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
          {conditionOptions.map(opt => <Option key={opt} value={opt}><span className='text-xs'>{opt}</span></Option>)}
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
            className='text-xs'
            style={{ width: 150, marginBottom: 4 }}
          >
            <Option value="Head Office" ><span className='text-xs'>Head Office</span></Option>
            <Option value="Other"><span className='text-xs'>Other (Specify Below)</span></Option>
          </Select>
          {row.locationType === 'Head Office' && (
            <Select
              value={row.department}
              onChange={val => handleFieldChange(idx, 'department', val)}
              size="small"
              placeholder="Select department"
              style={{ width: 150, marginTop: 4 }}
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
      render: (value, _, idx) => (
        <Select
          value={value}
          onChange={val => handleFieldChange(idx, 'status', val)}
          style={{ minWidth: 100 }}
          size="small"
        >
          {statusOptions.map(opt => <Option key={opt} value={opt}><span className='text-xs'>{opt}</span></Option>)}
        </Select>
      ),
    },
  ];

  const handleBatchApply = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one row to apply batch operations.');
      return;
    }
    setBatchApplyModalVisible(true);
  };

  const handleBatchApplySubmit = () => {
    const updatedRows = rows.map(row => {
      if (selectedRowKeys.includes(row.id)) {
        const updatedRow = { ...row };
        
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
      setSelectedRowKeys(rows.map(row => row.id));
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
    getCheckboxProps: (record) => ({
      disabled: false,
    }),
  };

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
        open={batchApplyModalVisible}
        title="Batch Apply Values"
        onCancel={() => setBatchApplyModalVisible(false)}
        onOk={handleBatchApplySubmit}
        okText="Apply to Selected"
        width={600}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Apply the following values to {selectedRowKeys.length} selected item(s):
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
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
              <label className="block text-sm font-medium mb-1">Status</label>
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
            <label className="block text-sm font-medium mb-1">Location Type</label>
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
              <label className="block text-sm font-medium mb-1">Department</label>
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
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={batchApplyValues.location}
                onChange={(e) => setBatchApplyValues(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter specific location"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Purchase Date</label>
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
              <label className="block text-sm font-medium mb-1">Issued Date</label>
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
        title="Batch Edit Items"
        onCancel={onClose}
        onOk={handleSubmit}
        okText="Submit All"
        confirmLoading={submitting || loading}
        width={1500}
        footer={[
          <Button size='small' key="batch" onClick={handleBatchApply} className='custom-button text-xs' disabled={submitting || loading || selectedRowKeys.length === 0}>
            Batch Apply ({selectedRowKeys.length})
          </Button>,
          <Button size='small' key="cancel" onClick={onClose} className='custom-button-cancel text-xs' disabled={submitting || loading}>Cancel</Button>,
          <Button size='small' key="submit" type="primary" className='custom-button text-xs' onClick={handleSubmit} loading={submitting || loading}>
            Submit {changedItemsCount > 0 ? `(${changedItemsCount}/${totalItemsCount})` : ''}
          </Button>,
        ]}
      >
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <strong>Change Detection:</strong> {changedItemsCount} of {totalItemsCount} items have changes.
              {changedItemsCount === 0 && ' No changes detected - only modified items will be submitted.'}
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

        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-sm text-green-800">
            <strong>Smart Batch Operations:</strong> Select rows and use "Batch Apply" to set common values for multiple items at once.
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
          rowSelection={rowSelection}
          rowClassName={(record, index) => {
            const hasChangesClass = hasChanges(record, originalRows[index]) ? 'bg-blue-50' : '';
            const isSelectedClass = selectedRowKeys.includes(record.id) ? 'bg-green-50' : '';
            return `${hasChangesClass} ${isSelectedClass}`.trim();
          }}
        />
        <div className="text-xs text-gray-500 mt-2">* Required fields: Type, Brand, Qty, Purchased Date, Condition, Status, Detachment/Office</div>
      </Modal>
    </>
  );
} 