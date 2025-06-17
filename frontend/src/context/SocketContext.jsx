import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { authUser } = useAuthContext();

	useEffect(() => {
		if (authUser) {
			const socketInstance = io("https://chatapp-wl3v.onrender.com", {
				transports: ["websocket"],
				withCredentials: true,
				secure: true, // ✅ Required for HTTPS cross-origin socket connection
				auth: {
					userId: authUser?._id,
				},
			});

			// Optional: Catch connection issues
			socketInstance.on("connect_error", (err) => {
				console.error("❌ Socket connection error:", err.message);
			});

			setSocket(socketInstance);

			// Listen for the online users list
			socketInstance.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			// Clean up on unmount or logout
			return () => {
				socketInstance.disconnect();
			};
		} else {
			// Disconnect socket if user logs out
			if (socket) {
				socket.disconnect();
				setSocket(null);
			}
		}
	}, [authUser]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};

SocketContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
