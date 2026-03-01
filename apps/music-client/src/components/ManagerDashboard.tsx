import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import BottomNav from './BottomNav';
import '../App.css';

const ManagerDashboard = () => {
    const { user, profile } = useAuthStore();
    const queryClient = useQueryClient();

    // Tabs
    const [activeTab, setActiveTab] = useState<'students' | 'events' | 'schedule' | 'attendance'>('students');

    const isManager = Number(profile?.role_id) === 3;

    // React Query Data Fetching
    const { data: managerEvents = [], isLoading: eventsLoading, isError: eventsError } = useQuery({
        queryKey: ['managerEvents', user?.user_id],
        queryFn: fetchManagerEvents,
        enabled: !!user && isManager,
        refetchInterval: 10000,
    });

    const { data: managerStudents = [], isLoading: studentsLoading, isError: studentsError } = useQuery({
        queryKey: ['managerStudents', user?.user_id],
        queryFn: fetchManagerStudents,
        enabled: !!user && isManager,
        refetchInterval: 10000,
    });

    const { data: managerSchedule = [], isLoading: scheduleLoading, isError: scheduleError } = useQuery({
        queryKey: ['managerSchedule', user?.user_id],
        queryFn: fetchManagerSchedule,
        enabled: !!user && isManager,
        refetchInterval: 10000,
    });

    const { data: managerAttendance = [], isLoading: attendanceLoading, isError: attendanceError } = useQuery({
        queryKey: ['managerAttendance', user?.user_id],
        queryFn: fetchManagerAttendance,
        enabled: !!user && isManager,
        refetchInterval: 10000,
    });

    // React Query Mutations
    const bookStudentMutation = useMutation({
        mutationFn: ({ eventId, studentId }: { eventId: number, studentId: number }) => bookStudentForEvent(eventId, studentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managerEvents'] });
            alert("Student booked successfully!");
        },
        onError: (err: any) => {
            queryClient.invalidateQueries({ queryKey: ['managerEvents'] });
            alert("Booking failed: " + err.message);
        }
    });

    const cancelBookingMutation = useMutation({
        mutationFn: (bookingId: number) => cancelEventBooking(bookingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managerEvents'] });
        },
        onError: (err: any) => {
            alert("Cancellation failed: " + err.message);
        }
    });

    const updateNoteMutation = useMutation({
        mutationFn: ({ enrollmentId, newNote }: { enrollmentId: number, newNote: string }) => updateParentNote(enrollmentId, newNote),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managerSchedule'] });
            queryClient.invalidateQueries({ queryKey: ['managerAttendance'] });
        },
        onError: (err: any) => {
            alert("Failed to update note: " + err.message);
        }
    });

    const handleBookStudent = (eventId: number, studentId: number) => {
        bookStudentMutation.mutate({ eventId, studentId });
    };

    const handleCancelBooking = (bookingId: number) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        cancelBookingMutation.mutate(bookingId);
    };

    const handleUpdateNote = (enrollmentId: number, currentNote: string) => {
        const newNote = prompt("Enter a note for the teacher:", currentNote || "");
        if (newNote === null) return; // Cancelled
        updateNoteMutation.mutate({ enrollmentId, newNote });
    };

    const loading = !user || (isManager && (eventsLoading || studentsLoading || scheduleLoading || attendanceLoading));
    const error = eventsError || studentsError || scheduleError || attendanceError;

    if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;
    if (error) return <div className="dashboard-error">Error: Failed to load dashboard data.</div>;

    return (
        /* CHANGELOG: Refactored ManagerDashboard layout container, header, and tabs to use Tailwind CSS utility classes. */
        <div className="w-full max-w-7xl mx-auto md:p-5 box-border">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-5 gap-4">
                <h2 className="text-2xl font-bold">Manager Dashboard</h2>
            </div>

            <div className="hidden md:flex flex-wrap items-center gap-2.5 md:justify-center mb-5">
                <button className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${activeTab === 'students' ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide' : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'}`} onClick={() => setActiveTab('students')}>My Students</button>
                <button className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${activeTab === 'schedule' ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide' : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'}`} onClick={() => setActiveTab('schedule')}>Classes</button>
                <button className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${activeTab === 'attendance' ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide' : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'}`} onClick={() => setActiveTab('attendance')}>Attendance</button>
                <button className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${activeTab === 'events' ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide' : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'}`} onClick={() => setActiveTab('events')}>Events</button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'students' && (
                    <div className="manager-students-section">
                        <h3>My Students</h3>
                        {managerStudents.length === 0 ? <p>No students linked.</p> : (
                            <div className="w-full mt-5 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
                                <table className="w-full border-collapse bg-transparent mt-2 [&_th]:bg-[#f8f8f8] [&_th]:text-text-dark [&_th]:px-3 md:[&_th]:px-[25px] [&_th]:py-3 md:[&_th]:py-[18px] [&_th]:text-center [&_th]:font-semibold [&_th]:border-b-2 [&_th]:border-[#eee] [&_th]:tracking-[0.5px] [&_td]:px-3 md:[&_td]:px-[25px] [&_td]:py-3 md:[&_td]:py-[15px] [&_td]:text-text-dark [&_td]:border-b [&_td]:border-[#eee] [&_td]:text-center [&_td]:align-middle [&_tbody_tr:hover]:bg-[#f9f9f9] [&_tbody_tr]:transition-colors">
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
                                            background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eee'
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
                    <div className="mt-5">
                        <h3>Upcoming Events for Your Students</h3>
                        {managerEvents.length === 0 ? (
                            <p>No relevant upcoming events found.</p>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
                                {managerEvents.map(event => (
                                    <div key={event.event_id} className="bg-white p-5 rounded-xl mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>{event.event_name} <span style={{ fontSize: '0.8em', fontWeight: 'normal', color: '#666', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>({event.event_type})</span></h4>
                                        <p style={{ color: '#555' }}><strong>Date:</strong> {new Date(event.start_time).toLocaleString()}</p>
                                        <p style={{ color: '#555' }}><strong>Venue:</strong> {event.venue_name}</p>
                                        <p style={{ color: '#555' }}><strong>Description:</strong> {event.description}</p>
                                        <div className="manager-booking-sections" style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, background: '#f9f9f9', padding: '15px', borderRadius: '8px', minWidth: '250px', border: '1px solid #eee' }}>
                                                <h5 style={{ marginTop: 0, color: '#444' }}>Eligible Students</h5>
                                                {event.eligible_students.length === 0 ? <p style={{ fontSize: '0.9em', color: '#aaa' }}>None</p> : (
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                        {event.eligible_students.map((s: any) => (
                                                            <li key={s.user_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center', background: 'white', padding: '8px', borderRadius: '6px' }}>
                                                                <span>{s.first_name} <span style={{ fontSize: '0.85em', color: '#888' }}>({s.current_level_name})</span></span>
                                                                <button className="book-btn" onClick={() => handleBookStudent(event.event_id, s.user_id)} style={{ padding: '6px 12px', fontSize: '0.9em' }}>Book</button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, background: '#fff0f0', padding: '15px', borderRadius: '8px', minWidth: '250px', border: '1px solid #ffdcdc' }}>
                                                <h5 style={{ marginTop: 0, color: '#d32f2f' }}>Booked Students</h5>
                                                {event.booked_students.length === 0 ? <p style={{ fontSize: '0.9em', color: '#aaa' }}>None</p> : (
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                        {event.booked_students.map((s: any) => (
                                                            <li key={s.user_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center', background: 'white', padding: '8px', borderRadius: '6px' }}>
                                                                <span>{s.first_name}</span>
                                                                <button onClick={() => handleCancelBooking(s.booking_id)} style={{ background: 'white', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.9em' }}>Cancel</button>
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
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} role="manager" />
        </div>
    );
};

export default ManagerDashboard;