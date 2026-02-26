import { useEffect, useRef } from 'react';
import { useAudioStore } from '../store/useAudioStore';

export function useAudioScrollTracker() {
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeSectionRef = useRef<string | null>(null);
    const { playSegment, fadeAndPause, currentlyPlaying } = useAudioStore();

    useEffect(() => {
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
            // Disable scroll tracker completely on mobile (tailwind md breakpoint is 768px)
            if (window.innerWidth < 768) return;

            // Find the most intersecting entry if multiple, or just rely on the firing order
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;

                    let spriteId: string | null = null;
                    if (sectionId === 'home') {
                        const hour = new Date().getHours();
                        if (hour < 12) spriteId = 'intro_morning';
                        else if (hour < 18) spriteId = 'intro_afternoon';
                        else spriteId = 'intro_evening';
                    }
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
            rootMargin: "-20% 0px -50% 0px", // Focus band in the top 30% of the screen (between 20% and 50% from the top)
            threshold: 0 // Trigger as soon as any part of the section enters this band
        });

        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => observer.observe(section));

        // Handle initial state if user enables audio or loads page while not scrolling
        const initialTimeout = setTimeout(() => {
            if (activeSectionRef.current && !currentlyPlaying) {
                playSegment(activeSectionRef.current);
            }
        }, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            clearTimeout(initialTimeout);
        };
    }, [fadeAndPause, playSegment, currentlyPlaying]);
}
