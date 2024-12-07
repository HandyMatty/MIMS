import React, { useState, useEffect } from 'react';
import { Calendar as AntdCalendar, Typography } from 'antd';
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
     <div className="flex flex-col w-full p-8">
    <div className='mb-5'>
          <Title level={2}>Calendar</Title>
    </div>
    <div className="flex flex-col w-full h-auto mx-auto bg-[#A8E1C5] rounded-xl shadow p-2">
<AntdCalendar 
  cellRender={(currentDate, info) => (
    <EventList 
      currentDate={currentDate} 
      info={info} 
      events={events} 
      showModal={showModal} 
      isAdmin={isAdmin} 
      currentUser={currentUser}
      setEvents={setEvents} // Pass setEvents here
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
