import ky from 'ky';

const api = ky.create({
  prefixUrl: 'http://localhost/mims/api/login.php', // Base URL for your API
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginApi = async (payload) => {
  try {
    const response = await api.post('login.php', {
      json: payload, // Send JSON payload
    }).json(); // Parse JSON response
    return response;
  } catch (error) {
    console.error('Error during login:', error);
    throw error; // Re-throw error to handle in the component
  }
};
