import React, { useState, useEffect } from 'react';
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
  const [allEvents, setAllEvents] = useState([]); // State to store all events
  const [selectedMonth, setSelectedMonth] = useState(null); // State to track the selected month
  const [selectedYear, setSelectedYear] = useState(null); // State to track the selected year

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
    const dateEvents = allEvents.filter(event => event.event_date === date.format('YYYY-MM-DD'));
    setEvents(dateEvents);
  };

  // Function to fetch events for the selected month
  const fetchEventsForMonth = (month, year) => {
    const monthEvents = allEvents.filter(event => 
      dayjs(event.event_date).month() === month && 
      dayjs(event.event_date).year() === year
    );
    setEvents(monthEvents);
    setIsModalOpen(monthEvents.length > 0); // Open modal if there are events
  };

  // Handle date click
  const onDateClick = (date) => {
    fetchEventsForDate(date); // Fetch events for the clicked date
    const hasEvents = events.length > 0; // Check if there are events for that date

    if (hasEvents) { // Only set the modal to open if there are events
      setSelectedDate(date);
      setIsModalOpen(true);
    } else {
      console.log("No events for this date."); // This can be removed or replaced with a notification
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEvents([]);
  };

  // Function to render tooltips on dates (now using cellRender)
  const cellRender = (date, info) => {
    const dateKey = date.format('YYYY-MM-DD');
    const dateEvents = allEvents.filter(event => event.event_date === dateKey);

    if (dateEvents.length > 0) {
      const eventTitles = dateEvents.map(event => event.content).join(', '); // Combine event titles
      return (
        <Tooltip title={eventTitles} placement="top">
          <div className="w-1.5 h-1.5 bg-green-700 rounded-full mx-auto my-1" />
        </Tooltip>
      );
    }
    return null; // Return null if no events for the date
  };

  return (
      <div className="max-w-full h-full rounded-xl bg-[#A8E1C5] shadow-md transition-transform transform hover:scale-105">
        <Calendar
          fullscreen={false}
          className="bg-transparent"
          onSelect={onDateClick}
          cellRender={cellRender} // Use cellRender instead of dateCellRender
          headerRender={({ value, type, onChange, onTypeChange }) => {
            const monthOptions = [];
            const localeData = value.localeData();
            let current = value.clone();

            for (let i = 0; i < 12; i++) {
              current = current.month(i);
              monthOptions.push(
                <Select.Option key={i} value={i}>
                  {localeData.monthsShort(current)}
                </Select.Option>
              );
            }

            const year = value.year();
            const month = value.month();
            const options = [];

            for (let i = year - 10; i < year + 10; i += 1) {
              options.push(
                <Select.Option key={i} value={i}>
                  {i}
                </Select.Option>
              );
            }

            return (
              <div className="p-2">
                <Typography.Title level={4} className="m-0">
                  Calendar
                </Typography.Title>
                <Row gutter={8}>
                  <Col>
                    <Radio.Group
                      size="small"
                      onChange={(e) => onTypeChange(e.target.value)}
                      value={type}
                    >
                      <Radio.Button className="custom-radio text-black" value="month">
                        Month
                      </Radio.Button>
                      <Radio.Button className="custom-radio text-black" value="year" >
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
                        setSelectedYear(newYear); // Update selected year state
                      }}
                      className="w-20"
                    >
                      {options}
                    </Select>
                  </Col>
                  <Col>
                    <Select
                      size="small"
                      value={month}
                      onChange={(newMonth) => {
                        const now = value.clone().month(newMonth);
                        onChange(now);
                        setSelectedMonth(newMonth); // Update selected month state
                        fetchEventsForMonth(newMonth, year); // Fetch events for the selected month
                      }}
                      className="w-24"
                    >
                      {monthOptions}
                    </Select>
                  </Col>
                </Row>
              </div>
            );
          }}
          onPanelChange={(value, mode) => {
            console.log(value.format('YYYY-MM-DD'), mode);
          }}
        />

      {/* Modal for displaying events */}
      <Modal
        title={`Events in ${selectedMonth !== null ? dayjs().month(selectedMonth).format('MMMM YYYY') : ''}`}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={[ 
          <Button key="close" onClick={handleModalClose}> Close </Button>
        ]}
      >
        <List
          itemLayout="horizontal"
          dataSource={events}
          renderItem={(event) => (
            <List.Item key={event.id}>
              <List.Item.Meta
                avatar={<Avatar src={event.avatar} />}
                title={event.username}
                description={event.content}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default AntCalendar;
