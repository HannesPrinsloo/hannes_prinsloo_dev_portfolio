import React, { useEffect, useRef } from 'react';
import { useGameStore, GamePhase } from '../../store/useGameStore';
import { createInitialState, updatePhysics } from './engine/fsm';
import { renderGame } from './engine/renderer';
import { GAME_CONSTANTS } from './engine/constants';
import { audioEngine } from './engine/audioEngine';
import { loadGameAssets } from './engine/assets';

export const GameModal: React.FC = () => {
    const isModalOpen = useGameStore((state) => state.isModalOpen);
    const gamePhase = useGameStore((state) => state.gamePhase);
    const setGamePhase = useGameStore((state) => state.setGamePhase);
    const closeModal = useGameStore((state) => state.closeModal);
    const resetScore = useGameStore((state) => state.resetScore);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(undefined);
    // Using a ref to hold volatile game state decoupled from React render cycle
    const gameStateRef = useRef(createInitialState());

    useEffect(() => {
        if (!isModalOpen) return;

        // Initialize audio context on first meaningful interaction (modal open)
        audioEngine.init();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reset game state whenever modal opens to PLAYING/MENU state
        gameStateRef.current = createInitialState();
        useGameStore.getState().resetScore();
        useGameStore.getState().setGamePhase(GamePhase.START_MENU);

        const loop = (time: number) => {
            const volatileState = gameStateRef.current;
            const currentPhase = useGameStore.getState().gamePhase;
            const currentScore = useGameStore.getState().score;

            const dtMs = time - volatileState.lastFrameTime;
            volatileState.lastFrameTime = time;

            // Update Physics & Rendering
            updatePhysics(volatileState, currentPhase, dtMs);
            renderGame(ctx, volatileState, currentPhase, currentScore);

            requestRef.current = requestAnimationFrame(loop);
        };

        // Preload assets before starting the loop to avoid invisible frames
        loadGameAssets(() => {
            requestRef.current = requestAnimationFrame(loop);
        });

        // Prevent scrolling and trap focus
        document.body.style.overflow = 'hidden';

        // Event listeners
        const handleJumpAction = () => {
            const state = gameStateRef.current;
            const phase = useGameStore.getState().gamePhase;

            // State transitions on interact
            if (phase === GamePhase.START_MENU) {
                useGameStore.getState().setGamePhase(GamePhase.PLAYING);
                state.survivalTimer = 0;
                state.spawnTimer = 2000;
                state.obstacles = [];
                state.lastFrameTime = performance.now(); // reset delta sync
            } else if (phase === GamePhase.GAME_OVER) {
                // Restart immediately
                gameStateRef.current = createInitialState();
                gameStateRef.current.lastFrameTime = performance.now();
                useGameStore.getState().resetScore();
                useGameStore.getState().setGamePhase(GamePhase.PLAYING);
            } else {
                state.keys.add(' '); // Simulate spacebar for the physics engine
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const state = gameStateRef.current;

            if (e.key === ' ' || e.key === 'ArrowUp') {
                e.preventDefault(); // Stop scroll hijacking
                handleJumpAction();
            } else {
                state.keys.add(e.key);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            gameStateRef.current.keys.delete(e.key);
            if (e.key === ' ' || e.key === 'ArrowUp') {
                gameStateRef.current.keys.delete(' ');
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault(); // prevent zoom or scroll on double tap
            handleJumpAction();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            gameStateRef.current.keys.delete(' ');
        };

        window.addEventListener('keydown', handleKeyDown, { passive: false });
        window.addEventListener('keyup', handleKeyUp);

        // Add touch listeners specifically to the canvas to avoid blocking modal close buttons
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            // Memory Cleanup & Garbage Collection
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            document.body.style.overflow = 'auto'; // Restore scroll
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isModalOpen, setGamePhase, resetScore]);

    // Also play victory sound on cutscene reached
    useEffect(() => {
        if (gamePhase === GamePhase.CUTSCENE && !useGameStore.getState().isMuted) {
            audioEngine.playVictoryChime();
        }
    }, [gamePhase]);

    if (!isModalOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Interactive Developer Story Game"
        >
            <div className={`relative bg-paper border-4 border-ink shadow-neo overflow-hidden animate-in zoom-in-95 duration-200 
                max-w-[100vw] max-h-[100vh] 
                origin-center transition-transform
                landscape:rotate-0 portrait:rotate-90 portrait:scale-[clamp(0.5,100vw/800,1)] landscape:scale-[clamp(0.5,100vw/800,1)]`}
            >

                {/* Header Bar */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-surface border-b-4 border-ink flex justify-between items-center px-4 z-10">
                    <span className="font-mono text-ink font-bold tracking-widest text-lg uppercase">&gt;&gt; dev_runner.sh</span>
                    <button
                        onClick={closeModal}
                        className="text-ink hover:bg-acid border-2 border-transparent hover:border-ink transition-colors p-1"
                        aria-label="Close game modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {/* The HTML5 Canvas */}
                <canvas
                    ref={canvasRef}
                    width={GAME_CONSTANTS.CANVAS_WIDTH}
                    height={GAME_CONSTANTS.CANVAS_HEIGHT}
                    className="block outline-none cursor-crosshair mt-10 touch-none"
                    tabIndex={0}
                />

                {/* Portfolio Overlay injected at the end of the narrative */}
                {gamePhase === GamePhase.CUTSCENE && gameStateRef.current?.cutscenePhase >= 3 && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-paper/90 backdrop-blur-sm animate-in fade-in duration-1000 mt-[48px]">
                        <h2 className="text-5xl font-bold font-sans text-ink mb-2 uppercase">Offer Accepted</h2>
                        <div className="w-full h-2 bg-acid border-y-2 border-ink mb-6"></div>
                        <p className="text-ink font-mono text-lg mb-8 max-w-md text-center">
                            The transition from musician to developer is complete. Let's build something amazing together.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={closeModal}
                                className="px-6 py-3 bg-acid text-ink font-bold border-2 border-ink shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-y-1 hover:shadow-none transition-all active:bg-ink active:text-paper"
                            >
                                View Portfolio
                            </button>
                            <a
                                href="mailto:hello@example.com"
                                className="px-6 py-3 bg-surface text-ink font-bold border-2 border-ink shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-y-1 hover:shadow-none transition-all"
                            >
                                Contact Me
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
