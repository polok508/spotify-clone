import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable.tsx";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar.tsx";
import FriendsActivity from "./components/FriendsActivity.tsx";
import AudioPlayer from "./components/AudioPlayer.tsx";
import { PlaybackControls } from "./components/PlaybackControls.tsx";
import { useEffect, useState } from "react";

const MainLayout = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return <div className="h-screen bg-black text-white flex flex-col">

        <ResizablePanelGroup direction="horizontal" className="flex-1 flex h-full overflow-hidden p-2">

            <AudioPlayer/>

            {/* левая панель */}
            <ResizablePanel defaultSize={20} minSize={isMobile ? 0 : 10} maxSize={30}>
                <LeftSidebar/>
            </ResizablePanel>

            <ResizableHandle className="w-2 bg-black rounded-lg transition-colors"/>

            {/* главный контент */}
            <ResizablePanel defaultSize={isMobile ? 80 : 60}>
                <Outlet/>
            </ResizablePanel>

            {!isMobile && (
                <>
            <ResizableHandle className="w-2 bg-black rounded-lg transition-colors"/>

            {/* правая панель */}
            <ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
                <FriendsActivity/>
            </ResizablePanel>
                </>
            )}

        </ResizablePanelGroup>

        <PlaybackControls/>
    </div>
};

export default MainLayout;