import { createContext, useContext } from 'react';
import { logActivity } from '../services/api/logActivity';

const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const logUserActivity = async (username, activity, details) => {
    try {
      await logActivity(username, activity, details);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  return (
    <ActivityContext.Provider value={{ logUserActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext);
