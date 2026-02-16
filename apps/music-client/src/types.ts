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

teachers ?: { id: number, name: string }[];
}

export interface RosterEntry {
    student_id: number;
    student_first_name: string;
    student_last_name: string;
    manager_first_name: string | null;
    manager_last_name: string | null;
}

// Minimal definition to satisfy the UI needs, compatible with 'Lesson' from api.ts
export interface AdminLesson {
    lesson_id: number;
    student_id: number;
    // teacher_id: number; // Removed as it might not be in the basic Lesson fetch
    start_time: string;
    end_time: string;
    // status: string; // Removed, api uses lesson_status
    lesson_status?: string; // Added to match api.ts
    // price: string | number; // Removed
    // paid: boolean; // Removed
    student_name?: string;
    student_first_name?: string; // Added
    student_last_name?: string; // Added
    teacher_name?: string;
    // Extended fields
    attendance_status?: string;
    attendance_notes?: string;
    manager_first_name?: string;
    manager_last_name?: string;
    manager_phone?: string;
    parent_note?: string;
}
