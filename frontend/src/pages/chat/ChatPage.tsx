import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore.ts";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import UsersList from "./components/UsersList.tsx";
import ChatHeader from "./components/ChatHeader.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import MessageInput from "./components/MessageInput.tsx";

const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const ChatPage = () => {
    const { user } = useUser();
    const { messages, selectedUser, fetchUsers, fetchMessages } = useChatStore();

    useEffect(() => {
        if (user) fetchUsers();
    }, [fetchUsers, user]);

    useEffect(() => {
        if (selectedUser) fetchMessages(selectedUser.clerkId);
    }, [selectedUser, fetchMessages]);

    const validMessages = Array.isArray(messages)
        ? messages.filter(
              (m) =>
                  m &&
                  typeof m._id === "string" &&
                  typeof m.content === "string" &&
                  typeof m.senderId === "string" &&
                  typeof m.createdAt === "string"
          )
        : [];

    return (
        <main className="h-full rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden">
            <Topbar />
            <div className="grid lg:grid-cols-[300px_1fr] grid-cols-[80px_1fr] h-[calc(100vh-180px)]">
                <UsersList />
                <div className="flex flex-col h-full">
                    {selectedUser ? (
                        <>
                            <ChatHeader />
                            <ScrollArea className="h-[calc(100vh-340px)]">
                                <div className="p-4 space-y-4">
                                    {validMessages.length === 0 ? (
                                        <p className="text-sm text-zinc-400 text-center">No messages found.</p>
                                    ) : (
                                        validMessages.map((message) => (
                                            <div
                                                key={message._id}
                                                className={`flex items-start gap-3 ${
                                                    message.senderId === user?.id
                                                        ? "flex-row-reverse"
                                                        : ""
                                                }`}
                                            >
                                                <Avatar className="size-8">
                                                    <AvatarImage
                                                        src={
                                                            message.senderId === user?.id
                                                                ? user.imageUrl || ""
                                                                : selectedUser.imageUrl || ""
                                                        }
                                                    />
                                                </Avatar>
                                                <div
                                                    className={`rounded-lg p-3 max-w-[70%] ${
                                                        message.senderId === user?.id
                                                            ? "bg-green-500"
                                                            : "bg-zinc-800"
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <span className="text-xs text-zinc-300 mt-1 block">
                                                        {formatTime(message.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                            <MessageInput />
                        </>
                    ) : (
                        <NoConversationPlaceHolder />
                    )}
                </div>
            </div>
        </main>
    );
};

export default ChatPage;

const NoConversationPlaceHolder = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
        <img src="spotify.png" alt="Spotify" className="size-16 animate-bounce" />
        <div className="text-center">
            <h3 className="text-zinc-300 text-lg font-medium mb-1">
                <p className="text-zinc-500 text-sm">Choose a friend to start chatting</p>
            </h3>
        </div>
    </div>
);
