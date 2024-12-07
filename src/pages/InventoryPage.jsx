import React from 'react'
import { Typography } from 'antd'
import InventoryTable from '../components/Inventory/InventoryTable';

const InventoryPage = () => {
  const { Title } = Typography;
  return (
    <div className="flex flex-col w-full h-auto p-8">
      <div className='mb-5'><Title level={1}>Inventory</Title></div>
      <div><InventoryTable /></div>
      </div>
  )
}

export default InventoryPage
