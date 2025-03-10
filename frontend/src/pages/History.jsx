import React from 'react'
import HistoryBarGraph from '../components/History/HistoryBarGraph';
import HistoryTable from '../components/History/HistoryTable';

const History = () => {
  return (
    <div className="flex flex-col w-full h-auto p-8">
        <div className='mt-5'>
          <HistoryTable /> 
        </div>
    </div>
  )
}

export default History