import pool from '../db';
import { randomUUID } from 'crypto';

export interface Lesson {
    lesson_id: number;
    teacher_user_id: number;
    instrument_id: number;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    lesson_status: string;
    recurrence_group_id?: string;
    student_first_name?: string;
    student_last_name?: string;
    student_id?: number;
}

export const createLesson = async (
    teacherId: number,
    studentIds: number[],
    instrumentId: number,
    startTime: string,
    durationMinutes: number,
    recurrenceCount: number = 1
) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const lessonsCreated: any[] = [];
        // Only generate group ID if it's a recurring series
        const recurrenceGroupId = recurrenceCount > 1 ? randomUUID() : null;

        for (let i = 0; i < recurrenceCount; i++) {
            // Calculate start and end times for this instance
            // Add 7 days * i to the original start time
            const baseStart = new Date(startTime);
            const instanceStart = new Date(baseStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
            const instanceEnd = new Date(instanceStart.getTime() + durationMinutes * 60000);

            // 1. Create the lesson
            const lessonResult = await client.query(
                `INSERT INTO lessons 
        (teacher_user_id, instrument_id, start_time, end_time, duration_minutes, lesson_status, recurrence_group_id) 
        VALUES ($1, $2, $3, $4, $5, 'scheduled', $6) 
        RETURNING lesson_id`,
                [teacherId, instrumentId, instanceStart, instanceEnd, durationMinutes, recurrenceGroupId]
            );
            const lessonId = lessonResult.rows[0].lesson_id;

            // 2. Create enrollments for all students
            for (const studentId of studentIds) {
                await client.query(
                    `INSERT INTO enrollments (lesson_id, student_user_id) VALUES ($1, $2)`,
                    [lessonId, studentId]
                );
            }

            lessonsCreated.push({
                lessonId,
                startTime: instanceStart.toISOString(),
                recurrenceGroupId
            });
        }

        await client.query('COMMIT');
        return {
            success: true,
            recurrenceCount,
            recurrenceGroupId,
            lessons: lessonsCreated
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const deleteLesson = async (lessonId: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Delete enrollments first (FK constraint usually handles this or CASCADE, but explicit is safe)
        // Assuming ON DELETE CASCADE is NOT set, we delete manually. If it IS set, this is redundant but harmless.
        await client.query('DELETE FROM enrollments WHERE lesson_id = $1', [lessonId]);
        await client.query('DELETE FROM attendance_records WHERE enrollment_id IN (SELECT enrollment_id FROM enrollments WHERE lesson_id = $1)', [lessonId]);

        const result = await client.query('DELETE FROM lessons WHERE lesson_id = $1 RETURNING lesson_id', [lessonId]);
        await client.query('COMMIT');
        return result.rowCount ? result.rowCount > 0 : false;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const deleteLessonSeries = async (recurrenceGroupId: string, fromDate: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const minDate = new Date(fromDate);

        // We find all lesson IDs to delete first to handle dependencies if needed, or just delete directly
        // Deleting directly with subqueries for efficiency

        // 1. Delete enrollments/attendance for these lessons
        const deleteQuery = `
            DELETE FROM lessons 
            WHERE recurrence_group_id = $1 
            AND start_time >= $2
            RETURNING lesson_id
        `;

        // Note: If strict FKs exist without cascade, we'd need to delete children first. 
        // Let's assume we need to delete children.
        const lessonsToDelete = await client.query(
            'SELECT lesson_id FROM lessons WHERE recurrence_group_id = $1 AND start_time >= $2',
            [recurrenceGroupId, minDate]
        );

        const ids = lessonsToDelete.rows.map(r => r.lesson_id);
        if (ids.length > 0) {
            // Delete attendance
            await client.query(`DELETE FROM attendance_records WHERE enrollment_id IN (SELECT enrollment_id FROM enrollments WHERE lesson_id = ANY($1::int[]))`, [ids]);
            // Delete enrollments
            await client.query(`DELETE FROM enrollments WHERE lesson_id = ANY($1::int[])`, [ids]);
            // Delete lessons
            await client.query(`DELETE FROM lessons WHERE lesson_id = ANY($1::int[])`, [ids]);
        }

        await client.query('COMMIT');
        return ids.length;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const getTeacherSchedule = async (teacherId: number) => {
    const result = await pool.query(
        `SELECT 
      l.lesson_id, 
      l.start_time, 
      l.end_time, 
      l.duration_minutes,
      l.lesson_status,
      l.recurrence_group_id,
      u.user_id as student_id,
      u.first_name as student_first_name,
      u.last_name as student_last_name,
      i.instrument_name,
      ar.attendance_status,
      ar.notes as attendance_notes,
      e.parent_note,
      m.first_name as manager_first_name,
      m.last_name as manager_last_name,
      m.phone_number as manager_phone
     FROM lessons l
     LEFT JOIN enrollments e ON l.lesson_id = e.lesson_id
     LEFT JOIN users u ON e.student_user_id = u.user_id
     JOIN instruments i ON l.instrument_id = i.instrument_id
     LEFT JOIN attendance_records ar ON e.enrollment_id = ar.enrollment_id
     LEFT JOIN manager_student_relationships msr ON u.user_id = msr.student_user_id
     LEFT JOIN users m ON msr.manager_user_id = m.user_id
     WHERE l.teacher_user_id = $1
     ORDER BY l.start_time ASC`,
        [teacherId]
    );
    return result.rows;
};
