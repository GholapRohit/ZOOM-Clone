import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Resources
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a className="hover:underline">Documentation</a>
                </li>
                <li>
                  <a className="hover:underline">Tutorials</a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Legal
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a className="hover:underline">Privacy Policy</a>
                </li>
                <li>
                  <a className="hover:underline">Terms &amp; Conditions</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Contact Us
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <p>
                    Bharti Vidyabhavan, Wakewadi, Pune, Maharashtra - 411015
                  </p>
                </li>
                <li>
                  <p>rohitgholap2005@gmail.com</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © Copyright 2025. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
              <FaFacebook size={20} />
              <span className="sr-only">Facebook page</span>
            </a>
            <a
              href="https://www.instagram.com/explorewithgholap"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
            >
              <FaInstagram size={20} />
              <span className="sr-only">Instagram page</span>
            </a>
            <a
              href="https://www.youtube.com/@ExploreWithGholap"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
            >
              <FaYoutube size={20} />
              <span className="sr-only">YouTube account</span>
            </a>
            <a
              href="https://www.linkedin.com/in/gholap-rohit"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
            >
              <FaLinkedin size={20} />
              <span className="sr-only">LinkedIn page</span>
            </a>
            <a
              href="https://github.com/GholapRohit"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5"
            >
              <FaGithub size={20} />
              <span className="sr-only">GitHub account</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
