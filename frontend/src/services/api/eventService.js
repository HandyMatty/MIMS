import { axiosAuth } from '../axios';

export const fetchEvents = async () => {
  try {
    const response = await axiosAuth.get('/getEvents.php');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch events: ' + error.message);
  }
};

export const addEvent = async (eventData) => {
  const userToken = JSON.parse(localStorage.getItem('userAuth'))?.state?.token;
  const adminToken = JSON.parse(localStorage.getItem('adminAuth'))?.state?.token;

  const token = adminToken || userToken;

  if (!token) {
    throw new Error('User is not authenticated');
  }

  try {
    const response = await axiosAuth.post('/addEvent.php', eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add event: ' + error.message);
  }
};

export const deleteEvent = async (eventId) => {
  const userToken = JSON.parse(localStorage.getItem('userAuth'))?.state?.token;
  const adminToken = JSON.parse(localStorage.getItem('adminAuth'))?.state?.token;

  const token = adminToken || userToken;

  if (!token) {
    throw new Error('User is not authenticated');
  }

  try {
    const response = await axiosAuth.post('/deleteEvent.php', { id: eventId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete event: ' + error.message);
  }
};

