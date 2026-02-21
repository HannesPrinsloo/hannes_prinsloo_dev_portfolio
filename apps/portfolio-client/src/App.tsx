import { useState, useEffect, useRef } from 'react'
import { useAudioStore } from './store/useAudioStore'
import { useAudioScrollTracker } from './hooks/useAudioScrollTracker'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import BackstoryModal from './components/BackstoryModal'

function App() {
    const isAudioEnabled = useAudioStore((state) => state.isAudioEnabled);
    const isAudioLoading = useAudioStore((state) => state.isAudioLoading);
    const toggleAudioEnabled = useAudioStore((state) => state.toggleAudioEnabled);
    const masterVolume = useAudioStore((state) => state.masterVolume);
    const setMasterVolume = useAudioStore((state) => state.setMasterVolume);

    useAudioScrollTracker();

    const [showBackstory, setShowBackstory] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [themeClickCount, setThemeClickCount] = useState(0);
    const [dotLottie, setDotLottie] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

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

            <BackstoryModal isOpen={showBackstory} onClose={() => setShowBackstory(false)} isDarkMode={isDarkMode} />

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
                        <a href="#home" className="hover:text-acid transition-colors">Home</a>
                        <a href="#expertise" className="hover:text-acid transition-colors">Expertise</a>
                        <a href="#work" className="hover:text-acid transition-colors">Work</a>
                        <a href="#experience" className="hover:text-acid transition-colors">Experience</a>
                        <a href="#contact_footer" className="hover:text-acid transition-colors">Contact</a>
                    </div>

                    {/* Toggles Container (Desktop) */}
                    <div className="hidden md:flex flex-col gap-2 items-end pointer-events-auto w-48 z-10">
                        {/* Audio Tour / Director's Cut Toggle */}
                        <div className={`flex flex-col items-end w-full relative transition-all ${isAudioEnabled ? 'shadow-neo' : 'shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}>
                            <button
                                onClick={toggleAudioEnabled}
                                className={`w-full bg-paper border-2 px-4 py-2 flex items-center gap-3 justify-between transition-none ${isAudioLoading ? 'border-acid animate-pulse' : 'border-ink'} relative z-20`}
                                disabled={isAudioLoading}
                            >
                                <span className="text-sm font-bold uppercase tracking-widest text-ink">
                                    {isAudioLoading ? 'LOADING...' : 'AUDIO TOUR'}
                                </span>
                                <div className={`w-4 h-4 border-2 border-ink rounded-full flex-shrink-0 transition-colors ${isAudioEnabled ? (isDarkMode ? 'bg-acid' : 'bg-ink') : 'bg-transparent'}`}></div>
                            </button>

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
                <div className={`md:hidden pointer-events-auto absolute top-full left-4 right-4 mt-2 bg-paper border-4 border-ink shadow-[8px_8px_0px_0px_var(--color-ink)] transition-all duration-300 origin-top flex flex-col overflow-hidden ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
                    <div className="p-6 flex flex-col gap-6">

                        {/* Audio Tour Toggle (Mobile) */}
                        <div className="border-b-4 border-ink pb-6 flex flex-col w-full relative">
                            <div className={`w-full relative transition-all ${isAudioEnabled ? 'shadow-neo' : 'shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none'}`}>
                                <button
                                    onClick={toggleAudioEnabled}
                                    className={`w-full bg-paper border-2 px-4 py-3 flex items-center justify-between transition-none ${isAudioLoading ? 'border-acid animate-pulse' : 'border-ink'} relative z-20`}
                                    disabled={isAudioLoading}
                                >
                                    <span className="text-base font-bold uppercase tracking-widest text-ink">
                                        {isAudioLoading ? 'LOADING...' : 'AUDIO TOUR'}
                                    </span>
                                    <div className={`w-5 h-5 border-2 border-ink rounded-full flex-shrink-0 transition-colors ${isAudioEnabled ? (isDarkMode ? 'bg-acid' : 'bg-ink') : 'bg-transparent'}`}></div>
                                </button>

                                {/* Neo-brutalist Volume Slider Dropdown (Mobile) */}
                                <div className={`w-full overflow-hidden transition-all duration-300 origin-top flex flex-col items-center bg-surface-muted ${isAudioEnabled ? 'max-h-20 border-x-2 border-b-2 border-ink mt-[-2px]' : 'max-h-0 border-0'}`}>
                                    <div className="w-full p-4 flex items-center gap-3">
                                        <span className="text-sm font-bold uppercase tracking-widest text-ink/70">VOL</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={masterVolume}
                                            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                                            className="w-full appearance-none h-5 bg-halftone border-2 border-ink cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:bg-acid [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:rounded-none"
                                            title="Master Volume"
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs mt-4 opacity-70 font-sans leading-tight">
                                Enable a guided audio experience based on where you scroll.
                            </p>
                        </div>

                        {/* Navigation Links (Mobile) */}
                        <div className="flex flex-col gap-4 font-bold uppercase tracking-widest text-xl">
                            <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all border-b-2 border-ink/20 pb-2">Home</a>
                            <a href="#expertise" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all border-b-2 border-ink/20 pb-2">Expertise</a>
                            <a href="#work" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all border-b-2 border-ink/20 pb-2">Work</a>
                            <a href="#experience" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all border-b-2 border-ink/20 pb-2">Experience</a>
                            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-acid hover:pl-2 transition-all pb-2">Contact</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Container */}
            <main className="max-w-5xl mx-auto mt-32 md:mt-48 pb-20">

                {/* Hero Section */}
                <section id="home" className="mb-32 relative scroll-mt-48">
                    <div className="absolute -left-10 -top-10 w-20 h-20 border-l-4 border-t-4 border-ink opacity-20 hidden md:block"></div>

                    <div className="grid grid-cols-12 gap-8 md:gap-12 items-center">
                        {/* Left Column: Text Content */}
                        <div className="col-span-12 md:col-span-7">
                            <h1 className="text-6xl md:text-8xl font-medium leading-[0.85] mb-8 tracking-tighter mix-blend-multiply dark:mix-blend-normal fun:mix-blend-normal">
                                Full Stack <br />
                                <span>Developer</span>
                            </h1>

                            <p className="text-lg md:text-xl max-w-2xl leading-relaxed border-l-4 border-acid pl-6 italic mb-8">
                                I am a self-taught Full Stack Developer and freelancer, currently studying for a Computer Science degree. I am also a professional gigging musician and music teacher looking to begin a fully fledged career in tech.
                            </p>

                            <button
                                onClick={() => setShowBackstory(true)}
                                className="inline-block bg-paper text-ink px-6 py-3 font-medium uppercase border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                                My Background: Artist to Engineer
                            </button>
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

                    {/* Certifications List */}
                    <div className="mt-12 border-2 border-ink p-6 bg-surface shadow-neo">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-ink"></div>
                            Certifications
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* University of Michigan */}
                            <div>
                                <h4 className="font-medium border-b border-ink mb-3 pb-1">University of Michigan (Coursera)</h4>
                                <ul className="list-none space-y-2 text-sm">
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-acid font-bold">»</span>
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
                                        <span className="text-acid font-bold">»</span>
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
                                        <span className="text-acid font-bold">»</span>
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
                                        <span className="text-acid font-bold">»</span>
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
                                        <span className="text-acid font-bold">»</span>
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
                                        <span className="text-acid font-bold">»</span>
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
                                        {['React', 'PostgreSQL', 'Node.js', 'Vite'].map(tech => (
                                            <span key={tech} className="text-xs font-bold uppercase border border-ink px-2 py-1 hover:bg-ink hover:text-paper cursor-default transition-colors">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <a
                                    href="https://demo.hannesprinsloo.dev"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-ink text-paper text-center font-bold uppercase py-4 border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink hover:shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                >
                                    Launch Demo Application
                                </a>
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

                    {/* Placeholder Project Card */}
                    <div className="border-2 border-ink shadow-neo bg-surface p-2 relative group hover:bg-acid transition-colors duration-0">
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
                                        <h3 className="text-3xl font-black uppercase leading-none">Another Cool<br />Project</h3>
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
                                <a
                                    href="#"
                                    className="block w-full bg-ink text-paper text-center font-bold uppercase py-4 border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink hover:shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none opacity-80 cursor-not-allowed"
                                >
                                    Work in Progress
                                </a>
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
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
                            </p>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-[#f4f4f0] dark:bg-[#1A1A1A] rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Professional Musician</h3>
                            <span className="text-sm font-mono opacity-70 mb-4 block bg-surface-muted inline-block px-2">2013 - Present</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Developing discipline, creativity, and the ability to perform under pressure.
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-[#f4f4f0] dark:bg-[#1A1A1A] rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Something or other</h3>
                            <span className="text-sm font-mono opacity-70 mb-4 block bg-surface-muted inline-block px-2">2013 - Present</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Developing discipline, creativity, and the ability to perform under pressure.
                            </p>
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
                        {['TypeScript', 'React', 'Redux', 'Zustand', 'Node.js', 'Express', 'PostgreSQL', 'WordPress', 'Elementor Pro', 'HTML', 'CSS', 'Tailwind', 'Vite', 'Git', 'Vercel', 'Render', 'Supabase', 'Figma', 'Designer-Speak'].map((tool, i) => (
                            <div key={tool} className="border-2 border-ink p-4 hover:shadow-neo hover:bg-surface transition-all cursor-default">
                                <div className="text-xs opacity-60 mb-1">0{i + 1}</div>
                                <div className="font-bold uppercase">{tool}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer id="footer_contact" className="mt-32 pt-10 border-t-4 border-ink flex flex-col md:flex-row justify-between items-start md:items-end gap-12 md:gap-8 scroll-mt-32">
                    {/* Brand */}
                    <div className="flex-shrink-0">
                        <div className="text-6xl md:text-8xl font-black text-transparent leading-none" style={{ WebkitTextStroke: '2px var(--color-ink)' }}>HP_DEV</div>
                    </div>

                    {/* Contact Info & Button Stacked Vertically */}
                    <div className="flex flex-col items-start md:items-end gap-6 w-full md:w-auto font-mono text-ink">

                        {/* Action Button (Original Style) */}
                        <a
                            href="mailto:johannespprinsloo@gmail.com"
                            className="w-full md:w-auto bg-paper text-ink border-2 border-ink px-6 py-4 font-bold uppercase hover:shadow-neo hover:-translate-y-1 transition-all shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none text-center"
                        >
                            Send me a mail
                        </a>

                        {/* Text Group */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-sm text-left">
                            <div className="flex flex-col">
                                <span className="mb-1 uppercase tracking-widest opacity-80 font-bold">Number:</span>
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
                </footer>

            </main>
        </div>
    )
}

export default App
