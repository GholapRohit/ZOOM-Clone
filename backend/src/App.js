// Import Express, a web framework for building APIs and web servers.
import express from "express";
// Import createServer from Node's HTTP module, needed for integrating with Socket.IO.
import { createServer } from "node:http";
// Import Mongoose, an ODM (Object Document Mapper) for MongoDB.
import mongoose from "mongoose";
// Import CORS middleware to enable Cross-Origin Resource Sharing.
import cors from "cors";
// Import custom function to initialize Socket.IO from your socketManager.js.
import { connectToSocket } from "./controllers/socketManager.js";
// Import user-related routes (registration, login, etc.).
import userRoutes from "./routes/users.routes.js";

// Import dotenv to load environment variables from .env file.
import dotenv from "dotenv";

// Middleware to parse cookies from HTTP requests.
import cookieParser from "cookie-parser";

// Create an Express application instance.
const app = express();
// Wrap the Express app in an HTTP server (required for Socket.IO).
const server = createServer(app);
// Initialize Socket.IO and attach it to the HTTP server.
const io = connectToSocket(server);

// Load environment variables from .env file.
dotenv.config();

// Enable CORS for all routes, allowing requests from your frontend domain and sending credentials (cookies).
app.use(
  cors({
    origin: "https://zoom-clone-frontend-ck17.onrender.com",
    credentials: true,
  })
);
// Parse incoming JSON payloads.
app.use(express.json());
// Parse incoming URL-encoded payloads.
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser()); // Parse cookies from incoming requests.

// Mount all user-related routes at the root path (e.g., /login, /register, etc.).
app.use("/", userRoutes);

// Set the port and MongoDB connection URL from environment variables (with defaults).
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL;

// Start the server and connect to MongoDB.
const start = (async () => {
  await mongoose.connect(MONGO_URL); // Connect to MongoDB.
  console.log("MongoDB connected");
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
})();
