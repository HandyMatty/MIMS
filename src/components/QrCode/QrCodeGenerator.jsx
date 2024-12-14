import React, { useRef } from 'react';
import { Button, QRCode, Descriptions, Card, Typography } from 'antd';
import { downloadAsPng, downloadAsSvg, printQrCode } from '../../utils/qrCodeUtils'; 
import { useActivity } from '../../utils/ActivityContext';  
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth'; 
import { useUserAuthStore } from '../../store/user/useAuth'; 

const QrCodeGenerator = ({ itemDetails }) => {
  const [selectedFormat, setSelectedFormat] = React.useState('PNG');
  const qrCodeRef = useRef(null);
  const { Text } = Typography;
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { userData: adminUserData } = useAdminAuthStore();
  const { userData: userUserData } = useUserAuthStore();
  
  const username = adminUserData?.username || userUserData?.username || 'Unknown User';

  const defaultItemData = {
    Type: "N/A",
    Brand: "N/A",
    "Serial Number": "N/A",
    Date: "N/A",
    Condition: "N/A",
    "Location": "N/A",
    Status: "N/A",
  };

  const itemData = itemDetails
    ? {
        Type: itemDetails.type || "N/A",
        Brand: itemDetails.brand || "N/A",
        "Serial Number": itemDetails.serialNumber || "N/A",
        Date: itemDetails.date || "N/A",
        Condition: itemDetails.condition || "N/A",
        "Location": itemDetails.location || "N/A",
        Status: itemDetails.status || "N/A",
      }
    : defaultItemData;

  // Log activity when QR code is downloaded
  const handleDownload = (format) => {
    if (format === 'PNG') {
      downloadAsPng(qrCodeRef);
    } else {
      downloadAsSvg(qrCodeRef);
    }
    logUserActivity(username, 'Download QR Code', `Downloaded QR code in ${format} format`);
    logUserNotification('Downloaded QR CODE', `You successfully downloaded QR code in ${format} format`);
  };

  // Log activity when QR code is printed
  const handlePrint = () => {
    printQrCode(qrCodeRef);
    logUserActivity(username, 'Print QR Code', `Printed QR code for item with serial number: ${itemDetails.serialNumber}`);
    logUserNotification( 'Printed QR CODE', `You successfully printed QR code for item with serial number: ${itemDetails.serialNumber}`);
  };

  return (
    <Card className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-6 border-none">
    <div className='mb-5'>
      <Text className="text-5xl-6 font-semibold">
        DETAILS
      </Text>
    </div>

      <div className="flex flex-row justify-between gap-8">
        <div
          className="w-1/2 space-y-4"
          style={{
            maxWidth: '50%',
          }}
        >
          <div
            className="p-4 rounded-lg bg-[#A8E1C5] shadow"
            style={{ border: '1px solid #072C1C', borderRadius: '8px' }}
          >
            <Descriptions
              title="Item Information"
              bordered
              column={1}
              size="small"
              labelStyle={{
                fontWeight: 'bold',
                color: '#072C1C',
                width: '120px',
              }}
              contentStyle={{ color: '#072C1C' }}
            >
              {Object.entries(itemData).map(([label, value]) => (
                <Descriptions.Item key={label} label={label}>
                  {value}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </div>
        </div>

        <div className="w-1/2 flex flex-col items-center space-y-4">
          <div
            ref={qrCodeRef}
            style={{
              display: 'inline-block', 
              border: '1px solid #072C1C', 
              borderRadius: '8px', 
              padding: '0', 
              width: '250px', 
              height: '250px', 
            }}
          >
            <QRCode
              value={itemDetails ? JSON.stringify(itemDetails) : 'https://example.com'}
              type="svg" 
              style={{
                width: '100%', 
                height: '100%',
                border: 'none', 
              }}
            />
          </div>

          {/* Format Selection */}
          <div className="flex flex-col items-center">
            <div className="font-bold text-sm text-[#072C1C] mb-2">Image format:</div>
            <Button.Group>
              <Button
                type="primary"
                onClick={() => setSelectedFormat('PNG')}
                className={`text-black ${
                  selectedFormat === 'PNG' ? 'bg-lime-200' : 'bg-[#EAF4E2]'
                }`}
              >
                PNG
              </Button>
              <Button
                type="primary"
                onClick={() => setSelectedFormat('SVG')}
                className={`text-black ${
                  selectedFormat === 'SVG' ? 'bg-lime-200' : 'bg-[#EAF4E2]'
                }`}
              >
                SVG
              </Button>
            </Button.Group>
          </div>

          {/* Download Button */}
          <Button
            onClick={() => handleDownload(selectedFormat)}
            className="bg-lime-200 shadow-md text-[#072C1C] text-lg"
            type="primary"
            style={{ width: '100%', maxWidth: '177px', height: '31px' }}
          >
            Download {selectedFormat}
          </Button>

          {/* Print Button */}
          <Button
            onClick={handlePrint}
            className="bg-lime-200 shadow-md text-[#072C1C] text-lg"
            type="primary"
            style={{ width: '100%', maxWidth: '177px', height: '31px' }}
          >
            Print QR Code
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QrCodeGenerator;
