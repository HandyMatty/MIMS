// HistoryTable.js

import React, { useState, useEffect } from 'react';
import { Table, Input, Typography, Pagination, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getHistory } from '../../services/api/getHistory'; // Import the API function
import { columns } from './HistoryTableConfig'; // Import columns and helper functions

const HistoryTable = () => {
  const [historyData, setHistoryData] = useState([]); // Store the fetched data
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorterConfig, setSorterConfig] = useState({ field: null, order: null });
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch history data on component mount
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const data = await getHistory();
        if (data.length === 0) {
          console.warn("No history data found"); // Optional: Log a warning instead of an error
        }
        setHistoryData(data); // Set empty array or fetched data
      } catch (error) {
        console.error("Error fetching history data:", error); // Log only for actual errors
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryData();
  }, []);

  // Filter data based on search term
  const filteredData = historyData.filter((item) =>
    Object.values(item).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data based on the sorter configuration
  const sortedData = React.useMemo(() => {
    if (!sorterConfig.field || !sorterConfig.order) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valueA = a[sorterConfig.field];
      const valueB = b[sorterConfig.field];

      // If sorting by ID, handle numeric sorting
      if (sorterConfig.field === 'id') {
        const numA = Number(valueA);
        const numB = Number(valueB);
        if (isNaN(numA) || isNaN(numB)) {
          return 0; // If either value is not a number, don't sort
        }
        return sorterConfig.order === 'ascend' ? numA - numB : numB - numA;
      }

      // String sorting
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sorterConfig.order === 'ascend'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Default numeric sorting
      if (sorterConfig.order === 'ascend') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }, [filteredData, sorterConfig]);

  const totalEntries = filteredData.length;

  // Paginate the sorted and filtered data
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle table sorting
  const handleTableChange = (_, __, sorter) => {
    setSorterConfig({ field: sorter.field, order: sorter.order });
    setCurrentPage(1); // Reset to page 1 after sorting
  };

  // Handle pagination change
  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  return (
    <Card title={<span className="text-5xl-6 font-bold flex justify-center">HISTORY</span>}  className="flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex justify-start mb-4">
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="w-64 bg-[#a7f3d0] border border-black custom-input-table"
        />
      </div>
      <div style={{ height: '720px' }}>
        <Table
          rowKey="id"
          dataSource={paginatedData}
          columns={columns}
          bordered
          pagination={false}
          onChange={handleTableChange}
          scroll={{ x: 'max-content', y: 660 }}  
          loading={loading}
        />
      </div>
      <div className="flex items-center justify-between">
        <Typography.Text style={{ color: '#072C1C' }}>
          Showing data of {totalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
        </Typography.Text>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalEntries}
          showSizeChanger
          pageSizeOptions={['10', '20', '30']}
          onChange={handlePageChange}
        />
      </div>
    </Card>
  );
};

export default HistoryTable;
