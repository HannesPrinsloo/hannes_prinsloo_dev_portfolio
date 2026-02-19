import { useState } from 'react'
import BackstoryModal from './components/BackstoryModal'

function App() {
    const [audioMode, setAudioMode] = useState(false);
    const [showBackstory, setShowBackstory] = useState(false);

    return (
        <div className="min-h-screen bg-paper text-ink p-4 md:p-8 font-mono">

            <BackstoryModal isOpen={showBackstory} onClose={() => setShowBackstory(false)} />

            {/* Navigation / Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Logo / Brand */}
                    <div className="pointer-events-auto bg-paper border-2 border-ink shadow-neo px-4 py-2 font-sans font-medium text-xl uppercase tracking-tighter hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
                        <a href="#home">Hannes Prinsloo</a>
                    </div>

                    {/* Nav Links */}
                    <div className="pointer-events-auto bg-paper border-2 border-ink shadow-neo px-6 py-2 hidden md:flex gap-8 font-bold uppercase text-sm tracking-widest">
                        <a href="#home" className="hover:text-acid transition-colors">Home</a>
                        <a href="#expertise" className="hover:text-acid transition-colors">Expertise</a>
                        <a href="#work" className="hover:text-acid transition-colors">Work</a>
                        <a href="#experience" className="hover:text-acid transition-colors">Experience</a>
                        <a href="#contact" className="hover:text-acid transition-colors">Contact</a>
                    </div>

                    {/* Director's Cut Toggle */}
                    <button
                        onClick={() => setAudioMode(!audioMode)}
                        className={`pointer-events-auto bg-paper border-2 border-ink shadow-neo px-4 py-2 flex items-center gap-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group ${audioMode ? 'bg-acid' : ''}`}
                    >
                        <span className="text-sm font-bold uppercase tracking-widest">
                            {audioMode ? 'AUDIO TOUR: ON' : 'AUDIO TOUR: OFF'}
                        </span>
                        <div className={`w-4 h-4 border-2 border-ink rounded-full ${audioMode ? 'bg-ink' : 'bg-transparent'} transition-colors`}></div>
                    </button>
                </div>
            </nav>

            {/* Main Content Container */}
            <main className="max-w-5xl mx-auto mt-32 md:mt-48 pb-20">

                {/* Hero Section */}
                <section id="home" className="mb-32 relative scroll-mt-48">
                    <div className="absolute -left-10 -top-10 w-20 h-20 border-l-4 border-t-4 border-ink opacity-20 hidden md:block"></div>

                    <h1 className="text-6xl md:text-8xl font-medium leading-[0.85] mb-8 tracking-tighter mix-blend-multiply">
                        Full Stack <br />
                        <span>Developer</span>
                    </h1>

                    <p className="text-lg md:text-xl max-w-2xl leading-relaxed border-l-4 border-acid pl-6 italic">
                        I am a self-taught Full Stack Developer and freelancer, currently studying for a Computer Science degree. I am also a professional gigging musician and music teacher looking to begin a fully fledged career in tech.
                    </p>

                    <button
                        onClick={() => setShowBackstory(true)}
                        className="inline-block mt-8 bg-paper text-ink px-6 py-3 font-medium uppercase border-2 border-ink shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                        My Background: Artist to Engineer
                    </button>
                </section>

                {/* Expertise Section */}
                <section id="expertise" className="mb-32 scroll-mt-32">
                    <h2 className="text-4xl font-medium mb-12 flex items-center gap-4">
                        <span className="w-8 h-8 bg-acid border-2 border-ink block"></span>
                        My Expertise
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: The Stack */}
                        <div className="border-2 border-ink p-6 bg-white shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Full Stack <br />Architecture</h3>
                            <p className="text-sm mb-6 leading-relaxed">
                                Specializing in the <span className="font-bold bg-yellow-200 px-1">React / TypeScript</span> ecosystem.
                                Experience in building full stack applications with React, Zustand, Node.js, Express, and PostgreSQL.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'Zustand', 'JavaScript/TypeScript', 'Node.js', 'PostgreSQL', 'Express'].map(t => (
                                    <span key={t} className="text-xs font-bold border border-ink px-1 bg-gray-100">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Card 2: CS & Foundations */}
                        <div className="border-2 border-ink p-6 bg-white shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Computer Science <br />& Foundations</h3>
                            <p className="text-sm mb-6 leading-relaxed">
                                Strong grounding in Computer Science fundamentals.
                                Experience with <span className="font-bold">C</span>, <span className="font-bold">C++</span>, <span className="font-bold">SQL (PostgreSQL)</span>, <span className="font-bold">JavaScript</span>, <span className="font-bold">TypeScript</span> and <span className="font-bold">Data Structures & Algorithms</span>.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['JavaScript/TypeScript', 'C/C++', 'SQL (PostgreSQL)', 'Data Structures and  Algorithms'].map(t => (
                                    <span key={t} className="text-xs font-bold border border-ink px-1 bg-gray-100">{t}</span>
                                ))}
                            </div>
                        </div>

                        {/* Card 3: Freelance & CMS */}
                        <div className="border-2 border-ink p-6 bg-white shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Freelance <br />& CMS</h3>
                            <p className="text-sm mb-6 leading-relaxed">
                                Extensive experience delivering custom solutions.
                                Expert in <span className="font-bold">WordPress</span> customisation and building custom JS features for Elementor Pro.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['WordPress', 'Elementor Pro', 'Custom CSS/JS', 'Client Relations'].map(t => (
                                    <span key={t} className="text-xs font-bold border border-ink px-1 bg-gray-100">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Certifications List */}
                    <div className="mt-12 border-2 border-ink p-6 bg-white shadow-neo">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-ink"></div>
                            Certifications
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* University of Michigan */}
                            <div>
                                <h4 className="font-medium border-b border-ink mb-3 pb-1">University of Michigan (Coursera)</h4>
                                <ul className="list-none space-y-2 text-sm">
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-acid font-bold">»</span>
                                        <a
                                            href="https://coursera.org/share/076eec0f1de2136d9806fd99763d8c83"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Interactivity with JavaScript
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-acid font-bold">»</span>
                                        <a
                                            href="https://coursera.org/share/bd82982683be5bfbd25d4f4d2bacca0f"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Introduction to CSS3
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-acid font-bold">»</span>
                                        <a
                                            href="https://coursera.org/share/a6daf21511a46339492d40238f7dbbd9"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Introduction to HTML5
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* freeCodeCamp */}
                            <div>
                                <h4 className="font-medium border-b border-ink mb-3 pb-1">freeCodeCamp</h4>
                                <ul className="list-none space-y-2 text-sm">
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-acid font-bold">»</span>
                                        <a
                                            href="https://www.freecodecamp.org/certification/hannesprinsloo/javascript-algorithms-and-data-structures-v8"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            JavaScript Algorithms & Data Structures (300 hours)
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-acid font-bold">»</span>
                                        <a
                                            href="https://www.freecodecamp.org/certification/hannesprinsloo/responsive-web-design"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Responsive Web Design (300 hours)
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 group/link">
                                        <span className="text-acid font-bold">»</span>
                                        <a
                                            href="https://www.freecodecamp.org/certification/hannesprinsloo/front-end-development-libraries"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-acid hover:text-ink transition-colors decoration-2 underline-offset-2"
                                        >
                                            Front End Development Libraries (300 hours)
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Projects */}
                <section id="work" className="mb-32 scroll-mt-32">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-1 bg-ink flex-grow"></div>
                        <h2 className="text-2xl font-bold uppercase bg-ink text-paper px-4 py-1 rotate-2">
                            Projects
                        </h2>
                        <div className="h-1 bg-ink flex-grow"></div>
                    </div>

                    {/* Cassette Tape / Module Card - Music School Manager */}
                    <div className="border-2 border-ink shadow-neo bg-white p-2 relative group hover:bg-acid transition-colors duration-0 mb-12">
                        {/* The "Label" */}
                        <div className="border border-ink p-6 md:p-10 flex flex-col md:flex-row gap-10 bg-paper group-hover:bg-white transition-colors h-full">

                            {/* Visual Side */}
                            <div className="w-full md:w-1/2 aspect-video border-2 border-ink bg-gray-200 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-300">
                                {/* Abstract Lines / Screenprint Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,#1A1A1A_1px,transparent_1px)] bg-[length:10px_10px] opacity-10"></div>
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="w-full h-full border-2 border-dashed border-ink flex items-center justify-center">
                                        <span className="font-sans font-bold text-4xl opacity-20 transform -rotate-12">PREVIEW</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="w-full md:w-1/2 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-3xl font-black uppercase leading-none">Music School<br />Manager</h3>
                                        <span className="border border-ink px-2 py-1 text-xs font-bold bg-acid">v1.0-alpha</span>
                                    </div>
                                    <p className="text-sm mb-6 border-l-2 border-ink pl-4">
                                        A comprehensive CRM for managing students, scheduling, and billing.
                                        Built for high-volume data handling and reliability.
                                    </p>

                                    {/* Tech Tags */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {['React', 'PostgreSQL', 'Node.js', 'Vite'].map(tech => (
                                            <span key={tech} className="text-xs font-bold uppercase border border-ink px-2 py-1 hover:bg-ink hover:text-paper cursor-default transition-colors">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <a
                                    href="https://demo.hannesprinsloo.dev"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-ink text-paper text-center font-bold uppercase py-4 border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink hover:shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                >
                                    Launch Demo Application
                                </a>
                            </div>
                        </div>

                        {/* Decor: Screws */}
                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-ink bg-gray-300 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-ink bg-gray-300 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-ink bg-gray-300 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-ink bg-gray-300 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                    </div>

                    {/* Placeholder Project Card */}
                    <div className="border-2 border-ink shadow-neo bg-white p-2 relative group hover:bg-acid transition-colors duration-0">
                        {/* The "Label" */}
                        <div className="border border-ink p-6 md:p-10 flex flex-col md:flex-row gap-10 bg-paper group-hover:bg-white transition-colors h-full">

                            {/* Visual Side */}
                            <div className="w-full md:w-1/2 aspect-video border-2 border-ink bg-gray-200 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-300">
                                {/* Abstract Lines / Screenprint Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,#1A1A1A_1px,transparent_1px)] bg-[length:10px_10px] opacity-10"></div>
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="w-full h-full border-2 border-dashed border-ink flex items-center justify-center">
                                        <span className="font-sans font-bold text-4xl opacity-20 transform -rotate-12">COMING SOON</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="w-full md:w-1/2 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-3xl font-black uppercase leading-none">Another Cool<br />Project</h3>
                                        <span className="border border-ink px-2 py-1 text-xs font-bold bg-acid">v1.0</span>
                                    </div>
                                    <p className="text-sm mb-6 border-l-2 border-ink pl-4">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                                    </p>

                                    {/* Tech Tags */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {['React', 'TypeScript', 'Tailwind', '...'].map(tech => (
                                            <span key={tech} className="text-xs font-bold uppercase border border-ink px-2 py-1 hover:bg-ink hover:text-paper cursor-default transition-colors">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <a
                                    href="#"
                                    className="block w-full bg-ink text-paper text-center font-bold uppercase py-4 border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink hover:shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none opacity-80 cursor-not-allowed"
                                >
                                    Work in Progress
                                </a>
                            </div>
                        </div>

                        {/* Decor: Screws */}
                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-ink bg-gray-300 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-ink bg-gray-300 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-ink bg-gray-300 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-ink bg-gray-300 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
                        </div>
                    </div>
                </section>


                {/* Experience Section */}
                <section id="experience" className="mb-32 scroll-mt-32">
                    <h2 className="text-4xl font-medium mb-12 flex items-center gap-4">
                        <span className="w-8 h-8 bg-acid border-2 border-ink block"></span>
                        Experience
                    </h2>
                    <div className="border-l-4 border-ink pl-8 space-y-12 relative">
                        {/* Timeline Item 1 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-paper rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Freelance Web Developer</h3>
                            <span className="text-sm font-mono text-gray-500 mb-4 block bg-gray-200 inline-block px-2">2023 - Present</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
                            </p>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-paper rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Professional Musician</h3>
                            <span className="text-sm font-mono text-gray-500 mb-4 block bg-gray-200 inline-block px-2">2013 - Present</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Developing discipline, creativity, and the ability to perform under pressure.
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="absolute -left-[43px] top-1 w-5 h-5 bg-paper rounded-full border-4 border-ink group-hover:bg-acid transition-colors"></div>
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-ink pb-2">Something or other</h3>
                            <span className="text-sm font-mono text-gray-500 mb-4 block bg-gray-200 inline-block px-2">2013 - Present</span>
                            <p className="max-w-2xl leading-relaxed text-sm">
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Developing discipline, creativity, and the ability to perform under pressure.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Tech Stack Grid */}
                <section>
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                        <span className="w-4 h-4 bg-acid border border-ink inline-block"></span>
                        Technical Arsenal
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['TypeScript', 'React', 'Redux', 'Zustand', 'Node.js', 'Express', 'PostgreSQL', 'WordPress', 'Elementor Pro', 'HTML', 'CSS', 'Tailwind', 'Vite', 'Git', 'Vercel', 'Render', 'Supabase', 'Figma', 'Designer-Speak'].map((tool, i) => (
                            <div key={tool} className="border-2 border-ink p-4 hover:shadow-neo hover:bg-white transition-all cursor-default">
                                <div className="text-xs text-gray-400 mb-1">0{i + 1}</div>
                                <div className="font-bold uppercase">{tool}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer id="contact" className="mt-32 pt-10 border-t-4 border-ink flex flex-col md:flex-row justify-between items-start md:items-end gap-8 scroll-mt-32">
                    <div>
                        <div className="text-6xl font-black text-transparent" style={{ WebkitTextStroke: '1px #1A1A1A' }}>HP_DEV</div>
                    </div>

                    <div className="flex gap-4">
                        <a href="mailto:johannespprinsloo@gmail.com" className="bg-acid border-2 border-ink px-6 py-3 font-bold uppercase hover:shadow-neo hover:-translate-y-1 transition-all">
                            Send me a mail
                        </a>
                    </div>
                </footer>

            </main>
        </div>
    )
}

export default App
