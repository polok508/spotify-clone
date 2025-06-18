import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

interface NewSong {
    title: string;
    artist: string;
    album: string;
    duration: string;
}

const AddSongDialog = () => {
    const { albums } = useMusicStore();
    const [songDialogOpen, setSongDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { getToken } = useAuth();

    const [newSong, setNewSong] = useState<NewSong>({
        title: "",
        artist: "",
        album: "",
        duration: "0",
    });

    const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
        audio: null,
        image: null,
    });

    const audioInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            if (!newSong.title.trim() || !newSong.artist.trim()) {
                return toast.error("Title and artist are required");
            }

            if (!files.audio || !files.image) {
                return toast.error("Please upload both audio and image files");
            }

            const MAX_FILE_SIZE = 10 * 1024 * 1024;
            if (files.audio.size > MAX_FILE_SIZE || files.image.size > MAX_FILE_SIZE) {
                return toast.error("File size should not exceed 10MB");
            }

            const validAudioTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
            const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

            if (!validAudioTypes.includes(files.audio.type)) {
                return toast.error("Invalid audio format. Please upload MP3 or WAV");
            }

            if (!validImageTypes.includes(files.image.type)) {
                return toast.error("Invalid image format. Please upload JPEG, PNG or WEBP");
            }

            const formData = new FormData();
            formData.append("title", newSong.title);
            formData.append("artist", newSong.artist);
            formData.append("duration", String(Number(newSong.duration)));
            formData.append("albumId", newSong.album === "none" ? "" : newSong.album);
            formData.append("audioFile", files.audio);
            formData.append("coverImage", files.image);

            const token = await getToken();

            await axiosInstance.post("/admin/songs", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNewSong({ title: "", artist: "", album: "", duration: "0" });
            setFiles({ audio: null, image: null });
            toast.success("Song added successfully");
            setSongDialogOpen(false);
        } catch (error: any) {
            console.error("Error adding song:", error);

            if (error.response) {
                toast.error(error.response.data.message || "Failed to add song");
            } else if (error.request) {
                toast.error("No response from server. Please try again.");
            } else {
                toast.error("Error setting up request: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-black" type="button">
                    <Plus className="mr-2 size-4" />
                    Add Song
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Add New Song</DialogTitle>
                    <DialogDescription>Add a new song to your music library</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <input
                        type="file"
                        accept="audio/*"
                        ref={audioInputRef}
                        hidden
                        onChange={(e) =>
                            setFiles((prev) => ({ ...prev, audio: e.target.files?.[0] || null }))
                        }
                    />
                    <input
                        type="file"
                        ref={imageInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                            setFiles((prev) => ({ ...prev, image: e.target.files?.[0] || null }))
                        }
                    />

                    {/* img */}
                    <div
                        className="flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer"
                        onClick={() => imageInputRef.current?.click()}
                    >
                        <div className="text-center">
                            {files.image ? (
                                <div className="space-y-2">
                                    <div className="text-sm text-emerald-500">Image selected:</div>
                                    <div className="text-xs text-zinc-400">
                                        {files.image.name.slice(0, 20)}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 bg-zinc-800 rounded-full inline-block mb-2">
                                        <Upload className="size-6 text-zinc-400" />
                                    </div>
                                    <div className="text-sm text-zinc-400 mb-2">Upload artwork</div>
                                    <Button variant="outline" size="sm" type="button" className="text-xs">
                                        Choose File
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* аудио */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Audio File</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => audioInputRef.current?.click()}
                                className="w-full"
                            >
                                {files.audio ? files.audio.name.slice(0, 20) : "Choose Audio File"}
                            </Button>
                        </div>
                    </div>

                    {/* поля */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            value={newSong.title}
                            onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Artist</label>
                        <Input
                            value={newSong.artist}
                            onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                            className="bg-zinc-800 border-zinc-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (seconds)</label>
                        <Input
                            type="number"
                            min="0"
                            value={newSong.duration}
                            onChange={(e) =>
                                setNewSong({ ...newSong, duration: e.target.value || "0" })
                            }
                            className="bg-zinc-800 border-zinc-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Album (Optional)</label>
                        <Select
                            value={newSong.album}
                            onValueChange={(value) => setNewSong({ ...newSong, album: value })}
                        >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                <SelectValue placeholder="Select album" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="none">No Album (Single)</SelectItem>
                                {Array.isArray(albums) &&
                                    albums.map((album) => (
                                        <SelectItem key={album._id} value={album._id}>
                                            {album.title}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setSongDialogOpen(false)}
                        disabled={isLoading}
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} type="button">
                        {isLoading ? "Uploading..." : "Add Song"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddSongDialog;