import React, { useState, useEffect } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { UserOutlined, CheckOutlined, LaptopOutlined } from '@ant-design/icons';
import { fetchUsersStatistics } from '../../services/api/usersdata';  // Import the API function


const UsersStatisticBoard = () => {
  const [statistics, setStatistics] = useState({ totalUsers: 0, activeUsers: 0, activities: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch statistics
  const fetchStatistics = async () => {
    try {
      setLoading(true); // Start loading state
      const data = await fetchUsersStatistics(); // Fetch the statistics data
      setStatistics(data); // Set the fetched data to state
      setLoading(false); // End loading state
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics."); // Set error state if fetching fails
      setLoading(false); // End loading state
    }
  };

  // Fetch statistics on component mount and immediately after login
  useEffect(() => {
    fetchStatistics(); // Fetch the statistics immediately after the component mounts
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Placeholder values for when data is loading
  const defaultStats = {
    totalUsers: 0,
    activeUsers: 0,
    activities: 20, // Default value
  };

  // Use the statistics data or fallback to default
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
