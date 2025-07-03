// Import the Router function from Express
import { Router } from "express";
// Import login and register controllers
import {
  login,
  register,
  logout,
  getUserHistory,
  addToHistory,
} from "../controllers/users.controllers.js";

import {
  signUpValidations,
  loginValidations,
} from "../middlewares/authValidation.js";
import { authenticateToken } from "../middlewares/isAuth.js";

// Create a new router instance
const router = Router();

// Define POST /login route with validations, handled by the login controller
router.route("/login").post(loginValidations, login);
// Define POST /register route with validations, handled by the register controller
router.route("/register").post(signUpValidations, register);

router.route("/logout").post(logout);

router.route("/check-auth").get(authenticateToken, (req, res) => {
  return res.status(200).json({ user: req.user, success: true });
});

router.route("/add_to_activity").post(addToHistory);

router.route("/get_all_activity").get(getUserHistory);

export default router;
