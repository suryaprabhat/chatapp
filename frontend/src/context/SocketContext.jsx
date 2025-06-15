import { createContext, useState, useEffect, useContext } from "react";
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
			// Setup the socket connection
			const socket = io("https://chatapp-wl3v.onrender.com", {
				transports: ["websocket"], 
				withCredentials: true, // 👈 very important
				auth: {
					userId: authUser._id, // 👈 pass as auth, not query
				},
			});

			setSocket(socket);

			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			return () => {
				socket.disconnect();
			};
		} else {
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
