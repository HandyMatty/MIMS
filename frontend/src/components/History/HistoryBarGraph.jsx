import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, LabelList, Cell
} from 'recharts';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { Spin } from 'antd';
import './customBarGraph.css';

const COLORS = ['#2f855a', '#38a169', '#48bb78', '#68d391', '#9ae6b4', '#c6f6d5', '#4fd1c5', '#319795', '#2c7a7b', '#285e61'];

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
    <div className="history-bar-graph-container" style={{ height: '500px', width: '100%' }}>
      {loading ? (
        <div className="loading-spinner">
          <Spin size="large" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} className='top-2' margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3 3" stroke='black' />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end"
              height={80}
              tick={{ fontSize: 13 }}
              tickSize={12}
              interval={0}
              stroke='black'
            />
            <YAxis stroke='black' />
            <Tooltip
              wrapperClassName="custom-tooltip"
              cursor={{ fill: 'rgba(56, 161, 105, 0.2)' }}
            />
            <Legend 
              formatter={(value) => `Item ${value}`} 
              wrapperStyle={{ paddingTop: '50px' }}
            />
            <Bar dataKey="Types" barSize={50}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList dataKey="Types" position="middle" fill="#eaf4e2" fontSize={14} fontWeight="bold" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HistoryBarGraph;
