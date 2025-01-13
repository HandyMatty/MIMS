import { axiosAuth } from '../axios'; // Importing axiosAuth for request handling

// Fetch all events
export const fetchEvents = async () => {
  try {
    const response = await axiosAuth.get('/getEvents.php'); // No need for baseURL here as axiosAuth already has it
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch events: ' + error.message);
  }
};

// Add a new event
export const addEvent = async (eventData) => {
  // Check for both user and admin tokens
  const userToken = JSON.parse(sessionStorage.getItem('userAuth'))?.state?.token;
  const adminToken = JSON.parse(sessionStorage.getItem('adminAuth'))?.state?.token;

  // Use whichever token is present (admin takes precedence if both exist)
  const token = adminToken || userToken;

  if (!token) {
    throw new Error('User is not authenticated');
  }

  try {
    const response = await axiosAuth.post('/addEvent.php', eventData, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the correct token in the request headers
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to add event: ' + error.message);
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  // Get token from sessionStorage
  const userToken = JSON.parse(sessionStorage.getItem('userAuth'))?.state?.token;
  const adminToken = JSON.parse(sessionStorage.getItem('adminAuth'))?.state?.token;

  // Use whichever token is present (admin takes precedence if both exist)
  const token = adminToken || userToken;

  if (!token) {
    throw new Error('User is not authenticated');
  }

  try {
    const response = await axiosAuth.post('/deleteEvent.php', { id: eventId }, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the request headers
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete event: ' + error.message);
  }
};

