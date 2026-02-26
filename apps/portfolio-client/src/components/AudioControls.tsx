import React from 'react';
import { useAudioStore } from '../store/useAudioStore';

interface AudioControlsProps {
    disableSkip?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ disableSkip = false }) => {
    const { isAudioEnabled, isAudioPaused, pauseTour, resumeTour, lastRequestedSegment } = useAudioStore();

    if (!isAudioEnabled) return null;

    // Define the ordered sections that the skip buttons will navigate between
    const sections = ['home', 'expertise', 'work', 'experience', 'tech_stack'];

    // Find the current index based on what is playing or was last requested
    // If it's a greeting, we treat it as being on the 'home' section
    let currentSegment = lastRequestedSegment;
    if (currentSegment?.startsWith('intro')) {
        currentSegment = 'home';
    } else if (currentSegment === 'projects') {
        currentSegment = 'work'; // mapping sprite ID back to section ID
    }

    const currentIndex = sections.indexOf(currentSegment || 'home');

    const handleSkip = (direction: 'forward' | 'backward') => {
        if (disableSkip) return;

        let newIndex = currentIndex;

        if (direction === 'forward') {
            newIndex = Math.min(currentIndex + 1, sections.length - 1);
        } else {
            newIndex = Math.max(currentIndex - 1, 0);
        }

        if (newIndex !== currentIndex) {
            const nextSectionId = sections[newIndex];
            const nextSectionElement = document.getElementById(nextSectionId);
            if (nextSectionElement) {
                // Smooth scroll to the section. 
                // The scroll tracker will detect this and automatically request 
                // the new audio segment (or queue it if paused).
                nextSectionElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] items-center gap-2 bg-paper p-2 border-2 border-ink shadow-neo transition-all pointer-events-auto">

            {/* Skip Backward Button */}
            <button
                onClick={() => handleSkip('backward')}
                disabled={currentIndex <= 0 || disableSkip}
                className="w-10 h-10 flex items-center justify-center border-2 border-ink shadow-neo hover:bg-acid hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo disabled:hover:bg-paper disabled:cursor-not-allowed transition-all"
                aria-label="Skip backward"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
            </button>

            {/* Play/Pause Button */}
            <button
                onClick={isAudioPaused ? resumeTour : pauseTour}
                className="h-10 px-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-ink shadow-neo hover:bg-acid hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
                {isAudioPaused ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>PLAY</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                        <span>PAUSE</span>
                    </>
                )}
            </button>

            {/* Skip Forward Button */}
            <button
                onClick={() => handleSkip('forward')}
                disabled={currentIndex >= sections.length - 1 || disableSkip}
                className="w-10 h-10 flex items-center justify-center border-2 border-ink shadow-neo hover:bg-acid hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo disabled:hover:bg-paper disabled:cursor-not-allowed transition-all"
                aria-label="Skip forward"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
            </button>
        </div>
    );
};
