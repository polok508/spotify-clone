import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton.tsx";
import { useMusicStore } from "@/stores/useMusicStore.ts";
import PlayButton from "./PlayButton.tsx";

const FeaturedSection = () => {
    const { isLoading, featuredSongs, error } = useMusicStore();

    if (isLoading) return <FeaturedGridSkeleton />;
    if (error) return <p className="text-red-500 mb-4 text-lg">{error}</p>;

    if (!Array.isArray(featuredSongs) || featuredSongs.length === 0) {
        return <p className="text-zinc-400 mb-4 text-sm">No featured songs available.</p>;
    }

    const validSongs = featuredSongs.filter(
        (song) =>
            song &&
            typeof song._id === "string" &&
            typeof song.title === "string" &&
            typeof song.artist === "string" &&
            typeof song.imageUrl === "string"
    );

    if (validSongs.length === 0) {
        return <p className="text-zinc-400 mb-4 text-sm">No valid featured songs to display.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {validSongs.map((song) => (
                <div
                    key={song._id}
                    className="flex items-center bg-zinc-800/50 rounded-md overflow-hidden hover:bg-zinc-700/50 transition-colors group cursor-pointer relative"
                >
                    <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-16 sm:w-20 h-16 sm:h-20 object-cover flex-shrink-0"
                    />
                    <div className="flex-1 p-4">
                        <p className="font-medium truncate">{song.title}</p>
                        <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                    </div>
                    <PlayButton song={song} />
                </div>
            ))}
        </div>
    );
};

export default FeaturedSection;
