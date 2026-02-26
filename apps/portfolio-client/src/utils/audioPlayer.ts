import { Howl } from 'howler';

// Using the placeholder audio file for testing
export const audioSprite = new Howl({
    src: ['/assets/audio_tour_LR_with-backstory.mp3'],
    sprite: {
        // Dummy timestamps for initial testing - we will see these fire via console.logs
        // TODO: Update these intro timestamps once the final recordings with greetings are complete
        intro_morning: [0, 2590],
        intro_afternoon: [2600, 3000],
        intro_evening: [5600, 2500],
        intro: [9440, 10000],
        expertise: [19530, 48500],
        projects: [68150, 41200],
        experience: [109300, 84500],
        tech_stack: [193800, 28500],
        footer_offer: [222300, 4000],
        backstory: [226100, 27100],

    },
    preload: false,
    onload: () => console.log('Howler: Audio sprite loaded successfully'),
    onloaderror: (_id, error) => console.error('Howler: Error loading audio', error),
    onplayerror: (id, error) => {
        console.error('Howler: Play error (likely autoplay policy). Click required first.', error);
        audioSprite.once('unlock', () => {
            console.log('Howler: Autoplay unlocked! Retrying play...');
            // Explicitly play the id that was blocked, this is required on Mobile Safari
            audioSprite.play(id);
        });
    }
});
export const backgroundMusic = new Howl({
    src: ['/assets/Deurmekaar_in_Durbanville_Web_Optimised .mp3'],
    loop: true,
    volume: 0.25, // This is the default volume. You can adjust this value later!
    preload: false,
    onload: () => console.log('Howler: Background music loaded successfully'),
    onloaderror: (_id, error) => console.error('Howler: Error loading background music', error),
    onplayerror: (id, error) => {
        console.error('Howler: BGM Play error (autoplay policy). Waiting for unlock.', error);
        backgroundMusic.once('unlock', () => {
            backgroundMusic.play(id);
        });
    }
});
