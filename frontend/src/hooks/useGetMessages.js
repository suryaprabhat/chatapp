import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useConversation from "../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const selectedConversation = useConversation((state) => state.selectedConversation);
  const setMessages = useConversation((state) => state.setMessages);
  const messages = useConversation((state) => state.messages);
  const { incomingMessage } = useSocketContext(); // ✅ Get real-time message

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://chatapp-wl3v.onrender.com/api/messages/${selectedConversation._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setMessages(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id]);

  // ✅ Push new incoming messages into messages state
  useEffect(() => {
    if (
      incomingMessage &&
      incomingMessage.senderId === selectedConversation._id
    ) {
      setMessages([...messages, incomingMessage]);
    }
  }, [incomingMessage, messages, selectedConversation?._id, setMessages]);

  return { messages, loading };
};

export default useGetMessages;
