/**
 * REACT QUERY MIGRATION PHASES OVERVIEW:
 * 
 * Phase 1: ManagerDashboard.tsx - Migrated basic student lists, schedule grids, and attendance views to React Query.
 * Phase 2: TeacherDashboard.tsx - Hooked roster, schedule, and events into the global cache.
 * Phase 3: Dashboard.tsx - Bridged root user state fetching with Zustand for seamless global state management.
 * Phase 4: WeeklySchedule.tsx & LessonScheduler.tsx - Reused existing cache blocks for instant loading, added bi-directional cache invalidation.
 * Phase 5: Modals (AddUserModal.tsx & FamilyRegistrationModal.tsx) - Replaced manual fetch/useEffect logic with useQuery and useMutation.
 */

const API_URL = import.meta.env.VITE_API_URL;

// Interface matching the complex SQL Join result
export interface RosterEntry {
    student_id: number;
    student_first_name: string;
    student_last_name: string;
    student_phone: string | null;
    date_of_birth: string | null;
    age: number | null;
    manager_first_name: string | null;
    manager_last_name: string | null;
    manager_phone: string | null;
    relationship_type: string | null;
    current_level_id: number | null;
    current_level_name: string | null;
    instrument_list?: string;
}

export interface Lesson {
    lesson_id: number;
    start_time: string;
    end_time: string;
    lesson_status: string;
    duration_minutes: number;
    student_id: number;
    student_first_name: string;
    student_last_name: string;
    instrument_name: string;
    parent_note?: string;
    recurrence_group_id?: string;
    attendance_status?: string;
    attendance_notes?: string;
}

export interface AttendanceRecord {
    attendance_id: number;
    attendance_status: string;
    notes?: string;
    student_first_name: string;
    student_last_name: string;
}

export interface Level {
    level_id: number;
    title: string;
    description: string;
    sequence_number: number;
    min_age_months: number;
    max_age_months: number;
}

export const fetchLevels = async (): Promise<Level[]> => {
    const response = await fetch(`${API_URL}/api/levels`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch levels');
    return response.json();
};

export const assignStudentLevel = async (studentId: number, levelId: number, recordedByUserId: number) => {
    const response = await fetch(`${API_URL}/api/levels/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, levelId, recordedByUserId }),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to assign level');
    return response.json();
};

// ... existing code ...
//Phase 1 --> migrated ManagerDashboard to React Query to pull the basic student list.
export const fetchManagerStudents = async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/api/rosters/manager`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch manager students');
    return response.json();
};

//Phase 1 --> used this to display the manager's localized schedule grid.
export const fetchManagerSchedule = async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/api/rosters/manager/schedule`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch manager schedule');
    return response.json();
};

//Phase 1 --> powers the billing/attendance accordion view for Managers.
export const fetchManagerAttendance = async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/api/rosters/manager/attendance`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch manager attendance');
    return response.json();
};

// Phase 1 mutation hook target. Use this to let mangaers update notes next to attendance records.
export const updateParentNote = async (enrollmentId: number, note: string): Promise<any> => {
    const response = await fetch(`${API_URL}/api/rosters/manager/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enrollmentId, note })
    });
    if (!response.ok) throw new Error('Failed to update note');
    return response.json();
};

// Phase 2 --> Brought this into the TeacherDashboard's My Roster tab. 
// ALSO: reused in Phase 4 for lessonScheduler to instantly populate student dropdowns from the global cache ♻
export const fetchTeacherRoster = async (teacherId: number): Promise<RosterEntry[]> => {
    const response = await fetch(`${API_URL}/api/rosters/teacher/${teacherId}`, {
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch roster');
    }
    return response.json();
};

// Phase 4 mutation target. I use this in LessonScheduler and then immediately invalidate the ['teacherSchedule'] cache.
export const createLesson = async (lessonData: {
    teacherId: number;
    studentIds?: number[];
    studentId?: number; // Legacy support or single
    instrumentId: number;
    startTime: string;
    durationMinutes: number;
    recurrenceCount: number;
}) => {
    const response = await fetch(`${API_URL}/api/lessons`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to create lesson');
    return response.json();
};

// Phase 4 mutation target. Linked this to WeeklySchedule's delete buttons, triggering cache clears right after.
export const deleteLesson = async (lessonId: number) => {
    const response = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete lesson');
    return response.json();
};

// Also a Phase 4 mutation, handling the complex series deletions while keeping the schedule cache perfectly in sync.
export const deleteLessonSeries = async (groupId: string, fromDate?: string) => {
    const url = new URL(`${API_URL}/api/lessons/series/${groupId}`);
    if (fromDate) url.searchParams.append('fromDate', fromDate);

    const response = await fetch(url.toString(), {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete lesson series');
    return response.json();
};

// Originally attached this to TeacherDashboard in Phase 2.
// ALSO: In Phase 4, reused this heavily across WeeklySchedule and AdminDashboard to share the exact same underlying cache block.
export const getTeacherSchedule = async (teacherId: number): Promise<Lesson[]> => {
    const response = await fetch(`${API_URL}/api/lessons/teacher/${teacherId}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch schedule');
    return response.json();
};

// Phase 2 mutation. Used in TeacherDashboard's Attendance tab, pushing local state changes to the server.
export const markAttendance = async (data: any) => {
    const response = await fetch(`${API_URL}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to mark attendance');
    return response.json();
};

export const getLessonAttendance = async (lessonId: number): Promise<AttendanceRecord[]> => {
    const response = await fetch(`${API_URL}/api/attendance/lesson/${lessonId}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return response.json();
};

// Phase 5 mutation target. Used in AddUserModal to instantly update the ['adminUsers'] cache list.
export const createUser = async (userData: any) => {
    const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
    }
    return response.json();
};

export const deleteUser = async (userId: number, deleteManager: boolean = false) => {
    const response = await fetch(`${API_URL}/api/users/${userId}?deleteManager=${deleteManager}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
    }
    return response.json();
};

// Phase 5 mutation target. Also used in AddUserModal for existing user editing.
export const updateUser = async (userId: number, userData: any) => {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
    }
    return response.json();
};

export const assignTeacher = async (studentId: number, teacherId: number | null) => {
    const response = await fetch(`${API_URL}/api/users/assign-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, teacherId }),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to assign teacher');
    return response.json();
};

// Phase 5 mutation target. Added to power the FamilyRegistrationModal, bypassing old manual fetches.
export const registerFamily = async (payload: any) => {
    const response = await fetch(`${API_URL}/api/users/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to register family');
    }
    return response.json();
};

// --- EVENTS API ---

export interface EventData {
    event_id?: number;
    event_name: string;
    description: string;
    venue_name: string;
    start_time: string;
    end_time: string;
    event_type: string;
    max_capacity: number;
    allowed_levels?: number[]; // IDs
    allowed_levels_json?: string[]; // Names from backend
    booked_count?: number;
}

export interface StudentEligibility {
    user_id: number;
    first_name: string;
    last_name: string;
    age: number;
    current_level_name: string;
}

export const fetchEvents = async (filter: 'upcoming' | 'past' | 'all' = 'upcoming'): Promise<EventData[]> => {
    const response = await fetch(`${API_URL}/api/events?filter=${filter}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
};

export const createEvent = async (eventData: any) => {
    const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
};

export const deleteEvent = async (eventId: number) => {
    const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return response.json();
};

// Used this in Phase 1 alongside the other manager views.
export const fetchManagerEvents = async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/api/events/manager`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch manager events');
    return response.json();
};

// Attached this to TeacherDashboard's events view in Phase 2.
export const fetchTeacherEvents = async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/api/events/teacher`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch teacher events');
    return response.json();
};

export const getEligibleStudentsForEvent = async (eventId: number): Promise<StudentEligibility[]> => {
    const response = await fetch(`${API_URL}/api/events/${eventId}/eligible-students`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch eligible students');
    return response.json();
};

export const getBookedStudentsForEvent = async (eventId: number) => {
    const response = await fetch(`${API_URL}/api/events/${eventId}/bookings`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch booked students');
    return response.json();
};

export const bookStudentForEvent = async (eventId: number, studentId: number) => {
    const response = await fetch(`${API_URL}/api/events/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, studentId }),
        credentials: 'include'
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to book student');
    }
    return response.json();
};

export const cancelEventBooking = async (bookingId: number) => {
    const response = await fetch(`${API_URL}/api/events/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return response.json();
};
