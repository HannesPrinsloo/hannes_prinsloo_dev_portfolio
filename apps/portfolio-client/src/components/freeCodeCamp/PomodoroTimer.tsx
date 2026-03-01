import React, { useState, useEffect, useRef } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const secondsToDisplay = (secs: number): string => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface LengthControlProps {
    session: 'Session' | 'Break';
    minutes: number;
    onDecrement: (type: 'Session' | 'Break') => void;
    onIncrement: (type: 'Session' | 'Break') => void;
}

const LengthControl: React.FC<LengthControlProps> = ({ session, minutes, onDecrement, onIncrement }) => {
    const id = session.toLowerCase();
    return (
        <div id={`${id}-details`} className="flex items-center gap-0">
            {/* Label */}
            <div
                id={`${id}-label`}
                className="w-28 border-2 border-ink px-4 py-2 font-sans font-black uppercase text-sm tracking-widest text-center bg-paper"
            >
                {session}
            </div>

            {/* Decrement */}
            <button
                id={`${id}-decrement`}
                onClick={() => onDecrement(session)}
                className="-rotate-90 w-10 h-10 border-2 border-l-4 border-r-1 mr-2 ml-2 border-ink flex items-center justify-center rounded-full hover:bg-acid hover:border-ink active:scale-95 transition-all bg-paper"
                aria-label={`Decrease ${session} length`}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Value */}
            <div
                id={`${id}-length`}
                className="w-14 border-2 border-ink px-2 py-2 font-sans font-black text-xl text-center bg-paper leading-none"
            >
                {minutes}
            </div>

            {/* Increment */}
            <button
                id={`${id}-increment`}
                onClick={() => onIncrement(session)}
                className="-rotate-90 w-10 h-10 border-2 border-l-4 border-r-1 border-ink ml-2 flex items-center justify-center rounded-full hover:bg-acid active:scale-95 transition-all bg-paper"
                aria-label={`Increase ${session} length`}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const PomodoroTimer: React.FC = () => {
    const [sessionTime, setSessionTime] = useState(1500);   // seconds
    const [breakTime, setBreakTime] = useState(300);    // seconds
    const [currentTime, setCurrentTime] = useState(1500);
    const [timerState, setTimerState] = useState<'paused' | 'running'>('paused');
    const [timerType, setTimerType] = useState<'Session' | 'Break'>('Session');

    const audioRef = useRef<HTMLAudioElement>(null);

    // ── Timer tick ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (timerState !== 'running') return;

        const id = setInterval(() => {
            setCurrentTime(prev => {
                if (prev === 1 && audioRef.current) {
                    audioRef.current.play().catch(() => { });
                }
                if (prev === 0) {
                    // Switch type
                    setTimerType(t => {
                        const next = t === 'Session' ? 'Break' : 'Session';
                        setCurrentTime(next === 'Break' ? breakTime : sessionTime);
                        return next;
                    });
                    return prev; // momentary; will be overwritten by setCurrentTime above
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [timerState, breakTime, sessionTime]);

    // ── Controls ────────────────────────────────────────────────────────────
    const handlePlayPause = () => {
        setTimerState(s => s === 'paused' ? 'running' : 'paused');
    };

    const reset = () => {
        setSessionTime(1500);
        setBreakTime(300);
        setCurrentTime(1500);
        setTimerState('paused');
        setTimerType('Session');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const onDecrement = (type: 'Session' | 'Break') => {
        if (timerState === 'running') return;
        if (type === 'Break' && breakTime > 60) {
            const next = breakTime - 60;
            setBreakTime(next);
            if (timerType === 'Break') setCurrentTime(next);
        } else if (type === 'Session' && sessionTime > 60) {
            const next = sessionTime - 60;
            setSessionTime(next);
            if (timerType === 'Session') setCurrentTime(next);
        }
    };

    const onIncrement = (type: 'Session' | 'Break') => {
        if (timerState === 'running') return;
        if (type === 'Break' && breakTime < 3600) {
            const next = breakTime + 60;
            setBreakTime(next);
            if (timerType === 'Break') setCurrentTime(next);
        } else if (type === 'Session' && sessionTime < 3600) {
            const next = sessionTime + 60;
            setSessionTime(next);
            if (timerType === 'Session') setCurrentTime(next);
        }
    };

    const isBreak = timerType === 'Break';

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-0 relative font-sans">

            {/* ── Length controls ─────────────────────────────────────────── */}
            <div className="bg-paper border-4 border-ink p-6 shadow-[10px_10px_0px_0px_#1A1A1A] flex flex-col gap-4">
                <LengthControl session="Session" minutes={sessionTime / 60} onDecrement={onDecrement} onIncrement={onIncrement} />
                <LengthControl session="Break" minutes={breakTime / 60} onDecrement={onDecrement} onIncrement={onIncrement} />
            </div>

            {/* ── Timer display ─────────────────────────────────────────────── */}
            <div
                id="timer"
                className={`border-x-4 border-b-4 border-ink px-6 pt-6 pb-4 flex flex-col shadow-[10px_10px_0px_0px_#1A1A1A] transition-colors duration-500 ${isBreak ? 'bg-acid' : 'bg-paper'}`}
            >
                <span
                    id="timer-label"
                    className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60 mb-1"
                >
                    {timerType}S
                </span>
                <span
                    id="time-left"
                    className={`font-sans font-black leading-none tracking-tighter transition-all ${currentTime <= 60 ? 'text-red-600' : 'text-ink'}`}
                    style={{ fontSize: 'clamp(3.5rem, 12vw, 5.5rem)' }}
                >
                    {secondsToDisplay(currentTime)}
                </span>
                {timerState === 'running' && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40 mt-1 animate-pulse">
                        ● Running
                    </span>
                )}
            </div>

            {/* ── Controls ─────────────────────────────────────────────────── */}
            <div id="controls" className="flex border-x-4 shadow-[10px_10px_0px_0px_#1A1A1A] border-b-4 border-ink">
                <button
                    id="start_stop"
                    onClick={handlePlayPause}
                    className="flex-1 bg-paper text-ink font-black  uppercase py-4 text-sm tracking-widest hover:bg-acid hover:text-ink transition-colors border-r-2 border-ink active:opacity-80"
                >
                    {timerState === 'paused' ? 'Play' : 'Pause'}
                </button>
                <button
                    id="reset"
                    onClick={reset}
                    className="flex-1 bg-paper text-ink font-black uppercase py-4 text-sm tracking-widest border-l-2 border-ink hover:bg-ink hover:text-paper transition-colors active:opacity-80"
                >
                    Reset
                </button>
            </div>

            {/* ── Beep audio ───────────────────────────────────────────────── */}
            <audio
                id="beep"
                ref={audioRef}
                src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
            />

            {/* Corner screws */}
            {(['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'] as const).map(pos => (
                <div key={pos} className={`absolute ${pos} w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center z-10`}>
                    <div className="w-full h-[1px] bg-ink transform rotate-45" />
                </div>
            ))}
        </div>
    );
};

export default PomodoroTimer;
