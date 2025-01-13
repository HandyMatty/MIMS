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
import { getInventoryCounts } from '../../services/api/getInventory';

const StatisticsBoard = () => {
  const [inventoryCounts, setInventoryCounts] = useState({
    totalEquipment: 0,
    BrandNew: 0,
    deployed: 0,
    OnStock: 0,
    goodCondition: 0,
    defective: 0,
    forrepair: 0,
  });
  const [loading, setLoading] = useState(true); // Loading state


  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await getInventoryCounts();
        setInventoryCounts(data);
      } catch (error) {
        console.error('Error fetching inventory counts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="status-dashboard">
      {/* First Row */}
      <Row gutter={[12, 24]} justify="space-around" className='mb-5'>
        <Col xs={12} sm={8} md={6}>
          <Card
            title={<span className="text-lg font-semibold"><LaptopOutlined className="text-black text-5xl" /> Total Equipment</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic
              value={inventoryCounts.totalEquipment}
              valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}
            />
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
            <Statistic
              value={inventoryCounts.BrandNew}
              valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}
            />
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
            <Statistic
              value={inventoryCounts.goodCondition}
              valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}
            />
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
            <Statistic
              value={inventoryCounts.defective}
              valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Second Row */}
      <Row gutter={[12, 24]} justify="space-around">
        <Col xs={12} sm={8} md={8}>
          <Card
            title={<span className="text-lg font-semibold"><CheckCircleOutlined className="text-black text-5xl" /> On Stock</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic
              value={inventoryCounts.OnStock}
              valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}
            />
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
            <Statistic
              value={inventoryCounts.deployed}
              valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}
            />
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
            <Statistic
              value={inventoryCounts.forrepair}
              valueStyle={{ color: 'black', fontSize: '1.9rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsBoard;
