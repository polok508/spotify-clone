import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { cn } from "@/lib/utils.ts";
import { useMusicStore } from "@/stores/useMusicStore.ts";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const LeftSidebar = () => {
  const { albums, fetchAlbums, isLoading } = useMusicStore();

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  // Безопасно получить список альбомов, фильтруя некорректные записи
  const albumList = Array.isArray(albums)
    ? albums.filter(
        (album) =>
          album &&
          typeof album._id === "string" &&
          typeof album.title === "string" &&
          typeof album.artist === "string" &&
          typeof album.imageUrl === "string"
      )
    : [];

  return (
    <div className="h-full flex flex-col gap-2">
      {/* навигация */}
      <div className="rounded-lg bg-zinc-900 p-4">
        <div className="space-y-2">
          <Link
            to="/"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "w-full justify-start text-white hover:bg-zinc-800",
              })
            )}
          >
            <HomeIcon className="mr-2 size-5" />
            <span className="hidden md:inline">Home</span>
          </Link>

          <SignedIn>
            <Link
              to="/chat"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className: "w-full justify-start text-white hover:bg-zinc-800",
                })
              )}
            >
              <MessageCircle className="mr-2 size-5" />
              <span className="hidden md:inline">Messages</span>
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* библиотека */}
      <div className="flex-1 rounded-lg bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-white px-2">
            <Library className="size-5 mr-2" />
            <span className="hidden md:inline">Playlist</span>
          </div>
        </div>

        <ScrollArea className="h-[335px]">
          <div className="space-y-2">
            {isLoading ? (
              <PlaylistSkeleton />
            ) : albumList.length > 0 ? (
              albumList.map((album) => (
                <Link
                  to={`/albums/${album._id}`}
                  key={album._id}
                  className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer"
                >
                  <img
                    src={album.imageUrl}
                    alt={album.title ?? "Playlist img"}
                    className="size-12 rounded-md flex-shrink-0 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Подмена картинки, если загрузка не удалась
                      (e.currentTarget as HTMLImageElement).src = "/fallback-image.png";
                    }}
                  />
                  <div className="flex-1 min-w-0 hidden md:block">
                    <p className="font-medium truncate">{album.title}</p>
                    <p className="text-sm text-zinc-400 truncate">Album • {album.artist}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-zinc-500 text-center mt-4">No albums found.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeftSidebar;
