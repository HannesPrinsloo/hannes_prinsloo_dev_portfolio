import React, { useEffect, useState } from 'react';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Reset technical details view when reopened
            setShowTechnicalDetails(false);
        } else {
            document.body.style.overflow = 'unset';
            // Add a small delay to reset the state after animation completes
            const timer = setTimeout(() => setShowTechnicalDetails(false), 300);
            return () => clearTimeout(timer);
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

            {/* Container - Using same animation and shadow as BackstoryModal */}
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-paper border-4 border-ink shadow-[10px_10px_0px_0px_#1A1A1A] transform transition-all animate-paper-slam overflow-hidden">

                {/* Header (Sticky) */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b-4 border-ink bg-paper z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl md:text-4xl font-black uppercase leading-none tracking-tighter mix-blend-multiply dark:mix-blend-normal">
                            Music School Manager
                        </h2>
                        <span className="border border-ink px-2 py-1 text-xs font-bold bg-acid text-black hidden sm:inline-block">v1.0-alpha</span>
                    </div>

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

                    <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8 md:gap-12">

                        {/* Video Showcase Area */}
                        <div className="w-full aspect-video border-4 border-ink bg-ink relative overflow-hidden shadow-neo-sm">
                            <video
                                src="/assets/placeholder_video.mp4"
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                            >
                                Your browser does not support the video tag.
                            </video>

                            {/* Inner Video Border highlight */}
                            <div className="absolute inset-0 border-2 border-white/10 pointer-events-none mix-blend-overlay"></div>
                        </div>

                        {/* Top-Level Description (Default View) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-paper border-2 border-ink p-6 shadow-neo-sm">
                                <h3 className="text-xl font-bold uppercase border-b-2 border-ink pb-2 mb-4">Project Overview</h3>
                                <p className="text-sm leading-relaxed font-mono">
                                    The Music School Manager is a comprehensive CRM built specifically for a growing music academy.
                                    It handles the complex relationships between multiple user roles: Administrators, Teachers, Managers, and Students.
                                </p>
                                <p className="text-sm leading-relaxed font-mono mt-4">
                                    The application streamlines daily operations including scheduling lessons, building teacher rosters,
                                    managing event bookings, and handling billing and registration procedures.
                                </p>
                            </div>

                            <div className="bg-paper border-2 border-ink p-6 shadow-neo-sm">
                                <h3 className="text-xl font-bold uppercase border-b-2 border-ink pb-2 mb-4">Key Features</h3>
                                <ul className="text-sm font-mono space-y-3">
                                    <li className="flex gap-2">
                                        <span className="text-acid font-bold">»</span>
                                        <span>Multi-role dashboards with distinct permission sets</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-acid font-bold">»</span>
                                        <span>Complex event and lesson booking systems</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-acid font-bold">»</span>
                                        <span>Real-time UI synchronization across sessions</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-acid font-bold">»</span>
                                        <span>Automated student progression leveling</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Toggle Button for Technical Details */}
                        <div className="flex justify-center my-4">
                            <button
                                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                                className={`
                                    bg-ink text-paper px-8 py-4 font-bold uppercase tracking-widest text-sm border-2 border-transparent
                                    hover:bg-acid hover:text-ink hover:border-ink hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none
                                    flex items-center gap-3 group
                                `}
                            >
                                <span>Deep Dive for Nerds</span>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className={`w-5 h-5 transition-transform duration-300 ${showTechnicalDetails ? 'rotate-180' : 'group-hover:translate-y-1'}`}
                                >
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Technical Details View */}
                        <div className={`
                            transition-all duration-500 overflow-hidden flex flex-col gap-8
                            ${showTechnicalDetails ? 'max-h-[2000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}
                        `}>
                            {/* Tech Stack Bar */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {['TypeScript', 'React', 'React Query', 'Zustand', 'Node.js', 'Express', 'Tailwind', 'PostgreSQL'].map(tech => (
                                    <span key={tech} className="text-xs font-bold uppercase border border-ink bg-paper px-3 py-1.5 shadow-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="bg-paper border-l-4 border-ink p-6 md:p-8 shadow-neo-sm">
                                <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                                    <span className="w-6 h-6 bg-acid border-2 border-ink flex-shrink-0"></span>
                                    Architecture & Challenges
                                </h3>

                                <div className="space-y-8 font-mono text-sm leading-relaxed">
                                    <div>
                                        <h4 className="font-bold text-lg mb-2 uppercase tracking-wide border-b border-ink/20 pb-1">The Concurrency Problem</h4>
                                        <p>
                                            In a multi-tenant environment, data staleness can lead to dangerous bugs. For instance: A Manager views an event and sees a list of "Eligible Students". Simultaneously, a Teacher demotes a student, revoking their eligibility. If the Manager clicks "Book" while looking at stale data, the system could allow an invalid booking.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg mb-2 uppercase tracking-wide border-b border-ink/20 pb-1">Solution Layer 1: PostgreSQL Transactions</h4>
                                        <p>
                                            Absolute backend security. Instead of blindly trusting client requests, critical mutations (like booking a student) were refactored to execute inside strict SQL transactions (<code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">BEGIN/COMMIT</code>). Live validation queries run <em>inside</em> the transaction block to verify absolute current eligibility before database insertion, rolling back if criteria aren't met.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg mb-2 uppercase tracking-wide border-b border-ink/20 pb-1">Solution Layer 2: React Query Refactor</h4>
                                        <p>
                                            To prevent users from hitting those backend locks due to stale UIs, the entire frontend was migrated away from standard <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">useEffect</code> fetching to TanStack Query.
                                        </p>
                                        <ul className="mt-4 space-y-3 pl-4 border-l-2 border-acid">
                                            <li><strong className="text-acid bg-ink px-1 filter invert dark:invert-0 shadow-sm">Short-Polling:</strong> Dashboards silently re-fetch data in the background (e.g., every 10s) so the UI acts as a living document.</li>
                                            <li><strong className="text-acid bg-ink px-1 filter invert dark:invert-0 shadow-sm">Cache Invalidation:</strong> Mutations preemptively invalidate query keys, forcing immediate background updates globally without manual prop-drilling or state juggling.</li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Decor */}
                <div className="h-2 bg-[repeating-linear-gradient(45deg,var(--color-ink),var(--color-ink)_10px,var(--color-acid)_10px,var(--color-acid)_20px)] border-t-4 border-ink z-10 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default ProjectModal;
