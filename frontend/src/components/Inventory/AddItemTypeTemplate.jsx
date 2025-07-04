import { forwardRef, useImperativeHandle } from 'react';
import { Select, Space, Alert, Row, Col, Divider, Button, Modal, Form, Input, DatePicker, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useTemplateManagement from '../../hooks/useTemplateManagement';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import Cookies from 'js-cookie';

const { Option } = Select;

const HEAD_OFFICE_DEPARTMENTS = {
  'SOD': 'SOD',
  'CID': 'CID',
  'GAD': 'GAD',
  'HRD': 'HRD',
  'AFD': 'AFD',
  'EOD': 'EOD',
  'BDO': 'BDO'
};

export const itemTemplates = {
  'IT Equipment': {
    'System Unit': {
      type: 'System Unit',
      brand: 'Dell',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Standard office computer',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Laptop': {
      type: 'Laptop',
      brand: 'Lenovo',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Business laptop',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Monitor': {
      type: 'Monitor',
      brand: 'Dell',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Office monitor',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Printer': {
      type: 'Printer',
      brand: 'HP',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Office printer',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    }
  },
  'Network Equipment': {
    'Router': {
      type: 'Router',
      brand: 'Cisco',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'Network Department',
      remarks: 'Network router',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Switch': {
      type: 'Switch',
      brand: 'Cisco',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'Network Department',
      remarks: 'Network switch',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Modem': {
      type: 'Modem',
      brand: 'TP-Link',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'Network Department',
      remarks: 'Internet modem',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'WIFI-Mesh': {
      type: 'WIFI-Mesh',
      brand: 'Ubiquiti',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'Network Department',
      remarks: 'Wireless mesh system',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    }
  },
  'Security Equipment': {
    'CCTV': {
      type: 'CCTV',
      brand: 'Hikvision',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Security Department',
      remarks: 'Security camera',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Biometrics': {
      type: 'Biometrics',
      brand: 'ZKTeco',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Security Department',
      remarks: 'Biometric scanner',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Metal Detector': {
      type: 'Metal Detector',
      brand: 'Garrett',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Security Department',
      remarks: 'Security metal detector',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Guard Tour System': {
      type: 'Guard Tour System',
      brand: 'Detex',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Security Department',
      remarks: 'Guard tour monitoring system',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    }
  },
  'Communication Equipment': {
    'Radio': {
      type: 'Radio',
      brand: 'Motorola',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Communication Department',
      remarks: 'Two-way radio',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Smartphone': {
      type: 'Smartphone',
      brand: 'Samsung',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Communication Department',
      remarks: 'Office mobile phone',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Headset': {
      type: 'Headset',
      brand: 'Jabra',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Communication Department',
      remarks: 'Office headset',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Megaphone': {
      type: 'Megaphone',
      brand: 'Pyle',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Communication Department',
      remarks: 'Public address system',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    }
  },
  'Power Equipment': {
    'UPS': {
      type: 'UPS',
      brand: 'APC',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Uninterruptible power supply',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'AVR': {
      type: 'AVR',
      brand: 'Stavol',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Automatic voltage regulator',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Battery': {
      type: 'Battery',
      brand: 'Yuasa',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Backup battery',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Charger': {
      type: 'Charger',
      brand: 'Anker',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Device charger',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    }
  },
  'Accessories': {
    'Keyboard': {
      type: 'Keyboard',
      brand: 'Logitech',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Computer keyboard',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Mouse': {
      type: 'Mouse',
      brand: 'Logitech',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Computer mouse',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Speaker': {
      type: 'Speaker',
      brand: 'JBL',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Audio speaker',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Microphone': {
      type: 'Microphone',
      brand: 'Shure',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'IT Department',
      remarks: 'Audio microphone',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    }
  },
  'Others': {
    'Pedestal': {
      type: 'Pedestal',
      brand: 'Generic',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'General',
      remarks: 'Equipment pedestal',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Podium': {
      type: 'Podium',
      brand: 'Generic',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'GAD',
      location: 'General',
      remarks: 'Presentation podium',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Search Stick': {
      type: 'Search Stick',
      brand: 'Generic',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Security Department',
      remarks: 'Security search tool',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Searchlight': {
      type: 'Searchlight',
      brand: 'Generic',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Security Department',
      remarks: 'Security search light',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Guard Tour Chips': {
      type: 'Guard Tour Chips',
      brand: 'Detex',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Security Department',
      remarks: 'Guard tour system chips',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    },
    'Under Chassis': {
      type: 'Under Chassis',
      brand: 'Generic',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Head Office',
      department: 'SOD',
      location: 'Security Department',
      remarks: 'Vehicle under chassis scanner',
      serialNumber: '',
      purchaseDate: '',
      issuedDate: ''
    }
  }
};

export const specificLocationTemplates = {
  'CCEAP Pampanga DC': {
    'System Unit': {
      type: 'System Unit',
      brand: 'Dell',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Pampanga DC - IT Office',
      remarks: 'Distribution Center computer'
    },
    'CCTV': {
      type: 'CCTV',
      brand: 'Hikvision',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Pampanga DC - Security Office',
      remarks: 'Distribution Center security camera'
    },
    'Printer': {
      type: 'Printer',
      brand: 'HP',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Pampanga DC - Admin Office',
      remarks: 'Distribution Center printer'
    }
  },
  'CCEAP Ilagan Plant': {
    'System Unit': {
      type: 'System Unit',
      brand: 'Dell',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Ilagan Plant - IT Office',
      remarks: 'Ilagan Plant computer'
    },
    'CCTV': {
      type: 'CCTV',
      brand: 'Hikvision',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Ilagan Plant - Security Office',
      remarks: 'Ilagan Plant security camera'
    },
    'Printer': {
      type: 'Printer',
      brand: 'HP',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Ilagan Plant - Admin Office',
      remarks: 'Ilagan Plant printer'
    }
  },
  'CCEAP SF Plant': {
    'System Unit': {
      type: 'System Unit',
      brand: 'Dell',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP SF Plant - IT Office',
      remarks: 'SF Plant computer'
    },
    'CCTV': {
      type: 'CCTV',
      brand: 'Hikvision',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP SF Plant - Security Office',
      remarks: 'SF Plant security camera'
    },
    'Printer': {
      type: 'Printer',
      brand: 'HP',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP SF Plant - Admin Office',
      remarks: 'SF Plant printer'
    }
  },
  'CCEAP Calasiao Plant': {
    'System Unit': {
      type: 'System Unit',
      brand: 'Dell',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Calasiao Plant - IT Office',
      remarks: 'Calasiao Plant computer'
    },
    'CCTV': {
      type: 'CCTV',
      brand: 'Hikvision',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Calasiao Plant - Security Office',
      remarks: 'Calasiao Plant security camera'
    },
    'Printer': {
      type: 'Printer',
      brand: 'HP',
      condition: 'Brand New',
      status: 'On Stock',
      quantity: 1,
      locationType: 'Other',
      location: 'CCEAP Calasiao Plant - Admin Office',
      remarks: 'Calasiao Plant printer'
    }
  }
};

const AddItemTypeTemplate = forwardRef(({ onTemplateSelect }, ref) => {
  const {
    selectedCategory,
    selectedType,
    userTemplates,
    isEditModalVisible,
    form,
    setRefreshTrigger,
    handleCategoryChange,
    handleTypeChange,
    handleEdit,
    handleDelete,
    handleEditSubmit,
    setIsEditModalVisible,
  } = useTemplateManagement(onTemplateSelect);

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();

  const getCurrentUser = () => {
    const isAdmin = adminAuth.token && adminAuth.userData;
    const isUser = userAuth.token && userAuth.userData;

    if (isAdmin) return adminAuth.userData;
    if (isUser) return userAuth.userData;

    const username = Cookies.get('username');
    const userId = Cookies.get('user_id');
    if (username && userId) {
      return { username, id: userId };
    }

    return null;
  };

  const isTemplateCreator = (template) => {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.username === template.created_by;
  };

  useImperativeHandle(ref, () => ({
    setRefreshTrigger,
    handleTypeChange
  }));

  const sortedCategories = Object.keys(itemTemplates).sort();

  return (
    <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
      <Alert
        message="Quick Templates"
        description="Select a category and type to quickly fill item details, or choose No Template to use your own values"
        type="info"
        showIcon
        className="theme-aware-alert text-xs"
      />
      <Row gutter={16}>
        <Col span={12}>
          <Select
            placeholder="Select Category"
            style={{ width: '100%' }}
            onChange={handleCategoryChange}
            value={selectedCategory}
            allowClear
          >
            <Option value="No Template">No Template</Option>
            {sortedCategories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
            {userTemplates.length > 0 && (
              <Option value="User Templates">User Templates</Option>
            )}
          </Select>
        </Col>
        <Col span={12}>
          <Select
            placeholder="Select Type"
            style={{ width: '100%' }}
            onChange={handleTypeChange}
            disabled={!selectedCategory}
            value={selectedType}
            allowClear
            optionLabelProp="label"
          >
            {selectedCategory === 'User Templates' ? (
              userTemplates
                .sort((a, b) => a.template_name.localeCompare(b.template_name))
                .map(template => (
                  <Option 
                    key={template.template_name} 
                    value={template.template_name}
                    label={template.template_name}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{template.template_name}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
                          Created by: {template.created_by || 'System'}
                        </div>
                      </div>
                      <Space>
                        <Tooltip title={isTemplateCreator(template) ? "Edit Template" : "Only the creator can edit this template"}>
                          <Button 
                            type="text" 
                            style={{ backgroundColor: 'transparent' }}
                            icon={<EditOutlined />} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(template);
                            }}
                            disabled={!isTemplateCreator(template)}
                          />
                        </Tooltip>
                        <Tooltip title={isTemplateCreator(template) ? "Delete Template" : "Only the creator can delete this template"}>
                          <Button 
                            type="text"
                            style={{ backgroundColor: 'transparent' }}
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template);
                            }}
                            disabled={!isTemplateCreator(template)}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </Option>
                ))
            ) : (
              selectedCategory && Object.keys(itemTemplates[selectedCategory])
                .sort()
                .map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))
            )}
          </Select>
        </Col>
      </Row>
      <Divider style={{ margin: '16px 0' }} />

      <Modal
        title="Edit Template"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          onFinish={handleEditSubmit}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="template_name"
                label="Template Name"
                rules={[{ required: true, message: 'Please enter template name' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select>
                  <Option value="AVR">AVR</Option>
                  <Option value="Battery">Battery</Option>
                  <Option value="Biometrics">Biometrics</Option>
                  <Option value="Camera">Camera</Option>
                  <Option value="CCTV">CCTV</Option>
                  <Option value="Charger">Charger</Option>
                  <Option value="Guard Tour Chips">Guard Tour Chips</Option>
                  <Option value="Guard Tour System">Guard Tour System</Option>
                  <Option value="Headset">Headset</Option>
                  <Option value="Keyboard">Keyboard</Option>
                  <Option value="Laptop">Laptop</Option>
                  <Option value="Megaphone">Megaphone</Option>
                  <Option value="WIFI-Mesh">WIFI-Mesh</Option>
                  <Option value="Metal Detector">Metal Detector</Option>
                  <Option value="Microphone">Microphone</Option>
                  <Option value="Modem">Modem</Option>
                  <Option value="Monitor">Monitor</Option>
                  <Option value="Mouse">Mouse</Option>
                  <Option value="Others">Others</Option>
                  <Option value="Pedestal">Pedestal</Option>
                  <Option value="Podium">Podium</Option>
                  <Option value="Printer">Printer</Option>
                  <Option value="Radio">Radio</Option>
                  <Option value="Router">Router</Option>
                  <Option value="Search Stick">Search Stick</Option>
                  <Option value="Searchlight">Searchlight</Option>
                  <Option value="Smartphone">Smartphone</Option>
                  <Option value="Speaker">Speaker</Option>
                  <Option value="Switch">Switch</Option>
                  <Option value="System Unit">System Unit</Option>
                  <Option value="Under Chassis">Under Chassis</Option>
                  <Option value="UPS">UPS</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="brand"
                label="Brand"
                rules={[{ required: true, message: 'Please enter brand' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="serialNumber"
                label="Serial Number"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="purchaseDate"
                label="Purchase Date"
                rules={[{ required: true, message: 'Please select purchase date' }]}
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="issuedDate"
                label="Issued Date"
                tooltip="Optional - Leave empty if not issued yet"
              >
                <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="condition"
                label="Condition"
                rules={[{ required: true, message: 'Please select condition' }]}
              >
                <Select>
                  <Option value="Brand New">Brand New</Option>
                  <Option value="Good Condition">Good Condition</Option>
                  <Option value="Defective">Defective</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="On Stock">On Stock</Option>
                  <Option value="Deployed">Deployed</Option>
                  <Option value="For Repair">For Repair</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="locationType"
                label="Detachment/Office"
                rules={[{ required: true, message: 'Please select a location type' }]}
              >
                <Select
                  onChange={(value) => {
                    const isHeadOffice = value === 'Head Office';
                    form.setFieldsValue({
                      department: isHeadOffice ? form.getFieldValue('department') : null,
                      location: isHeadOffice ? null : form.getFieldValue('location')
                    });
                  }}
                >
                  <Option value="Head Office">Head Office</Option>
                  <Option value="Other">Other (Specify Below)</Option>
                </Select>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                  prevValues.locationType !== currentValues.locationType
                }
              >
                {({ getFieldValue }) => {
                  const locationType = getFieldValue('locationType');
                  return locationType === 'Head Office' ? (
                    <Form.Item
                      name="department"
                      label="Department (Head Office)"
                      rules={[{ required: true, message: 'Please select a department' }]}
                    >
                      <Select>
                        {Object.entries(HEAD_OFFICE_DEPARTMENTS).map(([key, value]) => (
                          <Option key={key} value={key}>{value}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item
                      name="location"
                      label="Specific Location"
                      rules={[{ required: true, message: 'Please input a location' }]}
                    >
                      <Input />
                    </Form.Item>
                  );
                }}
              </Form.Item>
              <Form.Item
                name="remarks"
                label="Remarks"
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
});

export default AddItemTypeTemplate; 