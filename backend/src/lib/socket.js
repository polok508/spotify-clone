import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
    });

    const userSockets = new Map();       // userId -> socketId
    const userActivities = new Map();    // userId -> activity string

    io.on("connection", (socket) => {
        console.log("✅ New socket connection:", socket.id);

        socket.on("user_connected", (userId) => {
            userSockets.set(userId, socket.id);
            userActivities.set(userId, "Idle");

            // Получаем актуальный список онлайн пользователей
            const onlineUsers = Array.from(userSockets.keys());

            console.log("🟢 Emitting users_online:", onlineUsers);

            // Всем отправляем обновлённый список онлайн
            io.emit("users_online", onlineUsers);

            // Всем отправляем активности пользователей
            io.emit("activities", Array.from(userActivities.entries()));

            console.log(`User connected: ${userId}, total online: ${userSockets.size}`);
        });

        socket.on("update_activity", ({ userId, activity }) => {
            console.log("🟢 Activity updated:", userId, activity);
            userActivities.set(userId, activity);
            io.emit("activity_updated", { userId, activity });
        });

        socket.on("send_message", async (data) => {
            try {
                const { senderId, receiverId, content } = data;

                const message = await Message.create({
                    senderId,
                    receiverId,
                    content,
                });

                const receiverSocketId = userSockets.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", message);
                }

                socket.emit("message_sent", message);

            } catch (error) {
                console.error("❌ Message error:", error);
                socket.emit("message_error", error.message);
            }
        });

        socket.on("disconnect", () => {
            let disconnectedUserId = null;

            // Находим пользователя по socket.id и удаляем из maps
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    userSockets.delete(userId);
                    userActivities.delete(userId);
                    break;
                }
            }

            if (disconnectedUserId) {
                // Обновляем список онлайн пользователей
                const onlineUsers = Array.from(userSockets.keys());
                console.log("🟢 Emitting users_online after disconnect:", onlineUsers);

                // Всем отправляем обновлённый список онлайн
                io.emit("users_online", onlineUsers);

                // Сообщаем об отключении конкретного пользователя
                io.emit("user_disconnected", disconnectedUserId);

                console.log("🔌 User disconnected:", disconnectedUserId, `total online: ${userSockets.size}`);
            }
        });
    });
};