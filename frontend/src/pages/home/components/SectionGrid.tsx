import SectionGridSkeleton from "@/components/skeletons/SectionGridSkeleton.tsx";
import { Button } from "@/components/ui/button";
import type { Song } from "@/types";
import PlayButton from "./PlayButton.tsx";

type SectionGridProps = {
    title: string;
    songs: Song[];
    isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
    if (isLoading) return <SectionGridSkeleton />;

    if (!Array.isArray(songs) || songs.length === 0) {
        return (
            <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
                <p className="text-sm text-zinc-400">No songs available.</p>
            </div>
        );
    }

    const validSongs = songs.filter(
        (song) =>
            song &&
            typeof song._id === "string" &&
            typeof song.title === "string" &&
            typeof song.artist === "string" &&
            typeof song.imageUrl === "string"
    );

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                <Button variant="link" className="text-sm text-zinc-400 hover:text-white">
                    Show all
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {validSongs.map((song) => (
                    <div
                        key={song._id}
                        className="bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer"
                    >
                        <div className="relative mb-4">
                            <div className="aspect-square rounded-md shadow-lg overflow-hidden">
                                <img
                                    src={song.imageUrl}
                                    alt={song.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <PlayButton song={song} />
                        </div>
                        <h3 className="font-medium mb-2 truncate">{song.title}</h3>
                        <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SectionGrid;