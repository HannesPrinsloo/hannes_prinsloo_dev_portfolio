
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
    fetchTeacherRoster, getTeacherSchedule, deleteUser,
    fetchEvents, createEvent, deleteEvent, getEligibleStudentsForEvent, getBookedStudentsForEvent,
    bookStudentForEvent, cancelEventBooking, fetchLevels,
    type RosterEntry, type EventData, type StudentEligibility, type Level,
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

    // Student Selection state
    const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);

    // Mobile Modal State
    const [selectedMobileUser, setSelectedMobileUser] = useState<UserData | null>(null);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

    const handleMobileUserClick = (user: UserData) => {
        setSelectedMobileUser(user);
        setIsMobileModalOpen(true);
        if (mainTab === 'Teachers') {
            setSelectedTeacher(user);
        } else if (mainTab === 'Students') {
            setSelectedStudent(user);
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
            <div className="md:hidden">
                <MobileUserList
                    users={users}
                    onUserClick={handleMobileUserClick}
                    emptyMessage={`No ${mainTab.toLowerCase()} found.`}
                />
            </div>
        );

        // Desktop View Structure
        const desktopView = (
            <div className="hidden md:block bg-white rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden mb-5">
                {/* User Info Header only on Desktop for now, or maybe duplicated? keeping simple */}
                <div className="flex justify-between items-center bg-[#f8f9fa] p-[15px] rounded border border-[#eee] mb-5 text-[#333] font-medium shadow-sm">
                    {profile?.email || 'Admin'} (ID: {user?.user_id})
                    <button onClick={() => {
                        useAuthStore.getState().logout();
                        window.location.reload();
                    }} className="bg-transparent text-[#666] border border-[#ccc] px-4 py-2 rounded ml-2.5">Logout</button>
                </div>
                <table className="w-full border-collapse bg-transparent mt-5 [&_th]:bg-[#f8f8f8] [&_th]:text-text-dark [&_th]:px-[25px] [&_th]:py-[18px] [&_th]:text-center [&_th]:font-semibold [&_th]:border-b-2 [&_th]:border-[#eee] [&_th]:tracking-[0.5px] [&_td]:px-[25px] [&_td]:py-[15px] [&_td]:text-text-dark [&_td]:border-b [&_td]:border-[#eee] [&_td]:text-center [&_td]:align-middle [&_tbody_tr:hover]:bg-[#f9f9f9] [&_tbody_tr]:transition-colors">
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
                                            className="px-3 py-1.5 bg-white text-text-dark border border-[#ccc] rounded-md focus:outline-none focus:border-primary-red focus:ring-1 focus:ring-primary-red transition-colors shadow-sm text-sm min-w-[150px]"
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
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={(e) => handleEditUser(u, e)}
                                            className="bg-[#2196F3] text-white text-xs font-medium px-4 py-1.5 rounded-md border-none hover:bg-[#1976D2] transition-colors shadow-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteUser(u.user_id, e)}
                                            className="bg-[#ff4444] text-white text-xs font-medium px-4 py-1.5 rounded-md border-none hover:bg-[#cc0000] transition-colors shadow-sm"
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

    const renderStudentView = (students: UserData[]) => {
        const teacherOptions = allUsers.filter(u => u.role_id === 2);

        return (
            <>
                <div className="md:hidden">
                    <MobileUserList
                        users={students}
                        onUserClick={handleMobileUserClick}
                        emptyMessage="No students found."
                    />
                </div>
                <div className="hidden md:flex flex-col md:flex-row gap-5 w-full max-w-[1200px] mx-auto text-left box-border overflow-x-hidden md:h-[80vh]">
                    {/* Left Panel: Student List */}
                    <div className="w-full md:w-1/3 md:min-w-[280px] md:max-w-[320px] shrink-0 overflow-y-auto overflow-x-hidden flex flex-col bg-white rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                        <h3>Students</h3>
                        <p style={{ fontSize: '0.9em', color: '#aaa', margin: '0 0 10px 0' }}>Select a student from the list to view details.</p>
                        <ul className="list-none p-0 m-0 w-full">
                            {students.map(student => (
                                <li
                                    key={student.user_id}
                                    onClick={() => setSelectedStudent(student)}
                                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer mb-3 flex flex-col gap-3 ${selectedStudent?.user_id === student.user_id ? 'bg-[#ffebfb] border-primary-red shadow-sm' : 'bg-white border-[#eee] hover:border-primary-red hover:shadow-sm'}`}
                                >
                                    <div className="flex flex-col w-full">
                                        <strong className="text-[1.05em] text-text-dark mb-1 break-words">{student.first_name} {student.last_name}</strong>
                                        <span className="text-sm text-[#888] mb-1">Level: <span className="text-primary-red font-medium">{student.current_level_name || 'None'}</span></span>
                                        <span className="text-sm text-[#666]">Teacher: {student.teacher_names || 'Unassigned'}</span>
                                    </div>
                                    {selectedStudent?.user_id === student.user_id && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => handleEditUser(student, e)}
                                                className="bg-[#2196F3] text-white text-xs font-medium px-4 py-1.5 rounded-md border-none hover:bg-[#1976D2] transition-colors shadow-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteUser(student.user_id, e)}
                                                className="bg-[#ff4444] text-white text-xs font-medium px-4 py-1.5 rounded-md border-none hover:bg-[#cc0000] transition-colors shadow-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Panel: Detail View */}
                    <div className={`flex-1 overflow-y-auto transition-all duration-200 ${selectedStudent ? 'bg-white rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : ''}`}>
                        {selectedStudent ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className="m-0 text-xl">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
                                    <button
                                        className="bg-transparent text-[#666] border border-[#ccc] px-4 py-2 rounded cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                                        onClick={() => setSelectedStudent(null)}
                                        style={{ height: 'fit-content' }}
                                    >
                                        Close View
                                    </button>
                                </div>

                                <div className="mt-5 space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-[#eee]">
                                        <h4 className="text-md font-semibold mb-3 text-text-dark mt-0">Student Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div><span className="text-gray-500 block mb-1 font-medium">ID</span> {selectedStudent.user_id}</div>
                                            <div><span className="text-gray-500 block mb-1 font-medium">Status</span> {selectedStudent.is_active ? 'Active' : 'Inactive'}</div>
                                            <div><span className="text-gray-500 block mb-1 font-medium">Current Level</span> {selectedStudent.current_level_name || 'None'}</div>
                                            <div><span className="text-gray-500 block mb-1 font-medium">Phone Number</span> {selectedStudent.phone_number || 'N/A'}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg border border-[#eee]">
                                        <h4 className="text-md font-semibold mb-3 text-text-dark mt-0">Assigned Teacher</h4>
                                        <div className="flex items-center gap-3">
                                            <select
                                                className="px-3 py-2 bg-white text-text-dark border border-[#ccc] rounded-md focus:outline-none focus:border-primary-red focus:ring-1 focus:ring-primary-red transition-colors shadow-sm text-sm min-w-[200px]"
                                                value={selectedStudent.teachers?.[0]?.id || ''}
                                                onChange={(e) => handleTeacherAssignmentChange(selectedStudent.user_id, e.target.value, selectedStudent.teacher_names || '')}
                                            >
                                                <option value="">-- Unassigned --</option>
                                                {teacherOptions.map(t => (
                                                    <option key={t.user_id} value={t.user_id}>
                                                        {t.first_name} {t.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', textAlign: 'center', padding: '40px', border: '2px dashed #eee', borderRadius: '12px' }}>
                                <p>Select a student from the list to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    const renderTeacherView = (teachers: UserData[]) => (
        <>
            <div className="md:hidden">
                <MobileUserList
                    users={teachers}
                    onUserClick={handleMobileUserClick}
                    emptyMessage="No teachers found."
                />
            </div>
            <div className="hidden md:flex flex-col md:flex-row gap-5 w-full max-w-[1200px] mx-auto text-left box-border overflow-x-hidden md:h-[80vh]">
                {/* Left Panel: Teacher List */}
                <div className="w-full md:w-1/3 md:min-w-[280px] md:max-w-[320px] shrink-0 overflow-y-auto overflow-x-hidden flex flex-col bg-white rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                    <h3>Teachers</h3>
                    <p style={{ fontSize: '0.9em', color: '#aaa', margin: '0 0 10px 0' }}>Select a teacher from the list to view details.</p>
                    <ul className="list-none p-0 m-0 w-full">
                        {teachers.map(teacher => (
                            <li
                                key={teacher.user_id}
                                onClick={() => setSelectedTeacher(teacher)}
                                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer mb-3 flex flex-col gap-3 ${selectedTeacher?.user_id === teacher.user_id ? 'bg-[#ffebfb] border-primary-red shadow-sm' : 'bg-white border-[#eee] hover:border-primary-red hover:shadow-sm'}`}
                            >
                                <div className="flex flex-col w-full">
                                    <strong className="text-[1.05em] text-text-dark mb-1 break-words">{teacher.first_name} {teacher.last_name}</strong>
                                    <span className="text-sm text-[#666] break-words">{teacher.email}</span>
                                </div>
                                {selectedTeacher?.user_id === teacher.user_id && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleEditUser(teacher, e)}
                                            className="bg-[#2196F3] text-white text-xs font-medium px-4 py-1.5 rounded-md border-none hover:bg-[#1976D2] transition-colors shadow-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteUser(teacher.user_id, e)}
                                            className="bg-[#ff4444] text-white text-xs font-medium px-4 py-1.5 rounded-md border-none hover:bg-[#cc0000] transition-colors shadow-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Panel: Detail View */}
                <div className={`flex-1 overflow-y-auto transition-all duration-200 ${selectedTeacher ? 'bg-white rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : ''}`}>
                    {selectedTeacher ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>{selectedTeacher.first_name} {selectedTeacher.last_name} - Detail View</h3>
                                <button
                                    className="bg-transparent text-[#666] border border-[#ccc] px-4 py-2 rounded cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                                    onClick={() => setSelectedTeacher(null)}
                                    style={{ height: 'fit-content' }}
                                >
                                    Close View
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2.5 justify-start mb-5">
                                <button
                                    className={`px-5 py-2 font-medium rounded-md transition-all duration-200 border ${teacherDetailTab === 'roster' ? 'bg-[#ffeaeb] text-primary-red border-[#ffeaeb]' : 'bg-transparent text-text-dark border-transparent hover:bg-gray-100 hover:text-primary-red'}`}
                                    onClick={() => setTeacherDetailTab('roster')}
                                >
                                    Student Roster
                                </button>
                                <button
                                    className={`px-5 py-2 font-medium rounded-md transition-all duration-200 border ${teacherDetailTab === 'attendance' ? 'bg-[#ffeaeb] text-primary-red border-[#ffeaeb]' : 'bg-transparent text-text-dark border-transparent hover:bg-gray-100 hover:text-primary-red'}`}
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
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', textAlign: 'center', padding: '40px', border: '2px dashed #eee', borderRadius: '12px' }}>
                            <p>Select a teacher from the list to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );



    const renderEventsView = () => (
        <div className="w-full">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-2.5">
                <h3>Upcoming Events</h3>
                <button className="bg-primary-red text-white py-2 px-4 rounded hover:brightness-110 active:brightness-90 transition-all font-medium border-none shadow-[0_2px_4px_rgba(239,68,68,0.2)]" onClick={() => setIsCreateEventOpen(true)}>+ Create Event</button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
                {events.length === 0 && <p style={{ color: '#aaa' }}>No upcoming events.</p>}
                {events.map(event => (
                    <div key={event.event_id} className="bg-white border border-[#eee] rounded-lg p-5 flex flex-col shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                        <h3>{event.event_name}</h3>
                        <div className="[&_p]:my-1.5 [&_p]:text-[#666]">
                            <p><strong>Venue:</strong> {event.venue_name}</p>
                            <p><strong>Date:</strong> {new Date(event.start_time).toLocaleString()}</p>
                            <p><strong>Type:</strong> {event.event_type}</p>
                            <p><strong>Bookings:</strong> {event.booked_count || 0} / {event.max_capacity}</p>
                            <p><strong>Allowed Levels:</strong> {event.allowed_levels_json && event.allowed_levels_json.length > 0 ? event.allowed_levels_json.join(', ') : 'All Levels'}</p>
                        </div>
                        <div className="mt-auto pt-[15px] flex gap-2.5">
                            <button className="bg-white text-text-dark px-4 py-2 border border-[#ccc] rounded cursor-pointer w-full hover:bg-[#f9f9f9] transition-colors" onClick={() => setSelectedEvent(event)}>Manage Bookings</button>
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
                {pastEvents.length === 0 && <p style={{ color: '#aaa' }}>No past events found.</p>}
                {pastEvents.map(event => (
                    <div key={event.event_id} className="bg-white border border-[#eee] rounded-lg p-5 flex flex-col shadow-[0_2px_4px_rgba(0,0,0,0.05)]" style={{ opacity: 0.7 }}>
                        <h3>{event.event_name} <span style={{ fontSize: '0.6em', background: '#555', padding: '2px 6px', borderRadius: '4px' }}>DONE</span></h3>
                        <div className="[&_p]:my-1.5 [&_p]:text-[#666]">
                            <p><strong>Date:</strong> {new Date(event.start_time).toLocaleString()}</p>
                            <p><strong>Bookings:</strong> {event.booked_count}</p>
                        </div>
                        <div className="mt-auto pt-[15px] flex gap-2.5">
                            <button className="bg-white text-text-dark px-4 py-2 border border-[#ccc] rounded cursor-pointer w-full hover:bg-[#f9f9f9] transition-colors" onClick={() => setSelectedEvent(event)}>View History</button>
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

            {/* Manage Event Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5 backdrop-blur-[2px]">
                    <div className="bg-white text-text-dark p-[30px] rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto relative shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                        <div className="flex justify-between items-center mb-[20px] pb-2.5 border-b border-[#eee]">
                            <h2 className="m-0">Manage: {selectedEvent.event_name}</h2>
                            <button className="bg-transparent text-[#666] border border-[#ccc] px-4 py-2 rounded cursor-pointer hover:bg-[#f0f0f0] transition-colors" onClick={() => setSelectedEvent(null)}>Close</button>
                        </div>

                        <div className="mb-5">
                            {/* Just simple headers for now */}
                            <h4 className="border-b border-[#444] pb-2.5 mt-5">Booked Students</h4>
                        </div>

                        {eventLoading ? <p>Loading...</p> : (
                            <div className="bookings-list">
                                {bookedStudents.length === 0 ? <p>No bookings yet.</p> : (
                                    <table className="w-full border-collapse bg-transparent mt-5 [&_th]:bg-[#f8f8f8] [&_th]:text-text-dark [&_th]:px-[25px] [&_th]:py-[18px] [&_th]:text-center [&_th]:font-semibold [&_th]:border-b-2 [&_th]:border-[#eee] [&_th]:tracking-[0.5px] [&_td]:px-[25px] [&_td]:py-[15px] [&_td]:text-text-dark [&_td]:border-b [&_td]:border-[#eee] [&_td]:text-center [&_td]:align-middle [&_tbody_tr:hover]:bg-[#f9f9f9] [&_tbody_tr]:transition-colors">
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
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5 backdrop-blur-[2px]">
                    <div className="bg-white text-text-dark p-[30px] rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto relative shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                        <h2 className="mt-0 mb-[20px] pb-2.5 border-b border-[#eee]">Create New Event</h2>
                        <form onSubmit={handleCreateEvent} className="flex flex-col gap-[15px]">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#555] font-medium">Event Name</label>
                                <input className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark" required value={newEventData.eventName} onChange={e => setNewEventData({ ...newEventData, eventName: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#555] font-medium">Venue</label>
                                <input className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark" required value={newEventData.venueName} onChange={e => setNewEventData({ ...newEventData, venueName: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#555] font-medium">Type</label>
                                <select className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark" value={newEventData.eventType} onChange={e => setNewEventData({ ...newEventData, eventType: e.target.value })}>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Showcase">Showcase</option>
                                    <option value="Competition">Competition</option>
                                    <option value="Meeting">Meeting</option>
                                </select>
                            </div>
                            {/* Dates */}
                            <div className="flex gap-2.5">
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-[#555] font-medium">Start Time</label>
                                    <input className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark" type="datetime-local" required value={newEventData.startTime} onChange={e => setNewEventData({ ...newEventData, startTime: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-[#555] font-medium">End Time</label>
                                    <input className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark" type="datetime-local" required value={newEventData.endTime} onChange={e => setNewEventData({ ...newEventData, endTime: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#555] font-medium">Allowed Syllabus Levels</label>
                                <div className="flex flex-col gap-1.5">
                                    <label className="flex items-center gap-2 cursor-pointer w-full mb-1.5 font-bold">
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
                                        <label key={lvl.level_id} className="flex items-center gap-2 cursor-pointer">
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

                            <div className="flex flex-col gap-2">
                                <label className="text-[#555] font-medium">Max Capacity</label>
                                <input className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark" type="number" required value={newEventData.maxCapacity} onChange={e => setNewEventData({ ...newEventData, maxCapacity: parseInt(e.target.value) })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#555] font-medium">Description</label>
                                <textarea className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark" value={newEventData.description} onChange={e => setNewEventData({ ...newEventData, description: e.target.value })} />
                            </div>

                            <div className="flex justify-end gap-2.5 mt-[25px]">
                                <button type="button" className="bg-transparent text-[#666] border border-[#ccc] px-4 py-2 rounded cursor-pointer hover:bg-[#f0f0f0] transition-colors" onClick={() => setIsCreateEventOpen(false)}>Cancel</button>
                                <button type="submit" className="bg-primary-red text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-[#cc0000] transition-colors">Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );

    return (
        <div>
            {/* CHANGELOG: Refactored Admin Dashboard wrapper and tabs to Tailwind utilities instead of inline logic and App.css classes like .tabs and custom button colors. */}
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

            {/* Main Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4 md:gap-0">
                <div className="hidden md:flex flex-wrap items-center gap-2.5 md:justify-center">
                    {['Students', 'Teachers', 'Managers', 'Admins', 'Events'].map(tab => (
                        <button
                            key={tab}
                            className={`px-5 py-2 font-medium rounded-full transition-all duration-200 border ${mainTab === tab
                                ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-sm tracking-wide'
                                : 'bg-white text-[#555] border-[#f0f0f0] hover:bg-[#ffeaea] hover:border-[#ff6b6b] hover:text-[#ff6b6b]'
                                }`}
                            onClick={() => {
                                setMainTab(tab as any);
                                setSelectedTeacher(null); // Reset selection when switching tabs
                                setSelectedStudent(null);
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                {mainTab !== 'Events' && (
                    <button
                        onClick={handleAddUser}
                        className="bg-[#2ea44f] text-white border-none px-5 py-2.5 rounded-md cursor-pointer hover:bg-[#2c974b] transition-colors"
                    >
                        + Add {mainTab.slice(0, -1)}
                    </button>
                )}
            </div>

            {/* Content Area */}
            {
                mainTab === 'Teachers' ? renderTeacherView(getFilteredUsers()) :
                    mainTab === 'Students' ? renderStudentView(getFilteredUsers()) :
                        mainTab === 'Events' ? renderEventsView() :
                            renderGenericListView(getFilteredUsers())
            }

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