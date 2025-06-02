import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { getInventoryData } from '../../services/api/addItemToInventory';
import dayjs from 'dayjs';

const { Option } = Select;

const EditItemModal = ({ visible, onClose, onEdit, item, isLoading }) => {
  const [form] = Form.useForm();
  const [isHeadOffice, setIsHeadOffice] = useState(false);
  const [hasSerialNumber, setHasSerialNumber] = useState(false);


  useEffect(() => {
    if (item) {
      const isHeadOfficeSelected = item.location?.startsWith('Head Office -');
      const department = isHeadOfficeSelected ? item.location.split(' - ')[1] : '';

      setIsHeadOffice(isHeadOfficeSelected);
      setHasSerialNumber(!!item.serialNumber);

      form.setFieldsValue({
        type: item.type,
        brand: item.brand,
        serialNumber: item.serialNumber,
        issuedDate: item.issuedDate && dayjs(item.issuedDate, 'YYYY-MM-DD').isValid() 
        ? dayjs(item.issuedDate, 'YYYY-MM-DD') 
        : null,
      purchaseDate: item.purchaseDate && dayjs(item.purchaseDate, 'YYYY-MM-DD').isValid() 
        ? dayjs(item.purchaseDate, 'YYYY-MM-DD') 
        : null,
        condition: item.condition,
        locationType: isHeadOfficeSelected ? 'Head Office' : 'Other',
        department: isHeadOfficeSelected ? department : null,
        location: isHeadOfficeSelected ? '' : item.location,
        status: item.status,
        remarks: item.remarks,
        quantity: item.quantity || 1,
      });
    }
  }, [item, form, visible]);

const handleSubmit = async (values) => {
  try {
    if (values.purchaseDate && values.purchaseDate.isAfter(dayjs())) {
      message.error("Purchase date cannot be in the future.");
      return;
    }

    const existingInventory = await getInventoryData();

    const trimmedSerial = values.serialNumber ? values.serialNumber.trim().toUpperCase() : null;

    if (trimmedSerial) {
      const serialExists = existingInventory.some(
        (invItem) =>
          invItem.serialNumber?.trim().toUpperCase() === trimmedSerial &&
          invItem.id !== item?.id &&
          invItem.id.toString().startsWith("20") // enforce only on new-format
      );
      if (serialExists) {
        message.error("Serial number already exists. Please use a unique serial number.");
        return;
      }
    }

    const formattedLocation = isHeadOffice
      ? `Head Office - ${values.department}`
      : values.location;

    const formattedPurchaseDate = dayjs(values.purchaseDate).format("YYYY-MM-DD");
    const formattedIssuedDate = values.issuedDate
      ? dayjs(values.issuedDate).format("YYYY-MM-DD")
      : null;

    const updatedItem = {
      id: item.id,
      ...values,
      location: formattedLocation,
      purchaseDate: formattedPurchaseDate,
      issuedDate: formattedIssuedDate,
      serialNumber: trimmedSerial,
      quantity: hasSerialNumber ? 1 : Math.max(1, values.quantity || 1),
      remarks: values.remarks,
    };

    const oldPurchaseDate = dayjs(item.purchaseDate).format("YYYY-MM-DD");
    if (oldPurchaseDate !== formattedPurchaseDate) {
      Modal.confirm({
        title: "Changing the purchase date will regenerate the item ID.",
        content: "Are you sure you want to continue?",
        onOk: async () => {
          await onEdit(updatedItem);
          onClose();
        },
      });
    } else {
      await onEdit(updatedItem);
      onClose();
    }
  } catch (error) {
    console.error(error);
    message.error("Failed to submit form. Please try again.");
  }
};
  
  const handleClose = () => {
    form.resetFields(); 
    setHasSerialNumber(false); 
    onClose();
  };

  const handleSerialChange = (e) => {
    const value = e.target.value.trim();
    setHasSerialNumber(value !== '');
    if (value !== '') {
      form.setFieldsValue({ quantity: null });
    } else {
      form.setFieldsValue({ quantity: 1 }); 
    }
  };


  return (
    <Modal
      title="Edit Item"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={900}
      centered
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{
          type: 'Radio', 
          condition: 'Brand New', 
          status: 'On Stock',
          quantity: 1,
        }}
      >
    <div style={{ display: 'flex', gap: '20px' }}>
          {/* LEFT COLUMN */}
      <div style={{ flex: 1 }}>
        <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please select the item type!' }]}>
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
          <Option value="WIFI-Mesh">WIFI-Mesh</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Brand" name="brand" rules={[{ required: true, message: 'Please input the brand!' }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Remarks"
          name="remarks">
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          label="Serial Number"
          name="serialNumber">
          <Input onChange={handleSerialChange} />
        </Form.Item>

          {!hasSerialNumber && (
              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[{ required: true, message: 'Please input the quantity!' }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            )}

        <Form.Item
          label="Issued Date"
          name="issuedDate">
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>

      </div>

    <div style={{ flex: 1 }}>
        <Form.Item
          label="Purchased Date"
          name="purchaseDate"
          rules={[{ required: true, message: 'Please select the purchase date!' }]} >
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Condition" name="condition" rules={[{ required: true, message: 'Please select the condition!' }]}>
          <Select>
          <Option value="Brand New">Brand New</Option>
            <Option value="Good Condition">Good Condition</Option>
            <Option value="Defective">Defective</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Detachment/Office"
          name="locationType"
          rules={[{ required: true, message: 'Please select a location!' }]}
        >
          <Select
            onChange={(value) => setIsHeadOffice(value === 'Head Office')}
          >
            <Option value="Head Office">Head Office</Option>
            <Option value="Other">Other (Specify Below)</Option>
          </Select>
        </Form.Item>

        {isHeadOffice && (
          <Form.Item
            label="Department (Head Office)"
            name="department"
            rules={[{ required: true, message: 'Please select a department!' }]}
          >
            <Select>
              <Option value="SOD">SOD</Option>
              <Option value="CID">CID</Option>
              <Option value="GAD">GAD</Option>
              <Option value="HRD">HRD</Option>
              <Option value="AFD">AFD</Option>
              <Option value="EOD">EOD</Option>
              <Option value="BDO">BDO</Option>
            </Select>
          </Form.Item>
        )}

        {!isHeadOffice && (
          <Form.Item
            label="Specific Location"
            name="location"
            rules={[{ required: true, message: 'Please input a location!' }]}
          >
            <Input />
          </Form.Item>
        )}

        <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select the status!' }]}>
          <Select>
            <Option value="On Stock">On Stock</Option>
            <Option value="Deployed">Deployed</Option>
            <Option value="For Repair">For Repair</Option>
          </Select>
        </Form.Item>

         <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusCircleOutlined />}
              loading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </Form.Item>
      </div>
    </div>
      </Form>
    </Modal>
  );
};

export default EditItemModal;
