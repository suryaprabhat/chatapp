import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { app, server } from "./socket/socket.js"; // Assuming socket.js exports both
import authRoutes from "../backend/routes/auth.routes.js";
import MessageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

// --- 🔐 Smart CORS Setup ---
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://chatapp-eight-pied.vercel.app"
      ];
      if (
        !origin || // allow mobile apps, Postman, SSR, etc.
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`❌ Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

// --- 🔧 Middlewares ---
app.use(express.json());
app.use(cookieParser());

// --- 🌐 Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/users", userRoutes);

// --- 🚀 Start the Server ---
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`✅ Server is running on port ${PORT}`);
});
