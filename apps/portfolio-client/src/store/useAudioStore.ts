import { create } from 'zustand';
import { audioSprite, backgroundMusic } from '../utils/audioPlayer';
import { Howler } from 'howler';

interface AudioState {
    isAudioEnabled: boolean;
    isAudioLoading: boolean;
    currentlyPlaying: string | null;
    masterVolume: number;
    toggleAudioEnabled: () => void;
    setMasterVolume: (volume: number) => void;
    playSegment: (id: string) => void;
    stop: () => void;
    fadeAndPause: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    isAudioEnabled: false,
    isAudioLoading: false,
    currentlyPlaying: null,
    masterVolume: 1.0,

    setMasterVolume: (volume: number) => {
        // Clamp between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, volume));
        Howler.volume(clampedVolume);
        set({ masterVolume: clampedVolume });
    },

    toggleAudioEnabled: () => {
        set((state) => {
            const isEnabled = !state.isAudioEnabled;
            console.log(`Audio Toggle: ${isEnabled ? 'ON' : 'OFF'} --> FUNCTION toggleAudioEnabled`);

            // If immediately disabled, stop any playing audio
            if (!isEnabled) {
                audioSprite.stop();

                // Fade out background music gracefully over 1 second, then stop
                backgroundMusic.fade(backgroundMusic.volume(), 0, 1000);
                setTimeout(() => {
                    backgroundMusic.stop();
                    backgroundMusic.volume(0.15); // Reset back to default volume after stopping
                }, 1000);

                return { isAudioEnabled: isEnabled, currentlyPlaying: null };
            }

            // Start by loading ONLY the critical voice sprite
            if (audioSprite.state() === 'unloaded') {
                set({ isAudioLoading: true });
                audioSprite.load();

                // Wait for the voiceover to load before pulling the heavy background track
                audioSprite.once('load', () => {
                    set({ isAudioLoading: false });
                    backgroundMusic.load();
                    backgroundMusic.volume(0);
                    backgroundMusic.play();
                    backgroundMusic.fade(0, 0.15, 2000);
                });
            } else if (audioSprite.state() === 'loaded') {
                // If it's already loaded
                if (backgroundMusic.state() === 'unloaded') {
                    backgroundMusic.load();
                }
                backgroundMusic.volume(0);
                backgroundMusic.play();
                backgroundMusic.fade(0, 0.15, 2000);
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
        backgroundMusic.fade(backgroundMusic.volume(), 0, 1000);
        setTimeout(() => {
            backgroundMusic.stop();
            backgroundMusic.volume(0.15);
        }, 1000);
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
