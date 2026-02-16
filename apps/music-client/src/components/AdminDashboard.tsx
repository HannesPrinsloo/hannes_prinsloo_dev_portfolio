
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
    fetchTeacherRoster, getTeacherSchedule, deleteUser,
    fetchEvents, createEvent, deleteEvent, getEligibleStudentsForEvent, getBookedStudentsForEvent,
    bookStudentForEvent, cancelEventBooking, fetchLevels,
    type RosterEntry, type Lesson, type EventData, type StudentEligibility, type Level,
    assignTeacher // New Import
} from '../services/api';
import AddUserModal from './AddUserModal';
import BillingAccordion from './BillingAccordion';
import FamilyRegistrationModal from './FamilyRegistrationModal';
import BottomNav from './BottomNav';
import MobileUserList from './MobileUserList';
import MobileUserDetailModal from './MobileUserDetailModal';

// ...

import type { UserData, AdminLesson } from '../types';

// ... inside AdminDashboard ...

// Extended Lesson type to include attendance data
// Removed local interface to use shared type from ../types
// interface AdminLesson extends Lesson { ... }

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
    const { user, profile } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);

    // Main Tab State
    const [mainTab, setMainTab] = useState<'Students' | 'Teachers' | 'Managers' | 'Admins' | 'Events'>('Teachers');

    // Add User/Edit User Modal State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserData | undefined>(undefined);

    // Family Modal State
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

    // Events State
    const [events, setEvents] = useState<EventData[]>([]);
    const [pastEvents, setPastEvents] = useState<EventData[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
    const [newEventData, setNewEventData] = useState<any>({
        eventName: '',
        description: '',
        venueName: '',
        startTime: '',
        endTime: '',
        eventType: 'Workshop',
        maxCapacity: 50,
        levelIds: []
    });
    const [levels, setLevels] = useState<Level[]>([]);
    const [eligibleStudents, setEligibleStudents] = useState<StudentEligibility[]>([]);
    const [bookedStudents, setBookedStudents] = useState<any[]>([]);
    const [eventLoading, setEventLoading] = useState(false);

    const handleEditUser = (user: UserData, event: React.MouseEvent) => {
        event.stopPropagation();
        setUserToEdit(user);
        setIsAddUserOpen(true);
    };

    const handleAddUser = () => {
        if (mainTab === 'Students') {
            setIsFamilyModalOpen(true);
        } else {
            setUserToEdit(undefined);
            setIsAddUserOpen(true);
        }
    };

    // ... existing ...



    // Teacher Selection state
    const [selectedTeacher, setSelectedTeacher] = useState<UserData | null>(null);

    // Mobile Modal State
    const [selectedMobileUser, setSelectedMobileUser] = useState<UserData | null>(null);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

    const handleMobileUserClick = (user: UserData) => {
        setSelectedMobileUser(user);
        setIsMobileModalOpen(true);
        if (mainTab === 'Teachers') {
            setSelectedTeacher(user);
        }
    };
    const [teacherDetailTab, setTeacherDetailTab] = useState<'roster' | 'attendance'>('roster');

    // Teacher Detail data
    const [teacherRoster, setTeacherRoster] = useState<RosterEntry[]>([]);
    const [teacherSchedule, setTeacherSchedule] = useState<AdminLesson[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);


    const getAllData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users`, { credentials: 'include' });
            if (response.ok) {
                const result = await response.json();
                setAllUsers(result);
                setError(null);
            } else {
                setError("Failed to load users.");
            }
        } catch (err) {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherAssignmentChange = async (studentId: number, newTeacherIdStr: string, _currentTeacherName: string) => {
        const newTeacherId = newTeacherIdStr ? Number(newTeacherIdStr) : null;
        const action = newTeacherId ? "Assign to new teacher?" : "Remove assigned teacher?";

        if (confirm(`${action} This will update the student's enrollment.`)) {
            try {
                await assignTeacher(studentId, newTeacherId);
                await getAllData(); // Refresh to show new assignment
            } catch (err: any) {
                alert("Failed to update assignment: " + err.message);
            }
        } else {
            await getAllData(); // Revert UI
        }
    };

    const loadEvents = async () => {
        try {
            const [upcoming, past] = await Promise.all([
                fetchEvents('upcoming'),
                fetchEvents('past')
            ]);
            setEvents(upcoming);
            setPastEvents(past);
        } catch (err) {
            console.error("Failed to load events", err);
        }
    };

    const loadLevels = async () => {
        try {
            const data = await fetchLevels();
            setLevels(data);
        } catch (err) {
            console.error("Failed to load levels", err);
        }
    };

    useEffect(() => {
        if (user && profile?.role_id === 1) {
            getAllData();
            loadEvents();
            loadLevels();
        }
    }, [user, profile]);

    // Fetch details when a teacher is selected
    useEffect(() => {
        if (!selectedTeacher) return;

        const loadDetails = async () => {
            setDetailLoading(true);
            try {
                const [rosterData, scheduleData] = await Promise.all([
                    fetchTeacherRoster(selectedTeacher.user_id),
                    getTeacherSchedule(selectedTeacher.user_id)
                ]);

                setTeacherRoster(rosterData);
                setTeacherSchedule(scheduleData as AdminLesson[]);
            } catch (err) {
                console.error(err);
            } finally {
                setDetailLoading(false);
            }
        };

        loadDetails();
    }, [selectedTeacher]);

    // Load Event Details (Eligible & Booked students)
    useEffect(() => {
        if (!selectedEvent || !selectedEvent.event_id) return;

        const loadEventDetails = async () => {
            setEventLoading(true);
            try {
                const [eligible, booked] = await Promise.all([
                    getEligibleStudentsForEvent(selectedEvent.event_id!),
                    getBookedStudentsForEvent(selectedEvent.event_id!)
                ]);
                setEligibleStudents(eligible);
                setBookedStudents(booked);
            } catch (err) {
                console.error("Error loading event details", err);
            } finally {
                setEventLoading(false);
            }
        };
        loadEventDetails();
    }, [selectedEvent]);


    const handleDeleteEvent = async (eventId: number) => {
        if (!confirm("Are you sure you want to delete this event? All bookings will be removed.")) return;
        try {
            await deleteEvent(eventId);
            loadEvents();
        } catch (err: any) {
            alert("Failed to delete event: " + err.message);
        }
    };

    const handleDeleteUser = async (userId: number, event: React.MouseEvent) => {
        event.stopPropagation();

        const userToDelete = allUsers.find(u => u.user_id === userId);
        if (!userToDelete) return;

        if (!window.confirm(`Are you sure you want to delete ${userToDelete.first_name} ${userToDelete.last_name}? This cannot be undone.`)) {
            return;
        }

        let deleteManager = false;
        // Check if student (Role 4)
        if (userToDelete.role_id === 4) {
            // Ask for optional manager deletion
            // Using a confirm box for the second question
            // "OK" to delete manager, "Cancel" to keep manager.
            // We need to be clear in the message.
            if (window.confirm("Do you ALSO want to delete the associated Manager (Parent) account?\n\nClick OK to DELETE the Manager.\nClick Cancel to KEEP the Manager (only delete Student).")) {
                deleteManager = true;
            }
        }

        try {
            await deleteUser(userId, deleteManager);
            // Refresh list
            await getAllData();
            // Deselect if verified
            if (selectedTeacher?.user_id === userId) {
                setSelectedTeacher(null);
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createEvent(newEventData);
            alert("Event created!");
            setIsCreateEventOpen(false);
            loadEvents();
            // Reset form
            setNewEventData({
                eventName: '',
                description: '',
                venueName: '',
                startTime: '',
                endTime: '',
                eventType: 'Workshop',
                maxCapacity: 50,
                levelIds: []
            });
        } catch (err: any) {
            alert("Failed to create event: " + err.message);
        }
    };

    const toggleLevelSelection = (levelId: number) => {
        setNewEventData((prev: any) => {
            const current = prev.levelIds;
            if (current.includes(levelId)) {
                return { ...prev, levelIds: current.filter((id: number) => id !== levelId) };
            } else {
                return { ...prev, levelIds: [...current, levelId] };
            }
        });
    };

    const handleBookStudent = async (studentId: number) => {
        if (!selectedEvent?.event_id) return;
        try {
            await bookStudentForEvent(selectedEvent.event_id, studentId);
            // Refresh lists
            const [eligible, booked] = await Promise.all([
                getEligibleStudentsForEvent(selectedEvent.event_id!),
                getBookedStudentsForEvent(selectedEvent.event_id!)
            ]);
            setEligibleStudents(eligible);
            setBookedStudents(booked);
            loadEvents(); // Update counts
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        if (!selectedEvent?.event_id) return;
        if (!confirm("Cancel this booking?")) return;
        try {
            await cancelEventBooking(bookingId);
            // Refresh lists
            const [eligible, booked] = await Promise.all([
                getEligibleStudentsForEvent(selectedEvent.event_id!),
                getBookedStudentsForEvent(selectedEvent.event_id!)
            ]);
            setEligibleStudents(eligible);
            setBookedStudents(booked);
            loadEvents(); // Update counts
        } catch (err: any) {
            alert(err.message);
        }
    };

    const renderGenericListView = (users: UserData[]) => {
        const teacherOptions = allUsers.filter(u => u.role_id === 2);

        // Mobile View Structure
        const mobileView = (
            <div className="mobile-view">
                <MobileUserList
                    users={users}
                    onUserClick={handleMobileUserClick}
                    emptyMessage={`No ${mainTab.toLowerCase()} found.`}
                />
            </div>
        );

        // Desktop View Structure
        const desktopView = (
            <div className="desktop-view card">
                {/* User Info Header only on Desktop for now, or maybe duplicated? keeping simple */}
                <div className="user-info">
                    {profile?.email || 'Admin'} (ID: {user?.user_id})
                    <button onClick={() => {
                        useAuthStore.getState().logout();
                        window.location.reload();
                    }} className="btn-secondary" style={{ marginLeft: '10px' }}>Logout</button>
                </div>
                <table className="user-list-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            {mainTab === 'Students' && <th>Assigned Teacher</th>}
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.user_id}>
                                <td>{u.user_id}</td>
                                <td>{u.first_name} {u.last_name}</td>
                                <td>{u.email}</td>
                                <td>{u.phone_number}</td>
                                {mainTab === 'Students' && (
                                    <td>
                                        <select
                                            style={{ padding: '6px', backgroundColor: 'white', color: 'var(--text-dark)', border: '1px solid #ccc', borderRadius: '4px' }}
                                            value={u.teachers?.[0]?.id || ''}
                                            onChange={(e) => handleTeacherAssignmentChange(u.user_id, e.target.value, u.teacher_names || '')}
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {teacherOptions.map(t => (
                                                <option key={t.user_id} value={t.user_id}>
                                                    {t.first_name} {t.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                )}
                                <td>{u.is_active ? 'Active' : 'Inactive'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={(e) => handleEditUser(u, e)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: '#2196F3',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteUser(u.user_id, e)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: '#ff4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan={mainTab === 'Students' ? 7 : 6}>No users found in this category.</td></tr>}
                    </tbody>
                </table>
            </div>
        );

        return (
            <>
                {mobileView}
                {desktopView}
            </>
        );
    };

    if (loading) return <div className="dashboard-loading">Loading Admin Dashboard...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;

    // Filter users based on active tab
    const getFilteredUsers = () => {
        const roleMap: Record<string, number> = { 'Admins': 1, 'Teachers': 2, 'Managers': 3, 'Students': 4 };
        const roleId = roleMap[mainTab];
        return allUsers.filter(u => u.role_id === roleId);
    };

    const getRoleForNewUser = () => {
        const roleMap: Record<string, number> = { 'Admins': 1, 'Teachers': 2, 'Managers': 3, 'Students': 4 };
        return roleMap[mainTab] || 4; // Default to student
    };

    const renderTeacherView = (teachers: UserData[]) => (
        <>
            <div className="mobile-view">
                <MobileUserList
                    users={teachers}
                    onUserClick={handleMobileUserClick}
                    emptyMessage="No teachers found."
                />
            </div>
            <div className="admin-dashboard-container desktop-view">
                {/* Left Panel: Teacher List */}
                <div className="card teacher-list-panel">
                    <h3>Teachers</h3>
                    <p style={{ fontSize: '0.9em', color: '#aaa', margin: '0 0 10px 0' }}>Select a teacher from the list to view details.</p>
                    <ul className="schedule-list">
                        {teachers.map(teacher => (
                            <li
                                key={teacher.user_id}
                                onClick={() => setSelectedTeacher(teacher)}
                                style={{
                                    backgroundColor: selectedTeacher?.user_id === teacher.user_id ? '#fff0f0' : 'transparent',
                                    borderLeft: selectedTeacher?.user_id === teacher.user_id ? '4px solid var(--primary-red)' : '4px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div className="list-item-content">
                                    <div>
                                        <strong>{teacher.first_name} {teacher.last_name}</strong>
                                        <br />
                                        <small>{teacher.email}</small>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button
                                            onClick={(e) => handleEditUser(teacher, e)}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#2196F3',
                                                fontSize: '0.8em',
                                                border: 'none',
                                                borderRadius: '4px',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteUser(teacher.user_id, e)}
                                            className="delete-btn"
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#ff4444',
                                                fontSize: '0.8em',
                                                border: 'none',
                                                borderRadius: '4px',
                                                color: 'white',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Panel: Detail View */}
                <div className="card teacher-detail-panel">
                    {selectedTeacher ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>{selectedTeacher.first_name} {selectedTeacher.last_name} - Detail View</h3>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setSelectedTeacher(null)}
                                    style={{ height: 'fit-content' }}
                                >
                                    Close View
                                </button>
                            </div>
                            <div className="tabs">
                                <button
                                    className={teacherDetailTab === 'roster' ? 'active' : ''}
                                    onClick={() => setTeacherDetailTab('roster')}
                                >
                                    Student Roster
                                </button>
                                <button
                                    className={teacherDetailTab === 'attendance' ? 'active' : ''}
                                    onClick={() => setTeacherDetailTab('attendance')}
                                >
                                    Attendance & Billing
                                </button>
                            </div>

                            {detailLoading ? (
                                <p>Loading details...</p>
                            ) : (
                                <div className="tab-content">
                                    {teacherDetailTab === 'roster' && (
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>ID</th><th>Student</th><th>Manager</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teacherRoster.map(s => (
                                                    <tr key={s.student_id}>
                                                        <td>{s.student_id}</td>
                                                        <td>{s.student_first_name} {s.student_last_name}</td>
                                                        <td>{s.manager_first_name} {s.manager_last_name}</td>
                                                    </tr>
                                                ))}
                                                {teacherRoster.length === 0 && <tr><td colSpan={3}>No students assigned.</td></tr>}
                                            </tbody>
                                        </table>
                                    )}

                                    {teacherDetailTab === 'attendance' && (
                                        <BillingAccordion
                                            students={teacherRoster}
                                            schedule={teacherSchedule.map(l => ({ ...l, parent_note: '' }))}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );



    const renderEventsView = () => (
        <div className="events-container">
            <div className="event-header">
                <h3>Upcoming Events</h3>
                <button className="create-event-btn" onClick={() => setIsCreateEventOpen(true)}>+ Create Event</button>
            </div>

            <div className="events-list">
                {events.length === 0 && <p style={{ color: '#aaa' }}>No upcoming events.</p>}
                {events.map(event => (
                    <div key={event.event_id} className="event-card">
                        <h3>{event.event_name}</h3>
                        <div className="event-info">
                            <p><strong>Venue:</strong> {event.venue_name}</p>
                            <p><strong>Date:</strong> {new Date(event.start_time).toLocaleString()}</p>
                            <p><strong>Type:</strong> {event.event_type}</p>
                            <p><strong>Bookings:</strong> {event.booked_count || 0} / {event.max_capacity}</p>
                            <p><strong>Allowed Levels:</strong> {event.allowed_levels_json && event.allowed_levels_json.length > 0 ? event.allowed_levels_json.join(', ') : 'All Levels'}</p>
                        </div>
                        <div className="event-actions">
                            <button className="view-details-btn" onClick={() => setSelectedEvent(event)}>Manage Bookings</button>
                            <button
                                style={{
                                    backgroundColor: '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleDeleteEvent(event.event_id!)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <h3 style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', color: '#888' }}>Past Events</h3>
            <div className="events-list">
                {pastEvents.length === 0 && <p style={{ color: '#aaa' }}>No past events found.</p>}
                {pastEvents.map(event => (
                    <div key={event.event_id} className="event-card" style={{ opacity: 0.7 }}>
                        <h3>{event.event_name} <span style={{ fontSize: '0.6em', background: '#555', padding: '2px 6px', borderRadius: '4px' }}>DONE</span></h3>
                        <div className="event-info">
                            <p><strong>Date:</strong> {new Date(event.start_time).toLocaleString()}</p>
                            <p><strong>Bookings:</strong> {event.booked_count}</p>
                        </div>
                        <div className="event-actions">
                            <button className="view-details-btn" onClick={() => setSelectedEvent(event)}>View History</button>
                            <button
                                style={{
                                    backgroundColor: '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleDeleteEvent(event.event_id!)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Manage Event Modal (Used reusing styles or create new structure if needed, keeping simple here) */}
            {selectedEvent && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h2>Manage: {selectedEvent.event_name}</h2>
                            <button className="cancel-btn" onClick={() => setSelectedEvent(null)}>Close</button>
                        </div>

                        <div className="tabs">
                            {/* Just simple headers for now */}
                            <h4 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: '20px' }}>Booked Students</h4>
                        </div>

                        {eventLoading ? <p>Loading...</p> : (
                            <div className="bookings-list">
                                {bookedStudents.length === 0 ? <p>No bookings yet.</p> : (
                                    <table className="user-list-table">
                                        <thead><tr><th>Name</th><th>Booked At</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {bookedStudents.map(b => (
                                                <tr key={b.event_booking_id}>
                                                    <td>{b.first_name} {b.last_name}</td>
                                                    <td>{new Date(b.booked_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleCancelBooking(b.event_booking_id)}
                                                            style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        <h4 style={{ marginTop: '30px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Eligible Students (Not Booked)</h4>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {eligibleStudents.length === 0 ? <p>No eligible students found.</p> : (
                                eligibleStudents.map(student => (
                                    <div key={student.user_id} className="eligible-student-item">
                                        <div>
                                            <strong>{student.first_name} {student.last_name}</strong>
                                            <span style={{ marginLeft: '10px', color: '#aaa', fontSize: '0.9em' }}>
                                                (Age: {student.age}, Level: {student.current_level_name})
                                            </span>
                                        </div>
                                        <button className="book-btn" onClick={() => handleBookStudent(student.user_id)}>
                                            Book
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {isCreateEventOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Event</h2>
                        <form onSubmit={handleCreateEvent}>
                            <div className="form-group">
                                <label>Event Name</label>
                                <input required value={newEventData.eventName} onChange={e => setNewEventData({ ...newEventData, eventName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Venue</label>
                                <input required value={newEventData.venueName} onChange={e => setNewEventData({ ...newEventData, venueName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={newEventData.eventType} onChange={e => setNewEventData({ ...newEventData, eventType: e.target.value })}>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Showcase">Showcase</option>
                                    <option value="Competition">Competition</option>
                                    <option value="Meeting">Meeting</option>
                                </select>
                            </div>
                            {/* Dates */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Start Time</label>
                                    <input type="datetime-local" required value={newEventData.startTime} onChange={e => setNewEventData({ ...newEventData, startTime: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>End Time</label>
                                    <input type="datetime-local" required value={newEventData.endTime} onChange={e => setNewEventData({ ...newEventData, endTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Allowed Syllabus Levels</label>
                                <div className="level-checkboxes">
                                    <label className="level-checkbox" style={{ width: '100%', marginBottom: '5px', fontWeight: 'bold' }}>
                                        <input
                                            type="checkbox"
                                            checked={newEventData.levelIds.length === levels.length && levels.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewEventData((prev: any) => ({ ...prev, levelIds: levels.map(l => l.level_id) }));
                                                } else {
                                                    setNewEventData((prev: any) => ({ ...prev, levelIds: [] }));
                                                }
                                            }}
                                        />
                                        Select All Levels
                                    </label>
                                    {levels.map(lvl => (
                                        <label key={lvl.level_id} className="level-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={newEventData.levelIds.includes(lvl.level_id)}
                                                onChange={() => toggleLevelSelection(lvl.level_id)}
                                            />
                                            {lvl.title}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Max Capacity</label>
                                <input type="number" required value={newEventData.maxCapacity} onChange={e => setNewEventData({ ...newEventData, maxCapacity: parseInt(e.target.value) })} />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={newEventData.description} onChange={e => setNewEventData({ ...newEventData, description: e.target.value })} />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsCreateEventOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );

    return (
        <div>
            <h2>Admin Dashboard</h2>

            {/* Main Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div className="tabs">
                    {['Students', 'Teachers', 'Managers', 'Admins', 'Events'].map(tab => (
                        <button
                            key={tab}
                            className={mainTab === tab ? 'active' : ''}
                            onClick={() => {
                                setMainTab(tab as any);
                                setSelectedTeacher(null); // Reset selection when switching tabs
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                {mainTab !== 'Events' && (
                    <button
                        onClick={handleAddUser}
                        style={{ backgroundColor: '#2ea44f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        + Add {mainTab.slice(0, -1)}
                    </button>
                )}
            </div>

            {/* Content Area */}
            {mainTab === 'Teachers' ? renderTeacherView(getFilteredUsers()) :
                mainTab === 'Events' ? renderEventsView() :
                    renderGenericListView(getFilteredUsers())}

            <AddUserModal
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                onUserAdded={getAllData}
                defaultRole={getRoleForNewUser()}
                userToEdit={userToEdit}
            />

            <FamilyRegistrationModal
                isOpen={isFamilyModalOpen}
                onClose={() => setIsFamilyModalOpen(false)}
                onSuccess={getAllData}
            />
            <BottomNav
                activeTab={mainTab}
                setActiveTab={setMainTab}
                role="admin"
            />

            <MobileUserDetailModal
                isOpen={isMobileModalOpen}
                onClose={() => setIsMobileModalOpen(false)}
                user={selectedMobileUser}
                onEdit={(user) => {
                    setUserToEdit(user);
                    setIsAddUserOpen(true); // Re-use existing edit modal logic
                }}
                onDelete={(userId) => {
                    handleDeleteUser(userId, {} as any); // Re-use existing delete logic
                }}
                // Props for Student actions
                teachers={allUsers.filter(u => u.role_id === 2).map(t => ({ id: t.user_id, name: `${t.first_name} ${t.last_name}` }))}
                onAssignTeacher={(userId, teacherId) => handleTeacherAssignmentChange(userId, teacherId, '')}
                mainTab={mainTab}
                teacherRoster={teacherRoster}
                teacherSchedule={teacherSchedule}
            />
        </div>
    );
};

export default AdminDashboard;