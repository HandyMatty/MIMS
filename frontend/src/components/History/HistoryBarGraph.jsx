import { useState, useEffect, useMemo, useCallback } from 'react';
import { Bar } from '@ant-design/plots';
import { Spin } from 'antd';
import './customBarGraph.css';
import { useTheme } from '../../utils/ThemeContext';

const COLORS = [
  '#f4664a', '#faad14', '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb', '#722ed1',
  '#eb2f96', '#fa541c', '#fa8c16', '#fadb14', '#b7eb8f', '#87e8de', '#91d5ff', '#adc6ff',
  '#d3adf7', '#ffadd2', '#ffd6e7', '#ffe7ba', '#fff566', '#d9f7be', '#e6fffb', '#bae7ff',
  '#d6e4ff', '#efdbff', '#ffccc7', '#ffe58f', '#fff1b8', '#f4ffb8', '#d9f7be', '#e6fffb',
  '#b5f5ec', '#adc6ff'
];

const HistoryBarGraph = ({ searchText, inventoryData, loading }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const { theme, currentTheme } = useTheme();

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const barData = useMemo(() => {
    if (!inventoryData || inventoryData.length === 0) return [];

    const typeCounts = inventoryData.reduce((acc, item) => {
      const { type, quantity } = item;
      if (!type) return acc;
      if (!acc[type]) acc[type] = 0;
      acc[type] += parseInt(quantity) || 0;
      return acc;
    }, {});

    const formattedData = Object.entries(typeCounts)
      .map(([labelName, value]) => ({ labelName, value }))
      .sort((a, b) => a.labelName.localeCompare(b.labelName));

    return formattedData;
  }, [inventoryData]);

  const config = useMemo(() => ({
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
        itemLabelFontSize: isMobile ? 7 : 10,
        title: false,
        position: 'top',
        maxCols: barData.length,
        maxRows: 1,
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
          .sort((a, b) => a.labelName.localeCompare(b.labelName))
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
        nice: true,
      },
      color: {
        range: COLORS,
      },
    },
    axis: {
      x: {
        grid: true,
        gridStrokeOpacity: 0.2,
        gridLineDash: [1],
        tick: true,
        label: true,
        labelFontSize: isMobile ? 5 : 9,
        labelFontStyle: 'bold',
        labelFill: '#072C1C',
        labelFillOpacity: 2,
      },
      y: {
        grid: true,
        gridStrokeOpacity: 0.2,
        gridLineDash: [1],
        tick: true,
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
  }), [barData, isMobile]);

  const containerStyle = useMemo(() => ({
    height: isMobile ? 270 : 420,
    width: '100%',
    minWidth: 320,
    padding: isMobile ? '2px' : '10px',
    ...(currentTheme !== 'default' && {
      '--tooltip-bg': theme.header,
      '--tooltip-text': theme.textLight,
      background: theme.componentBackground,
    })
  }), [isMobile, currentTheme, theme]);

  const loadingSpinner = useMemo(() => (
    <div className="loading-spinner">
      <Spin size="large" />
    </div>
  ), []);

  return (
    <div
      className="history-bar-graph-container"
      style={containerStyle}
    >
      {loading ? loadingSpinner : <Bar {...config} />}
    </div>
  );
};

export default HistoryBarGraph;
