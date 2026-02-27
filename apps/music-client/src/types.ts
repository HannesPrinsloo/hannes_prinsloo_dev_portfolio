import type { RosterEntry, Lesson } from './services/api';

export type { RosterEntry };

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
    current_level_name?: string;
    teachers?: { id: number, name: string }[];
}

// AdminLesson extends the base Lesson from API to include UI-specific or extended fields
export interface AdminLesson extends Lesson {
    // fields from Lesson are inherited:
    // lesson_id, start_time, end_time, lesson_status, duration_minutes, 
    // student_id, student_first_name, student_last_name, instrument_name...

    // UI specific or potentially flattened fields
    student_name?: string;
    teacher_name?: string;

    // Extended fields for Attendance/Billing context
    attendance_status?: string;
    attendance_notes?: string;
    manager_first_name?: string;
    manager_last_name?: string;
    parent_note?: string;
}
