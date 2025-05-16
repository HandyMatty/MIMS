import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getInventoryData } from '../../services/api/addItemToInventory'; // Adjust to your data service
import { Spin } from 'antd'; // Import Ant Design's Spin component for loading indicator

const Graph = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();
        setLoading(false);

        // Aggregate the quantity per month for 'purchaseDate'
        const purchaseCounts = data.reduce((acc, item) => {
          const purchaseDate = item.purchaseDate;
          const quantity = item.quantity || 0; // Get quantity, default to 0 if undefined
          if (purchaseDate) {
            const date = new Date(purchaseDate);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: "Year-Month"
            if (!acc[monthYear]) {
              acc[monthYear] = 0;
            }
            acc[monthYear] += parseInt(quantity); // Sum quantity
          }
          return acc;
        }, {});

        // Aggregate the quantity per month for 'issuedDate'
        const issuedCounts = data.reduce((acc, item) => {
          const issuedDate = item.issuedDate;
          const quantity = item.quantity || 0;
          if (issuedDate) {
            const date = new Date(issuedDate);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`; // Format: "Year-Month"
            if (!acc[monthYear]) {
              acc[monthYear] = 0;
            }
            acc[monthYear] += parseInt(quantity); // Sum quantity
          }
          return acc;
        }, {});

        // Combine purchase and issued data into a unified format
        const allMonths = new Set([...Object.keys(purchaseCounts), ...Object.keys(issuedCounts)]);
        const formattedData = Array.from(allMonths).map((monthYear) => ({
          monthYear,
          purchase: purchaseCounts[monthYear] || 0,
          issued: issuedCounts[monthYear] || 0,
        }));

        // Sort the data chronologically by year and month
        formattedData.sort(
          (a, b) => new Date(`${a.monthYear}-01`) - new Date(`${b.monthYear}-01`)
        );

        setMonthlyData(formattedData);
      } catch (error) {
        console.error('Error fetching inventory data', error);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchInventoryData();
  }, []);

  return (
    <div className="max-w-full h-full rounded-xl bg-[#A8E1C5] shadow-md transition-transform transform hover:scale-105">
      <div className="w-full h-[350px] bg-[#A8E1C5] rounded-lg">
        {loading ? (
          <div className="loading-spinner">
            <Spin size="large" />
          </div>
        ) : (
          <ResponsiveContainer width="95%" height="95%">
            <LineChart data={monthlyData} className='top-10'>
              <CartesianGrid strokeDasharray="4 4 4" stroke='black' />
              <XAxis dataKey="monthYear" stroke='black' angle={-22} tickSize={15} />
              <YAxis
                label={{
                  value: 'Quantity',
                  angle: -90,
                  position: 'outsideLeft',
                  fill: '#00000',
                  dx: -10,
                  dy: 30
                }}
                stroke='black'
              />
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
                cursor={{ stroke:'black' }}
              />
              <Legend
                iconType="line"
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{paddingTop: 20}}
              />
              <Line
                type="Monotone"
                dataKey="purchase"
                name="Purchased"
                stroke="#2f855a"
                strokeWidth={2}
                dot={{ fill: '#2f855a', stroke: 'white', strokeWidth: 2 }}
              />
              <Line
                type="Monotone"
                dataKey="issued"
                name="Issued"
                stroke="#4299e1"
                strokeWidth={2}
                dot={{ fill: '#4299e1', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Graph;
