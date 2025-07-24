import { useEffect, useState, useMemo } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Typography, Table, App, Row, Col, Grid } from 'antd';
import dayjs from 'dayjs';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { getInventoryData } from '../../services/api/addItemToInventory';

const { Option } = Select;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const typeOptions = [
  'AVR', 'Battery', 'Biometrics', 'Camera', 'CCTV', 'Charger', 'Guard Tour Chips',
  'Guard Tour System', 'Headset', 'Keyboard', 'Laptop', 'Megaphone', 'WIFI-Mesh',
  'Metal Detector', 'Microphone', 'Modem', 'Monitor', 'Mouse', 'Others', 'Pedestal',
  'Podium', 'Printer', 'Radio', 'Router', 'Search Stick', 'Searchlight', 'Smartphone',
  'Speaker', 'Switch', 'System Unit', 'Under Chassis', 'UPS'
];
const conditionOptions = ['Brand New', 'Good Condition', 'Defective'];
const departmentOptions = ['GAD', 'CID', 'SOD', 'HRD', 'AFD', 'EDO', 'BDO'];

const AddToInventoryModal = ({ visible, request, onClose, onSubmit, confirmLoading }) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [batchData, setBatchData] = useState([]);
  const [existingSerials, setExistingSerials] = useState([]);
  const [serialModalRowIdx, setSerialModalRowIdx] = useState(null);
  const screens = useBreakpoint();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { message } = App.useApp();

  const approvedItems = useMemo(
    () => (request?.items || []).filter(i => i.status === 'Approved'),
    [request]
  );

  useEffect(() => {
    if (visible) {
      setSelectedKeys([]);
      setEditItem(null);
      setBatchData([]);
      fetchExistingSerials();
    }
  }, [visible, request]);

  const fetchExistingSerials = async () => {
    try {
      const inventory = await getInventoryData();
      setExistingSerials(inventory.map(item => item.serialNumber).filter(Boolean));
    } catch (e) {
      console.error('Failed to fetch existing serial numbers:', e);
      setExistingSerials([]);
    }
  };

  useEffect(() => {
    if (selectedKeys.length === 1) {
      const item = approvedItems.find(i => i.item_id === selectedKeys[0]);
      setEditItem(item);
    } else {
      setEditItem(null);
    }
  }, [selectedKeys, approvedItems]);

  useEffect(() => {
    if (selectedKeys.length > 1) {
      const items = approvedItems.filter(i => selectedKeys.includes(i.item_id));
      if (JSON.stringify(items) !== JSON.stringify(batchData)) {
        setBatchData(items.map(item => ({ 
          ...item, 
          locationType: item.location?.includes('Head Office') ? 'Head Office' : 'Other',
          department: item.location?.includes('Head Office') ? item.location.split(' - ')[1] || 'SOD' : 'SOD',
          location: item.location?.includes('Head Office') ? '' : item.location || '',
          showQuantityWithSerial: false
        })));
      }
    } else if (batchData.length > 0) {
      setBatchData([]);
    }
  }, [selectedKeys, approvedItems]);

  const handleBatchCellChange = (value, record, field) => {
    setBatchData(prev => prev.map(item => {
      if (item.item_id !== record.item_id) return item;
      
      if (field === 'serial_number') {
        const serialsInBatch = prev.map((it) => 
          it.item_id !== record.item_id ? it.serial_number : null
        ).filter(Boolean);
        
        if (value && serialsInBatch.includes(value)) {
          message.error(`Duplicate serial number in this batch: ${value}`);
          return item;
        }
        
        if (value && existingSerials.includes(value)) {
          message.error(`Serial number already exists in inventory: ${value}`);
          return item;
        }
        
        if (value && !item.showQuantityWithSerial && item.serial_number === '') {
          setSerialModalRowIdx(record.item_id);
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
      setBatchData(prev => prev.map((item) => 
        item.item_id === serialModalRowIdx ? { ...item, showQuantityWithSerial: true } : item
      ));
      setSerialModalRowIdx(null);
    }
  };

  const handleSerialModalCancel = () => {
    if (serialModalRowIdx !== null) {
      setBatchData(prev => prev.map((item) => 
        item.item_id === serialModalRowIdx ? { ...item, showQuantityWithSerial: false, quantity: 1 } : item
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

  const batchColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (val, record) => (
        <Select
          value={val}
          onChange={v => handleBatchCellChange(v, record, 'type')}
          style={{ width: screens.xs ? 80 : 100 }}
          size="small"
        >
          {typeOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
        </Select>
      )
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      render: (val, record) => (
        <Input
          value={val}
          onChange={e => handleBatchCellChange(e.target.value, record, 'brand')}
          style={{ width: screens.xs ? 80 : 100 }}
          size="small"
        />
      )
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (val, record) => (
        <Input
          value={val}
          onChange={e => handleBatchCellChange(e.target.value, record, 'serial_number')}
          style={{ width: screens.xs ? 100 : 120 }}
          size="small"
          placeholder="Enter unique serial"
        />
      )
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchase_date',
      key: 'purchase_date',
      render: (val, record) => (
        <DatePicker
          value={val ? dayjs(val) : undefined}
          onChange={d => handleBatchCellChange(d ? d.format('YYYY-MM-DD') : '', record, 'purchase_date')}
          style={{ width: screens.xs ? 100 : 120 }}
          size="small"
        />
      )
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      render: (val, record) => (
        <Select
          value={val}
          onChange={v => handleBatchCellChange(v, record, 'condition')}
          style={{ width: screens.xs ? 100 : 120 }}
          size="small"
        >
          {conditionOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
        </Select>
      )
    },
    {
      title: 'Detachment/Office',
      dataIndex: 'locationType',
      key: 'locationType',
      render: (val, record) => (
        <div style={{ minWidth: screens.xs ? 150 : 200 }}>
          <Select
            value={val}
            onChange={v => handleBatchCellChange(v, record, 'locationType')}
            size="small"
            placeholder="Select location type"
            style={{ width: screens.xs ? 120 : 150, marginBottom: 4 }}
          >
            <Option value="Head Office">Head Office</Option>
            <Option value="Other">Other (Specify Below)</Option>
          </Select>
          {record.locationType === 'Head Office' && (
            <Select
              value={record.department}
              onChange={v => handleBatchCellChange(v, record, 'department')}
              size="small"
              placeholder="Select department"
              style={{ width: screens.xs ? 120 : 150, marginTop: 4 }}
            >
              {departmentOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
            </Select>
          )}
          {record.locationType === 'Other' && (
            <Input
              value={record.location}
              onChange={e => handleBatchCellChange(e.target.value, record, 'location')}
              size="small"
              placeholder="Enter specific location"
              style={{ width: screens.xs ? 110 : 140, marginTop: 4 }}
            />
          )}
        </div>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val, record) => (
        <InputNumber
          min={1}
          value={val}
          onChange={v => handleBatchCellChange(v, record, 'quantity')}
          style={{ width: screens.xs ? 60 : 80 }}
          size="small"
          disabled={record.serial_number && !record.showQuantityWithSerial}
        />
      )
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (val, record) => (
        <Input
          value={val}
          onChange={e => handleBatchCellChange(e.target.value, record, 'remarks')}
          style={{ width: screens.xs ? 100 : 120 }}
          size="small"
        />
      )
    },
  ];

  const columns = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Brand', dataIndex: 'brand', key: 'brand' },
    { title: 'Serial Number', dataIndex: 'serial_number', key: 'serial_number' },
    { title: 'Purchase Date', dataIndex: 'purchase_date', key: 'purchase_date' },
    { title: 'Condition', dataIndex: 'condition', key: 'condition' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
  ];

  const SingleItemEditForm = ({ item, onSubmit, onClose, confirmLoading }) => {
    const [form] = Form.useForm();
    const [existingSerials, setExistingSerials] = useState([]);
    const [serialModalVisible, setSerialModalVisible] = useState(false);
    const [showQuantityWithSerial, setShowQuantityWithSerial] = useState(false);
    const { logUserActivity } = useActivity();
    const { logUserNotification } = useNotification();

    useEffect(() => {
      fetchExistingSerials();
    }, []);

    const fetchExistingSerials = async () => {
      try {
        const inventory = await getInventoryData();
        setExistingSerials(inventory.map(item => item.serialNumber).filter(Boolean));
      } catch (e) {
        console.error('Failed to fetch existing serial numbers:', e);
        setExistingSerials([]);
      }
    };

    useEffect(() => {
      if (item) {
        const locationType = item.location?.includes('Head Office') ? 'Head Office' : 'Other';
        const department = item.location?.includes('Head Office') ? item.location.split(' - ')[1] || 'SOD' : 'SOD';
        const location = item.location?.includes('Head Office') ? '' : item.location || '';
        
        form.setFieldsValue({
          ...item,
          purchase_date: item.purchase_date ? dayjs(item.purchase_date) : undefined,
          issued_date: item.issued_date ? dayjs(item.issued_date) : undefined,
          locationType,
          department,
          location,
        });
      }
    }, [item, form]);

    const handleSerialNumberChange = (e) => {
      const value = e.target.value;
      if (value && !showQuantityWithSerial && item.serial_number === '') {
        setSerialModalVisible(true);
      }
      if (value === '') {
        setShowQuantityWithSerial(false);
        form.setFieldsValue({ quantity: 1 });
      }
    };

    const handleFinish = (values) => {
      if (values.serial_number) {
        if (existingSerials.includes(values.serial_number)) {
          message.error(`Serial number already exists in inventory: ${values.serial_number}`);
          return;
        }
      }

      const finalLocation = values.locationType === 'Head Office' 
        ? `Head Office - ${values.department}` 
        : values.location;

      const payload = {
        ...item,
        ...values,
        purchase_date: values.purchase_date ? values.purchase_date.format('YYYY-MM-DD') : '',
        issued_date: values.issued_date ? values.issued_date.format('YYYY-MM-DD') : '',
        location: finalLocation,
        quantity: values.serial_number && !showQuantityWithSerial ? 1 : Math.max(1, values.quantity || 1),
      };

      logUserActivity('Add to Inventory', `Adding item ${item.type} ${item.brand} from procurement request #${request?.request_id} to inventory`);
      logUserNotification('Add to Inventory', `Adding item ${item.type} ${item.brand} from procurement request #${request?.request_id} to inventory`);

      onSubmit([payload]);
    };

    return (
      <>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ quantity: 1, locationType: 'Head Office', department: 'SOD' }}
          className={screens.xs ? 'text-xs' : ''}
        >
          <Row gutter={[screens.xs ? 8 : 16, screens.xs ? 4 : 8]}>
            <Col xs={24} md={12}>
              <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Type required' }]}>
                <Select placeholder="Select type" size={screens.xs ? 'small' : 'middle'}>
                  {typeOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Brand required' }]}>
                <Input placeholder="Brand" size={screens.xs ? 'small' : 'middle'} />
              </Form.Item>
              <Form.Item label="Serial Number" name="serial_number">
                <Input 
                  placeholder="Enter unique serial" 
                  size={screens.xs ? 'small' : 'middle'}
                  onChange={handleSerialNumberChange}
                />
              </Form.Item>
              <Form.Item label="Purchase Date" name="purchase_date" rules={[{ required: true, message: 'Purchase date required' }]}>
                <DatePicker className="w-full" size={screens.xs ? 'small' : 'middle'} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Condition" name="condition" rules={[{ required: true, message: 'Condition required' }]}>
                <Select placeholder="Select condition" size={screens.xs ? 'small' : 'middle'}>
                  {conditionOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item label="Location Type" name="locationType" rules={[{ required: true, message: 'Location type required' }]}>
                <Select 
                  placeholder="Select location type" 
                  size={screens.xs ? 'small' : 'middle'}
                  onChange={(value) => {
                    if (value === 'Head Office') {
                      form.setFieldsValue({ location: '' });
                    } else {
                      form.setFieldsValue({ department: '' });
                    }
                  }}
                >
                  <Option value="Head Office">Head Office</Option>
                  <Option value="Other">Other (Specify Below)</Option>
                </Select>
              </Form.Item>
              <Form.Item 
                noStyle 
                shouldUpdate={(prevValues, currentValues) => prevValues.locationType !== currentValues.locationType}
              >
                {({ getFieldValue }) => {
                  const locationType = getFieldValue('locationType');
                  return locationType === 'Head Office' ? (
                    <Form.Item label="Department" name="department" rules={[{ required: true, message: 'Department required' }]}>
                      <Select placeholder="Select department" size={screens.xs ? 'small' : 'middle'}>
                        {departmentOptions.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
                      </Select>
                    </Form.Item>
                  ) : locationType === 'Other' ? (
                    <Form.Item label="Location" name="location" rules={[{ required: true, message: 'Location required' }]}>
                      <Input placeholder="Enter specific location" size={screens.xs ? 'small' : 'middle'} />
                    </Form.Item>
                  ) : null;
                }}
              </Form.Item>
              <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: 'Quantity required' }]}>
                <InputNumber 
                  min={1} 
                  className="w-full" 
                  size={screens.xs ? 'small' : 'middle'}
                  disabled={form.getFieldValue('serial_number') && !showQuantityWithSerial}
                />
              </Form.Item>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea placeholder="Remarks" size={screens.xs ? 'small' : 'middle'} />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={onClose} className="custom-button-cancel" size={screens.xs ? 'small' : 'middle'}>Cancel</Button>
            <Button type="primary" htmlType="submit" className="custom-button" loading={confirmLoading} size={screens.xs ? 'small' : 'middle'}>Add to Inventory</Button>
          </div>
        </Form>

        {/* Serial Number Modal */}
        <Modal
          open={serialModalVisible}
          title="Serial Number Detected"
          onOk={() => {
            setShowQuantityWithSerial(true);
            setSerialModalVisible(false);
          }}
          onCancel={() => {
            setShowQuantityWithSerial(false);
            form.setFieldsValue({ quantity: 1 });
            setSerialModalVisible(false);
          }}
          okText="Yes, allow quantity > 1"
          cancelText="No, set quantity to 1"
        >
          <p>A serial number was entered. Typically, items with serial numbers have a quantity of 1.</p>
          <p>Do you want to allow a quantity greater than 1 for this item?</p>
        </Modal>
      </>
    );
  };

  const handleBatchAdd = () => {
    if (selectedKeys.length === 0) {
      message.warning('Please select at least one item.');
      return;
    }
    
    for (const item of batchData) {
      if (!item.type || !item.brand || !item.condition || !item.locationType || !item.quantity || !item.purchase_date) {
        message.error('Please fill all required fields for all selected items.');
        return;
      }
      if (item.locationType === 'Head Office' && !item.department) {
        message.error('Missing department for Head Office items.');
        return;
      }
      if (item.locationType === 'Other' && !item.location) {
        message.error('Missing location for Other items.');
        return;
      }
    }

    const serialsInBatch = batchData.map(item => item.serial_number).filter(Boolean);
    const serialsSet = new Set();
    for (const serial of serialsInBatch) {
      if (serialsSet.has(serial)) {
        message.error(`Duplicate serial number in batch: ${serial}`);
        return;
      }
      serialsSet.add(serial);
      if (existingSerials.includes(serial)) {
        message.error(`Serial number already exists in inventory: ${serial}`);
        return;
      }
    }

    const transformedData = batchData.map(item => ({
      ...item,
      location: getFinalLocation(item),
      quantity: item.serial_number && !item.showQuantityWithSerial ? 1 : Math.max(1, item.quantity || 1),
    }));

    logUserActivity('Add to Inventory', `Adding ${batchData.length} item(s) from procurement request #${request?.request_id} to inventory`);
    logUserNotification('Add to Inventory', `Adding ${batchData.length} item(s) from procurement request #${request?.request_id} to inventory`);

    onSubmit(transformedData);
  };

  return (
    <>
      <Modal
        open={visible}
        title={
          <div className={screens.xs ? 'text-center text-base' : 'text-center'}>
            <Title level={screens.xs ? 5 : 4}>Add Approved Item(s) to Inventory</Title>
          </div>
        }
        onCancel={onClose}
        footer={null}
        width={screens.xs ? '100vw' : selectedKeys.length > 1 ? 1300 : 700}
        className={screens.xs ? 'p-0 m-0 w-full max-w-full' : 'custom-card'}
      >
        <Typography.Paragraph className={screens.xs ? 'text-xs p-2' : ''}>
          Select one or more approved items to add to inventory. You can edit details for selected items before adding.
        </Typography.Paragraph>
        <div className={screens.xs ? 'overflow-x-auto -mx-2 p-2' : ''}>
          <Table
            bordered
            dataSource={approvedItems}
            columns={columns}
            rowKey="item_id"
            pagination={false}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedKeys,
              onChange: setSelectedKeys,
            }}
            size={screens.xs ? 'small' : 'middle'}
            style={{ marginBottom: 16 }}
            className={screens.xs ? 'min-w-[700px]' : ''}
          />
        </div>
        {selectedKeys.length === 1 && editItem && (
          <SingleItemEditForm
            item={editItem}
            onSubmit={onSubmit}
            onClose={onClose}
            confirmLoading={confirmLoading}
          />
        )}
        {selectedKeys.length > 1 && (
          <>
            <Typography.Paragraph strong className={screens.xs ? 'text-xs p-2' : ''}>
              Edit details for each item below before adding to inventory:
            </Typography.Paragraph>
            <div className={screens.xs ? 'overflow-x-auto -mx-2 p-2' : ''}>
              <Table
                bordered
                dataSource={batchData}
                columns={batchColumns}
                rowKey="item_id"
                pagination={false}
                size={screens.xs ? 'small' : 'middle'}
                style={{ marginBottom: 16 }}
                className={screens.xs ? 'min-w-[700px]' : ''}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={onClose} className="custom-button-cancel text-xs px-2 py-1">Cancel</Button>
              <Button type="primary" onClick={handleBatchAdd} className="custom-button text-xs px-2 py-1" loading={confirmLoading}>
                Add Selected to Inventory
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Serial Number Modal for Batch */}
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

export default AddToInventoryModal; 