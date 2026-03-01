import { useState, useEffect, useRef } from 'react'
import { useAudioStore } from './store/useAudioStore'
import { useAudioScrollTracker } from './hooks/useAudioScrollTracker'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import BackstoryModal from './components/BackstoryModal'
// import { GameModal } from './components/game/GameModal'
// import { useGameStore } from './store/useGameStore'
import { useDelayedTooltip } from './hooks/useDelayedTooltip'
import { AudioControls } from './components/AudioControls'
import ProjectModal from './components/ProjectModal'
import FreelanceWorkModal from './components/FreelanceWorkModal'
import FreeCodeCampModal from './components/FreeCodeCampModal'
function App() {
    const isAudioEnabled = useAudioStore((state) => state.isAudioEnabled);
    const isAudioLoading = useAudioStore((state) => state.isAudioLoading);
    const toggleAudioEnabled = useAudioStore((state) => state.toggleAudioEnabled);
    const masterVolume = useAudioStore((state) => state.masterVolume);
    const setMasterVolume = useAudioStore((state) => state.setMasterVolume);
    // const openGameModal = useGameStore((state) => state.openModal);

    const { isVisible: showAudioTooltip, triggerProps: audioTooltipTriggerProps, tooltipProps: audioTooltipProps } = useDelayedTooltip(300, "audio-tour-tooltip");

    useAudioScrollTracker();

    const lastRequestedSegment = useAudioStore((state) => state.lastRequestedSegment);
    const getActiveSection = () => {
        let currentSegment = lastRequestedSegment;
        if (currentSegment?.startsWith('intro')) return 'home';
        if (currentSegment === 'projects') return 'work';
        if (currentSegment === 'footer_offer') return 'tech_stack';
        return currentSegment || 'home';
    };
    const activeSection = getActiveSection();

    const [showBackstory, setShowBackstory] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isFreelanceWorkModalOpen, setIsFreelanceWorkModalOpen] = useState(false);
    const [isFreeCodeCampModalOpen, setIsFreeCodeCampModalOpen] = useState(false);
    const [activeFreeCodeCampProject, setActiveFreeCodeCampProject] = useState('');
    const [isFreeCodeCampExpanded, setIsFreeCodeCampExpanded] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [themeClickCount, setThemeClickCount] = useState(0);
    const [dotLottie, setDotLottie] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    // Audio Footer Interaction States
    const playSegment = useAudioStore((state) => state.playSegment);
    const [hasTriggeredFooterAudio, setHasTriggeredFooterAudio] = useState(false);
    const [showCopyButton, setShowCopyButton] = useState(false);
    const [copyAnimationFinished, setCopyAnimationFinished] = useState(false);
    const [copyText, setCopyText] = useState("Copy Number to Clipboard");

    // Close mobile menu when clicking outside of the nav element
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (isMobileMenuOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Explicitly command the pre-mounted Lottie instance to play when the 4th click hits
    useEffect(() => {
        if (dotLottie && themeClickCount >= 4) {
            dotLottie.play();
        } else if (dotLottie) {
            dotLottie.stop();
        }
    }, [dotLottie, themeClickCount]);

    // Preload the massive Lottie file into the browser cache when the user is 1 click away
    useEffect(() => {
        if (themeClickCount === 3) {
            fetch('/assets/fun-mode-animation.lottie').catch(err => console.error("Prefetch failed:", err));
        }
    }, [themeClickCount]);

    const handleThemeToggle = () => {
        if (themeClickCount >= 4) {
            setThemeClickCount(0);
            setIsDarkMode(false);
        } else {
            setThemeClickCount(prev => prev + 1);
            setIsDarkMode(!isDarkMode);
        }
    };

    useEffect(() => {
        document.documentElement.classList.remove('dark', 'fun');
        if (themeClickCount >= 4) {
            document.documentElement.classList.add('fun');
        } else if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, [isDarkMode, themeClickCount]);

    return (
        <div className="min-h-screen bg-paper text-ink p-4 md:p-8 font-mono">

            <BackstoryModal isOpen={showBackstory} onClose={() => setShowBackstory(false)} /* isDarkMode={isDarkMode} */ />

            {/* Navigation / Header */}
            <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    {/* Top Row for Mobile (Brand + Toggles) */}
                    <div className="w-full md:w-auto flex justify-between items-center">
                        {/* Logo / Brand */}
                        <div className="pointer-events-auto bg-paper border-2 border-ink shadow-neo px-4 py-2 font-sans font-medium text-xl uppercase tracking-tighter hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
                            <a href="#home">Hannes Prinsloo</a>
                        </div>

                        {/* Mobile Toggles (Visible only on mobile) */}
                        <div className="md:hidden flex flex-col gap-2 items-end pointer-events-auto">
                            {/* Burger Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="border-2 border-ink shadow-neo px-3 py-2 flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group bg-paper text-ink"
                                aria-label="Toggle Mobile Menu"
                            >
                                <span className="flex items-center justify-center w-5 h-5 relative">
                                    {/* Animated Burger/X Icon */}
                                    <span className={`absolute h-0.5 w-full bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 0' : '-translate-y-1.5'}`}></span>
                                    <span className={`absolute h-0.5 w-full bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                    <span className={`absolute h-0.5 w-full bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 0' : 'translate-y-1.5'}`}></span>
                                </span>
                            </button>

                            {/* Theme Toggle */}
                            <button
                                onClick={handleThemeToggle}
                                className="border-2 border-ink shadow-neo px-3 py-2 flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group bg-paper text-ink"
                                aria-label="Toggle Theme"
                            >
                                <span className="flex items-center justify-center w-5 h-5">
                                    {themeClickCount === 3 ? (
                                        <span className="text-xl leading-none">🦄</span>
                                    ) : (isDarkMode) ? (
                                        <svg viewBox="0 0 20 20" className="w-full h-full">
                                            <path fill="var(--color-acid)" d="M13.23,1.53l-.82,5.35,4.97-2.14c.2-.09.37.17.22.32l-3.81,3.84,5.28,1.19c.21.05.2.35-.01.39l-5.34.87,3.57,4.07c.14.16-.04.4-.24.31l-4.83-2.44.5,5.39c.02.22-.27.3-.37.11l-2.48-4.81-2.76,4.66c-.11.19-.4.08-.36-.13l.82-5.35-4.97,2.14c-.2.09-.37-.17-.22-.32l3.81-3.84-5.28-1.19c-.21-.05-.2-.35.01-.39l5.34-.87-3.57-4.07c-.14-.16.04-.4.24-.31l4.83,2.44-.5-5.39c-.02-.22.27-.3.37-.11l2.48,4.81,2.76-4.66c.11-.19.4-.08.36.13Z" />
                                        </svg>
                                    ) : (themeClickCount >= 4) ? (
                                        <svg viewBox="0 0 20 20" className="w-full h-full">
                                            <path fill="var(--color-ink)" d="M13.23,1.53l-.82,5.35,4.97-2.14c.2-.09.37.17.22.32l-3.81,3.84,5.28,1.19c.21.05.2.35-.01.39l-5.34.87,3.57,4.07c.14.16-.04.4-.24.31l-4.83-2.44.5,5.39c.02.22-.27.3-.37.11l-2.48-4.81-2.76,4.66c-.11.19-.4.08-.36-.13l.82-5.35-4.97,2.14c-.2.09-.37-.17-.22-.32l3.81-3.84-5.28-1.19c-.21-.05-.2-.35.01-.39l5.34-.87-3.57-4.07c-.14-.16.04-.4.24-.31l4.83,2.44-.5-5.39c-.02-.22.27-.3.37-.11l2.48,4.81,2.76-4.66c.11-.19.4-.08.36.13Z" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 20 20" className="w-full h-full">
                                            <path fill="var(--color-ink)" d="M15.15,17.04c-2.46-1.31-4.17-3.86-4.27-6.84-.1-2.98,1.43-5.64,3.79-7.12.3-.19.23-.65-.12-.74-.74-.19-1.52-.28-2.32-.26-4.56.16-8.11,4.08-7.76,8.67.31,4.19,3.86,7.47,8.06,7.45.9,0,1.76-.15,2.56-.42.34-.11.38-.58.06-.75Z" />
                                        </svg>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Nav Links (Desktop) */}
                    <div className="pointer-events-auto bg-paper border-2 border-ink shadow-neo px-6 py-2 hidden md:flex gap-8 font-bold uppercase text-sm tracking-widest">
                        <a href="#home" className={`transition-colors ${activeSection === 'home' ? 'text-gray-400 dark:text-acid' : 'hover:text-acid'}`}>Home</a>
                        <a href="#expertise" className={`transition-colors ${activeSection === 'expertise' ? 'text-gray-400 dark:text-acid' : 'hover:text-acid'}`}>Expertise</a>
                        <a href="#work" className={`transition-colors ${activeSection === 'work' ? 'text-gray-400 dark:text-acid' : 'hover:text-acid'}`}>Work</a>
                        <a href="#experience" className={`transition-colors ${activeSection === 'experience' ? 'text-gray-400 dark:text-acid' : 'hover:text-acid'}`}>Experience</a>
                        <a href="#footer_contact" className={`transition-colors ${activeSection === 'tech_stack' ? 'text-gray-400 dark:text-acid' : 'hover:text-acid'}`}>Contact</a>
                    </div>

                    {/* Toggles Container (Desktop) */}
                    <div className="hidden md:flex flex-col gap-2 items-end pointer-events-auto w-48 z-10">
                        {/* Audio Tour / Director's Cut Toggle */}
                        <div className={`flex flex-col items-end w-full relative transition-all ${isAudioEnabled ? 'shadow-neo' : 'shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}>
                            <button
                                onClick={toggleAudioEnabled}
                                {...audioTooltipTriggerProps}
                                className={`w-full bg-paper border-2 px-4 py-2 flex items-center gap-3 justify-between transition-none ${isAudioLoading ? 'border-acid animate-pulse' : 'border-ink'} relative z-20`}
                                disabled={isAudioLoading}
                            >
                                <span className="text-sm font-bold uppercase tracking-widest text-ink">
                                    {isAudioLoading ? 'LOADING...' : 'AUDIO TOUR'}
                                </span>
                                <div className={`w-4 h-4 border-2 border-ink rounded-full flex-shrink-0 transition-colors ${isAudioEnabled ? (isDarkMode ? 'bg-acid' : 'bg-ink') : 'bg-transparent'}`}></div>
                            </button>

                            {/* Tooltip — appears below the button after 1 second of hovering */}
                            {showAudioTooltip && (
                                <div
                                    {...audioTooltipProps}
                                    className="
                                        absolute top-full right-0 mt-2 z-30
                                        bg-paper border-2 border-ink shadow-neo
                                        px-3 py-2 text-xs font-mono text-ink w-48
                                        animate-tooltip-fade-in pointer-events-none
                                    "
                                >
                                    Enable a guided audio experience based on where you scroll
                                </div>
                            )}

                            {/* Neo-brutalist Volume Slider Dropdown */}
                            <div className={`w-full overflow-hidden transition-all duration-300 origin-top flex flex-col items-center bg-surface-muted border-ink ${isAudioEnabled ? 'max-h-20 border-x-2 border-b-2 mt-[-2px]' : 'max-h-0 border-0'}`}>
                                <div className="w-full p-3 flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-ink/70">VOL</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={masterVolume}
                                        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                                        className="w-full appearance-none h-4 bg-halftone border-2 border-ink cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-acid [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:rounded-none"
                                        title="Master Volume"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={handleThemeToggle}
                            className="bg-paper border-2 border-ink shadow-neo px-4 py-2 flex items-center gap-3 justify-between hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
                        >
                            <span className="text-sm font-bold uppercase tracking-widest text-ink">
                                THEME
                            </span>
                            <span className="flex items-center justify-center w-5 h-5">
                                {themeClickCount === 3 ? (
                                    <span className="text-xl leading-none">🦄</span>
                                ) : (isDarkMode) ? (
                                    <svg viewBox="0 0 20 20" className="w-full h-full">
                                        <path fill="var(--color-acid)" d="M13.23,1.53l-.82,5.35,4.97-2.14c.2-.09.37.17.22.32l-3.81,3.84,5.28,1.19c.21.05.2.35-.01.39l-5.34.87,3.57,4.07c.14.16-.04.4-.24.31l-4.83-2.44.5,5.39c.02.22-.27.3-.37.11l-2.48-4.81-2.76,4.66c-.11.19-.4.08-.36-.13l.82-5.35-4.97,2.14c-.2.09-.37-.17-.22-.32l3.81-3.84-5.28-1.19c-.21-.05-.2-.35.01-.39l5.34-.87-3.57-4.07c-.14-.16.04-.4.24-.31l4.83,2.44-.5-5.39c-.02-.22.27-.3.37-.11l2.48,4.81,2.76-4.66c.11-.19.4-.08.36.13Z" />
                                    </svg>
                                ) : (themeClickCount >= 4) ? (
                                    <svg viewBox="0 0 20 20" className="w-full h-full">
                                        <path fill="var(--color-ink)" d="M13.23,1.53l-.82,5.35,4.97-2.14c.2-.09.37.17.22.32l-3.81,3.84,5.28,1.19c.21.05.2.35-.01.39l-5.34.87,3.57,4.07c.14.16-.04.4-.24.31l-4.83-2.44.5,5.39c.02.22-.27.3-.37.11l-2.48-4.81-2.76,4.66c-.11.19-.4.08-.36-.13l.82-5.35-4.97,2.14c-.2.09-.37-.17-.22-.32l3.81-3.84-5.28-1.19c-.21-.05-.2-.35.01-.39l5.34-.87-3.57-4.07c-.14-.16.04-.4.24-.31l4.83,2.44-.5-5.39c-.02-.22.27-.3.37-.11l2.48,4.81,2.76-4.66c.11-.19.4-.08.36.13Z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 20 20" className="w-full h-full">
                                        <path fill="var(--color-ink)" d="M15.15,17.04c-2.46-1.31-4.17-3.86-4.27-6.84-.1-2.98,1.43-5.64,3.79-7.12.3-.19.23-.65-.12-.74-.74-.19-1.52-.28-2.32-.26-4.56.16-8.11,4.08-7.76,8.67.31,4.19,3.86,7.47,8.06,7.45.9,0,1.76-.15,2.56-.42.34-.11.38-.58.06-.75Z" />
                                    </svg>
                                )}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`md:hidden absolute top-full left-4 right-4 mt-2 bg-paper border-4 border-ink shadow-[8px_8px_0px_0px_var(--color-ink)] transition-all duration-300 origin-top flex flex-col overflow-hidden ${isMobileMenuOpen ? 'scale-y-100 opacity-100 pointer-events-auto' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
                    <div className="p-6 flex flex-col gap-6">



                        {/* Navigation Links (Mobile) */}
                        <div className="flex flex-col gap-4 font-bold uppercase tracking-widest text-xl">
                            <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all border-b-2 border-ink/20 pb-2">Home</a>
                            <a href="#expertise" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all border-b-2 border-ink/20 pb-2">Expertise</a>
                            <a href="#work" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all border-b-2 border-ink/20 pb-2">Work</a>
                            <a href="#experience" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all border-b-2 border-ink/20 pb-2">Experience</a>
                            <a href="#footer_contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all pb-2">Contact</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* <GameModal /> */}
            <AudioControls disableSkip={showBackstory} />
            <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
            <FreelanceWorkModal isOpen={isFreelanceWorkModalOpen} onClose={() => setIsFreelanceWorkModalOpen(false)} />
            <FreeCodeCampModal isOpen={isFreeCodeCampModalOpen} onClose={() => setIsFreeCodeCampModalOpen(false)} projectTitle={activeFreeCodeCampProject} />

            {/* Main Content Container */}
            <main className="max-w-5xl mx-auto mt-32 md:mt-48 pb-20">

                {/* Hero Section */}
                <section id="home" className="mb-32 relative scroll-mt-48">
                    <div className="absolute -left-10 -top-10 w-20 h-20 border-l-4 border-t-4 border-ink opacity-20 hidden md:block"></div>

                    <div className="grid grid-cols-12 gap-8 md:gap-12 items-center">
                        {/* Left Column: Text Content */}
                        <div className="col-span-12 md:col-span-7">
                            {themeClickCount >= 4 ? (
                                <>
                                    <h1 className="text-6xl md:text-8xl font-medium leading-[0.85] mb-8 tracking-tighter mix-blend-multiply dark:mix-blend-normal fun:mix-blend-normal">
                                        Surprise!
                                    </h1>

                                    <p className="text-lg md:text-xl max-w-2xl leading-relaxed border-l-4 border-acid pl-6 italic mb-8">
                                        I knew you couldn't resist playing with that button! Flashing lights, unicorn hats, a really cool bald guy and <i>Comic, Sans the comedy</i> (where the designers at?). <br />I hope this makes someone chuckle.<br /> I've wasted so much time on this.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-6xl md:text-8xl font-medium leading-[0.85] mb-8 tracking-tighter mix-blend-multiply dark:mix-blend-normal fun:mix-blend-normal">
                                        Full Stack <br />
                                        <span>Developer</span>
                                    </h1>

                                    <p className="text-lg md:text-xl max-w-2xl leading-relaxed border-l-4 border-acid pl-6 italic mb-8">
                                        I am a self-taught Full Stack Developer and freelancer, currently studying for a Computer Science degree. I am also a professional gigging musician and music teacher looking to move into a career in tech.
                                    </p>
                                </>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <button
                                    onClick={() => setShowBackstory(true)}
                                    className="inline-block bg-paper text-ink px-6 py-3 font-medium uppercase border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                >
                                    My Background: Artist to Engineer
                                </button>

                                {/* <button
                                    onClick={() => openGameModal()}
                                    className="inline-block bg-acid text-ink px-6 py-3 font-medium uppercase border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span>Play The Journey</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                                </button> */}
                            </div>
                        </div>

                        {/* Right Column: Dynamic Illustration Placeholder */}
                        <div className="col-span-12 md:col-span-5 w-full flex justify-center">
                            <div className="w-full max-w-sm aspect-[4/5] flex items-center justify-center relative overflow-hidden">

                                {/* Light Mode Illustration */}
                                {!isDarkMode && themeClickCount < 4 && (
                                    <img key="light" src="/assets/hero-light.webp" alt="Light Mode Hero" className="absolute inset-0 w-full h-full object-contain animate-fade-in" />
                                )}

                                {/* Dark Mode Illustration */}
                                {isDarkMode && themeClickCount < 4 && (
                                    <img key="dark" src="/assets/hero-dark.webp" alt="Dark Mode Hero" className="absolute inset-0 w-full h-full object-contain animate-fade-in" />
                                )}

                                {/* Fun Mode: Pre-mount invisible on 3, show and animate on 4+ */}
                                {themeClickCount >= 3 && (
                                    <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${themeClickCount >= 4 ? 'opacity-100 z-10 animate-fade-in' : 'opacity-0 -z-10 pointer-events-none'}`}>
                                        <DotLottieReact
                                            src="/assets/fun-mode-animation.lottie"
                                            loop
                                            autoplay={false}
                                            dotLottieRefCallback={setDotLottie}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Expertise Section */}
                <section id="expertise" className="mb-32 scroll-mt-32">
                    <h2 className="text-4xl font-medium mb-12 flex items-center gap-4">
                        <span className="w-8 h-8 bg-acid border-2 border-ink block"></span>
                        My Expertise
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: The Stack */}
                        <div className="border-2 border-ink p-6 bg-surface shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col h-full">
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Full Stack <br />Architecture</h3>
                            <p className="text-sm mb-6 leading-relaxed">
                                Building end-to-end applications with a focus on the modern React ecosystem. Capable of developing both interactive user interfaces and the backend services that support them.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {['React', 'Zustand', 'JavaScript/TypeScript', 'Tailwind', 'Node.js', 'PostgreSQL', 'Express'].map(t => (
                                    <span key={t} className="text-xs font-bold border border-ink px-1 bg-surface-muted">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Card 2: CS & Foundations */}
                        <div className="border-2 border-ink p-6 bg-surface shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col h-full">
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Computer Science <br />& Foundations</h3>
                            <p className="text-sm mb-6 leading-relaxed">
                                Combining a practical grasp of modern web technologies with a solid foundation in core computing principles and database management.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {['JavaScript/TypeScript', 'C/C++', 'SQL (PostgreSQL)', 'Data Structures and  Algorithms'].map(t => (
                                    <span key={t} className="text-xs font-bold border border-ink px-1 bg-surface-muted">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Card 3: Freelance & CMS */}
                        <div className="border-2 border-ink p-6 bg-surface shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col h-full">
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Freelance <br />& CMS</h3>
                            <p className="text-sm mb-6 leading-relaxed">
                                Delivering functional, user-friendly websites for freelance clients while working closely with designers. Experienced in configuring CMS platforms and enhancing core functionality through targeted custom JS and CSS.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {['WordPress', 'Elementor Pro', 'Custom CSS/JS', 'Client Relations'].map(t => (
                                    <span key={t} className="text-xs font-bold border border-ink px-1 bg-surface-muted">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Education List */}
                    <div className="mt-12 border-2 border-ink p-6 bg-surface shadow-neo">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-ink"></div>
                            Education
                        </h3>

                        {/* Formal Education Highlights */}
                        <div className="mb-8 pb-8 border-b-2 border-ink border-dashed">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-medium border-b border-ink mb-3 pb-1">University of South Africa (UNISA)</h4>
                                    <p className="text-sm">Bachelor of Science in Computing — <span className="font-bold bg-acid px-1">Current</span></p>
                                </div>
                                <div>
                                    <h4 className="font-medium border-b border-ink mb-3 pb-1">Hoërskool Wonderfontein, Carletonville</h4>
                                    <p className="text-sm">Matriculated Dux Learner and Head Boy — 2012</p>
                                </div>
                            </div>
                        </div>

                        {/* Web Dev Certifications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-ink border-dashed">
                            {/* University of Michigan */}
                            <div>
                                <h4 className="font-medium border-b border-ink mb-3 pb-1">University of Michigan (Coursera)</h4>
                                <ul className="list-none space-y-2 text-sm">
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-ink font-bold">»</span>
                                        <a
                                            href="https://coursera.org/share/076eec0f1de2136d9806fd99763d8c83"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Interactivity with JavaScript
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-ink font-bold">»</span>
                                        <a
                                            href="https://coursera.org/share/bd82982683be5bfbd25d4f4d2bacca0f"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Introduction to CSS3
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-ink font-bold">»</span>
                                        <a
                                            href="https://coursera.org/share/a6daf21511a46339492d40238f7dbbd9"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Introduction to HTML5
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* freeCodeCamp */}
                            <div>
                                <h4 className="font-medium border-b border-ink mb-3 pb-1">freeCodeCamp</h4>
                                <ul className="list-none space-y-2 text-sm">
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-ink font-bold">»</span>
                                        <a
                                            href="https://www.freecodecamp.org/certification/hannesprinsloo/javascript-algorithms-and-data-structures-v8"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            JavaScript Algorithms & Data Structures (300 hours)
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-ink font-bold">»</span>
                                        <a
                                            href="https://www.freecodecamp.org/certification/hannesprinsloo/responsive-web-design"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Responsive Web Design (300 hours)
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-ink font-bold">»</span>
                                        <a
                                            href="https://www.freecodecamp.org/certification/hannesprinsloo/front-end-development-libraries"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Front End Development Libraries (300 hours)
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* CS50 Highlight */}
                        <div>
                            <h4 className="font-medium border-b border-ink mb-3 pb-1">Harvard CS50: Introduction to Computer Science</h4>
                            <p className="text-sm opacity-80 mb-2 italic">Completed Weeks 0 to 5.</p>
                            <p className="text-sm">
                                <span className="font-bold opacity-70 uppercase tracking-widest text-[10px] mr-2">Covered:</span>
                                Scratch, C, Arrays, Algorithms, Memory, Data Structures.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Projects */}
                <section id="work" className="mb-32 scroll-mt-32">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-1 bg-ink flex-grow"></div>
                        <h2 className="text-2xl font-bold uppercase bg-ink text-paper px-4 py-1 rotate-2">
                            Projects
                        </h2>
                        <div className="h-1 bg-ink flex-grow"></div>
                    </div>

                    {/* Cassette Tape / Module Card - Music School Manager */}
                    <div className="border-2 border-ink shadow-neo bg-surface p-2 relative group hover:bg-acid transition-colors duration-0 mb-12">
                        {/* The "Label" */}
                        <div className="border border-ink dark:group-hover:border-surface-muted p-6 md:p-10 flex flex-col md:flex-row gap-10 bg-paper group-hover:bg-surface transition-colors h-full">

                            {/* Visual Side */}
                            <div className="w-full md:w-1/2 aspect-video border-2 border-ink bg-surface-muted relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-300">
                                {/* Abstract Lines / Screenprint Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,var(--color-ink)_1px,transparent_1px)] bg-[length:10px_10px] opacity-10"></div>
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="w-full h-full border-2 border-dashed border-ink flex items-center justify-center">
                                        <span className="font-sans font-bold text-4xl opacity-20 transform -rotate-12">PREVIEW</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="w-full md:w-1/2 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-3xl font-black uppercase leading-none">Music School<br />Manager</h3>
                                        <span className="border border-ink px-2 py-1 text-xs font-bold bg-acid text-black">v1.0-alpha</span>
                                    </div>
                                    <p className="text-sm mb-6 border-l-2 border-ink pl-4">
                                        A comprehensive CRM for managing students, scheduling, and billing.
                                        Built for high-volume data handling and reliability.
                                    </p>

                                    {/* Tech Tags */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {['TypeScript', 'React', 'React Query', 'Zustand', 'Node / Express', 'Tailwind', 'JWT Auth', 'PostgreSQL'].map(tech => (
                                            <span key={tech} className="text-xs font-bold uppercase border border-ink px-2 py-1 hover:bg-ink hover:text-paper cursor-default transition-colors">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => setIsProjectModalOpen(true)}
                                    className="block w-full bg-ink text-paper text-center font-bold uppercase py-4 border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink hover:shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                >
                                    View Project Case Study
                                </button>
                            </div>
                        </div>

                        {/* Decor: Screws */}
                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                    </div>

                    {/* freeCodeCamp Projects Card */}
                    <div className="border-2 border-ink shadow-neo bg-surface p-2 relative group hover:bg-acid transition-colors duration-0 mt-12">
                        {/* The "Label" */}
                        <div className="border border-ink dark:group-hover:border-surface-muted p-6 md:p-10 flex flex-col bg-paper group-hover:bg-surface transition-colors h-full">

                            <div className="flex flex-col md:flex-row gap-10">
                                {/* Visual Side - Conditional visibility based on expansion */}
                                <div className={`aspect-video border-2 border-ink bg-surface-muted relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 ease-in-out origin-left ${isFreeCodeCampExpanded ? 'w-0 opacity-0 overflow-hidden border-0 !p-0 max-h-0 md:max-h-full' : 'w-full md:w-1/2 opacity-100 max-h-[1000px]'}`}>
                                    {/* Abstract Lines / Screenprint Effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,var(--color-ink)_1px,transparent_1px)] bg-[length:10px_10px] opacity-10 min-w-[300px]"></div>
                                    <div className="absolute inset-0 flex items-center justify-center p-8 min-w-[300px]">
                                        <div className="w-full h-full border-2 border-dashed border-ink flex items-center justify-center p-4 text-center">
                                            <span className="font-sans font-bold text-4xl opacity-20 transform -rotate-12 whitespace-nowrap">CERTIFICATION PROJECTS</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Side */}
                                <div className={`flex flex-col justify-between transition-all duration-500 ease-in-out ${isFreeCodeCampExpanded ? 'w-full' : 'w-full md:w-1/2'}`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-3xl font-black uppercase leading-none">freeCodeCamp<br />Projects</h3>
                                            <span className="border border-ink px-2 py-1 text-xs font-bold bg-acid text-black">v1.0</span>
                                        </div>
                                        <p className="text-sm mb-6 border-l-2 border-ink pl-4">
                                            A selection of functional projects built during my <a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer" className="font-bold hover:bg-acid hover:text-ink cursor-default transition-colors">freeCodeCamp</a> self-study to gain certification.
                                        </p>

                                        {/* Tech Tags */}
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {['React', 'JavaScript', 'CSS', 'APIs'].map(tech => (
                                                <span key={tech} className="text-xs font-bold uppercase border border-ink px-2 py-1 hover:bg-ink hover:text-paper cursor-default transition-colors">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button - Moved outside the collapsible area */}
                            <button
                                onClick={() => setIsFreeCodeCampExpanded(!isFreeCodeCampExpanded)}
                                className={`block w-full bg-ink text-paper text-center font-bold uppercase py-4 border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink hover:shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 ${isFreeCodeCampExpanded ? 'mt-0' : 'mt-10'}`}
                            >
                                <span>{isFreeCodeCampExpanded ? 'Hide Projects' : 'View Projects'}</span>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className={`w-5 h-5 transition-transform duration-300 ${isFreeCodeCampExpanded ? 'rotate-180' : ''}`}
                                >
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Expanded List View */}
                            <div className={`transition-all duration-500 overflow-hidden flex flex-col ${isFreeCodeCampExpanded ? 'max-h-[3000px] opacity-100 mt-10 border-t-2 border-ink pt-10' : 'max-h-0 opacity-0 mt-0 pt-0'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { title: 'JavaScript Calculator', tech: 'React + JS', thumbnail: '/assets/js-calculator.JPG' },
                                        { title: 'Pokemon Search App', tech: 'Pure JS + API', thumbnail: '/assets/pokemon-search-app.jpeg' },
                                        { title: 'Pomodoro Timer', tech: 'React + JS', thumbnail: '/assets/pomodoro-timer.jpeg' },
                                        { title: 'Random Nietzsche', tech: 'React + JS', thumbnail: '/assets/random-nietzsche.jpeg' },
                                        { title: 'Drum Machine', tech: 'React + JS', thumbnail: '/assets/drum-machine.jpeg' },
                                        { title: 'Roman Numeral Converter', tech: 'React + JS', thumbnail: '/assets/roman-numeral-converter.jpeg' }
                                    ].map((project, index) => (
                                        <div key={index} className="border-2 border-ink bg-surface-muted flex flex-col shadow-neo hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                                            <div className="aspect-video bg-ink border-b-2 border-ink relative overflow-hidden group/thumb">
                                                <img src={project.thumbnail} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-ink/0 group-hover/thumb:bg-ink/20 transition-colors" />
                                            </div>
                                            <div className="p-4 flex flex-col flex-grow bg-paper">
                                                <h4 className="font-bold text-lg uppercase mb-2">{project.title}</h4>
                                                <span className="text-xs font-mono border border-ink px-2 py-1 self-start mb-4 bg-acid/20">{project.tech}</span>
                                                <button
                                                    onClick={() => {
                                                        setActiveFreeCodeCampProject(project.title);
                                                        setIsFreeCodeCampModalOpen(true);
                                                    }}
                                                    className="mt-auto block w-full bg-surface text-ink text-center font-bold uppercase py-2 border-2 border-ink hover:bg-ink hover:text-paper hover:shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                                >
                                                    Try It
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Decor: Screws */}
                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                    </div>

                    {/* Freelance Work Card */}
                    <div className="border-2 border-ink shadow-neo bg-surface p-2 relative group hover:bg-acid transition-colors duration-0 mt-12">
                        {/* The "Label" */}
                        <div className="border border-ink dark:group-hover:border-surface-muted p-6 md:p-10 flex flex-col md:flex-row gap-10 bg-paper group-hover:bg-surface transition-colors h-full">

                            {/* Visual Side */}
                            <div className="w-full md:w-1/2 aspect-video border-2 border-ink bg-surface-muted relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-300">
                                {/* Abstract Lines / Screenprint Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,var(--color-ink)_1px,transparent_1px)] bg-[length:10px_10px] opacity-10"></div>
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="w-full h-full border-2 border-dashed border-ink flex items-center justify-center">
                                        <span className="font-sans font-bold text-4xl opacity-20 transform -rotate-12">COMING SOON</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="w-full md:w-1/2 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-3xl font-black uppercase leading-none">Freelance<br />Work</h3>
                                        <span className="border border-ink px-2 py-1 text-xs font-bold bg-acid text-black">v1.0</span>
                                    </div>
                                    <p className="text-sm mb-6 border-l-2 border-ink pl-4">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                                    </p>

                                    {/* Tech Tags */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {['React', 'TypeScript', 'Tailwind', '...'].map(tech => (
                                            <span key={tech} className="text-xs font-bold uppercase border border-ink px-2 py-1 hover:bg-ink hover:text-paper cursor-default transition-colors">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => setIsFreelanceWorkModalOpen(true)}
                                    className="block w-full bg-ink text-paper text-center font-bold uppercase py-4 border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink hover:shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                >
                                    View Projects
                                </button>
                            </div>
                        </div>


                        {/* Decor: Screws */}
                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                    </div>

                </section>


                {/* Experience Section */}
                <section id="experience" className="mb-32 scroll-mt-32">
                    <h2 className="text-4xl font-medium mb-12 flex items-center gap-4">
                        <span className="w-8 h-8 bg-acid border-2 border-ink block"></span>
                        Experience
                    </h2>
                    <div className="border-l-4 border-ink pl-8 space-y-12 relative">
                        {/* Timeline Item 1 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-[#f4f4f0] dark:bg-[#1A1A1A] rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Freelance Web Developer</h3>
                            <span className="text-sm font-mono opacity-70 mb-4 block bg-surface-muted inline-block px-2">2023 - Present</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                Having never advertised my services, I have only had word-of-mouth clients. All of this paid client work has been done using WordPress and relied heavily on custom styling (raw CSS) and custom JavaScript. The sites range from bespoke designed wedding invitation websites to online stores and one national butchery chain with more than 90 stores.
                            </p>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-[#f4f4f0] dark:bg-[#1A1A1A] rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Professional Musician</h3>
                            <span className="text-sm font-mono opacity-70 mb-4 block bg-surface-muted inline-block px-2">2013 - Present</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                Pubs, restaurants, malls, corporate events, weddings, private functions. If you can imagine someone hiring a live musician to perform there, I've probably done it. I've walked into a church with my guitar and a wireless mic singing "Somewhere Over The Rainbow" before the bride walked in.
                                <br />I also did the technical side of events - provided and mixed sound for artists, bands and functions, done MC work, hosted open mics and booked other acts for venues.
                            </p>
                        </div>
                        {/* Timeline Item 3 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-[#f4f4f0] dark:bg-[#1A1A1A] rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Music Teacher</h3>
                            <span className="text-sm font-mono opacity-70 mb-4 block bg-surface-muted inline-block px-2">February 2024 - Present</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                I have taught musical improvisation and musicality lessons to adults on and off for my whole music career, but this was nearly always to already capable musicians. In 2024 I took an official job as a music teacher to kids from various Primary Schools in Centurion. The amount of students vary, but I usually have between 30 and 40 students on my roster any given month.
                                <br />I mainly teach guitar and the accompanying music theory, but I also teach my more advanced students Jazz style improvisation with different styles of music and musicality.
                            </p>
                        </div>
                        {/* Timeline Item 4 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-[#f4f4f0] dark:bg-[#1A1A1A] rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Head Foreman at UniSigns - Signage company</h3>
                            <span className="text-sm font-mono opacity-70 mb-4 block bg-surface-muted inline-block px-2">November 2022 - August 2023</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                I was responsible for managing the production workshop of a busy signage company, as well as liasing with clients for measurement, discovery, quality control and hands-on oversight on-site during installations - that included operating heavy machinery and working at heights. This role had me travelling all over South Africa to manage teams on-site. I was responsible for quality of the product delivered as well as the safety of the team. We did work for large companies that included Suzuki, WeBuyCars, OBC and many more.
                                <br />
                            </p>
                        </div>
                        {/* Timeline Item 5 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-[#f4f4f0] dark:bg-[#1A1A1A] rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Warehouse Manager at Vassco Distribution</h3>
                            <span className="text-sm font-mono opacity-70 mb-4 block bg-surface-muted inline-block px-2">March 2021 - October 2022</span>
                            <div className="max-w-2xl text-sm">
                                <p className="leading-relaxed mb-4">This role was extremely broad in its scope and required working between 60 to 80 hours per week. We were a team of between 4 and 6 managers with differing responsibilities. This resulted in a high manager turnover because of the demanding nature of the job.
                                    <br /><br />My responsibilities included:
                                </p>

                                <details className="group/details">
                                    <summary className="cursor-pointer font-bold uppercase tracking-widest text-xs border-2 border-ink inline-block px-3 py-2 bg-surface hover:bg-acid hover:text-black shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all select-none focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 mb-4">
                                        <span className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-open/details:rotate-90 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            Details
                                        </span>
                                    </summary>
                                    <ul className="space-y-3 pl-2 border-l-2 border-ink ml-2 mt-2">
                                        <li className="flex items-start gap-3 pl-2">
                                            <span className="text-ink font-bold translate-y-0.5">»</span>
                                            <span className="leading-relaxed">Capturing and checking attendance of more than 100 employees daily. This was done manually at the beginning and end of each shift and shared with the HR department.</span>
                                        </li>
                                        <li className="flex items-start gap-3 pl-2">
                                            <span className="text-ink font-bold translate-y-0.5">»</span>
                                            <span className="leading-relaxed">Manually checking the stock being loaded onto trucks that went to our hundreds of clients all over Guateng and surrounding areas. This required intimate knowledge of over 4000 products ranging from cleaning products, packaging to frozen food, canned goods and an extensive range of liquor.</span>
                                        </li>
                                        <li className="flex items-start gap-3 pl-2">
                                            <span className="text-ink font-bold translate-y-0.5">»</span>
                                            <span className="leading-relaxed">Handling the cash-up procedure where I had to ensure COD clients' cash was correctly received by our staff and that these funds were allocated correctly. I regularly had to take responsibility for handling large sums of cash (anywhere between R50,000 to R150,000 on a given day with almost no allowable margin of error).</span>
                                        </li>
                                        <li className="flex items-start gap-3 pl-2">
                                            <span className="text-ink font-bold translate-y-0.5">»</span>
                                            <span className="leading-relaxed">Cash-up included also checking EFT client's proofs of payment, ensuring all returns (including deposit items such as empty kegs), breakages and customer complaints were dealt with and resolved as soon as possible.</span>
                                        </li>
                                        <li className="flex items-start gap-3 pl-2">
                                            <span className="text-ink font-bold translate-y-0.5">»</span>
                                            <span className="leading-relaxed">General warehouse responsibilities such as searching staff, stock take, investigating stock discrepancies, checking stock rotation (especially frozen and perishable stock).</span>
                                        </li>
                                        <li className="flex items-start gap-3 pl-2">
                                            <span className="text-ink font-bold translate-y-0.5">»</span>
                                            <span className="leading-relaxed">Order processing (Ultisales system) from client's email orders and over the phone, dealing with client requests and making and ensuring (with the General Manager) that routes are correctly loaded, written and efficiently delivered.</span>
                                        </li>
                                        <li className="flex items-start gap-3 pl-2">
                                            <span className="text-ink font-bold translate-y-0.5">»</span>
                                            <span className="leading-relaxed">Checking in trucks that come back from routes.</span>
                                        </li>
                                    </ul>
                                </details>
                            </div>
                        </div>
                        {/* Timeline Item 6 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-[#f4f4f0] dark:bg-[#1A1A1A] rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Other Jobs</h3>
                            <span className="text-sm font-mono opacity-70 mb-4 block bg-surface-muted inline-block px-2">January 2013 - February 2021</span>
                            <div className="max-w-2xl text-sm">
                                <p className="leading-relaxed mb-4">
                                    For a full list of the jobs that I had over the years as well as references for these jobs, feel free to <a href="#footer_contact" className="text-ink font-bold hover:underline">reach out</a> to me for a comprehensive Curriculim Vitae.<br />
                                    <br />Some notable jobs I had include:
                                </p>
                                <ul className="space-y-3 pl-2">
                                    <li className="flex items-start gap-3">
                                        <span className="text-ink font-bold translate-y-0.5">»</span>
                                        <span className="leading-relaxed">Managed restaurants and bars (and one live music venue) both in Pretoria and Hermanus (Western Cape). The experience in hospitality is how I got the job at Vassco, whose main clients are restaurants and bars.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-ink font-bold translate-y-0.5">»</span>
                                        <span className="leading-relaxed">Waitering and bartending.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-ink font-bold translate-y-0.5">»</span>
                                        <span className="leading-relaxed">Brief stint as a High School English teacher at my old high school, <br />Hoërskool Wonderfontein. Interesting story there.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-ink font-bold translate-y-0.5">»</span>
                                        <span className="leading-relaxed">Investment Art Salesman.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-ink font-bold translate-y-0.5">»</span>
                                        <span className="leading-relaxed">Youth Pastor at a church in Carletonville.</span>
                                    </li>
                                </ul>
                                <br />
                                <p className="leading-relaxed">This list is not exhaustive, but it gives you an idea of <br />the different things I've done.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech Stack Grid */}
                <section id="tech_stack">
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                        <span className="w-4 h-4 bg-acid border border-ink inline-block"></span>
                        Technical Arsenal
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['TypeScript', 'React', 'Redux', 'Zustand', 'Node.js', 'Express', 'PostgreSQL', 'WordPress', 'Elementor Pro', 'HTML', 'CSS', 'Tailwind', 'Vite', 'Git', 'Vercel', 'Render', 'Supabase', 'Figma', 'Designer-Speak', 'Client Relations'].map((tool, i) => (
                            <div key={tool} className="border-2 border-ink p-4 hover:shadow-neo hover:bg-surface transition-all cursor-default">
                                <div className="text-xs opacity-60 mb-1">0{i + 1}</div>
                                <div className="font-bold uppercase">{tool}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer
                    id="footer_contact"
                    className="mt-32 pt-10 border-t-4 border-ink flex flex-col gap-8 md:gap-16 scroll-mt-32 w-full relative"
                    onMouseEnter={() => {
                        if (isAudioEnabled && !hasTriggeredFooterAudio) {
                            playSegment('footer_offer');
                            setHasTriggeredFooterAudio(true);

                            // Delay appearance slightly
                            setTimeout(() => setShowCopyButton(true), 500);

                            // Let the acid background show for the 5s audio duration, then snap to regular styling
                            // Reduced from 2000 to 2500 to account for 500ms appearance delay
                            setTimeout(() => {
                                setCopyAnimationFinished(true);
                            }, 2500);
                        }
                    }}
                    onTouchStart={() => {
                        if (isAudioEnabled && !hasTriggeredFooterAudio) {
                            playSegment('footer_offer');
                            setHasTriggeredFooterAudio(true);

                            setTimeout(() => setShowCopyButton(true), 500);

                            setTimeout(() => {
                                setCopyAnimationFinished(true);
                            }, 2500);
                        }
                    }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-8 w-full">
                        {/* Brand */}
                        <div className="flex-shrink-0">
                            <div className="text-6xl md:text-8xl font-black text-transparent leading-none" style={{ WebkitTextStroke: '2px var(--color-ink)' }}>HP_DEV</div>
                        </div>

                        {/* Contact Info & Button Stacked Vertically */}
                        <div className="flex flex-col items-start md:items-end gap-14 md:gap-6 w-full md:w-auto font-mono text-ink">

                            {/* Action Button (Original Style) */}
                            <a
                                href="mailto:johannespprinsloo@gmail.com"
                                className="w-full md:w-auto bg-paper text-ink border-2 border-ink px-6 py-4 font-bold uppercase transition-all shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none text-center"
                            >
                                Send me a mail
                            </a>

                            {/* Text Group */}
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-sm text-left relative">

                                <div className="flex flex-col relative w-full md:w-auto">
                                    <span className="mb-1 uppercase tracking-widest opacity-80 font-bold">Number:</span>

                                    {/* Animated Copy Button */}
                                    {showCopyButton && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText('079 765 9596');
                                                setCopyText("COPIED!");
                                                setTimeout(() => setCopyText("Copy Number to Clipboard"), 2000);
                                            }}
                                            className={`
                                                absolute -top-12 left-0 md:left-auto md:right-0 whitespace-nowrap px-3 py-1 text-xs font-bold uppercase transition-all duration-700 w-full md:w-auto
                                                ${copyAnimationFinished
                                                    ? 'bg-paper text-ink border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none translate-x-0 translate-y-0'
                                                    : 'bg-acid text-ink border-2 border-ink shadow-none translate-x-1 translate-y-1'
                                                }
                                            `}
                                        >
                                            {copyText}
                                        </button>
                                    )}

                                    <span className="leading-snug">
                                        079 765 9596
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="mb-1 uppercase tracking-widest opacity-80 font-bold">Email:</span>
                                    <span>johannespprinsloo@gmail.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Credits & Copyright */}
                    <div className="mt-16 pt-8 border-t-2 border-ink/20 flex flex-col items-center pb-8 text-center text-sm font-mono w-full">
                        <div className="flex flex-col gap-2">
                            <span className="font-bold uppercase tracking-widest">Developed, written and performed by Hannes Prinsloo</span>
                            <span className="opacity-60 text-xs">© 2026 Hannes Prinsloo</span>
                            <span className="opacity-40 hover:opacity-80 transition-opacity cursor-default text-[10px] mt-1 italic">i also played the guitar you hear in the background music</span>
                        </div>
                    </div>
                </footer>

            </main>
        </div >
    )
}

export default App
