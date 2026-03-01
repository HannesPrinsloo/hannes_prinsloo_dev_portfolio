import React, { useState } from 'react';

const ROM_NUM = [
    { symbol: 'M', value: 1000 },
    { symbol: 'CM', value: 900 },
    { symbol: 'D', value: 500 },
    { symbol: 'CD', value: 400 },
    { symbol: 'C', value: 100 },
    { symbol: 'XC', value: 90 },
    { symbol: 'L', value: 50 },
    { symbol: 'XL', value: 40 },
    { symbol: 'X', value: 10 },
    { symbol: 'IX', value: 9 },
    { symbol: 'V', value: 5 },
    { symbol: 'IV', value: 4 },
    { symbol: 'I', value: 1 },
];

const convertToRoman = (num: number): string => {
    let remaining = num;
    let result = '';
    while (remaining > 0) {
        const numeral = ROM_NUM.find(r => r.value <= remaining)!;
        result += numeral.symbol;
        remaining -= numeral.value;
    }
    return result;
};

type OutputState =
    | { type: 'idle' }
    | { type: 'error'; message: string }
    | { type: 'result'; value: string };

const RomanNumeralConverter: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [output, setOutput] = useState<OutputState>({ type: 'idle' });

    const handleConvert = () => {
        const num = Number(inputValue);

        if (inputValue.trim() === '' || isNaN(num)) {
            setOutput({ type: 'error', message: 'Please enter a valid number' });
            return;
        }
        if (!Number.isInteger(num)) {
            setOutput({ type: 'error', message: 'Please enter a whole number' });
            return;
        }
        if (num < 1) {
            setOutput({ type: 'error', message: 'Please enter a number greater than or equal to 1' });
            return;
        }
        if (num > 3999) {
            setOutput({ type: 'error', message: 'Please enter a number less than or equal to 3999' });
            return;
        }

        setOutput({ type: 'result', value: convertToRoman(num) });
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleConvert();
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto shadow-[10px_10px_0px_0px_#1A1A1A] flex flex-col gap-0 relative">

            {/* Header Panel */}
            <div className="bg-ink text-paper border-4 border-ink px-6 py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="font-sans text-2xl font-black uppercase leading-none tracking-tighter">
                    Roman Numeral<br />Converter
                </h3>
                <span className="border-2 border-acid px-2 py-1 text-xs font-bold text-acid uppercase self-start sm:self-auto shrink-0">
                    I–MMMCMXCIX
                </span>
            </div>

            {/* Body */}
            <div className="bg-paper border-x-4 border-b-4 border-ink p-5 sm:p-8 shadow-[10px_10px_0px_0px_#1A1A1A] flex flex-col gap-5">

                {/* Input Row */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="number" className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">
                        Enter a number (1–3999)
                    </label>
                    <div className="flex gap-0 min-w-0">
                        <input
                            id="number"
                            type="number"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. 2024"
                            className="flex-1 min-w-0 bg-surface-muted border-2 border-ink border-r-0 px-4 py-3 font-mono text-lg font-bold text-ink placeholder:text-ink/30 focus:outline-none focus:border-acid focus:bg-paper transition-colors"
                        />
                        <button
                            id="convert-btn"
                            onClick={handleConvert}
                            className="bg-ink text-paper font-sans font-black uppercase px-6 py-3 border-2 border-ink hover:bg-acid hover:text-ink transition-colors active:translate-x-px active:translate-y-px"
                        >
                            Go
                        </button>
                    </div>
                </div>

                {/* Output Display */}
                <div
                    id="output"
                    className={`
                        border-2 border-ink min-h-[80px] flex items-center justify-center px-6 py-4 transition-colors
                        ${output.type === 'result' ? 'bg-acid' : 'bg-surface-muted'}
                        ${output.type === 'error' ? 'border-dashed' : ''}
                    `}
                >
                    {output.type === 'idle' && (
                        <span className="font-mono text-sm text-ink/30 uppercase tracking-widest">
                            Result will appear here
                        </span>
                    )}
                    {output.type === 'error' && (
                        <span className="font-mono text-sm font-bold text-ink">
                            ⚠ {output.message}
                        </span>
                    )}
                    {output.type === 'result' && (
                        <span className="font-sans text-lg md:text-2xl font-black uppercase tracking-widest text-ink leading-none">
                            {output.value}
                        </span>
                    )}
                </div>

                {/* Quick Reference Strip */}
                <div className="border-t-2 border-ink border-dashed pt-4 grid grid-cols-4 gap-1 text-center">
                    {[
                        ['I', '1'], ['V', '5'], ['X', '10'], ['L', '50'],
                        ['C', '100'], ['D', '500'], ['M', '1000'], ['…', '']
                    ].map(([sym, val]) => (
                        <div key={sym} className="flex flex-col border border-ink bg-surface-muted py-1">
                            <span className="font-sans font-black text-base leading-none">{sym}</span>
                            <span className="font-mono text-[10px] text-ink/50">{val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Corner screws */}
            {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map(pos => (
                <div key={pos} className={`absolute ${pos} w-2 h-2 rounded-full border border-ink bg-surface-muted flex items-center justify-center z-10`}>
                    <div className="w-full h-[1px] bg-ink transform rotate-45" />
                </div>
            ))}
        </div>
    );
};

export default RomanNumeralConverter;
