import { useState, useEffect } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { UserOutlined, CheckOutlined, LaptopOutlined } from '@ant-design/icons';
import { fetchUsersStatistics } from '../../services/api/usersdata';
import CountUp from 'react-countup';


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
    <Row gutter={[12, 24]} justify="center" className="status-dashboard">
      {/* Total Users */}
      <Col xs={12} sm={8} >
        <Card
          title={<span className="text-black text-xs sm:text-sm md:text-base lg:text-lgi ">
          <UserOutlined className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi " /> Total Users</span>}
          className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
          style={{ textAlign: 'center' }}
          loading={loading}
        >
          <Statistic
            value={stats.totalUsers}
            formatter={value => (
              <CountUp
                start={0}
                end={value}
                duration={2}
                separator=","
                className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-black"
                />
            )}
          />
        </Card>
      </Col>

      {/* Active Users */}
      <Col xs={12} sm={8} >
        <Card
          title={<span className="text-black text-xs sm:text-sm md:text-base lg:text-lgi ">
            <CheckOutlined className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi " /> Active Users</span>}
          className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
          style={{ textAlign: 'center' }}
          loading={loading}
        >
          <Statistic
            value={stats.activeUsers}
            formatter={value => (
              <CountUp
                start={0}
                end={value}
                duration={2}
                separator=","
                className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-black"
              />
            )}
          />
        </Card>
      </Col>

      {/* Activities */}
      <Col xs={12} sm={8} >
        <Card
          title={<span className="text-black text-xs sm:text-sm md:text-base lg:text-lgi ">
            <LaptopOutlined className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi " /> Activities</span>}
          className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
          style={{ textAlign: 'center' }}
          loading={loading}
        >
          <Statistic
            value={stats.activities}
            formatter={value => (
              <CountUp
                start={0}
                end={value}
                duration={2}
                separator=","
                className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-black"
              />
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default UsersStatisticBoard;
