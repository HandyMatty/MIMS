import React, { useRef } from 'react';
import { Button, QRCode, Descriptions, Card, Typography } from 'antd';
import { downloadAsPng, downloadAsSvg, printQrCode } from '../../utils/qrCodeUtils'; // Import utility functions

const QrCodeGenerator = ({ itemDetails }) => {
  const [selectedFormat, setSelectedFormat] = React.useState('PNG');
  const qrCodeRef = useRef(null); // Reference to the QR Code div
  const { Text } = Typography;

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

  return (
    <Card className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-6 border-none">
      <Text className="text-[#072C1C] text-13xl font-semibold font-poppins mb-4">
        DETAILS
      </Text>

      <div className="flex flex-row justify-between gap-8">
        {/* Left Side: Item Details */}
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
              column={1} // Single column for better alignment and space
              size="small"
              labelStyle={{
                fontWeight: 'bold',
                color: '#072C1C',
                width: '120px',
              }} // Adjust label width
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

        {/* Right Side: QR Code Section */}
        <div className="w-1/2 flex flex-col items-center space-y-4">
          {/* QR Code */}
          <div
            ref={qrCodeRef}
            style={{
              display: 'inline-block', // Ensures no extra spacing around QR code
              border: '1px solid #072C1C', // Border around the QR code
              borderRadius: '8px', // Rounded corners
              padding: '0', // No extra padding
              width: '250px', // Match QR code size
              height: '250px', // Match QR code size
            }}
          >
            <QRCode
              value={itemDetails ? JSON.stringify(itemDetails) : 'https://example.com'}
              type="svg" // Ensure it's SVG for proper scaling
              style={{
                width: '100%', // Fills the container
                height: '100%', // Fills the container
                border: 'none', // No internal border
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
            onClick={() =>
              selectedFormat === 'PNG'
                ? downloadAsPng(qrCodeRef)
                : downloadAsSvg(qrCodeRef)
            }
            className="bg-lime-200 shadow-md text-[#072C1C] text-lg"
            type="primary"
            style={{ width: '100%', maxWidth: '177px', height: '31px' }}
          >
            Download {selectedFormat}
          </Button>
          {/* Print Button */}
          <Button
            onClick={() => printQrCode(qrCodeRef)}
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
