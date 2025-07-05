import heroImg from "/assets/zoom_hero_img.png"; // Import the hero image for the landing page
import { handleError } from "../utils/Message"; // Import error handler for showing error messages
import { useNavigate } from "react-router-dom"; // Import navigation hook from React Router

const Landing = () => {
  const navigate = useNavigate(); // Get the navigate function for programmatic navigation

  // Function to check if the user is logged in before allowing to join/host a meeting
  const check_login = async () => {
    try {
      const url = "https://zoom-clone-backend-q57o.onrender.com/check-auth";
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-type": "application/json" },
        credentials: "include", // Include cookies for authentication
      });
      const result = await response.json();
      const { success } = result;
      if (success) {
        // If authenticated, navigate to the meeting page
        navigate(`/meet`);
      } else {
        // If not authenticated, show error and redirect to login
        handleError("You need to log in to continue");
        navigate("/login");
      }
    } catch (error) {
      // Handle any network or server errors
      return handleError(error);
    }
  };

  return (
    <div className="sm:h-screen flex flex-col w-screen bg-[url(/public/assets/background.png)] bg-center bg-cover">
      {/* Hero Section */}
      <div className="flex max-sm:gap-8 m-5 max-sm:flex-col-reverse">
        {/* Left side: Text and button */}
        <div className="flex flex-col flex-wrap justify-center sm:w-1/2 sm:pl-20 gap-4">
          <p className="text-4xl max-md:text-2xl text-white font-semibold">
            Bridge the gap between you and the people who matter most -{" "}
            <span className="text-sky-300">anytime</span>,{" "}
            <span className="text-sky-300">anywhere</span>.
          </p>
          <p className="text-2xl text-white  font-mono">
            See, Hear, Feel, Together on{" "}
            <span className="text-blue-400 font-semibold">ZOOM</span>
          </p>
          {/* "Get Started" button triggers login check */}
          <button
            onClick={check_login}
            className="w-36 hover:cursor-pointer transition-colors duration-300 bg-blue-950/30 hover:bg-gray-500/60 border rounded-2xl py-2 border-white text-white"
          >
            Get Started
          </button>
        </div>
        {/* Right side: Hero image */}
        <div className="sm:w-1/2 flex justify-center items-center">
          <img src={heroImg} alt="image" width={410} className="bg-white/10 " />
        </div>
      </div>
    </div>
  );
};

export default Landing;
