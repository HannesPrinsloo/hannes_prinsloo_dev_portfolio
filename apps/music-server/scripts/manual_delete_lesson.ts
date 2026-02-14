
import pool from '../db';

const deleteLesson = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting manual deletion process...');

        // 1. Find Student
        const studentQuery = `
            SELECT user_id, first_name, last_name 
            FROM users 
            WHERE first_name ILIKE 'Student' AND last_name ILIKE 'One-derson'
        `;
        const studentRes = await client.query(studentQuery);
        if (studentRes.rows.length === 0) {
            console.error('Student not found!');
            return;
        }
        const student = studentRes.rows[0];
        console.log(`Found student: ${student.first_name} ${student.last_name} (ID: ${student.user_id})`);

        // 2. Find Lesson
        // Date: 2026-01-28, Time: roughly 14:30. Let's look for lessons on that day for that student.
        // We need to join enrollments to find lessons for this student.
        const lessonQuery = `
            SELECT l.lesson_id, l.start_time, l.end_time 
            FROM lessons l
            JOIN enrollments e ON l.lesson_id = e.lesson_id
            WHERE e.student_user_id = $1
            AND l.start_time::date = '2026-01-28'
        `;
        const lessonRes = await client.query(lessonQuery, [student.user_id]);

        if (lessonRes.rows.length === 0) {
            console.error('No lesson found for this student on 2026-01-28');
            return;
        }

        const lesson = lessonRes.rows[0]; // Assuming only one match or the first one is the target
        console.log(`Found lesson: ID ${lesson.lesson_id} at ${lesson.start_time}`);

        // 3. Delete in Transaction
        await client.query('BEGIN');

        // Find enrollment IDs to delete attendance first
        const enrollmentQuery = `SELECT enrollment_id FROM enrollments WHERE lesson_id = $1`;
        const enrollmentRes = await client.query(enrollmentQuery, [lesson.lesson_id]);
        const enrollmentIds = enrollmentRes.rows.map(r => r.enrollment_id);

        if (enrollmentIds.length > 0) {
            // Delete Attendance
            const deleteAttendance = `DELETE FROM attendance_records WHERE enrollment_id = ANY($1)`;
            await client.query(deleteAttendance, [enrollmentIds]);
            console.log(`Deleted attendance records for enrollments: ${enrollmentIds.join(', ')}`);
        }

        // Delete Enrollments
        const deleteEnrollments = `DELETE FROM enrollments WHERE lesson_id = $1`;
        await client.query(deleteEnrollments, [lesson.lesson_id]);
        console.log(`Deleted enrollments for lesson ${lesson.lesson_id}`);

        // Delete Lesson
        const deleteLessonQuery = `DELETE FROM lessons WHERE lesson_id = $1`;
        await client.query(deleteLessonQuery, [lesson.lesson_id]);
        console.log(`Deleted lesson ${lesson.lesson_id}`);

        await client.query('COMMIT');
        console.log('Successfully completed deletion.');

    } catch (e: any) {
        await client.query('ROLLBACK');
        console.error('Error during deletion:', e);
    } finally {
        client.release();
        pool.end();
    }
};

deleteLesson();
