import React from 'react'
import UsersStatisticBoard from '../components/Users/UsersStatisticBoard';
import UsersList from '../components/Users/UsersList';
import UsersActivities from '../components/Users/UsersActivities';

const Users = () => {
  return (
    <div className="flex flex-col w-full p-8">
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