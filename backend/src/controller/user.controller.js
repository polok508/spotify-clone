import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { clerkClient } from "@clerk/express";

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;


    let currentUser = await User.findOne({ clerkId: currentUserId });

    if (!currentUser) {
   
      const clerkUser = await clerkClient.users.getUser(currentUserId);

      currentUser = new User({
        clerkId: clerkUser.id,
        fullName: clerkUser.fullName || "No Name",
        imageUrl: clerkUser.profileImageUrl || "",
      });

      await currentUser.save();
    }


    const users = await User.find({ clerkId: { $ne: currentUserId } });

    res.status(200).json(users);
} catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const myId = req.auth.userId;
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: myId },
        { senderId: myId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};