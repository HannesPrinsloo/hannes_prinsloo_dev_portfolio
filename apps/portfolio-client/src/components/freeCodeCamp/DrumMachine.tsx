import React, { useState, useEffect } from 'react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const DRUM_PADS = [
    { key: 'Q', name: 'Heater-1', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3' },
    { key: 'W', name: 'Heater-2', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3' },
    { key: 'E', name: 'Heater-3', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3' },
    { key: 'A', name: 'Heater-4', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-4_1.mp3' },
    { key: 'S', name: 'Clap', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3' },
    { key: 'D', name: 'Open-HH', url: 'https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3' },
    { key: 'Z', name: "Kick-n'-Hat", url: 'https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3' },
    { key: 'X', name: 'Kick', url: 'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3' },
    { key: 'C', name: 'Closed-HH', url: 'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3' },
] as const;

type PadKey = typeof DRUM_PADS[number]['key'];

// ─── Main Component ───────────────────────────────────────────────────────────
const DrumMachine: React.FC = () => {
    const [displaySoundName, setDisplaySoundName] = useState('');
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [activeKey, setActiveKey] = useState<PadKey | ''>('');

    // Quadratic volume curve (matches original)
    const finalVolume = muted ? 0 : volume ** 2;

    // ── Play helper ─────────────────────────────────────────────────────────
    const playPad = (key: PadKey, name: string) => {
        const audio = document.getElementById(key) as HTMLAudioElement | null;
        if (!audio) return;
        audio.volume = finalVolume;
        audio.currentTime = 0;
        audio.play().catch(() => { });
        setDisplaySoundName(name);
        setActiveKey(key);
        // Flash the active class briefly
        setTimeout(() => setActiveKey(''), 150);
    };

    // ── Keyboard support ────────────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const k = e.key.toUpperCase() as PadKey;
            const pad = DRUM_PADS.find(p => p.key === k);
            if (pad) playPad(pad.key, pad.name);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [finalVolume]); // re-bind when volume changes so playPad captures the new value

    return (
        <div
            id="drum-machine"
            className="w-full max-w-xs mx-auto flex shadow-[10px_10px_0px_0px_#1A1A1A] flex-col gap-0 relative"
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="bg-ink text-paper border-4 border-ink px-6 py-6 flex flex-col items-center gap-3">
                {/* Prominent centered ASCII title */}
                <h3 className="font-mono font-black text-3xl leading-none text-center tracking-tight">
                    \m/(&gt;.&lt;)\m/
                </h3>
                {/* Subtitle hint */}
                <p className="font-mono text-xs text-paper/50 text-center leading-snug">
                    Click or press the keys<br />to start playing
                </p>
                {/* Display panel — centered, narrower than full width */}
                <div
                    id="display"
                    className="border-2 border-acid px-4 py-1 w-48 font-mono text-xs font-bold text-acid uppercase tracking-widest min-h-[2rem] flex items-center justify-center text-center"
                >
                    {displaySoundName || '—'}
                </div>
            </div>

            {/* ── 3×3 Pad Grid ────────────────────────────────────────────── */}
            <div
                id="buttons"
                className="grid grid-cols-3 border-x-4 border-b-0 border-ink"
            >
                {DRUM_PADS.map(pad => (
                    <DrumPad
                        key={pad.key}
                        pad={pad}
                        isActive={activeKey === pad.key}
                        onPlay={playPad}
                    />
                ))}
            </div>

            {/* ── Controls ────────────────────────────────────────────────── */}
            <div
                id="controls"
                className="border-4 border-ink bg-paper px-6 py-4 shadow-[10px_10px_0px_0px_#1A1A1A] flex flex-col gap-4"
            >
                {/* Volume row */}
                <div id="volume" className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60 w-12 shrink-0">
                        VOL
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={volume}
                        onChange={e => setVolume(e.target.valueAsNumber)}
                        className="flex-1 appearance-none h-4 bg-halftone border-2 border-ink cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-acid [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:rounded-none"
                    />
                    <span className="font-mono text-xs font-black w-8 text-right shrink-0">
                        {Math.floor(finalVolume * 100)}
                    </span>
                </div>

                {/* Mute button */}
                <button
                    onClick={() => setMuted(m => !m)}
                    className={`w-full font-sans font-black uppercase py-3 text-sm tracking-widest border-2 border-ink transition-colors
                        ${muted
                            ? 'bg-ink text-paper hover:bg-acid hover:text-ink'
                            : 'bg-paper text-ink hover:bg-ink hover:text-paper'
                        }`}
                >
                    {muted ? '🔇 Unmute' : '🔈 Mute'}
                </button>
            </div>

            {/* Corner screws */}
            {(['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'] as const).map(pos => (
                <div key={pos} className={`absolute ${pos} w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center z-10`}>
                    <div className="w-full h-[1px] bg-ink transform rotate-45" />
                </div>
            ))}
        </div>
    );
};

// ─── Drum Pad Sub-component ───────────────────────────────────────────────────
interface DrumPadProps {
    pad: typeof DRUM_PADS[number];
    isActive: boolean;
    onPlay: (key: PadKey, name: string) => void;
}

const DrumPad: React.FC<DrumPadProps> = ({ pad, isActive, onPlay }) => (
    <button
        id={pad.name}
        className={`drum-pad relative aspect-square border-2 border-ink flex flex-col items-center justify-center gap-1 cursor-pointer select-none transition-all duration-75
            ${isActive
                ? 'bg-acid translate-x-px translate-y-px shadow-none'
                : 'bg-paper hover:bg-acid'
            }`}
        onClick={() => onPlay(pad.key, pad.name)}
        aria-label={pad.name}
    >
        {/* Key label — large */}
        <span className="font-sans font-black text-xl leading-none text-ink">
            {pad.key}
        </span>
        {/* Sound name label — tiny */}
        <span className="font-mono text-[9px] uppercase tracking-wide text-ink/50 leading-none px-1 text-center">
            {pad.name}
        </span>

        {/* Hidden audio element */}
        <audio id={pad.key} src={pad.url} className="clip" />
    </button>
);

export default DrumMachine;
