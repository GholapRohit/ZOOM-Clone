import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const MeetingCode = () => {
  let navigate = useNavigate(); // Hook for programmatic navigation
  const [meetingCode, setMeetingCode] = useState(""); // State to store the meeting code input

  const { addToUserHistory } = useContext(AuthContext); // Get function to add meeting to user's history

  // Function to handle joining a video call
  let handleJoinVideoCall = async (e) => {
    e.preventDefault(); // Prevent default form submission
    await addToUserHistory(meetingCode); // Add this meeting code to user's history (backend)
    navigate(`/meet/${meetingCode}`); // Navigate to the video meeting page with the code
  };

  return (
    <div className=" sm:h-screen bg-white py-4 px-4 sm:px-6 lg:px-8 lg:py-10">
      <div className=" mx-auto max-w-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900  sm:text-4xl">
            Join the Meeting
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500 ">
            Enter your meeting code below to quickly join your meeting.
          </p>
        </div>
        <div className="mt-12">
          <form
            className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
            method="post"
          >
            <div className="sm:col-span-2">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 "
              >
                Meeting Code
              </label>
              <div className="mt-1">
                <input
                  onChange={(e) => setMeetingCode(e.target.value)}
                  name="meeting_code"
                  type="text"
                  id="code"
                  required
                  className="border outline-none border-gray-300 block w-full rounded-md py-3 px-4 shadow-sm focus:border-sky-500 focus:ring-sky-500  "
                />
              </div>
            </div>
            <div className="flex sm:col-span-2">
              <button
                onClick={handleJoinVideoCall}
                type="submit"
                className="hover:cursor-pointer inline-flex items-center rounded-md px-4 py-2 font-medium focus:outline-none focus-visible:ring focus-visible:ring-sky-500 shadow-sm sm:text-sm transition-colors duration-75 text-sky-600 border border-sky-500 hover:bg-sky-50 active:bg-sky-100 "
              >
                Join Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingCode;
