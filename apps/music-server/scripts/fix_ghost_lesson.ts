import pool from '../db';

const fixGhostLesson = async () => {
    try {
        const lessonId = 29;
        console.log(`Deleting orphan lesson ${lessonId}...`);

        const result = await pool.query('DELETE FROM lessons WHERE lesson_id = $1', [lessonId]);

        if (result.rowCount && result.rowCount > 0) {
            console.log('Successfully deleted lesson 29.');
        } else {
            console.log('Lesson 29 not found or already deleted.');
        }
    } catch (err) {
        console.error('Error deleting lesson:', err);
    } finally {
        pool.end();
    }
};

fixGhostLesson();
