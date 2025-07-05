import { useState } from "react";
import { handleError, handleSuccess } from "../utils/Message"; // Toast helpers for showing messages
import { useNavigate } from "react-router-dom"; // For navigation after signup

const Signup = () => {
  const navigate = useNavigate(); // For programmatic navigation

  // State to hold the registration form fields
  let [registerInfo, setRegisterInfo] = useState({
    name: "",
    username: "",
    password: "",
  });

  // Update state as user types in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    let copyRegisterInfo = { ...registerInfo };
    copyRegisterInfo[name] = value;
    setRegisterInfo(copyRegisterInfo);
  };

  // Handle form submission for registration
  const handle_register = async (e) => {
    e.preventDefault(); // Prevent default form submit
    const { name, username, password } = registerInfo;
    if (!name || !username || !password) {
      return handleError("Please provide all the Details"); // Show error if fields are empty
    }
    try {
      const url = "https://zoom-clone-backend-q57o.onrender.com/register";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include", // Send cookies for authentication
        body: JSON.stringify(registerInfo), // Send registration data
      });
      const result = await response.json();
      const { message, success } = result;
      if (success) {
        handleSuccess(message); // Show success toast
        navigate("/"); // Redirect to home page
      } else {
        return handleError(message); // Show error from backend
      }
    } catch (error) {
      return handleError(error); // Show network/server error
    }
  };

  return (
    <>
      <div className="flex-1 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-10 w-auto"
            src="https://www.svgrepo.com/show/301692/login.svg"
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm leading-5 text-gray-500 max-w">
            Or{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              Login to your account
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form method="POST" onSubmit={handle_register}>
              {/* Name input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-5  text-gray-700"
                >
                  Name
                </label>
                <input
                  onChange={handleChange}
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  type="text"
                  value={registerInfo.name}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>

              {/* Username input */}
              <div className="mt-6">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-5 text-gray-700"
                >
                  Username
                </label>
                <input
                  onChange={handleChange}
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  type="text"
                  value={registerInfo.username}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>

              {/* Password input */}
              <div className="mt-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-5 text-gray-700"
                >
                  Password
                </label>
                <input
                  onChange={handleChange}
                  id="password"
                  name="password"
                  type="password"
                  value={registerInfo.password}
                  placeholder="Create a password"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>

              {/* Submit button */}
              <div className="mt-6">
                <span className="block w-full rounded-md shadow-sm">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:cursor-pointer hover:bg-blue-600 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                  >
                    Create account
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
