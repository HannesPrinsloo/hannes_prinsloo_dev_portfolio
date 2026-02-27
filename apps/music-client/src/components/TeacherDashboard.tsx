import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { fetchTeacherRoster, fetchLevels, assignStudentLevel, getTeacherSchedule, markAttendance, fetchTeacherEvents, bookStudentForEvent, type RosterEntry, type Level, type Lesson } from '../services/api';
import WeeklySchedule from './WeeklySchedule';
import BillingAccordion from './BillingAccordion';
import BottomNav from './BottomNav';
import '../App.css';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('roster');
    const [roster, setRoster] = useState<RosterEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [levels, setLevels] = useState<Level[]>([]);


    const [schedule, setSchedule] = useState<Lesson[]>([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    const [teacherEvents, setTeacherEvents] = useState<any[]>([]);

    const getRosterData = async () => {
        if (!user?.user_id) return;
        try {
            const data = await fetchTeacherRoster(user.user_id);
            setRoster(data);
            setError(null);
        } catch (err: any) {
            console.error("Error loading roster:", err);
            setError(err.message || "Failed to load student roster.");
        } finally {
            setLoading(false);
        }
    };

    const loadLevels = async () => {
        try {
            const data = await fetchLevels();
            setLevels(data);
        } catch (err) {
            console.error("Error loading levels:", err);
        }
    };

    const loadSchedule = async () => {
        if (!user?.user_id) return;
        setLoadingSchedule(true);
        try {
            const data = await getTeacherSchedule(user.user_id);
            setSchedule(data);
        } catch (err) {
            console.error("Error loading schedule:", err);
        } finally {
            setLoadingSchedule(false);
        }
    };

    const loadEvents = async () => {
        try {
            const data = await fetchTeacherEvents();
            setTeacherEvents(data);
        } catch (err) {
            console.error("Error loading events:", err);
        }
    };

    useEffect(() => {
        if (user?.user_id) {
            getRosterData();
            loadSchedule();
            loadLevels();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'events' && user?.user_id) {
            loadEvents();
        }
    }, [activeTab, user]);

    const handleLevelChange = async (studentId: number, levelId: string) => {
        if (!user?.user_id) return;
        const newLevelId = parseInt(levelId);
        if (isNaN(newLevelId)) return;

        try {
            await assignStudentLevel(studentId, newLevelId, user.user_id);
            await getRosterData();
        } catch (err) {
            alert("Failed to update level");
        }
    };

    const handleUpdateStatus = async (lessonId: number, status: string) => {
        if (!user?.user_id) return;
        const lesson = schedule.find(l => l.lesson_id === lessonId);
        if (!lesson) return;

        try {
            await markAttendance({
                lessonId,
                studentId: lesson.student_id as number,
                teacherId: user.user_id,
                status,
                notes: lesson.attendance_notes
            });
            await loadSchedule();
        } catch (err: any) {
            alert("Failed to update status: " + err.message);
        }
    };

    const handleUpdateNote = async (lessonId: number, note: string) => {
        if (!user?.user_id) return;
        const lesson = schedule.find(l => l.lesson_id === lessonId);
        if (!lesson) return;

        try {
            await markAttendance({
                lessonId,
                studentId: lesson.student_id as number,
                teacherId: user.user_id,
                status: lesson.attendance_status || 'Pending', // Keep existing status
                notes: note
            });
            await loadSchedule();
        } catch (err: any) {
            alert("Failed to update note: " + err.message);
        }
    };

    const handleBookStudent = async (eventId: number, studentId: number) => {
        try {
            await bookStudentForEvent(eventId, studentId);
            alert("Student booked successfully!");
            loadEvents();
        } catch (err: any) {
            alert("Booking failed: " + err.message);
        }
    };

    return (
        /* CHANGELOG: Refactored TeacherDashboard layout container and tabs to use Tailwind CSS utility classes instead of App.css .dashboard-container and .tabs classes. */
        <div className="w-full max-w-7xl mx-auto md:p-5 box-border">
            {/* Header removed - handled globally by Dashboard.tsx */}
            <div className="hidden md:flex flex-wrap items-center gap-2.5 md:justify-center mb-5">
                <button className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${activeTab === 'roster' ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide' : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'}`} onClick={() => setActiveTab('roster')}>My Roster</button>
                <button className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${activeTab === 'schedule' ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide' : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'}`} onClick={() => setActiveTab('schedule')}>Weekly Schedule</button>
                <button className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${activeTab === 'events' ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide' : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'}`} onClick={() => setActiveTab('events')}>Events</button>
                <button className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${activeTab === 'attendance' ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide' : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
            </div>

            <div className="tab-content">
                {activeTab === 'roster' && (
                    <div className="teacher-dashboard-data">
                        {loading && <p>Loading...</p>}
                        {error && <p className="error">{error}</p>}
                        {!loading && !error && (
                            <div className="flex justify-center w-full mt-5 overflow-x-auto">
                                <table className="w-full border-collapse bg-transparent mt-5 [&_th]:bg-[#f8f8f8] [&_th]:text-text-dark [&_th]:px-[25px] [&_th]:py-[18px] [&_th]:text-center [&_th]:font-semibold [&_th]:border-b-2 [&_th]:border-[#eee] [&_th]:tracking-[0.5px] [&_td]:px-[25px] [&_td]:py-[15px] [&_td]:text-text-dark [&_td]:border-b [&_td]:border-[#eee] [&_td]:text-center [&_td]:align-middle [&_tbody_tr:hover]:bg-[#f9f9f9] [&_tbody_tr]:transition-colors">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Student Name</th>
                                            <th>Age</th>
                                            <th>Level</th>
                                            <th>Phone</th>
                                            <th>Manager</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roster.map((entry) => (
                                            <tr key={entry.student_id}>
                                                <td>{entry.student_id}</td>
                                                <td>{entry.student_first_name} {entry.student_last_name}</td>
                                                <td>{entry.age !== null ? entry.age : '-'}</td>
                                                <td>
                                                    <select
                                                        value={entry.current_level_id || ''}
                                                        onChange={(e) => handleLevelChange(entry.student_id, e.target.value)}
                                                        className="level-select"
                                                    >
                                                        <option value="" disabled>Select Level</option>
                                                        {levels.map(lvl => (
                                                            <option key={lvl.level_id} value={lvl.level_id}>
                                                                {lvl.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>{entry.student_phone || 'N/A'}</td>
                                                <td>{entry.manager_first_name ? `${entry.manager_first_name} ${entry.manager_last_name}` : 'Self'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'schedule' && user?.user_id && (
                    <WeeklySchedule
                        teacherId={user.user_id}
                        onLessonCreated={loadSchedule}
                    />
                )}

                {activeTab === 'events' && (
                    <div className="mt-5">
                        <h3>Upcoming Events for Your Students</h3>
                        {teacherEvents.length === 0 ? <p>No relevant upcoming events found.</p> : (
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
                                {teacherEvents.map(event => (
                                    <div key={event.event_id} className="bg-white p-5 rounded-xl mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#eee]">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>{event.event_name} <span style={{ fontSize: '0.8em', fontWeight: 'normal', color: '#666', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>{event.event_type}</span></h4>
                                            <span style={{ color: '#666', fontWeight: '500' }}>{new Date(event.start_time).toLocaleDateString()}</span>
                                        </div>
                                        <p><strong>Venue:</strong> {event.venue_name}</p>
                                        <p style={{ color: '#555', lineHeight: '1.6' }}>{event.description}</p>

                                        <div style={{ marginTop: '15px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                            <h5 style={{ marginTop: 0, color: '#444' }}>Eligible Students</h5>
                                            {event.eligible_students.length === 0 ? <p style={{ fontSize: '0.9em', color: '#aaa' }}>None</p> : (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {event.eligible_students.map((s: any) => (
                                                        <li key={s.user_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #eee' }}>
                                                            <span>{s.first_name} {s.last_name} <span style={{ fontSize: '0.85em', color: '#888' }}>({s.current_level_name})</span></span>
                                                            <button
                                                                className="bg-primary-red text-white border-none px-3 py-1.5 text-[0.9em] rounded cursor-pointer hover:bg-black transition-colors"
                                                                onClick={() => handleBookStudent(event.event_id, s.user_id)}
                                                            >
                                                                Book
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div style={{ marginTop: '15px', padding: '5px' }}>
                                            <h5 style={{ color: '#444' }}>Already Booked</h5>
                                            {event.booked_students.length === 0 ? <p style={{ fontSize: '0.9em', color: '#aaa' }}>None</p> : (
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {event.booked_students.map((s: any) => (
                                                        <li key={s.user_id} style={{ fontSize: '0.9em', color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            ✅ <span>{s.first_name} {s.last_name}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="tab-section">
                        {loadingSchedule ? <p>Loading attendance...</p> : (
                            <BillingAccordion
                                students={roster}
                                schedule={schedule}
                                readOnly={false}
                                onUpdateStatus={handleUpdateStatus}
                                onUpdateNote={handleUpdateNote}
                            />
                        )}
                    </div>
                )}
            </div>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role="teacher" />
        </div>
    );
};

export default TeacherDashboard;