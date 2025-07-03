import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";

import "react-toastify/ReactToastify.css";
import VideoMeet from "./pages/VideoMeet";
import MeetingCode from "./pages/MeetingCode";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const hideNavAndFooter = location.pathname.startsWith("/meet/");
  return (
    <>
      <div className="sm:h-screen flex flex-col w-screen bg-[url(/public/assets/background.png)] bg-center bg-cover">
        {!hideNavAndFooter && <Navbar />}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/account" element={<Account />} />
          <Route path="/meet" element={<MeetingCode />} />
          <Route path="/meet/:url" element={<VideoMeet />} />
        </Routes>
        <ToastContainer />
        {!hideNavAndFooter && <Footer />}
      </div>
    </>
  );
}

export default App;
