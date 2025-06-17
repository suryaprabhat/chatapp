// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "https://chatapp-eight-pied.vercel.app",
  "https://chatapp-git-main-suryaprabhats-projects.vercel.app",
  "https://chatapp-b9w2li192-suryaprabhats-projects.vercel.app"
];

const app = express();
const server = http.createServer(app);

// ✅ CORS for REST endpoints
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 🔌 Socket logic
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  const userId = socket.handshake.auth?.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`🔐 User authenticated: ${userId} => ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
