import React, { useEffect, useState } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import {
  LaptopOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ToolOutlined,
  TruckOutlined,
  LikeOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import './customStatisticBoard.css';
import { getInventoryData } from '../../services/api/addItemToInventory';

const StatisticsBoard = ({ searchText }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getInventoryData();
        setInventoryData(data);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Filter inventory based on searchText
  const filteredData = inventoryData.filter((item) =>
    Object.values(item).join(' ').toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate counts from filtered data
  const inventoryCounts = {
    totalEquipment: filteredData.reduce((total, item) => total + Number(item.quantity), 0),
    BrandNew: filteredData.filter((item) => item.condition === 'Brand New').length,
    deployed: filteredData.filter((item) => item.status === 'Deployed').length,
    OnStock: filteredData.filter((item) => item.status === 'On Stock').length,
    goodCondition: filteredData.filter((item) => item.condition === 'Good Condition').length,
    defective: filteredData.filter((item) => item.condition === 'Defective').length,
    forrepair: filteredData.filter((item) => item.status === 'For Repair').length,
  };

  return (
    <div className="status-dashboard">
      <Row gutter={[12, 24]} justify="space-around" className="mb-5">
        <Col xs={12} sm={8} md={6}>
          <Card
            title={<span className="text-lg font-semibold"><LaptopOutlined className="text-black text-5xl" /> Total Equipment</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}value={inventoryCounts.totalEquipment} />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card
            title={<span className="text-lg font-semibold"><TagsOutlined className="text-black text-5xl" /> Brand New</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}value={inventoryCounts.BrandNew} />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card
            title={<span className="text-lg font-semibold"><LikeOutlined className="text-black text-5xl" /> Good Condition</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}value={inventoryCounts.goodCondition} />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card
            title={<span className="text-lg font-semibold"><WarningOutlined className="text-black text-5xl" /> Defective</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}value={inventoryCounts.defective} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 24]} justify="space-around">
        <Col xs={12} sm={8} md={8}>
          <Card
            title={<span className="text-lg font-semibold"><CheckCircleOutlined className="text-black text-5xl" /> On Stock</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}value={inventoryCounts.OnStock} />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={8}>
          <Card
            title={<span className="text-lg font-semibold"><TruckOutlined className="text-black text-5xl" /> Deployed</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}value={inventoryCounts.deployed} />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={8}>
          <Card
            title={<span className="text-lg font-semibold"><ToolOutlined className="text-black text-5xl" /> For Repair</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}value={inventoryCounts.forrepair} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsBoard;
