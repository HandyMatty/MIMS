import { useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import Graph from '../components/Dashboard/Graph';
import StatisticsBoard from '../components/Dashboard/StatisticsBoard';
import AntCalendar from '../components/Dashboard/Calendar';
import DashboardTable from '../components/Dashboard/DashboardTable';
import HistoryBarGraph from '../components/History/HistoryBarGraph';

const Dashboard = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <div className="flex flex-col w-full h-auto p-8">
      {/* Search Input - Positioned Top Right */}
      <div className="flex justify-end mb-4">
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-80 bg-[#a7f3d0] border border-black"
        />
      </div>

      <div>
      <StatisticsBoard searchText={searchText} />
      </div>

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
        <Col xs={24} md={12}>
          <AntCalendar />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
