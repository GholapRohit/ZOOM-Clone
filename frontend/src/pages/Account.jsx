import { useContext, useState, useEffect } from "react"; // Import React hooks
import { AuthContext } from "../context/AuthContext"; // Import authentication context
import { handleError } from "../utils/Message"; // Import error handler

const Account = () => {
  // Get the logged-in user's name and the function to fetch their meeting history from context
  const { loggedInUser, getHistoryOfUser } = useContext(AuthContext);

  // State to store the user's meeting history
  const [meetings, setMeetings] = useState([]);

  // Fetch the user's meeting history when the component mounts
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser(); // Fetch history from backend
        setMeetings(history); // Store it in state
      } catch (error) {
        handleError(error); // Show error if fetch fails
      }
    };

    fetchHistory();
  }, []);

  // Helper function to format a date string as DD/MM/YYYY
  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="bg-gray-100 w-screen py-5">
        <div className="bg-white shadow p-3 rounded-md">
          <h1 className="text-2xl font-bold mb-4">History</h1>
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
            {meetings.length !== 0 ? (
              meetings.map((e, i) => {
                return (
                  <div
                    key={i}
                    className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
                  >
                    <p className="mb-3 font-normal text-gray-700 ">
                      <span className="font-bold">Code:</span> {e.meeting_code}
                    </p>
                    <p className="mb-3 font-normal text-gray-700 ">
                      <span className="font-bold">Date:</span>{" "}
                      {formatDate(e.date)}
                    </p>
                  </div>
                );
              })
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
