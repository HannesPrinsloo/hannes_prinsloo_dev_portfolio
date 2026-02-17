import { useState } from 'react'

function App() {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-pink-500 selection:text-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-bold text-lg tracking-tight">Hannes Prinsloo</div>
                    <div className="flex gap-6 text-sm font-medium text-gray-400">
                        <a href="https://github.com/HannesPrinsloo" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                        <a href="https://www.linkedin.com/in/hannes-prinsloo-4325491bb/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href="mailto:johannespprinsloo@gmail.com" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">

                {/* Hero */}
                <div className="mb-20">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        Digital Products & <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Projects</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        Full Stack Developer specializing in building robust, user-centric web applications.
                        Solving real-world problems with modern technology.
                    </p>
                </div>

                {/* Featured Product (Gumroad Style Card) */}
                <div className="mb-24">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-8 border-b border-gray-800 pb-2">Featured Project</h2>

                    <div className="group relative bg-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 border border-gray-700 hover:border-gray-600 grid md:grid-cols-2">

                        {/* Visual / Thumbnail Placeholder */}
                        <div className="bg-gradient-to-br from-gray-700 to-gray-800 aspect-video md:aspect-auto flex items-center justify-center p-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            {/* Abstract UI Representation */}
                            <div className="w-full max-w-sm bg-gray-900 rounded-lg shadow-2xl transform group-hover:scale-105 transition-transform duration-500 p-4 border border-gray-700/50">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-20 bg-gray-800 rounded w-full animate-pulse"></div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="h-8 bg-gray-800 rounded col-span-1"></div>
                                        <div className="h-8 bg-gray-800 rounded col-span-2"></div>
                                    </div>
                                    <div className="h-8 bg-gray-800 rounded w-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="p-8 md:p-10 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-pink-500/10 text-pink-400 text-xs font-bold px-3 py-1 rounded-full border border-pink-500/20">FULL STACK DEMO</span>
                                <span className="text-gray-500 text-xs font-mono">v1.0.0</span>
                            </div>

                            <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-pink-400 transition-colors">Music School Management System</h3>

                            <p className="text-gray-400 mb-8 leading-relaxed">
                                A comprehensive CRM tailored for music schools. Manages student rosters, teacher schedules, recurring billing, and lesson attendance. Built for scale and reliability.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-10">
                                {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Express', 'Vite'].map(tech => (
                                    <span key={tech} className="bg-gray-900 border border-gray-700 text-gray-400 px-3 py-1 rounded text-xs font-medium">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <a
                                    href="https://demo.hannesprinsloo.dev"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-full md:w-auto bg-white text-gray-900 hover:bg-pink-500 hover:text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-pink-500/25"
                                >
                                    Launch Full Stack App →
                                </a>
                                <div className="mt-3 text-center md:text-left">
                                    <span className="text-xs text-gray-500">Live interactive demo • No signup required</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories / Tools I Use */}
                <div className="mb-20">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 border-b border-gray-800 pb-2">Tools & Technologies</h2>
                    <div className="flex flex-wrap gap-3">
                        {['JavaScript (ES6+)', 'React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'SQL', 'Git', 'REST APIs', 'Supabase', 'Vercel', 'Render', 'HTML5', 'CSS3', 'TailwindCSS'].map(tool => (
                            <span key={tool} className="py-2 px-4 rounded-full bg-gray-800 border border-gray-700 text-gray-300 text-sm hover:border-gray-500 hover:text-white transition-colors cursor-default">
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer / Contact */}
                <div className="border-t border-gray-800 pt-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Hannes Prinsloo. All rights reserved.
                    </div>
                    <div className="fixed bottom-6 right-6 md:relative md:bottom-auto md:right-auto">
                        <a href="mailto:johannespprinsloo@gmail.com" className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-full font-medium shadow-lg border border-gray-700 transition-colors flex items-center gap-2">
                            <span>📧</span>
                            <span>Get in touch</span>
                        </a>
                    </div>
                </div>

            </main>
        </div>
    )
}

export default App
