import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
  LabelList
} from 'recharts';
import { getInventoryData } from '../../services/api/addItemToInventory'; // Adjust to your data service

const { Text } = Typography;

const Graph = () => {
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();

        // Count the number of items added per month
        const counts = data.reduce((acc, item) => {
          const month = new Date(item.date).toLocaleString('default', { month: 'long' });
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month]++;
          return acc;
        }, {});

        // Transform the counts into the format needed for the graph
        const formattedData = Object.keys(counts).map((month) => ({
          month,
          value: counts[month],
        }));

        // Sort the data by month
        formattedData.sort(
          (a, b) => new Date(`${a.month} 1, 2024`) - new Date(`${b.month} 1, 2024`)
        );
        setMonthlyData(formattedData);
      } catch (error) {
        console.error('Error fetching inventory data', error);
      }
    };

    fetchInventoryData();
  }, []);

  return (
    <div className="max-w-full h-full rounded-xl bg-[#A8E1C5] shadow-md transition-transform transform hover:scale-105">
      <div className="w-full h-[350px] bg-[#A8E1C5] rounded-lg">
        <ResponsiveContainer width="95%" height="95%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" >
            <Label value="Monthly Added Items" offset={0} position="insideBottom" fill='#00000' />
            </XAxis>  
            <YAxis label={{ value: 'Range', angle: -90, position: 'insideLeft', fill:'#00000'}} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#072C1C',
                borderRadius: '5px',
                color: '#D4E09B',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
              itemStyle={{
                color: '#D4E09B',
              }}
              cursor={{ fill: 'rgba(56, 161, 105, 0.2)' }} // Hover effect for bars
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2f855a"
              strokeWidth={2}
              dot={{ fill: '#2f855a', stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Graph;
