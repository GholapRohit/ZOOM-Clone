import { createContext, useState } from "react";

// Create a new context for authentication state and actions
export const AuthContext = createContext();

// AuthProvider component wraps your app and provides authentication state/functions
const AuthProvider = ({ children }) => {
  // State to hold the currently logged-in user's username (empty string if not logged in)
  let [loggedInUser, setLoggedInUser] = useState("");

  // Fetches the user's meeting/activity history from the backend
  const getHistoryOfUser = async () => {
    try {
      let url = `https://zoom-clone-backend-q57o.onrender.com/get_all_activity?user=${loggedInUser}`;
      let response = await fetch(url, {
        method: "GET",
        headers: { "Content-type": "application/json" },
        credentials: "include", // Send cookies for authentication
      });
      let data = await response.json();

      return data; // Returns the user's activity data
    } catch (err) {
      throw err; // Propagate error to caller
    }
  };

  // Adds a meeting code to the user's activity history in the backend
  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await fetch(
        "https://zoom-clone-backend-q57o.onrender.com/add_to_activity",
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          credentials: "include", // Send cookies for authentication
          body: JSON.stringify({ meeting_code: meetingCode }),
        }
      );

      return request; // Returns the fetch response
    } catch (e) {
      throw e; // Propagate error to caller
    }
  };

  // Provide state and functions to all children components via context
  return (
    <AuthContext.Provider
      value={{
        loggedInUser, // Current user's username
        setLoggedInUser, // Function to update the logged-in user
        getHistoryOfUser, // Function to fetch user's activity history
        addToUserHistory, // Function to add a meeting to user's history
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
