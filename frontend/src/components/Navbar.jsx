import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import ZOOMlogo from "../../public/assets/Zoom_Logo.png";
import user from "../../public/assets/user.png";
import { handleError, handleSuccess } from "../utils/Message";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const handle_logout = async () => {
    try {
      const url = "http://localhost:8080/users/logout";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      const { message, success } = result;
      if (success) {
        setLoggedInUser("");
        handleSuccess(message);
        navigate("/");
      } else {
        return handleError(message);
      }
    } catch (error) {
      return handleError(error);
    }
  };

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
        navigate("/account");
      } else {
        handleError("Please log in to access your profile");
        navigate("/login");
      }
    } catch (error) {
      return handleError(error);
    }
  };

  useEffect(() => {
    (async function setInitialUser() {
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
          let { user } = result;
          setLoggedInUser(user.username);
        } else {
          setLoggedInUser("");
        }
      } catch (error) {
        handleError(error);
      }
    })();
  }, []);

  return (
    <Disclosure
      as="nav"
      className="bg-black/40 backdrop-blur-md sticky top-0 z-1"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 ">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button*/}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block size-6 group-data-open:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden size-6 group-data-open:block"
              />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <a href="/">
                <img alt="brand" src={ZOOMlogo} className="h-5 w-auto" />
              </a>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {!loggedInUser ? (
                  <a
                    key="Join as Guest"
                    href="/meet"
                    aria-current={false ? "page" : undefined}
                    className={classNames(
                      false
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )}
                  >
                    Join as Guest
                  </a>
                ) : (
                  <></>
                )}
                <a
                  key="About"
                  href="#"
                  aria-current={false ? "page" : undefined}
                  className={classNames(
                    false
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "rounded-md px-3 py-2 text-sm font-medium"
                  )}
                >
                  About
                </a>
                <a
                  key="Contact"
                  href="#"
                  aria-current={false ? "page" : undefined}
                  className={classNames(
                    false
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "rounded-md px-3 py-2 text-sm font-medium"
                  )}
                >
                  Contact
                </a>
                {!loggedInUser ? (
                  <>
                    <a
                      key="Register"
                      href="/register"
                      aria-current={false ? "page" : undefined}
                      className={classNames(
                        false
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                    >
                      Register
                    </a>
                    <a
                      key="Login"
                      href="/login"
                      aria-current={false ? "page" : undefined}
                      className={classNames(
                        false
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                    >
                      Login
                    </a>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Profile dropdown */}

            {loggedInUser ? (
              <p className="text-white max-sm:hidden">{loggedInUser}</p>
            ) : (
              <></>
            )}
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className=" cursor-pointer relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img alt="" src={user} className="size-8 rounded-full" />
                </MenuButton>
              </div>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <MenuItem>
                  <p
                    onClick={check_login}
                    className="cursor-pointer block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                  >
                    Your Profile
                  </p>
                </MenuItem>

                <MenuItem>
                  <a
                    onClick={handle_logout}
                    className="hover:cursor-pointer block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                  >
                    Log out
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile navbar */}
      <DisclosurePanel className="sm:hidden ">
        <div className="space-y-1 px-2 pt-2 pb-3 ">
          {!loggedInUser ? (
            <DisclosureButton
              key="Join as Guest"
              as="a"
              href="/meet"
              aria-current={false ? "page" : undefined}
              className={classNames(
                false
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              Join as Guest
            </DisclosureButton>
          ) : (
            <></>
          )}

          <DisclosureButton
            key="About"
            as="a"
            href="#"
            aria-current={false ? "page" : undefined}
            className={classNames(
              false
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white",
              "block rounded-md px-3 py-2 text-base font-medium"
            )}
          >
            About
          </DisclosureButton>
          <DisclosureButton
            key="Contact"
            as="a"
            href="#"
            aria-current={false ? "page" : undefined}
            className={classNames(
              false
                ? "bg-gray-900 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white",
              "block rounded-md px-3 py-2 text-base font-medium"
            )}
          >
            Contact
          </DisclosureButton>
          {!loggedInUser ? (
            <>
              <DisclosureButton
                key="Register"
                as="a"
                href="/register"
                aria-current={false ? "page" : undefined}
                className={classNames(
                  false
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
              >
                Register
              </DisclosureButton>
              <DisclosureButton
                key="Login"
                as="a"
                href="/login"
                aria-current={false ? "page" : undefined}
                className={classNames(
                  false
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
              >
                Login
              </DisclosureButton>
            </>
          ) : (
            <></>
          )}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
