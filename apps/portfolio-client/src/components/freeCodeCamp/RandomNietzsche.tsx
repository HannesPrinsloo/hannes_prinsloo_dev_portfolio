import React, { useState, useEffect } from 'react';
import quotes from '../../data/nietzscheQuotes.json';

const RandomNietzsche: React.FC = () => {
    const [currentQuote, setCurrentQuote] = useState('');
    const [currentAuthor] = useState('Friedrich Nietzsche');

    useEffect(() => {
        // Initialize with a random quote on component mount
        getRandomQuote();
    }, []);

    const getRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
    };

    return (
        <div
            id="quote-box"
            className="w-full max-w-2xl mx-auto bg-paper border-4 border-ink p-8 md:p-12 shadow-[10px_10px_0px_0px_#1A1A1A] flex flex-col gap-8 relative"
        >
            {/* Decorative Header */}
            <div className="flex justify-between items-start border-b-4 border-ink pb-4">
                <h3 className="text-2xl font-black uppercase leading-none tracking-tighter">
                    Snippets from <br /> Ecce Homo
                </h3>
            </div>

            {/* Quote Content */}
            <div className="flex flex-col gap-4">
                <div className="relative">
                    {/* Oversized decorative quote mark */}
                    <span className="absolute -top-6 -left-4 text-8xl font-black text-ink/10 select-none z-50 font-serif leading-none"></span>
                    <p id="text" className="font-mono text-xl md:text-lg font-normal italic leading-tight mt-5 relative z-10 pl-4 border-l-4 border-ink">
                        {currentQuote}
                    </p>
                </div>

                <p id="author" className="font-mono text-sm font-bold text-ink/70 self-end mr-4">
                    - {currentAuthor}
                </p>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mt-4 pt-8 border-t-2 border-ink border-dashed">
                <button
                    id="new-quote"
                    onClick={getRandomQuote}
                    className="flex-1 bg-ink text-paper font-bold uppercase py-4 border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                    New Quote
                </button>

                <a
                    id="tweet-quote"
                    href={`https://twitter.com/intent/tweet?text="${encodeURIComponent(currentQuote)}" - ${encodeURIComponent(currentAuthor)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-acid text-ink text-center font-bold uppercase py-4 border-2 border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:bg-paper transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
                >
                    {/* SVG Twitter X Icon */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.95H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                </a>
            </div>

            {/* Corner Decor */}
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
    );
};

export default RandomNietzsche;
