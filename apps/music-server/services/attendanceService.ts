import pool from '../db';
import { QueryResult } from 'pg';

export interface AttendanceRecord {
    attendance_id: number;
    enrollment_id: number;
    attendance_status: string;
    notes: string;
    recorded_at: Date;
    student_first_name: string;
    student_last_name: string;
}

export const markAttendance = async (
    lessonId: number,
    studentId: number,
    teacherId: number, // User recording the attendance
    status: string,
    notes?: string
) => {
    // 1. Get enrollment_id for the student in this lesson
    const enrollmentResult = await pool.query(
        `SELECT enrollment_id FROM enrollments WHERE lesson_id = $1 AND student_user_id = $2`,
        [lessonId, studentId]
    );

    if (enrollmentResult.rows.length === 0) {
        throw new Error('Student is not enrolled in this lesson');
    }
    const enrollmentId = enrollmentResult.rows[0].enrollment_id;

    // 2. Insert or Update attendance record
    // We use a simple INSERT for now, but in a real app you might want upsert logic
    // Checking if record exists first:
    const existing = await pool.query(
        `SELECT attendance_id FROM attendance_records WHERE enrollment_id = $1`,
        [enrollmentId]
    );

    let result: QueryResult;
    if (existing.rows.length > 0) {
        result = await pool.query(
            `UPDATE attendance_records 
             SET attendance_status = $1, notes = $2, recorded_at = CURRENT_TIMESTAMP, recorded_by_user_id = $3
             WHERE attendance_id = $4 RETURNING *`,
            [status, notes, teacherId, existing.rows[0].attendance_id]
        );
    } else {
        result = await pool.query(
            `INSERT INTO attendance_records 
             (enrollment_id, attendance_status, notes, recorded_by_user_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [enrollmentId, status, notes, teacherId]
        );
    }

    return result.rows[0];
};

export const getLessonAttendance = async (lessonId: number) => {
    const result = await pool.query(
        `SELECT 
            ar.attendance_id,
            ar.attendance_status,
            ar.notes,
            ar.recorded_at,
            u.first_name as student_first_name,
            u.last_name as student_last_name,
            u.user_id as student_id
         FROM enrollments e
         LEFT JOIN attendance_records ar ON e.enrollment_id = ar.enrollment_id
         JOIN users u ON e.student_user_id = u.user_id
         WHERE e.lesson_id = $1`,
        [lessonId]
    );
    return result.rows;
};
