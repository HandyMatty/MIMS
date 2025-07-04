import React, { Suspense, useState, useEffect } from 'react';
import { Input, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { preloadImages } from '../utils/imageHelpers.jsx';
import LoadingFallback from '../components/common/LoadingFallback.jsx';
const Graph = React.lazy(() => import('../components/Dashboard/Graph'));
const StatisticsBoard = React.lazy(() => import('../components/Dashboard/StatisticsBoard'));
const AntCalendar = React.lazy(() => import('../components/Dashboard/Calendar'));
const DashboardTable = React.lazy(() => import('../components/Dashboard/DashboardTable'));
const HistoryBarGraph = React.lazy(() => import('../components/History/HistoryBarGraph'));

const Dashboard = () => {
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="flex justify-center sm:justify-end mb-4 mt-2">
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-auto border border-black"
        />
      </div>

      <StatisticsBoard searchText={searchText} />
      <div className="mt-5">
        <HistoryBarGraph searchText={searchText} />
      </div>
      <div className="mt-5">
        <DashboardTable searchText={searchText} />
      </div>
      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24} md={16}>
          <Graph />
        </Col>
        <Col xs={24} md={8} >
          <AntCalendar />
        </Col>
      </Row>
    </Suspense>
  );
};

export default Dashboard;