// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import cookie from "cookie";
import jwt from "jsonwebtoken";

const allowedOrigins = [
  "http://localhost:5173",
  "https://chatapp-eight-pied.vercel.app",
  "https://chatapp-git-main-suryaprabhats-projects.vercel.app",
  "https://chatapp-b9w2li192-suryaprabhats-projects.vercel.app"
];

const app = express();
const server = http.createServer(app);

// ✅ CORS for REST APIs
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
    credentials: true,
  },
});

// 🔌 Socket Logic
const userSocketMap = {}; // userId: socketId

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  let userId;

  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.jwt;

    if (!token) {
      console.warn("❌ No JWT found in cookies");
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;

    userSocketMap[userId] = socket.id;
    console.log(`🔐 User authenticated: ${userId} => ${socket.id}`);
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return;
  }

  // 🔁 Send updated list of online users to all
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // 💬 Handle incoming message and relay to receiver
  socket.on("newMessage", ({ receiverId, message, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        message,
        senderId,
      });
    }
  });

  // ❌ Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
