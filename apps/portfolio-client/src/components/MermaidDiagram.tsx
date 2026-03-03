import { useEffect, useRef, useState, useCallback } from 'react';

interface MermaidDiagramProps {
    chart: string;
    className?: string;
}

const MermaidDiagram = ({ chart, className = '' }: MermaidDiagramProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const renderIdRef = useRef(0);

    const renderDiagram = useCallback(async () => {
        if (!containerRef.current) return;
        setIsLoading(true);
        setError(null);

        try {
            const mermaid = (await import('mermaid')).default;

            const isDark = document.documentElement.classList.contains('dark');
            const isFun = document.documentElement.classList.contains('fun');

            // Theme tokens mapped to the site's CSS variables
            const ink = isDark || isFun ? '#f4f4f0' : '#1A1A1A';
            const paper = isDark ? '#1A1A1A' : isFun ? 'rgba(0,0,0,0.4)' : '#f4f4f0';
            const surface = isDark ? '#000000' : isFun ? 'rgba(0,0,0,0.7)' : '#ffffff';
            const lineColor = isDark || isFun ? '#f4f4f0' : '#1A1A1A';

            mermaid.initialize({
                startOnLoad: false,
                theme: 'base',
                themeVariables: {
                    // Background
                    background: paper,
                    // Primary (entity fills)
                    primaryColor: surface,
                    primaryTextColor: ink,
                    primaryBorderColor: ink,
                    // Secondary
                    secondaryColor: surface,
                    secondaryTextColor: ink,
                    secondaryBorderColor: ink,
                    // Tertiary
                    tertiaryColor: surface,
                    tertiaryTextColor: ink,
                    tertiaryBorderColor: ink,
                    // Lines
                    lineColor: lineColor,
                    // Text
                    textColor: ink,
                    // Font
                    fontFamily: "'Fira Code', monospace",
                    fontSize: '12px',
                    // ER diagram specific
                    attributeBackgroundColorEven: surface,
                    attributeBackgroundColorOdd: isDark ? '#111111' : isFun ? 'rgba(0,0,0,0.5)' : '#f8f8f6',
                },
                er: {
                    layoutDirection: 'TB',
                    minEntityWidth: 100,
                    minEntityHeight: 50,
                    entityPadding: 15,
                    useMaxWidth: true,
                },
            });

            renderIdRef.current += 1;
            const id = `mermaid-diagram-${renderIdRef.current}`;

            // Clear previous render
            containerRef.current.innerHTML = '';

            const { svg } = await mermaid.render(id, chart);
            if (containerRef.current) {
                containerRef.current.innerHTML = svg;
                // Make the SVG responsive
                const svgEl = containerRef.current.querySelector('svg');
                if (svgEl) {
                    svgEl.style.maxWidth = '100%';
                    svgEl.style.height = 'auto';
                }
            }
        } catch (err) {
            console.error('Mermaid render error:', err);
            setError('Failed to render diagram');
        } finally {
            setIsLoading(false);
        }
    }, [chart]);

    useEffect(() => {
        renderDiagram();

        // Re-render when theme changes
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class') {
                    renderDiagram();
                }
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [renderDiagram]);

    return (
        <div className={className}>
            {/* Halftone loading state */}
            {isLoading && (
                <div className="relative border-4 border-ink bg-surface overflow-hidden" style={{ minHeight: '300px' }}>
                    {/* Dot pattern background */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(circle, var(--color-ink) 1px, transparent 1px)`,
                            backgroundSize: '12px 12px',
                        }}
                    />
                    {/* Scanning line animation */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(
                                180deg,
                                transparent 0%,
                                transparent 40%,
                                var(--color-ink) 50%,
                                transparent 60%,
                                transparent 100%
                            )`,
                            backgroundSize: '100% 200%',
                            animation: 'halftone-scan 2s ease-in-out infinite',
                            opacity: 0.08,
                        }}
                    />
                    {/* Loading text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="flex gap-1.5">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-2.5 h-2.5 bg-ink rounded-full"
                                    style={{
                                        animation: `halftone-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
                                    }}
                                />
                            ))}
                        </div>
                        <p className="font-mono text-xs text-ink/60 tracking-wider uppercase">
                            Rendering schema...
                        </p>
                    </div>
                    <style>{`
                        @keyframes halftone-scan {
                            0% { background-position: 0% 0%; }
                            100% { background-position: 0% 100%; }
                        }
                        @keyframes halftone-dot {
                            0%, 100% { opacity: 0.2; transform: scale(0.6); }
                            50% { opacity: 1; transform: scale(1.2); }
                        }
                    `}</style>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="border-4 border-red-500 bg-red-50 dark:bg-red-950 p-6 font-mono text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Diagram container */}
            <div
                ref={containerRef}
                className={`transition-opacity duration-500 ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
            />
        </div>
    );
};

export default MermaidDiagram;
