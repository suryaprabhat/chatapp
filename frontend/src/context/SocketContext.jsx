import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [incomingMessage, setIncomingMessage] = useState(null);
	const { authUser } = useAuthContext();

	useEffect(() => {
		if (!authUser) {
			// 🚪 Disconnect if logged out
			if (socket) {
				socket.disconnect();
				setSocket(null);
			}
			return;
		}

		// ✅ Connect to socket
		const socketInstance = io("https://chatapp-wl3v.onrender.com", {
			transports: ["websocket"],
			withCredentials: true,
			secure: true,
		});

		socketInstance.on("connect", () => {
			console.log("✅ Connected to socket server:", socketInstance.id);
		});

		socketInstance.on("connect_error", (err) => {
			console.error("❌ Socket connection error:", err.message);
		});

		socketInstance.on("getOnlineUsers", (users) => {
			setOnlineUsers(users);
		});

		socketInstance.on("newMessage", (message) => {
			console.log("📩 New incoming message:", message);
			setIncomingMessage(message);
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
			setSocket(null);
		};
	}, [authUser]);

	// Optional: Emit message
	const sendMessage = (receiverId, message, senderId) => {
		if (socket) {
			socket.emit("newMessage", { receiverId, message, senderId });
		}
	};

	return (
		<SocketContext.Provider
			value={{
				socket,
				onlineUsers,
				incomingMessage,
				sendMessage,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
};

SocketContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
