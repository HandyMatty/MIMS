import { useRef, useState, useMemo, useCallback } from 'react';
import { Button, QRCode, Descriptions, Card, Space, Table, Pagination } from 'antd';
import { useMediaQuery } from 'react-responsive';
import { downloadAsPng, downloadAsSvg, printQrCode, getStandardizedItemData, QR_SIZES } from '../../utils/qrCodeUtils';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import SINSSILogo from '../../../assets/SINSSI_LOGO-removebg-preview.png';
import { useTheme } from '../../utils/ThemeContext';

const QrCodeGenerator = ({ itemDetails, previewItems }) => {
  const [selectedFormat, setSelectedFormat] = useState('PNG');
  const [selectedSize, setSelectedSize] = useState('MEDIUM');
  const qrCodeRef = useRef(null);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { userData: adminUserData } = useAdminAuthStore();
  const { userData: userUserData } = useUserAuthStore();
  const { theme, currentTheme } = useTheme();
  
  const username = useMemo(() => 
    adminUserData?.username || userUserData?.username || 'Unknown User', 
    [adminUserData?.username, userUserData?.username]
  );
  
  const isAuthenticated = useMemo(() => 
    adminUserData || userUserData, 
    [adminUserData, userUserData]
  );

  const itemData = useMemo(() => 
    getStandardizedItemData(itemDetails || {}), 
    [itemDetails]
  );

  const handleDownload = useCallback((format) => {
    if (format === 'PNG') {
      downloadAsPng(qrCodeRef, itemDetails.id);
    } else {
      downloadAsSvg(qrCodeRef, itemDetails.id);
    }
    logUserActivity(username, 'Download QR Code', `Downloaded QR code in ${format} format`);
    logUserNotification('Downloaded QR CODE', `You successfully downloaded QR code in ${format} format`);
  }, [itemDetails?.id, logUserActivity, logUserNotification, username]);

  const handlePrint = useCallback(() => {
    const size = QR_SIZES[selectedSize];
    printQrCode(qrCodeRef, size, itemDetails.id);
    logUserActivity(username, 'Print QR Code', `Printed QR code for item with serial number: ${itemDetails.serialNumber}`);
    logUserNotification( 'Printed QR CODE', `You successfully printed QR code for item with serial number: ${itemDetails.serialNumber}`);
  }, [selectedSize, itemDetails?.id, itemDetails?.serialNumber, logUserActivity, logUserNotification, username]);

  const getFormatButtonStyle = useCallback((format) => {
    const isSelected = selectedFormat === format;
    if (currentTheme === 'default') {
      return {
        backgroundColor: isSelected ? '#d9f99d' : '#EAF4E2',
        color: '#072C1C',
      };
    }
    return {
      backgroundColor: isSelected ? theme.CardHead : theme.componentBackground,
      color: theme.text,
    };
  }, [selectedFormat, currentTheme, theme]);

  const getSizeButtonStyle = useCallback((size) => {
    const isSelected = selectedSize === size;
    if (currentTheme === 'default') {
      return {
        backgroundColor: isSelected ? '#d9f99d' : '#EAF4E2',
        color: '#072C1C',
      };
    }
    return {
      backgroundColor: isSelected ? theme.CardHead : theme.componentBackground,
      color: theme.text,
    };
  }, [selectedSize, currentTheme, theme]);

  const cardStyle = useMemo(() => 
    currentTheme !== 'default' 
      ? { backgroundColor: theme.componentBackground, color: theme.text } 
      : { backgroundColor: '#A8E1C5' }, 
    [currentTheme, theme]
  );

  const descriptionsContainerStyle = useMemo(() => 
    currentTheme !== 'default' 
      ? { backgroundColor: theme.background, border: '1px solid', borderRadius: '8px' } 
      : { backgroundColor: '#A8E1C5', border: '1px solid #072C1C', borderRadius: '8px' }, 
    [currentTheme, theme]
  );

  const qrCodeContainerStyle = useMemo(() => 
    currentTheme !== 'default' 
      ? {
          display: 'inline-block',
          border: '1px solid',
          borderRadius: '8px',
          padding: '0',
          width: '250px',
          height: '250px',
          maxWidth: '100%',
        } 
      : {
          display: 'inline-block',
          border: '1px solid #072C1C',
          borderRadius: '8px',
          padding: '0',
          width: '250px',
          height: '250px',
          maxWidth: '100%',
        }, 
    [currentTheme, theme]
  );

  const descriptionsStyles = useMemo(() => ({
    label: currentTheme !== 'default' 
      ? { fontWeight: 'bold', color: theme.text, width: 'auto' } 
      : { fontWeight: 'bold', color: '#072C1C', width: 'auto' },
    content: currentTheme !== 'default' 
      ? { color: theme.text } 
      : { color: '#072C1C' }
  }), [currentTheme, theme]);

  const titleStyle = useMemo(() => 
    currentTheme !== 'default' ? { color: theme.text } : {}, 
    [currentTheme, theme]
  );

  const labelStyle = useMemo(() => 
    currentTheme !== 'default' ? { color: theme.text } : { color: '#072C1C' }, 
    [currentTheme, theme]
  );

  const filteredItemData = useMemo(() => 
    Object.entries(itemData)
      .filter(([label]) => !(label === "quantity" && itemData["serialNumber"] !== "N/A")), 
    [itemData]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const mobileExpandableConfig = useMemo(() => isMobile ? {
    expandedRowRender: (record) => (
      <div className="text-xs space-y-1">
        <div><b>ID:</b> {record.id}</div>
        <div><b>Type:</b> {record.type}</div>
        <div><b>Brand:</b> {record.brand}</div>
        <div><b>Quantity:</b> {record.quantity}</div>
        <div><b>Remarks:</b> {record.remarks}</div>
        <div><b>Serial Number:</b> {record.serialNumber}</div>
        <div><b>Issued Date:</b> {record.issuedDate || 'NO DATE'}</div>
        <div><b>Purchased Date:</b> {record.purchaseDate || 'NO DATE'}</div>
        <div><b>Condition:</b> {record.condition}</div>
        <div><b>Detachment/Office:</b> {record.location}</div>
        <div><b>Status:</b> {record.status}</div>
      </div>
    ),
    rowExpandable: () => true,
  } : undefined, [isMobile]);

  if (previewItems && Array.isArray(previewItems)) {
    const sample = previewItems[0] || itemDetails || {};
    const widthMap = {
      id: 80,
      type: 120,
      brand: 120,
      quantity: 90,
      remarks: 160,
      serialNumber: 120,
      issuedDate: 120,
      purchaseDate: 120,
      condition: 110,
      location: 150,
      status: 100,
    };
    const columns = Object.keys(getStandardizedItemData(sample)).map(key => ({
      title: key.charAt(0).toUpperCase() + key.slice(1),
      dataIndex: key,
      key,
      width: widthMap[key] || 120,
      render: (text) => <span className="text-xs">{text}</span>,
    }));
    const dataSource = previewItems.map(item => getStandardizedItemData(item));
    const paginatedData = dataSource.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return (
      <Card
        title={<span className="text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center">QR Code Details Preview</span>}
        className="flex flex-col w-full mx-auto rounded-xl shadow border-none"
        style={cardStyle}
      >
        <div className="overflow-x-auto">
          <Table
            dataSource={paginatedData}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
            scroll={{ x: 'max-content', y: 600 }}
            size="small"
            className="text-xs"
            locale={{ emptyText: <span className="text-xs">No items selected.</span> }}
            expandable={mobileExpandableConfig}
          />
        </div>
        <div className="flex justify-center mt-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={dataSource.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            pageSizeOptions={['5', '10', '20', '50']}
            className="text-xs"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={<span className="text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center">QR CODE</span>}
      className="flex flex-col w-full mx-auto rounded-xl shadow border-none"
      style={cardStyle}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <div className="w-full md:w-1/2">
          <div
            className="p-4 rounded-lg shadow"
            style={descriptionsContainerStyle}
          >
            <Descriptions
              title={
                <div className="text-center font-bold md:text-lgi overflow-auto text-lgi" style={titleStyle}>
                  Item Details
                </div>
              }
              className='text-xs'
              bordered
              column={1}
              size="small"
              styles={descriptionsStyles}
            >
              {filteredItemData.map(([label, value]) => (
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
            style={qrCodeContainerStyle}
          >
            <QRCode
              icon={SINSSILogo}
              iconSize={50}
              value={JSON.stringify(itemData)}
              type="svg"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>

          <div className="flex flex-col items-center">
            <div className="font-bold text-sm mb-2" style={labelStyle}>Image format:</div>
            <Space.Compact>
              <Button
                type="primary"
                className='text-xs'
                onClick={() => setSelectedFormat('PNG')}
                style={getFormatButtonStyle('PNG')}
                disabled={!isAuthenticated}
              >
                PNG
              </Button>
              <Button
                type="primary"
                className='text-xs'
                onClick={() => setSelectedFormat('SVG')}
                style={getFormatButtonStyle('SVG')}
                disabled={!isAuthenticated}
              >
                SVG
              </Button>
            </Space.Compact>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-bold text-sm mb-2" style={labelStyle}>Print size:</div>
            <Space.Compact>
              <Button
                type="primary"
                className='text-xs'
                onClick={() => setSelectedSize('SMALL')}
                style={getSizeButtonStyle('SMALL')}
                disabled={!isAuthenticated}
              >
                Small
              </Button>
              <Button
                type="primary"
                className='text-xs'
                onClick={() => setSelectedSize('MEDIUM')}
                style={getSizeButtonStyle('MEDIUM')}
                disabled={!isAuthenticated}
              >
                Medium
              </Button>
              <Button
                type="primary"
                className='text-xs'
                onClick={() => setSelectedSize('LARGE')}
                style={getSizeButtonStyle('LARGE')}
                disabled={!isAuthenticated}
              >
                Large
              </Button>
            </Space.Compact>
          </div>

          <Button
            onClick={() => handleDownload(selectedFormat)}
            className="qr-action-btn shadow-md text-xs"
            type="primary"
            style={{ width: '100%', maxWidth: '177px', height: '31px' }}
            disabled={!isAuthenticated}
          >
            Download {selectedFormat}
          </Button>

          <Button
            onClick={handlePrint}
            className="qr-action-btn shadow-md text-xs"
            type="primary"
            style={{ width: '100%', maxWidth: '177px', height: '31px' }}
            disabled={!isAuthenticated}
          >
            Print QR Code ({selectedSize.toLowerCase()})
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QrCodeGenerator;
