import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { Calendar, Col, Radio, Row, Select, Typography, Modal, Button, List, Avatar, Tooltip } from 'antd';
import dayLocaleData from 'dayjs/plugin/localeData';
import { fetchEvents } from '../../services/api/eventService'; // Import your API function
import './customCalendarStyles.css'; // Import your custom styles

// Extend dayjs to use locale data
dayjs.extend(dayLocaleData);

const AntCalendar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState({}); // Grouped events by month for year view
  const [allEvents, setAllEvents] = useState([]); // State to store all events
  const [selectedMonth, setSelectedMonth] = useState(null); // State to track the selected month
  const [selectedYear, setSelectedYear] = useState(null); // State to track the selected year
  const [viewType, setViewType] = useState('month'); // State for the current view (month/year)

  // Fetch all events on component mount
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const fetchedEvents = await fetchEvents();
        setAllEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchAllEvents();
  }, []);

  // Function to fetch events for the selected date
  const fetchEventsForDate = (date) => {
    const dateEvents = allEvents.filter(
      (event) => event.event_date === date.format('YYYY-MM-DD')
    );
    setEvents(dateEvents);
  };

  // Function to fetch events for the selected month
  const fetchEventsForMonth = (month, year) => {
    const monthEvents = allEvents.filter((event) => {
      const eventDate = dayjs(event.event_date); // Parse event date
      return eventDate.month() === month && eventDate.year() === year; // Match month and year
    });
    setEvents(monthEvents); // Set all events for the month
  };

  // Function to fetch events for the entire year
  const fetchEventsForYear = (year) => {
    const yearEvents = allEvents.filter((event) => {
      const eventDate = dayjs(event.event_date); // Parse event date
      return eventDate.year() === year; // Match the year
    });
    setEvents(yearEvents); // Set all events for the year
  };

  // Fetch events for a specific year and group them by month
  const fetchAndGroupEventsByYear = (year) => {
    const yearEvents = allEvents.filter((event) => {
      const eventDate = dayjs(event.event_date);
      return eventDate.year() === year;
    });

    // Group events by month
    const grouped = yearEvents.reduce((acc, event) => {
      const month = dayjs(event.event_date).month(); // Get month index (0-11)
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    }, {});

    setGroupedEvents(grouped);
    setEvents(yearEvents); // Save all year events for the modal
  };

  // Handle date click
  const onDateClick = (date) => {
    fetchEventsForDate(date);
    setSelectedDate(date);
  
    // Ensure selectedYear is set when a date is clicked
    const selectedYear = date.year();
    const selectedMonth = date.month();
    setSelectedYear(selectedYear);
    setSelectedMonth(selectedMonth);
  
    const hasEvents = allEvents.some(
      (event) => event.event_date === date.format('YYYY-MM-DD')
    );
    setIsModalOpen(hasEvents); // Open modal only if there are events
  };  

  // Handle month select
  const onMonthSelect = (newMonth, currentYear) => {
    setSelectedMonth(newMonth);
    setSelectedYear(currentYear);
    fetchEventsForMonth(newMonth, currentYear); // Fetch all events for the month and year
    const hasEvents = allEvents.some((event) => {
      const eventDate = dayjs(event.event_date);
      return eventDate.month() === newMonth && eventDate.year() === currentYear;
    });
    setIsModalOpen(hasEvents); // Open modal only if there are events
  };

  // Handle year select
  const onYearSelect = (newYear) => {
    setSelectedYear(newYear);
    setSelectedMonth(null); // Reset month selection when a new year is selected
    fetchAndGroupEventsByYear(newYear); // Fetch and group events for the year
    setIsModalOpen(true); // Automatically open the modal
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEvents([]);
    setGroupedEvents({});
  };

  // Function to render tooltips on dates
  const cellRender = (date) => {
    const dateKey = date.format('YYYY-MM-DD');
    const dateEvents = allEvents.filter((event) => event.event_date === dateKey);

    if (dateEvents.length > 0) {
      const eventTitles = dateEvents.map((event) => event.content).join(', ');
      return (
        <Tooltip title={eventTitles} placement="top">
          <div className="w-1.5 h-1.5 bg-green-700 rounded-full mx-auto my-1 xs:text-xs" />
        </Tooltip>
      );
    }
    return null;
  };

  // Handle panel change (for switching between views like month/year)
  const onPanelChange = (value, mode) => {
    const currentMonth = value.month();
    const currentYear = value.year();

    if (mode === "month" && viewType === "month") {
      // When in "Month" view, fetch events for the selected month
      setSelectedMonth(currentMonth);
      setSelectedYear(currentYear);
      fetchEventsForMonth(currentMonth, currentYear);
    } else if (mode === "year" && viewType === "year") {
      // When in "Year" view, fetch events for the entire year
      setSelectedYear(currentYear);
      fetchEventsForYear(currentYear); // Fetch events for the whole year
    }
  };

  // Render content for the modal when in "Year" view
  const renderYearViewModalContent = () => {
    return Object.keys(groupedEvents).map((month) => (
      <div key={month}>
        <Typography.Title level={5} className='xs:text-xs'>
          {dayjs().month(month).format('MMMM')}
        </Typography.Title>
        <List
          itemLayout="horizontal"
          dataSource={groupedEvents[month]}
          renderItem={(event) => (
            <List.Item key={event.id}>
              <List.Item.Meta
              className='xs:text-xs'
                avatar={<Avatar src={event.avatar} />}
                title={event.username}
                description={
                  <span style={{ color: event.event_type }} className='xs:text-xs'>
                    {event.content}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </div>
    ));
  };

  return (
    <div className="w-auto h-full rounded-xl bg-[#A8E1C5] shadow-md">
      <Calendar
        fullscreen={false}
        className="bg-transparent xs:text-xs"
        onSelect={onDateClick}
        cellRender={cellRender}
        headerRender={({ value, onChange }) => {
          const year = value.year();
          const month = value.month();
          const localeData = value.localeData();

          const monthOptions = Array.from({ length: 12 }, (_, i) => (
            <Select.Option key={i} value={i}>
              {localeData.monthsShort(dayjs().month(i))}
            </Select.Option>
          ));

          const yearOptions = Array.from({ length: 20 }, (_, i) => (
            <Select.Option key={year - 10 + i} value={year - 10 + i}>
              {year - 10 + i}
            </Select.Option>
          ));

          return (
            <div className="p-2">
              <Typography.Title level={4} className="m-0">
                Calendar
              </Typography.Title>
              <Row gutter={8}>
                <Col>
                  <Radio.Group
                    size="small"
                    onChange={(e) => setViewType(e.target.value)}
                    value={viewType}
                  >
                    <Radio.Button className="custom-radio text-black w-auto text-xs sm:text-sm" value="month">
                      Month
                    </Radio.Button>
                    <Radio.Button className="custom-radio text-black w-auto text-xs sm:text-sm" value="year">
                      Year
                    </Radio.Button>
                  </Radio.Group>
                </Col>
                <Col>
                  <Select
                    size="small"
                    value={year}
                    onChange={(newYear) => {
                      const now = value.clone().year(newYear);
                      onChange(now);
                      if (viewType === 'year') onYearSelect(newYear);
                    }}
                    className="w-auto"
                  >
                    {yearOptions}
                  </Select>
                </Col>
                {viewType === 'month' && (
                  <Col>
                    <Select
                      size="small"
                      value={month}
                      onChange={(newMonth) => {
                        const now = value.clone().month(newMonth);
                        onChange(now);
                    
                        // Call the onMonthSelect function
                        onMonthSelect(newMonth, year);
                      }}
                      className="w-auto"
                    >
                      {monthOptions}
                    </Select>
                  </Col>
                )}
              </Row>
            </div>
          );
        }}
        onPanelChange={onPanelChange}
      />

      <Modal
        title={
          viewType === 'year'
            ? `Events in ${selectedYear || dayjs().year()}` // Fallback to current year if selectedYear is null
            : `Events in ${selectedMonth !== null ? dayjs().month(selectedMonth).year(selectedYear).format('MMMM YYYY') : 'Select Month'}` // Add fallback logic for month and year
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        centered
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        {viewType === 'year'
          ? renderYearViewModalContent()
          : events.length > 0 && (
              <List
                itemLayout="horizontal"
                dataSource={events}
                renderItem={(event) => (
                  <List.Item key={event.id}>
                    <List.Item.Meta
                      avatar={<Avatar src={event.avatar} />}
                      title={event.username}
                      description={
                        <span style={{ color: event.event_type }}>
                          {event.content}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
      </Modal>
    </div>
  );
};

export default AntCalendar;
