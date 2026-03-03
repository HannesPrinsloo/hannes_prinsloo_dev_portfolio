import React, { useEffect, useRef, useState } from 'react';
import MermaidDiagram from './MermaidDiagram';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
    const [showTourSection, setShowTourSection] = useState(false);

    // Video refs: 0 = mobile portrait, 1 = admin, 2 = teacher, 3 = manager
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [playingStates, setPlayingStates] = useState<boolean[]>([]);
    const introVideoRef = useRef<HTMLVideoElement | null>(null);

    // Lock body scroll when modal is open + 10s intro timer
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setShowTechnicalDetails(false);
            setShowTourSection(false);
            setPlayingStates([]);

            // Start 10s timer for intro video
            const timer = setTimeout(() => {
                if (introVideoRef.current) {
                    introVideoRef.current.pause();
                }
            }, 10000);

            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = 'unset';
            const timer = setTimeout(() => {
                setShowTechnicalDetails(false);
                setShowTourSection(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const togglePlayPause = (index: number, playbackRate: number = 1) => {
        const video = videoRefs.current[index];
        if (!video) return;

        if (video.paused) {
            if (video.ended) video.currentTime = 0;
            video.playbackRate = playbackRate;
            video.play();
            setPlayingStates(prev => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
        } else {
            video.pause();
            setPlayingStates(prev => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
        }
    };

    if (!isOpen) return null;

    const tourSections = [
        {
            title: 'Admin',
            video: '/assets/s15/s15-intro-web.mp4',
            description: 'Onboarding and assigning students to teachers, managing users\' information, creating events and viewing attendance and messaging - and more.'
        },
        {
            title: 'Teacher',
            video: '/assets/s15/s15-teacher-web.mp4',
            description: 'Assigning student syllabus levels, managing their own schedules with in-app messages from parents (managers), viewing/managing event bookings and marking attendance with accompanying messaging to parents.'
        },
        {
            title: 'Manager',
            video: '/assets/s15/s15-manager-web.mp4',
            description: 'Viewing schedules for all associated students, sending messages to teachers about specific lessons, viewing attendance and receiving messages from teachers as well as managing and booking events for their little rockstars.'
        }
    ];

    // Play button overlay component (same as FreelanceWorkModal)
    const PlayButton = ({ index, label }: { index: number; label: string }) => (
        <>
            {/* Dark overlay when paused */}
            <div className={`absolute inset-0 bg-ink/25 transition-opacity duration-300 pointer-events-none ${playingStates[index] ? 'opacity-0' : 'opacity-100'}`}></div>

            {/* Play Button */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playingStates[index] ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <button
                    className="w-16 h-16 md:w-20 md:h-20 bg-paper border-4 border-ink shadow-neo flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-acid"
                    aria-label={`Play ${label} video`}
                >
                    <svg viewBox="0 0 24 24" fill="var(--color-ink)" className="w-8 h-8 md:w-10 md:h-10 ml-1">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                </button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Container - Using same animation and shadow as BackstoryModal */}
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-paper border-4 border-ink shadow-[10px_10px_0px_0px_#1A1A1A] transform transition-all animate-paper-slam overflow-hidden">

                {/* Header (Sticky) */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b-4 border-ink bg-paper z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl md:text-4xl font-black uppercase leading-none tracking-tighter mix-blend-multiply dark:mix-blend-normal">
                            Music School Manager
                        </h2>
                        <span className="border border-ink px-2 py-1 text-xs font-bold bg-acid text-black hidden sm:inline-block">v1.0-beta</span>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex-shrink-0 border-2 border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors group"
                        aria-label="Close modal"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 transform group-hover:rotate-90 transition-transform">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-surface-muted bg-[linear-gradient(var(--color-ink)_1px,transparent_1px),linear-gradient(90deg,var(--color-ink)_1px,transparent_1px)] bg-[size:40px_40px] [background-position:center_center] relative">
                    {/* Subtle overlay to soften brutalist grid background */}
                    <div className="absolute inset-0 bg-paper/90 pointer-events-none mix-blend-normal hidden dark:block"></div>
                    <div className="absolute inset-0 bg-paper/85 pointer-events-none mix-blend-normal dark:hidden"></div>

                    <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8 md:gap-12">

                        {/* Video Showcase Area - Intro (10s autoplay) */}
                        <div className="w-full aspect-video border-4 border-ink bg-ink relative overflow-hidden shadow-neo-sm">
                            <video
                                ref={introVideoRef}
                                src="/assets/s15/s15-intro-web.mp4"
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                playsInline
                            >
                                Your browser does not support the video tag.
                            </video>

                            {/* Inner Video Border highlight */}
                            <div className="absolute inset-0 border-2 border-white/10 pointer-events-none mix-blend-overlay"></div>
                        </div>

                        {/* Rearranged: Mobile Video (left) + Overview & Features stacked (right) */}
                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
                            {/* Left: Portrait Mobile Video */}
                            <div
                                className="w-full md:w-[240px] border-4 border-ink bg-ink relative overflow-hidden shadow-neo-sm cursor-pointer group/video"
                                style={{ aspectRatio: '9 / 17.5' }}
                                onClick={() => togglePlayPause(0)}
                            >
                                <video
                                    ref={el => { videoRefs.current[0] = el; }}
                                    src="/assets/s15/s15-mobile-web.mp4"
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                    muted
                                    playsInline
                                    onPlay={() => setPlayingStates(prev => {
                                        const next = [...prev];
                                        next[0] = true;
                                        return next;
                                    })}
                                    onPause={() => setPlayingStates(prev => {
                                        const next = [...prev];
                                        next[0] = false;
                                        return next;
                                    })}
                                >
                                    Your browser does not support the video tag.
                                </video>

                                <PlayButton index={0} label="Mobile preview" />

                                {/* Inner Video Border highlight */}
                                <div className="absolute inset-0 border-2 border-white/10 pointer-events-none mix-blend-overlay"></div>
                            </div>

                            {/* Right: Project Overview + Key Features stacked */}
                            <div className="flex flex-col gap-8">
                                <div className="bg-paper border-2 border-ink p-6 shadow-neo-sm">
                                    <h3 className="text-xl font-bold uppercase border-b-2 border-ink pb-2 mb-4">Beta Version - Project Overview</h3>
                                    <p className="text-sm leading-relaxed font-mono">
                                        The idea for this app came from my own daily struggles with using multiple unrelated platforms to manage my music school related admin and scheduling. I also saw the school's
                                        admin office take on the burden of keeping 2000 students', their parents' and teachers' records straight. Every person currently has their own little island of data that has to be manually
                                        shared with everyone else - and the staff and owners are always stretched thin because of it. <br /><br />The beta version of the application already handles the complex relationships
                                        between multiple user roles: Administrators, Teachers, Students and their Parents/Guardians (affectionately called ‘Managers’ - because they manage little rockstars). <br />Day-to-day and
                                        recurring scheduling, teacher-student rosters, event eligibility and bookings, billing and registration are all handled with one source of truth for them all.
                                    </p>
                                    <p className="text-sm leading-relaxed font-mono mt-4">
                                        While it is still in development, the Minimum Viable Product (MVP) is ready for beta testing. I am currently in conversation with the owners of the school
                                        about an initial testing-phase rollout of our very own Client Relationship Management (CRM) application. Web-app for now, native iOS and Android soon to come.
                                    </p>
                                </div>

                                <div className="bg-paper border-2 border-ink p-6 shadow-neo-sm">
                                    <h3 className="text-xl font-bold uppercase border-b-2 border-ink pb-2 mb-4">Key Features</h3>
                                    <ul className="text-sm font-mono space-y-3">
                                        <li className="flex gap-2">
                                            <span className="text-ink font-bold">»</span>
                                            <span>Dashboards with distinct permission sets for each role</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-ink font-bold">»</span>
                                            <span>Complex event and lesson booking systems</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-ink font-bold">»</span>
                                            <span>Real-time UI updates and data synchronisation across sessions</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-ink font-bold">»</span>
                                            <span>Simple messaging between teachers and their parents (managers)</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Tour the App Toggle Button */}
                        <div className="flex justify-center my-4">
                            <button
                                onClick={() => setShowTourSection(!showTourSection)}
                                className={`
                                    bg-ink text-paper px-8 py-4 font-bold uppercase tracking-widest text-sm border-2 border-transparent
                                    hover:bg-acid hover:text-black hover:border-ink hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none
                                    flex items-center gap-3 group
                                `}
                            >
                                <span>Tour the App</span>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className={`w-5 h-5 transition-transform duration-300 ${showTourSection ? 'rotate-180' : 'group-hover:translate-y-1'}`}
                                >
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Tour the App Section */}
                        <div className={`
                            transition-all duration-500 overflow-hidden flex flex-col gap-10
                            ${showTourSection ? 'max-h-[5000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}
                        `}>
                            {tourSections.map((section, index) => {
                                const videoIndex = index + 1; // offset by 1 because 0 = mobile video
                                return (
                                    <div key={section.title} className="flex flex-col gap-4">
                                        <h3 className="text-2xl font-black uppercase inline-block bg-ink text-paper px-4 py-2 self-start shadow-neo-sm transform -rotate-1">
                                            {section.title}
                                        </h3>
                                        <div className="bg-paper border-2 border-ink p-6 shadow-neo-sm">
                                            <p className="text-sm leading-relaxed font-mono">
                                                {section.description}
                                            </p>
                                        </div>
                                        {/* Video with play button */}
                                        <div
                                            className="w-full aspect-video border-4 border-ink bg-ink relative overflow-hidden shadow-neo-sm cursor-pointer group/video"
                                            onClick={() => togglePlayPause(videoIndex)}
                                        >
                                            <video
                                                ref={el => { videoRefs.current[videoIndex] = el; }}
                                                src={section.video}
                                                className="w-full h-full object-cover"
                                                preload="metadata"
                                                muted
                                                playsInline
                                                onPlay={() => setPlayingStates(prev => {
                                                    const next = [...prev];
                                                    next[videoIndex] = true;
                                                    return next;
                                                })}
                                                onPause={() => setPlayingStates(prev => {
                                                    const next = [...prev];
                                                    next[videoIndex] = false;
                                                    return next;
                                                })}
                                            >
                                                Your browser does not support the video tag.
                                            </video>

                                            <PlayButton index={videoIndex} label={section.title} />

                                            {/* Inner Video Border highlight */}
                                            <div className="absolute inset-0 border-2 border-white/10 pointer-events-none mix-blend-overlay"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Toggle Button for Technical Details */}
                        <div className="flex justify-center my-4">
                            <button
                                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                                className={`
                                    bg-ink text-paper px-8 py-4 font-bold uppercase tracking-widest text-sm border-2 border-transparent
                                    hover:bg-acid hover:text-black hover:border-ink hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none
                                    flex items-center gap-3 group
                                `}
                            >
                                <span>Deep Dive for Nerds</span>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className={`w-5 h-5 transition-transform duration-300 ${showTechnicalDetails ? 'rotate-180' : 'group-hover:translate-y-1'}`}
                                >
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Technical Details View */}
                        <div className={`
                            transition-all duration-500 overflow-hidden flex flex-col gap-8
                            ${showTechnicalDetails ? 'max-h-[8000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}
                        `}>
                            {/* Mobile Gate — deep dive content is desktop-only */}
                            <div className="md:hidden bg-paper border-2 border-ink p-8 text-center">
                                <p className="font-mono text-sm text-ink/80">
                                    Nerds should check this site on desktop.
                                </p>
                            </div>

                            <div className="hidden md:contents">

                                {/* Tech Stack Bar */}
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['TypeScript', 'React', 'React Query', 'Zustand', 'Node.js', 'Express', 'Tailwind', 'PostgreSQL'].map(tech => (
                                        <span key={tech} className="text-xs font-bold uppercase border-2 border-ink bg-paper px-3 py-1.5 shadow-neo-sm">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="bg-paper border-2 border-ink p-6 md:p-8 shadow-neo-sm">
                                    <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                                        <span className="w-6 h-6 bg-acid border-2 border-ink flex-shrink-0"></span>
                                        Architecture & Challenges
                                    </h3>

                                    <div className="space-y-8 font-mono text-sm leading-relaxed">
                                        <div>
                                            <h4 className="font-bold text-lg mb-2 uppercase tracking-wide border-b border-ink/20 pb-1">The Concurrency Problem</h4>
                                            <p>
                                                In a multi-tenant environment where admins, teachers and managers are all looking at the same pool of students and events, data staleness isn't just annoying — it's dangerous. Here's a real scenario that kept me up at night:
                                            </p>
                                            <div className="mt-4 bg-surface-muted border-2 border-ink/20 p-4">
                                                <p className="font-bold text-xs uppercase tracking-widest mb-2 text-ink/60">The Scenario:</p>
                                                <p>
                                                    A Manager opens the Events tab and sees their child listed under "Eligible Students" for an upcoming concert. At the same time, a Teacher demotes that student's level — revoking their eligibility. The Manager's UI is now lying to them. If they click "Book" while looking at that stale data, the system could allow an invalid booking against business rules that no longer apply.
                                                </p>
                                            </div>
                                            <p className="mt-4">
                                                This isn't a hypothetical edge case. With multiple user roles operating on shared data simultaneously, it's an inevitability. The fix had to work on two layers.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-lg mb-2 uppercase tracking-wide border-b border-ink/20 pb-1">Solution Layer 1: PostgreSQL Transactions</h4>
                                            <p>
                                                The backend can never blindly trust what the client sends. Instead of just inserting a booking and hoping the eligibility data was current, I wrapped the critical mutation inside a strict SQL transaction. The transaction acquires a row-level lock, then runs a live validation query <em>inside</em> the transaction block to verify absolute current eligibility before the insert ever happens. If the student no longer qualifies, the whole thing rolls back and tells the client to refresh.
                                            </p>
                                            <div className="mt-4 border-2 border-ink bg-surface overflow-x-auto">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-ink text-paper border-b-2 border-ink">
                                                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                                                    <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                                                    <span className="ml-2 text-xs font-bold uppercase tracking-widest opacity-70">eventService.ts — bookStudent()</span>
                                                </div>
                                                <pre className="p-4 text-xs leading-relaxed overflow-x-auto"><code>{`const bookStudent = async (eventId, studentId, bookedByUserId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Row-level lock — prevent double-bookings
    const check = await client.query(
      'SELECT 1 FROM event_bookings WHERE event_id = $1 '
      + 'AND student_user_id = $2 FOR UPDATE',
      [eventId, studentId]
    );
    if (check.rows.length > 0) {
      throw new Error("Student already booked for this event");
    }

    // Re-validate CURRENT eligibility inside the transaction
    const validation = await client.query(\`
      WITH StudentInfo AS (
        SELECT u.date_of_birth,
          EXTRACT(YEAR FROM AGE(u.date_of_birth))::int AS age,
          (SELECT level_id FROM student_levels
           WHERE student_user_id = $2
           ORDER BY date_completed DESC LIMIT 1
          ) as current_level_id
        FROM users u WHERE user_id = $2 AND role_id = 4
      ),
      AllowedLevels AS (
        SELECT level_id FROM event_eligibility_levels
        WHERE event_id = $1
      )
      SELECT * FROM StudentInfo
      WHERE age <= 18
        AND (NOT EXISTS (SELECT 1 FROM AllowedLevels)
             OR current_level_id IN (
               SELECT level_id FROM AllowedLevels
             ))
    \`, [eventId, studentId]);

    if (validation.rows.length === 0) {
      throw new Error(
        "Student no longer eligible. Please refresh."
      );
    }

    await client.query(\`
      INSERT INTO event_bookings
        (event_id, student_user_id, booked_by_user_id,
         booking_status, booked_at)
      VALUES ($1, $2, $3, 'Confirmed', NOW())
      RETURNING *
    \`, [eventId, studentId, bookedByUserId]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};`}</code></pre>
                                            </div>
                                            <p className="mt-3 text-xs text-ink/60">
                                                The <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">FOR UPDATE</code> lock is key — it serialises concurrent booking attempts at the row level, so even if two users click "Book" at the exact same millisecond, only one gets through.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-lg mb-2 uppercase tracking-wide border-b border-ink/20 pb-1">Solution Layer 2: React Query Refactor</h4>
                                            <p>
                                                The backend locks are the last line of defence, but we don't actually want users hitting those locks in the first place. The real goal is keeping the UI honest — so a Manager never even <em>sees</em> a "Book" button for a student who's no longer eligible. The entire frontend was migrated away from manual <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">useEffect</code> fetching to TanStack Query (React Query).
                                            </p>
                                            <ul className="mt-4 space-y-3 pl-4 border-l-2 border-acid">
                                                <li><strong className="text-black bg-acid px-1 shadow-sm">Short-Polling:</strong> Dashboards silently re-fetch data in the background (every 10s) so the UI acts as a living document. If a Teacher changes a student's level, the Manager's event list reflects it within seconds — no manual refresh needed.</li>
                                                <li><strong className="text-black bg-acid px-1 shadow-sm">Cache Invalidation:</strong> Mutations preemptively invalidate query keys, forcing immediate background updates globally without manual prop-drilling or state juggling.</li>
                                            </ul>

                                            {/* Before / After Code Comparison */}
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Before */}
                                                <div className="border-2 border-ink bg-surface overflow-hidden">
                                                    <div className="px-4 py-2 bg-ink/10 border-b-2 border-ink">
                                                        <span className="text-xs font-bold uppercase tracking-widest">Before — useEffect</span>
                                                    </div>
                                                    <pre className="p-3 text-[11px] leading-relaxed overflow-x-auto"><code>{`const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        '/api/manager/events'
      );
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchEvents();
}, []);

// No background refresh.
// No cache invalidation.
// Stale data until manual reload.`}</code></pre>
                                                </div>
                                                {/* After */}
                                                <div className="border-2 border-ink bg-surface overflow-hidden">
                                                    <div className="px-4 py-2 bg-acid/30 border-b-2 border-ink">
                                                        <span className="text-xs font-bold uppercase tracking-widest">After — React Query</span>
                                                    </div>
                                                    <pre className="p-3 text-[11px] leading-relaxed overflow-x-auto"><code>{`const {
  data: events = [],
  isLoading,
  isError
} = useQuery({
  queryKey: ['managerEvents', user?.user_id],
  queryFn: fetchManagerEvents,
  enabled: !!user && isManager,
  refetchInterval: 10000, // 10s polling
});

const bookMutation = useMutation({
  mutationFn: ({ eventId, studentId }) =>
    bookStudentForEvent(eventId, studentId),
  onSuccess: () => {
    // Instant global cache invalidation
    queryClient.invalidateQueries({
      queryKey: ['managerEvents']
    });
  },
  onError: (err) => {
    // Server rejected — force refresh
    queryClient.invalidateQueries({
      queryKey: ['managerEvents']
    });
    alert("Booking failed: " + err.message);
  }
});`}</code></pre>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-xs text-ink/60">
                                                Three <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">useState</code> hooks, a <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">useEffect</code>, manual loading/error handling, and zero background updates — replaced with a single declarative hook that handles everything including automatic 10-second polling.
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                {/* Deep Dive Demo Videos */}
                                <div className="flex flex-col gap-10">
                                    {/* Event Creation Demo */}
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-2xl font-black uppercase inline-block bg-ink text-paper px-4 py-2 self-start shadow-neo-sm transform -rotate-1">
                                            Event Creation
                                        </h3>
                                        <div className="bg-paper border-2 border-ink p-6 shadow-neo-sm">
                                            <p className="text-sm leading-relaxed font-mono">
                                                Watch the concurrency solution in action. A Manager's dashboard shows zero events — then the view switches to an Admin creating a new event in real time. The moment the event is saved, we flip back to the Manager's session: the event is already there, and the eligible child is automatically available for booking. No refresh, no delay.
                                            </p>
                                        </div>
                                        <div
                                            className="w-full aspect-video border-4 border-ink bg-ink relative overflow-hidden shadow-neo-sm cursor-pointer group/video"
                                            onClick={() => togglePlayPause(4, 1.2)}
                                        >
                                            <video
                                                ref={el => { videoRefs.current[4] = el; }}
                                                src="/assets/s15/event-creation-demo-web.mp4"
                                                className="w-full h-full object-cover"
                                                preload="metadata"
                                                muted
                                                playsInline
                                                onPlay={() => setPlayingStates(prev => {
                                                    const next = [...prev];
                                                    next[4] = true;
                                                    return next;
                                                })}
                                                onPause={() => setPlayingStates(prev => {
                                                    const next = [...prev];
                                                    next[4] = false;
                                                    return next;
                                                })}
                                            >
                                                Your browser does not support the video tag.
                                            </video>

                                            <PlayButton index={4} label="Event Creation demo" />

                                            {/* Inner Video Border highlight */}
                                            <div className="absolute inset-0 border-2 border-white/10 pointer-events-none mix-blend-overlay"></div>
                                        </div>
                                    </div>

                                    {/* Register a New Student Demo */}
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-2xl font-black uppercase inline-block bg-ink text-paper px-4 py-2 self-start shadow-neo-sm transform -rotate-1">
                                            Register a New Student
                                        </h3>
                                        <div className="bg-paper border-2 border-ink p-6 shadow-neo-sm">
                                            <p className="text-sm leading-relaxed font-mono">
                                                This one shows the full registration pipeline. We start on a Teacher's roster — only 3 students. Switch to the Admin portal, register a brand new student along with their parent (Manager) details, and assign them to the teacher. Switch back to the Teacher's dashboard: the new student is already on their roster with all details populated. The teacher then assigns the appropriate syllabus level based on the child's age — completing the onboarding flow end-to-end.
                                            </p>
                                        </div>
                                        <div
                                            className="w-full aspect-video border-4 border-ink bg-ink relative overflow-hidden shadow-neo-sm cursor-pointer group/video"
                                            onClick={() => togglePlayPause(5, 1.2)}
                                        >
                                            <video
                                                ref={el => { videoRefs.current[5] = el; }}
                                                src="/assets/s15/add-student-demo-web.mp4"
                                                className="w-full h-full object-cover"
                                                preload="metadata"
                                                muted
                                                playsInline
                                                onPlay={() => setPlayingStates(prev => {
                                                    const next = [...prev];
                                                    next[5] = true;
                                                    return next;
                                                })}
                                                onPause={() => setPlayingStates(prev => {
                                                    const next = [...prev];
                                                    next[5] = false;
                                                    return next;
                                                })}
                                            >
                                                Your browser does not support the video tag.
                                            </video>

                                            <PlayButton index={5} label="Register a New Student demo" />

                                            {/* Inner Video Border highlight */}
                                            <div className="absolute inset-0 border-2 border-white/10 pointer-events-none mix-blend-overlay"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* ========================================= */}
                                {/* DATABASE ARCHITECTURE SECTION             */}
                                {/* ========================================= */}
                                <div className="bg-paper border-2 border-ink p-6 md:p-8 shadow-neo-sm">
                                    <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                                        <span className="w-6 h-6 bg-acid border-2 border-ink flex-shrink-0"></span>
                                        Database Architecture
                                    </h3>

                                    <div className="space-y-8 font-mono text-sm leading-relaxed">
                                        <p>
                                            The database layer is the real backbone of this application — and none of it was scaffolded or auto-generated. Every table, relationship and constraint was designed by hand to solve specific friction points in a real music school's operations. Below is the schema that powers everything: 18 tables, 36+ indexes and a web of foreign-key relationships that enforce business rules at the data level.
                                        </p>

                                        {/* ER Diagram — click to open interactive version */}
                                        <a
                                            href="https://mermaid.ai/d/b3365544-7531-4ed1-9075-acdade1f4024"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block relative group/diagram cursor-pointer"
                                        >
                                            <MermaidDiagram
                                                className="border-4 border-ink shadow-neo-sm overflow-hidden"
                                                chart={`erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS {
        int user_id PK
        int role_id FK
        string email UK
        string first_name
        boolean is_active
    }
    ROLES {
        int role_id PK
        string role_name UK
    }

    INSTRUMENTS ||--o{ LEVELS : "contains"
    INSTRUMENTS ||--o{ STUDENT_INSTRUMENTS : "learned by"
    INSTRUMENTS ||--o{ TEACHER_INSTRUMENTS : "taught by"
    LEVELS ||--o{ STUDENT_LEVELS : "achieved"
    USERS ||--o{ STUDENT_INSTRUMENTS : "as student"
    USERS ||--o{ TEACHER_INSTRUMENTS : "as teacher"
    USERS ||--o{ STUDENT_LEVELS : "tracks"

    INSTRUMENTS {
        int instrument_id PK
        string instrument_name UK
    }
    LEVELS {
        int level_id PK
        int instrument_id FK
        int level_number
        string level_name
    }
    STUDENT_INSTRUMENTS {
        int student_user_id FK
        int instrument_id FK
    }
    TEACHER_INSTRUMENTS {
        int teacher_user_id FK
        int instrument_id FK
    }
    STUDENT_LEVELS {
        int student_level_id PK
        int student_user_id FK
        int level_id FK
        date date_completed
    }

    LESSON_SERIES ||--o{ LESSONS : "generates"
    LESSONS ||--o{ ENROLLMENTS : "has"
    ENROLLMENTS ||--|| ATTENDANCE_RECORDS : "tracked by"
    USERS ||--o{ LESSON_SERIES : "teaches"
    INSTRUMENTS ||--o{ LESSONS : "subject"

    LESSON_SERIES {
        int lesson_series_id PK
        int teacher_user_id FK
        int student_user_id FK
        int instrument_id FK
        int day_of_week
        boolean is_group_lesson
    }
    LESSONS {
        int lesson_id PK
        int lesson_series_id FK
        int teacher_user_id FK
        uuid recurrence_group_id
        string lesson_status
        boolean is_catch_up
    }
    ENROLLMENTS {
        int enrollment_id PK
        int lesson_id FK
        int student_user_id FK
        boolean is_primary_student
    }
    ATTENDANCE_RECORDS {
        int attendance_id PK
        int enrollment_id FK
        string attendance_status
    }

    USERS ||--o{ MANAGER_STUDENT_RELATIONSHIPS : "manager"
    USERS ||--o{ MANAGER_STUDENT_RELATIONSHIPS : "student"
    USERS ||--o{ TEACHER_STUDENT_ROSTERS : "teacher"
    USERS ||--o{ TEACHER_STUDENT_ROSTERS : "student"

    MANAGER_STUDENT_RELATIONSHIPS {
        int id PK
        int manager_user_id FK
        int student_user_id FK
        string relationship_type
    }
    TEACHER_STUDENT_ROSTERS {
        int roster_id PK
        int teacher_user_id FK
        int student_user_id FK
    }

    EVENTS ||--o{ EVENT_BOOKINGS : "holds"
    EVENTS ||--o{ EVENT_ELIGIBILITY_LEVELS : "restricts"
    LEVELS ||--o{ EVENT_ELIGIBILITY_LEVELS : "qualifies"
    USERS ||--o{ EVENT_BOOKINGS : "booked for"
    ANNOUNCEMENTS ||--o{ USER_ANNOUNCEMENT_READ_STATUS : "logs"
    USERS ||--o{ USER_ANNOUNCEMENT_READ_STATUS : "reads"
    USERS ||--o{ MESSAGES : "sends"

    EVENTS {
        int event_id PK
        string event_name
        int max_capacity
        string event_type
        boolean is_active
    }
    EVENT_BOOKINGS {
        int event_booking_id PK
        int event_id FK
        int student_user_id FK
        string booking_status
    }
    EVENT_ELIGIBILITY_LEVELS {
        int event_eligibility_id PK
        int event_id FK
        int level_id FK
    }
    ANNOUNCEMENTS {
        int announcement_id PK
        int sender_user_id FK
        int target_role_id FK
        boolean is_global
    }
    USER_ANNOUNCEMENT_READ_STATUS {
        int id PK
        int user_id FK
        int announcement_id FK
    }
    MESSAGES {
        int message_id PK
        int sender_user_id FK
        int recipient_user_id FK
        int parent_message_id FK
        boolean is_read
    }
`}
                                            />
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-ink/0 group-hover/diagram:bg-ink/60 transition-all duration-300 flex items-center justify-center pointer-events-none">
                                                <div className="opacity-0 group-hover/diagram:opacity-100 transition-opacity duration-300 bg-paper border-2 border-ink px-6 py-3 shadow-neo-sm">
                                                    <span className="font-mono text-sm font-bold uppercase tracking-wider">View interactive diagram →</span>
                                                </div>
                                            </div>
                                        </a>

                                        {/* Design Decision Cards — 2×2 Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* 1. Unified Identity */}
                                            <div className="border-2 border-ink bg-surface p-5">
                                                <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <span className="text-lg">①</span> Unified Identity
                                                </h4>
                                                <p className="text-xs leading-relaxed">
                                                    <strong>The problem:</strong> In a music school, a "Parent" and a "Student" are not always two different people. Adult students act as their own managers — handling their own scheduling and billing.
                                                </p>
                                                <p className="text-xs leading-relaxed mt-2">
                                                    <strong>The solution:</strong> A single <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">users</code> table with a <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">role_id</code> FK. One source of truth for every identity — no duplicate profiles across separate tables. Role-specific data lives in extension tables like <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">student_levels</code> and <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">teacher_instruments</code>.
                                                </p>
                                            </div>

                                            {/* 2. Term-Based Scheduling */}
                                            <div className="border-2 border-ink bg-surface p-5">
                                                <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <span className="text-lg">②</span> Term-Based Scheduling
                                                </h4>
                                                <p className="text-xs leading-relaxed">
                                                    <strong>The problem:</strong> Music school schedules are highly volatile. At the start of every term — or when a student's availability shifts (start of rugby season, school exams) — dozens of recurring spots need to be moved or removed.
                                                </p>
                                                <p className="text-xs leading-relaxed mt-2">
                                                    <strong>The solution:</strong> A decoupled blueprint-to-instance model. <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">lesson_series</code> defines the rule; <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">lessons</code> are the calendar instances. Every batch is tagged with a <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">recurrence_group_id</code> (UUID), enabling mass deletions or shifts in one action.
                                                </p>
                                            </div>

                                            {/* 3. Prerequisite Engine */}
                                            <div className="border-2 border-ink bg-surface p-5">
                                                <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <span className="text-lg">③</span> Prerequisite Engine
                                                </h4>
                                                <p className="text-xs leading-relaxed">
                                                    <strong>The problem:</strong> Events like masterclasses should only be available to students who have reached a specific skill level — and checking this manually doesn't scale.
                                                </p>
                                                <p className="text-xs leading-relaxed mt-2">
                                                    <strong>The solution:</strong> Instrument-specific levels (<code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">levels.instrument_id</code>) link to events via the <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">event_eligibility_levels</code> junction table. The database gatekeeps access automatically — the same validation used in the <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">bookStudent()</code> transaction shown above.
                                                </p>
                                            </div>

                                            {/* 4. Defensive Integrity */}
                                            <div className="border-2 border-ink bg-surface p-5">
                                                <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <span className="text-lg">④</span> Defensive Integrity
                                                </h4>
                                                <p className="text-xs leading-relaxed">
                                                    <strong>The approach:</strong> Business rules enforced at the database level — not just in application code. If the frontend has a bug, the data stays clean.
                                                </p>
                                                <ul className="text-xs leading-relaxed mt-2 space-y-1">
                                                    <li>» <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">unique_teacher_lesson_time</code> — physically prevents double-booking a teacher's timeslot</li>
                                                    <li>» <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">unique_attendance_per_enrollment</code> — one attendance record per enrollment, no double-billing</li>
                                                    <li>» <code className="bg-surface-muted px-1 border border-ink/30 relative -top-[1px]">chk_parent_not_self</code> — CHECK constraint preventing message threading loops</li>
                                                    <li>» Composite PKs on junction tables enforce uniqueness by structure</li>
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Summary Table */}
                                        <div className="border-2 border-ink overflow-hidden">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-ink text-paper">
                                                        <th className="text-left px-4 py-3 font-bold uppercase tracking-widest">Challenge</th>
                                                        <th className="text-left px-4 py-3 font-bold uppercase tracking-widest">Architectural Solution</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-t border-ink/20">
                                                        <td className="px-4 py-3 font-bold">Identity Overlap</td>
                                                        <td className="px-4 py-3">Single <code className="bg-surface-muted px-1 border border-ink/30">users</code> table — one source of truth for adult students</td>
                                                    </tr>
                                                    <tr className="border-t border-ink/20 bg-surface-muted/30">
                                                        <td className="px-4 py-3 font-bold">Schedule Volatility</td>
                                                        <td className="px-4 py-3"><code className="bg-surface-muted px-1 border border-ink/30">lesson_series</code> blueprinting for batch removal at term-ends</td>
                                                    </tr>
                                                    <tr className="border-t border-ink/20">
                                                        <td className="px-4 py-3 font-bold">Prerequisites</td>
                                                        <td className="px-4 py-3">Instrument-linked <code className="bg-surface-muted px-1 border border-ink/30">levels</code> table gating event access</td>
                                                    </tr>
                                                    <tr className="border-t border-ink/20 bg-surface-muted/30">
                                                        <td className="px-4 py-3 font-bold">Data Collisions</td>
                                                        <td className="px-4 py-3">Multi-column <code className="bg-surface-muted px-1 border border-ink/30">UNIQUE</code> constraints enforcing business rules</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                            </div>{/* End desktop-only wrapper */}
                        </div>

                    </div>
                </div>

                {/* Footer Decor */}
                <div className="h-2 bg-[repeating-linear-gradient(45deg,var(--color-ink),var(--color-ink)_10px,var(--color-acid)_10px,var(--color-acid)_20px)] border-t-4 border-ink z-10 flex-shrink-0"></div>
            </div>
        </div>
    );
};

export default ProjectModal;
