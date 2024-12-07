import React, { useEffect, useState }  from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import {
  LaptopOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ToolOutlined,
  TruckOutlined,
  LikeOutlined,
} from '@ant-design/icons';
import './customStatisticBoard.css';
import { getInventoryCounts } from '../../services/api/getInventory'; 

const StatisticsBoard = () => {
  const [inventoryCounts, setInventoryCounts] = useState({
    totalEquipment: 0,
    deployed: 0,
    available: 0,
    goodCondition: 0,
    defective: 0,
    forrepair: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await getInventoryCounts();
        setInventoryCounts(data);
      } catch (error) {
        console.error('Error fetching inventory counts:', error);
      }
    };
    fetchCounts();
  }, []);

  return (
      <Row gutter={16} justify="space-around" className="status-dashboard">
        
        {/* Total Equipment */}
        <Col span={4}>
          <Card
            title={<span className="text-lg font-semibold"><LaptopOutlined className="text-black text-5xl" /> Total Equipment</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
          >
            <Statistic
              value={inventoryCounts.totalEquipment}
              valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        {/* Deployed */}
        <Col span={4}>
          <Card
            title={<span className="text-lg font-semibold"><TruckOutlined className="text-black text-5xl" /> Deployed</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
          >
            <Statistic
               value={inventoryCounts.deployed}
              valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        {/* Available */}
        <Col span={4}>
          <Card
            title={<span className="text-lg font-semibold"><CheckCircleOutlined className="text-black text-5xl" /> Available</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
          >
            <Statistic
              value={inventoryCounts.available}
              valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        {/* Good Condition */}
        <Col span={4}>
          <Card
            title={<span className="text-lg font-semibold"><LikeOutlined className="text-black text-5xl" /> Good Condition</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
          >
            <Statistic
             value={inventoryCounts.goodCondition}
              valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        {/* Defective */}
        <Col span={4}>
          <Card
            title={<span className="text-lg font-semibold"><WarningOutlined className="text-black text-5xl" /> Defective</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
          >
            <Statistic
              value={inventoryCounts.defective}
              valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        {/* For Repair */}
        <Col span={4}>
          <Card
            title={<span className="text-lg font-semibold"><ToolOutlined className="text-black text-5xl" /> For Repair</span>}
            bordered={false}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
            style={{ textAlign: 'center' }}
          >
            <Statistic
              value={inventoryCounts.forrepair}
              valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

      </Row>
  );
};

export default StatisticsBoard;
