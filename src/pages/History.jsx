import React from 'react'
import { Typography } from 'antd'
import HistoryBarGraph from '../components/History/HistoryBarGraph';
import HistoryTable from '../components/History/HistoryTable';

const History = () => {
  const { Title } = Typography;
  return (
    <div className="flex flex-col w-full p-8">
        <div className='mb-5'>
          <Title level={1}>History</Title>
        </div>

        <div>
          <HistoryBarGraph /> 
        </div>

        <div className='mt-5'>
          <HistoryTable /> 
        </div>
    </div>
  )
}

export default History