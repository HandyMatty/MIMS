import { axiosAuth } from '../axios';

export const fetchSecurityQuestion = async (token) => {
  try {
    const response = await axiosAuth.get('/getSecurityQuestion.php', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching security question:', error);
    throw error;
  }
};

export const updateSecurityQuestion = async (token, question, answer) => {
    try {
      const response = await axiosAuth.post(
        '/getSecurityQuestion.php',
        {
          security_question: question,
          security_answer: answer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating security question:', error);
      throw error;
    }
  };