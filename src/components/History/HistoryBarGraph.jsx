import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getInventoryData } from '../../services/api/addItemToInventory'; // Adjust the path as needed
import './customBarGraph.css'; 

const HistoryBarGraph = () => {
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();

        // Group by type and count items
        const typeCounts = data.reduce((acc, item) => {
          const { type } = item; // Extract type field
          if (!acc[type]) {
            acc[type] = 0;
          }
          acc[type]++;
          return acc;
        }, {});

        // Transform the grouped data into an array format suitable for the graph
        const formattedData = Object.entries(typeCounts).map(([type, value]) => ({
          name: type,
          value,
        }));

        setBarData(formattedData);
      } catch (error) {
        console.error('Failed to fetch inventory data:', error);
      }
    };

    fetchInventoryData();
  }, []);

  return (
    <div className="history-bar-graph-container">
      <ResponsiveContainer>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            wrapperClassName="custom-tooltip" // Add custom class name
            cursor={{ fill: 'rgba(56, 161, 105, 0.2)' }} // Hover effect on bars
          />
          <Legend />
          <Bar dataKey="value" fill="#2f855a" barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryBarGraph;
