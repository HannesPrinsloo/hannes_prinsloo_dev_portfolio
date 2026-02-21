/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                paper: 'var(--color-paper)',
                ink: 'var(--color-ink)',
                acid: 'var(--color-acid)',
                surface: 'var(--color-surface)',
                'surface-muted': 'var(--color-surface-muted)',
                selection: 'var(--color-selection-text)',
            },
            boxShadow: {
                neo: '4px 4px 0px 0px var(--color-shadow)',
                'neo-sm': '2px 2px 0px 0px var(--color-shadow)',
            },
            fontFamily: {
                sans: ['"roc-grotesk"', 'sans-serif'],
                mono: ['"Fira Code"', 'monospace'],
            },
            borderWidth: {
                3: '3px',
            },
        },
        keyframes: {
            'paper-slam': {
                '0%': { opacity: '0', transform: 'scale(1.5) rotate(-5deg)' },
                '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
            }
        },
        animation: {
            'paper-slam': 'paper-slam 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        }
    },
    plugins: [],
}
