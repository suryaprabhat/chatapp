import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const useSignup = () => {
  const [loading, setloading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const signup = async ({ fullname, username, password, confirmPassword, gender }) => {
    const success = handleInputErrors({ fullname, username, password, confirmPassword, gender });
    if (!success) return;

    setloading(true);
    try {
      const res = await fetch(
        "https://chatapp-wl3v.onrender.com/api/auth/signup",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullname,
            username,
            password,
            confirmPassword,
            gender,
          }),
        }
      );

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.setItem("chat-user", JSON.stringify(data));
      setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setloading(false);
    }
  };

  return { loading, signup }; // ✅ moved inside the function
};

export default useSignup;

// ✅ Helper function is fine here
function handleInputErrors({ fullname, username, password, confirmPassword, gender }) {
  if (!fullname || !username || !password || !confirmPassword || !gender) {
    toast.error("All fields are required");
    return false;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters long");
    return false;
  }

  return true;
}
