import pool from '../db';

const debugLessons = async () => {
    try {
        const teacherId = 30; // From screenshot
        // Date range for Feb 2, 2026
        const startOfDay = '2026-02-02T00:00:00';
        const endOfDay = '2026-02-02T23:59:59';

        console.log(`Checking lessons for Teacher ${teacherId} between ${startOfDay} and ${endOfDay}`);

        // 1. Check raw lessons table
        const rawLessons = await pool.query(
            `SELECT * FROM lessons 
             WHERE teacher_user_id = $1 
             AND start_time >= $2 
             AND start_time <= $3`,
            [teacherId, startOfDay, endOfDay]
        );

        console.log('--- Raw Lessons in DB ---');
        rawLessons.rows.forEach(l => {
            console.log(`ID: ${l.lesson_id}, Start: ${l.start_time}, End: ${l.end_time}, Status: ${l.lesson_status}`);
        });

        // 2. Check enrollments for those lessons
        if (rawLessons.rows.length > 0) {
            const lessonIds = rawLessons.rows.map(l => l.lesson_id);
            const enrollments = await pool.query(
                `SELECT * FROM enrollments WHERE lesson_id = ANY($1::int[])`,
                [lessonIds]
            );
            console.log('--- Enrollments ---');
            enrollments.rows.forEach(e => {
                console.log(`Enrollment ID: ${e.enrollment_id}, Lesson ID: ${e.lesson_id}, Student ID: ${e.student_user_id}`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
};

debugLessons();
