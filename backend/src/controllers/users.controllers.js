// Import the User model (Mongoose schema)
import { User } from "../models/user.model.js";

import { Meeting } from "../models/meeting.model.js";
// Import HTTP status codes for readable responses
import httpStatus from "http-status";
// Import bcrypt for password hashing and comparison
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const login = async (req, res) => {
  // Destructure username and password from request body
  let { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all the Details", success: false });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    // If user not found, return 404
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User Not Found", success: false });
    }
    console.log("Provided password:", password);
    console.log("User password from DB:", user.password);
    // Compare provided password with hashed password in DB
    if (await bcrypt.compare(password, user.password)) {
      // If password matches, generate a random token
      let jwtToken = jwt.sign(
        { username: user.username, _id: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "3d" }
      );

      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: true, // set false if testing on localhost without HTTPS
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000 * 3, // 3 days
      });

      user.token = jwtToken;
      await user.save();
      // Respond with the token
      return res
        .status(httpStatus.OK)
        .json({ message: "Login Successful", success: true });
    } else {
      // If password does not match, return 401
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid Password", success: false });
    }
  } catch (e) {
    console.log("Error during login:", e);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: e, success: false });
  }
};

const register = async (req, res) => {
  // Destructure registration fields from request body
  let { name, username, password } = req.body;

  try {
    // Check if a user with the same username already exists
    const existingUser = await User.findOne({ username });
    // If user exists, return 302
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "This username is already in use", success: false });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document
    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });

    await newUser.save();

    // Respond with success message
    return res
      .status(httpStatus.CREATED)
      .json({ message: "New User Registered", success: true });
  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: e, success: false });
  }
};

const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // set false if testing on localhost without HTTPS
      sameSite: "none",
    });

    // Respond with success message
    return res
      .status(httpStatus.OK)
      .json({ message: "Logout Successful", success: true });
  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: e, success: false });
  }
};

const getUserHistory = async (req, res) => {
  const token = req.cookies.token;
  try {
    const user = await User.findOne({ token: token });
    const meetings = await Meeting.find({ user_id: user.username });
    res.json(meetings);
  } catch (e) {
    res.json({ message: `ERROR: ${e}` });
  }
};

const addToHistory = async (req, res) => {
  const token = req.cookies.token;
  const { meeting_code } = req.body;

  try {
    const user = await User.findOne({ token: token });

    const newMeeting = new Meeting({
      user_id: user.username,
      meeting_code: meeting_code,
    });
    console.log("newMeeting:", newMeeting);

    await newMeeting.save();

    res.status(httpStatus.CREATED).json({ message: "Added code to history" });
  } catch (e) {
    res.json({ message: `Something went wrong ${e}` });
  }
};

export { login, register, logout, getUserHistory, addToHistory };
