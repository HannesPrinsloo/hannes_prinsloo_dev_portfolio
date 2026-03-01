import React, { useEffect, useRef, useState } from 'react';

interface FreelanceWorkModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FreelanceWorkModal: React.FC<FreelanceWorkModalProps> = ({ isOpen, onClose }) => {
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [playingStates, setPlayingStates] = useState<boolean[]>([]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset playing states when modal closes
            setPlayingStates([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const freelanceProjects = [
        { title: 'Mounted', video: '/assets/mounted-web.mp4' },
        { title: 'Debtorsolved', video: '/assets/debtorsolved-web.mp4' },
        { title: 'OBC Group', video: '/assets/obc-web.mp4' }
    ];

    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;


    const togglePlayPause = (index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;

        if (video.paused) {
            video.play();
            setPlayingStates(prev => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
        } else {
            video.pause();
            setPlayingStates(prev => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
        }
    };

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
                        Freelance Work
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

                    <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-12">

                        {freelanceProjects.map((project, index) => (
                            <div key={index} className="flex flex-col gap-4">
                                <h3 className="text-2xl font-black uppercase inline-block bg-ink text-paper px-4 py-2 self-start shadow-neo-sm transform -rotate-1">
                                    {project.title}
                                </h3>
                                {/* Video Showcase Area */}
                                <div
                                    className="w-full aspect-video border-4 border-ink bg-ink relative overflow-hidden shadow-neo-sm cursor-pointer group/video"
                                    onClick={() => togglePlayPause(index)}
                                >
                                    <video
                                        ref={el => { videoRefs.current[index] = el; }}
                                        src={project.video}
                                        className="w-full h-full object-cover"
                                        preload="metadata"
                                        muted
                                        playsInline
                                        onPlay={() => setPlayingStates(prev => {
                                            const next = [...prev];
                                            next[index] = true;
                                            return next;
                                        })}
                                        onPause={() => setPlayingStates(prev => {
                                            const next = [...prev];
                                            next[index] = false;
                                            return next;
                                        })}
                                    >
                                        Your browser does not support the video tag.
                                    </video>

                                    {/* Dark overlay when paused */}
                                    <div className={`absolute inset-0 bg-ink/25 transition-opacity duration-300 pointer-events-none ${playingStates[index] ? 'opacity-0' : 'opacity-100'}`}></div>

                                    {/* Play Button */}
                                    <div
                                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playingStates[index] ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                    >
                                        <button
                                            className="w-16 h-16 md:w-20 md:h-20 bg-paper border-4 border-ink shadow-neo flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-acid"
                                            aria-label={`Play ${project.title} video`}
                                        >
                                            <svg viewBox="0 0 24 24" fill="var(--color-ink)" className="w-8 h-8 md:w-10 md:h-10 ml-1">
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Inner Video Border highlight */}
                                    <div className="absolute inset-0 border-2 border-white/10 pointer-events-none mix-blend-overlay"></div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Footer Decor */}
                <div className="h-2 bg-[repeating-linear-gradient(45deg,var(--color-ink),var(--color-ink)_10px,var(--color-acid)_10px,var(--color-acid)_20px)] border-t-4 border-ink z-10 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default FreelanceWorkModal;
