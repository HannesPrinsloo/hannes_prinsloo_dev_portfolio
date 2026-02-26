import { create } from 'zustand';
import { audioSprite, backgroundMusic } from '../utils/audioPlayer';
import { Howler } from 'howler';

interface AudioState {
    isAudioEnabled: boolean;
    isAudioLoading: boolean;
    currentlyPlaying: string | null;
    masterVolume: number;
    isAudioPaused: boolean;
    hasPlayedGreeting: boolean;
    lastRequestedSegment: string | null;
    playbackTimeout: ReturnType<typeof setTimeout> | null;
    toggleAudioEnabled: () => void;
    setMasterVolume: (volume: number) => void;
    playSegment: (id: string) => void;
    pauseTour: () => void;
    resumeTour: () => void;
    stop: () => void;
    fadeAndPause: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    isAudioEnabled: false,
    isAudioLoading: false,
    currentlyPlaying: null,
    masterVolume: 1.0,
    playbackTimeout: null,
    isAudioPaused: false,
    hasPlayedGreeting: false,
    lastRequestedSegment: null,

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
                if (state.playbackTimeout) clearTimeout(state.playbackTimeout);
                audioSprite.stop();

                // Fade out background music gracefully over 1 second, then stop
                backgroundMusic.fade(backgroundMusic.volume(), 0, 1000);
                setTimeout(() => {
                    backgroundMusic.stop();
                    backgroundMusic.volume(0.5); // Reset back to default volume after stopping
                }, 1000);

                return { isAudioEnabled: isEnabled, currentlyPlaying: null, playbackTimeout: null, isAudioPaused: false, lastRequestedSegment: null, hasPlayedGreeting: false };
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
                    backgroundMusic.fade(0, 0.5, 2000);
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

            return { isAudioEnabled: isEnabled, isAudioPaused: false };
        });
    },

    playSegment: (id: string) => {
        const { isAudioEnabled, isAudioPaused, currentlyPlaying, playbackTimeout } = get();

        if (!isAudioEnabled) {
            console.log(`AudioStore: Denied playing "${id}" - Audio is disabled --> FUNCTION playSegment`);
            return;
        }

        // Intercept greetings if they've already been played this session
        if (id.startsWith('intro_') && get().hasPlayedGreeting) {
            id = 'intro';
        }

        // Keep track of what section the user is actually looking at, even if paused
        set({ lastRequestedSegment: id });

        // EXCEPTION: Always play the footer offer if triggered, regardless of pause state
        if (isAudioPaused && id !== 'footer_offer') {
            console.log(`AudioStore: Tour is paused. Cached "${id}" for later.`);
            return;
        }

        if (currentlyPlaying === id) {
            return; // Already playing this segment
        }

        console.log(`AudioStore: Playing segment "${id}" --> FUNCTION playSegment`);

        // Mark greeting as played so it doesn't repeat this session
        if (id.startsWith('intro_')) {
            set({ hasPlayedGreeting: true });
        }

        // Stop whatever is playing instantly (to prevent overlaps)
        if (currentlyPlaying) {
            if (playbackTimeout) clearTimeout(playbackTimeout);
            audioSprite.fade(1, 0, 1000);
            audioSprite.stop();

            audioSprite.volume(1);
            console.log(`🐲AudioStore: Stopped "${currentlyPlaying}" --> FUNCTION playSegment`);
        }

        // Play the newly requested segment
        audioSprite.play(id);

        let newTimeout: ReturnType<typeof setTimeout> | null = null;
        if (id.startsWith('intro_')) {
            newTimeout = setTimeout(() => {
                const state = get();
                if (state.isAudioEnabled && !state.isAudioPaused && state.currentlyPlaying === id) {
                    console.log(`AudioStore: Greeting finished, playing main intro`);
                    audioSprite.play('intro');
                    set({ currentlyPlaying: 'intro', playbackTimeout: null, lastRequestedSegment: 'intro' });
                }
            }, 5000); // 5-second offset for greetings
        }

        set({ currentlyPlaying: id, playbackTimeout: newTimeout });
    },

    pauseTour: () => {
        const { currentlyPlaying, playbackTimeout } = get();
        if (playbackTimeout) clearTimeout(playbackTimeout);
        audioSprite.pause();
        console.log(`AudioStore: Paused tour at "${currentlyPlaying}"`);
        set({ isAudioPaused: true, playbackTimeout: null });
    },

    resumeTour: () => {
        const { isAudioEnabled, lastRequestedSegment, currentlyPlaying } = get();
        if (!isAudioEnabled) return;

        set({ isAudioPaused: false });
        // If they scrolled somewhere else while paused, play that new segment from the top
        if (lastRequestedSegment && lastRequestedSegment !== currentlyPlaying) {
            console.log(`AudioStore: Resumed in a new section, playing "${lastRequestedSegment}"`);
            // We need to clear `currentlyPlaying` momentarily so `playSegment` doesn't early return
            set({ currentlyPlaying: null });
            get().playSegment(lastRequestedSegment);
        } else {
            console.log(`AudioStore: Resumed from paused position on "${currentlyPlaying}"`);
            audioSprite.play();
        }
    },

    stop: () => {
        const { playbackTimeout } = get();
        if (playbackTimeout) clearTimeout(playbackTimeout);
        audioSprite.stop();
        backgroundMusic.fade(backgroundMusic.volume(), 0, 1000);
        setTimeout(() => {
            backgroundMusic.stop();
            backgroundMusic.volume(0.5);
        }, 1000);
        set({ currentlyPlaying: null, playbackTimeout: null });
        console.log('AudioStore: Stopped all audio');
    },

    fadeAndPause: () => {
        const { currentlyPlaying, playbackTimeout } = get();
        if (!currentlyPlaying) return;

        console.log(`AudioStore: 🔥Fading out "${currentlyPlaying}"`);

        if (playbackTimeout) clearTimeout(playbackTimeout);

        // Immediately clear state to prevent concurrent fade triggers
        set({ currentlyPlaying: null, playbackTimeout: null });

        // Fade volume from 1.0 to 0.0 over 300 milliseconds
        audioSprite.fade(1, 0, 300);

        setTimeout(() => {
            audioSprite.pause();
            audioSprite.volume(1); // Reset the volume back to max for the next play
            console.log(`AudioStore: Paused after fade`);
        }, 300);
    }
}));
