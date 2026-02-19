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
                sans: ['Inter', 'sans-serif'],
                mono: ['"Fira Code"', 'monospace'],
            },
            borderWidth: {
                3: '3px',
            }
        },
    },
    plugins: [],
}
