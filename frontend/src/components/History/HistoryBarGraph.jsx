import { useState, useEffect } from 'react';
import { Bar } from '@ant-design/plots';
import { getInventoryData } from '../../services/api/addItemToInventory';
import { Spin } from 'antd';
import './customBarGraph.css';

const COLORS = [
  '#f4664a', '#faad14', '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb', '#722ed1',
  '#eb2f96', '#fa541c', '#fa8c16', '#fadb14', '#b7eb8f', '#87e8de', '#91d5ff', '#adc6ff',
  '#d3adf7', '#ffadd2', '#ffd6e7', '#ffe7ba', '#fff566', '#d9f7be', '#e6fffb', '#bae7ff',
  '#d6e4ff', '#efdbff', '#ffccc7', '#ffe58f', '#fff1b8', '#f4ffb8', '#d9f7be', '#e6fffb',
  '#b5f5ec', '#adc6ff'
];

const HistoryBarGraph = ({ searchText }) => {
  const [barData, setBarData] = useState([]);
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

        const filteredData = data.filter(item =>
          Object.values(item).join(' ').toLowerCase().includes(searchText.toLowerCase())
        );

        const typeCounts = filteredData.reduce((acc, item) => {
          const { type, quantity } = item;
          if (!type) return acc;
          if (!acc[type]) acc[type] = 0;
          acc[type] += parseInt(quantity) || 0;
          return acc;
        }, {});

        const formattedData = Object.entries(typeCounts)
          .map(([labelName, value]) => ({ labelName, value }))
          .sort((a, b) => a.labelName.localeCompare(b.labelName)); // ✅ Sort alphabetically

        setBarData(formattedData);
      } catch (error) {
        console.error('Failed to fetch inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [searchText]);

  const config = {
    data: barData,
    xField: 'labelName',
    yField: 'value',
    colorField: 'labelName',
    paddingRight: isMobile ? 20 : 75,
    style: {
      maxWidth: isMobile ? 7 : 18,
    },
    markBackground: {
      label: {
        text: ({ originData }) => `${(originData.value / 1000) * 100}% | ${originData.value}`,
        position: 'bottom',
        dx: isMobile ? 40 : 80,
        style: {
          fill: '#072C1C',
          fillOpacity: 1,
          fontSize: isMobile ? 7 : 9,
        },
      },
      style: {
        fill: '#eee',
      },
    },
    legend: {
      color: {
        itemLabelFontSize: isMobile ? 7:10,
        title: false,
        position: 'top',
        maxCols: 8,
        maxRows: 2,
        itemName: {
          style: {
            fill: '#072C1C',
          },
        },
        layout: {
        justifyContent: 'center',
      },
        items: barData
          .slice()
          .sort((a, b) => a.labelName.localeCompare(b.labelName)) // ✅ Sort legends alphabetically
          .map(item => ({
            name: item.labelName,
            value: item.labelName,
            marker: {
              symbol: 'square',
              style: {
                fill: COLORS[barData.findIndex(d => d.labelName === item.labelName) % COLORS.length],
                r: 5,
              },
            },
          })),
      },
    },
    scale: {
      y: {
        domain: [0, Math.max(...barData.map(d => d.value || 0), 1000)],
      },
      color: {
        range: COLORS,
      },
    },
    axis: {
      x: {
        tick: true,
        label: true,
        labelFontSize: isMobile ? 5 : 9,
        labelFontStyle: 'bold',
        labelFill: '#072C1C',
        labelFillOpacity: 2,
      },
      y: {
        grid: true,
        gridStrokeOpacity: 5,
        gridLineDash: [5, 5],
        tick: false,
        label: true,
        title: 'Inventory Types Quantity',
        titleFontSize: isMobile ? 10 : 12,
        titleFontStyle: 'bold',
        scrollY: !isMobile,
        labelFontSize: isMobile ? 8 : 12,
        labelFill: '#072C1C',
        labelFillOpacity: 2,
      },
    },
    interaction: {
      elementHighlight: true,
    },
    autoFit: true,
    height: isMobile ? 270 : 420,
  };

  return (
    <div
      className="history-bar-graph-container"
      style={{
        height: isMobile ? 270 : 420,
        width: '100%',
        minWidth: 320,
        padding: isMobile ? '2px' : '10px',
      }}
    >
      {loading ? (
        <div className="loading-spinner">
          <Spin size="large" />
        </div>
      ) : (
        <Bar {...config} />
      )}
    </div>
  );
};

export default HistoryBarGraph;
