import React from 'react'
import { Typography } from 'antd'

const Notifications = () => {
  const { Title } = Typography;
  return (
    <div className="flex flex-col w-full p-8">
      <div className='mb-5'><Title level={2}>Notifications</Title></div>
      <div className="flex flex-col w-full h-full bg-[#A8E1C5] rounded-xl shadow p-6">
      </div>
      </div>
  )
}

export default Notifications