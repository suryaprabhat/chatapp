import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: "15d"
    });

  res.cookie("jwt", token, {
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  httpOnly: true,
  sameSite: "None",           // ✅ Allows cross-site requests (Vercel → Render)
  secure: true                // ✅ Required when sameSite is "None" (HTTPS only)
});

};

export default generateTokenAndSetCookie;