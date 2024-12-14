import React, { useState, useEffect } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { UserOutlined, CheckOutlined, LaptopOutlined } from '@ant-design/icons';
import { fetchUsersStatistics } from '../../services/api/usersdata';  // Import the API function


const UsersStatisticBoard = () => {
  const [statistics, setStatistics] = useState({ totalUsers: 0, activeUsers: 0, activities: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await fetchUsersStatistics(); 
      setStatistics(data); 
      setLoading(false);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics."); 
      setLoading(false); 
    }
  };


  useEffect(() => {
    fetchStatistics(); 
  }, []); 

 
  const defaultStats = {
    totalUsers: 0,
    activeUsers: 0,
    activities: 0, 
  };


  const stats = { ...defaultStats, ...statistics };


  return (
    <Row gutter={16} justify="center" className="status-dashboard">
      {/* Total Users */}
      <Col span={8}>
        <Card
          title={<span className="text-lg font-semibold"><UserOutlined className="text-black text-5xl" /> Total Users</span>}
          bordered={false}
          className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
          style={{ textAlign: 'center' }}
        >
          <Statistic
            value={stats.totalUsers}
            valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
          />
        </Card>
      </Col>

      {/* Active Users */}
      <Col span={8}>
        <Card
          title={<span className="text-lg font-semibold "><CheckOutlined className="text-black text-5xl" /> Active Users</span>}
          bordered={false}
          className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
          style={{ textAlign: 'center' }}
        >
          <Statistic
            value={stats.activeUsers}
            valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
          />
        </Card>
      </Col>

      {/* Activities */}
      <Col span={8}>
        <Card
          title={<span className="text-lg font-semibold"><LaptopOutlined className="text-black text-5xl" /> Activities</span>}
          bordered={false}
          className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105"
          style={{ textAlign: 'center' }}
        >
          <Statistic
            value={stats.activities}
            valueStyle={{ color: 'black', fontSize: '2rem', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default UsersStatisticBoard;
