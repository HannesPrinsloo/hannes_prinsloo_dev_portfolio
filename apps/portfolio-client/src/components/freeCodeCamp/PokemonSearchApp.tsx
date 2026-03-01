import React, { useState, useEffect } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PokemonData {
    id: number;
    name: string;
    weight: number;
    height: number;
    sprites: { front_default: string };
    types: { type: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
}

const API = 'https://pokeapi-proxy.freecodecamp.rocks/api/pokemon';

// ─── Type badge colours (mirrors original CSS class names) ────────────────────
const TYPE_COLOURS: Record<string, string> = {
    normal: 'bg-[#A8A878] text-white',
    fire: 'bg-[#F08030] text-white',
    water: 'bg-[#6890F0] text-white',
    electric: 'bg-[#F8D030] text-ink',
    grass: 'bg-[#78C850] text-white',
    ice: 'bg-[#98D8D8] text-ink',
    fighting: 'bg-[#C03028] text-white',
    poison: 'bg-[#A040A0] text-white',
    ground: 'bg-[#E0C068] text-ink',
    flying: 'bg-[#A890F0] text-white',
    psychic: 'bg-[#F85888] text-white',
    bug: 'bg-[#A8B820] text-white',
    rock: 'bg-[#B8A038] text-white',
    ghost: 'bg-[#705898] text-white',
    dragon: 'bg-[#7038F8] text-white',
    dark: 'bg-[#705848] text-white',
    steel: 'bg-[#B8B8D0] text-ink',
    fairy: 'bg-[#EE99AC] text-white',
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PokemonSearchApp: React.FC = () => {
    // ── Search state ──────────────────────────────────────────────────────────
    const [searchInput, setSearchInput] = useState('');
    const [pokemon, setPokemon] = useState<PokemonData | null>(null);
    const [searchError, setSearchError] = useState('');

    // ── Random / "Who's that Pokémon?" state ──────────────────────────────────
    const [randomData, setRandomData] = useState<PokemonData | null>(null);
    const [guess, setGuess] = useState('');
    const [guessResult, setGuessResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [hintVisible, setHintVisible] = useState(false);
    const [loadingRandom, setLoadingRandom] = useState(false);

    // ── Fetch searched Pokémon ────────────────────────────────────────────────
    const getPokemon = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchError('');
        setPokemon(null);
        try {
            const res = await fetch(`${API}/${searchInput.toLowerCase().trim()}`);
            if (!res.ok) throw new Error('not found');
            const data: PokemonData = await res.json();
            setPokemon(data);
            setSearchInput('');
        } catch {
            setSearchError('Pokémon not found');
        }
    };

    // ── Fetch random Pokémon ──────────────────────────────────────────────────
    const getRandomPokemon = async () => {
        setLoadingRandom(true);
        setGuess('');
        setGuessResult('idle');
        setHintVisible(false);
        try {
            const randomId = Math.floor(Math.random() * 1025) + 1;
            const res = await fetch(`${API}/${randomId}`);
            const data: PokemonData = await res.json();
            setRandomData(data);
        } catch {
            /* silent */
        } finally {
            setLoadingRandom(false);
        }
    };

    const checkGuess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!randomData) return;
        if (guess.toLowerCase().trim() === randomData.name.toLowerCase()) {
            setGuessResult('correct');
        } else {
            setGuessResult('wrong');
        }
    };

    // Load a random Pokémon on mount
    useEffect(() => { getRandomPokemon(); }, []);

    return (
        <div className="w-full max-w-2xl mx-auto border-4 border-ink shadow-[10px_10px_0px_0px_#1A1A1A] overflow-hidden flex flex-col sm:flex-row">

            {/* ══════════════════ LEFT PANEL ══════════════════ */}
            <div className="flex-1 bg-paper flex flex-col p-5 gap-4 border-b-4 sm:border-b-0 sm:border-r-4 border-ink">

                {/* Logo */}
                <div className="flex justify-center pb-2 border-b-2 border-ink">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/269px-International_Pok%C3%A9mon_logo.svg.png"
                        alt="pokemon logo"
                        className="h-14 object-contain"
                        style={{ filter: 'grayscale(1) contrast(3)' }}
                    />
                </div>

                {/* Search form */}
                <form id="search-form" onSubmit={getPokemon} className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50 text-center">
                        Search your Pokémon
                    </label>
                    <input
                        id="search-input"
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="min-w-0 border-2 border-ink bg-surface-muted px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-acid transition-colors"
                        placeholder="e.g. pikachu"
                    />
                    <button
                        id="search-button"
                        type="submit"
                        className="bg-acid text-ink font-sans font-black uppercase py-2 border-2 border-ink hover:bg-ink hover:text-paper transition-colors active:translate-x-px active:translate-y-px"
                    >
                        Search
                    </button>
                    {searchError && (
                        <p className="font-mono text-xs text-red-600 text-center">{searchError}</p>
                    )}
                </form>

                {/* Pokémon Details */}
                <div className="border-t-2 border-ink border-dashed pt-3 flex flex-col gap-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 text-center mb-1">Pokémon Details</p>

                    {/* Sprite */}
                    {pokemon?.sprites.front_default && (
                        <div id="sprite-container" className="flex justify-center">
                            <img id="pokemon-sprite" src={pokemon.sprites.front_default} alt={pokemon.name} className="w-20 h-20 object-contain" style={{ imageRendering: 'pixelated' }} />
                        </div>
                    )}

                    <StatRow label="Name:" id="pokemon-name" value={pokemon ? pokemon.name.toUpperCase() : '—'} />
                    <StatRow label="Id:" id="pokemon-id" value={pokemon ? `#${pokemon.id}` : '—'} />
                    <StatRow label="Weight:" id="weight" value={pokemon ? `${pokemon.weight}` : '—'} />
                    <StatRow label="Height:" id="height" value={pokemon ? `${pokemon.height}` : '—'} />

                    {/* Types */}
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-ink/50 w-14 text-right shrink-0">Types:</span>
                        <div id="types" className="flex gap-1 flex-wrap">
                            {pokemon
                                ? pokemon.types.map(t => (
                                    <span key={t.type.name} className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 ${TYPE_COLOURS[t.type.name] ?? 'bg-surface-muted text-ink'}`}>
                                        {t.type.name}
                                    </span>
                                ))
                                : <span className="font-mono text-[10px] text-ink/30">—</span>
                            }
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="border-t-2 border-ink border-dashed pt-3 flex flex-col gap-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50 text-center mb-1">Pokémon Stats</p>
                    <StatRow label="HP:" id="hp" value={pokemon ? `${pokemon.stats[0].base_stat}` : '—'} />
                    <StatRow label="Attack:" id="attack" value={pokemon ? `${pokemon.stats[1].base_stat}` : '—'} />
                    <StatRow label="Defense:" id="defense" value={pokemon ? `${pokemon.stats[2].base_stat}` : '—'} />
                    <StatRow label="Special Attack:" id="special-attack" value={pokemon ? `${pokemon.stats[3].base_stat}` : '—'} />
                    <StatRow label="Special Defense:" id="special-defense" value={pokemon ? `${pokemon.stats[4].base_stat}` : '—'} />
                    <StatRow label="Speed:" id="speed" value={pokemon ? `${pokemon.stats[5].base_stat}` : '—'} />
                </div>
            </div>

            {/* ══════════════════ RIGHT PANEL ══════════════════ */}
            <div className="w-full sm:w-52 shrink-0 bg-ink text-paper flex flex-col p-5 gap-4">

                {/* Guess the Pokémon */}
                <p className="font-mono text-[10px] uppercase tracking-widest text-paper/50 text-center">
                    Guess the Pokémon
                </p>

                {/* Silhouette sprite */}
                <div className="flex justify-center">
                    {loadingRandom ? (
                        <div className="w-20 h-20 border-2 border-acid/30 flex items-center justify-center">
                            <span className="font-mono text-xs text-acid animate-pulse">...</span>
                        </div>
                    ) : randomData?.sprites.front_default ? (
                        <img
                            id="random-sprite"
                            src={randomData.sprites.front_default}
                            alt="Mystery Pokémon"
                            className="w-20 h-20 object-contain"
                            style={{
                                imageRendering: 'pixelated',
                                filter: guessResult === 'correct' ? 'none' : 'brightness(0) invert(1)',
                            }}
                        />
                    ) : null}
                </div>

                {/* Guess form */}
                <form id="who-is-that-pokemon" onSubmit={checkGuess} className="flex flex-col gap-2">
                    <input
                        id="guess"
                        type="text"
                        value={guess}
                        onChange={e => setGuess(e.target.value)}
                        placeholder="your guess..."
                        className="min-w-0 border-2 border-paper/30 bg-transparent px-2 py-1 font-mono text-xs text-paper placeholder:text-paper/20 focus:outline-none focus:border-acid transition-colors"
                    />
                    <button
                        id="guess-btn"
                        type="submit"
                        className="bg-acid text-ink font-sans font-black uppercase py-2 text-xs border-2 border-acid hover:bg-paper hover:border-paper transition-colors active:translate-x-px active:translate-y-px"
                    >
                        Am I right?
                    </button>
                </form>

                {/* Guess feedback */}
                {guessResult === 'correct' && (
                    <p id="random-pokemon-aside" className="font-mono text-[10px] text-acid text-center leading-snug">
                        YOU DID IT!<br />
                        <span className="text-paper/50">...please get a life</span>
                    </p>
                )}
                {guessResult === 'wrong' && (
                    <p className="font-mono text-[10px] text-red-400 text-center">
                        Not quite — try again!
                    </p>
                )}

                {/* No clue? */}
                <div className="border-t border-paper/20 pt-3 flex flex-col gap-2">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-paper/50">
                        No clue?
                    </p>
                    <button
                        id="randomise-button"
                        onClick={getRandomPokemon}
                        className="font-mono text-[10px] text-acid uppercase tracking-wide text-left hover:underline"
                    >
                        Generate another Rand-émon
                    </button>
                    <button
                        id="hint"
                        onClick={() => setHintVisible(true)}
                        className="font-mono text-[10px] text-acid uppercase tracking-wide text-left hover:underline"
                    >
                        Hint, please
                    </button>
                    {hintVisible && (
                        <p id="hint-text" className="font-mono text-[10px] text-paper/60 italic">
                            {randomData?.name ?? '...'}
                        </p>
                    )}
                </div>

                {/* Random sprite pokemon name (shown after correct) */}
                {guessResult === 'correct' && randomData && (
                    <p id="random-pokemon-name" className="font-mono text-[10px] text-acid text-center uppercase tracking-wider">
                        {randomData.name}
                    </p>
                )}
            </div>
        </div>
    );
};

// ─── Shared StatRow ───────────────────────────────────────────────────────────
const StatRow: React.FC<{ label: string; id: string; value: string }> = ({ label, id, value }) => (
    <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] text-ink/50 text-right w-24 shrink-0">{label}</span>
        <span id={id} className="font-mono text-xs font-bold text-ink">{value}</span>
    </div>
);

export default PokemonSearchApp;
