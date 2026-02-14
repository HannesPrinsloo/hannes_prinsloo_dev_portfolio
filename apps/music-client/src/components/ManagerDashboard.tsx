import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
    fetchManagerEvents,
    fetchManagerStudents,
    fetchManagerSchedule,
    fetchManagerAttendance,
    bookStudentForEvent,
    cancelEventBooking,
    updateParentNote,
    type RosterEntry
} from '../services/api';
import BillingAccordion from './BillingAccordion';
import '../App.css';

const ManagerDashboard = () => {
    const { user, profile } = useAuthStore();

    // Tabs
    const [activeTab, setActiveTab] = useState<'students' | 'events' | 'schedule' | 'attendance'>('students');

    // Data State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [managerEvents, setManagerEvents] = useState<any[]>([]);
    const [managerStudents, setManagerStudents] = useState<any[]>([]);
    const [managerSchedule, setManagerSchedule] = useState<any[]>([]);
    const [managerAttendance, setManagerAttendance] = useState<any[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [eventsData, studentsData, scheduleData, attendanceData] = await Promise.all([
                fetchManagerEvents(),
                fetchManagerStudents(),
                fetchManagerSchedule(),
                fetchManagerAttendance()
            ]);

            setManagerEvents(eventsData);
            setManagerStudents(studentsData);
            setManagerSchedule(scheduleData);
            setManagerAttendance(attendanceData);
            setError(null);
        } catch (err: any) {
            console.error("Error loading manager data:", err);
            setError("Failed to load dashboard data. " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            // Role ID 3 is Manager. Check profile for role.
            if (Number(profile?.role_id) === 3) {
                loadData();
            } else {
                setLoading(false);
            }
        }
    }, [user, profile]);

    const handleBookStudent = async (eventId: number, studentId: number) => {
        try {
            await bookStudentForEvent(eventId, studentId);
            await loadData();
            alert("Student booked successfully!");
        } catch (err: any) {
            alert("Booking failed: " + err.message);
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await cancelEventBooking(bookingId);
            await loadData();
        } catch (err: any) {
            alert("Cancellation failed: " + err.message);
        }
    };

    const handleUpdateNote = async (enrollmentId: number, currentNote: string) => {
        const newNote = prompt("Enter a note for the teacher:", currentNote || "");
        if (newNote === null) return; // Cancelled
        try {
            await updateParentNote(enrollmentId, newNote);
            // Optimistic update or reload
            const updatedSchedule = managerSchedule.map(lesson =>
                lesson.enrollment_id === enrollmentId ? { ...lesson, parent_note: newNote } : lesson
            );
            setManagerSchedule(updatedSchedule);
        } catch (err: any) {
            alert("Failed to update note: " + err.message);
        }
    };

    if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;
    if (error) return <div className="dashboard-error">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Manager Dashboard</h2>
                <div className="user-info">
                    {profile?.first_name} {profile?.last_name} (ID: {user?.user_id})
                </div>
            </div>

            <div className="admin-tabs">
                <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>My Students</button>
                <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Classes</button>
                <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
                <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'students' && (
                    <div className="manager-students-section">
                        <h3>My Students</h3>
                        {managerStudents.length === 0 ? <p>No students linked.</p> : (
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Age</th>
                                            <th>Level</th>
                                            <th>Teacher</th>
                                            <th>Relationship</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {managerStudents.map((s: any) => (
                                            <tr key={s.user_id}>
                                                <td>{s.first_name} {s.last_name}</td>
                                                <td>{s.age}</td>
                                                <td>{s.current_level_name}</td>
                                                <td>{s.teacher_first_name ? `${s.teacher_first_name} ${s.teacher_last_name}` : 'Unassigned'}</td>
                                                <td>{s.relationship_type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="manager-schedule-section">
                        <h3>Upcoming Classes</h3>
                        {managerSchedule.length === 0 ? <p>No upcoming classes found.</p> : (
                            <div className="schedule-cards">
                                {managerSchedule.map((lesson: any) => {
                                    const date = new Date(lesson.start_time);
                                    return (
                                        <div key={lesson.lesson_id} className="lesson-card-item" style={{
                                            background: '#333', padding: '15px', borderRadius: '8px', marginBottom: '15px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div className="lesson-info">
                                                <h4 style={{ margin: '0 0 5px 0', color: '#4CAF50' }}>
                                                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                </h4>
                                                <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div style={{ color: '#aaa', marginTop: '5px' }}>
                                                    {lesson.student_first_name}'s {lesson.instrument_name || 'Music'} Lesson
                                                    with {lesson.teacher_first_name} {lesson.teacher_last_name}
                                                </div>
                                                <div style={{ fontSize: '0.9em', marginTop: '5px' }}>📍 {lesson.venue}</div>
                                            </div>

                                            <div className="lesson-actions" style={{ textAlign: 'right', minWidth: '200px' }}>
                                                <div style={{ marginBottom: '10px', fontStyle: 'italic', color: '#ddd' }}>
                                                    {lesson.parent_note ? `Note: "${lesson.parent_note}"` : "No notes for teacher"}
                                                </div>
                                                <button
                                                    onClick={() => handleUpdateNote(lesson.enrollment_id, lesson.parent_note)}
                                                    style={{ background: '#2196F3', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    {lesson.parent_note ? 'Edit Note' : 'Add Note to Teacher'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="manager-attendance-section">
                        {/* <h3>Attendance & Billing</h3> */}
                        {managerStudents.length === 0 ? <p>No students linked.</p> : (
                            <BillingAccordion
                                students={managerStudents.map(s => ({
                                    student_id: s.user_id,
                                    student_first_name: s.first_name,
                                    student_last_name: s.last_name,
                                    student_phone: s.phone_number,
                                    date_of_birth: s.date_of_birth,
                                    age: s.age,
                                    manager_first_name: 'You',
                                    manager_last_name: '',
                                    manager_phone: '',
                                    relationship_type: s.relationship_type,
                                    current_level_id: s.level_id,
                                    current_level_name: s.current_level_name,
                                    instrument_list: s.instrument_list
                                } as RosterEntry))}
                                schedule={[...managerSchedule, ...managerAttendance].map(l => ({
                                    lesson_id: l.lesson_id,
                                    start_time: l.start_time,
                                    end_time: l.end_time || '',
                                    lesson_status: l.lesson_status || 'booked',
                                    student_id: l.student_id,
                                    student_first_name: l.student_first_name,
                                    student_last_name: l.student_last_name,
                                    instrument_name: l.instrument_name,
                                    attendance_status: l.attendance_status || (new Date(l.start_time) < new Date() ? 'Pending' : undefined), // Default pending if past and no status
                                    attendance_notes: l.teacher_notes || l.attendance_notes,
                                    parent_note: l.parent_note,
                                    duration_minutes: l.duration_minutes || 60
                                }))}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="manager-events-section">
                        <h3>Upcoming Events for Your Students</h3>
                        {managerEvents.length === 0 ? (
                            <p>No relevant upcoming events found.</p>
                        ) : (
                            <div className="events-list">
                                {managerEvents.map(event => (
                                    <div key={event.event_id} className="event-card">
                                        <h4>{event.event_name} <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>({event.event_type})</span></h4>
                                        <p><strong>Date:</strong> {new Date(event.start_time).toLocaleString()}</p>
                                        <p><strong>Venue:</strong> {event.venue_name}</p>
                                        <p><strong>Description:</strong> {event.description}</p>
                                        <div className="manager-booking-sections" style={{ marginTop: '15px', display: 'flex', gap: '20px' }}>
                                            <div style={{ flex: 1, background: '#333', padding: '10px', borderRadius: '4px' }}>
                                                <h5>Eligible Students</h5>
                                                {event.eligible_students.length === 0 ? <p style={{ fontSize: '0.9em', color: '#aaa' }}>None</p> : (
                                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                                        {event.eligible_students.map((s: any) => (
                                                            <li key={s.user_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                                <span>{s.first_name} ({s.current_level_name})</span>
                                                                <button onClick={() => handleBookStudent(event.event_id, s.user_id)} style={{ background: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', padding: '2px 8px', cursor: 'pointer' }}>Book</button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, background: '#444', padding: '10px', borderRadius: '4px' }}>
                                                <h5>Booked Students</h5>
                                                {event.booked_students.length === 0 ? <p style={{ fontSize: '0.9em', color: '#aaa' }}>None</p> : (
                                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                                        {event.booked_students.map((s: any) => (
                                                            <li key={s.user_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                                <span>{s.first_name}</span>
                                                                <button onClick={() => handleCancelBooking(s.booking_id)} style={{ background: '#FF5252', color: 'white', border: 'none', borderRadius: '3px', padding: '2px 8px', cursor: 'pointer' }}>Cancel</button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;