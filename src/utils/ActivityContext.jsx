import React, { createContext, useContext } from 'react';
import { logActivity } from '../services/api/logActivity'; // Import the logActivity function

// Create a context for activity
const ActivityContext = createContext();

// Provider component that will wrap your app
export const ActivityProvider = ({ children }) => {
  const logUserActivity = async (username, activity, details) => {
    try {
      // Log the activity via the API function
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

// Hook to use the context in any component
export const useActivity = () => useContext(ActivityContext);
