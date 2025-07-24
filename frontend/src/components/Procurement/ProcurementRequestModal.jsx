import { useState, useEffect } from 'react';
import {
  Modal, Button, Form, Input, Select, DatePicker,
  Space, InputNumber, Typography, Grid, Alert, Row, Col, Table, Tooltip, message
} from 'antd';
import { createProcurementRequest } from '../../services/api/procurement';
import { getInventoryData } from '../../services/api/addItemToInventory';
import dayjs from 'dayjs';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Option } = Select;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const typeOptions = [
  'AVR', 'Battery', 'Biometrics', 'Camera', 'CCTV', 'Charger', 'Guard Tour Chips',
  'Guard Tour System', 'Headset', 'Keyboard', 'Laptop', 'Megaphone', 'WIFI-Mesh',
  'Metal Detector', 'Microphone', 'Modem', 'Monitor', 'Mouse', 'Others', 'Pedestal',
  'Podium', 'Printer', 'Radio', 'Router', 'Search Stick', 'Searchlight', 'Smartphone',
  'Speaker', 'Switch', 'System Unit', 'Under Chassis', 'UPS'
];
const departmentOptions = ['GAD', 'CID', 'SOD', 'HRD', 'AFD', 'EDO', 'BDO'];

const generateUid = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const defaultItem = () => ({
  uid: generateUid(),
  type: '',
  brand: '',
  serial_number: '',
  purchase_date: '',
  locationType: 'Head Office',
  department: 'SOD',
  location: '',
  status: '',
  remarks: '',
  quantity: 1,
  showQuantityWithSerial: false,
});

const ProcurementRequestModal = ({ visible, onClose, onSuccess, currentUser, disabled }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([defaultItem()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batchFields, setBatchFields] = useState({ 
    type: '', 
    purchase_date: '', 
    quantity: 1,
    locationType: 'Head Office',
    department: 'SOD',
    location: ''
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [serialModalRowIdx, setSerialModalRowIdx] = useState(null);
  const [addRowCount, setAddRowCount] = useState(1);
  const [existingSerials, setExistingSerials] = useState([]);
  const screens = useBreakpoint();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        department: currentUser.department || '',
      });
    }
  }, [currentUser, form]);

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
      console.error('Failed to fetch existing serial numbers:', e);
      setExistingSerials([]);
    }
  };

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      
      if (field === 'serial_number') {
        const serialsInBatch = prev.map((it, index) => 
          index !== i ? it.serial_number : null
        ).filter(Boolean);
        
        if (value && serialsInBatch.includes(value)) {
          message.error(`Duplicate serial number in this request: ${value}`);
          return item;
        }
        
        if (value && existingSerials.includes(value)) {
          message.error(`Serial number already exists in inventory: ${value}`);
          return item;
        }
        
        if (value && !item.showQuantityWithSerial && item.serial_number === '') {
          setSerialModalRowIdx(idx);
        }
        if (value === '') {
          return { ...item, serial_number: '', showQuantityWithSerial: false, quantity: 1 };
        }
        return { ...item, serial_number: value };
      }
      
      return { ...item, [field]: value };
    }));
  };

  const handleSerialModalOk = () => {
    if (serialModalRowIdx !== null) {
      setItems(prev => prev.map((item, i) => 
        i === serialModalRowIdx ? { ...item, showQuantityWithSerial: true } : item
      ));
      setSerialModalRowIdx(null);
    }
  };

  const handleSerialModalCancel = () => {
    if (serialModalRowIdx !== null) {
      setItems(prev => prev.map((item, i) => 
        i === serialModalRowIdx ? { ...item, showQuantityWithSerial: false, quantity: 1 } : item
      ));
      setSerialModalRowIdx(null);
    }
  };

  const getFinalLocation = (item) => {
    if (item.locationType === 'Head Office') {
      return `Head Office - ${item.department}`;
    } else if (item.locationType === 'Other') {
      return item.location;
    }
    return '';
  };

  const handleAddRow = () => {
    setItems(prev => [
      ...prev,
      ...Array.from({ length: Math.max(1, Math.min(addRowCount, 100)) }, () => defaultItem())
    ]);
    setAddRowCount(1);
  };

  const handleBatchApply = () => {
    setItems(prev => prev.map((item) => {
      if (selectedRowKeys.length === 0 || selectedRowKeys.includes(item.uid)) {
        return {
          ...item,
          type: batchFields.type || item.type,
          purchase_date: batchFields.purchase_date || item.purchase_date,
          locationType: batchFields.locationType || item.locationType,
          department: batchFields.department || item.department,
          location: batchFields.location || item.location,
          quantity: batchFields.quantity || item.quantity,
        };
      }
      return item;
    }));
  };

  const handleDuplicateItem = (idx) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(idx + 1, 0, { ...prev[idx], uid: generateUid() });
      return newItems;
    });
  };

  const handleRemoveItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      render: (val, record, idx) => (
        <Select
          value={val}
          onChange={v => handleItemChange(idx, 'type', v)}
          style={{ width: 100 }}
          size="small"
        >
          {typeOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
        </Select>
      )
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      render: (val, record, idx) => (
        <Input value={val} onChange={e => handleItemChange(idx, 'brand', e.target.value)} style={{ width: 100 }} size="small" />
      )
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      render: (val, record, idx) => (
        <Input 
          value={val} 
          onChange={e => handleItemChange(idx, 'serial_number', e.target.value)} 
          style={{ width: 120 }} 
          size="small"
          placeholder="Enter unique serial"
        />
      )
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchase_date',
      render: (val, record, idx) => (
        <DatePicker
          value={val ? dayjs(val) : undefined}
          onChange={d => handleItemChange(idx, 'purchase_date', d ? d.format('YYYY-MM-DD') : '')}
          style={{ width: 120 }}
          size="small"
        />
      )
    },
    {
      title: 'Detachment/Office',
      dataIndex: 'locationType',
      render: (val, record, idx) => (
        <div style={{ minWidth: 200 }}>
          <Select
            value={val}
            onChange={v => handleItemChange(idx, 'locationType', v)}
            size="small"
            placeholder="Select location type"
            style={{ width: 150, marginBottom: 4 }}
          >
            <Option value="Head Office">Head Office</Option>
            <Option value="Other">Other (Specify Below)</Option>
          </Select>
          {record.locationType === 'Head Office' && (
            <Select
              value={record.department}
              onChange={v => handleItemChange(idx, 'department', v)}
              size="small"
              placeholder="Select department"
              style={{ width: 150, marginTop: 4 }}
            >
              {departmentOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
            </Select>
          )}
          {record.locationType === 'Other' && (
            <Input
              value={record.location}
              onChange={e => handleItemChange(idx, 'location', e.target.value)}
              size="small"
              placeholder="Enter specific location"
              style={{ width: 140, marginTop: 4 }}
            />
          )}
        </div>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (val, record, idx) => (
        <InputNumber 
          min={1} 
          value={val} 
          onChange={v => handleItemChange(idx, 'quantity', v)} 
          style={{ width: 80 }} 
          size="small"
          disabled={record.serial_number && !record.showQuantityWithSerial}
        />
      )
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      render: (val, record, idx) => (
        <Input value={val} onChange={e => handleItemChange(idx, 'remarks', e.target.value)} style={{ width: 120 }} size="small" />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, __, idx) => (
        <Space>
          <Tooltip title="Duplicate this item"><Button onClick={() => handleDuplicateItem(idx)} size="small" className='text-xs custom-button'>Duplicate</Button></Tooltip>
          <Tooltip title="Remove this item"><Button danger onClick={() => handleRemoveItem(idx)} size="small" className='text-xs' disabled={items.length === 1}>Remove</Button></Tooltip>
        </Space>
      )
    }
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.type || !item.brand || !item.locationType || !item.quantity || !item.purchase_date) {
        setError(`Missing required fields in item #${i + 1}. Please fill all required fields including Purchase Date.`);
        setLoading(false);
        return;
      }
      if (item.locationType === 'Head Office' && !item.department) {
        setError(`Missing department for item #${i + 1}.`);
        setLoading(false);
        return;
      }
      if (item.locationType === 'Other' && !item.location) {
        setError(`Missing location for item #${i + 1}.`);
        setLoading(false);
        return;
      }
    }

    const serialsInRequest = items.map(item => item.serial_number).filter(Boolean);
    const serialsSet = new Set();
    for (const serial of serialsInRequest) {
      if (serialsSet.has(serial)) {
        setError(`Duplicate serial number in request: ${serial}`);
        setLoading(false);
        return;
      }
      serialsSet.add(serial);
      if (existingSerials.includes(serial)) {
        setError(`Serial number already exists in inventory: ${serial}`);
        setLoading(false);
        return;
      }
    }

    if (!values.department) {
      setError('Department is required.');
      setLoading(false);
      return;
    }
    
    try {
      const payload = {
        department: values.department,
        remarks: values.remarks,
        items: items.map(item => ({
          type: item.type,
          brand: item.brand,
          serial_number: item.serial_number,
          purchase_date: item.purchase_date,
          condition: 'Brand New',
          location: getFinalLocation(item),
          status: item.status || 'Requested',
          remarks: item.remarks,
          quantity: item.serial_number && !item.showQuantityWithSerial ? 1 : Math.max(1, item.quantity || 1),
        })),
      };
      const res = await createProcurementRequest(payload);
      if (res.success) {
        logUserActivity('Procurement Request', `Created procurement request with ${items.length} item(s) for department ${values.department}`);
        logUserNotification('Procurement Request', `Created procurement request with ${items.length} item(s) for department ${values.department}`);
        
        onClose();
        onSuccess?.();
      } else {
        setError(res.message || 'Failed to create request');
      }
    } catch (e) {
      setError(e.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={visible}
        title="New Procurement Request"
        onCancel={onClose}
        confirmLoading={loading}
        width={screens.xs ? '100%' : 1100}
        className={screens.xs ? 'top-2 p-0' : ''}
        okButtonProps={{ disabled }}
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={onClose} className="text-xs custom-button-cancel">
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()} disabled={disabled} className="text-xs custom-button">
            Submit
          </Button>
        ]}
      >
        {disabled && (
          <Alert
            type="info"
            message="Guests cannot submit procurement requests. Please log in as a user or admin."
            showIcon
            className="mb-4"
          />
        )}
        {error && <Text type="danger">{error}</Text>}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={disabled}
          className="space-y-2"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Department"
                name="department"
                rules={[{ required: true, message: 'Department is required' }]}
              >
                <Select
                  placeholder="Select department"
                  disabled={!currentUser || currentUser.role === 'guest'}
                  options={departmentOptions.map(dep => ({ label: dep, value: dep }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea placeholder="General remarks about this request" />
              </Form.Item>
            </Col>
          </Row>
          <div className="mb-2">
            <h4 className="font-semibold mb-2">Items</h4>
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              <span className="font-semibold">Batch Apply:</span>
              <Select
                placeholder="Type"
                value={batchFields.type}
                onChange={v => setBatchFields(f => ({ ...f, type: v }))}
                className='w-24 text-xs'
                allowClear
                size="small"
              >
                {typeOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
              </Select>
              <DatePicker
                placeholder="Purchase Date"
                value={batchFields.purchase_date ? dayjs(batchFields.purchase_date) : undefined}
                onChange={d => setBatchFields(f => ({ ...f, purchase_date: d ? d.format('YYYY-MM-DD') : '' }))}
                className='w-28 text-xs'
                allowClear
                size="small"
              />
              <Select
                placeholder="Location Type"
                value={batchFields.locationType}
                onChange={v => setBatchFields(f => ({ ...f, locationType: v }))}
                className='w-auto text-xs'
                size="small"
              >
                <Option value="Head Office">Head Office</Option>
                <Option value="Other">Other</Option>
              </Select>
              {batchFields.locationType === 'Head Office' && (
                <Select
                  placeholder="Department"
                  value={batchFields.department}
                  onChange={v => setBatchFields(f => ({ ...f, department: v }))}
                  className='w-auto text-xs'
                  size="small"
                >
                  {departmentOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                </Select>
              )}
              {batchFields.locationType === 'Other' && (
                <Input
                  placeholder="Location"
                  value={batchFields.location}
                  onChange={e => setBatchFields(f => ({ ...f, location: e.target.value }))}
                  className='w-auto text-xs'
                  size="small"
                />
              )}
              <InputNumber
                min={1}
                placeholder="Quantity"
                value={batchFields.quantity}
                onChange={v => setBatchFields(f => ({ ...f, quantity: v }))}
                className='w-10 text-xs'
                size="small"
              />
              <Tooltip title={selectedRowKeys.length === 0 ? "Apply to all items" : "Apply only to selected items"}>
                <Button onClick={handleBatchApply} size="small" className='w-auto text-xs custom-button'>
                  Apply to {selectedRowKeys.length === 0 ? "All" : "Selected"}
                </Button>
              </Tooltip>
            </div>
            <div className="ant-table-body" style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <Table
                bordered
                dataSource={items}
                columns={columns}
                rowKey={item => item.uid}
                pagination={false}
                size="small"
                scroll={{ x: "max-content", y: 600 }}
                responsive={['sm', 'md', 'lg', 'xl', 'xxl']}
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                  type: 'checkbox',
                  getCheckboxProps: () => ({ style: { pointerEvents: 'auto' } })
                }}
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <InputNumber
                min={1}
                max={100}
                value={addRowCount}
                onChange={setAddRowCount}
                size="small"
                style={{ width: 60 }}
                className="text-xs"
              />
              <Button type="dashed" onClick={handleAddRow} size='small' className="text-xs custom-button">
                Add Row{addRowCount > 1 ? `s (${addRowCount})` : ''}
              </Button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Serial Number Modal */}
      <Modal
        open={serialModalRowIdx !== null}
        title="Serial Number Detected"
        onOk={handleSerialModalOk}
        onCancel={handleSerialModalCancel}
        okText="Yes, allow quantity > 1"
        cancelText="No, set quantity to 1"
      >
        <p>A serial number was entered. Typically, items with serial numbers have a quantity of 1.</p>
        <p>Do you want to allow a quantity greater than 1 for this item?</p>
      </Modal>
    </>
  );
};

export default ProcurementRequestModal;
