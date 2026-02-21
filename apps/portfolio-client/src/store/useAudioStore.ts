import { create } from 'zustand';
import { audioSprite } from '../utils/audioPlayer';

interface AudioState {
    isAudioEnabled: boolean;
    currentlyPlaying: string | null;
    toggleAudioEnabled: () => void;
    playSegment: (id: string) => void;
    stop: () => void;
    fadeAndPause: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    isAudioEnabled: false,
    currentlyPlaying: null,

    toggleAudioEnabled: () => {
        set((state) => {
            const isEnabled = !state.isAudioEnabled;
            console.log(`Audio Toggle: ${isEnabled ? 'ON' : 'OFF'} --> FUNCTION toggleAudioEnabled`);

            // If immediately disabled, stop any playing audio
            if (!isEnabled) {
                audioSprite.stop();
                return { isAudioEnabled: isEnabled, currentlyPlaying: null };
            }

            // If enabling, this is often the user gesture that can "unlock" Howler's audio context
            if (audioSprite.state() === 'unloaded') {
                audioSprite.load();
            }

            return { isAudioEnabled: isEnabled };
        });
    },

    playSegment: (id: string) => {
        const { isAudioEnabled, currentlyPlaying } = get();

        if (!isAudioEnabled) {
            console.log(`AudioStore: Denied playing "${id}" - Audio is disabled --> FUNCTION playSegment`);
            return;
        }

        if (currentlyPlaying === id) {
            return; // Already playing this segment
        }

        console.log(`AudioStore: Playing segment "${id}" --> FUNCTION playSegment`);

        // Stop whatever is playing instantly (to prevent overlaps)
        if (currentlyPlaying) {
            audioSprite.fade(1, 0, 1000);
            audioSprite.stop();

            audioSprite.volume(1);
            console.log(`🐲AudioStore: Stopped "${currentlyPlaying}" --> FUNCTION playSegment`);
        }

        // Play the newly requested segment
        audioSprite.play(id);
        set({ currentlyPlaying: id });
    },

    stop: () => {
        audioSprite.stop();
        set({ currentlyPlaying: null });
        console.log('AudioStore: Stopped all audio');
    },

    fadeAndPause: () => {
        const { currentlyPlaying } = get();
        if (!currentlyPlaying) return;

        console.log(`AudioStore: 🔥Fading out "${currentlyPlaying}"`);

        // Immediately clear state to prevent concurrent fade triggers
        set({ currentlyPlaying: null });

        // Fade volume from 1.0 to 0.0 over 300 milliseconds
        audioSprite.fade(1, 0, 300);

        setTimeout(() => {
            audioSprite.pause();
            audioSprite.volume(1); // Reset the volume back to max for the next play
            console.log(`AudioStore: Paused after fade`);
        }, 300);
    }
}));
