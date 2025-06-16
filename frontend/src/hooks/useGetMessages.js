import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import {toast} from "react-hot-toast"; // ✅ don't forget this

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const selectedConversation = useConversation((state) => state.selectedConversation);
  const setMessages = useConversation((state) => state.setMessages);
  const messages = useConversation((state) => state.messages); // ✅ this was missing

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
  }, [selectedConversation?._id, setMessages]);

  return { messages, loading };
};

export default useGetMessages;
