import React from 'react';
import { Row, Col } from 'antd';
import Graph from '../components/Dashboard/Graph';
import StatisticsBoard from '../components/Dashboard/StatisticsBoard';
import AntCalendar from '../components/Dashboard/Calendar';
import DashboardTable from '../components/Dashboard/DashboardTable';

const Dashboard = () => {

  return (
    <div className="flex flex-col w-full h-auto p-8">
    <div>
        <StatisticsBoard />
      </div>

      {/* Row container for Graph and AntCalendar */}
      <Row gutter={[16, 16]} className="mt-5">
        {/* Column for Graph */}
        <Col xs={24} md={12}>
          <Graph />
        </Col>
        
        {/* Column for Calendar */}
        <Col xs={24} md={12}>
          <AntCalendar />
        </Col>
      </Row>

      <div className="mt-5">
        <DashboardTable />
      </div>
    </div>
  );
};

export default Dashboard;
