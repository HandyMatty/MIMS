import { useState, useEffect } from 'react';
import { Column } from '@ant-design/plots';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { Spin } from 'antd';

const Graph = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const data = await getInventoryData();

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

        const allMonths = Array.from(
          new Set([...Object.keys(purchaseCounts), ...Object.keys(issuedCounts)])
        ).sort((a, b) => new Date(a + '-01') - new Date(b + '-01'));

        const result = [];
        allMonths.forEach(monthYear => {
          result.push({
            month: monthYear,
            type: 'Purchased',
            value: purchaseCounts[monthYear] || 0,
          });
          result.push({
            month: monthYear,
            type: 'Issued',
            value: issuedCounts[monthYear] || 0,
          });
        });

        setChartData(result);
      } catch (err) {
        console.error('Error fetching inventory data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const config = {
    data: chartData,
    isGroup: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    columnWidthRatio: 0.4,
    colorField: 'type' ,
    color: ['#34d399', '#60a5fa'],
    legend: {
    color: {
      position: 'top',
      layout: {
        justifyContent: 'center',
      },
    },
  },
  axis: {
    x: {
      label: {
        autoRotate: false,
      },
      labelFontSize: isMobile ? 7:10,
    },
  
    y: {
      minInterval: 1,
      label: {
        formatter: val => `${val}`,
      },
      labelFontSize: isMobile ? 7:10,
    },
  },
  };

  return (
    <div className="w-auto h-full rounded-xl bg-[#A8E1C5] shadow-md"  
    style={{
        height: isMobile ? 270 : 420,
        width: '100%',
      }}>
      {loading ? <Spin size="large" /> : <Column {...config} />}
    </div>
  );
};

export default Graph;
