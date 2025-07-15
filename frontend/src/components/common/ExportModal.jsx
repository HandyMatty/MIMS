import { useState } from 'react';
import { Modal, Button, Radio, Space, Input, App, Table } from 'antd';
import { DownloadOutlined, FileTextOutlined, FilePdfOutlined, FileImageOutlined, FileWordOutlined, FileOutlined, EyeOutlined } from '@ant-design/icons';
import { exportData } from '../../utils/exportUtils';
import PropTypes from 'prop-types';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';


const ExportModal = ({ 
  visible, 
  onClose, 
  data, 
  filteredData = null,
  selectedData = null,
  dataType = 'inventory',
  title = 'Export Data',
  columns
}) => {
  const [format, setFormat] = useState('csv');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportAll, setExportAll] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewPageSize, setPreviewPageSize] = useState(10);
  const { message } = App.useApp();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();

  const hasFilteredData = filteredData && filteredData.length > 0;
  const hasSelectedData = selectedData && selectedData.length > 0;
  const totalDataCount = data?.length || 0;
  const filteredDataCount = filteredData?.length || 0;
  const selectedDataCount = selectedData?.length || 0;

  const formatOptions = [
    { value: 'csv', label: 'CSV (.csv)', icon: <FileTextOutlined /> },
    { value: 'text', label: 'Text (.txt)', icon: <FileOutlined /> },
    { value: 'pdf', label: 'PDF (.pdf)', icon: <FilePdfOutlined /> },
    { value: 'docx', label: 'Word (.docx)', icon: <FileWordOutlined /> },
    { value: 'image', label: 'Image (.png)', icon: <FileImageOutlined /> }
  ];

  const getDefaultFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${dataType}_${timestamp}`;
  };

  const getDataToExport = () => {
    if (exportAll) {
      return data;
    } else if (hasSelectedData && selectedDataCount > 0) {
      return selectedData;
    } else if (hasFilteredData && filteredDataCount > 0) {
      return filteredData;
    }
    return data;
  };

  const getExportTypeText = () => {
    if (exportAll) return 'all data';
    if (hasSelectedData && selectedDataCount > 0) return 'selected data';
    if (hasFilteredData && filteredDataCount > 0) return 'filtered data';
    return 'all data';
  };

  const handleExport = async () => {
    const dataToExport = getDataToExport();
    const exportType = getExportTypeText();
    const exportFormat = format.toUpperCase();

    if (!dataToExport || dataToExport.length === 0) {
      message.error('No data to export');
      return;
    }

    setLoading(true);
    
    try {
      const exportFilename = filename || getDefaultFilename();
      const result = await exportData(dataToExport, format, exportFilename, dataType, columns);
      
      if (result.success) {
        message.success(`${result.message} (${exportType}: ${dataToExport.length} items)`);
        onClose();
        logUserActivity('Export', `Exported ${dataToExport.length} ${dataType} record(s) as ${exportFormat}`);
        logUserNotification('Export Action', `Exported ${dataToExport.length} ${dataType} record(s) as ${exportFormat}`);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormat('csv');
    setFilename('');
    setLoading(false);
    setExportAll(true);
    setShowPreview(false);
    setPreviewPage(1);
    setPreviewPageSize(10);
    onClose();
  };

  const handlePreviewPageChange = (page, pageSize) => {
    setPreviewPage(page);
    setPreviewPageSize(pageSize);
  };

  const previewColumns = columns ? columns.filter(col => col.label !== 'Action').map(col => ({
    title: col.label,
    dataIndex: col.key,
    key: col.key,
    render: (text) => text || '-',
    ellipsis: true,
    width: 120,
  })) : [];

  const dataToPreview = getDataToExport();
  const paginatedPreviewData = dataToPreview ? dataToPreview.slice(
    (previewPage - 1) * previewPageSize,
    previewPage * previewPageSize
  ) : [];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DownloadOutlined />
          {title}
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button size='small' key="cancel" onClick={handleClose} className='text-xs custom-button-cancel'>
          Cancel
        </Button>,
        <Button
          key="preview"
          size='small'
          icon={<EyeOutlined />}
          onClick={() => {
            setShowPreview(!showPreview);
            if (!showPreview) {
              setPreviewPage(1);
              setPreviewPageSize(10);
            }
          }}
          className='text-xs custom-button'
          disabled={!dataToPreview || dataToPreview.length === 0}
        >
          {showPreview ? 'Hide Preview' : 'Preview'}
        </Button>,
        <Button
          key="export"
          type="primary"
          size='small'
          icon={<DownloadOutlined />}
          loading={loading}
          onClick={handleExport}
          disabled={!dataToPreview || dataToPreview.length === 0}
          className='text-xs custom-button'
        >
          Export ({dataToPreview?.length || 0} items)
        </Button>
      ]}
      width={showPreview ? 1200 : 500}
      centered
    >
      <div style={{ padding: '16px 0' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', color: '#072C1C' }}>Export Format</h4>
          <Radio.Group value={format} onChange={(e) => setFormat(e.target.value)}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {formatOptions.map(option => (
                <Radio key={option.value} value={option.value}>
                  <Space>
                    {option.icon}
                    {option.label}
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', color: '#072C1C' }}>Filename</h4>
          <Input
            placeholder={getDefaultFilename()}
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            addonAfter={`.${format === 'csv' ? 'csv' : format === 'text' ? 'txt' : format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'png'}`}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '12px', color: '#072C1C' }}>Export Options</h4>
          <Radio.Group value={exportAll} onChange={(e) => setExportAll(e.target.value)}>
            <Space direction="vertical">
              <Radio value={true} disabled={totalDataCount === 0}>
                Export all data ({totalDataCount} items)
              </Radio>
              {hasSelectedData && (
                <Radio value={false} disabled={selectedDataCount === 0}>
                  Export selected data ({selectedDataCount} items)
                </Radio>
              )}
              {hasFilteredData && !hasSelectedData && (
                <Radio value={false} disabled={filteredDataCount === 0}>
                  Export filtered data ({filteredDataCount} items)
                </Radio>
              )}
            </Space>
          </Radio.Group>
          {!hasSelectedData && !hasFilteredData && (
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              <em>Note: No filtered or selected data available. Only "Export all data" option is available.</em>
            </p>
          )}
        </div>

        {showPreview && dataToPreview && dataToPreview.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '12px', color: '#072C1C' }}>
              Preview: {getExportTypeText()} ({dataToPreview.length} items)
            </h4>
            <div style={{ 
              maxHeight: '400px', 
              overflow: 'auto', 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px',
              backgroundColor: '#fff'
            }}>
              <Table
                dataSource={paginatedPreviewData}
                columns={previewColumns}
                pagination={{
                  current: previewPage,
                  pageSize: previewPageSize,
                  total: dataToPreview.length,
                  onChange: handlePreviewPageChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '25', '50', '100'],
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                  size: 'small',
                  className: 'text-xs'
                }}
                size="small"
                responsive
                scroll={{ x: 'max-content', y: 300 }}
                className="text-xs"
                rowKey={(record) => record.id || `${previewPage}-${record.key || Math.random()}`}
                bordered
              />
            </div>
          </div>
        )}

        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '6px',
          border: '1px solid #bae6fd'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#0369a1' }}>
            <strong>Note:</strong> The export will include all visible columns and data based on your selection above. 
            Large datasets may take a moment to process.
          </p>
        </div>
      </div>
    </Modal>
  );
};

ExportModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  filteredData: PropTypes.array,
  selectedData: PropTypes.array,
  dataType: PropTypes.string,
  title: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  )
};

export default ExportModal; 