//  Web framework for building APIs and web servers.
import express from "express";
// Node.js HTTP server creator, needed for integrating with Socket.IO.
import { createServer } from "node:http";
// ODM (Object Document Mapping) for MongoDB, used for database operations.
import mongoose from "mongoose";
// Middleware to enable Cross-Origin Resource Sharing.
import cors from "cors";
// Custom function to initialize Socket.IO (from your socketManager.js).
import { connectToSocket } from "./controllers/socketManager.js";
// It contains all user-related endpoints, such as registration, login, etc.
import userRoutes from "./routes/users.routes.js";

import dotenv from "dotenv";

import cookieParser from "cookie-parser";

// Creates an Express application.
const app = express();
// Wraps the Express app in an HTTP server (required for Socket.IO).
const server = createServer(app);
// Initializes Socket.IO and attaches it to the HTTP server.
const io = connectToSocket(server);

dotenv.config();

// Enables CORS for all routes.
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// Parses incoming JSON payloads with a size limit of 40kb.
app.use(express.json());
// Parses incoming requests with URL-encoded payloads, with a size limit of 40kb.
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// All routes defined inside userRoutes will be accessible under this path. (eg. /users/login)
app.use("/users", userRoutes);

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL;

app.get("/", (req, res) => {
  res.send("Welcome");
});

const start = (async () => {
  await mongoose.connect(MONGO_URL);
  console.log("MongoDB connected");
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}. [ http://localhost:${PORT} ]`);
  });
})();
