import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io } from "../socket/socket.js";
import { getReceiverSocketId } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try{
        const {message} = req.body
        const {id: receiverId  }= req.params;
        const senderId = req.user.id;

       let conversation = await Conversation.findOne({
            participants: {$all: [senderId, receiverId]}
        })

        if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId, receiverId],            
            })
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        })

        if(newMessage){
            conversation.messages.push(newMessage._id);
        }

        // await conversation.save();
        // await newMessage.save();
        
        // this  will run in parallel
        await Promise.all([conversation.save(), newMessage.save()]);

        //SOCKET IO FUNCTIONALITY WILL GO HERE
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId !== undefined){
            io.to(receiverSocketId).emit("newMessage", newMessage);
            }



        res.status(201).json(newMessage);
    }
    catch(error){
        console.log("Error in sendMessage Controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }


};

export const getMessages =async (req, res) =>{
    try{
      const { id: userToChatId } = req.params;
      const senderId = req.user.id;
      const conversation = await Conversation.findOne({
        participants: {$all: [senderId, userToChatId]}
      }).populate("messages");

      if(!conversation){return res.status(200).json([]);}

      const messages = conversation.messages;

      res.status(200).json(conversation.messages);

    }catch(error){
        console.log("Error in sendMessage Controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }

    



}