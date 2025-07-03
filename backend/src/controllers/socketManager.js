// Import the Socket.IO Server class
import { Server } from "socket.io";

// Initialize global objects to manage connections, messages, and online time
let connections = {}; // { roomPath: [socketId, ...] }
let messages = {}; // { roomPath: [ { sender, data, socket-id-sender }, ... ] }
let timeOnline = {}; // { socketId: Date }

export const connectToSocket = (server) => {
  // Create a new Socket.IO server attached to the provided HTTP server
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins (for development)
      methods: ["GET", "POST"], // Allow GET and POST methods
      allowedHeaders: ["*"], // Allow all headers
      credentials: true, // Allow credentials
    },
  });

  // Listen for new client connections
  io.on("connection", (socket) => {
    // When a user joins a call/room
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id); // Add user to the room
      timeOnline[socket.id] = new Date(); // Track when user joined

      // Notify all users in the room about the new user
      for (let i = 0; i < connections[path].length; i++) {
        io.to(connections[path][i]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      // If there are previous messages in the room, send them to the new user
      if (messages[path] !== undefined) {
        for (let i = 0; i < messages[path].length; i++) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][i]["data"],
            messages[path][i]["sender"],
            messages[path][i]["socket-id-sender"]
          );
        }
      }
    });

    // Handle WebRTC signaling messages
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // Handle chat messages sent in a room
    socket.on("chat-message", (data, sender) => {
      // Find the room this socket belongs to
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );
      // If the room was found, add the message to the messages object
      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });
        console.log("{username:", sender, ", message:", data, "}");
        // Broadcast the message to all users in the room
        connections[matchingRoom].forEach((element) => {
          io.to(element).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    // Handle user disconnecting from the server
    socket.on("disconnect", () => {
      let diffTime = Math.abs(timeOnline[socket.id] - new Date());
      let key;
      // Find the room the user was in
      for (const [k, v] of Object.entries(connections)) {
        for (let i = 0; i < v.length; i++) {
          if (v[i] === socket.id) {
            key = k;
            // Notify all users in the room that this user left
            for (let j = 0; j < v.length; j++) {
              io.to(v[j]).emit("user-left", socket.id, diffTime);
            }
            // Remove the user from the room
            let index = connections[key].indexOf(socket.id);
            if (index > -1) {
              connections[key].splice(index, 1);
            }
            // If the room is empty, clean up
            if (connections[key].length === 0) {
              delete connections[key];
              delete messages[key];
            }
          }
        }
      }
    });
  });

  // Return the Socket.IO server instance for use elsewhere in the app
  return io;
};
