/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                paper: '#f4f4f0',
                ink: '#1A1A1A',
                acid: '#CCFF00',
            },
            boxShadow: {
                neo: '4px 4px 0px 0px #1A1A1A',
                'neo-sm': '2px 2px 0px 0px #1A1A1A',
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
