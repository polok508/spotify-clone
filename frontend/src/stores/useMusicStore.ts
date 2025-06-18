import { axiosInstance } from '@/lib/axios';
import { create } from 'zustand';
import { type Song, type Album, type Stats } from '@/types';
import toast from 'react-hot-toast';

interface MusicStore {
    songs: Song[];
    albums: Album[];
    isLoading: boolean;
    error: string | null;
    currentAlbum: Album | null;
    featuredSongs: Song[];
    madeForYouSongs: Song[];
    trendingSongs: Song[];
    stats: Stats;

    fetchAlbums: () => Promise<void>;
    fetchAlbumById: (id: string) => Promise<void>;
    fetchFeaturedSongs: () => Promise<void>;
    fetchMadeForYouSongs: () => Promise<void>;
    fetchTrendingSongs: () => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchSongs: () => Promise<void>;
    deleteSong: (id: string) => Promise<void>;
    deleteAlbum: (id: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
    albums: [],
    songs: [],
    isLoading: false,
    error: null,
    currentAlbum: null,
    featuredSongs: [],
    madeForYouSongs: [],
    trendingSongs: [],
    stats: {
        totalSongs: 0,
        totalAlbums: 0,
        totalUsers: 0,
        totalArtists: 0,
    },

    deleteSong: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/songs/${id}`);
            set(state => ({
                songs: state.songs.filter(song => song._id !== id)
            }));
            toast.success("Song deleted successfully");
        } catch (error: any) {
            console.error("Error in deleteSong", error);
            toast.error("Error deleting song");
        } finally {
            set({ isLoading: false });
        }
    },

    deleteAlbum: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/albums/${id}`);
            set((state) => ({
                albums: state.albums.filter((album) => album._id !== id),
                songs: state.songs.map((song) =>
                    song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
                ),
            }));
            toast.success("Album deleted successfully");
        } catch (error: any) {
            toast.error("Failed to delete album: " + (error.response?.data?.message || error.message));
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs");
            if (Array.isArray(response.data)) {
                set({ songs: response.data });
            } else {
                set({ error: "Unexpected response format for songs" });
            }
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/stats");
            if (response.data && typeof response.data === 'object') {
                set({ stats: response.data });
            } else {
                set({ error: "Unexpected response format for stats" });
            }
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAlbums: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/albums");
            if (Array.isArray(response.data)) {
                set({ albums: response.data });
            } else {
                set({ error: "Unexpected response format for albums" });
            }
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAlbumById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/albums/${id}`);
            if (response.data && typeof response.data === 'object') {
                set({ currentAlbum: response.data });
            } else {
                set({ error: "Unexpected response format for album" });
            }
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFeaturedSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/featured");
            if (Array.isArray(response.data)) {
                set({ featuredSongs: response.data });
            } else {
                set({ error: "Unexpected response format for featured songs" });
            }
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMadeForYouSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/made-for-you");
            if (Array.isArray(response.data)) {
                set({ madeForYouSongs: response.data });
            } else {
                set({ error: "Unexpected response format for made-for-you songs" });
            }
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchTrendingSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/trending");
            if (Array.isArray(response.data)) {
                set({ trendingSongs: response.data });
            } else {
                set({ error: "Unexpected response format for trending songs" });
            }
        } catch (error: any) {
            set({ error: error.response?.data?.message || error.message });
        } finally {
            set({ isLoading: false });
        }
    },
}));