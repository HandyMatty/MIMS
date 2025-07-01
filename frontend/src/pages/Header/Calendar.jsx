import { Suspense, useEffect, useState } from 'react';
import { Calendar as AntdCalendar, Typography, Tag, Divider, Row, Col, Spin } from 'antd';
import { fetchEvents } from '../../services/api/eventService';
import EventList from '../../components/Calendar/EventList';
import EventModal from '../../components/Calendar/EventModal';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import SINSSILogo from "../../../assets/SINSSI_LOGO-removebg-preview.png";
import { LazyImage, preloadImages } from '../../utils/imageHelpers.jsx';
import { useTheme } from '../../utils/ThemeContext';

const { Title } = Typography;

const Calendar = () => {
  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);
  const [events, setEvents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const { userData: userAuthData } = useUserAuthStore();
  const { userData: adminAuthData } = useAdminAuthStore();
  const isAdmin = !!adminAuthData;
  const currentUser = userAuthData || adminAuthData;
  const { theme, currentTheme } = useTheme();

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

  const showModal = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-honeydew">
        <LazyImage
          className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
          src={SINSSILogo}
          alt="SINSSI Logo"
          width={171}
          height={183}
        />
        <Spin size="large" />
        <p className="mt-4 text-darkslategray-200">Loading...</p>
      </div>
    }>
      <div className="container max-w-full">
        <div className='mt-5'>
          <Divider style={currentTheme !== 'default' ? { borderColor: theme.text } : { borderColor: '#072C1C' }}>
            <Title level={3} style={currentTheme !== 'default' ? { color: theme.text } : {}}>CALENDAR</Title>
          </Divider>
        </div>
        {/* Legend Section */}
        <Row gutter={[16, 8]} className="mb-2 justify-center"
         >
          <Col xs={12} sm={6} md={3}>
            <Tag color="#4169E1">Important</Tag>
            <span>Royal Blue</span>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Tag color="#FFD700" style={{ color: 'black' }}>Celebration</Tag>
            <span>Gold</span>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Tag color="#228B22">Task</Tag>
            <span>Forest Green</span>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Tag color="#4682B4">Meeting</Tag>
            <span>Steel Blue</span>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Tag color="#FFC0CB" style={{ color: 'black' }}>Personal</Tag>
            <span>Soft Pink</span>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Tag color="#B22222">Deadline</Tag>
            <span>Firebrick Red</span>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Tag color="#FFFFE0" style={{ color: 'black' }}>Idea</Tag>
            <span>Pale Yellow</span>
          </Col>
        </Row>

        <div className="flex flex-col w-full h-auto mx-auto bg-[#a7f3d0] rounded-xl shadow p-2"
          style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}>
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
                setEvents={setEvents}
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
    </Suspense>
  );
};

export default Calendar;