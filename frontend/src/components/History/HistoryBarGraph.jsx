import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, LabelList
} from 'recharts';
import { getInventoryData } from '../../services/api/addItemToInventory'; // Adjust the path as needed
import { Spin } from 'antd'; // Import Ant Design's Spin component for loading indicator
import './customBarGraph.css';

const HistoryBarGraph = ({ searchText }) => { // Accept searchText as a prop
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();

        // Filter data based on searchText
        const filteredData = data.filter(item =>
          Object.values(item)
            .join(' ')
            .toLowerCase()
            .includes(searchText.toLowerCase())
        );

        // Group by type and count items
        const typeCounts = filteredData.reduce((acc, item) => {
          const { type } = item; // Extract type field
          if (!acc[type]) {
            acc[type] = 0;
          }
          acc[type]++;
          return acc;
        }, {});

        // Transform the grouped data into an array format suitable for the graph
        const formattedData = Object.entries(typeCounts).map(([type, items]) => ({
          name: type,
          items,
        }));

        setBarData(formattedData);
      } catch (error) {
        console.error('Failed to fetch inventory data:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching completes
      }
    };

    fetchInventoryData();
  }, [searchText]); // Refetch data when searchText changes

  return (
    <div className="history-bar-graph-container">
      {loading ? (
        <div className="loading-spinner">
          <Spin size="large" /> {/* Show Ant Design spinner while loading */}
        </div>
      ) : (
        <ResponsiveContainer>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              wrapperClassName="custom-tooltip" // Add custom class name
              cursor={{ fill: 'rgba(56, 161, 105, 0.2)' }} // Hover effect on bars
            />
            <Legend formatter={(value) => `Type: ${value}`} /> {/* Custom legend text */}
            <Bar dataKey="items" fill="#2f855a" barSize={50}>
              {/* Display item count inside the bar */}
              <LabelList dataKey="items" position="middle" fill="black" fontSize={14} fontWeight="bold" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HistoryBarGraph;
