import heroImg from "/assets/zoom_hero_img.png";
import { handleError } from "../utils/Message";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const check_login = async () => {
    try {
      const url = "http://localhost:8080/users/check-auth";
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      const { success } = result;
      if (success) {
        navigate(`/meet`);
      } else {
        handleError("You need to log in to continue");
        navigate("/login");
      }
    } catch (error) {
      return handleError(error);
    }
  };

  return (
    <div className="sm:h-screen flex flex-col w-screen bg-[url(/public/assets/background.png)] bg-center bg-cover">
      {/* Hero Section */}
      <div className="flex max-sm:gap-8 m-5 max-sm:flex-col-reverse">
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
          <button
            onClick={check_login}
            className="w-36 hover:cursor-pointer transition-colors duration-300 bg-blue-950/30 hover:bg-gray-500/60 border rounded-2xl py-2 border-white text-white"
          >
            Get Started
          </button>
        </div>
        <div className="sm:w-1/2 flex justify-center items-center">
          <img src={heroImg} alt="image" width={410} className="bg-white/10 " />
        </div>
      </div>
    </div>
  );
};

export default Landing;
