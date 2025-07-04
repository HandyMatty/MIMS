import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { Calendar, Col, Radio, Row, Select, Typography, Modal, Button, List, Avatar, Tooltip } from 'antd';
import dayLocaleData from 'dayjs/plugin/localeData';
import { fetchEvents } from '../../services/api/eventService';
import './customCalendarStyles.css';
import { useTheme } from '../../utils/ThemeContext';

dayjs.extend(dayLocaleData);

const AntCalendar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState({});
  const [allEvents, setAllEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [viewType, setViewType] = useState('month');
  const { theme, currentTheme } = useTheme();

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

  const fetchEventsForDate = (date) => {
    const dateEvents = allEvents.filter(
      (event) => event.event_date === date.format('YYYY-MM-DD')
    );
    setEvents(dateEvents);
  };

  const fetchEventsForMonth = (month, year) => {
    const monthEvents = allEvents.filter((event) => {
      const eventDate = dayjs(event.event_date);
      return eventDate.month() === month && eventDate.year() === year;
    });
    setEvents(monthEvents);
  };

  const fetchEventsForYear = (year) => {
    const yearEvents = allEvents.filter((event) => {
      const eventDate = dayjs(event.event_date);
      return eventDate.year() === year;
    });
    setEvents(yearEvents);
  };

  const fetchAndGroupEventsByYear = (year) => {
    const yearEvents = allEvents.filter((event) => {
      const eventDate = dayjs(event.event_date);
      return eventDate.year() === year;
    });

    const grouped = yearEvents.reduce((acc, event) => {
      const month = dayjs(event.event_date).month();
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    }, {});

    setGroupedEvents(grouped);
    setEvents(yearEvents);
  };

  const onDateClick = (date) => {
    fetchEventsForDate(date);
    setSelectedDate(date);
  
    const selectedYear = date.year();
    const selectedMonth = date.month();
    setSelectedYear(selectedYear);
    setSelectedMonth(selectedMonth);
  
    const hasEvents = allEvents.some(
      (event) => event.event_date === date.format('YYYY-MM-DD')
    );
    setIsModalOpen(hasEvents);
  };  

  const onMonthSelect = (newMonth, currentYear) => {
    setSelectedMonth(newMonth);
    setSelectedYear(currentYear);
    fetchEventsForMonth(newMonth, currentYear);
    const hasEvents = allEvents.some((event) => {
      const eventDate = dayjs(event.event_date);
      return eventDate.month() === newMonth && eventDate.year() === currentYear;
    });
    setIsModalOpen(hasEvents);
  };

  const onYearSelect = (newYear) => {
    setSelectedYear(newYear);
    setSelectedMonth(null);
    fetchAndGroupEventsByYear(newYear);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEvents([]);
    setGroupedEvents({});
  };

  const cellRender = (date) => {
    const dateKey = date.format('YYYY-MM-DD');
    const dateEvents = allEvents.filter((event) => event.event_date === dateKey);

    if (dateEvents.length > 0) {
      const eventTitles = dateEvents.map((event) => event.content).join(', ');
      return (
        <Tooltip title={eventTitles} placement="top">
          <div 
            className="w-1.5 h-1.5 rounded-full mx-auto my-1" 
            style={{
              backgroundColor: currentTheme !== 'default' ? (theme.primary || theme.text) : '#15803d'
            }}
          />
        </Tooltip>
      );
    }
    return null;
  };

  const onPanelChange = (value, mode) => {
    const currentMonth = value.month();
    const currentYear = value.year();

    if (mode === "month" && viewType === "month") {
      setSelectedMonth(currentMonth);
      setSelectedYear(currentYear);
      fetchEventsForMonth(currentMonth, currentYear);
    } else if (mode === "year" && viewType === "year") {
      setSelectedYear(currentYear);
      fetchEventsForYear(currentYear);
    }
  };


  const renderYearViewModalContent = () => {
    return Object.keys(groupedEvents).map((month) => (
      <div key={month}>
        <Typography.Title level={5}>
          {dayjs().month(month).format('MMMM')}
        </Typography.Title>
        <List
          itemLayout="horizontal"
          dataSource={groupedEvents[month]}
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
      </div>
    ));
  };

  return (
    <div 
      className="max-w-full h-auto rounded-xl bg-[#5fe7a7] shadow-md calendar-container calendar-card-head" 
      style={{
        ...(currentTheme !== 'default' && {
          '--calendar-bg': theme.componentBackground,
          '--calendar-text': theme.text,
          '--calendar-border': theme.border,
          '--calendar-radio-checked-bg': theme.primary || theme.text,
          '--calendar-cell-hover-bg': theme.primary ? `${theme.primary}33` : `${theme.text}33`,
          '--calendar-selected-bg': theme.primary || theme.textLight,
          '--calendar-selected-text': theme.componentBackground,
          '--calendar-today-bg': theme.primary ? theme.primary : theme.textLight,
          '--calendar-today-text': theme.componentBackground,
          background: theme.componentBackground,
        })
      }}
    >
      <Calendar
        fullscreen={false}
        className="bg-transparent"
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
            <div className="p-1">
              <Typography.Title level={4}>
                Calendar
              </Typography.Title>
              <Row gutter={8}>
                <Col>
                  <Radio.Group
                    size="small"
                    onChange={(e) => setViewType(e.target.value)}
                    value={viewType}
                  >
                    <Radio.Button className="text-black" value="month">
                      Month
                    </Radio.Button>
                    <Radio.Button className="text-black" value="year">
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
                    className="w-20"
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
                        onMonthSelect(newMonth, year);
                      }}
                      className="w-auto "
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
            ? `Events in ${selectedYear || dayjs().year()}`
            : `Events in ${selectedMonth !== null ? dayjs().month(selectedMonth).year(selectedYear).format('MMMM YYYY') : 'Select Month'}`
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose} className='custom-button-cancel'>
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
