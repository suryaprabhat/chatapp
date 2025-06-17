import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";

import connectToMongoDB from "./db/connectToMongoDB.js";
import authRoutes from "./routes/auth.routes.js";
import MessageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // Create raw server for socket.io if needed

const PORT = process.env.PORT || 5000;

// --- ✅ CORS Middleware ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://chatapp-eight-pied.vercel.app",
  "https://chatapp-git-main-suryaprabhats-projects.vercel.app",
  "https://chatapp-b9w2li192-suryaprabhats-projects.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// --- ✅ Other Middlewares ---
app.use(express.json());
app.use(cookieParser());

// --- ✅ Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/users", userRoutes);

// --- ✅ DB & Server ---
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`✅ Server is running on port ${PORT}`);
});
