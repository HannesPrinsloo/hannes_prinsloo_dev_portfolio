import pool from '../db';

/**
 * Service to fetch a teacher's roster.
 * Joins teacher_student_rosters with users (students) and 
 * manager_student_relationships to get guardian contact details.
 */
export const getTeacherRoster = async (teacherId: number) => {
    const query = `
        SELECT 
            s.user_id AS student_id,
            s.first_name AS student_first_name,
            s.last_name AS student_last_name,
            s.phone_number AS student_phone,
            s.date_of_birth,
            EXTRACT(YEAR FROM AGE(s.date_of_birth))::int AS age,
            m.first_name AS manager_first_name,
            m.last_name AS manager_last_name,
            m.phone_number AS manager_phone,
            msr.relationship_type,
            l.level_id AS current_level_id,
            l.level_name AS current_level_name,
            inst.instrument_list
        FROM teacher_student_rosters tsr
        JOIN users s ON tsr.student_user_id = s.user_id
        LEFT JOIN manager_student_relationships msr ON s.user_id = msr.student_user_id
        LEFT JOIN users m ON msr.manager_user_id = m.user_id
        LEFT JOIN (
            SELECT DISTINCT ON (student_user_id) student_user_id, level_id 
            FROM student_levels 
            ORDER BY student_user_id, date_completed DESC, created_at DESC
        ) sl ON s.user_id = sl.student_user_id
        LEFT JOIN levels l ON sl.level_id = l.level_id
        LEFT JOIN (
            SELECT si.student_user_id, string_agg(i.instrument_name, ', ') as instrument_list
            FROM student_instruments si
            JOIN instruments i ON si.instrument_id = i.instrument_id
            GROUP BY si.student_user_id
        ) inst ON s.user_id = inst.student_user_id
        WHERE tsr.teacher_user_id = $1
        ORDER BY s.last_name ASC, s.first_name ASC;
    `;

    const result = await pool.query(query, [teacherId]);
    return result.rows;
};

/**
 * Service to fetch a manager's students.
 */
export const getManagerStudents = async (managerId: number) => {
    const query = `
        SELECT 
            s.user_id,
            s.first_name,
            s.last_name,
            s.phone_number,
            s.date_of_birth,
            EXTRACT(YEAR FROM AGE(s.date_of_birth))::int AS age,
            msr.relationship_type,
            COALESCE(l.level_id, 1) AS level_id,
            COALESCE(l.level_name, 'Beginner') AS current_level_name,
            
            t.first_name as teacher_first_name,
            t.last_name as teacher_last_name,
            
            inst.instrument_list
            
        FROM manager_student_relationships msr
        JOIN users s ON msr.student_user_id = s.user_id
        LEFT JOIN (
            SELECT DISTINCT ON (student_user_id) student_user_id, level_id 
            FROM student_levels 
            ORDER BY student_user_id, date_completed DESC, created_at DESC
        ) sl ON s.user_id = sl.student_user_id
        LEFT JOIN levels l ON sl.level_id = l.level_id
        LEFT JOIN teacher_student_rosters tsr ON s.user_id = tsr.student_user_id
        LEFT JOIN users t ON tsr.teacher_user_id = t.user_id
        LEFT JOIN (
            SELECT si.student_user_id, string_agg(i.instrument_name, ', ') as instrument_list
            FROM student_instruments si
            JOIN instruments i ON si.instrument_id = i.instrument_id
            GROUP BY si.student_user_id
        ) inst ON s.user_id = inst.student_user_id
        WHERE msr.manager_user_id = $1
        ORDER BY s.last_name ASC;
    `;
    const res = await pool.query(query, [managerId]);
    return res.rows;
};

/**
 * Fetch upcoming schedule for a manager's students.
 */
export const getManagerSchedule = async (managerId: number) => {
    const query = `
        SELECT 
            l.lesson_id,
            l.start_time,
            l.end_time,
            l.duration_minutes,
            l.lesson_status,
            l.venue,
            
            e.enrollment_id,
            e.parent_note,
            
            s.user_id AS student_id,
            s.first_name AS student_first_name,
            s.last_name AS student_last_name,
            
            t.user_id AS teacher_id,
            t.first_name AS teacher_first_name,
            t.last_name AS teacher_last_name,
            
            i.instrument_name
            
        FROM manager_student_relationships msr
        JOIN users s ON msr.student_user_id = s.user_id
        JOIN enrollments e ON s.user_id = e.student_user_id
        JOIN lessons l ON e.lesson_id = l.lesson_id
        JOIN users t ON l.teacher_user_id = t.user_id
        LEFT JOIN instruments i ON l.instrument_id = i.instrument_id
        
        WHERE msr.manager_user_id = $1
          AND l.start_time >= NOW()
          AND l.lesson_status != 'cancelled'
        ORDER BY l.start_time ASC;
    `;
    const res = await pool.query(query, [managerId]);
    return res.rows;
};

/**
 * Fetch past attendance for a manager's students.
 */
export const getManagerAttendance = async (managerId: number) => {
    const query = `
        SELECT 
            l.lesson_id,
            l.start_time,
            l.end_time,
            l.venue,
            
            s.user_id AS student_id,
            s.first_name AS student_first_name,
            s.last_name AS student_last_name,
            
            t.first_name AS teacher_first_name,
            t.last_name AS teacher_last_name,
            
            i.instrument_name,
            
            ar.attendance_status,
            ar.notes AS attendance_notes,
            ar.recorded_at
            
        FROM manager_student_relationships msr
        JOIN users s ON msr.student_user_id = s.user_id
        JOIN enrollments e ON s.user_id = e.student_user_id
        JOIN lessons l ON e.lesson_id = l.lesson_id
        JOIN users t ON l.teacher_user_id = t.user_id
        LEFT JOIN instruments i ON l.instrument_id = i.instrument_id
        LEFT JOIN attendance_records ar ON e.enrollment_id = ar.enrollment_id
        
        WHERE msr.manager_user_id = $1
          AND l.end_time < NOW()
          AND l.lesson_status != 'cancelled'
        ORDER BY l.start_time DESC;
    `;
    const res = await pool.query(query, [managerId]);
    return res.rows;
};

export const updateLessonNote = async (enrollmentId: number, note: string) => {
    // Note: In a real app, verify that the enrollment belongs to a student of the requesting manager.
    // For now, relying on the fact that only visible enrollments can be updated.
    const query = `
        UPDATE enrollments 
        SET parent_note = $1, updated_at = NOW()
        WHERE enrollment_id = $2
        RETURNING *;
    `;
    const res = await pool.query(query, [note, enrollmentId]);
    return res.rows[0];
};