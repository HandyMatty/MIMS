import { useState, useEffect } from 'react';
import { Calendar as AntdCalendar, Typography, Tag, Divider, Row, Col } from 'antd';
import { fetchEvents } from '../../services/api/eventService';
import EventList from '../../components/Calendar/EventList';
import EventModal from '../../components/Calendar/EventModal';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';

const { Title } = Typography;

const Calendar = () => {
  const [events, setEvents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const { userData: userAuthData } = useUserAuthStore();
  const { userData: adminAuthData } = useAdminAuthStore();
  const isAdmin = !!adminAuthData; // Admin check based on your store
  const currentUser = userAuthData || adminAuthData; // To track current user

  // Fetch events when the component mounts
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    fetchEvents()
      .then(fetchedEvents => {
        const formattedEvents = {};
        fetchedEvents.forEach(event => {
          const dateKey = event.event_date;
          if (!formattedEvents[dateKey]) {
            formattedEvents[dateKey] = [];
          }
          formattedEvents[dateKey].push({
            id: event.id,
            type: event.event_type,
            content: event.content,
            avatar: event.avatar || '',
            username: event.username || '',
          });
        });
        setEvents(formattedEvents);
      })
      .catch(error => {
        console.error('Failed to fetch events:', error);
      });
  };

  // Open the modal for inputting events
  const showModal = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <>
    <div className="container max-w-full">
    <div className='mt-5'>
         <Divider style={{borderColor: '#072C1C'}}> 
          <Title level={3}>CALENDAR</Title> </Divider>
    </div>
      {/* Legend Section */}
        <Row className='flex flex-col sm:flex-row justify-center items-center gap-4 mb-2'>
          <Col span={[2,2]}>
            <Tag color="#4169E1">Important</Tag>
            <span>Royal Blue</span>
          </Col>
          <Col span={[2,2]}>
            <Tag color="#FFD700" style={{color: 'black'}}>Celebration</Tag>
            <span>Gold</span>
          </Col>
          <Col span={[2,2]}>
            <Tag color="#228B22">Task</Tag>
            <span>Forest Green</span>
          </Col>
          <Col span={[2,2]}>
            <Tag color="#4682B4">Meeting</Tag>
            <span>Steel Blue</span>
          </Col>
          <Col span={[2,2]}>
            <Tag color="#FFC0CB" style={{color: 'black'}}>Personal</Tag>
            <span>Soft Pink</span>
          </Col>
          <Col span={[2,2]}>
            <Tag color="#B22222">Deadline</Tag>
            <span>Firebrick Red</span>
          </Col>
          <Col span={[2,2]}>
            <Tag color="#FFFFE0" style={{ color: 'black' }}>Idea</Tag>
            <span>Pale Yellow</span>
          </Col>
        </Row>

<div className="flex flex-col w-full h-auto mx-auto bg-[#A8E1C5] rounded-xl shadow p-2">
<AntdCalendar 
  className='text-xs w-full'
  cellRender={(currentDate, info) => (
    <EventList 
      currentDate={currentDate} 
      info={info} 
      events={events} 
      showModal={showModal} 
      isAdmin={isAdmin} 
      currentUser={currentUser}
      setEvents={setEvents} // Pass setEvents here
      isGuest={!isAdmin && !currentUser}
    />
  )}
/>
      {/* Modal for adding events */}
      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={selectedDate} 
        loadEvents={loadEvents} 
        events={events}
      />
    </div>
    </div>
    </>
  );
};

export default Calendar;
