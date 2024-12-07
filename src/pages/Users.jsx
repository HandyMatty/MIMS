import React from 'react'
import { Typography } from 'antd'
import UsersStatisticBoard from '../components/Users/UsersStatisticBoard';
import UsersList from '../components/Users/UsersList';
import UsersActivities from '../components/Users/UsersActivities';

const Users = () => {
  const { Title } = Typography;
  return (
    <div className="flex flex-col w-full p-8">
      <div className='mb-5'><Title level={1}>Users</Title></div>
      <div>
        <UsersStatisticBoard />
      </div>
      <div className='mt-5'>
        <UsersList />
      </div>
      <div className='mt-5'>
        <UsersActivities />
      </div>
      </div>
  )
}

export default Users