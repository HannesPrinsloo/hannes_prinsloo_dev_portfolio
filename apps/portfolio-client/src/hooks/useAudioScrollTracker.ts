import { useEffect, useRef } from 'react';
import { useAudioStore } from '../store/useAudioStore';

export function useAudioScrollTracker() {
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeSectionRef = useRef<string | null>(null);
    const { playSegment, fadeAndPause, isAudioEnabled, currentlyPlaying } = useAudioStore();

    useEffect(() => {
        if (!isAudioEnabled) {
            return;
        }

        const handleScroll = () => {
            // User is actively scrolling; fade out whatever is currently playing
            // fadeAndPause();

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            // fadeAndPause();

            // Settling debounce: wait 500ms after the last scroll event
            scrollTimeoutRef.current = setTimeout(() => {
                if (activeSectionRef.current) {
                    playSegment(activeSectionRef.current);
                }
            }, 500);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        const observer = new IntersectionObserver((entries) => {
            // Find the most intersecting entry if multiple, or just rely on the firing order
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;

                    let spriteId = null;
                    if (sectionId === 'home') spriteId = 'intro';
                    if (sectionId === 'expertise') spriteId = 'expertise';
                    if (sectionId === 'work') spriteId = 'projects';
                    if (sectionId === 'tech_stack') spriteId = 'tech_stack';
                    if (sectionId === 'experience') spriteId = 'experience';

                    if (spriteId) {
                        activeSectionRef.current = spriteId;
                        console.log(`ScrollTracker: Section #${sectionId} holds focus. Will play "${spriteId}" on settle.`);
                    }
                }
            });
        }, {
            threshold: 0.5 // Section must be at least 50% visible to claim focus
        });

        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => observer.observe(section));

        // Handle initial state if user enables audio while not scrolling
        const initialTimeout = setTimeout(() => {
            if (activeSectionRef.current && isAudioEnabled && !currentlyPlaying) {
                playSegment(activeSectionRef.current);
            }
        }, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            clearTimeout(initialTimeout);
        };
    }, [isAudioEnabled, fadeAndPause, playSegment, currentlyPlaying]);
}
