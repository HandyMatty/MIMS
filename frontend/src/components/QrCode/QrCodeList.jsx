import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Card, Row, Col, Checkbox, Button, App, QRCode, Pagination, Input, Select } from 'antd';
import { PrinterOutlined, SearchOutlined } from '@ant-design/icons';
import SINSSILogo from '../../../assets/SINSSI_LOGO-removebg-preview.png';
import { batchPrintQrCodes, getStandardizedItemData, QR_SIZES } from '../../utils/qrCodeUtils';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Option } = Select;

const QrCodeList = ({ inventoryData = [], selectedIds, setSelectedIds }) => {
  const { message } = App.useApp();
  const [selectAll, setSelectAll] = useState(false);
  const qrRefs = useRef({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchText, setSearchText] = useState('');
  const [columnCount, setColumnCount] = useState(6);
  const [selectedSize, setSelectedSize] = useState('SMALL');
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  const filteredData = useMemo(() => 
    inventoryData.filter(item =>
      Object.values(item).some(val =>
        val && String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    ), 
    [inventoryData, searchText]
  );

  const paginatedData = useMemo(() => 
    filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize), 
    [filteredData, currentPage, pageSize]
  );

  useEffect(() => {
    const visibleIds = paginatedData.map(item => item.id);
    setSelectAll(visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id)));
  }, [paginatedData, selectedIds]);

  const handleSelectAll = useCallback((e) => {
    const visibleIds = paginatedData.map(item => item.id);
    if (e.target.checked) {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    }
  }, [paginatedData, setSelectedIds]);

  const handleSelect = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, [setSelectedIds]);

  const handleBatchPrint = useCallback(async () => {
    if (selectedIds.length === 0) {
      message.warning('Please select at least one QR code to print.');
      return;
    }
    const selectedItems = selectedIds.map(id => inventoryData.find(item => item.id === id)).filter(Boolean);
    const itemDataList = selectedItems.map(getStandardizedItemData);
    const size = QR_SIZES[selectedSize];
    await batchPrintQrCodes(qrRefs, selectedIds, size, itemDataList);
    try {
      await logUserActivity('Batch Print', `Printed ${selectedIds.length} QR code(s) (${selectedSize.toLowerCase()})`);
      await logUserNotification('Batch Print', `Printed ${selectedIds.length} QR code(s) (${selectedSize.toLowerCase()})`);
    } catch (err) {
      console.error('Error logging batch print activity:', err);
    }
  }, [selectedIds, inventoryData, selectedSize, message, logUserActivity, logUserNotification]);

  const getColumnSpan = useCallback(() => {
    const spans = {
      2: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 },
      3: { xs: 24, sm: 12, md: 8, lg: 8, xl: 8 },
      4: { xs: 24, sm: 12, md: 6, lg: 6, xl: 6 },
      6: { xs: 24, sm: 12, md: 8, lg: 6, xl: 4 },
      8: { xs: 24, sm: 12, md: 6, lg: 4, xl: 3 },
      12: { xs: 24, sm: 12, md: 6, lg: 4, xl: 2 },
    };
    return spans[columnCount] || spans[6];
  }, [columnCount]);

  const handleSearch = useCallback((e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSizeChange = useCallback((size) => {
    setSelectedSize(size);
  }, []);

  const handleColumnCountChange = useCallback((count) => {
    setColumnCount(count);
  }, []);

  const handlePageChange = useCallback((page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  }, []);

  const qrCodeItems = useMemo(() => 
    paginatedData.map(item => {
      const itemData = getStandardizedItemData(item);
      const columnSpan = getColumnSpan();
      return (
        <Col {...columnSpan} key={item.id}>
          <div ref={el => (qrRefs.current[item.id] = el)} style={{ marginBottom: 12 }}>
            <QRCode
              value={JSON.stringify(itemData)}
              size={140}
              icon={SINSSILogo}
              iconSize={35}
              color="#000000"
              style={{ margin: '0 auto', background: '#fff', borderRadius: 8 }}
            />
          </div>
          <Checkbox
            checked={selectedIds.includes(item.id)}
            onChange={() => handleSelect(item.id)}
            className="mb-2"
          >
            Select
          </Checkbox>
          <div style={{ marginTop: 8, width: '100%' }}>
            <span style={{ fontSize: 14, fontWeight: 'bold' }}>ID: {item.id}</span>
          </div>
        </Col>
      );
    }), 
    [paginatedData, getColumnSpan, selectedIds, handleSelect]
  );

  return (
    <Card title={<span className="text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center">ITEMS</span>}
      className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div style={{ padding: 16 }}>
        <div className="flex items-center mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search QR codes..."
              prefix={<SearchOutlined />}
              value={searchText}
              size='medium'
              onChange={handleSearch}
              className="w-auto text-xs border border-black"
              allowClear
            />
             <Button
              type="primary"
              size='small'
              icon={<PrinterOutlined />}
              onClick={handleBatchPrint}
              disabled={selectedIds.length === 0}
              className='custom-button text-xs w-auto'
            >
              Print ({selectedSize.toLowerCase()})
            </Button>
            <Select
              value={selectedSize}
              onChange={handleSizeChange}
              placeholder="Size"
              size='small'
              className="text-xs w-auto"
            >
              <Option value="SMALL" style={{fontSize: 12}}>Small</Option>
              <Option value="MEDIUM" style={{fontSize: 12}}>Medium</Option>
              <Option value="LARGE" style={{fontSize: 12}}>Large</Option>
            </Select>
            <Select
              value={columnCount}
              onChange={handleColumnCountChange}
              placeholder="Columns"
              size='small'
              className="text-xs hidden sm:block w-auto"
            >
              <Option value={2} style={{fontSize: 12}}>2 Columns (Wide)</Option>
              <Option value={3} style={{fontSize: 12}}>3 Columns</Option>
              <Option value={4} style={{fontSize: 12}}>4 Columns</Option>
              <Option value={6} style={{fontSize: 12}}>6 Columns (Default)</Option>
              <Option value={8} style={{fontSize: 12}}>8 Columns</Option>
              <Option value={12} style={{fontSize: 12}}>12 Columns (Compact)</Option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectAll}
              indeterminate={paginatedData.some(item => selectedIds.includes(item.id)) && !selectAll}
              onChange={handleSelectAll}
              className='text-xs'
            >
              Select All (Page)
            </Checkbox>
          </div>
        </div>
        <>
          <Row gutter={[16, 16]}>
            {qrCodeItems}
          </Row>
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['12', '24', '36', '48', '60', '72', '84', '96']}
              className="text-xs"
            />
          </div>
        </>
      </div>
    </Card>
  );
};

export default QrCodeList;
