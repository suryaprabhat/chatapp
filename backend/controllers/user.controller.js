import User from "../models/user.model.js";

export const getUsersforSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;

        const filteredUsers = await User.find({_id: { $ne: loggedInUserId },}).select("-password");

        res.status(200).json(filteredUsers);


             
    } catch (error) {
        console.log("Error in get users for sidebar: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
        
    }


}