import React, { Suspense, useState, useEffect } from 'react';
import { Input, Spin, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SINSSILogo from "../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage, preloadImages } from '../utils/imageHelpers.jsx';
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-honeydew">
        <LazyImage
          className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
          src={SINSSILogo}
          alt="SINSSI Logo"
          width={171}
          height={183}
        />
        <Spin size="large" />
        <p className="mt-4 text-darkslategray-200">Loading...</p>
      </div>
    }>
      {/* Search Input - Positioned Top Right */}
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
        <Col xs={24} md={12}>
          <Graph />
        </Col>
        <Col xs={24} md={12} >
          <AntCalendar />
        </Col>
      </Row>
    </Suspense>
  );
};

export default Dashboard;