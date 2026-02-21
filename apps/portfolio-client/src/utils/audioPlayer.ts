import { Howl } from 'howler';

// Using the placeholder audio file for testing
export const audioSprite = new Howl({
    src: ['/assets/proper-section-test.mp3'],
    sprite: {
        // Dummy timestamps for initial testing - we will see these fire via console.logs
        intro: [0, 15000],
        expertise: [15500, 15000],
        projects: [30500, 15000],
        experience: [45500, 15000],
        tech_stack: [60500, 15000],
        backstory: [75500, 15000],
    },
    preload: true,
    onload: () => console.log('Howler: Audio sprite loaded successfully'),
    onloaderror: (_id, error) => console.error('Howler: Error loading audio', error),
    onplayerror: (_id, error) => {
        console.error('Howler: Play error (likely autoplay policy). Click required first.', error);
        audioSprite.once('unlock', () => {
            console.log('Howler: Autoplay unlocked!');
        });
    }
});
