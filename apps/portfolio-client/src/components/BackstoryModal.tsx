import React, { useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { useAudioStore } from '../store/useAudioStore';
// import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface BackstoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    // isDarkMode?: boolean;
}

const BackstoryModal: React.FC<BackstoryModalProps> = ({ isOpen, onClose /*, isDarkMode*/ }) => {
    const playSegment = useAudioStore(state => state.playSegment);
    const fadeAndPause = useAudioStore(state => state.fadeAndPause);

    // const [shouldLoadLottie, setShouldLoadLottie] = useState(false);
    // const [showLottie, setShowLottie] = useState(false);
    // const [dotLottieDesktop, setDotLottieDesktop] = useState<any>(null);
    // const [dotLottieMobile, setDotLottieMobile] = useState<any>(null);

    // Lottie delayed loading logic
    /*
    useEffect(() => {
        let loadTimer: ReturnType<typeof setTimeout>;
        let showTimer: ReturnType<typeof setTimeout>;
        let playTimer: ReturnType<typeof setTimeout>;

        if (isOpen) {
            loadTimer = setTimeout(() => {
                setShouldLoadLottie(true);
            }, 100);

            showTimer = setTimeout(() => {
                setShowLottie(true);
            }, 1500);

            // Wait 2 seconds before asking the lottie to play, so typewriter finishes smoothly
            playTimer = setTimeout(() => {
                if (dotLottieDesktop) {
                    dotLottieDesktop.setLoop(3);
                    dotLottieDesktop.play();
                }
                // if (dotLottieMobile) {
                //     dotLottieMobile.setLoop(3);
                //     dotLottieMobile.play();
                // }
            }, 5000);

        } else {
            setShouldLoadLottie(false);
            setShowLottie(false);
            if (dotLottieDesktop) dotLottieDesktop.stop();
            // if (dotLottieMobile) dotLottieMobile.stop();
        }

        return () => {
            clearTimeout(loadTimer);
            clearTimeout(showTimer);
            clearTimeout(playTimer);
        };
    }, [isOpen, dotLottieDesktop]); //removed dotLottieMobile because of its exclusion, for now, from mobile
    */

    // Lock body scroll when modal is open and trigger audio
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            playSegment('backstory');
        } else {
            document.body.style.overflow = 'unset';
            fadeAndPause();
        }
        return () => {
            document.body.style.overflow = 'unset';
            // fadeAndPause();
        };
    }, [isOpen, playSegment, fadeAndPause]);

    const storyText = ` I started playing in bands at 16. My first gig was at a Carletonville biker bar, singing Metallica with a 16-year-old voice that had just broken. We sucked, and I was too nervous to play my guitar properly, but I was hooked. 
    
After high school, despite being dux learner and head boy, I chose this crazy dream over the safe route, promising myself I'd change course at 30 in the (let's be honest) likely event that the music didn't pan out.

For over a decade, I gigged all over South Africa. I shared stages with Valiant Swart, The South African Blues Society, The Black Cat Bones, Pedro Barbosa, and hundreds of other local musos. 

Coming from a working-class background, I funded the dream myself, working terrible hours as a bartender, restaurant manager, and warehouse manager. Eventually, I realized that the only real money for me in the music industry was probably in corporate gigs and functions - the kind of gigs that paid the bills, and they were fun enough, but never the dream. It was a gamble, but it was all worth it to give my music the shot it deserved. In early 2023, at 28, I saw 30 fast approaching and made the decision. I kept the promise I made to my 18-year-old self and pivoted to my other lifelong passion - software development.`;

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
                    <div className="border-b-4 border-ink pb-4 mb-6 relative">
                        <div className="md:pr-32">
                            <h2 className="text-2xl md:text-3xl font-bold uppercase leading-none mb-2">
                                My Background: <br /> Artist to Engineer
                            </h2>
                            <div className="font-mono text-sm flex gap-3 text-gray-500">
                                <span className="line-through decoration-2 decoration-ink text-ink opacity-50">2026-02-19</span>
                                <span className="text-ink font-bold">{currentDate}</span>
                            </div>
                        </div>

                        {/* Lottie Container - Desktop */}
                        {/* {shouldLoadLottie && (
                            <div className={`absolute top-0 right-0 hidden md:block w-50 h-50 -translate-y-2 transition-opacity duration-1000 ${showLottie ? 'opacity-100' : 'opacity-0'}`}>
                                <DotLottieReact
                                    src={isDarkMode ? '/assets/modal-animation-dark.lottie' : '/assets/modal-animation-light.lottie'}
                                    loop={false}
                                    autoplay={false}
                                    dotLottieRefCallback={setDotLottieDesktop}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )} */}
                    </div>

                    {/* Ruled Paper Body with Typewriter Text */}
                    <div className="flex-1 overflow-y-auto pr-4 font-mono text-sm md:text-base leading-relaxed relative bg-[linear-gradient(transparent_96%,var(--color-surface-muted)_96%)] bg-[size:100%_2rem]">
                        <p className="whitespace-pre-wrap">
                            {displayedText}
                            <span className={`inline-block w-2.5 h-5 bg-acid align-middle ml-1 ${isTyping ? 'animate-pulse' : 'opacity-0'}`}></span>
                        </p>

                        {/* Lottie Container - Mobile */}
                        {/* {shouldLoadLottie && (
                            <div className={`block md:hidden w-full h-50 mt-8 mb-4 transition-opacity duration-1000 ${showLottie ? 'opacity-100' : 'opacity-0'}`}>
                                <DotLottieReact
                                    src={isDarkMode ? '/assets/modal-animation-dark.lottie' : '/assets/modal-animation-light.lottie'}
                                    loop={false}
                                    autoplay={false}
                                    dotLottieRefCallback={setDotLottieMobile}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )} */}
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
