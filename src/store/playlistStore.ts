import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Audio {
  id: number;
  title: string;
  description: string | null;
  script: string | null;
  publishDate: string;
  filePath: string;
  imageUrl: string | null;
  category: {
    id: number;
    name: string;
    isFree: boolean;
    presenterImage: string | null;
  };
}

interface PlaylistStore {
  playlist: Audio[];
  currentIndex: number;
  isPlaying: boolean;
  isPlaylistOpen: boolean;
  currentAudio: Audio | null;
  
  // Actions
  addToPlaylist: (audio: Audio) => void;
  removeFromPlaylist: (audioId: number) => void;
  clearPlaylist: () => void;
  setCurrentIndex: (index: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentAudio: (audio: Audio | null) => void;
  openPlaylist: () => void;
  closePlaylist: () => void;
  reorderPlaylist: (startIndex: number, endIndex: number) => void;
}

export const usePlaylistStore = create<PlaylistStore>()(
  persist(
    (set, get) => ({
      playlist: [],
      currentIndex: 0,
      isPlaying: false,
      isPlaylistOpen: false,
      currentAudio: null,

      addToPlaylist: (audio) => {
        const { playlist } = get();
        const isAlreadyInPlaylist = playlist.some(item => item.id === audio.id);
        
        if (!isAlreadyInPlaylist) {
          set({ playlist: [...playlist, audio] });
        }
      },

      removeFromPlaylist: (audioId) => {
        const { playlist, currentIndex } = get();
        const newPlaylist = playlist.filter(item => item.id !== audioId);
        const removedIndex = playlist.findIndex(item => item.id === audioId);
        
        let newCurrentIndex = currentIndex;
        if (removedIndex < currentIndex) {
          newCurrentIndex = currentIndex - 1;
        } else if (removedIndex === currentIndex && currentIndex >= newPlaylist.length) {
          newCurrentIndex = Math.max(0, newPlaylist.length - 1);
        }
        
        set({ 
          playlist: newPlaylist, 
          currentIndex: newCurrentIndex,
          currentAudio: newPlaylist[newCurrentIndex] || null
        });
      },

      clearPlaylist: () => {
        set({ 
          playlist: [], 
          currentIndex: 0, 
          currentAudio: null, 
          isPlaying: false 
        });
      },

      setCurrentIndex: (index) => {
        const { playlist } = get();
        if (index >= 0 && index < playlist.length) {
          set({ 
            currentIndex: index, 
            currentAudio: playlist[index] 
          });
        }
      },

      nextTrack: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;
        
        const nextIndex = currentIndex + 1;
        // 마지막 트랙에서 다음을 누르면 첫 번째 트랙으로 순환
        const newIndex = nextIndex >= playlist.length ? 0 : nextIndex;
        
        set({ 
          currentIndex: newIndex, 
          currentAudio: playlist[newIndex] 
        });
      },

      previousTrack: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;
        
        const prevIndex = currentIndex - 1;
        // 첫 번째 트랙에서 이전을 누르면 마지막 트랙으로 순환
        const newIndex = prevIndex < 0 ? playlist.length - 1 : prevIndex;
        
        set({ 
          currentIndex: newIndex, 
          currentAudio: playlist[newIndex] 
        });
      },

      setPlaying: (playing) => {
        set({ isPlaying: playing });
      },

      setCurrentAudio: (audio) => {
        const { playlist } = get();
        if (audio) {
          const index = playlist.findIndex(item => item.id === audio.id);
          set({ 
            currentAudio: audio, 
            currentIndex: index >= 0 ? index : 0 
          });
        } else {
          set({ currentAudio: null });
        }
      },

      openPlaylist: () => {
        set({ isPlaylistOpen: true });
      },

      closePlaylist: () => {
        set({ isPlaylistOpen: false });
      },

      reorderPlaylist: (startIndex, endIndex) => {
        const { playlist, currentIndex } = get();
        const result = Array.from(playlist);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        let newCurrentIndex = currentIndex;
        if (startIndex === currentIndex) {
          newCurrentIndex = endIndex;
        } else if (startIndex < currentIndex && endIndex >= currentIndex) {
          newCurrentIndex = currentIndex - 1;
        } else if (startIndex > currentIndex && endIndex <= currentIndex) {
          newCurrentIndex = currentIndex + 1;
        }

        set({ 
          playlist: result, 
          currentIndex: newCurrentIndex,
          currentAudio: result[newCurrentIndex] || null
        });
      },
    }),
    {
      name: "playlist-storage",
      partialize: (state) => ({
        playlist: state.playlist,
        currentIndex: state.currentIndex,
        currentAudio: state.currentAudio,
      }),
    }
  )
);