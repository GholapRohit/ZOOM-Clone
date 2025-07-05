import { Routes, Route } from "react-router-dom"; // Routing components
import { ToastContainer } from "react-toastify"; // Toast notification container
import Landing from "./pages/Landing"; // Landing page component
import Login from "./pages/Login"; // Login page component
import Signup from "./pages/Signup"; // Signup page component
import Navbar from "./components/Navbar"; // Navbar component
import Account from "./pages/Account"; // Account page component

import "react-toastify/ReactToastify.css"; // Toast styles
import VideoMeet from "./pages/VideoMeet"; // Video meeting page
import MeetingCode from "./pages/MeetingCode"; // Meeting code entry page
import Footer from "./components/Footer"; // Footer component
import { useLocation } from "react-router-dom"; // Hook to get current route

function App() {
  const location = useLocation(); // Get current location object
  // Hide navbar and footer on meeting page (URL starts with /meet/)
  const hideNavAndFooter = location.pathname.startsWith("/meet/");
  return (
    <>
      {/* Main container with background image and flex layout */}
      <div className="sm:h-screen flex flex-col w-screen bg-[url(/public/assets/background.png)] bg-center bg-cover">
        {/* Show Navbar unless on /meet/ route */}
        {!hideNavAndFooter && <Navbar />}
        {/* Define all app routes */}
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* Home/Landing page */}
          <Route path="/login" element={<Login />} />
          {/* Login page */}
          <Route path="/register" element={<Signup />} />
          {/* Signup page */}
          <Route path="/account" element={<Account />} />
          {/* User account page */}
          <Route path="/meet" element={<MeetingCode />} />
          {/* Meeting code entry */}
          <Route path="/meet/:url" element={<VideoMeet />} />
          {/* Video meeting room */}
        </Routes>
        <ToastContainer /> {/* Toast notifications for feedback */}
        {/* Show Footer unless on /meet/ route */}
        {!hideNavAndFooter && <Footer />}
      </div>
    </>
  );
}

export default App; // Export the App component as default
