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
