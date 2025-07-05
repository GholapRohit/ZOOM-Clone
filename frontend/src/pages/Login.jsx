import { useState } from "react";
import { handleError, handleSuccess } from "../utils/Message"; // Toast helpers for showing messages
import { useNavigate } from "react-router-dom"; // For navigation after login
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Auth context for user state

const Login = () => {
  // Get the current user and function to set user from context
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);
  const navigate = useNavigate(); // For programmatic navigation

  // State for login form fields
  const [loginInfo, setLoginInfo] = useState({
    username: "",
    password: "",
  });

  // Update state as user types in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    let copyLoginInfo = { ...loginInfo };
    copyLoginInfo[name] = value;
    setLoginInfo(copyLoginInfo);
  };

  // Handle form submission for login
  const handle_login = async (e) => {
    e.preventDefault(); // Prevent default form submit
    const { username, password } = loginInfo;
    if (!username || !password) {
      return handleError("Please provide all the Details"); // Show error if fields are empty
    }
    try {
      const url = "https://zoom-clone-backend-q57o.onrender.com/login";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include", // Send cookies for authentication
        body: JSON.stringify(loginInfo), // Send username and password
      });
      const result = await response.json();
      const { message, success } = result;
      if (success) {
        setLoggedInUser(username); // Update context with logged-in user
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
      <div className="h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-10 w-auto"
            src="https://www.svgrepo.com/show/301692/login.svg"
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
            Login to your account
          </h2>
          <p className="mt-2 text-center text-sm leading-5 text- max-w">
            Or{" "}
            <a
              href="/register"
              className="font-medium text-blue-500 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              Create a new acccount
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form method="POST" action="#" onSubmit={handle_login}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-5  text-gray-700"
                >
                  Username
                </label>
                <input
                  onChange={handleChange}
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  type="text"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>

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
                  placeholder="Enter password"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                />
              </div>

              <div className="mt-6">
                <span className="block w-full rounded-md shadow-sm">
                  <button
                    type="submit"
                    className="w-full hover:cursor-pointer flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                  >
                    Login
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

export default Login;
