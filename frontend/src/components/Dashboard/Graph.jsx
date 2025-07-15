import { useState, useEffect, useMemo, useCallback } from 'react';
import { Column } from '@ant-design/plots';
import { Spin } from 'antd';
import { useTheme } from '../../utils/ThemeContext';
import './customGraph.css';

const Graph = ({ inventoryData, loading }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const { theme, currentTheme } = useTheme();

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const chartData = useMemo(() => {
    if (!inventoryData || inventoryData.length === 0) return [];

    const purchaseCounts = {};
    const issuedCounts = {};

    inventoryData.forEach(item => {
      const quantity = parseInt(item.quantity) || 0;

      if (item.purchaseDate) {
        const date = new Date(item.purchaseDate);
        let monthYear;
        if (!isNaN(date) && item.purchaseDate !== '' && item.purchaseDate !== null) {
          monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          monthYear = 'NO DATE';
        }
        purchaseCounts[monthYear] = (purchaseCounts[monthYear] || 0) + quantity;
      }

      if (item.issuedDate) {
        const date = new Date(item.issuedDate);
        let monthYear;
        if (!isNaN(date) && item.issuedDate !== '' && item.issuedDate !== null) {
          monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          monthYear = 'NO DATE';
        }
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

    return result;
  }, [inventoryData]);

  const config = useMemo(() => ({
    data: chartData,
    isGroup: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    columnWidthRatio: 0.4,
    colorField: 'type',
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
        labelFontSize: isMobile ? 7 : 10,
      },
      y: {
        minInterval: 1,
        label: {
          formatter: val => `${val}`,
        },
        labelFontSize: isMobile ? 7 : 10,
      },
    },
  }), [chartData, isMobile]);

  const containerStyle = useMemo(() => ({
    height: isMobile ? 270 : 420,
    width: '100%',
    ...(currentTheme !== 'default' && {
      background: theme.componentBackground,
      color: theme.text,
      '--tooltip-bg': theme.header,
      '--tooltip-text': theme.textLight,
    })
  }), [isMobile, currentTheme, theme]);

  return (
    <div 
      className="w-auto h-full rounded-xl bg-[#a7f3d0] shadow-md flex justify-center items-center graph-container"
      style={containerStyle}
    >
      {loading ? <Spin size="large" /> : <Column {...config} />}
    </div>
  );
};

export default Graph;
