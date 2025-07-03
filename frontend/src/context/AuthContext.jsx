import { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  let [loggedInUser, setLoggedInUser] = useState("");

  const getHistoryOfUser = async () => {
    try {
      let url = `https://zoom-clone-backend-q57o.onrender.com/users/get_all_activity?user=${loggedInUser}`;
      let response = await fetch(url, {
        method: "GET",
        headers: { "Content-type": "application/json" },
        credentials: "include",
      });
      let data = await response.json();

      return data;
    } catch (err) {
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await fetch(
        "https://zoom-clone-backend-q57o.onrender.com/users/add_to_activity",
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ meeting_code: meetingCode }),
        }
      );

      return request;
    } catch (e) {
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loggedInUser,
        setLoggedInUser,
        getHistoryOfUser,
        addToUserHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
