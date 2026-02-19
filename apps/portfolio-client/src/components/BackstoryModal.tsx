import React, { useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

interface BackstoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BackstoryModal: React.FC<BackstoryModalProps> = ({ isOpen, onClose }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const storyText = ` Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

    // Only start typing when open
    const { displayedText, isTyping } = useTypewriter(isOpen ? storyText : '', 15, 500);

    if (!isOpen) return null;

    const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' }); // YYYY-MM-DD format in SA time

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Notebook Container */}
            <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-paper border-4 border-ink shadow-[10px_10px_0px_0px_#1A1A1A] transform transition-all animate-paper-slam p-6 md:p-12 overflow-hidden">

                {/* Binding Visual (Left Side) - Industrial Screw Binding */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 bg-ink flex flex-col items-center justify-between py-12 z-20">
                    {/* Binding Screws */}
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-paper flex items-center justify-center relative shadow-sm">
                            {/* Phillips Head */}
                            <div className="absolute w-4 h-0.5 bg-ink rotate-45"></div>
                            <div className="absolute w-4 h-0.5 bg-ink -rotate-45"></div>
                        </div>
                    ))}
                </div>

                {/* Content Wrapper */}
                <div className="pl-16 md:pl-24 relative z-10 flex flex-col h-full min-h-0">

                    {/* Header */}
                    <div className="border-b-4 border-ink pb-4 mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold uppercase leading-none mb-2">
                            My Background: <br /> Artist to Engineer
                        </h2>
                        <div className="font-mono text-sm flex gap-3 text-gray-500">
                            <span className="line-through decoration-2 decoration-ink text-ink opacity-50">2026-02-19</span>
                            <span className="text-ink font-bold">{currentDate}</span>
                        </div>
                    </div>

                    {/* Ruled Paper Body with Typewriter Text */}
                    <div className="flex-1 overflow-y-auto pr-4 font-mono text-sm md:text-base leading-relaxed relative bg-[linear-gradient(transparent_96%,#E5E5E5_96%)] bg-[size:100%_2rem]">
                        <p className="whitespace-pre-wrap">
                            {displayedText}
                            <span className={`inline-block w-2.5 h-5 bg-acid align-middle ml-1 ${isTyping ? 'animate-pulse' : 'opacity-0'}`}></span>
                        </p>
                    </div>

                    {/* Footer / Close */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-paper text-ink px-6 py-2 font-bold uppercase border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            But like, can you code?
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BackstoryModal;
