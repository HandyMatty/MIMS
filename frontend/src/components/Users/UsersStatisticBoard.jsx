import { useMemo } from 'react';
import { Row, Col, Statistic, Card } from 'antd';
import { UserOutlined, CheckOutlined, LaptopOutlined } from '@ant-design/icons';
import CountUp from 'react-countup';

const UsersStatisticBoard = ({ statistics = {}, loading = false, error = null, onRefresh }) => {
  const defaultStats = useMemo(() => ({
    totalUsers: 0,
    activeUsers: 0,
    activities: 0, 
  }), []);

  const stats = useMemo(() => ({ ...defaultStats, ...statistics }), [defaultStats, statistics]);

  const statisticCards = useMemo(() => [
    {
      key: 'totalUsers',
      title: (
        <span className="text-black text-xs sm:text-sm md:text-base lg:text-lgi">
          <UserOutlined className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi" /> Total Users
        </span>
      ),
      value: stats.totalUsers,
      icon: UserOutlined
    },
    {
      key: 'activeUsers',
      title: (
        <span className="text-black text-xs sm:text-sm md:text-base lg:text-lgi">
          <CheckOutlined className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi" /> Active Users
        </span>
      ),
      value: stats.activeUsers,
      icon: CheckOutlined
    },
    {
      key: 'activities',
      title: (
        <span className="text-black text-xs sm:text-sm md:text-base lg:text-lgi">
          <LaptopOutlined className="text-xs sm:text-sm md:text-base font-semibold lg:text-lgi" /> Activities
        </span>
      ),
      value: stats.activities,
      icon: LaptopOutlined
    }
  ], [stats]);

  const countUpFormatter = useMemo(() => (value) => (
    <CountUp
      start={0}
      end={value}
      duration={2}
      separator=","
      className="text-lgi xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-black"
    />
  ), []);

  return (
    <Row gutter={[12, 24]} justify="center" className="status-dashboard">
      {statisticCards.map(({ key, title, value, icon: Icon }) => (
        <Col xs={12} sm={8} key={key}>
          <Card
            title={title}
            className="rounded-xl shadow-md transition-transform bg-[#A8E1C5] transform hover:scale-105 border-none"
            style={{ textAlign: 'center' }}
            loading={loading}
          >
            <Statistic
              value={value}
              formatter={countUpFormatter}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default UsersStatisticBoard;
