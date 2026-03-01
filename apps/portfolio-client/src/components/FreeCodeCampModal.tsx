import React, { useEffect } from 'react';
import RandomNietzsche from './freeCodeCamp/RandomNietzsche';
import RomanNumeralConverter from './freeCodeCamp/RomanNumeralConverter';
import PomodoroTimer from './freeCodeCamp/PomodoroTimer';
import JavascriptCalculator from './freeCodeCamp/JavascriptCalculator';
import DrumMachine from './freeCodeCamp/DrumMachine';
import PokemonSearchApp from './freeCodeCamp/PokemonSearchApp';

interface FreeCodeCampModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectTitle: string;
}

const FreeCodeCampModal: React.FC<FreeCodeCampModalProps> = ({ isOpen, onClose, projectTitle }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Container - Using same animation and shadow as ProjectModal */}
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-paper border-4 border-ink shadow-[10px_10px_0px_0px_#1A1A1A] transform transition-all animate-paper-slam overflow-hidden">

                {/* Header (Sticky) */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b-4 border-ink bg-paper z-10 sticky top-0">
                    <h2 className="text-2xl md:text-4xl font-black uppercase leading-none tracking-tighter mix-blend-multiply dark:mix-blend-normal">
                        {projectTitle}
                    </h2>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex-shrink-0 border-2 border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors group"
                        aria-label="Close modal"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 transform group-hover:rotate-90 transition-transform">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-surface-muted bg-[linear-gradient(var(--color-ink)_1px,transparent_1px),linear-gradient(90deg,var(--color-ink)_1px,transparent_1px)] bg-[size:40px_40px] [background-position:center_center] relative">
                    {/* Subtle overlay to soften brutalist grid background */}
                    <div className="absolute inset-0 bg-paper/90 pointer-events-none mix-blend-normal hidden dark:block"></div>
                    <div className="absolute inset-0 bg-paper/85 pointer-events-none mix-blend-normal dark:hidden"></div>

                    <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-12 items-center justify-center py-20">
                        {projectTitle === 'Random Nietzsche' ? (
                            <RandomNietzsche />
                        ) : projectTitle === 'Roman Numeral Converter' ? (
                            <RomanNumeralConverter />
                        ) : projectTitle === 'Pomodoro Timer' ? (
                            <PomodoroTimer />
                        ) : projectTitle === 'JavaScript Calculator' ? (
                            <JavascriptCalculator />
                        ) : projectTitle === 'Drum Machine' ? (
                            <DrumMachine />
                        ) : projectTitle === 'Pokemon Search App' ? (
                            <PokemonSearchApp />
                        ) : (
                            <span className="font-sans font-bold text-4xl opacity-20 transform -rotate-12">PROJECT COMING SOON</span>
                        )}
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="h-2 bg-[repeating-linear-gradient(45deg,var(--color-ink),var(--color-ink)_10px,var(--color-acid)_10px,var(--color-acid)_20px)] border-t-4 border-ink z-10 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default FreeCodeCampModal;
