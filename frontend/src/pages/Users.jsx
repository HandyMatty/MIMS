import UsersStatisticBoard from '../components/Users/UsersStatisticBoard';
import UsersList from '../components/Users/UsersList';
import UsersActivities from '../components/Users/UsersActivities';

const Users = () => {
  return (
    <div className="container max-w-full">
      <div className='mt-5'>
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