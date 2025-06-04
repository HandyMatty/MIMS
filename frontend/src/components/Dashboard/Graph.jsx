import { useState, useEffect } from 'react';
import { Rose } from '@ant-design/plots';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { Spin } from 'antd';

const Graph = () => {
  const [roseData, setRoseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();

        // Aggregate total purchased and issued per month
        const purchaseCounts = {};
        const issuedCounts = {};

        data.forEach(item => {
          const quantity = parseInt(item.quantity) || 0;

          if (item.purchaseDate) {
            const date = new Date(item.purchaseDate);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            purchaseCounts[monthYear] = (purchaseCounts[monthYear] || 0) + quantity;
          }

          if (item.issuedDate) {
            const date = new Date(item.issuedDate);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            issuedCounts[monthYear] = (issuedCounts[monthYear] || 0) + quantity;
          }
        });

        // Collect all unique months and sort them
        const allMonths = Array.from(
          new Set([...Object.keys(purchaseCounts), ...Object.keys(issuedCounts)])
        ).sort((a, b) => new Date(a + '-01') - new Date(b + '-01'));

        // Prepare data for Rose chart: one entry per month per type
        const roseDataArr = [];
        allMonths.forEach(monthYear => {
          roseDataArr.push({
            month: monthYear,
            type: 'Purchased',
            value: purchaseCounts[monthYear] || 0,
          });
          roseDataArr.push({
            month: monthYear,
            type: 'Issued',
            value: issuedCounts[monthYear] || 0,
          });
        });

        setRoseData(roseDataArr);
      } catch (error) {
        console.error('Error fetching inventory data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const config = {
    width: 400,
    height: 400,
    autoFit: false,
    radius: 1.20,
    data: roseData,
    xField: 'month',
    yField: 'value',
    colorField: 'type',
    transform: [{ type: 'groupX', y: 'sum' }],
    scale: { y: { type: 'sqrt' }, x: { padding: 0 } },
    legend: { color: { length: 400, layout: { justifyContent: 'center' } } },
    labels: [
      {
        text: 'value',
        position: 'outside',
        formatter: (val) => `${val}`,
        transform: [{ type: 'overlapDodgeY' }],
      },
    ],
    tooltip: {
      items: [
        { channel: 'y', valueFormatter: (v) => `${v}` }
      ]
    },
    axis: {
    x: false ,
    y: {
        grid: true,
        gridStrokeOpacity: 5 ,
        gridLineDash: [5 , 5] ,
    },
  },
  };

return (
  <div className="w-full h-full rounded-xl bg-[#A8E1C5] shadow-md transition-transform transform hover:scale-105 text-xs flex justify-center items-center">
      {loading ? (
        <div className="loading-spinner">
          <Spin size="large" />
        </div>
      ) : (
        <Rose {...config} className='flex justify-center items-center align-middle'/>
      )}

  </div>
);
};

export default Graph;