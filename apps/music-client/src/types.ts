export interface UserData {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    phone_number: string;
    is_active: boolean;
    // New fields from backend aggregation
    teacher_names?: string;
    teachers?: { id: number, name: string }[];
}

export interface RosterEntry {
    student_id: number;
    student_first_name: string;
    student_last_name: string;
    manager_first_name: string;
    manager_last_name: string;
}

// Need to import Lesson from services/api, but to avoid circular deps with services/api
// We can define a compatible interface or move Lesson to types.ts as well.
// For now, let's just define strict structure or use 'any' if Lesson is complex.
// Better: Duplicate simple fields needed or Refactor api.ts.
// Actually, let's just use what AdminDashboard used.
// It extended "Lesson".
// Let's assume Lesson has basic fields.

// Minimal definition to satisfy the UI needs
export interface AdminLesson {
    lesson_id: number;
    student_id: number;
    teacher_id: number;
    start_time: string;
    end_time: string;
    status: string;
    price: string | number;
    paid: boolean;
    student_name?: string;
    teacher_name?: string;
    // Extended fields
    attendance_status?: string;
    attendance_notes?: string;
    manager_first_name?: string;
    manager_last_name?: string;
    manager_phone?: string;
    parent_note?: string; // Used in UI
}
