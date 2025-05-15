import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, LabelList
} from 'recharts';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { Spin } from 'antd';
import './customBarGraph.css';

const HistoryBarGraph = ({ searchText }) => {
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();

        const filteredData = data.filter(item =>
          Object.values(item)
            .join(' ')
            .toLowerCase()
            .includes(searchText.toLowerCase())
        );

        // Group by type and sum quantity
        const typeCounts = filteredData.reduce((acc, item) => {
          const { type, quantity } = item;
          if (!acc[type]) {
            acc[type] = 0;
          }
          acc[type] += parseInt(quantity) || 0;
          return acc;
        }, {});

        const formattedData = Object.entries(typeCounts).map(([type, Types]) => ({
          name: type,
          Types,
        }));

        setBarData(formattedData);
      } catch (error) {
        console.error('Failed to fetch inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [searchText]);

  return (
    <div className="history-bar-graph-container">
      {loading ? (
        <div className="loading-spinner">
          <Spin size="large" />
        </div>
      ) : (
        <ResponsiveContainer>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3 3" stroke='black' />
            <XAxis dataKey="name" angle={-27} tickSize={12} stroke='black'/>
            <YAxis stroke='black' />
            <Tooltip
              wrapperClassName="custom-tooltip"
              cursor={{ fill: 'rgba(56, 161, 105, 0.2)' }}
            />
            <Legend formatter={(value) => `Item ${value}`} />
            <Bar dataKey="Types" fill="#2f855a" barSize={50}>
              <LabelList dataKey="Types" position="middle" fill="black" fontSize={14} fontWeight="bold" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HistoryBarGraph;
