// Import the Router function from Express
import { Router } from "express";

// Import user controllers for handling requests
import {
  login, // Handles user login
  register, // Handles user registration
  logout, // Handles user logout
  getUserHistory, // Fetches user's meeting/activity history
  addToHistory, // Adds a meeting/activity to user's history
} from "../controllers/users.controllers.js";

// Import validation middlewares for signup and login
import {
  signUpValidations, // Validates registration data
  loginValidations, // Validates login data
} from "../middlewares/authValidation.js";

// Import authentication middleware to protect routes
import { authenticateToken } from "../middlewares/isAuth.js";

// Create a new router instance
const router = Router();

// Define POST /login route with validation and controller
router.route("/login").post(loginValidations, login);

// Define POST /register route with validation and controller
router.route("/register").post(signUpValidations, register);

// Define POST /logout route (no validation needed)
router.route("/logout").post(logout);

// Define GET /check-auth route, protected by JWT authentication
// If authenticated, responds with user info and success
router.route("/check-auth").get(authenticateToken, (req, res) => {
  return res.status(200).json({ user: req.user, success: true });
});

// Define POST /add_to_activity route to add a meeting/activity to user's history
router.route("/add_to_activity").post(addToHistory);

// Define GET /get_all_activity route to fetch all user's meeting/activity history
router.route("/get_all_activity").get(getUserHistory);

// Export the router to be used in the main app
export default router;
