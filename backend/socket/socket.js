// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();
const server = http.createServer(app); // create HTTP server for socket.io to hook into

// CORS middleware for REST APIs
app.use(cors({
	origin: ["http://localhost:5173"], // frontend dev origin
	credentials: true
}));

// Initialize Socket.IO server
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:5173"],
		methods: ["GET", "POST"],
		credentials: true
	}
});

// In-memory store to map userId to socket.id
const userSocketMap = {};

// Utility function to get a user's socket ID
export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

// Listen for new connections
io.on("connection", (socket) => {
	console.log("🟢 A user connected:", socket.id);

	const userId = socket.handshake.auth?.userId;

	// Save socket.id against userId if it exists
	if (userId) {
		userSocketMap[userId] = socket.id;
		console.log(`🔐 User authenticated: ${userId} => ${socket.id}`);
	}

	// Send the list of online users to all connected clients
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// Handle disconnection
	socket.on("disconnect", () => {
		console.log("🔴 User disconnected:", socket.id);

		// Remove the disconnected user's mapping
		if (userId) {
			delete userSocketMap[userId];
		}

		// Broadcast updated user list
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});
});

export { app, io, server };
