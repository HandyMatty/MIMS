import React, { useRef } from 'react';
import { Button, QRCode, Descriptions, Card } from 'antd';
import { downloadAsPng, downloadAsSvg, printQrCode } from '../../utils/qrCodeUtils'; 
import { useActivity } from '../../utils/ActivityContext';  
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth'; 
import { useUserAuthStore } from '../../store/user/useAuth'; 
import SINSSILogo from '../../../assets/SINSSI_LOGO-removebg-preview.png';

const QrCodeGenerator = ({ itemDetails }) => {
  const [selectedFormat, setSelectedFormat] = React.useState('PNG');
  const qrCodeRef = useRef(null);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { userData: adminUserData } = useAdminAuthStore();
  const { userData: userUserData } = useUserAuthStore();
  
  const username = adminUserData?.username || userUserData?.username || 'Unknown User';
  const isAuthenticated = adminUserData || userUserData;

  const defaultItemData = {
    Id: "N/A",
    Type: "N/A",
    Brand: "N/A",
    quantity: "N/A",
    remarks: "N/A",
    "Serial Number": "N/A",
    "Issued Date": "N/A",
    "Purchased Date": "N/A",
    Condition: "N/A",
    "Location": "N/A",
    Status: "N/A",
  };

  const itemData = itemDetails
    ? {
        Id: itemDetails.id || "N/A",
        Type: itemDetails.type || "N/A",
        Brand: itemDetails.brand || "N/A",
        remarks: itemDetails.remarks || "N/A",
        quantity: itemDetails.quantity || "N/A",
        "Serial Number": itemDetails.serialNumber || "N/A",
        "Issued Date": itemDetails.issuedDate || "N/A",
        "Purchased Date": itemDetails.purchaseDate || "N/A",
        Condition: itemDetails.condition || "N/A",
        "Location": itemDetails.location || "N/A",
        Status: itemDetails.status || "N/A",
      }
    : defaultItemData;

  const handleDownload = (format) => {
    if (format === 'PNG') {
      downloadAsPng(qrCodeRef);
    } else {
      downloadAsSvg(qrCodeRef);
    }
    logUserActivity(username, 'Download QR Code', `Downloaded QR code in ${format} format`);
    logUserNotification('Downloaded QR CODE', `You successfully downloaded QR code in ${format} format`);
  };

  const handlePrint = () => {
    printQrCode(qrCodeRef);
    logUserActivity(username, 'Print QR Code', `Printed QR code for item with serial number: ${itemDetails.serialNumber}`);
    logUserNotification( 'Printed QR CODE', `You successfully printed QR code for item with serial number: ${itemDetails.serialNumber}`);
  };

  return (
    <Card title={<span className="text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center">QR CODE</span>} className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <div className="w-full md:w-1/2">
          <div
            className="p-4 rounded-lg bg-[#A8E1C5] shadow"
            style={{ border: '1px solid #072C1C', borderRadius: '8px' }}
          >
            <Descriptions
              title={
                <div className="text-center font-bold md:text-lgi overflow-auto text-lgi">
                  Item Details
                </div>
              }
              className='text-xs'
              bordered
              column={1}
              size="small"
              labelStyle={{
                fontWeight: 'bold',
                color: '#072C1C',
                width: 'auto',
              }}
              contentStyle={{ color: '#072C1C' }}
            >
              {Object.entries(itemData)
                .filter(([label]) => !(label === "quantity" && itemData["Serial Number"] !== "N/A"))
                .map(([label, value]) => (
                  <Descriptions.Item key={label} label={label}>
                    <span className='text-xs overflow-auto wrap-text w-auto'>{value}</span>
                  </Descriptions.Item>
                ))}
            </Descriptions>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center space-y-4 mt-6 md:mt-0">
          <div
            ref={qrCodeRef}
            style={{
              display: 'inline-block',
              border: '1px solid #072C1C',
              borderRadius: '8px',
              padding: '0',
              width: '250px',
              height: '250px',
              maxWidth: '100%',
            }}
          >
            <QRCode
              icon={SINSSILogo}
              iconSize={40}
              value={JSON.stringify(
                Object.fromEntries(
                  Object.entries(itemDetails || {}).filter(([key]) => !(
                    key === "quantity" && itemDetails?.serialNumber
                  ))
                )
              )}
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
                className={`text-black ${selectedFormat === 'PNG' ? 'bg-lime-200' : 'bg-[#EAF4E2]'}`}
                disabled={!isAuthenticated}
              >
                PNG
              </Button>
              <Button
                type="primary"
                onClick={() => setSelectedFormat('SVG')}
                className={`text-black ${selectedFormat === 'SVG' ? 'bg-lime-200' : 'bg-[#EAF4E2]'}`}
                disabled={!isAuthenticated}
              >
                SVG
              </Button>
            </Button.Group>
          </div>

          {/* Download Button */}
          <Button
            onClick={() => handleDownload(selectedFormat)}
            className="bg-lime-200 shadow-md text-[#072C1C] text-base sm:text-lg"
            type="primary"
            style={{ width: '100%', maxWidth: '177px', height: '31px' }}
            disabled={!isAuthenticated}
          >
            Download {selectedFormat}
          </Button>

          {/* Print Button */}
          <Button
            onClick={handlePrint}
            className="bg-lime-200 shadow-md text-[#072C1C] text-base sm:text-lg"
            type="primary"
            style={{ width: '100%', maxWidth: '177px', height: '31px' }}
            disabled={!isAuthenticated}
          >
            Print QR Code
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QrCodeGenerator;
